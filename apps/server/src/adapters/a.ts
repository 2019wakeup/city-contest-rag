import { TargetProfileSchema } from '@road-rec/contracts';
import type { SceneInput, TargetProfile } from '@road-rec/contracts';
import { mockMapSceneToTargets } from './mock-a-rules';

const TIMEOUT_MS = 3000;

export type AdapterMode = 'mock' | 'real';

/**
 * 模块 A 适配器：场景 → 目标性能向量 + 优先级权重。
 * MODULE_A_ENDPOINT 未配置 / 请求失败 / 3s 超时 / 响应契约校验失败 → 降级内置 mock。
 */
export async function mapSceneToTargets(
  scene: SceneInput,
): Promise<TargetProfile & { adapterMode: AdapterMode }> {
  const endpoint = process.env.MODULE_A_ENDPOINT;
  if (endpoint) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
    try {
      const res = await fetch(`${endpoint}/mapping`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(scene),
        signal: controller.signal,
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json: unknown = await res.json();
      const parsed = TargetProfileSchema.safeParse(json);
      if (parsed.success) {
        return { ...parsed.data, adapterMode: 'real' };
      }
    } catch {
      // 不可达 / 超时 / 非契约响应 → mock
    } finally {
      clearTimeout(timer);
    }
  }
  return mockMapSceneToTargets(scene);
}
