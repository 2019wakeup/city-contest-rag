import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { SqliteVectorStore } from '@road-rec/retrieval';
import { SceneInputSchema } from '@road-rec/contracts';
import type { CorpusChunk, RecommendationReport, SceneInput } from '@road-rec/contracts';
import { initRelationDb } from '../src/relation/db';
import type { RelationDb } from '../src/relation/db';
import { seedFromCorpus } from '../src/relation/seed';
import { recommend } from '../src/orchestrator';
import type { EmbedderLike, RecommendHooks } from '../src/orchestrator';
import { createApp } from '../src/app';

const REPO_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../../..');
const CORPUS_DIR = join(REPO_ROOT, 'data/corpus');

function loadCaseScene(id: string): SceneInput {
  const cases = JSON.parse(
    readFileSync(join(CORPUS_DIR, 'cases', 'cases.json'), 'utf8'),
  ) as Array<{ id: string; scene: unknown }>;
  const found = cases.find((c) => c.id === id);
  if (!found) throw new Error(`case ${id} 不存在`);
  return SceneInputSchema.parse(found.scene);
}

const fakeEmbedder: EmbedderLike = {
  dim: 2,
  modelName: 'fake',
  modelVersion: 'v0',
  embed: async (texts: string[]) => texts.map(() => [0, 0]),
};

function makeChunk(chunkId: string, text: string): CorpusChunk {
  return {
    schemaVersion: '1',
    chunkId,
    text,
    docType: 'knowledge',
    tags: ['高温', '车辙'],
    provenance: {
      sourceDocId: chunkId.split(':')[0],
      contentHash: `hash-${chunkId}`,
      embeddingModel: 'bge-m3',
      modelVersion: 'v1',
      dim: 1024,
      pipelineRev: 'abc1234',
      embeddedAt: '2026-10-17T00:00:00Z',
    },
  };
}

const S1 = { title: '首选方案', paragraphs: ['流式文案一'], evidenceIds: [] as string[] };
const S2 = { title: '方案对比', paragraphs: ['流式文案二'], evidenceIds: [] as string[] };

/** fake LLM：抽取 prompt 返回合法场景；报告 prompt 每次调用 n 递增——batch 形态 {sections:[S1,S2]} + 单节形态 {section:S1|S2}，两种模式产出一致 */
function makeFakeLlm() {
  let n = 0;
  return async (prompt: string) => {
    if (prompt.includes('自由文本')) {
      return JSON.stringify({
        climate: { zone: '提取区', pgHigh: 76, pgLow: -10 },
        traffic: { level: 'heavy', esal: 1 },
        pavement: { layer: 'surface', structure: '提取结构' },
        distresses: [],
        constraints: { budget: 500, schedule: 30, env: 'normal', noise: 'none' },
        notes: '',
      });
    }
    n += 1;
    return JSON.stringify({ sections: [S1, S2], section: n === 1 ? S1 : S2 });
  };
}

function parseSse(text: string): Array<{ event: string; data: Record<string, unknown> }> {
  return text
    .split(/\n\n/)
    .filter((block) => block.trim())
    .map((block) => {
      const lines = block.split('\n');
      const event = lines.find((l) => l.startsWith('event:'))?.slice(7).trim() ?? 'message';
      const dataLines = lines.filter((l) => l.startsWith('data:')).map((l) => l.slice(5).trim());
      return { event, data: JSON.parse(dataLines.join('')) as Record<string, unknown> };
    });
}

function withoutSteps(report: RecommendationReport): Omit<RecommendationReport, 'steps'> {
  const { steps: _s, ...rest } = report;
  return rest;
}

describe('POST /api/v1/recommend/stream（SSE 流式）', () => {
  let dir: string;
  let dbPath: string;
  let relationDb: RelationDb;
  let store: SqliteVectorStore;

  beforeEach(async () => {
    dir = mkdtempSync(join(tmpdir(), 't9s-'));
    dbPath = join(dir, 'relation.db');
    relationDb = initRelationDb(dbPath);
    await seedFromCorpus(CORPUS_DIR, dbPath);
    store = new SqliteVectorStore(':memory:');
    await store.add(
      [makeChunk('k-binder-002:0:v1', 'SBS 改性沥青显著提高混合料高温抗车辙性能')],
      [[1, 0]],
    );
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    store.close();
    relationDb.close();
    rmSync(dir, { recursive: true, force: true });
  });

  function makeApp(llmCall?: (prompt: string) => Promise<string>) {
    return createApp({
      store,
      embedder: fakeEmbedder,
      relationDb,
      backend: 'sqlite',
      corpusDir: CORPUS_DIR,
      manifestPath: join(dir, 'manifest.json'),
      llmCall,
    });
  }

  async function postStream(app: ReturnType<typeof makeApp>, body: unknown) {
    return app.request('/api/v1/recommend/stream', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(body),
    });
  }

  it('① 事件顺序：step（前5步）→ section×N → step(report) → done，step 名为六步序列', async () => {
    const app = makeApp(makeFakeLlm());
    const res = await postStream(app, loadCaseScene('case-01'));
    expect(res.status).toBe(200);
    expect(res.headers.get('content-type')).toContain('text/event-stream');

    const events = parseSse(await res.text());
    expect(events.map((e) => e.event)).toEqual([
      'step', 'step', 'step', 'step', 'step',
      'section', 'section',
      'step',
      'done',
    ]);
    const stepNames = events.filter((e) => e.event === 'step').map((e) => e.data.name);
    expect(stepNames).toEqual(['parse', 'mapping', 'recall', 'predict', 'rank', 'report']);
    const sections = events.filter((e) => e.event === 'section');
    expect(sections.map((e) => e.data.index)).toEqual([0, 1]);
    expect((sections[0].data.section as { title: string }).title).toBe('首选方案');
  });

  it('② done 的 report 与 JSON 接口产物一致（除 steps 耗时）', async () => {
    // JSON 接口产物（独立 fake）
    const jsonReport = await recommend(loadCaseScene('case-01'), {
      store,
      embedder: fakeEmbedder,
      relationDb,
      llmCall: makeFakeLlm(),
    });

    const app = makeApp(makeFakeLlm());
    const res = await postStream(app, loadCaseScene('case-01'));
    const events = parseSse(await res.text());
    const doneEvent = events.find((e) => e.event === 'done');
    expect(doneEvent).toBeDefined();
    const streamReport = doneEvent!.data as unknown as RecommendationReport;
    expect(streamReport.schemaVersion).toBe('1');
    expect(withoutSteps(streamReport)).toEqual(withoutSteps(jsonReport));
  });

  it('③ LLM_OFF=1：section 仍发出（模板降级）且 done 正常，llmStatus=degraded', async () => {
    vi.stubEnv('LLM_OFF', '1');
    const app = makeApp(); // 不注入 fake LLM
    const res = await postStream(app, loadCaseScene('case-01'));
    expect(res.status).toBe(200);
    const events = parseSse(await res.text());
    const sections = events.filter((e) => e.event === 'section');
    expect(sections.length).toBeGreaterThanOrEqual(2);
    const doneEvent = events.find((e) => e.event === 'done');
    expect(doneEvent).toBeDefined();
    const report = doneEvent!.data as unknown as RecommendationReport;
    expect(report.llmStatus).toBe('degraded');
    expect(report.sections.length).toBeGreaterThan(0);
  });

  it('④ 非法场景输入 → error 事件（含 message）后关闭', async () => {
    const app = makeApp(makeFakeLlm());
    const res = await postStream(app, { climate: {} });
    expect(res.status).toBe(200);
    expect(res.headers.get('content-type')).toContain('text/event-stream');
    const events = parseSse(await res.text());
    expect(events.map((e) => e.event)).toEqual(['error']);
    expect(typeof events[0].data.message).toBe('string');
    expect((events[0].data.message as string).length).toBeGreaterThan(0);
  });

  it('hooks 注入：onStep/onSection 同步回调（单元面）', async () => {
    const stepNames: string[] = [];
    const sectionIdx: number[] = [];
    const hooks: RecommendHooks = {
      onStep: (s) => stepNames.push(s.name),
      onSection: (i) => sectionIdx.push(i),
    };
    await recommend(loadCaseScene('case-01'), { store, embedder: fakeEmbedder, relationDb }, hooks);
    expect(stepNames).toEqual(['parse', 'mapping', 'recall', 'predict', 'rank', 'report']);
    expect(sectionIdx).toEqual([0, 1]);
  });
});
