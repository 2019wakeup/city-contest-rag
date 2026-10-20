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
