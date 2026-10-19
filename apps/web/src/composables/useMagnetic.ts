/**
 * 磁性（magnetic）：pointermove 按相对中心偏移 clamp ±max px → translate，
 * 离开 ease-spring 回弹（transform 清空由 CSS 过渡接管）。
 * 仅 hover:hover（鼠标设备）生效。
 */
export interface MagneticOptions {
  max?: number
}

export function useMagnetic(options: MagneticOptions = {}): {
  onPointerMove: (event: PointerEvent) => void
  onPointerLeave: (event: PointerEvent) => void
} {
  const { max = 4 } = options

  const isHoverCapable = (): boolean =>
    typeof window.matchMedia === 'function' && window.matchMedia('(hover: hover)').matches

  function onPointerMove(event: PointerEvent): void {
    if (!isHoverCapable()) return
    const el = event.currentTarget as HTMLElement
    const rect = el.getBoundingClientRect()
    if (rect.width <= 0 || rect.height <= 0) return
    const dx = event.clientX - (rect.left + rect.width / 2)
    const dy = event.clientY - (rect.top + rect.height / 2)
    const x = Math.max(-max, Math.min(max, dx))
    const y = Math.max(-max, Math.min(max, dy))
    el.style.transform = `translate(${x.toFixed(1)}px, ${y.toFixed(1)}px)`
  }

  function onPointerLeave(event: PointerEvent): void {
    const el = event.currentTarget as HTMLElement
    el.style.transform = ''
  }

  return { onPointerMove, onPointerLeave }
}
