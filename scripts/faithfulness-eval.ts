/**
 * 引用支撑率评估（faithfulness，spec §4 评估升级 P0）
 *
 * 对每个典型案例调用 /api/v1/recommend 生成报告，然后让 LLM 裁判逐段判断
 * 「报告段落的主张是否被所给证据支撑」，输出支撑率。
 *
 * 用法：
 *   tsx scripts/faithfulness-eval.ts [--base=http://127.0.0.1:3010] [--threshold=0.85] [--json]
 *
 * 口径说明（可解释性）：
 * - 「支撑」判定标准：段落核心主张（机理/建议/定量结论）能在给定证据片段中找到依据；
 *   仅措辞不同或由证据合理推论可得 → 视为支撑；引入新数值/新结论且无依据 → 不支撑。
 * - 本评估是启发式裁判（LLM），仅作回归趋势指标，最终以人工抽查为准。
 * - 未配置 LLM（无 DEEPSEEK_API_KEY）时报错退出（本模式需要真实 LLM）。
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..');

interface EvidenceItem {
  chunkId: string;
  text: string;
  docType?: string;
}
interface ReportSection {
  title: string;
  paragraphs: string[];
  evidenceIds?: string[];
}
interface PerfEntry {
  key?: string;
  property?: string;
  value: number;
  unit?: string;
  label?: string;
}
interface BenchmarkRow {
  label?: string;
  unit?: string;
  baseline?: number;
  candidates?: Record<string, number>;
}
interface Candidate {
  id: string;
  formula?: { binder?: { type?: string }; gradation?: { type?: string }; modifier?: { type?: string } };
  perf?: PerfEntry[];
  radar?: Record<string, number>;
  score?: number;
}
interface Report {
  sections: ReportSection[];
  evidence: EvidenceItem[];
  targets?: Array<{ key?: string; label?: string; target?: number; unit?: string } | Record<string, unknown>>;
  benchmark?: BenchmarkRow[];
  candidates?: Candidate[];
}

interface JudgeItem {
  paragraphIndex: number;
  supported: boolean;
  reason: string;
}

interface CaseResult {
  caseId: string;
  total: number;
  supported: number;
  rate: number;
  details: JudgeItem[];
}

const BASE = (() => {
  const idx = process.argv.findIndex((a) => a.startsWith('--base='));
  return idx >= 0 ? process.argv[idx].slice('--base='.length) : 'http://127.0.0.1:3010';
})();
const THRESHOLD = (() => {
  const idx = process.argv.findIndex((a) => a.startsWith('--threshold='));
  return idx >= 0 ? Number(process.argv[idx].slice('--threshold='.length)) : 0.85;
})();
const JSON_OUT = process.argv.includes('--json');

function loadEnvFile(): void {
  const envPath = path.join(root, '.env');
  if (!fs.existsSync(envPath)) return;
  const content = fs.readFileSync(envPath, 'utf-8');
  for (const line of content.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eq = trimmed.indexOf('=');
    if (eq <= 0) continue;
    const key = trimmed.slice(0, eq).trim();
    const value = trimmed.slice(eq + 1).trim().replace(/^["']|["']$/g, '');
    if (!process.env[key]) process.env[key] = value;
  }
}

async function requestRecommend(scene: unknown): Promise<Report> {
  const res = await fetch(`${BASE}/api/v1/recommend`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(scene),
  });
  if (!res.ok) throw new Error(`recommend HTTP ${res.status}: ${(await res.text()).slice(0, 200)}`);
  return (await res.json()) as Report;
}

function deterministicSummary(report: Report): string {
  const parts: string[] = [];
  const targets = Array.isArray(report.targets) ? report.targets : [];
  if (targets.length > 0) {
    parts.push(
      '目标性能：' +
        targets
          .map((t) => {
            const x = t as Record<string, unknown>;
            const label = String(x.label ?? x.key ?? x.dim ?? '');
            return `${label} ${String(x.target ?? x.value ?? '')}${String(x.unit ?? '')}`;
          })
          .join('；'),
    );
  }
  const cands = report.candidates ?? [];
  if (cands.length > 0) {
    parts.push(
      '方案指标（全部候选）：' +
        cands
          .map((c) => {
            const perf = (c.perf ?? [])
              .map((p) => `${String(p.label ?? p.property ?? p.key ?? '')} ${p.value}${p.unit ?? ''}`)
              .join('、');
            return `${c.id}（${c.formula?.binder?.type ?? ''}+${c.formula?.gradation?.type ?? ''}）：${perf}；综合得分 ${c.score ?? ''}`;
          })
          .join(' | '),
    );
  }
  const bench = report.benchmark ?? [];
  if (bench.length > 0) {
    parts.push(
      '规范基线对比：' +
        bench
          .map(
            (b) =>
              `${b.label ?? ''} 基线 ${b.baseline ?? ''}${b.unit ?? ''}；各方案 ${Object.entries(
                b.candidates ?? {},
              )
                .map(([k, v]) => `${k}=${v}${b.unit ?? ''}`)
                .join('、')}`,
          )
          .join('；'),
    );
  }
  return parts.join('\n');
}

async function judgeSection(
  section: ReportSection,
  evidence: Map<string, EvidenceItem>,
  deterministic: string,
): Promise<JudgeItem[]> {
  const apiKey = process.env.DEEPSEEK_API_KEY;
  if (!apiKey) throw new Error('缺少 DEEPSEEK_API_KEY（.env）——本评估需要真实 LLM');
  const baseUrl = process.env.DEEPSEEK_BASE_URL ?? 'https://api.deepseek.com';
  const model = process.env.DEEPSEEK_MODEL ?? 'deepseek-chat';

  const evidenceIds = section.evidenceIds ?? [];
  const cited = evidenceIds
    .map((id, i) => {
      const e = evidence.get(id);
      if (!e) return `[证据 ${i + 1}] （缺失）`;
      return `[证据 ${i + 1}]（${e.docType ?? '?'}）${e.text.slice(0, 500)}`;
    })
    .join('\n\n');
  const paragraphs = section.paragraphs.map((p, i) => `${i + 1}. ${p}`).join('\n');

  const prompt = `你是严格的评审专家。判断下列报告段落的核心主张是否被「所给证据」支撑。

【判定标准】
- 段落的主张（机理、建议、定量结论）能在「证据」或「确定性数据」中找到依据，或由二者合理推论 → supported=true
- 引入二者都没有的新数值、新结论（幻觉） → supported=false
- 注意：确定性数据中的数值（目标/指标/得分/基线）是系统计算值，以此为准；证据用于机理与规范依据。

【报告段落】
${paragraphs}

【所给证据】
${cited || '（本段无关联证据）'}

【确定性数据】
${deterministic || '（无）'}

只输出 JSON：{"items":[{"paragraphIndex":1,"supported":true,"reason":"≤40字"}]}，覆盖全部段落。`;

  const res = await fetch(`${baseUrl}/chat/completions`, {
    method: 'POST',
    headers: { 'content-type': 'application/json', authorization: `Bearer ${apiKey}` },
    body: JSON.stringify({
      model,
      temperature: 0,
      messages: [{ role: 'user', content: prompt }],
      response_format: { type: 'json_object' },
    }),
  });
  if (!res.ok) throw new Error(`judge HTTP ${res.status}: ${(await res.text()).slice(0, 200)}`);
  const json = (await res.json()) as { choices?: Array<{ message?: { content?: string } }> };
  const content = json.choices?.[0]?.message?.content ?? '{}';
  const parsed = JSON.parse(content) as { items?: JudgeItem[] };
  return (parsed.items ?? []).map((it) => ({
    paragraphIndex: Number(it.paragraphIndex) || 0,
    supported: Boolean(it.supported),
    reason: String(it.reason ?? ''),
  }));
}

// 校准自检：喂一段人造幻觉（伪造数值+伪造证据术语），裁判必须判 supported=false
async function calibrate(): Promise<void> {
  loadEnvFile();
  const fakeSection: ReportSection = {
    title: '校准',
    paragraphs: [
      '方案 1 的高温性能达到 PG94，疲劳寿命 520 万次，单价仅 32 万元，为全部候选中最优。',
    ],
    evidenceIds: [],
  };
  const fakeEvidence = new Map<string, EvidenceItem>();
  const fakeDeterministic = '目标性能：高温PG 76℃；方案指标（全部候选）：方案1（SBS 改性沥青+AC 密级配）：高温性能 83.8℃、疲劳性能 81.75万次、LCC 136.99万元；综合得分 0.63';
  const items = await judgeSection(fakeSection, fakeEvidence, fakeDeterministic);
  const ok = items.length > 0 && items.every((i) => i.supported === false);
  console.log(ok ? '✓ 校准通过：人造幻觉被正确判为不支撑' : '✗ 校准失败：裁判未识别幻觉（指标不可信）');
  if (!ok) process.exitCode = 1;
}

async function main(): Promise<void> {
  loadEnvFile();
  if (process.argv.includes('--calibrate')) {
    await calibrate();
    return;
  }
  if (!process.env.DEEPSEEK_API_KEY) {
    console.error('faithfulness-eval 需要 DEEPSEEK_API_KEY（配置在 .env）');
    process.exit(1);
  }
  const casesRaw = JSON.parse(
    fs.readFileSync(path.join(root, 'data/corpus/cases/cases.json'), 'utf-8'),
  ) as Array<{ id: string; title: string; scene: unknown }>;

  const results: CaseResult[] = [];
  for (const c of casesRaw) {
    const report = await requestRecommend(c.scene);
    const evidence = new Map(report.evidence.map((e) => [e.chunkId, e]));
    const deterministic = deterministicSummary(report);
    const details: JudgeItem[] = [];
    let total = 0;
    for (const section of report.sections) {
      try {
        const items = await judgeSection(section, evidence, deterministic);
        details.push(...items);
        total += section.paragraphs.length;
      } catch (err) {
        console.error(`! ${c.id}/${section.title} 裁判失败: ${err instanceof Error ? err.message : err}`);
        total += section.paragraphs.length;
      }
    }
    const supported = details.filter((d) => d.supported).length;
    const rate = total === 0 ? 0 : supported / total;
    results.push({ caseId: c.id, total, supported, rate, details });
    console.log(
      `${c.id}: ${supported}/${total} 段被证据支撑（${(rate * 100).toFixed(1)}%）`,
    );
  }

  const total = results.reduce((s, r) => s + r.total, 0);
  const supported = results.reduce((s, r) => s + r.supported, 0);
  const overall = total === 0 ? 0 : supported / total;
  console.log('─'.repeat(60));
  console.log(`总体引用支撑率: ${supported}/${total} = ${(overall * 100).toFixed(1)}%（阈值 ${(THRESHOLD * 100).toFixed(0)}%）`);
  if (JSON_OUT) console.log(JSON.stringify({ results, overall }, null, 1));
  if (overall < THRESHOLD) {
    console.error('引用支撑率低于阈值');
    process.exitCode = 1;
  }
}

void main().catch((err) => {
  console.error('faithfulness-eval 失败:', err);
  process.exit(1);
});
