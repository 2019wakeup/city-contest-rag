<script setup lang="ts">
import { BarChart } from 'echarts/charts'
import { GridComponent, TooltipComponent } from 'echarts/components'
import * as echarts from 'echarts/core'
import type { EChartsType } from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import { computed, onBeforeUnmount, onMounted, shallowRef, useTemplateRef, watch } from 'vue'

import type { Explanation } from '@road-rec/contracts'

/**
 * 特征贡献条形图（SHAP）：正负双向（主色正向/红负向），按 |contribution| 排序。
 * 模拟阶段确定性生成；真实模块 C 接入后自动替换。
 */
echarts.use([BarChart, GridComponent, TooltipComponent, CanvasRenderer])

const props = defineProps<{ explanations: Explanation[] }>()

const chartEl = useTemplateRef<HTMLDivElement>('chart')
const chart = shallowRef<EChartsType | null>(null)

const sorted = computed(() =>
  [...(props.explanations ?? [])].sort(
    (a, b) => Math.abs(Number(b.contribution) || 0) - Math.abs(Number(a.contribution) || 0),
  ),
)

function render(): void {
  const list = sorted.value
  chart.value?.setOption({
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' },
      formatter: (params: unknown) => {
        const arr = params as Array<{ name?: string; value?: number }>
        const name = arr[0]?.name ?? ''
        const value = arr[0]?.value ?? 0
        return `${name}：贡献 ${value}`
      },
    },
    grid: { left: 110, right: 24, top: 16, bottom: 24 },
    xAxis: {
      type: 'value',
      axisLabel: { color: '#8B93A7' },
      splitLine: { lineStyle: { color: 'rgba(148,163,184,0.14)' } },
    },
    yAxis: {
      type: 'category',
      data: list.map((e) => e.feature),
      axisLabel: { color: '#C6CAD4', fontSize: 12 },
    },
    series: [
      {
        type: 'bar',
        data: list.map((e) => ({
          value: Number(e.contribution) || 0,
          itemStyle: {
            color: Number(e.contribution) >= 0 ? '#6E7BF2' : '#EF4444',
            borderRadius: Number(e.contribution) >= 0 ? [0, 4, 4, 0] : [4, 0, 0, 4],
          },
        })),
        barMaxWidth: 18,
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

watch(() => props.explanations, render)
</script>

<template>
  <div class="shap-bar">
    <div class="shap-head">
      <span class="shap-title">特征贡献</span>
      <span class="shap-note" data-testid="shap-note">
        特征贡献（模拟阶段确定性生成，真实模块 C 接入后自动替换）
      </span>
    </div>
    <div
      ref="chart"
      class="shap-chart"
      role="img"
      aria-label="特征贡献条形图（正向主色、负向红色）"
    ></div>
  </div>
</template>

<style scoped>
.shap-bar {
  margin-top: 8px;
}

.shap-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  margin-bottom: 8px;
}

.shap-title {
  font-size: 14px;
  font-weight: 600;
}

.shap-note {
  font-size: 12px;
  color: var(--el-text-color-secondary);
}

.shap-chart {
  width: 100%;
  height: 220px;
}
</style>
