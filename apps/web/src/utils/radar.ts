import { formatNumber } from '@/utils/format'

/**
 * 雷达 8 维指标定义（重构：tooltip 绝对评分用；与 RadarChart/CandidateCard 口径一致）。
 * aliases = 后端预测/目标 perf 可能出现的中文名。
 */
export const RADAR_INDICATORS = [
  { key: 'highTemp', name: '高温', aliases: ['高温PG'] },
  { key: 'lowTemp', name: '低温', aliases: ['低温PG'] },
  { key: 'fatigue', name: '疲劳', aliases: [] },
  { key: 'waterStability', name: '水稳', aliases: ['水稳TSR'] },
  { key: 'lcc', name: 'LCC', aliases: ['成本'] },
  { key: 'carbon', name: '碳排', aliases: [] },
  { key: 'expectedLife', name: '寿命', aliases: ['预期寿命'] },
  { key: 'constructability', name: '施工', aliases: ['施工和易性'] },
] as const

export type RadarDim = (typeof RADAR_INDICATORS)[number]['key']

export interface RadarPredictionLike {
  perf?: string
  value?: number | null
  unit?: string
}

/** 在预测列表中按维度查找（英文键或中文别名）。 */
export function findRadarPrediction(
  predictions: RadarPredictionLike[] | null | undefined,
  dim: RadarDim,
): RadarPredictionLike | undefined {
  const indicator = RADAR_INDICATORS.find((i) => i.key === dim)
  if (!indicator) return undefined
  const keys = new Set<string>([indicator.key, ...indicator.aliases])
  return (predictions ?? []).find((p) => p.perf != null && keys.has(p.perf))
}

/**
 * 雷达 tooltip 文本：维度名 + 绝对评分（0-100）+ 绝对值与单位。
 * 无预测值时只显示评分。
 */
export function formatRadarTooltip(
  name: string,
  score: number,
  prediction?: RadarPredictionLike | null,
): string {
  if (prediction && prediction.value != null && Number.isFinite(prediction.value)) {
    return `${name}：${score} 分（${formatNumber(prediction.value)}${prediction.unit ?? ''}）`
  }
  return `${name}：${score} 分`
}
