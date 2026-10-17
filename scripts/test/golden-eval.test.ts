import { describe, expect, it } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { loadGoldenCases, renderReport, runGoldenEval } from '../golden-eval';
import type { VectorStore } from '../../packages/retrieval/src/types';
import type { SearchHit } from '@road-rec/contracts';

/** fake store：search 固定返回给定 docId 序列的命中（忽略 query 内容） */
function fakeStore(docIds: string[]): VectorStore {
  return {
    add: async () => {},
    delete: async () => {},
    rebuild: async () => {},
    stats: async () => ({ count: 0, docTypes: {} }),
    search: async (q): Promise<SearchHit[]> =>
      docIds.map((docId, i) => ({
        schemaVersion: '1',
        chunkId: `${docId}:0`,
        text: q.text,
        docType: 'knowledge',
        tags: [],
        provenance: {
          sourceDocId: docId,
          contentHash: 'fake-hash',
          embeddingModel: 'fake',
          modelVersion: 'fake-1',
          dim: 8,
          pipelineRev: 'fake-rev',
          embeddedAt: '2026-10-17T00:00:00.000Z',
        },
        score: 1 - i * 0.1,
      })),
  };
}

const CASES = [
  { id: 'c-a', query: '查询A', expectedDocIds: ['doc-1', 'doc-2'], minRecallAt5: 1.0 },
  { id: 'c-b', query: '查询B', expectedDocIds: ['doc-3'], minRecallAt5: 1.0 },
];

describe('golden-eval 评估器判定逻辑（fake store）', () => {
  it('命中达标用例：recall=1 且 passed', async () => {
    const store = fakeStore(['doc-1', 'doc-2', 'doc-x', 'doc-y', 'doc-z']);
    const r = await runGoldenEval(store, [CASES[0]]);
    expect(r.results[0].recallAt5).toBe(1);
    expect(r.results[0].passed).toBe(true);
    expect(r.passedCount).toBe(1);
    expect(r.failedCount).toBe(0);
  });

  it('缺命中用例：recall 低于门槛且 failedCount=1（对应 exit 1 语义）', async () => {
    const store = fakeStore(['doc-x', 'doc-y']);
    const r = await runGoldenEval(store, [CASES[1]]);
    expect(r.results[0].hitDocIds).toEqual(['doc-x', 'doc-y']);
    expect(r.results[0].recallAt5).toBe(0);
    expect(r.results[0].passed).toBe(false);
    expect(r.failedCount).toBe(1);
  });

  it('部分命中按比例计算 recall', async () => {
    const store = fakeStore(['doc-1', 'doc-x']);
    const r = await runGoldenEval(store, [CASES[0]]);
    expect(r.results[0].recallAt5).toBe(0.5);
    expect(r.results[0].passed).toBe(false); // min 1.0
  });

  it('--json 输出包含 recall 字段', async () => {
    const store = fakeStore(['doc-1', 'doc-2']);
    const r = await runGoldenEval(store, [CASES[0]]);
    const out = renderReport(r, { json: true });
    const parsed = JSON.parse(out) as { cases: Array<Record<string, unknown>> };
    expect(parsed.cases).toHaveLength(1);
    expect(parsed.cases[0]).toHaveProperty('recallAt5');
    expect(parsed.cases[0]).toHaveProperty('hitDocIds');
    expect(parsed).toHaveProperty('passed');
    expect(parsed).toHaveProperty('failed');
  });

  it('golden.json 结构合法：20 条、id 唯一、门槛在 [0,1]、expected 非空', () => {
    const cases = loadGoldenCases(path.resolve(__dirname, '../../data/golden/golden.json'));
    expect(cases).toHaveLength(20);
    const ids = new Set(cases.map((c) => c.id));
    expect(ids.size).toBe(20);
    for (const c of cases) {
      expect(c.query.length).toBeGreaterThan(0);
      expect(c.expectedDocIds.length).toBeGreaterThan(0);
      expect(c.minRecallAt5).toBeGreaterThanOrEqual(0);
      expect(c.minRecallAt5).toBeLessThanOrEqual(1);
    }
    // 5 案例 × 4 语料类覆盖
    const kinds = new Set(cases.map((c) => c.id.split('-')[1]));
    expect(kinds).toEqual(new Set(['knowledge', 'standard', 'literature', 'enterprise']));
    const caseIds = new Set(cases.map((c) => c.id.split('-')[0]));
    expect(caseIds.size).toBe(5);
  });

  it('golden.json 引用的 expectedDocIds 全部存在于真实语料', () => {
    const cases = loadGoldenCases(path.resolve(__dirname, '../../data/golden/golden.json'));
    const entries = JSON.parse(
      fs.readFileSync(path.resolve(__dirname, '../../data/corpus/knowledge/entries.json'), 'utf-8'),
    ) as Array<{ id: string }>;
    const entryIds = new Set(entries.map((e) => e.id));
    const litIds = new Set(
      (
        JSON.parse(
          fs.readFileSync(path.resolve(__dirname, '../../data/corpus/literature/from-xlsx.json'), 'utf-8'),
        ) as Array<{ id: string }>
      ).map((l) => l.id),
    );
    const stdIds = new Set(
      fs
        .readdirSync(path.resolve(__dirname, '../../data/corpus/standards'))
        .filter((f) => f.endsWith('.md'))
        .map((f) => f.replace(/\.md$/, '')),
    );
    const all = new Set([...entryIds, ...litIds, ...stdIds]);
    for (const c of cases) {
      for (const id of c.expectedDocIds) {
        expect(all.has(id), `${c.id} 引用了不存在的 docId: ${id}`).toBe(true);
      }
    }
  });
});
