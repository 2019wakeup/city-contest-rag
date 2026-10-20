/**
 * 企业实测指标（F2/F3）：分组名、阈值文案与达标判定。
 * 指标明细直接来自 contracts 的 Candidate.labIndicators（key/label/group/unit/value/
 * threshold/pass/sampleSize），此处只提供展示辅助。
 */

import { LAB_INDICATOR_LABELS, LAB_INDICATOR_UNITS } from '@/utils/labels'
import type { LabIndicator } from '@road-rec/contracts'

export { LAB_INDICATOR_LABELS, LAB_INDICATOR_UNITS }

/** group 枚举 → 分组中文名（体积/马歇尔/水稳/高温/低温）。 */
export const LAB_GROUP_NAMES: Record<string, string> = {
  volume: '体积性能',
  marshall: '马歇尔力学',
  water: '水稳',
  highTemp: '高温',
  lowTemp: '低温',
}

export interface LabThresholdLike {
  min?: number
  max?: number
}

/** 兜底阈值（backend 未带 threshold 时按 key 补）。 */
export const LAB_THRESHOLDS: Record<string, LabThresholdLike> = {
  vv: { min: 3, max: 6 },
  vma: { min: 14 },
  vfa: { min: 65, max: 75 },
  ms: { min: 8 },
  fl: { min: 2, max: 4 },
  tsr: { min: 75 },
  retainedStability: { min: 85 },
  ds: { min: 800 },
  bendingStrain: { min: 2000 },
}

export function thresholdTextOf(threshold: LabThresholdLike | null | undefined): string {
  if (!threshold) return '—'
  if (threshold.min != null && threshold.max != null) return `${threshold.min}–${threshold.max}`
  if (threshold.min != null) return `>${threshold.min}`
  if (threshold.max != null) return `<${threshold.max}`
  return '—'
}

/** 达标判定：优先 backend pass；否则按阈值+实测值计算；无阈值 → null（灰—）。 */
export function labPassOf(indicator: LabIndicator): boolean | null {
  if (indicator.pass != null) return indicator.pass
  const threshold = indicator.threshold ?? LAB_THRESHOLDS[indicator.key]
  const value = indicator.value
  if (!threshold || value == null || !Number.isFinite(value)) return null
  if (threshold.min != null && value < threshold.min) return false
  if (threshold.max != null && value > threshold.max) return false
  return true
}

export const labLabelOf = (indicator: LabIndicator): string =>
  indicator.label ?? LAB_INDICATOR_LABELS[indicator.key] ?? indicator.key

export const labUnitOf = (indicator: LabIndicator): string =>
  indicator.unit ?? LAB_INDICATOR_UNITS[indicator.key] ?? ''
