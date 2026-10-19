<script setup lang="ts">
import { BarChart } from 'echarts/charts'
import { GridComponent, TooltipComponent } from 'echarts/components'
import * as echarts from 'echarts/core'
import type { EChartsType } from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import { computed, onBeforeUnmount, onMounted, shallowRef, watch, useTemplateRef } from 'vue'

import type { Explanation } from '@road-rec/contracts'

echarts.use([BarChart, GridComponent, TooltipComponent, CanvasRenderer])

const props = defineProps<{ explanations: Explanation[] }>()

const chartEl = useTemplateRef<HTMLDivElement>('chart')
const chart = shallowRef<EChartsType | null>(null)

const items = computed(() =>
  (props.explanations ?? []).map((e) => ({
    name: e.feature,
    value: Number(e.contribution) || 0,
  })),
)

function render(): void {
  chart.value?.setOption({
    tooltip: { trigger: 'axis' },
    grid: { left: 40, right: 16, top: 30, bottom: 60 },
    xAxis: { type: 'category', data: items.value.map((i) => i.name), axisLabel: { rotate: 30 } },
    yAxis: { type: 'value', name: '贡献' },
    series: [
      {
        type: 'bar',
        data: items.value.map((i) => ({
          value: i.value,
          itemStyle: { color: i.value >= 0 ? '#67c23a' : '#f56c6c' },
        })),
      },
    ],
  })
}

// P6：容器 ResizeObserver（折叠侧栏等布局变化即时重绘）
let resizeObserver: ResizeObserver | null = null

onMounted(() => {
  if (!chartEl.value) return
  chart.value = echarts.init(chartEl.value)
  render()
  resizeObserver = new ResizeObserver(() => chart.value?.resize())
  resizeObserver.observe(chartEl.value)
})

onBeforeUnmount(() => {
  resizeObserver?.disconnect()
  resizeObserver = null
  chart.value?.dispose()
})

watch(() => props.explanations, render)
</script>

<template>
  <div
    ref="chart"
    class="waterfall-chart"
    role="img"
    aria-label="特征贡献瀑布图（正值正向贡献、负值负向贡献）"
  ></div>
</template>

<style scoped>
.waterfall-chart {
  width: 100%;
  height: 240px;
}
</style>
