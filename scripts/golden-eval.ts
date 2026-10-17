/**
 * 金标准检索回归集评估器（T5，spec §4 防线 4）
 *
 * 用法：
 *   tsx scripts/golden-eval.ts <backend> [--json] [--db-path=...]
 *   backend: sqlite | lancedb（默认取 RETRIEVAL_BACKEND，再默认 sqlite）
 *
 * 评估口径：query 只传 text（纯 BM25，vector 省略，不依赖模型下载，评估器不 import embedder）；
 * 对每个用例取 top-5 命中，按 hit.provenance.sourceDocId ∈ expectedDocIds 计算 recall@5；
 * 任一用例 recall@5 低于 minRecallAt5 → exit 1（spec：不通过不允许切换引擎/模型/切块策略）。
 */
import fs from 'node:fs';
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
): Promise<GoldenEvalResult> {
  const results: CaseResult[] = [];
  for (const c of cases) {
    // vector 省略 = 纯 BM25 检索（接口契约，金标准评估不依赖模型）
    const hits = await store.search({
      text: c.query,
      topK: k,
      filter: c.docTypes ? { docTypes: c.docTypes } : undefined,
    });
    const hitDocIds = hits.map((h) => h.provenance.sourceDocId);
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
  lines.push('金标准检索回归（recall@5，纯 BM25）');
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

  const cases = loadGoldenCases(path.resolve(here, '../data/golden/golden.json'));
  const result = await runGoldenEval(store, cases);
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
