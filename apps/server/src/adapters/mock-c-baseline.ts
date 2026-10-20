import { ExplanationSchema, FormulaPredictionSchema, LabIndicatorSchema } from '@road-rec/contracts';
import type { Explanation, Formula, FormulaPrediction, LabIndicator, Prediction } from '@road-rec/contracts';

/**
 * ===== 模拟数据（模块 C mock）=====
 * 配方-性能基准表（演示用，非真实测量）+ mulberry32(seed=42) 固定扰动，
 * 保证同一输入逐位可复现。8 维：高温/低温/疲劳/水稳/LCC/碳排/预期寿命/施工可行性。
 */

export const C_DIMS = [
  'highTemp',
  'lowTemp',
  'fatigue',
  'waterStability',
  'lcc',
  'carbon',
  'expectedLife',
  'constructability',
] as const;

export type CDim = (typeof C_DIMS)[number];

export interface CBaseline {
  highTemp: number;
  lowTemp: number;
  fatigue: number;
  waterStability: number;
  lcc: number;
  carbon: number;
  expectedLife: number;
  constructability: number;
}

const UNITS: Record<CDim, string> = {
  highTemp: '℃',
  lowTemp: '℃',
  fatigue: '万次', // B1：疲劳量纲全局统一为万次（与 mock A 目标、雷达锚点一致）
  waterStability: '%',
  lcc: '万元',
  carbon: 'tCO2e',
  expectedLife: '年',
  constructability: '分',
};

// 键不带空格，匹配时归一化
const BINDER_BASELINE: Record<string, CBaseline> = {
  基质沥青: { highTemp: 64, lowTemp: -22, fatigue: 60, waterStability: 70, lcc: 100, carbon: 40, expectedLife: 8, constructability: 90 },
  SBS改性沥青: { highTemp: 82, lowTemp: -28, fatigue: 80, waterStability: 85, lcc: 135, carbon: 52, expectedLife: 12, constructability: 80 },
  SBR改性沥青: { highTemp: 70, lowTemp: -34, fatigue: 75, waterStability: 80, lcc: 125, carbon: 48, expectedLife: 11, constructability: 80 },
  橡胶粉改性沥青: { highTemp: 76, lowTemp: -32, fatigue: 85, waterStability: 82, lcc: 120, carbon: 45, expectedLife: 13, constructability: 75 },
  高粘高弹改性沥青: { highTemp: 78, lowTemp: -30, fatigue: 85, waterStability: 88, lcc: 150, carbon: 58, expectedLife: 12, constructability: 72 },
  环氧沥青: { highTemp: 90, lowTemp: -25, fatigue: 70, waterStability: 92, lcc: 260, carbon: 70, expectedLife: 15, constructability: 55 },
  岩沥青改性沥青: { highTemp: 74, lowTemp: -24, fatigue: 72, waterStability: 78, lcc: 115, carbon: 46, expectedLife: 10, constructability: 78 },
  硬质沥青: { highTemp: 72, lowTemp: -18, fatigue: 65, waterStability: 75, lcc: 105, carbon: 42, expectedLife: 10, constructability: 82 },
};

const DEFAULT_BINDER: CBaseline = {
  highTemp: 70,
  lowTemp: -22,
  fatigue: 65,
  waterStability: 75,
  lcc: 120,
  carbon: 50,
  expectedLife: 10,
  constructability: 80,
};

type Delta = Partial<CBaseline>;

const MODIFIER_DELTA: Record<string, Delta> = {
  SBS: { highTemp: 4, lcc: 10 },
  橡胶粉: { lowTemp: -3, fatigue: 5, carbon: -5 },
  SBR: { lowTemp: -4 },
  高模量剂: { highTemp: 5, fatigue: 3 },
  抗车辙剂: { highTemp: 5 },
  温拌剂: { lcc: -5, carbon: -6 },
  环氧: { highTemp: 6, waterStability: 5 },
};

const GRADATION_DELTA: Record<string, Delta> = {
  'SMA-13': { highTemp: 3, waterStability: 5, lcc: 10 },
  'AC-13': {},
  'OGFC-13': { waterStability: 8, constructability: -5, lcc: 8 },
  中面层: { highTemp: 2, fatigue: 4 },
};

const ADDITIVE_DELTA: Record<string, Delta> = {
  木质素纤维: { fatigue: 3 },
  抗剥落剂: { waterStability: 5 },
  玄武岩纤维: { fatigue: 5, lcc: 6 },
};

/** mulberry32：确定性伪随机（seed=42 固定，演示可复现） */
export function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function norm(s: string): string {
  return s.replace(/\s+/g, '');
}

function composeBaseline(f: Formula): CBaseline {
  const base = { ...(BINDER_BASELINE[norm(f.binder.type)] ?? DEFAULT_BINDER) };
  const apply = (delta: Delta | undefined) => {
    if (!delta) return;
    for (const key of Object.keys(delta) as Array<keyof CBaseline>) {
      const d = delta[key];
      if (typeof d === 'number') base[key] += d;
    }
  };
  apply(MODIFIER_DELTA[norm(f.modifier.type)]);
  apply(GRADATION_DELTA[norm(f.gradation.type)]);
  for (const a of f.additives) apply(ADDITIVE_DELTA[norm(a.type)]);
  return base;
}

export function mockPredictFormulas(formulas: Formula[]): FormulaPrediction[] {
  const rand = mulberry32(42);
  const built = formulas.map((f) => {
    const base = composeBaseline(f);
    const predictions = C_DIMS.map((dim) => {
      // 固定 seed 扰动 ±3%；置信区间 ±5%|value|（B2：负值维度如低温 -28 → -29.4 ~ -26.6，保证 low ≤ high）
      const value = Number((base[dim] * (1 + (rand() - 0.5) * 0.06)).toFixed(2));
      const margin = Math.abs(value) * 0.05;
      return {
        perf: dim,
        value,
        ciLow: Number((value - margin).toFixed(2)),
        ciHigh: Number((value + margin).toFixed(2)),
        unit: UNITS[dim],
      };
    });
    // C2：11 项实测指标（与决策维同一 seed 流、同一扰动序列，保持相关性）
    const labIndicators = generateLabIndicators(base, f, rand);
    return { f, predictions, labIndicators };
  });

  // V2：特征贡献（模拟阶段确定性生成）——合计 ≈ 该候选得分偏离候选均值的量
  const lists = built.map((b) => b.predictions);
  const comps = lists.map((list) => compositeOfLists(lists, list));
  const meanComp = comps.length ? comps.reduce((a, b) => a + b, 0) / comps.length : 0;

  return built.map((b, i) => {
    const features = extractFormulaFeatures(b.f);
    const explanations = generateExplanations(features, comps[i] - meanComp, rand);
    return FormulaPredictionSchema.parse({
      formula: b.f,
      predictions: b.predictions,
      labIndicators: b.labIndicators.map((l) => LabIndicatorSchema.parse(l)),
      explanations,
    });
  });
}

/** V2：候选得分 = 8 维归一化均值（lower-better 反向），与特征贡献合计同口径 */
const LOWER_BETTER_DIMS: ReadonlySet<string> = new Set(['lcc', 'carbon']);

function compositeOfLists(lists: Prediction[][], list: Prediction[]): number {
  let sum = 0;
  let count = 0;
  for (const dim of C_DIMS) {
    const vals = lists.map((l) => l.find((p) => p.perf === dim)?.value ?? 0);
    const min = Math.min(...vals);
    const max = Math.max(...vals);
    const v = list.find((p) => p.perf === dim)?.value ?? 0;
    const span = max - min || 1;
    sum += LOWER_BETTER_DIMS.has(dim) ? (max - v) / span : (v - min) / span;
    count += 1;
  }
  return count ? sum / count : 0;
}

/** V2：配方特征（沥青类型/改性剂/掺剂/级配/油石比/空隙率），最多 6 条 */
function extractFormulaFeatures(f: Formula): string[] {
  const features: string[] = [];
  features.push(`沥青类型：${f.binder.type}`);
  if (f.modifier.type) features.push(`改性剂：${f.modifier.type}`);
  features.push(`级配：${f.gradation.type}`);
  for (const a of f.additives) features.push(`掺剂：${a.type}`);
  features.push(`油石比：${f.oilStoneRatio}%`);
  features.push(`空隙率：${f.airVoids}%`);
  return features;
}

/**
 * V2：特征贡献分配——前 k-2 项按 seed 权重分摊 target，末两项 ±δ 保证正负并存；
 * 合计 ≈ target（rounding ≤ 0.001）。明确为模拟阶段确定性生成（非真实 SHAP）。
 */
function generateExplanations(
  features: string[],
  target: number,
  rand: () => number,
): Explanation[] {
  const k = Math.min(features.length, 6);
  const chosen = features.slice(0, k);
  const shares: number[] = [];
  for (let i = 0; i < k - 2; i++) shares.push(rand());
  const wsum = shares.reduce((a, b) => a + b, 0) || 1;
  const delta = 0.02 * Math.max(Math.abs(target), 0.05);
  const contributions: number[] = shares.map((s) => Number(((target * s) / wsum).toFixed(4)));
  contributions.push(Number(delta.toFixed(4)), Number((-delta).toFixed(4)));
  return chosen.map((feature, i) => ExplanationSchema.parse({ feature, contribution: contributions[i] }));
}

// ---------------------------------------------------------------------------
// C2：11 项企业实测指标（确定性 seed；TSR 内部 0-1 比值 ×100 输出 %）
// 映射（与决策维单调相关，供单测/反推）：DS↔highTemp、bendingStrain↔lowTemp、
// tsr/retainedStability↔waterStability、ms↔constructability、bendingModulus/tensileStrength↔lowTemp。
// ---------------------------------------------------------------------------

export const LAB_INDICATOR_SPECS: Array<{
  key: string;
  label: string;
  group: LabIndicator['group'];
  unit: LabIndicator['unit'];
  threshold?: { min?: number; max?: number };
  sampleSize: number;
}> = [  { key: 'vv', label: '空隙率', group: 'volume', unit: '%', threshold: { min: 3, max: 6 }, sampleSize: 116 },
  { key: 'vma', label: '矿料间隙率', group: 'volume', unit: '%', threshold: { min: 14 }, sampleSize: 116 },
  { key: 'vfa', label: '沥青饱和度', group: 'volume', unit: '%', threshold: { min: 65, max: 75 }, sampleSize: 116 },
  { key: 'ms', label: '马歇尔稳定度', group: 'marshall', unit: 'kN', threshold: { min: 8 }, sampleSize: 116 },
  { key: 'fl', label: '流值', group: 'marshall', unit: 'mm', threshold: { min: 2, max: 4 }, sampleSize: 116 },
  { key: 'tsr', label: '冻融劈裂强度比', group: 'water', unit: '%', threshold: { min: 75 }, sampleSize: 85 },
  { key: 'retainedStability', label: '浸水残留稳定度', group: 'water', unit: '%', threshold: { min: 85 }, sampleSize: 83 },
  { key: 'ds', label: '动稳定度', group: 'highTemp', unit: '次/mm', threshold: { min: 800 }, sampleSize: 83 },
  { key: 'bendingStrain', label: '低温弯曲破坏应变', group: 'lowTemp', unit: 'με', threshold: { min: 2000 }, sampleSize: 75 },
  { key: 'tensileStrength', label: '低温抗拉强度', group: 'lowTemp', unit: 'MPa', sampleSize: 75 },
  { key: 'bendingModulus', label: '低温弯曲劲度模量', group: 'lowTemp', unit: 'MPa', sampleSize: 75 },
];

export function clamp(v: number, lo: number, hi: number): number {
  return Math.min(hi, Math.max(lo, v));
}

/** DS↔highTemp 单调：52→800、90→4000 线性（供反推/单测） */
export function dsFromHighTemp(highTemp: number): number {
  return clamp(Math.round(800 + ((highTemp - 52) / (90 - 52)) * 3200), 800, 4000);
}

/** bendingStrain↔lowTemp 单调：-10→2000、-40→4000（低温越低应变越高） */
export function bendingStrainFromLowTemp(lowTemp: number): number {
  return clamp(Math.round(2000 + ((-lowTemp - 10) / 30) * 2000), 2000, 4000);
}

/** tsr↔waterStability 单调：70→75、92→95（%） */
export function tsrFromWaterStability(waterStability: number): number {
  return clamp(Math.round(75 + ((waterStability - 70) / (92 - 70)) * 20), 75, 95);
}

/** retainedStability↔waterStability 单调：70→85、92→100（%） */
export function retainedStabilityFromWaterStability(waterStability: number): number {
  return clamp(Math.round(85 + ((waterStability - 70) / 22) * 15), 85, 100);
}

/** ms↔constructability 单调：55→8、90→12（kN） */
export function msFromConstructability(constructability: number): number {
  return clamp(Math.round(8 + ((constructability - 55) / (90 - 55)) * 4), 8, 12);
}

/** bendingModulus↔lowTemp 单调：-10→2000、-40→3500（MPa） */
export function bendingModulusFromLowTemp(lowTemp: number): number {
  return clamp(Math.round(2000 + ((-lowTemp - 10) / 30) * 1500), 2000, 3500);
}

/** tensileStrength↔lowTemp 单调：-10→4、-40→9（MPa） */
export function tensileStrengthFromLowTemp(lowTemp: number): number {
  return clamp(Math.round(4 + ((-lowTemp - 10) / 30) * 5), 4, 9);
}

/** 体积指标基线按级配查表（JTG F40 方向）：VV 3-6、FL 2-4、VMA≥14、VFA 65-75 */
const VOLUME_BASELINE: Record<string, { vv: number; vma: number; vfa: number; fl: number }> = {
  'SMA-13': { vv: 4.0, vma: 17, vfa: 72, fl: 3.0 },
  'AC-13': { vv: 4.5, vma: 15, vfa: 70, fl: 2.8 },
  'OGFC-13': { vv: 4.8, vma: 18, vfa: 68, fl: 3.2 },
  中面层: { vv: 4.2, vma: 15.5, vfa: 69, fl: 3.0 },
};
const DEFAULT_VOLUME = { vv: 4.3, vma: 15.5, vfa: 70, fl: 3.0 };

function generateLabIndicators(base: CBaseline, f: Formula, rand: () => number): LabIndicator[] {
  const vol = VOLUME_BASELINE[norm(f.gradation.type)] ?? DEFAULT_VOLUME;
  const vv = clamp(Number((vol.vv + (rand() - 0.5) * 0.8).toFixed(2)), 3, 6);
  const vma = clamp(Number((vol.vma + (rand() - 0.5) * 1.0).toFixed(2)), 14, 20);
  const vfa = clamp(Number((vol.vfa + (rand() - 0.5) * 3).toFixed(2)), 65, 75);
  const fl = clamp(Number((vol.fl + (rand() - 0.5) * 0.5).toFixed(2)), 2, 4);
  const ms = Number((msFromConstructability(base.constructability) + (rand() - 0.5) * 0.3).toFixed(2));
  // TSR：0-1 内部比值 ×100 输出 %
  const tsrRatio = clamp(tsrFromWaterStability(base.waterStability) / 100 + (rand() - 0.5) * 0.02, 0.75, 0.95);
  const tsr = Math.round(tsrRatio * 100);
  const retainedStability = Number(
    (retainedStabilityFromWaterStability(base.waterStability) + (rand() - 0.5) * 2).toFixed(2),
  );
  const ds = Math.round(dsFromHighTemp(base.highTemp) + (rand() - 0.5) * 100);
  const bendingStrain = Math.round(bendingStrainFromLowTemp(base.lowTemp) + (rand() - 0.5) * 150);
  const tensileStrength = Number(
    (tensileStrengthFromLowTemp(base.lowTemp) + (rand() - 0.5) * 0.3).toFixed(2),
  );
  const bendingModulus = Math.round(bendingModulusFromLowTemp(base.lowTemp) + (rand() - 0.5) * 100);

  const values: Record<string, number> = {
    vv,
    vma,
    vfa,
    ms,
    fl,
    tsr,
    retainedStability,
    ds,
    bendingStrain,
    tensileStrength,
    bendingModulus,
  };
  return LAB_INDICATOR_SPECS.map((spec) => {
    const value = values[spec.key];
    const pass = spec.threshold
      ? (spec.threshold.min === undefined || value > spec.threshold.min) &&
        (spec.threshold.max === undefined || value < spec.threshold.max)
      : undefined;
    return LabIndicatorSchema.parse({
      key: spec.key,
      label: spec.label,
      group: spec.group,
      unit: spec.unit,
      value,
      ...(spec.threshold ? { threshold: spec.threshold } : {}),
      ...(pass === undefined ? {} : { pass }),
      sampleSize: spec.sampleSize,
    });
  });
}
