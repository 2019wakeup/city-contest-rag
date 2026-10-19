/**
 * 聚光（spotlight）：pointermove 写入 --mx/--my（%），离开淡出。
 * 与 motion.css 的 .spotlight-card 配合（卡片叠加 radial-gradient 高光）。
 */
export function useSpotlight(): {
  onPointerMove: (event: PointerEvent) => void
  onPointerLeave: (event: PointerEvent) => void
} {
  function onPointerMove(event: PointerEvent): void {
    const el = event.currentTarget as HTMLElement
    const rect = el.getBoundingClientRect()
    if (rect.width <= 0 || rect.height <= 0) return
    const x = ((event.clientX - rect.left) / rect.width) * 100
    const y = ((event.clientY - rect.top) / rect.height) * 100
    el.style.setProperty('--mx', `${Math.max(0, Math.min(100, x)).toFixed(2)}%`)
    el.style.setProperty('--my', `${Math.max(0, Math.min(100, y)).toFixed(2)}%`)
    el.classList.add('has-spotlight')
  }

  function onPointerLeave(event: PointerEvent): void {
    const el = event.currentTarget as HTMLElement
    el.classList.remove('has-spotlight')
  }

  return { onPointerMove, onPointerLeave }
}
