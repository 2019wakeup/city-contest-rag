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
    sections.push({
      title: '首选方案',
      paragraphs: [
        `综合加权得分最高的是「${top.formula.binder.type} + ${top.formula.gradation.type}」组合（综合得分 ${top.score}）。`,
        radarSummary(top.radar),
        `该方案预期寿命约 ${top.expectedLife} 年，全生命周期成本估算 ${top.lcc} 万元。`,
      ],
      evidenceIds,
    });
  }
  if (ranked.length > 1) {
    const second = ranked[1];
    sections.push({
      title: '方案对比',
      paragraphs: [
        `共对比 ${ranked.length} 个候选组合，排名第二的是「${second.formula.binder.type} + ${second.formula.gradation.type}」（得分 ${second.score}）。`,
        '以上数值结论均来自确定性计算（当前为模板文案降级模式，LLM 不可用）。',
      ],
      evidenceIds,
    });
  }
  return sections;
}
