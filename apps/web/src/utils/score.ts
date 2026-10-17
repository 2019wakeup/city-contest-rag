/**
 * 检索/证据分数展示归一化（C7 / F2）：按列表首位（最大值）归一化到 0-100 的文本。
 * 仅前端展示换算，契约里的原始 score 不动；空值（null/undefined/NaN）或负值显示「—」。
 */
export function scoreDisplayText(
  scores: Array<number | null | undefined>,
  score: number | null | undefined,
): string {
  const top = scores.reduce<number>(
    (max, v) =>
      typeof v === 'number' && Number.isFinite(v) && v > 0 ? Math.max(max, v) : max,
    0,
  )
  if (top <= 0 || typeof score !== 'number' || !Number.isFinite(score) || score < 0) {
    return '—'
  }
  return String(Math.round((score / top) * 100))
}
