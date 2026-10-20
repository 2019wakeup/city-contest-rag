/**
 * 查询扩展实验（P1·D6，只出数据不改生产）：
 * 在 golden 38 条上对比三种查询形态的 recall@5：
 *   a. 基线（原查询）
 *   b. 中文 bigram 扩展：中文串拆 2-gram 追加（「改性沥青」→「改性 性沥 沥青」）
 *   c. 同义词扩展：scene-tags synonyms + 术语映射表追加英文/别名
 *
 * 口径：与 golden-eval 一致（topK×3 按 sourceDocId 去重截前 5）；纯 BM25（vector 省略），
 * 隔离词法检索增益，不依赖模型。
 *
 * 用法：tsx scripts/query-expansion-eval.ts [backend] [--json]
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { SqliteVectorStore } from '../packages/retrieval/src/sqlite';
import type { VectorStore } from '../packages/retrieval/src/types';
import type { GoldenCase } from './golden-eval';

/** 中文串 2-gram 拆解：连续汉字串拆成重叠二元组（含单字头尾） */
export function bigramExpand(query: string): string {
  const cjkRuns = query.match(/[\u4e00-\u9fff]+/g) ?? [];
  const grams = new Set<string>();
  for (const run of cjkRuns) {
    const chars = [...run];
    if (chars.length <= 2) continue; // 2 字及以下已是原查询词，追加无增益
    for (let i = 0; i < chars.length - 1; i++) grams.add(chars[i] + chars[i + 1]);
  }
  return `${query} ${[...grams].join(' ')}`.trim();
}

/** 同义词映射：场景标签 synonyms + 常见术语表（车辙/rutting、改性沥青/SBS…） */
export const SYNONYM_MAP: Array<[string, string[]]> = [
  ['车辙', ['rutting', '永久变形', '动稳定度']],
  ['裂缝', ['crack', '开裂', 'cracking']],
  ['疲劳', ['fatigue']],
  ['水损', ['moisture', 'water damage', 'TSR']],
  ['水稳', ['moisture', 'TSR', '水稳定性']],
  ['抗车辙', ['rutting resistance']],
  ['改性沥青', ['SBS', 'modified asphalt', '改性']],
  ['SBS', ['改性沥青', '苯乙烯-丁二烯-苯乙烯']],
  ['级配', ['gradation', '级配设计']],
  ['温拌', ['warm mix', 'WMA']],
  ['再生', ['recycl', 'RAP', '再生剂']],
  ['RAP', ['reclaimed asphalt', '再生']],
  ['模量', ['modulus', 'E*']],
  ['低温', ['low temperature', '低温开裂']],
  ['高温', ['high temperature', '车辙']],
  ['降噪', ['noise', '低噪', '降噪路面']],
  ['排水', ['drainage', '排水路面', 'OGFC']],
  ['抗滑', ['skid', 'friction']],
  ['路面', ['pavement']],
  ['沥青', ['asphalt', 'bitumen']],
  ['混合料', ['mixture', 'asphalt mixture']],
  ['知识图谱', ['knowledge graph', 'KG']],
  ['推荐', ['recommendation', 'recommender']],
  ['养护', ['maintenance']],
];

export function synonymExpand(query: string): string {
  const extras = new Set<string>();
  for (const [kw, synonyms] of SYNONYM_MAP) {
    if (query.includes(kw)) for (const s of synonyms) extras.add(s);
  }
  return `${query} ${[...extras].join(' ')}`.trim();
}

export interface ExpansionCaseResult {
  id: string;
  baseline: number;
  bigram: number;
  synonym: number;
  baselineHit: string[];
  bigramHit: string[];
  synonymHit: string[];
}

export interface ExpansionEvalResult {
  summary: { variant: string; passed: number; failed: number; avgRecall: number }[];
  cases: ExpansionCaseResult[];
}

export async function runExpansionEval(store: VectorStore, cases: GoldenCase[], k = 5): Promise<ExpansionEvalResult> {
  const variants: Array<{ name: string; expand: (q: string) => string }> = [
    { name: 'baseline', expand: (q) => q },
    { name: 'bigram', expand: bigramExpand },
    { name: 'synonym', expand: synonymExpand },
  ];
  const casesOut: ExpansionCaseResult[] = [];
  for (const c of cases) {
    const row: ExpansionCaseResult = { id: c.id, baseline: 0, bigram: 0, synonym: 0, baselineHit: [], bigramHit: [], synonymHit: [] };
    for (const v of variants) {
      const hits = await store.search({
        text: v.expand(c.query),
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
      const recall = c.expectedDocIds.length === 0 ? 1 : matched / c.expectedDocIds.length;
      (row as Record<string, unknown>)[v.name] = Number(recall.toFixed(2));
      (row as Record<string, unknown>)[`${v.name}Hit`] = hitDocIds;
    }
    casesOut.push(row);
  }
  const summary = variants.map((v) => {
    const recalls = casesOut.map((r) => (r as unknown as Record<string, number>)[v.name]);
    const thresholdPassed = cases
      .map((c, i) => ({ recall: recalls[i], min: c.minRecallAt5 }))
      .filter((x) => x.recall >= x.min - 1e-9);
    return {
      variant: v.name,
      passed: thresholdPassed.length,
      failed: cases.length - thresholdPassed.length,
      avgRecall: Number((recalls.reduce((a, b) => a + b, 0) / cases.length).toFixed(3)),
    };
  });
  return { summary, cases: casesOut };
}

export function renderExpansionReport(result: ExpansionEvalResult, cases: GoldenCase[]): string {
  const lines: string[] = [];
  lines.push('查询扩展实验（golden 38 条，纯 BM25，recall@5 doc 级）');
  lines.push('─'.repeat(84));
  lines.push('变体         通过     平均recall');
  for (const s of result.summary) {
    lines.push(`${s.variant.padEnd(12)} ${String(s.passed).padStart(3)}/38   ${s.avgRecall.toFixed(3)}`);
  }
  lines.push('─'.repeat(84));
  // 失败案例（以 minRecallAt5 门槛计，任一变体低于门槛列出对比）
  const failures = result.cases
    .map((r, i) => ({ r, c: cases[i] }))
    .filter(({ r, c }) => r.baseline < c.minRecallAt5 - 1e-9 || r.bigram < c.minRecallAt5 - 1e-9 || r.synonym < c.minRecallAt5 - 1e-9);
  if (failures.length > 0) {
    lines.push('变体间有差异/未达标的用例（基线/ bigram/ 同义词 recall@5）：');
    for (const { r, c } of failures) {
      lines.push(
        `${r.id.padEnd(16)} ${String(r.baseline).padStart(5)} ${String(r.bigram).padStart(5)} ${String(r.synonym).padStart(5)}  min=${c.minRecallAt5}  ${c.query}`,
      );
    }
  } else {
    lines.push('所有用例三变体均达各自门槛。');
  }
  return lines.join('\n');
}

const here = path.dirname(fileURLToPath(import.meta.url));

async function main(): Promise<void> {
  const args = process.argv.slice(2);
  const backend = args[0] ?? 'lancedb';
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
    throw new Error(`不支持的 backend: ${backend}`);
  }

  const cases = JSON.parse(fs.readFileSync(path.resolve(here, '../data/golden/golden.json'), 'utf-8')) as GoldenCase[];
  const result = await runExpansionEval(store, cases);
  if (json) {
    console.log(JSON.stringify(result, null, 2));
  } else {
    console.log(renderExpansionReport(result, cases));
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch((err) => {
    console.error('query-expansion-eval 失败:', err);
    process.exit(1);
  });
}
