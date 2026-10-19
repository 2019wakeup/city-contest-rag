// T14 e2e-cases：5 案例端到端验收（Lead）
// 断言：200 / candidates=5 / evidence 非空 / radar 8 维 / 两遍确定性 / steps 六步
import { readFileSync } from 'node:fs';
import { join, resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const REPO_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const BASE = process.env.E2E_BASE_URL ?? 'http://127.0.0.1:3000';
const CASES = JSON.parse(readFileSync(join(REPO_ROOT, 'data/corpus/cases/cases.json'), 'utf-8')) as Array<{
  id: string;
  scene: unknown;
}>;

interface Candidate {
  id: string;
  formula: { binder: { type: string }; modifier?: { type: string } | null };
  radar: Record<string, number>;
}

interface Report {
  candidates: Candidate[];
  evidence: unknown[];
  steps: Array<{ name: string; ms: number }>;
  llmStatus: 'ok' | 'degraded';
  adapterMode: { a: string; c: string };
  warnings: string[];
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

function assert(cond: boolean, msg: string): void {
  if (!cond) throw new Error(`断言失败: ${msg}`);
}

async function recommend(scene: unknown): Promise<{ status: number; report: Report; raw: string }> {
  const res = await fetch(`${BASE}/api/v1/recommend`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(scene),
  });
  const raw = await res.text();
  let report: Report;
  try {
    report = JSON.parse(raw);
  } catch {
    throw new Error(`非 JSON 响应 (${res.status}): ${raw.slice(0, 200)}`);
  }
  return { status: res.status, report, raw };
}

function canonicalize(report: Report): string {
  // 确定性校验：只比较数值/结构（LLM 接入后 sections 文案每次不同，steps 耗时每次不同，均剔除）
  const { steps: _steps, sections: _sections, ...rest } = report as Report & { sections?: unknown };
  return JSON.stringify(rest);
}

function signature(candidates: Candidate[]): string {
  const binder = candidates[0]?.formula.binder.type ?? '?';
  const modifier = candidates[0]?.formula.modifier?.type ?? '-';
  return `${binder}+${modifier}`;
}

async function main(): Promise<void> {
  let failures = 0;
  const top1Signatures: string[] = [];
  for (const c of CASES) {
    const label = `${c.id}`;
    try {
      const r1 = await recommend(c.scene);
      assert(r1.status === 200, `${label} HTTP ${r1.status}（应 200）: ${r1.raw.slice(0, 300)}`);
      const rep = r1.report;
      assert(rep.candidates.length === 5, `${label} candidates=${rep.candidates.length}（应 5）`);
      assert(rep.evidence.length > 0, `${label} evidence 为空`);
      for (const [i, cand] of rep.candidates.entries()) {
        for (const dim of RADAR_DIMS) {
          assert(dim in cand.radar, `${label} 候选${i} 雷达图缺维度 ${dim}`);
          const v = cand.radar[dim];
          assert(typeof v === 'number' && v >= 0 && v <= 100, `${label} 候选${i} 维度 ${dim}=${v} 越界`);
        }
      }
      assert(rep.steps.length === 6, `${label} steps=${rep.steps.length}（应 6）`);
      assert(rep.adapterMode.a === 'mock' && rep.adapterMode.c === 'mock', `${label} adapterMode=${JSON.stringify(rep.adapterMode)}（应 mock）`);
      // 确定性校验：LLM 已启用时 notes→场景抽取是非确定性的（属预期），故对比时剔除 notes，
      // 只验证「同一结构化场景 → 同一数值结果」这条确定性红线（sections 文案在 canonicalize 中剔除）。
      const sceneNoNotes = { ...(c.scene as Record<string, unknown>), notes: '' };
      const r2 = await recommend(sceneNoNotes);
      const r3 = await recommend(sceneNoNotes);
      assert(r2.status === 200 && r3.status === 200, `${label} 确定性对比 HTTP ${r2.status}/${r3.status}`);
      assert(canonicalize(r2.report) === canonicalize(r3.report), `${label} 两遍结果不相等（确定性破坏）`);
      top1Signatures.push(signature(rep.candidates));
      console.log(`✓ ${label} 通过（top1=${top1Signatures[top1Signatures.length - 1]}, candidates=${rep.candidates.length}, evidence=${rep.evidence.length}, llmStatus=${rep.llmStatus}）`);
    } catch (err) {
      failures++;
      console.error(`✗ ${label}: ${err instanceof Error ? err.message : String(err)}`);
    }
  }
  const distinct = new Set(top1Signatures).size;
  assert(distinct >= 3, `5 案例 top-1 签名仅 ${distinct} 种（应 ≥3，候选组装对场景不敏感）`);
  if (failures > 0) {
    console.error(`e2e-cases 失败 ${failures}/${CASES.length}`);
    process.exit(1);
  }
  console.log(`e2e-cases 全绿 ${CASES.length}/${CASES.length}（top-1 差异化 ${distinct}/5）`);
}

void main();
