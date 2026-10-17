import { FormulaPredictionSchema } from '@road-rec/contracts';
import type { Formula, FormulaPrediction } from '@road-rec/contracts';

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
  fatigue: '次',
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
  return formulas.map((f) => {
    const base = composeBaseline(f);
    const predictions = C_DIMS.map((dim) => {
      // 固定 seed 扰动 ±3%，置信区间 ±5%（全部确定性）
      const value = Number((base[dim] * (1 + (rand() - 0.5) * 0.06)).toFixed(2));
      return {
        perf: dim,
        value,
        ciLow: Number((value * 0.95).toFixed(2)),
        ciHigh: Number((value * 1.05).toFixed(2)),
        unit: UNITS[dim],
      };
    });
    return FormulaPredictionSchema.parse({ formula: f, predictions });
  });
}
