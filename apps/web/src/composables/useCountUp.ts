import { onBeforeUnmount, ref, watch } from 'vue'
import { toValue } from 'vue'
import type { MaybeRefOrGetter } from 'vue'

/**
 * 数字滚动（count-up）：目标值变化时入队一次 0→目标（420ms、rAF、ease-out），
 * reduced-motion 直接显示目标值。返回 display 供 tabular-nums 渲染。
 */
export function useCountUp(target: MaybeRefOrGetter<number>): { display: Readonly<ReturnType<typeof ref<number>>> } {
  const display = ref(0)
  let rafId: number | null = null

  const prefersReducedMotion = (): boolean =>
    typeof window.matchMedia === 'function' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches

  function cancel(): void {
    if (rafId != null) {
      cancelAnimationFrame(rafId)
      rafId = null
    }
  }

  function animateTo(to: number): void {
    cancel()
    if (prefersReducedMotion()) {
      display.value = to
      return
    }
    const from = display.value
    if (from === to) return
    const DURATION = 420
    const t0 = performance.now()
    const step = (now: number): void => {
      const progress = Math.min(1, (now - t0) / DURATION)
      const eased = 1 - Math.pow(1 - progress, 3) // ease-out cubic
      display.value = from + (to - from) * eased
      if (progress < 1) {
        rafId = requestAnimationFrame(step)
      } else {
        display.value = to
        rafId = null
      }
    }
    rafId = requestAnimationFrame(step)
  }

  watch(
    () => toValue(target),
    (value) => {
      animateTo(typeof value === 'number' && Number.isFinite(value) ? value : 0)
    },
    { immediate: true },
  )

  onBeforeUnmount(cancel)

  return { display }
}
