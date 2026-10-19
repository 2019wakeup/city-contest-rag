import { z } from 'zod';
import { ReportSectionSchema } from '@road-rec/contracts';
import type {
  BenchmarkRow,
  Candidate,
  EvidenceRef,
  Radar,
  ReportSection,
  SceneInput,
  TargetProfile,
} from '@road-rec/contracts';
import { generateStructured, readPrompt } from '../llm/client';
import type { LlmCall, LlmStatus } from '../llm/client';

/** 报告的确定性部分（LLM 只在其上写文案，不产数值） */
export interface ReportBase {
  scene: SceneInput;
  targets: TargetProfile;
  candidates: Candidate[];
  evidence: EvidenceRef[];
  benchmark: BenchmarkRow[];
}

const SectionsResponseSchema = z
  .object({ sections: z.array(ReportSectionSchema) })
  .passthrough();

/** 流式报告章节规格（SSE 每 section 一次 LLM 结构化调用） */
export const SECTION_SPECS = [
  { title: '首选方案说明' },
  { title: '方案对比总结' },
] as const;

const SectionResponseSchema = z.object({ section: ReportSectionSchema }).passthrough();

/**
 * 流式模式：单章节生成（每 section 一次 LLM 调用）。
 * 成功 → {section: 过滤后的章节, fromLlm: true}；失败 → 对应模板章节 {fromLlm: false}。
 */
export async function generateReportSection(
  base: ReportBase,
  index: number,
  llm?: LlmCall,
): Promise<{ section: ReportSection; fromLlm: boolean }> {
  const spec = SECTION_SPECS[index];
  const allowed = new Set(base.evidence.map((e) => e.chunkId));
  const prompt = `${buildReportPrompt(base)}

本次只生成第 ${index + 1} 节「${spec.title}」，输出 JSON：
{"section":{"title":"${spec.title}","paragraphs":["段落文案"],"evidenceIds":["chunkId"]}}
（evidenceIds 只能来自上方"可用证据"列表，禁止编造。）`;
  const { data } = await generateStructured({
    prompt,
    schema: SectionResponseSchema,
    temperature: 0.3,
    llm,
  });
  if (data) {
    return {
      section: {
        ...data.section,
        evidenceIds: data.section.evidenceIds.filter((id) => allowed.has(id)),
      },
      fromLlm: true,
    };
  }
  const fallback = buildFallbackSections(base)[index];
  return {
    section: fallback ?? { title: spec.title, paragraphs: ['（模板降级）'], evidenceIds: [] },
    fromLlm: false,
  };
}

function buildReportPrompt(base: ReportBase): string {
  const template = readPrompt('report.md');
  const evidenceText = base.evidence
    .map((e) => `${e.chunkId}: ${e.text.slice(0, 200)}`)
    .join('\n');
  return template
    .replace(
      '{{deterministic}}',
      JSON.stringify(
        { scene: base.scene, targets: base.targets, candidates: base.candidates, benchmark: base.benchmark },
        null,
        2,
      ),
    )
    .replace('{{evidence}}', evidenceText);
}

/**
 * 报告文案生成：LLM 成功 → ok + 校验后 sections（evidenceIds 过滤防编造）；
 * 失败/空结果 → degraded + 模板文案（数值全部来自确定性数据）。
 * 返回数组带 llmStatus（计划 Interfaces 签名）。
 */
export async function buildReportSections(
  base: ReportBase,
  llm?: LlmCall,
): Promise<ReportSection[] & { llmStatus: LlmStatus }> {
  const allowed = new Set(base.evidence.map((e) => e.chunkId));
  const { data, status } = await generateStructured({
    prompt: buildReportPrompt(base),
    schema: SectionsResponseSchema,
    temperature: 0.3,
    llm,
  });

  let sections: ReportSection[] = [];
  let llmStatus: LlmStatus = status;
  if (data) {
    // 防编造兜底：只保留传入 evidence 中的 chunkId
    sections = data.sections.map((s) => ({
      ...s,
      evidenceIds: s.evidenceIds.filter((id) => allowed.has(id)),
    }));
  }
  if (!data || sections.length === 0) {
    sections = buildFallbackSections(base);
    llmStatus = 'degraded';
  }

  const result = sections as ReportSection[] & { llmStatus: LlmStatus };
  result.llmStatus = llmStatus;
  return result;
}

// ---------------------------------------------------------------------------
// 模板降级文案（确定性数据拼中文文案；LLM 挂时演示照常）
// ---------------------------------------------------------------------------

function radarSummary(radar: Radar): string {
  const dims: Array<[string, number]> = [
    ['高温性能', radar.highTemp],
    ['低温性能', radar.lowTemp],
    ['疲劳性能', radar.fatigue],
    ['水稳定性', radar.waterStability],
    ['成本表现', radar.lcc],
    ['碳排表现', radar.carbon],
    ['预期寿命', radar.expectedLife],
    ['施工可行性', radar.constructability],
  ];
  const top3 = [...dims]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([k, v]) => `${k}（${v} 分）`)
    .join('、');
  return `雷达图 8 维中相对优势为 ${top3}。`;
}

export function buildFallbackSections(base: ReportBase): ReportSection[] {
  const evidenceIds = base.evidence.slice(0, 3).map((e) => e.chunkId);
  const sections: ReportSection[] = [];
  const ranked = base.candidates;
  if (ranked.length > 0) {
    const top = ranked[0];
    // 排版规范：第 1 段 = 一句话结论（≤60 字），后续短段每段一句（≤90 字）
    sections.push({
      title: '首选方案说明',
      paragraphs: [
        `推荐方案 1：「${top.formula.binder.type} + ${top.formula.gradation.type}」，综合得分最高。`,
        radarSummary(top.radar),
        `该方案预期寿命约 ${top.expectedLife} 年，全生命周期成本估算 ${top.lcc} 万元。`,
      ],
      evidenceIds,
    });
  }
  if (ranked.length > 1) {
    // 方案对比总结：短结论段 + 要点行（· 开头，每条 ≤60 字，2–5 条）
    const bullets = ranked.slice(0, 3).map(
      (c, i) =>
        `· 第 ${i + 1} 名：「${c.formula.binder.type} + ${c.formula.gradation.type}」（得分 ${c.score}）。`,
    );
    sections.push({
      title: '方案对比总结',
      paragraphs: [
        `共对比 ${ranked.length} 个候选方案，前 3 名要点如下。`,
        ...bullets,
        '以上数值结论均来自确定性计算（模板文案降级模式）。',
      ],
      evidenceIds,
    });
  }
  return sections;
}
