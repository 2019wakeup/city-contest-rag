import { describe, expect, it, vi } from 'vitest'

import { ripple } from '@/composables/ripple'
import { useMagnetic } from '@/composables/useMagnetic'
import { useSpotlight } from '@/composables/useSpotlight'

/** happy-dom 无布局：stub getBoundingClientRect。 */
function stubRect(el: HTMLElement, rect: Partial<DOMRect>): void {
  el.getBoundingClientRect = () =>
    ({
      left: 0,
      top: 0,
      width: 100,
      height: 100,
      right: 100,
      bottom: 100,
      x: 0,
      y: 0,
      toJSON: () => ({}),
      ...rect,
    }) as DOMRect
}

function pointerEvent(el: HTMLElement, clientX: number, clientY: number): PointerEvent {
  return new PointerEvent('pointermove', { clientX, clientY }) as PointerEvent
}

describe('useSpotlight 聚光', () => {
  it('pointermove 写入 --mx/--my 百分比并加 has-spotlight', () => {
    const el = document.createElement('div')
    stubRect(el, { width: 200, height: 100 })
    const { onPointerMove } = useSpotlight()

    onPointerMove(pointerEventWithTarget(el, 150, 25))

    expect(el.style.getPropertyValue('--mx')).toBe('75.00%')
    expect(el.style.getPropertyValue('--my')).toBe('25.00%')
    expect(el.classList.contains('has-spotlight')).toBe(true)
  })

  it('pointerleave 移除 has-spotlight', () => {
    const el = document.createElement('div')
    stubRect(el, {})
    const { onPointerMove, onPointerLeave } = useSpotlight()
    onPointerMove(pointerEventWithTarget(el, 50, 50))
    onPointerLeave(pointerEventWithTarget(el, 0, 0))
    expect(el.classList.contains('has-spotlight')).toBe(false)
  })
})

function pointerEventWithTarget(el: HTMLElement, x: number, y: number): PointerEvent {
  const event = pointerEvent(el, x, y)
  Object.defineProperty(event, 'currentTarget', { value: el })
  return event
}

describe('useMagnetic 磁性', () => {
  it('偏移 clamp 到 ±4px（max 默认 4）', () => {
    const el = document.createElement('div')
    stubRect(el, { width: 100, height: 100 })
    const { onPointerMove } = useMagnetic()

    onPointerMove(pointerEventWithTarget(el, 150, 60))
    expect(el.style.transform).toBe('translate(4.0px, 4.0px)') // dx=100→4, dy=10→4

    onPointerMove(pointerEventWithTarget(el, 20, 40))
    expect(el.style.transform).toBe('translate(-4.0px, -4.0px)') // dx=-30→-4, dy=-10→-4
  })

  it('leave 清空 transform（回弹由 CSS 过渡接管）', () => {
    const el = document.createElement('div')
    stubRect(el, {})
    const { onPointerMove, onPointerLeave } = useMagnetic()
    onPointerMove(pointerEventWithTarget(el, 80, 50))
    onPointerLeave(pointerEventWithTarget(el, 0, 0))
    expect(el.style.transform).toBe('')
  })

  it('非 hover:hover 设备不生效', () => {
    const original = window.matchMedia
    window.matchMedia = ((query: string) => ({
      matches: query === '(hover: hover)' ? false : false,
      media: query,
      onchange: null,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => false,
    })) as unknown as typeof window.matchMedia
    try {
      const el = document.createElement('div')
      stubRect(el, {})
      const { onPointerMove } = useMagnetic()
      onPointerMove(pointerEventWithTarget(el, 120, 50))
      expect(el.style.transform).toBe('')
    } finally {
      window.matchMedia = original
    }
  })
})

describe('ripple 涟漪', () => {
  it('点击点插入 .ripple，animationend 后移除', () => {
    const el = document.createElement('button')
    stubRect(el, { width: 100, height: 40 })
    document.body.appendChild(el)

    ripple(new MouseEvent('click', { clientX: 70, clientY: 20 }), el)

    const spans = el.querySelectorAll('.ripple')
    expect(spans.length).toBe(1)
    expect((spans[0] as HTMLElement).style.left).toBe('20px')

    spans[0].dispatchEvent(new Event('animationend'))
    expect(el.querySelectorAll('.ripple').length).toBe(0)
    el.remove()
  })

  it('reduced-motion 跳过插入', () => {
    const original = window.matchMedia
    window.matchMedia = ((query: string) => ({
      matches: query === '(prefers-reduced-motion: reduce)',
      media: query,
      onchange: null,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => false,
    })) as unknown as typeof window.matchMedia
    try {
      const el = document.createElement('button')
      stubRect(el, {})
      ripple(new MouseEvent('click', { clientX: 10, clientY: 10 }), el)
      expect(el.querySelectorAll('.ripple').length).toBe(0)
    } finally {
      window.matchMedia = original
    }
  })
})
