<script setup lang="ts">
import { CustomChart, LineChart } from 'echarts/charts'
import { GridComponent, TooltipComponent } from 'echarts/components'
import * as echarts from 'echarts/core'
import type { EChartsType } from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import { computed, onBeforeUnmount, onMounted, shallowRef, useTemplateRef, watch } from 'vue'

import { buildWaterfallData } from '@/utils/breakdown'
import type { ScoreBreakdownItem } from '@road-rec/contracts'

/**
 * 标准 ECharts 瀑布图：custom 浮动柱（起点累计 y0 → 终点 y0+contribution）
 * + 累计连线（line，圆点虚线）+ 合计柱（cyan 实心，label 显示分数）。
 * penalty 正数插向下红柱；reduced-motion 下关闭动画。
 */
echarts.use([CustomChart, LineChart, GridComponent, TooltipComponent, CanvasRenderer])

const props = defineProps<{
  score: number
  breakdown?: ScoreBreakdownItem[] | null
  penalty?: number | null
}>()

const chartEl = useTemplateRef<HTMLDivElement>('chart')
const chart = shallowRef<EChartsType | null>(null)

const data = computed(() =>
  buildWaterfallData(props.breakdown ?? [], props.penalty ?? null, props.score ?? 0),
)

function prefersReducedMotion(): boolean {
  return (
    typeof window.matchMedia === 'function' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  )
}

function render(): void {
  const { bars, cumulativeLine, totalValue } = data.value
  if (bars.length === 0) return
  const yValues = bars.flatMap((b) => [b.y0, b.y1])
  const yMin = Math.min(0, ...yValues)
  const yMax = Math.max(1, ...yValues)
  const widthRatio = 0.55

  chart.value?.setOption({
    animation: prefersReducedMotion() ? false : undefined,
    tooltip: {
      trigger: 'item',
      formatter: (params: unknown) => {
        const p = params as { dataIndex?: number; seriesType?: string }
        if (p.seriesType !== 'custom') return ''
        const bar = bars[p.dataIndex ?? 0]
        if (!bar) return ''
        if (bar.kind === 'item') {
          return `${bar.label} · 权重 ${bar.weight} · 归一化 ${bar.normalized} · 贡献 ${bar.contribution}`
        }
        if (bar.kind === 'penalty') return `${bar.label} · 惩罚扣分 · 贡献 ${bar.contribution}`
        return `合计 · 综合得分 ${totalValue.toFixed(3)}`
      },
    },
    grid: { left: 48, right: 24, top: 28, bottom: 44 },
    xAxis: {
      type: 'category',
      data: bars.map((b) => b.label),
      axisLabel: {
        rotate: 30,
        color: '#8B93A7',
        fontSize: 11,
        fontFamily: 'ui-monospace, monospace',
      },
      axisLine: { lineStyle: { color: 'rgba(148,163,184,0.24)' } },
    },
    yAxis: {
      type: 'value',
      min: yMin,
      max: yMax,
      axisLabel: { color: '#8B93A7', fontFamily: 'ui-monospace, monospace' },
      splitLine: { lineStyle: { color: 'rgba(148,163,184,0.14)' } },
    },
    series: [
      {
        type: 'custom',
        name: 'waterfall-bar',
        data: bars.map((b) => [b.label, b.y0, b.y1]),
        renderItem: (params: unknown, api: unknown) => {
          const p = params as { dataIndex: number }
          const a = api as {
            coord: (v: [string | number, number]) => [number, number]
            size: (v: [number, number]) => [number, number]
            style: (s: Record<string, unknown>) => Record<string, unknown>
          }
          const bar = bars[p.dataIndex]
          if (!bar) return null
          const start = a.coord([bar.label, Math.min(bar.y0, bar.y1)])
          const end = a.coord([bar.label, Math.max(bar.y0, bar.y1)])
          const barWidth = a.size([widthRatio, 0])[0] ?? 24
          const color = bar.kind === 'total' ? '#22D3EE' : bar.y1 < bar.y0 ? '#EF4444' : '#6E7BF2'
          const labelText =
            bar.kind === 'total'
              ? totalValue.toFixed(3)
              : bar.kind === 'penalty'
                ? `−${Math.abs(bar.contribution ?? 0).toFixed(3)}`
                : ''
          return {
            type: 'rect',
            shape: {
              x: start[0] - barWidth / 2,
              y: end[1],
              width: barWidth,
              height: Math.max(1, start[1] - end[1]),
            },
            style: a.style({
              fill: color,
              text: labelText || undefined,
              textPosition: 'top',
              textFill: '#94A3B8',
              fontFamily: 'ui-monospace, monospace',
              fontSize: 11,
            }),
          }
        },
        z: 2,
      },
      {
        type: 'line',
        name: 'waterfall-line',
        data: cumulativeLine.map((d) => [d.label, d.value]),
        symbol: 'circle',
        symbolSize: 6,
        lineStyle: { type: 'dashed', color: 'rgba(148,163,184,0.5)', width: 1 },
        itemStyle: { color: '#8B93A7', borderColor: '#0E121A', borderWidth: 1 },
        silent: true,
        z: 3,
      },
    ],
  })
}

let resizeObserver: ResizeObserver | null = null

onMounted(() => {
  if (!chartEl.value) return
  chart.value = echarts.init(chartEl.value)
  render()
  if (typeof ResizeObserver !== 'undefined') {
    resizeObserver = new ResizeObserver(() => {
      chart.value?.resize()
      render()
    })
    resizeObserver.observe(chartEl.value)
  }
})

onBeforeUnmount(() => {
  resizeObserver?.disconnect()
  chart.value?.dispose()
})

watch(() => [props.score, props.breakdown, props.penalty], render)
</script>

<template>
  <div
    ref="chart"
    class="waterfall-chart"
    role="img"
    aria-label="得分构成瀑布图（浮动柱累加至综合得分，含累计连线与合计柱）"
  ></div>
</template>

<style scoped>
.waterfall-chart {
  width: 100%;
  height: 280px;
}
</style>
