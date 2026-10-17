import { TargetProfileSchema } from '@road-rec/contracts';
import type { Priority, SceneInput, TargetProfile } from '@road-rec/contracts';

/**
 * ===== 模拟数据（模块 A mock）=====
 * "规范查表基线"简化规则：目标 PG 直接取场景要求（表单已含规范查表结果），
 * 其余 8 维为演示基线；病害/交通/约束只调整优先级权重。全部确定性计算，无随机。
 */

// perf 名与语料 relations.property 词汇对齐（高温PG/低温PG/疲劳/水稳TSR/成本/碳排/预期寿命/施工和易性），
// T6 filterByScene 的 property∈targets 子句依赖该词汇（T8 再用 PERF_ALIAS 映射到雷达 8 维英文键）。
const BASE_TARGETS = [
  { perf: '高温PG', value: 64, unit: '℃' },
  { perf: '低温PG', value: -22, unit: '℃' },
  { perf: '疲劳', value: 1_000_000, unit: '次' },
  { perf: '水稳TSR', value: 80, unit: '%' },
  { perf: '成本', value: 400, unit: '万元' },
  { perf: '碳排', value: 50, unit: 'tCO2e' },
  { perf: '预期寿命', value: 10, unit: '年' },
  { perf: '施工和易性', value: 80, unit: '分' },
];

const BASE_PRIORITIES: Priority[] = [
  { perf: '高温PG', weight: 0.125 },
  { perf: '低温PG', weight: 0.125 },
  { perf: '疲劳', weight: 0.125 },
  { perf: '水稳TSR', weight: 0.125 },
  { perf: '成本', weight: 0.125 },
  { perf: '碳排', weight: 0.125 },
  { perf: '预期寿命', weight: 0.125 },
  { perf: '施工和易性', weight: 0.125 },
];

function hasAny(value: string, keywords: string[]): boolean {
  return keywords.some((k) => value.includes(k));
}

export function mockMapSceneToTargets(scene: SceneInput): TargetProfile & { adapterMode: 'mock' } {
  const targets = BASE_TARGETS.map((t) => ({ ...t }));
  const priorities = BASE_PRIORITIES.map((p) => ({ ...p }));

  const setTarget = (perf: string, value: number) => {
    const t = targets.find((x) => x.perf === perf);
    if (t) t.value = value;
  };
  const boost = (perf: string, w: number) => {
    const p = priorities.find((x) => x.perf === perf);
    if (p) p.weight += w;
  };

  // 目标 PG：场景表单已含规范查表结果，直接取用
  if (scene.climate.pgHigh) setTarget('高温PG', scene.climate.pgHigh);
  if (scene.climate.pgLow) setTarget('低温PG', scene.climate.pgLow);

  // 病害 → 对应性能优先级上调
  const distressTypes = scene.distresses.map((d) => d.type);
  if (distressTypes.some((t) => hasAny(t, ['rutting', 'shoving', '车辙', '拥包', '推挤']))) {
    boost('高温PG', 0.15);
  }
  if (distressTypes.some((t) => hasAny(t, ['crack', '裂缝']))) boost('低温PG', 0.15);
  if (distressTypes.some((t) => hasAny(t, ['water-damage', 'raveling', 'pothole', '水损害', '松散', '坑槽', '剥落']))) {
    boost('水稳TSR', 0.15);
  }
  if (distressTypes.some((t) => hasAny(t, ['fatigue', '疲劳']))) boost('疲劳', 0.1);

  // 交通荷载 → 疲劳/高温
  const level = scene.traffic.level;
  if (hasAny(level, ['heavy', '重', '特重'])) {
    boost('疲劳', 0.05);
    boost('高温PG', 0.05);
  }

  // 环保/再生约束 → 碳排权重
  if (hasAny(scene.notes, ['RAP', '再生', '环保']) || hasAny(scene.constraints.env, ['高', '环保', 'high'])) {
    boost('碳排', 0.1);
  }

  // 预算紧 → 成本权重
  if (scene.constraints.budget > 0 && scene.constraints.budget < 200) boost('成本', 0.1);

  // 权重归一化（和 = 1）
  const total = priorities.reduce((acc, p) => acc + p.weight, 0);
  for (const p of priorities) p.weight = Number((p.weight / total).toFixed(4));

  return {
    ...TargetProfileSchema.parse({ targets, priorities }),
    adapterMode: 'mock',
  };
}
