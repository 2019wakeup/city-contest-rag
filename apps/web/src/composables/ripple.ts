/**
 * 涟漪（ripple）：点击点 append .ripple（scale 0→1、opacity .18→0、280ms），
 * animationend 后移除；reduced-motion 跳过。宿主元素需加 .ripple-host。
 */
export function ripple(event: MouseEvent, el: HTMLElement): void {
  if (
    typeof window.matchMedia === 'function' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  ) {
    return
  }
  const rect = el.getBoundingClientRect()
  const size = Math.max(rect.width, rect.height, 1)
  const span = document.createElement('span')
  span.className = 'ripple'
  span.style.width = `${size}px`
  span.style.height = `${size}px`
  span.style.left = `${event.clientX - rect.left - size / 2}px`
  span.style.top = `${event.clientY - rect.top - size / 2}px`
  el.appendChild(span)
  span.addEventListener('animationend', () => span.remove(), { once: true })
}
