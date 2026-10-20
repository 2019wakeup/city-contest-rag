/**
 * 得分构成分解（backend 将提供 scoreBreakdown：dimension/label/weight/normalized/
 * contribution + penalty）。本地类型先行，contracts 落地后可直接切换导入。
 */

import type { ScoreBreakdownItem } from '@road-rec/contracts'

export type { ScoreBreakdownItem }

/** 惩罚项展示名与正数扣减量（candidate.penalty 为数字）。 */
export interface PenaltyLike {
  label: string
  contribution: number
}

export const penaltyLabel = (penalty?: number | null): string =>
  penalty != null && penalty > 0 ? `惩罚项 -${penalty}` : '惩罚项'

/** 瀑布图浮动柱（标准 ECharts 瀑布：起点 y0、终点 y1）。 */
export interface WaterfallBar {
  label: string
  y0: number
  y1: number
  kind: 'item' | 'penalty' | 'total'
  weight?: number
  normalized?: number
  contribution?: number
}

export interface WaterfallData {
  bars: WaterfallBar[]
  cumulativeLine: Array<{ label: string; value: number }>
  totalValue: number
}

/**
 * 标准瀑布数据映射：每维从累计值起柱（y0→y0+contribution）；
 * penalty（正数）插入向下红柱；最后合计柱 0→score。
 */
export function buildWaterfallData(
  breakdown: ScoreBreakdownItem[],
  penalty: number | null | undefined,
  score: number,
): WaterfallData {
  let cumulative = 0
  const bars: WaterfallBar[] = []
  const cumulativeLine: Array<{ label: string; value: number }> = []
  for (const item of breakdown ?? []) {
    const y0 = cumulative
    const y1 = cumulative + item.contribution
    bars.push({
      label: item.label,
      y0,
      y1,
      kind: 'item',
      weight: item.weight,
      normalized: item.normalized,
      contribution: item.contribution,
    })
    cumulativeLine.push({ label: item.label, value: y1 })
    cumulative = y1
  }
  if (penalty != null && penalty > 0) {
    const y0 = cumulative
    const y1 = cumulative - penalty
    bars.push({ label: `惩罚 −${penalty}`, y0, y1, kind: 'penalty', contribution: -penalty })
    cumulativeLine.push({ label: '惩罚', value: y1 })
    cumulative = y1
  }
  const totalValue = score
  bars.push({ label: '合计', y0: 0, y1: totalValue, kind: 'total', contribution: totalValue })
  cumulativeLine.push({ label: '合计', value: totalValue })
  return { bars, cumulativeLine, totalValue }
}
