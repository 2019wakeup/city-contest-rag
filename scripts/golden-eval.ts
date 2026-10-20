/**
 * 金标准检索回归集评估器（T5，spec §4 防线 4）
 *
 * 用法：
 *   tsx scripts/golden-eval.ts <backend> [--json] [--db-path=...]
 *   backend: sqlite | lancedb（默认取 RETRIEVAL_BACKEND，再默认 sqlite）
 *
 * 评估口径：默认混合检索（text + query 向量，与生产一致；`--bm25` 可回退纯关键词离线模式）；
 * 期望为 doc 级：取 topK×3 命中按 sourceDocId 去重后截前 5 个文档，按 ∈ expectedDocIds 计算 recall@5；
 * 任一用例 recall@5 低于 minRecallAt5 → exit 1（spec：不通过不允许切换引擎/模型/切块策略）。
 */
import fs from 'node:fs';
import { createEmbedder } from '../packages/embedding/src/index';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { SqliteVectorStore } from '../packages/retrieval/src/sqlite';
import type { VectorStore } from '../packages/retrieval/src/types';

export interface GoldenCase {
  id: string;
  query: string;
  expectedDocIds: string[];
  minRecallAt5: number;
  /** 可选 docTypes 过滤（与主流程证据检索同口径：按语料类型检索） */
  docTypes?: string[];
}

export interface CaseResult {
  id: string;
  query: string;
  expectedDocIds: string[];
  hitDocIds: string[];
  recallAt5: number;
  minRecallAt5: number;
  passed: boolean;
}

export interface GoldenEvalResult {
  results: CaseResult[];
  passedCount: number;
  failedCount: number;
}

export function loadGoldenCases(file: string): GoldenCase[] {
  return JSON.parse(fs.readFileSync(file, 'utf-8')) as GoldenCase[];
}

export async function runGoldenEval(
  store: VectorStore,
  cases: GoldenCase[],
  k = 5,
  embedder?: { embed(texts: string[], opts?: { mode?: 'query' | 'passage' }): Promise<number[][]> } | null,
): Promise<GoldenEvalResult> {
  const results: CaseResult[] = [];
  for (const c of cases) {
    // 混合检索（与生产一致）：有 embedder 时带 query 向量；无则纯 BM25（离线兜底）。
    // 金标准是 doc 级期望：取 topK 的 3 倍 chunk 后按 sourceDocId 去重、截前 k 个文档，
    // 避免同一 doc 的多个 chunk（维度拆分后）挤占 top-k 名额造成假性失分
    let vector: number[] | undefined;
    if (embedder) {
      try {
        vector = (await embedder.embed([c.query], { mode: 'query' }))[0];
      } catch {
        vector = undefined;
      }
    }
    const hits = await store.search({
      text: c.query,
      vector,
      topK: Math.max(k * 3, k),
      filter: c.docTypes ? { docTypes: c.docTypes } : undefined,
    });
    const seen = new Set<string>();
    const hitDocIds: string[] = [];
    for (const h of hits) {
      if (!seen.has(h.provenance.sourceDocId)) {
        seen.add(h.provenance.sourceDocId);
        hitDocIds.push(h.provenance.sourceDocId);
        if (hitDocIds.length >= k) break;
      }
    }
    const matched = c.expectedDocIds.filter((e) => hitDocIds.includes(e)).length;
    const recallAt5 = c.expectedDocIds.length === 0 ? 1 : matched / c.expectedDocIds.length;
    results.push({
      id: c.id,
      query: c.query,
      expectedDocIds: c.expectedDocIds,
      hitDocIds,
      recallAt5: Number(recallAt5.toFixed(2)),
      minRecallAt5: c.minRecallAt5,
      passed: recallAt5 >= c.minRecallAt5 - 1e-9,
    });
  }
  const passedCount = results.filter((r) => r.passed).length;
  return { results, passedCount, failedCount: results.length - passedCount };
}

export function renderReport(result: GoldenEvalResult, opts: { json?: boolean } = {}): string {
  if (opts.json) {
    return JSON.stringify(
      {
        passed: result.passedCount,
        failed: result.failedCount,
        total: result.results.length,
        cases: result.results.map((r) => ({
          id: r.id,
          query: r.query,
          recallAt5: r.recallAt5,
          minRecallAt5: r.minRecallAt5,
          passed: r.passed,
          hitDocIds: r.hitDocIds,
        })),
      },
      null,
      2,
    );
  }
  const lines: string[] = [];
  lines.push('金标准检索回归（recall@5，默认混合检索；--bm25 纯关键词）');
  lines.push('─'.repeat(84));
  for (const r of result.results) {
    const mark = r.passed ? '✓' : '✗';
    lines.push(
      `${mark} ${r.id.padEnd(16)} recall=${r.recallAt5.toFixed(2)} (min ${r.minRecallAt5})  ` +
        `命中: [${r.hitDocIds.join(', ')}]`,
    );
    if (!r.passed) {
      lines.push(`   期望: [${r.expectedDocIds.join(', ')}]`);
    }
  }
  lines.push('─'.repeat(84));
  lines.push(`通过 ${result.passedCount}/${result.results.length}（不达标 ${result.failedCount}）`);
  return lines.join('\n');
}

const here = path.dirname(fileURLToPath(import.meta.url));

async function main(): Promise<void> {
  const args = process.argv.slice(2);
  if (args.length === 0 || args[0].startsWith('--')) {
    throw new Error('用法: tsx scripts/golden-eval.ts <sqlite|lancedb> [--json] [--db-path=...]');
  }
  const backend = args[0];
  const json = args.includes('--json');
  const dbPathArg = args.find((a) => a.startsWith('--db-path='));
  const indexDir = path.resolve(here, '../data/index');

  let store: VectorStore;
  if (backend === 'sqlite') {
    store = new SqliteVectorStore(dbPathArg?.split('=')[1] ?? path.join(indexDir, 'app.db'));
  } else if (backend === 'lancedb') {
    const { LanceDBVectorStore } = await import('../packages/retrieval/src/lancedb');
    store = new LanceDBVectorStore(dbPathArg?.split('=')[1] ?? path.join(indexDir, 'lancedb'));
  } else {
    throw new Error(`不支持的 backend: ${backend}（可选 sqlite|lancedb）`);
  }

  // 默认混合检索（与生产一致）；--bm25 强制纯关键词模式（离线/无模型时）
  let embedder: { embed(texts: string[], opts?: { mode?: 'query' | 'passage' }): Promise<number[][]> } | null = null;
  if (!args.includes('--bm25')) {
    try {
      const model = (process.env.EMBEDDING_MODEL ??
        'multilingual-e5-small') as 'bge-m3' | 'multilingual-e5-small' | 'multilingual-e5-base';
      embedder = await createEmbedder({
        model,
        cacheDir: path.resolve(indexDir, 'hf-cache'),
      });
    } catch {
      embedder = null;
    }
  }
  const cases = loadGoldenCases(path.resolve(here, '../data/golden/golden.json'));
  const result = await runGoldenEval(store, cases, 5, embedder);
  console.log(renderReport(result, { json }));
  if (result.failedCount > 0) {
    console.error(`金标准未通过：${result.failedCount} 条用例 recall@5 低于门槛`);
    process.exitCode = 1;
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch((err) => {
    console.error('golden-eval 失败:', err);
    process.exit(1);
  });
}
