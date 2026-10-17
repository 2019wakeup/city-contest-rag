import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { SqliteVectorStore } from '@road-rec/retrieval';
import { SceneInputSchema, ReportSectionSchema } from '@road-rec/contracts';
import { z } from 'zod';
import type { CorpusChunk, RecommendationReport, SceneInput } from '@road-rec/contracts';
import { initRelationDb } from '../src/relation/db';
import type { RelationDb } from '../src/relation/db';
import { seedFromCorpus } from '../src/relation/seed';
import { recommend } from '../src/orchestrator';
import type { EmbedderLike } from '../src/orchestrator';
import { generateStructured } from '../src/llm/client';
import type { LlmCall } from '../src/llm/client';
import { buildReportSections } from '../src/report/fallback';
import type { ReportBase } from '../src/report/fallback';
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

const SectionsSchema = z.object({ sections: z.array(ReportSectionSchema) }).passthrough();

describe('T9 LLM 报告生成 + 对话面板', () => {
  let dir: string;
  let dbPath: string;
  let relationDb: RelationDb;
  let store: SqliteVectorStore;

  beforeEach(async () => {
    dir = mkdtempSync(join(tmpdir(), 't9-'));
    dbPath = join(dir, 'relation.db');
    relationDb = initRelationDb(dbPath);
    await seedFromCorpus(CORPUS_DIR, dbPath);
    store = new SqliteVectorStore(':memory:');
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    store.close();
    relationDb.close();
    rmSync(dir, { recursive: true, force: true });
  });

  async function makeBase(): Promise<ReportBase> {
    await store.add(
      [makeChunk('k-binder-002:0:v1', 'SBS 改性沥青显著提高混合料高温抗车辙性能')],
      [[1, 0]],
    );
    const report = await recommend(loadCaseScene('case-01'), {
      store,
      embedder: fakeEmbedder,
      relationDb,
    });
    const { scene, targets, candidates, evidence, benchmark } = report;
    return { scene, targets, candidates, evidence, benchmark };
  }

  it('generateStructured：fake LLM 返回合法 JSON → status ok 且数据透传', async () => {
    const { data, status } = await generateStructured({
      prompt: 'x',
      schema: SectionsSchema,
      llm: async () => JSON.stringify({ sections: [{ title: '首选', paragraphs: ['p1'], evidenceIds: [] }] }),
    });
    expect(status).toBe('ok');
    expect(data?.sections).toHaveLength(1);
    expect(data?.sections[0].title).toBe('首选');
  });

  it('generateStructured：非法 JSON 两次仍败 → degraded（重试 ≤2）', async () => {
    let calls = 0;
    const { data, status } = await generateStructured({
      prompt: 'x',
      schema: SectionsSchema,
      llm: async () => {
        calls += 1;
        return 'not-json{{{';
      },
    });
    expect(status).toBe('degraded');
    expect(data).toBeNull();
    expect(calls).toBe(3); // 首试 + 重试 2
  });

  it('buildReportSections：合法输出 → ok + sections 非空 + evidenceIds ⊆ 传入 id（防编造过滤）', async () => {
    const base = await makeBase();
    const allowed = base.evidence.map((e) => e.chunkId);
    const llm: LlmCall = async () =>
      JSON.stringify({
        sections: [
          { title: '首选', paragraphs: ['文案'], evidenceIds: [allowed[0], 'evil-999'] },
        ],
      });
    const out = await buildReportSections(base, llm);
    expect(out.llmStatus).toBe('ok');
    expect(out.length).toBeGreaterThan(0);
    expect(out[0].evidenceIds).toEqual([allowed[0]]);
  });

  it('buildReportSections：非法输出 → degraded + 模板段落非空 + evidenceIds ⊆ 传入 id', async () => {
    const base = await makeBase();
    const allowed = new Set(base.evidence.map((e) => e.chunkId));
    const out = await buildReportSections(base, async () => '{{{');
    expect(out.llmStatus).toBe('degraded');
    expect(out.length).toBeGreaterThan(0);
    for (const s of out) {
      expect(s.paragraphs.length).toBeGreaterThan(0);
      expect(s.evidenceIds.every((id) => allowed.has(id))).toBe(true);
    }
  });

  it('LLM_OFF=1 → generateStructured 立即 degraded（不触网）', async () => {
    vi.stubEnv('LLM_OFF', '1');
    vi.stubEnv('DEEPSEEK_API_KEY', '');
    const { data, status } = await generateStructured({ prompt: 'x', schema: SectionsSchema });
    expect(status).toBe('degraded');
    expect(data).toBeNull();
  });

  it('orchestrator：notes 非空时经注入 fake LLM 抽取场景（场景抽取接入）', async () => {
    await store.add([makeChunk('k-binder-002:0:v1', 'SBS 改性沥青显著提高混合料高温抗车辙性能')], [[1, 0]]);
    const scene = { ...loadCaseScene('case-01'), notes: '自由文本描述：某高温重载路段' };
    const llmCall: LlmCall = async (prompt) => {
      expect(prompt).toContain('自由文本描述');
      return JSON.stringify({
        climate: { zone: '提取分区', pgHigh: 82, pgLow: -16 },
        traffic: { level: '特重交通', esal: 5_000_000 },
        pavement: { layer: '中面层', structure: '提取结构' },
        distresses: [{ type: '车辙', severity: '重' }],
        constraints: { budget: 300, schedule: 15, env: '环保要求高', noise: '低噪' },
        notes: '自由文本描述：某高温重载路段',
      });
    };
    const report = await recommend(scene, { store, embedder: fakeEmbedder, relationDb, llmCall });
    expect(report.scene.climate.zone).toBe('提取分区');
    expect(report.scene.traffic.level).toBe('特重交通');
  });

  it('chat 路由：注入 fake responder → SSE 流（R15 格式：data {"delta"} + event done）', async () => {
    const app = createApp({
      store,
      embedder: fakeEmbedder,
      relationDb,
      backend: 'sqlite',
      corpusDir: CORPUS_DIR,
      manifestPath: join(dir, 'manifest.json'),
      chatResponder: async (_opts, onDelta) => {
        onDelta('你好');
        onDelta('，工程师');
      },
    });
    const res = await app.request('/api/v1/chat', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ question: '这个方案怎么样？' }),
    });
    expect(res.status).toBe(200);
    expect(res.headers.get('content-type')).toContain('text/event-stream');
    const text = await res.text();
    expect(text).toContain('data: {"delta":"你好"}');
    expect(text).toContain('data: {"delta":"，工程师"}');
    expect(text).toContain('event: done');
    expect(text).toContain('{"done":true}');
  });

  it('chat 路由：无 responder（LLM_OFF）→ 普通 JSON 降级 {reply}', async () => {
    const app = createApp({
      store,
      embedder: fakeEmbedder,
      relationDb,
      backend: 'sqlite',
      corpusDir: CORPUS_DIR,
      manifestPath: join(dir, 'manifest.json'),
    });
    const res = await app.request('/api/v1/chat', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ question: '这个方案怎么样？' }),
    });
    expect(res.status).toBe(200);
    const json = (await res.json()) as { reply?: string };
    expect(typeof json.reply).toBe('string');
    expect(json.reply!.length).toBeGreaterThan(0);
  });
});
