import { performance } from 'node:perf_hooks';
import {
  CandidateSchema,
  FormulaSchema,
  RecommendationReportSchema,
  SceneInputSchema,
} from '@road-rec/contracts';
import type {
  BenchmarkRow,
  Candidate,
  EvidenceRef,
  Formula,
  PerfTarget,
  RecommendationReport,
  SceneInput,
  StepRecord,
  TargetProfile,
} from '@road-rec/contracts';
import type { VectorStore } from '@road-rec/retrieval';
import { filterByScene } from './relation/db';
import type { RelationDb } from './relation/db';
import { mapSceneToTargets } from './adapters/a';
import { predictFormulas } from './adapters/c';
import type { AdapterMode } from './adapters/a';
import { generateStructured, readPrompt } from './llm/client';
import type { LlmCall } from './llm/client';
import { buildReportSections } from './report/fallback';
import type { ReportBase } from './report/fallback';

export interface EmbedderLike {
  dim: number;
  modelName: string;
  modelVersion: string;
  embed(texts: string[]): Promise<number[][]>;
}

export interface RecommendDeps {
  store: VectorStore;
  embedder: EmbedderLike | null;
  relationDb: RelationDb;
  /** 测试注入：fake LLM；缺省走 env 配置（DEEPSEEK_API_KEY/LLM_OFF） */
  llmCall?: LlmCall;
}

// ===== 规则估算常量（演示假设，注释即依据）=====
const OIL_STONE_RATIO_EST = 5.5; // 油石比规则估算 5.5%（假设，真实值由配比设计/模块 C 给出）
const AIR_VOIDS_EST = 4.0; // 空隙率规则估算 4.0%（假设）
const MODIFIER_DOSAGE_EST = 4.0; // 改性剂掺量缺省 4.0%（假设）
const ADDITIVE_DOSAGE_EST = 0.3; // 助剂掺量缺省 0.3%（假设）
const TOP_K_CANDIDATES = 5;
const EVIDENCE_PER_CANDIDATE = 3;
const LOWER_BETTER_DIMS = new Set(['lcc', 'carbon']);

/** 模块 A 目标性能名（中文词汇，与 relations.property 对齐）→ 雷达 8 维英文键 */
const PERF_ALIAS: Record<string, string> = {
  高温PG: 'highTemp',
  低温PG: 'lowTemp',
  疲劳: 'fatigue',
  水稳TSR: 'waterStability',
  成本: 'lcc',
  碳排: 'carbon',
  预期寿命: 'expectedLife',
  施工和易性: 'constructability',
};

const DIM_META: Array<{ dim: string; label: string; unit: string }> = [
  { dim: 'highTemp', label: '高温性能', unit: '℃' },
  { dim: 'lowTemp', label: '低温性能', unit: '℃' },
  { dim: 'fatigue', label: '疲劳性能', unit: '次' },
  { dim: 'waterStability', label: '水稳定性', unit: '%' },
  { dim: 'lcc', label: '全生命周期成本', unit: '万元' },
  { dim: 'carbon', label: '碳排放', unit: 'tCO2e' },
  { dim: 'expectedLife', label: '预期寿命', unit: '年' },
  { dim: 'constructability', label: '施工可行性', unit: '分' },
];

/**
 * 六步确定性 pipeline（spec §5）：解析 → 映射 → 召回 → 预测 → 排序 → 报告。
 * 量化红线：排序/雷达图/LCC/碳排等数值全部确定性计算，LLM 不产数值。
 */
export async function recommend(scene: SceneInput, deps: RecommendDeps): Promise<RecommendationReport> {
  const steps: StepRecord[] = [];
  const startedAt = performance.now();
  const mark = (name: string) => steps.push({ name, ms: Math.round(performance.now() - startedAt) });

  // ① 场景解析（zod 校验；notes 非空且 LLM 可用 → 自由文本抽取成同构 JSON，LLM_OFF 时忽略 notes）
  let parsedScene = SceneInputSchema.parse(scene);
  const llmEnabled =
    deps.llmCall != null ||
    Boolean(process.env.DEEPSEEK_API_KEY && process.env.LLM_OFF !== '1');
  if (parsedScene.notes.trim() && llmEnabled) {
    const extraction = await generateStructured({
      prompt: readPrompt('extract-scene.md').replace('{{notes}}', parsedScene.notes),
      schema: SceneInputSchema,
      temperature: 0,
      llm: deps.llmCall,
    });
    if (extraction.data) parsedScene = mergeExtracted(parsedScene, SceneInputSchema.parse(extraction.data));
  }
  mark('parse');

  // ② 模块 A：目标性能 + 优先级权重
  const targetsWithMode = await mapSceneToTargets(parsedScene);
  const adapterModeA: AdapterMode = targetsWithMode.adapterMode;
  const targets: TargetProfile = targetsWithMode;
  mark('mapping');

  // ③ 场景标签推导 + 关系表硬过滤 + 候选公式组装（binder×gradation 按命中数取前 5）
  const tags = deriveSceneTags(parsedScene, deps.relationDb);
  const materialSet = filterByScene(deps.relationDb, { targets: targets.targets, tags });
  const assembled = assembleCandidates(parsedScene, tags, targets.targets, materialSet, deps.relationDb);
  mark('recall');

  // ④ 模块 C：逐候选预测（含置信区间）
  const predictionsWithMode = await predictFormulas(assembled.map((a) => a.formula));
  const adapterModeC: AdapterMode = predictionsWithMode.adapterMode;
  mark('predict');

  // ⑤ 确定性排序 + 雷达图 8 维 + LCC/碳排/寿命规则估算
  const ranked = rankCandidates(parsedScene, assembled, [...predictionsWithMode], targets);
  mark('rank');

  // ⑥ 证据检索（每候选按类型标签 search top3）+ 报告文案（LLM ok/模板降级）+ 组装
  const { evidence, byCandidate, retrievalWarnings } = await retrieveEvidence(ranked, deps);
  for (const cand of ranked) {
    cand.evidenceIds = byCandidate.get(cand.id) ?? [];
  }
  const warnings = [...retrievalWarnings];
  if (evidence.length === 0) warnings.push('知识库为空，请执行 pnpm build:index');
  const base: ReportBase = {
    scene: parsedScene,
    targets,
    candidates: ranked,
    evidence,
    benchmark: buildBenchmark(ranked, targets),
  };
  const sectionsWithStatus = await buildReportSections(base, deps.llmCall);
  const report = RecommendationReportSchema.parse({
    schemaVersion: '1',
    ...base,
    sections: [...sectionsWithStatus],
    charts: {},
    llmStatus: sectionsWithStatus.llmStatus,
    adapterMode: { a: adapterModeA, c: adapterModeC },
    warnings,
    steps,
  });
  mark('report');
  return report;
}

/** 抽取结果合并：提取值非空才覆盖原表单（notes 保留原文）。 */
function mergeExtracted(base: SceneInput, extracted: SceneInput): SceneInput {
  const pick = <T>(value: T, fallback: T): T => (value ? value : fallback);
  return SceneInputSchema.parse({
    ...base,
    climate: {
      ...base.climate,
      zone: pick(extracted.climate.zone, base.climate.zone),
      pgHigh: pick(extracted.climate.pgHigh, base.climate.pgHigh),
      pgLow: pick(extracted.climate.pgLow, base.climate.pgLow),
    },
    traffic: {
      ...base.traffic,
      level: pick(extracted.traffic.level, base.traffic.level),
      esal: pick(extracted.traffic.esal, base.traffic.esal),
    },
    pavement: {
      ...base.pavement,
      layer: pick(extracted.pavement.layer, base.pavement.layer),
      structure: pick(extracted.pavement.structure, base.pavement.structure),
    },
    distresses: extracted.distresses.length > 0 ? extracted.distresses : base.distresses,
    constraints: {
      ...base.constraints,
      budget: pick(extracted.constraints.budget, base.constraints.budget),
      schedule: pick(extracted.constraints.schedule, base.constraints.schedule),
      env: pick(extracted.constraints.env, base.constraints.env),
      noise: pick(extracted.constraints.noise, base.constraints.noise),
    },
    notes: base.notes,
  });
}

// ---------------------------------------------------------------------------
// 场景标签推导（数据驱动：scene_tags 词典 id/label/synonyms 匹配，确定性）
// ---------------------------------------------------------------------------

export function deriveSceneTags(scene: SceneInput, db: RelationDb): string[] {
  const rows = db.prepare('SELECT id, label, kind, synonymsJson FROM scene_tags').all() as unknown as Array<{
    id: string;
    label: string;
    kind: string;
    synonymsJson: string;
  }>;
  const distressTypes = scene.distresses.map((d) => d.type.toLowerCase());
  const trafficLevel = scene.traffic.level.toLowerCase();
  const freeText = [
    scene.climate.zone,
    scene.constraints.env,
    scene.constraints.noise,
    scene.notes,
    scene.pavement.structure,
  ].join(' ');

  const tags = new Set<string>();
  for (const r of rows) {
    const synonyms: string[] = JSON.parse(r.synonymsJson) as string[];
    const candidates = [r.label, ...synonyms];
    const remainder = r.id.replace(/^[a-z]+-/, ''); // d-rutting → rutting
    if (r.kind === 'distress') {
      if (
        distressTypes.some(
          (t) => t.includes(remainder) || candidates.some((s) => s && t.includes(s)),
        )
      ) {
        tags.add(r.id);
      }
    } else if (r.kind === 'traffic') {
      if (trafficLevel.includes(remainder) || candidates.some((s) => s && trafficLevel.includes(s))) {
        tags.add(r.id);
      }
    } else {
      if (candidates.some((s) => s && freeText.includes(s))) tags.add(r.id);
    }
  }
  return [...tags].sort();
}

export function summarizeScene(scene: SceneInput): string {
  const distress = scene.distresses.map((d) => d.type).join('、') || '无病害';
  return `${scene.climate.zone} · ${scene.traffic.level} · ${distress}`;
}

// ---------------------------------------------------------------------------
// 候选公式组装
// ---------------------------------------------------------------------------

interface MaterialMeta {
  id: string;
  name: string;
  specs: Record<string, unknown>;
}

function assembleCandidates(
  scene: SceneInput,
  tags: string[],
  targets: PerfTarget[],
  materialSet: ReturnType<typeof filterByScene>,
  db: RelationDb,
): Array<{ id: string; formula: Formula }> {
  const tagSet = new Set(tags);
  const targetProps = new Set(targets.map((t) => t.perf));

  // 命中数：匹配标签或目标性能的 relations 条数（每材料）
  const rels = db
    .prepare('SELECT materialId, property, applicableSceneJson FROM relations')
    .all() as unknown as Array<{ materialId: string; property: string; applicableSceneJson: string }>;
  const hitsById = new Map<string, number>();
  for (const r of rels) {
    const scenes = JSON.parse(r.applicableSceneJson) as string[];
    if (scenes.some((s) => tagSet.has(s)) || targetProps.has(r.property)) {
      hitsById.set(r.materialId, (hitsById.get(r.materialId) ?? 0) + 1);
    }
  }

  const rows = db
    .prepare('SELECT id, type, name, specsJson FROM materials')
    .all() as unknown as Array<{ id: string; type: string; name: string; specsJson: string }>;
  const byName = new Map<string, MaterialMeta>();
  for (const r of rows) byName.set(r.name, { id: r.id, name: r.name, specs: JSON.parse(r.specsJson) });

  const hitsOf = (name: string) => {
    const m = byName.get(name);
    return m ? (hitsById.get(m.id) ?? 0) : 0;
  };

  // binder × gradation 笛卡尔积，按 relations 命中数降序取前 5
  const combos = materialSet.binders.flatMap((binder) =>
    materialSet.gradations.map((gradation) => ({
      binder,
      gradation,
      score: hitsOf(binder) + hitsOf(gradation),
    })),
  );
  combos.sort(
    (a, b) =>
      b.score - a.score || a.binder.localeCompare(b.binder, 'zh-CN') || a.gradation.localeCompare(b.gradation, 'zh-CN'),
  );

  // modifier / additive：命中数最高的各取 1（每候选至多各 1）
  const bestOf = (names: string[]) =>
    names
      .map((name) => ({ name, hits: hitsOf(name) }))
      .sort((a, b) => b.hits - a.hits || a.name.localeCompare(b.name, 'zh-CN'))[0]?.name ?? null;
  const bestModifier = bestOf(materialSet.modifiers);
  const bestAdditive = bestOf(materialSet.additives);

  return combos.slice(0, TOP_K_CANDIDATES).map((combo, i) => ({
    id: `cand-${i + 1}`,
    formula: buildFormula(combo.binder, combo.gradation, bestModifier, bestAdditive, scene, byName),
  }));
}

function parseDosage(specs: Record<string, unknown>): number | null {
  const raw = specs['掺量范围'] ?? specs['掺量'];
  if (typeof raw === 'number') return raw;
  if (typeof raw === 'string') {
    const range = raw.match(/(\d+(?:\.\d+)?)\s*[~～\-–]\s*(\d+(?:\.\d+)?)/);
    if (range) return (Number(range[1]) + Number(range[2])) / 2;
    const single = raw.match(/(\d+(?:\.\d+)?)/);
    if (single) return Number(single[1]);
  }
  return null;
}

function buildFormula(
  binderName: string,
  gradationName: string,
  modifierName: string | null,
  additiveName: string | null,
  scene: SceneInput,
  byName: Map<string, MaterialMeta>,
): Formula {
  const specsOf = (name: string | null): Record<string, unknown> => {
    const m = name ? byName.get(name) : undefined;
    return m ? m.specs : {};
  };
  const binderSpecs = specsOf(binderName);
  const modifierSpecs = specsOf(modifierName);
  const additiveSpecs = specsOf(additiveName);

  const grade = Array.isArray(binderSpecs['标号'])
    ? String(binderSpecs['标号'][0])
    : String(binderSpecs['标号'] ?? '');
  const pg = String(
    binderSpecs['PG'] ??
      (scene.climate.pgHigh ? `PG${scene.climate.pgHigh}-${Math.abs(scene.climate.pgLow)}` : ''),
  );

  return FormulaSchema.parse({
    binder: { type: binderName, grade, pg },
    modifier: { type: modifierName ?? '', dosage: parseDosage(modifierSpecs) ?? MODIFIER_DOSAGE_EST },
    gradation: { type: gradationName },
    additives: additiveName
      ? [{ type: additiveName, dosage: parseDosage(additiveSpecs) ?? ADDITIVE_DOSAGE_EST }]
      : [],
    oilStoneRatio: OIL_STONE_RATIO_EST,
    airVoids: AIR_VOIDS_EST,
  });
}

// ---------------------------------------------------------------------------
// ⑤ 确定性排序 + 雷达图（量化红线：LLM 不参与任何数值）
// ---------------------------------------------------------------------------

function normalize(
  dims: string[],
  valueMaps: Array<Map<string, number>>,
  lowerBetter: Set<string>,
): Array<Map<string, number>> {
  const result = valueMaps.map(() => new Map<string, number>());
  for (const dim of dims) {
    const present = valueMaps.map((m) => m.get(dim)).filter((v): v is number => typeof v === 'number');
    if (present.length === 0) continue;
    const min = Math.min(...present);
    const max = Math.max(...present);
    valueMaps.forEach((m, i) => {
      const v = m.get(dim);
      if (typeof v !== 'number') return;
      let norm = max === min ? 0.5 : (v - min) / (max - min);
      if (lowerBetter.has(dim)) norm = 1 - norm;
      result[i].set(dim, norm);
    });
  }
  return result;
}

function toRadar(norm: number | undefined): number {
  if (norm === undefined) return 0;
  return Math.max(0, Math.min(100, Math.round(norm * 100)));
}

function rankCandidates(
  scene: SceneInput,
  assembled: Array<{ id: string; formula: Formula }>,
  predictions: Array<{
    predictions: Array<{ perf: string; value: number; ciLow?: number; ciHigh?: number; unit: string }>;
    explanations?: Array<{ feature: string; contribution: number }>;
  }>,
  targets: TargetProfile,
): Candidate[] {
  // 权重按英文维度聚合（中文 perf 经 PERF_ALIAS 映射）
  const weights: Record<string, number> = {};
  for (const p of targets.priorities) {
    const dim = PERF_ALIAS[p.perf] ?? p.perf;
    weights[dim] = (weights[dim] ?? 0) + p.weight;
  }
  const valueMaps = predictions.map((fp) => {
    const m = new Map<string, number>();
    for (const pred of fp.predictions) m.set(pred.perf, pred.value);
    return m;
  });
  const dims = [...new Set(valueMaps.flatMap((m) => [...m.keys()]))];
  const normMaps = normalize(dims, valueMaps, LOWER_BETTER_DIMS);

  // 环保约束基准：碳排候选集均值（确定性）
  const carbonValues = valueMaps.map((m) => m.get('carbon') ?? 0);
  const avgCarbon = carbonValues.length ? carbonValues.reduce((a, b) => a + b, 0) / carbonValues.length : 0;
  const envStrict = hasAny(scene.constraints.env, ['高', '环保', 'strict', 'high']);

  const candidates = assembled.map((a, i) => {
    const vm = valueMaps[i];
    const nm = normMaps[i];

    let weighted = 0;
    let weightUsed = 0;
    for (const [dim, w] of Object.entries(weights)) {
      const n = nm.get(dim);
      if (n !== undefined) {
        weighted += w * n;
        weightUsed += w;
      }
    }
    const weightedScore = weightUsed > 0 ? weighted / weightUsed : 0;

    // 约束惩罚（确定性规则；假设见注释）
    let penalty = 0;
    const lcc = vm.get('lcc') ?? 0;
    const constructability = vm.get('constructability') ?? 100;
    const carbon = vm.get('carbon') ?? 0;
    if (scene.constraints.budget > 0) {
      // 预算惩罚 = 超出预算比例 × 0.2（LCC 为演示周期估算，万元）
      penalty += (Math.max(0, lcc - scene.constraints.budget) / scene.constraints.budget) * 0.2;
    }
    if (scene.constraints.schedule > 0) {
      // 工期惩罚：施工可行性 < 75 分按差距惩罚
      penalty += (Math.max(0, 75 - constructability) / 100) * 0.1;
    }
    if (envStrict) {
      // 环保惩罚：碳排超候选集均值 5%
      penalty += carbon > avgCarbon ? 0.05 : 0;
    }

    const score = Number((weightedScore - penalty).toFixed(4));
    return CandidateSchema.parse({
      id: a.id,
      formula: a.formula,
      predictions: predictions[i].predictions,
      explanations: predictions[i].explanations,
      radar: {
        highTemp: toRadar(nm.get('highTemp')),
        lowTemp: toRadar(nm.get('lowTemp')),
        fatigue: toRadar(nm.get('fatigue')),
        waterStability: toRadar(nm.get('waterStability')),
        lcc: toRadar(nm.get('lcc')),
        carbon: toRadar(nm.get('carbon')),
        expectedLife: toRadar(nm.get('expectedLife')),
        constructability: toRadar(nm.get('constructability')),
      },
      lcc,
      carbon,
      expectedLife: vm.get('expectedLife') ?? 0,
      score,
      evidenceIds: [],
    });
  });
  return candidates.sort((a, b) => b.score - a.score || a.id.localeCompare(b.id));
}

function hasAny(value: string, keywords: string[]): boolean {
  return keywords.some((k) => value.includes(k));
}

// ---------------------------------------------------------------------------
// ⑥ 证据检索
// ---------------------------------------------------------------------------

async function retrieveEvidence(
  candidates: Candidate[],
  deps: RecommendDeps,
): Promise<{ evidence: EvidenceRef[]; byCandidate: Map<string, string[]>; retrievalWarnings: string[] }> {
  const warnings: string[] = [];
  const evidenceMap = new Map<string, EvidenceRef>();
  const byCandidate = new Map<string, string[]>();
  const texts = candidates.map((c) =>
    [
      c.formula.binder.type,
      c.formula.gradation.type,
      c.formula.modifier.type,
      ...c.formula.additives.map((a) => a.type),
    ]
      .filter(Boolean)
      .join(' '),
  );
  let vectors: number[][] | null = null;
  if (deps.embedder) {
    try {
      vectors = await deps.embedder.embed(texts);
    } catch {
      vectors = null;
    }
  }
  try {
    for (let i = 0; i < candidates.length; i++) {
      const hits = await deps.store.search({
        text: texts[i],
        vector: vectors?.[i],
        topK: EVIDENCE_PER_CANDIDATE,
        filter: { docTypes: ['knowledge', 'standard', 'literature'] },
      });
      const ids: string[] = [];
      for (const h of hits) {
        if (!evidenceMap.has(h.chunkId)) evidenceMap.set(h.chunkId, h);
        ids.push(h.chunkId);
      }
      byCandidate.set(candidates[i].id, ids);
    }
  } catch (err) {
    warnings.push(`证据检索失败：${err instanceof Error ? err.message : String(err)}`);
  }
  return { evidence: [...evidenceMap.values()], byCandidate, retrievalWarnings: warnings };
}

// ---------------------------------------------------------------------------
// 基准对比行（vs 规范查表基线，G6）
// ---------------------------------------------------------------------------

function buildBenchmark(candidates: Candidate[], targets: TargetProfile): BenchmarkRow[] {
  return DIM_META.map(({ dim, label, unit }) => {
    const target = targets.targets.find((t) => PERF_ALIAS[t.perf] === dim || t.perf === dim);
    const row: Record<string, number> = {};
    for (const c of candidates) {
      const pred = c.predictions.find((p) => p.perf === dim);
      if (pred) row[c.id] = pred.value;
    }
    return { label, unit, baseline: target?.value ?? 0, candidates: row };
  });
}
