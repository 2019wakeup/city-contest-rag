import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { performance } from 'node:perf_hooks';
import { SqliteVectorStore } from '@road-rec/retrieval';
import { SceneInputSchema } from '@road-rec/contracts';
import type { CorpusChunk, SceneInput } from '@road-rec/contracts';
import { initRelationDb } from '../src/relation/db';
import type { RelationDb } from '../src/relation/db';
import { seedFromCorpus } from '../src/relation/seed';
import { recommend, RADAR_ANCHORS, toRadarAbsolute } from '../src/orchestrator';
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

  it('B3 候选按名次重编号：candidates[0].id=cand-1 且依次递增，benchmark 列头跟随', async () => {
    const report = await recommend(loadCaseScene('case-01'), {
      store,
      embedder: fakeEmbedder,
      relationDb,
    });
    expect(report.candidates.map((c) => c.id)).toEqual([
      'cand-1',
      'cand-2',
      'cand-3',
      'cand-4',
      'cand-5',
    ]);
    const ids = new Set(report.candidates.map((c) => c.id));
    for (const row of report.benchmark) {
      for (const key of Object.keys(row.candidates)) {
        expect(ids.has(key), `benchmark 列 ${key}`).toBe(true);
      }
    }
    for (const cand of report.candidates) {
      for (const evId of cand.evidenceIds) {
        expect(evId).toMatch(/:/);
      }
    }
  });

  it('C4 企业验收阈值行：label/unit/baseline=阈值 + acceptance min/max + 候选值为实测指标', async () => {
    const report = await recommend(loadCaseScene('case-01'), {
      store,
      embedder: fakeEmbedder,
      relationDb,
    });
    const rows = report.benchmark.filter((r) => r.acceptance !== undefined);
    expect(rows.length).toBeGreaterThanOrEqual(9); // vv/vma/vfa/ms/fl/tsr/retainedStability/ds/bendingStrain
    const vv = rows.find((r) => r.label === '空隙率');
    expect(vv).toBeDefined();
    expect(vv!.unit).toBe('%');
    expect(vv!.baseline).toBe(3); // baseline=阈值（min）
    expect(vv!.acceptance).toEqual({ min: 3, max: 6 });
    const ds = rows.find((r) => r.label === '动稳定度');
    expect(ds!.unit).toBe('次/mm');
    expect(ds!.baseline).toBe(800);
    expect(ds!.acceptance).toEqual({ min: 800 });
    // 候选值来自 labIndicators：cand-1 的 ds 与报告候选一致
    const cand1 = report.candidates[0];
    const labDs = cand1.labIndicators?.find((l) => l.key === 'ds');
    expect(labDs).toBeDefined();
    expect(ds!.candidates[cand1.id]).toBe(labDs!.value);
    // pass 与阈值判定一致
    for (const l of cand1.labIndicators ?? []) {
      if (l.threshold) {
        const expectPass =
          (l.threshold.min === undefined || l.value > l.threshold.min) &&
          (l.threshold.max === undefined || l.value < l.threshold.max);
        expect(l.pass, `lab ${l.key} pass`).toBe(expectPass);
      }
    }
  });

  it('B4 步骤耗时增量为与上一步差值：ms 非负且总和 ≈ 总时长（累计语义会显著超）', async () => {
    const t0 = performance.now();
    const report = await recommend(loadCaseScene('case-01'), {
      store,
      embedder: fakeEmbedder,
      relationDb,
    });
    const elapsed = performance.now() - t0;
    expect(report.steps).toHaveLength(6);
    for (const s of report.steps) expect(s.ms).toBeGreaterThanOrEqual(0);
    const sum = report.steps.reduce((acc, s) => acc + s.ms, 0);
    expect(sum).toBeGreaterThan(0);
    // 增量语义：总和 ≈ 总时长；累计语义下总和 ≈ 3.5×末步，两条上界都可拦截
    expect(sum).toBeLessThanOrEqual(elapsed + 500);
    expect(sum).toBeLessThanOrEqual(report.steps[5].ms * 2 + 150);
  });

  it('R-雷达（UI#13）：lowTemp 方向修复——最抗冻候选雷达低温分最高', async () => {
    const report = await recommend(loadCaseScene('case-01'), {
      store,
      embedder: fakeEmbedder,
      relationDb,
    });
    const candidates = report.candidates;
    expect(candidates.length).toBeGreaterThan(1);
    const rawLow = candidates.map(
      (c) => c.predictions.find((p) => p.perf === 'lowTemp')?.value ?? 0,
    );
    const minIdx = rawLow.indexOf(Math.min(...rawLow));
    const maxRadarLow = Math.max(...candidates.map((c) => c.radar.lowTemp));
    expect(candidates[minIdx].radar.lowTemp).toBe(maxRadarLow);
  });

  it('R-雷达（UI#13）：lcc 最低者雷达 lcc 分最高，且各维 0-100', async () => {
    const report = await recommend(loadCaseScene('case-01'), {
      store,
      embedder: fakeEmbedder,
      relationDb,
    });
    const candidates = report.candidates;
    const rawLcc = candidates.map(
      (c) => c.predictions.find((p) => p.perf === 'lcc')?.value ?? 0,
    );
    const minIdx = rawLcc.indexOf(Math.min(...rawLcc));
    const maxRadarLcc = Math.max(...candidates.map((c) => c.radar.lcc));
    expect(candidates[minIdx].radar.lcc).toBe(maxRadarLcc);
    for (const cand of candidates) {
      for (const dim of RADAR_DIMS) {
        expect(cand.radar[dim]).toBeGreaterThanOrEqual(0);
        expect(cand.radar[dim]).toBeLessThanOrEqual(100);
      }
    }
  });

  it('R-雷达（UI#13）：绝对锚点映射——11.78 vs 12.07 寿命分差 < 10', () => {
    const a = toRadarAbsolute(11.78, RADAR_ANCHORS.expectedLife);
    const b = toRadarAbsolute(12.07, RADAR_ANCHORS.expectedLife);
    expect(Math.abs(a - b)).toBeLessThan(10);
    expect(toRadarAbsolute(-40, RADAR_ANCHORS.lowTemp)).toBe(100);
    expect(toRadarAbsolute(-10, RADAR_ANCHORS.lowTemp)).toBe(0);
  });

  it('空向量库：evidence=[] + warnings 面向用户文案（不暴露 build:index 命令），主流程仍完成（Review Focus #4）', async () => {
    const report = await recommend(loadCaseScene('case-02'), {
      store,
      embedder: fakeEmbedder,
      relationDb,
    });
    expect(report.candidates).toHaveLength(5);
    expect(report.evidence).toEqual([]);
    expect(report.warnings.some((w) => w.includes('知识库管理页'))).toBe(true);
    expect(report.warnings.some((w) => w.includes('build:index'))).toBe(false);
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
