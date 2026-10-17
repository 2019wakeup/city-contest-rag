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
