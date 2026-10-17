import { z } from 'zod';
import { FormulaPredictionSchema } from '@road-rec/contracts';
import type { Formula, FormulaPrediction } from '@road-rec/contracts';
import { mockPredictFormulas } from './mock-c-baseline';
import type { AdapterMode } from './a';

const TIMEOUT_MS = 3000;

/**
 * 模块 C 适配器：配方列表 → 各性能预测值（含置信区间，optional）。
 * MODULE_C_ENDPOINT 未配置 / 请求失败 / 3s 超时 / 响应契约校验失败 → 整体降级内置 mock。
 * 返回数组带 adapterMode 属性（计划 Interfaces 签名）。
 */
export async function predictFormulas(
  formulas: Formula[],
): Promise<FormulaPrediction[] & { adapterMode: AdapterMode }> {
  const endpoint = process.env.MODULE_C_ENDPOINT;
  if (endpoint) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
    try {
      const res = await fetch(`${endpoint}/predict`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ formulas }),
        signal: controller.signal,
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json: unknown = await res.json();
      const parsed = z.array(FormulaPredictionSchema).safeParse(json);
      if (parsed.success) {
        const result = parsed.data as FormulaPrediction[] & { adapterMode: AdapterMode };
        result.adapterMode = 'real';
        return result;
      }
    } catch {
      // 不可达 / 超时 / 非契约响应 → mock
    } finally {
      clearTimeout(timer);
    }
  }
  const mock = mockPredictFormulas(formulas) as FormulaPrediction[] & { adapterMode: AdapterMode };
  mock.adapterMode = 'mock';
  return mock;
}
