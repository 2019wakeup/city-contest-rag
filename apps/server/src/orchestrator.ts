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
  ReportSection,
  SceneInput,
  SearchHit,
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
import type { LlmCall, LlmStatus } from './llm/client';
import { buildReportSections, generateReportSection, SECTION_SPECS } from './report/fallback';
import type { ReportBase } from './report/fallback';

export interface EmbedderLike {
  dim: number;
  modelName: string;
  modelVersion: string;
  embed(texts: string[], opts?: { mode?: 'query' | 'passage' }): Promise<number[][]>;
}

export interface RecommendDeps {
  store: VectorStore;
  embedder: EmbedderLike | null;
  relationDb: RelationDb;
  /** 测试注入：fake LLM；缺省走 env 配置（DEEPSEEK_API_KEY/LLM_OFF） */
  llmCall?: LlmCall;
}

/** SSE 流式钩子：每步完成 / 每 section 生成完毕回调（JSON 路由不传即走批量路径） */
export interface RecommendHooks {
  onStep?: (step: StepRecord) => void;
  onSection?: (index: number, section: ReportSection) => void;
}

// ===== 规则估算常量（演示假设，注释即依据）=====
const OIL_STONE_RATIO_EST = 5.5; // 油石比规则估算 5.5%（假设，真实值由配比设计/模块 C 给出）
const AIR_VOIDS_EST = 4.0; // 空隙率规则估算 4.0%（假设）
const MODIFIER_DOSAGE_EST = 4.0; // 改性剂掺量缺省 4.0%（假设）
const ADDITIVE_DOSAGE_EST = 0.3; // 助剂掺量缺省 0.3%（假设）
const TOP_K_CANDIDATES = 5;
// 排序用 min-max 相对归一化的"越低越好"维度（lowTemp 方向修复：低温 PG 越低越抗冻）
const LOWER_BETTER_DIMS = new Set(['lcc', 'carbon', 'lowTemp']);

/**
 * 雷达图绝对基准锚点（UI#13）：演示锚点，接入真实模块 C 后按企业数据校准。
 * lowTemp 写法 min=-10 / max=-40 为反向区间（越低越好，-40℃ 抗冻最强 → 满分）。
 */
export interface RadarAnchor {
  min: number;
  max: number;
  lowerBetter: boolean;
}

export const RADAR_ANCHORS: Record<string, RadarAnchor> = {
  highTemp: { min: 70, max: 90, lowerBetter: false }, // ℃，越高越好
  lowTemp: { min: -10, max: -40, lowerBetter: true }, // ℃，越低越好
  fatigue: { min: 60, max: 100, lowerBetter: false }, // 万次
  waterStability: { min: 70, max: 100, lowerBetter: false }, // %
  lcc: { min: 80, max: 200, lowerBetter: true }, // 万元，越低越好
  carbon: { min: 40, max: 80, lowerBetter: true }, // tCO2e，越低越好
  expectedLife: { min: 8, max: 20, lowerBetter: false }, // 年
  constructability: { min: 60, max: 100, lowerBetter: false }, // 分
};

/** 原始预测值 → 绝对锚点 0-100 分（clamp；lowerBetter 反向；min>max 表示反向区间） */
export function toRadarAbsolute(raw: number | undefined, anchor: RadarAnchor): number {
  if (raw === undefined || Number.isNaN(raw)) return 0;
  const lo = Math.min(anchor.min, anchor.max);
  const hi = Math.max(anchor.min, anchor.max);
  const span = hi - lo;
  if (span === 0) return 50;
  const t = (raw - lo) / span; // 越靠近 hi 越大
  const norm = anchor.lowerBetter ? 1 - t : t; // 越低越好 → 越靠近 lo 分越高
  return Math.max(0, Math.min(100, Math.round(norm * 100)));
}

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
  { dim: 'fatigue', label: '疲劳性能', unit: '万次' }, // B1：量纲全局统一
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
export async function recommend(
  scene: SceneInput,
  deps: RecommendDeps,
  hooks?: RecommendHooks,
): Promise<RecommendationReport> {
  const steps: StepRecord[] = [];
  const startedAt = performance.now();
  let lastMarkAt = startedAt;
  const mark = (name: string) => {
    // B4：ms 为与上一步的差值（第一步距 start），各步之和 ≈ 总时长
    const now = performance.now();
    const step: StepRecord = { name, ms: Math.round(now - lastMarkAt) };
    lastMarkAt = now;
    steps.push(step);
    hooks?.onStep?.(step);
  };

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

  // ⑥ 证据检索（R1/R2/R6：差异化查询 + 足量 + 集合互异 + 文献参与）+ 报告文案 + 组装
  const { evidence, byCandidate, retrievalWarnings, queries, slotSources } = await retrieveEvidence(
    ranked,
    parsedScene,
    targets,
    deps,
  );
  for (const cand of ranked) {
    cand.evidenceIds = byCandidate.get(cand.id) ?? [];
  }
  const warnings = [...retrievalWarnings];
  if (evidence.length === 0) {
    warnings.push('知识库暂无内容，请先在知识库管理页导入资料（或联系维护者重建索引）');
  }
  const base: ReportBase = {
    scene: parsedScene,
    targets,
    candidates: ranked,
    evidence,
    benchmark: buildBenchmark(ranked, targets),
  };

  // 流式模式（hooks.onSection）：每 section 一次 LLM 调用并即时回调；JSON 模式：批量一次调用。
  let sections: ReportSection[];
  let llmStatus: LlmStatus;
  if (hooks?.onSection) {
    const built: ReportSection[] = [];
    let allFromLlm = true;
    const usedSectionIds = new Set<string>(); // R4：跨节证据去重
    for (let i = 0; i < SECTION_SPECS.length; i++) {
      const { section, fromLlm } = await generateReportSection(base, i, deps.llmCall, usedSectionIds);
      if (!fromLlm) allFromLlm = false;
      built.push(section);
      hooks.onSection(i, section);
    }
    sections = built;
    llmStatus = allFromLlm ? 'ok' : 'degraded';
  } else {
    const sectionsWithStatus = await buildReportSections(base, deps.llmCall);
    sections = [...sectionsWithStatus];
    llmStatus = sectionsWithStatus.llmStatus;
  }
  // 报告生成阶段耗时须计入 steps（spec §8 六步：解析→映射→召回→预测→排序→报告）
  mark('report');
  const report = RecommendationReportSchema.parse({
    schemaVersion: '1',
    ...base,
    sections,
    charts: {},
    llmStatus,
    adapterMode: { a: adapterModeA, c: adapterModeC },
    warnings,
    steps,
    // R6 调试/验收透出（passthrough 字段，契约不变）：候选查询文本与各槽来源查询序号
    evidenceQueries: queries,
    evidenceSlotSources: slotSources,
  });
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
  // cases.json/注册表英文取值映射（env: strict/high；noise: strict/low-noise/low/high）
  const env = scene.constraints.env.toLowerCase();
  const noise = scene.constraints.noise.toLowerCase();
  if (env === 'strict' || env === 'high') tags.add('k-env');
  if (['strict', 'low-noise', 'low', 'high'].includes(noise)) tags.add('k-noise-ctl');
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

  // modifier / additive：按场景匹配数降序，逐候选轮转分配（R3-C1：消除"全局唯一最优"，
  // 对齐 binder×gradation 的场景敏感排序；每候选至多各 1）
  const rankedOf = (names: string[]) =>
    names
      .map((name) => ({ name, hits: hitsOf(name) }))
      .sort((a, b) => b.hits - a.hits || a.name.localeCompare(b.name, 'zh-CN'));
  const rankedModifiers = rankedOf(materialSet.modifiers);
  const rankedAdditives = rankedOf(materialSet.additives);

  return combos.slice(0, TOP_K_CANDIDATES).map((combo, i) => ({
    id: `cand-${i + 1}`,
    formula: buildFormula(
      combo.binder,
      combo.gradation,
      rankedModifiers.length > 0 ? rankedModifiers[i % rankedModifiers.length].name : null,
      rankedAdditives.length > 0 ? rankedAdditives[i % rankedAdditives.length].name : null,
      scene,
      byName,
    ),
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
        // UI#13：雷达展示用绝对锚点分（排序加权仍用 min-max 相对 normMaps，不变）
        highTemp: toRadarAbsolute(vm.get('highTemp'), RADAR_ANCHORS.highTemp),
        lowTemp: toRadarAbsolute(vm.get('lowTemp'), RADAR_ANCHORS.lowTemp),
        fatigue: toRadarAbsolute(vm.get('fatigue'), RADAR_ANCHORS.fatigue),
        waterStability: toRadarAbsolute(vm.get('waterStability'), RADAR_ANCHORS.waterStability),
        lcc: toRadarAbsolute(vm.get('lcc'), RADAR_ANCHORS.lcc),
        carbon: toRadarAbsolute(vm.get('carbon'), RADAR_ANCHORS.carbon),
        expectedLife: toRadarAbsolute(vm.get('expectedLife'), RADAR_ANCHORS.expectedLife),
        constructability: toRadarAbsolute(vm.get('constructability'), RADAR_ANCHORS.constructability),
      },
      lcc,
      carbon,
      expectedLife: vm.get('expectedLife') ?? 0,
      score,
      evidenceIds: [],
    });
  });
  candidates.sort((a, b) => b.score - a.score || a.id.localeCompare(b.id));
  // B3：排序完成后按名次重编号（第一名=cand-1），benchmark 列头/evidence 映射/报告 prompt 指代自动跟随
  candidates.forEach((c, i) => {
    c.id = `cand-${i + 1}`;
  });
  return candidates;
}

function hasAny(value: string, keywords: string[]): boolean {
  return keywords.some((k) => value.includes(k));
}

// ---------------------------------------------------------------------------
// ⑥ 证据检索（R1/R2/R6：差异化查询 + 足量 + 集合互异 + 文献参与）
// ---------------------------------------------------------------------------

const EVIDENCE_FETCH_K = 12; // R6-1：每候选先取 12 再挑选
const EVIDENCE_SLOTS = 3;
const GLOBAL_CHUNK_LIMIT = 3; // R6-1：同 chunk 全局最多出现在 3 个候选
const MAX_KNOWLEDGE_PER_CANDIDATE = 2; // 知识 ≤2
const MAX_STANDARD_PER_CANDIDATE = 1; // P0-B2：标准 ≤1
const MAX_TABLE_PER_CANDIDATE = 1; // P0-B2：表格 ≤1（定量命中优先占槽）
const MAX_LIT_FAMILY_PER_CANDIDATE = 2; // P0-B2：文献题录+章节全文 1–2 条
const LIT_FAMILY_TYPES: ReadonlySet<string> = new Set(['literature', 'literature-full']);
const ALL_EVIDENCE_DOC_TYPES = [
  'knowledge',
  'standard',
  'literature',
  'enterprise',
  'table',
  'literature-full',
] as const;
const LIT_OR_STD_DOC_TYPES = ['literature', 'standard'] as const;
const LITFULL_PREFIX = 'litfull-'; // S1：旧 litfull- 前缀题录块（docType=literature）属噪声，证据链排除

/** S1/P0-B2：旧 litfull- 前缀块（docType=literature）排除；新 docType literature-full 章节块不受影响（id 前缀不同） */
function isLegacyLitfull(h: SearchHit): boolean {
  return h.docType === 'literature' && h.chunkId.startsWith(LITFULL_PREFIX);
}

/** P0-B2：table/literature-full 的 docId 各自独立（复合键），其余 docType 共享每候选 docId 唯一性 */
function docKeyOf(h: SearchHit): string {
  return h.docType === 'table' || h.docType === 'literature-full'
    ? `${h.docType}:${h.provenance.sourceDocId}`
    : h.provenance.sourceDocId;
}

/** 病害类型 → 中文检索词（cases.json/注册表 slug 对齐） */
const DISTRESS_CN: Record<string, string> = {
  rutting: '车辙',
  shoving: '推移拥包',
  'transverse-crack': '横向裂缝',
  'longitudinal-crack': '纵向裂缝',
  'fatigue-crack': '疲劳裂缝',
  'water-damage': '水损害',
  raveling: '松散剥落',
  pothole: '坑槽',
  skid: '抗滑不足',
  noise: '交通噪声',
};

/** 雷达维度 → 中文检索词 */
const RADAR_DIM_CN: Record<string, string> = {
  highTemp: '高温',
  lowTemp: '低温',
  fatigue: '疲劳',
  waterStability: '水稳',
  lcc: 'LCC',
  carbon: '碳排',
  expectedLife: '寿命',
  constructability: '施工',
};

function buildSceneWords(scene: SceneInput): string {
  return [
    scene.climate.zone,
    scene.traffic.level,
    ...scene.distresses.map((d) => DISTRESS_CN[d.type] ?? d.type),
    scene.constraints.env,
    scene.constraints.noise,
  ]
    .filter(Boolean)
    .join(' ');
}

/** R6-3：候选查询三段——①场景词 ②配方全字段（含掺量数值）③该候选 Top1 雷达维中文名
 * （并列取权重最高者；无第一取最强且不同于其他候选的维度）。 */
function buildCandidateQuery(
  scene: SceneInput,
  cand: Candidate,
  targets: TargetProfile,
  usedDims: Set<string>,
): string {
  const sceneWords = buildSceneWords(scene);
  const f = cand.formula;
  const formulaWords = [
    f.binder.type,
    f.binder.grade,
    f.binder.pg,
    f.modifier.type ? `${f.modifier.type}${f.modifier.dosage}%` : '',
    f.gradation.type,
    ...f.additives.map((a) => `${a.type}${a.dosage}%`),
  ]
    .filter(Boolean)
    .join(' ');
  const dimCn = topDimCnOf(cand, targets, usedDims);
  return `${sceneWords} ${formulaWords} ${dimCn}`.trim();
}

/** 该候选 Top1 雷达维度中文名（并列取权重最高者；无第一取最强且不同于其他候选者） */
function topDimCnOf(cand: Candidate, targets: TargetProfile, usedDims: Set<string>): string {
  const dimWeights: Record<string, number> = {};
  for (const p of targets.priorities) {
    const d = PERF_ALIAS[p.perf];
    if (d) dimWeights[d] = (dimWeights[d] ?? 0) + p.weight;
  }
  const radarDims = (Object.entries(cand.radar) as Array<[string, number]>).filter(
    ([d]) => RADAR_DIM_CN[d] !== undefined,
  );
  if (radarDims.length === 0) return '';
  const topScore = Math.max(...radarDims.map(([, v]) => v));
  let dim: string;
  const ties = radarDims.filter(([, v]) => v === topScore).map(([d]) => d);
  if (ties.length === 1) {
    dim = ties[0];
  } else {
    dim = ties.slice().sort((a, b) => (dimWeights[b] ?? 0) - (dimWeights[a] ?? 0))[0];
  }
  if (!dim) {
    const ranked = radarDims.slice().sort((a, b) => b[1] - a[1]).map(([d]) => d);
    dim = ranked.find((d) => !usedDims.has(d)) ?? ranked[0];
  }
  usedDims.add(dim);
  return RADAR_DIM_CN[dim];
}

/**
 * R2/R6/P0-B2 挑选：未被其他候选使用的命中优先（组内保持相关度顺序）。
 * 配额：知识 ≤2、标准 ≤1、表格 ≤1（定量命中优先占槽）、文献家族（literature+literature-full）1–2
 * 且题录 lit-* 优先、chunk 全局 ≤3、docId 每候选 ≤1（table/literature-full 各自独立）。
 * S1：旧 litfull- 前缀（docType=literature）排除；新 docType literature-full 不受影响。
 */
export function selectCandidateHits(
  hits: SearchHit[],
  globalChunkCount: Map<string, number>,
  othersUsed: Set<string>,
): SearchHit[] {
  const ordered = [...hits].sort(
    (a, b) => (othersUsed.has(a.chunkId) ? 1 : 0) - (othersUsed.has(b.chunkId) ? 1 : 0),
  );
  const chosen: SearchHit[] = [];
  const seenDocKeys = new Set<string>();
  let knowledgeCount = 0;
  let standardCount = 0;
  let tableCount = 0;
  let litFamilyCount = 0;

  const tryPush = (h: SearchHit): boolean => {
    if (chosen.length >= EVIDENCE_SLOTS) return false;
    if (isLegacyLitfull(h)) return false;
    if ((globalChunkCount.get(h.chunkId) ?? 0) >= GLOBAL_CHUNK_LIMIT) return false;
    const docKey = docKeyOf(h);
    if (seenDocKeys.has(docKey)) return false;
    if (h.docType === 'knowledge' && knowledgeCount >= MAX_KNOWLEDGE_PER_CANDIDATE) return false;
    if (h.docType === 'standard' && standardCount >= MAX_STANDARD_PER_CANDIDATE) return false;
    if (h.docType === 'table' && tableCount >= MAX_TABLE_PER_CANDIDATE) return false;
    if (LIT_FAMILY_TYPES.has(h.docType) && litFamilyCount >= MAX_LIT_FAMILY_PER_CANDIDATE) return false;
    chosen.push(h);
    seenDocKeys.add(docKey);
    globalChunkCount.set(h.chunkId, (globalChunkCount.get(h.chunkId) ?? 0) + 1);
    if (h.docType === 'knowledge') knowledgeCount += 1;
    if (h.docType === 'standard') standardCount += 1;
    if (h.docType === 'table') tableCount += 1;
    if (LIT_FAMILY_TYPES.has(h.docType)) litFamilyCount += 1;
    return true;
  };

  // 优先序（P0-B2）：题录文献 → 表格（定量优先占槽）→ 文献章节全文（补充）→ 其余
  for (const h of ordered) if (h.docType === 'literature' && !isLegacyLitfull(h)) tryPush(h);
  for (const h of ordered) if (h.docType === 'table') tryPush(h);
  for (const h of ordered) if (h.docType === 'literature-full') tryPush(h);
  for (const h of ordered) tryPush(h);
  return chosen;
}

function setsEqual(a: Set<string>, b: Set<string>): boolean {
  return a.size === b.size && [...a].every((x) => b.has(x));
}

interface EvidenceRetrievalResult {
  evidence: EvidenceRef[];
  byCandidate: Map<string, string[]>;
  retrievalWarnings: string[];
  queries: string[];
  slotSources: number[][];
}

async function retrieveEvidence(
  candidates: Candidate[],
  scene: SceneInput,
  targets: TargetProfile,
  deps: RecommendDeps,
): Promise<EvidenceRetrievalResult> {
  const warnings: string[] = [];
  const evidenceMap = new Map<string, EvidenceRef>();
  const byCandidate = new Map<string, string[]>();
  const globalChunkCount = new Map<string, number>();
  const othersUsed = new Set<string>();
  const chosenSets: Set<string>[] = [];
  const pool: SearchHit[] = [];
  const queries: string[] = [];
  const slotSources: number[][] = [];
  const usedDims = new Set<string>();

  const sceneQueryText = buildSceneWords(scene);
  const primaryTexts = candidates.map((c) => buildCandidateQuery(scene, c, targets, usedDims));

  const searchOne = async (
    text: string,
    topK: number,
    docTypes?: string[],
  ): Promise<SearchHit[]> => {
    let vector: number[] | undefined;
    if (deps.embedder) {
      try {
        vector = (await deps.embedder.embed([text], { mode: 'query' }))[0];
      } catch {
        vector = undefined;
      }
    }
    return deps.store.search({
      text,
      vector,
      topK,
      filter: docTypes ? { docTypes } : undefined,
    });
  };

  try {
    for (let i = 0; i < candidates.length; i++) {
      const cand = candidates[i];
      queries.push(primaryTexts[i]);

      // 候选内挑选状态（B2 配额同 selectCandidateHits）
      const chosen: Array<{ hit: SearchHit; queryIndex: number }> = [];
      const seenDocKeys = new Set<string>();
      let knowledgeCount = 0;
      let standardCount = 0;
      let tableCount = 0;
      let litFamilyCount = 0;
      const canTake = (h: SearchHit): boolean => {
        if (chosen.length >= EVIDENCE_SLOTS) return false;
        if (isLegacyLitfull(h)) return false;
        if ((globalChunkCount.get(h.chunkId) ?? 0) >= GLOBAL_CHUNK_LIMIT) return false;
        if (seenDocKeys.has(docKeyOf(h))) return false;
        if (h.docType === 'knowledge' && knowledgeCount >= MAX_KNOWLEDGE_PER_CANDIDATE) return false;
        if (h.docType === 'standard' && standardCount >= MAX_STANDARD_PER_CANDIDATE) return false;
        if (h.docType === 'table' && tableCount >= MAX_TABLE_PER_CANDIDATE) return false;
        if (LIT_FAMILY_TYPES.has(h.docType) && litFamilyCount >= MAX_LIT_FAMILY_PER_CANDIDATE) return false;
        return true;
      };
      const take = (h: SearchHit, queryIndex: number): boolean => {
        if (!canTake(h)) return false;
        chosen.push({ hit: h, queryIndex });
        seenDocKeys.add(docKeyOf(h));
        globalChunkCount.set(h.chunkId, (globalChunkCount.get(h.chunkId) ?? 0) + 1);
        if (h.docType === 'knowledge') knowledgeCount += 1;
        if (h.docType === 'standard') standardCount += 1;
        if (h.docType === 'table') tableCount += 1;
        if (LIT_FAMILY_TYPES.has(h.docType)) litFamilyCount += 1;
        return true;
      };
      const takeBack = (idx: number): void => {
        const old = chosen[idx];
        globalChunkCount.set(old.hit.chunkId, Math.max(0, (globalChunkCount.get(old.hit.chunkId) ?? 1) - 1));
        seenDocKeys.delete(docKeyOf(old.hit));
        if (old.hit.docType === 'knowledge') knowledgeCount -= 1;
        if (old.hit.docType === 'standard') standardCount -= 1;
        if (old.hit.docType === 'table') tableCount -= 1;
        if (LIT_FAMILY_TYPES.has(old.hit.docType)) litFamilyCount -= 1;
      };

      // 主查询（queryIndex 0）：未被他人使用的命中优先 + B2 优先序
      const primaryHits = await searchOne(primaryTexts[i], EVIDENCE_FETCH_K, [...ALL_EVIDENCE_DOC_TYPES]);
      pool.push(...primaryHits);
      const orderedPrimary = [...primaryHits].sort(
        (a, b) => (othersUsed.has(a.chunkId) ? 1 : 0) - (othersUsed.has(b.chunkId) ? 1 : 0),
      );
      for (const h of orderedPrimary) if (h.docType === 'literature' && !isLegacyLitfull(h)) take(h, 0);
      for (const h of orderedPrimary) if (h.docType === 'table') take(h, 0);
      for (const h of orderedPrimary) if (h.docType === 'literature-full') take(h, 0);
      for (const h of orderedPrimary) take(h, 0);

      // R6-1：第二查询 = 纯场景查询（病害+气候+荷载，不带候选材料）
      if (chosen.length < EVIDENCE_SLOTS) {
        const sceneHits = await searchOne(sceneQueryText, EVIDENCE_FETCH_K, [...ALL_EVIDENCE_DOC_TYPES]);
        pool.push(...sceneHits);
        for (const h of sceneHits) {
          if (chosen.length >= EVIDENCE_SLOTS) break;
          take(h, 1);
        }
      }

      // R6-1：仍不足 → 从全候选池按相关度补（queryIndex 2）
      if (chosen.length < EVIDENCE_SLOTS) {
        const poolSorted = [...pool].sort(
          (a, b) => b.score - a.score || a.chunkId.localeCompare(b.chunkId),
        );
        for (const h of poolSorted) {
          if (chosen.length >= EVIDENCE_SLOTS) break;
          take(h, 2);
        }
      }

      // R6-4：无文献/规范/表格 → 「维度+文献类」二次查询，替换 1 条知识槽（queryIndex 3）
      const hasQuantitative = chosen.some((c) =>
        [...LIT_OR_STD_DOC_TYPES, 'table', 'literature-full'].includes(c.hit.docType),
      );
      if (!hasQuantitative) {
        const dimCn = topDimCnOf(cand, targets, usedDims) || '高温';
        const litHits = await searchOne(`${dimCn} ${sceneQueryText}`, 8, [
          ...LIT_OR_STD_DOC_TYPES,
          'table',
          'literature-full',
        ]);
        pool.push(...litHits);
        const replaceIdx = chosen
          .map((c) => c.hit.docType)
          .lastIndexOf('knowledge');
        for (const h of litHits) {
          if (replaceIdx < 0) break;
          if (isLegacyLitfull(h)) continue;
          if ((globalChunkCount.get(h.chunkId) ?? 0) >= GLOBAL_CHUNK_LIMIT) continue;
          if (seenDocKeys.has(docKeyOf(h))) continue;
          if (h.docType === 'literature' && litFamilyCount >= MAX_LIT_FAMILY_PER_CANDIDATE) continue;
          if (h.docType === 'literature-full' && litFamilyCount >= MAX_LIT_FAMILY_PER_CANDIDATE) continue;
          if (h.docType === 'standard' && standardCount >= MAX_STANDARD_PER_CANDIDATE) continue;
          if (h.docType === 'table' && tableCount >= MAX_TABLE_PER_CANDIDATE) continue;
          takeBack(replaceIdx);
          chosen[replaceIdx] = { hit: h, queryIndex: 3 };
          seenDocKeys.add(docKeyOf(h));
          globalChunkCount.set(h.chunkId, (globalChunkCount.get(h.chunkId) ?? 0) + 1);
          if (h.docType === 'standard') standardCount += 1;
          if (h.docType === 'table') tableCount += 1;
          if (LIT_FAMILY_TYPES.has(h.docType)) litFamilyCount += 1;
          break;
        }
      }

      // R6-2：与先前候选集合完全相同 → 替换 1 条为未用命中
      const mySet = new Set(chosen.map((c) => c.hit.chunkId));
      for (const prev of chosenSets) {
        if (setsEqual(prev, mySet)) {
          const lastIdx = chosen.length - 1;
          const replacement = [...pool]
            .sort((a, b) => b.score - a.score || a.chunkId.localeCompare(b.chunkId))
            .find((h) => {
              if (mySet.has(h.chunkId)) return false;
              if (isLegacyLitfull(h)) return false;
              if ((globalChunkCount.get(h.chunkId) ?? 0) >= GLOBAL_CHUNK_LIMIT) return false;
              if (seenDocKeys.has(docKeyOf(h))) return false;
              if (h.docType === 'knowledge' && knowledgeCount >= MAX_KNOWLEDGE_PER_CANDIDATE) return false;
              if (h.docType === 'standard' && standardCount >= MAX_STANDARD_PER_CANDIDATE) return false;
              if (h.docType === 'table' && tableCount >= MAX_TABLE_PER_CANDIDATE) return false;
              if (LIT_FAMILY_TYPES.has(h.docType) && litFamilyCount >= MAX_LIT_FAMILY_PER_CANDIDATE) return false;
              return true;
            });
          if (replacement) {
            const oldHit = chosen[lastIdx].hit;
            takeBack(lastIdx);
            chosen[lastIdx] = { hit: replacement, queryIndex: 2 };
            seenDocKeys.add(docKeyOf(replacement));
            globalChunkCount.set(replacement.chunkId, (globalChunkCount.get(replacement.chunkId) ?? 0) + 1);
            if (replacement.docType === 'knowledge') knowledgeCount += 1;
            if (replacement.docType === 'standard') standardCount += 1;
            if (replacement.docType === 'table') tableCount += 1;
            if (LIT_FAMILY_TYPES.has(replacement.docType)) litFamilyCount += 1;
            mySet.delete(oldHit.chunkId);
            mySet.add(replacement.chunkId);
          }
          break;
        }
      }
      chosenSets.push(new Set(chosen.map((c) => c.hit.chunkId)));

      const ids = chosen.map((c) => c.hit.chunkId);
      for (const c of chosen) {
        if (!evidenceMap.has(c.hit.chunkId)) evidenceMap.set(c.hit.chunkId, c.hit);
      }
      for (const id of ids) othersUsed.add(id);
      byCandidate.set(cand.id, ids);
      slotSources.push(chosen.map((c) => c.queryIndex));
    }
  } catch (err) {
    warnings.push(`证据检索失败：${err instanceof Error ? err.message : String(err)}`);
  }
  return { evidence: [...evidenceMap.values()], byCandidate, retrievalWarnings: warnings, queries, slotSources };
}

// ---------------------------------------------------------------------------
// 基准对比行（vs 规范查表基线，G6）
// ---------------------------------------------------------------------------

function buildBenchmark(candidates: Candidate[], targets: TargetProfile): BenchmarkRow[] {
  // R3-C1：基准行只覆盖 mock A 输出的目标子集（baseline 来自 targets，缺失维度无对比意义）
  return DIM_META.filter(({ dim }) =>
    targets.targets.some((t) => PERF_ALIAS[t.perf] === dim || t.perf === dim),
  ).map(({ dim, label, unit }) => {
    const target = targets.targets.find((t) => PERF_ALIAS[t.perf] === dim || t.perf === dim);
    const row: Record<string, number> = {};
    for (const c of candidates) {
      const pred = c.predictions.find((p) => p.perf === dim);
      if (pred) row[c.id] = pred.value;
    }
    return { label, unit, baseline: target?.value ?? 0, candidates: row };
  });
}
