<script setup lang="ts">
import { BarChart } from 'echarts/charts'
import { GridComponent, TooltipComponent } from 'echarts/components'
import * as echarts from 'echarts/core'
import type { EChartsType } from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import { computed, onBeforeUnmount, onMounted, shallowRef, useTemplateRef, watch } from 'vue'

import { penaltyLabel } from '@/utils/breakdown'
import type { ScoreBreakdownItem } from '@road-rec/contracts'

/**
 * 得分构成瀑布图：从 0 起累加各维贡献到达 score；penalty 向下红柱。
 * tooltip 显示「维度 · 权重 · 归一化值 · 贡献」。
 */
echarts.use([BarChart, GridComponent, TooltipComponent, CanvasRenderer])

const props = defineProps<{
  score: number
  breakdown?: ScoreBreakdownItem[] | null
  penalty?: number | null
}>()

const chartEl = useTemplateRef<HTMLDivElement>('chart')
const chart = shallowRef<EChartsType | null>(null)

const items = computed(() => props.breakdown ?? [])
const penalty = computed(() =>
  props.penalty != null && props.penalty > 0
    ? { label: penaltyLabel(props.penalty), contribution: props.penalty }
    : null,
)

function render(): void {
  const list = items.value
  const pen = penalty.value
  // 累积底 + 贡献柱（stack）；penalty 负向
  const baseData: number[] = []
  const contribData: number[] = []
  let cumulative = 0
  for (const item of list) {
    baseData.push(cumulative)
    contribData.push(item.contribution)
    cumulative += item.contribution
  }
  if (pen && pen.contribution > 0) {
    baseData.push(cumulative)
    contribData.push(-pen.contribution)
    cumulative -= pen.contribution
  }

  const xLabels = [...list.map((item) => item.label), ...(pen ? [pen.label] : [])]

  chart.value?.setOption({
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' },
      formatter: (params: unknown) => {
        const arr = params as Array<{ name?: string }>
        const name = arr[0]?.name ?? ''
        const item = list.find((x) => x.label === name)
        if (item) {
          return `${item.label} · 权重 ${item.weight} · 归一化 ${item.normalized} · 贡献 ${item.contribution}`
        }
        return `${pen?.label ?? name} · 贡献 -${pen?.contribution ?? 0}`
      },
    },
    grid: { left: 48, right: 16, top: 20, bottom: 44 },
    xAxis: {
      type: 'category',
      data: xLabels,
      axisLabel: { rotate: 30, color: '#8B93A7', fontSize: 11 },
    },
    yAxis: {
      type: 'value',
      axisLabel: { color: '#8B93A7' },
      splitLine: { lineStyle: { color: 'rgba(148,163,184,0.14)' } },
    },
    series: [
      {
        name: '底座',
        type: 'bar',
        stack: 'waterfall',
        data: baseData,
        itemStyle: { color: 'transparent' },
        emphasis: { itemStyle: { color: 'transparent' } },
        tooltip: { show: false },
      },
      {
        name: '贡献',
        type: 'bar',
        stack: 'waterfall',
        data: contribData.map((value) => ({
          value,
          itemStyle: {
            color: value < 0 ? '#EF4444' : '#6E7BF2',
            borderRadius: value < 0 ? [0, 0, 4, 4] : [4, 4, 0, 0],
          },
        })),
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

watch(() => [props.score, props.breakdown], render)
</script>

<template>
  <div
    ref="chart"
    class="waterfall-chart"
    role="img"
    aria-label="得分构成瀑布图（各维贡献累加至综合得分）"
  ></div>
</template>

<style scoped>
.waterfall-chart {
  width: 100%;
  height: 260px;
}
</style>
