import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { SqliteVectorStore } from '@road-rec/retrieval';
import { SceneInputSchema } from '@road-rec/contracts';
import type { CorpusChunk, SceneInput } from '@road-rec/contracts';
import { initRelationDb } from '../src/relation/db';
import type { RelationDb } from '../src/relation/db';
import { seedFromCorpus } from '../src/relation/seed';
import { recommend } from '../src/orchestrator';
import type { EmbedderLike } from '../src/orchestrator';
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

function normName(s: string): string {
  return s.replace(/\s+/g, '');
}

/** cases.json expected.formulas 的 binder 关键词（'基质沥青+再生剂' → ['基质沥青','再生剂']，去空白） */
function expectedBinderKeywords(id: string): string[] {
  const cases = JSON.parse(
    readFileSync(join(CORPUS_DIR, 'cases', 'cases.json'), 'utf8'),
  ) as Array<{ id: string; expected: { formulas: Array<{ binder?: { type?: string } }> } }>;
  const found = cases.find((c) => c.id === id);
  if (!found) throw new Error(`case ${id} 不存在`);
  const keywords = new Set<string>();
  for (const f of found.expected.formulas) {
    for (const part of (f.binder?.type ?? '').split('+')) {
      const trimmed = normName(part.trim());
      if (trimmed) keywords.add(trimmed);
    }
  }
  return [...keywords];
}

const fakeEmbedder: EmbedderLike = {
  dim: 2,
  modelName: 'fake',
  modelVersion: 'v0',
  embed: async (texts: string[]) => texts.map(() => [0, 0]),
};

function makeChunk(
  chunkId: string,
  text: string,
  docType: 'knowledge' | 'standard' | 'literature' | 'enterprise' = 'knowledge',
  tags: string[] = [],
): CorpusChunk {
  return {
    schemaVersion: '1',
    chunkId,
    text,
    docType,
    tags,
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

const RADAR_DIMS = [
  'highTemp',
  'lowTemp',
  'fatigue',
  'waterStability',
  'lcc',
  'carbon',
  'expectedLife',
  'constructability',
];

describe('T8 orchestrator + /api/v1 路由', () => {
  let dir: string;
  let dbPath: string;
  let relationDb: RelationDb;
  let store: SqliteVectorStore;

  beforeEach(async () => {
    dir = mkdtempSync(join(tmpdir(), 't8-'));
    dbPath = join(dir, 'relation.db');
    relationDb = initRelationDb(dbPath);
    await seedFromCorpus(CORPUS_DIR, dbPath);
    store = new SqliteVectorStore(':memory:');
  });

  afterEach(() => {
    store.close();
    relationDb.close();
    rmSync(dir, { recursive: true, force: true });
  });

  it('case-01 全链路：candidates=5、evidence 非空、radar 8 维 0-100、占位 llmStatus', async () => {
    await store.add(
      [makeChunk('k-binder-002:0:v1', 'SBS 改性沥青显著提高混合料高温抗车辙性能', 'knowledge', ['高温', '车辙'])],
      [[1, 0]],
    );
    const report = await recommend(loadCaseScene('case-01'), {
      store,
      embedder: fakeEmbedder,
      relationDb,
    });
    expect(report.schemaVersion).toBe('1');
    expect(report.candidates).toHaveLength(5);
    expect(report.evidence.length).toBeGreaterThan(0);
    expect(['ok', 'degraded']).toContain(report.llmStatus);
    expect(report.adapterMode).toEqual({ a: 'mock', c: 'mock' });
    // spec §8 步进条 = 解析→映射→召回→预测→排序→报告 6 步（含顺序）
    expect(report.steps.map((s) => s.name)).toEqual([
      'parse',
      'mapping',
      'recall',
      'predict',
      'rank',
      'report',
    ]);
    for (const s of report.steps) expect(s.ms).toBeGreaterThanOrEqual(0);
    for (const cand of report.candidates) {
      for (const dim of RADAR_DIMS) {
        expect(cand.radar[dim]).toBeGreaterThanOrEqual(0);
        expect(cand.radar[dim]).toBeLessThanOrEqual(100);
      }
      expect(cand.score).toBeGreaterThan(0);
      expect(cand.formula.binder.type.length).toBeGreaterThan(0);
    }
  });

  it('两次调用数值一致（除 steps 耗时）', async () => {
    await store.add(
      [makeChunk('k-binder-002:0:v1', 'SBS 改性沥青显著提高混合料高温抗车辙性能', 'knowledge', ['高温', '车辙'])],
      [[1, 0]],
    );
    const deps = { store, embedder: fakeEmbedder, relationDb };
    const r1 = await recommend(loadCaseScene('case-01'), deps);
    const r2 = await recommend(loadCaseScene('case-01'), deps);
    const { steps: _s1, ...rest1 } = r1;
    const { steps: _s2, ...rest2 } = r2;
    expect(rest1).toEqual(rest2);
  });

  it('空向量库：evidence=[] + warnings 含 build:index，主流程仍完成（Review Focus #4）', async () => {
    const report = await recommend(loadCaseScene('case-02'), {
      store,
      embedder: fakeEmbedder,
      relationDb,
    });
    expect(report.candidates).toHaveLength(5);
    expect(report.evidence).toEqual([]);
    expect(report.warnings.some((w) => w.includes('build:index'))).toBe(true);
  });

  it('R3-C3：enterprise 语料进入证据链', async () => {
    await store.add(
      [makeChunk('kb-enterprise-1:0:v1', '企业资料：SBS 改性沥青高温抗车辙应用案例', 'enterprise', ['高温'])],
      [[1, 0]],
    );
    const report = await recommend(loadCaseScene('case-01'), {
      store,
      embedder: fakeEmbedder,
      relationDb,
    });
    expect(report.evidence.some((e) => e.docType === 'enterprise')).toBe(true);
  });

  it('R3-C1 回归：5 案例 top-1 签名 ≥3 种，且 top-5 含 cases.json 期望方向', async () => {
    const deps = { store, embedder: fakeEmbedder, relationDb };
    const signatures = new Set<string>();
    for (const id of ['case-01', 'case-02', 'case-03', 'case-04', 'case-05']) {
      const report = await recommend(loadCaseScene(id), deps);
      expect(report.candidates.length, `${id} 候选数`).toBeGreaterThanOrEqual(5);
      const top = report.candidates[0];
      signatures.add(`${normName(top.formula.binder.type)}+${normName(top.formula.modifier.type)}`);

      const topBinders = report.candidates.slice(0, 5).map((c) => normName(c.formula.binder.type));
      const keywords = expectedBinderKeywords(id);
      expect(
        topBinders.some((b) => keywords.some((k) => b.includes(k))),
        `${id} top-5 应含期望方向（${keywords.join('/')}）`,
      ).toBe(true);
    }
    expect(signatures.size).toBeGreaterThanOrEqual(3);
  });

  it('REST：recommend 200/400、cases(含 404)、health、feedback、/openapi', async () => {
    await store.add(
      [makeChunk('k-binder-002:0:v1', 'SBS 改性沥青显著提高混合料高温抗车辙性能', 'knowledge', ['高温', '车辙'])],
      [[1, 0]],
    );
    const app = createApp({
      store,
      embedder: fakeEmbedder,
      relationDb,
      backend: 'sqlite',
      corpusDir: CORPUS_DIR,
      manifestPath: join(dir, 'manifest.json'),
    });

    const ok = await app.request('/api/v1/recommend', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(loadCaseScene('case-01')),
    });
    expect(ok.status).toBe(200);
    const report = (await ok.json()) as { schemaVersion: string; candidates: unknown[] };
    expect(report.schemaVersion).toBe('1');
    expect(report.candidates).toHaveLength(5);

    const bad = await app.request('/api/v1/recommend', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ climate: {} }),
    });
    expect(bad.status).toBe(400);

    const health = (await (await app.request('/api/v1/health')).json()) as {
      vectorStore: { backend: string; count: number; ok: boolean };
      llm: { configured: boolean };
      adapters: { a: string; c: string };
    };
    expect(health.vectorStore.backend).toBe('sqlite');
    expect(typeof health.vectorStore.count).toBe('number');
    expect(typeof health.vectorStore.ok).toBe('boolean');
    expect(typeof health.llm.configured).toBe('boolean');

    const cases = (await (await app.request('/api/v1/cases')).json()) as Array<{
      id: string;
      summary: string;
    }>;
    expect(cases).toHaveLength(5);
    // UI#11：summary 为原始中文摘要，不含英文标签串
    const case01 = cases.find((c) => c.id === 'case-01');
    expect(case01?.summary).toContain('车辙');
    expect(case01?.summary).not.toContain('heavy');
    expect(case01?.summary).not.toContain('rutting');

    expect((await app.request('/api/v1/cases/case-01')).status).toBe(200);
    expect((await app.request('/api/v1/cases/no-such')).status).toBe(404);

    const fb = await (
      await app.request('/api/v1/feedback', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ comment: 'x' }),
      })
    ).json();
    expect(fb).toEqual({ received: true });

    const doc = (await (await app.request('/openapi')).json()) as { openapi: string };
    expect(doc.openapi).toBeTruthy();
  });
});
