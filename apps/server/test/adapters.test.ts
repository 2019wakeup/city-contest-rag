import { afterAll, beforeAll, afterEach, describe, expect, it, vi } from 'vitest';
import { createServer } from 'node:http';
import type { Server } from 'node:http';
import type { AddressInfo } from 'node:net';
import type { Formula, SceneInput } from '@road-rec/contracts';
import { mapSceneToTargets } from '../src/adapters/a';
import { predictFormulas } from '../src/adapters/c';

const scene: SceneInput = {
  schemaVersion: '1',
  climate: { zone: '1-4 华南湿热区', pgHigh: 76, pgLow: -10 },
  traffic: { level: 'heavy', esal: 30_000_000 },
  pavement: { layer: 'surface', structure: '半刚性基层沥青路面' },
  distresses: [
    { type: 'rutting', severity: 'severe' },
    { type: 'shoving', severity: 'moderate' },
  ],
  constraints: { budget: 500, schedule: 30, env: 'normal', noise: 'none' },
  notes: '高温多雨地区重载道路上面层维修',
};

const formula: Formula = {
  schemaVersion: '1',
  binder: { type: 'SBS 改性沥青', grade: 'I-D', pg: 'PG76-22' },
  modifier: { type: 'SBS', dosage: 4.5 },
  gradation: { type: 'SMA-13' },
  additives: [{ type: '木质素纤维', dosage: 0.3 }],
  oilStoneRatio: 6.0,
  airVoids: 4.0,
};

describe('模块 A/C 适配器（T7）', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  describe('mock 模式（端点未配置）', () => {
    it('同一 scene 两次调用结果逐位相等（确定性）', async () => {
      vi.stubEnv('MODULE_A_ENDPOINT', '');
      const first = await mapSceneToTargets(scene);
      const second = await mapSceneToTargets(scene);
      expect(first).toEqual(second);
      expect(first.adapterMode).toBe('mock');
      expect(first.targets.length).toBeGreaterThan(0);
      expect(first.priorities.length).toBeGreaterThan(0);
    });

    it('同一 formula 列表两次调用预测值逐位相等（固定 seed）', async () => {
      vi.stubEnv('MODULE_C_ENDPOINT', '');
      const first = await predictFormulas([formula]);
      const second = await predictFormulas([formula]);
      expect(first).toEqual(second);
      expect(first.adapterMode).toBe('mock');
      expect(first[0].predictions.length).toBeGreaterThan(0);
    });

    it('空数组返回空且带 adapterMode', async () => {
      vi.stubEnv('MODULE_C_ENDPOINT', '');
      const result = await predictFormulas([]);
      expect(result).toHaveLength(0);
      expect(result.adapterMode).toBe('mock');
    });

    it('mock A 按场景输出目标子集（R3-C1：不再恒 8 目标）', async () => {
      vi.stubEnv('MODULE_A_ENDPOINT', '');
      const result = await mapSceneToTargets(scene); // 车辙+拥包场景
      const perfs = result.targets.map((t) => t.perf);
      expect(perfs.length).toBeLessThan(8);
      expect(perfs).toContain('高温PG');
      expect(perfs).not.toContain('水稳TSR');
    });

    it('B1 疲劳量纲统一：mock A 目标疲劳 = 100 万次', async () => {
      vi.stubEnv('MODULE_A_ENDPOINT', '');
      const result = await mapSceneToTargets(scene);
      const fatigue = result.targets.find((t) => t.perf === '疲劳');
      expect(fatigue).toBeDefined();
      expect(fatigue!.value).toBe(100);
      expect(fatigue!.unit).toBe('万次');
    });

    it('B1/B2：mock C 疲劳 unit=万次，且所有预测 ciLow ≤ ciHigh（负值维度方向正确）', async () => {
      vi.stubEnv('MODULE_C_ENDPOINT', '');
      const predictions = await predictFormulas([formula]);
      const fatigue = predictions[0].predictions.find((p) => p.perf === 'fatigue');
      expect(fatigue?.unit).toBe('万次');
      for (const fp of predictions) {
        for (const p of fp.predictions) {
          expect(p.ciLow, `${p.perf} ciLow`).toBeDefined();
          expect(p.ciHigh, `${p.perf} ciHigh`).toBeDefined();
          expect(p.ciLow!).toBeLessThanOrEqual(p.ciHigh!);
        }
      }
      // 低温维度为负值：low = value - 5%|value|，high = value + 5%|value|
      const lowTemp = predictions[0].predictions.find((p) => p.perf === 'lowTemp');
      expect(lowTemp!.value).toBeLessThan(0);
      expect(lowTemp!.ciLow!).toBeLessThan(lowTemp!.value);
      expect(lowTemp!.ciHigh!).toBeGreaterThan(lowTemp!.value);
    });

    it('C2：mock C 输出 11 项实测指标（单位/阈值/pass 判定/样本量正确）', async () => {
      vi.stubEnv('MODULE_C_ENDPOINT', '');
      const predictions = await predictFormulas([formula]);
      const fp = predictions[0] as unknown as { labIndicators?: Array<Record<string, unknown>> };
      expect(fp.labIndicators).toBeDefined();
      const labs = fp.labIndicators!;
      expect(labs).toHaveLength(11);
      const byKey = new Map(labs.map((l) => [l.key as string, l]));
      const EXPECTED: Record<string, { unit: string; threshold?: { min?: number; max?: number }; sampleSize: number }> = {
        vv: { unit: '%', threshold: { min: 3, max: 6 }, sampleSize: 116 },
        vma: { unit: '%', threshold: { min: 14 }, sampleSize: 116 },
        vfa: { unit: '%', threshold: { min: 65, max: 75 }, sampleSize: 116 },
        ms: { unit: 'kN', threshold: { min: 8 }, sampleSize: 116 },
        fl: { unit: 'mm', threshold: { min: 2, max: 4 }, sampleSize: 116 },
        tsr: { unit: '%', threshold: { min: 75 }, sampleSize: 85 },
        retainedStability: { unit: '%', threshold: { min: 85 }, sampleSize: 83 },
        ds: { unit: '次/mm', threshold: { min: 800 }, sampleSize: 83 },
        bendingStrain: { unit: 'με', threshold: { min: 2000 }, sampleSize:75 },
        tensileStrength: { unit: 'MPa', sampleSize: 75 },
        bendingModulus: { unit: 'MPa', sampleSize: 75 },
      };
      for (const [key, spec] of Object.entries(EXPECTED)) {
        const lab = byKey.get(key);
        expect(lab, `缺指标 ${key}`).toBeDefined();
        expect(lab!.unit, `${key} 单位`).toBe(spec.unit);
        expect(lab!.sampleSize, `${key} 样本量`).toBe(spec.sampleSize);
        if (spec.threshold) {
          const t = lab!.threshold as { min?: number; max?: number };
          expect(t.min, `${key} 阈值 min`).toBe(spec.threshold.min);
          expect(t.max, `${key} 阈值 max`).toBe(spec.threshold.max);
          expect(typeof lab!.pass, `${key} pass`).toBe('boolean');
          // pass 与 value 判定一致
          const v = lab!.value as number;
          const expectedPass = (spec.threshold.min === undefined || v > spec.threshold.min) && (spec.threshold.max === undefined || v < spec.threshold.max);
          expect(lab!.pass, `${key} pass 判定`).toBe(expectedPass);
        }
      }
      // 数值范围：VMA≥14、VFA 65-75、VV 3-6、FL 2-4、DS>800、弯拉应变>2000、MS>8、TSR>75、残留稳定度>85
      const v = (key: string): number => byKey.get(key)!.value as number;
      expect(v('vma')).toBeGreaterThanOrEqual(14);
      expect(v('vfa')).toBeGreaterThanOrEqual(65);
      expect(v('vfa')).toBeLessThanOrEqual(75);
      expect(v('vv')).toBeGreaterThanOrEqual(3);
      expect(v('vv')).toBeLessThanOrEqual(6);
      expect(v('fl')).toBeGreaterThanOrEqual(2);
      expect(v('fl')).toBeLessThanOrEqual(4);
      expect(v('ds')).toBeGreaterThan(800);
      expect(v('bendingStrain')).toBeGreaterThan(2000);
      expect(v('ms')).toBeGreaterThan(8);
      expect(v('tsr')).toBeGreaterThan(75);
      expect(v('retainedStability')).toBeGreaterThan(85);
    });

    it('C2：实测指标与决策维同 seed 相关（映射单调性）', async () => {
      vi.stubEnv('MODULE_C_ENDPOINT', '');
      const formulas = [formula, { ...formula, binder: { ...formula.binder, type: '环氧沥青' } }];
      const predictions = await predictFormulas(formulas);
      const labsOf = (i: number) =>
        new Map(
          ((predictions[i] as unknown as { labIndicators?: Array<{ key: string; value: number }> }).labIndicators ?? []).map((l) => [l.key, l.value]),
        );
      // 环氧沥青 highTemp(90) > SBS(82) → DS 更大（DS↔highTemp 单调）
      const dsBase = labsOf(0).get('ds')!;
      const dsEpoxy = labsOf(1).get('ds')!;
      expect(dsEpoxy).toBeGreaterThan(dsBase);
      // 环氧 lowTemp(-25) > SBS(-28)（更不耐低温）→ bendingStrain 更小（bendingStrain↔lowTemp 单调）
      expect(labsOf(1).get('bendingStrain')!).toBeLessThan(labsOf(0).get('bendingStrain')!);
      // 环氧 waterStability(92+5=97?) 与 SBS(85+5=90)… 高粘配方比较用同 binder 不同 modifier 验证 tsr↔waterStability：
      const f2 = { ...formula, binder: { ...formula.binder, type: '高粘高弹改性沥青' } };
      const p2 = await predictFormulas([formula, f2]);
      const l2 = (i: number) =>
        new Map(
          ((p2[i] as unknown as { labIndicators?: Array<{ key: string; value: number }> }).labIndicators ?? []).map((l) => [l.key, l.value]),
        );
      expect(l2(1).get('tsr')!).toBeGreaterThan(l2(0).get('tsr')!);
    });

    it('C2：决策维度预测保持原样（8 维、与实测指标同次调用）', async () => {
      vi.stubEnv('MODULE_C_ENDPOINT', '');
      const predictions = await predictFormulas([formula]);
      expect(predictions[0].predictions).toHaveLength(8);
      expect(predictions[0].predictions.map((p) => p.perf).sort()).toEqual(
        ['carbon', 'constructability', 'expectedLife', 'fatigue', 'highTemp', 'lcc', 'lowTemp', 'waterStability'].sort(),
      );
    });
  });

  describe('真实端点（fake HTTP server）', () => {
    let badServer: Server;
    let badUrl: string;

    beforeAll(async () => {
      // 非契约响应服务器：永远返回 {foo:1}
      badServer = createServer((_req, res) => {
        res.setHeader('content-type', 'application/json');
        res.end(JSON.stringify({ foo: 1 }));
      });
      await new Promise<void>((resolve) => badServer.listen(0, '127.0.0.1', resolve));
      badUrl = `http://127.0.0.1:${(badServer.address() as AddressInfo).port}`;
    });

    afterAll(() => {
      badServer.close();
    });

    it('端点不可达 → 降级 mock（Review Focus #3）', async () => {
      vi.stubEnv('MODULE_A_ENDPOINT', 'http://127.0.0.1:9');
      const result = await mapSceneToTargets(scene);
      expect(result.adapterMode).toBe('mock');
      expect(result.targets.length).toBeGreaterThan(0);
    });

    it('响应非契约 JSON → 整体降级 mock', async () => {
      vi.stubEnv('MODULE_A_ENDPOINT', badUrl);
      const resultA = await mapSceneToTargets(scene);
      expect(resultA.adapterMode).toBe('mock');

      vi.stubEnv('MODULE_C_ENDPOINT', badUrl);
      const resultC = await predictFormulas([formula]);
      expect(resultC.adapterMode).toBe('mock');
      expect(resultC.length).toBeGreaterThan(0);
    });

    it('响应合法契约 JSON → adapterMode real 且数据透传', async () => {
      const goodServer = createServer((req, res) => {
        let body = '';
        req.on('data', (d) => (body += d));
        req.on('end', () => {
          res.setHeader('content-type', 'application/json');
          if (req.url === '/mapping') {
            res.end(
              JSON.stringify({
                schemaVersion: '1',
                targets: [{ perf: 'highTemp', value: 82, unit: '℃' }],
                priorities: [{ perf: 'highTemp', weight: 1 }],
                extraFromTeammate: true,
              }),
            );
          } else {
            res.end(
              JSON.stringify([
                {
                  schemaVersion: '1',
                  formula,
                  predictions: [{ perf: 'highTemp', value: 88, unit: '℃' }],
                },
              ]),
            );
          }
        });
      });
      await new Promise<void>((resolve) => goodServer.listen(0, '127.0.0.1', resolve));
      try {
        const goodUrl = `http://127.0.0.1:${(goodServer.address() as AddressInfo).port}`;
        vi.stubEnv('MODULE_A_ENDPOINT', goodUrl);
        vi.stubEnv('MODULE_C_ENDPOINT', goodUrl);

        const resultA = await mapSceneToTargets(scene);
        expect(resultA.adapterMode).toBe('real');
        expect(resultA.targets[0]).toMatchObject({ perf: 'highTemp', value: 82 });

        const resultC = await predictFormulas([formula]);
        expect(resultC.adapterMode).toBe('real');
        expect(resultC[0].predictions[0]).toMatchObject({ perf: 'highTemp', value: 88 });
      } finally {
        goodServer.close();
      }
    });
  });
});
