import { TargetProfileSchema } from '@road-rec/contracts';
import type { SceneInput, TargetProfile } from '@road-rec/contracts';

/**
 * ===== 模拟数据（模块 A mock）=====
 * "规范查表基线"简化规则，全部确定性计算，无随机。
 *
 * R3-C1 修订：按场景标签/病害输出**相关目标子集**（不再恒 8 个目标）——
 * 目标子集决定关系表 property∈targets 硬过滤的聚焦范围，使召回对场景敏感。
 * perf 名与语料 relations.property 词汇对齐（高温PG/低温PG/疲劳/水稳TSR/成本/碳排/施工和易性），
 * T8 用 PERF_ALIAS 映射到雷达 8 维英文键。
 */

const BASE_VALUES: Record<string, { value: number; unit: string }> = {
  高温PG: { value: 64, unit: '℃' },
  低温PG: { value: -22, unit: '℃' },
  疲劳: { value: 1_000_000, unit: '次' },
  水稳TSR: { value: 80, unit: '%' },
  成本: { value: 400, unit: '万元' },
  碳排: { value: 50, unit: 'tCO2e' },
  预期寿命: { value: 10, unit: '年' },
  施工和易性: { value: 80, unit: '分' },
};

function hasAny(value: string, keywords: string[]): boolean {
  return keywords.some((k) => value.includes(k));
}

export function mockMapSceneToTargets(scene: SceneInput): TargetProfile & { adapterMode: 'mock' } {
  // 基础目标：气候 PG 需求恒在（表单已含规范查表结果）
  const perfSet = new Set<string>(['高温PG', '低温PG']);
  const boosts: Record<string, number> = {};
  const add = (perf: string, boost: number) => {
    perfSet.add(perf);
    boosts[perf] = (boosts[perf] ?? 0) + boost;
  };

  const distressTypes = scene.distresses.map((d) => d.type);
  const anyDistress = (...kws: string[]) => distressTypes.some((t) => hasAny(t, kws));

  // 病害 → 相关目标子集（R3-C1）
  if (anyDistress('rutting', 'shoving', '车辙', '拥包', '推挤')) {
    add('高温PG', 0.15);
    add('疲劳', 0.1);
    add('施工和易性', 0.05);
  }
  if (anyDistress('crack', '裂缝')) {
    add('低温PG', 0.15);
    add('疲劳', 0.1);
  }
  if (anyDistress('water-damage', 'raveling', 'pothole', '水损害', '松散', '坑槽', '剥落')) {
    add('水稳TSR', 0.15);
    add('低温PG', 0.05);
  }
  if (anyDistress('skid', '抗滑', '打滑', '磨光')) add('水稳TSR', 0.1);
  if (anyDistress('noise', '噪声', '噪音')) {
    add('碳排', 0.1);
    add('施工和易性', 0.05);
  }

  // 交通荷载
  const level = scene.traffic.level;
  if (hasAny(level, ['heavy', '重', '特重'])) {
    add('高温PG', 0.05);
    add('疲劳', 0.1);
  }

  // 环保/再生约束
  if (
    hasAny(scene.notes, ['RAP', '再生', '环保']) ||
    hasAny(scene.constraints.env, ['高', '环保', 'high', 'strict'])
  ) {
    add('碳排', 0.1);
    add('成本', 0.05);
  }

  // 预算紧 → 成本
  if (scene.constraints.budget > 0 && scene.constraints.budget < 200) add('成本', 0.15);

  // 降噪/工期要求 → 施工和易性
  if (hasAny(scene.constraints.noise, ['strict', '低噪', 'low'])) add('施工和易性', 0.05);

  // 目标 = 子集；高温PG/低温PG 数值取场景 pg 需求，其余取基线
  const targets = [...perfSet].map((perf) => {
    const base = BASE_VALUES[perf];
    let value = base.value;
    if (perf === '高温PG' && scene.climate.pgHigh) value = scene.climate.pgHigh;
    if (perf === '低温PG' && scene.climate.pgLow) value = scene.climate.pgLow;
    return { perf, value, unit: base.unit };
  });

  // 优先级 = 等权 + boost → 归一化（和 = 1）
  const total = targets.reduce((acc, t) => acc + (1 + (boosts[t.perf] ?? 0)), 0);
  const priorities = targets.map((t) => ({
    perf: t.perf,
    weight: Number(((1 + (boosts[t.perf] ?? 0)) / total).toFixed(4)),
  }));

  return {
    ...TargetProfileSchema.parse({ targets, priorities }),
    adapterMode: 'mock',
  };
}
