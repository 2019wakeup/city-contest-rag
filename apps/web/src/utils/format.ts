/**
 * 面向用户展示的数字格式化：千分位 + 最多两位小数（UI#6）。
 * null/undefined/NaN 显示「—」。
 */
export function formatNumber(value: number | null | undefined): string {
  if (value == null || !Number.isFinite(value)) return '—'
  return value.toLocaleString('zh-CN', { maximumFractionDigits: 2 })
}
