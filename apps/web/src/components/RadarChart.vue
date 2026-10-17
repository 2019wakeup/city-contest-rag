<script setup lang="ts">
import { RadarChart as EChartsRadarChart } from 'echarts/charts'
import { RadarComponent, TooltipComponent } from 'echarts/components'
import * as echarts from 'echarts/core'
import type { EChartsType } from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import { onBeforeUnmount, onMounted, shallowRef, watch, useTemplateRef } from 'vue'

import type { Prediction, Radar } from '@road-rec/contracts'
import {
  findRadarPrediction,
  formatRadarTooltip,
  RADAR_INDICATORS,
} from '@/utils/radar'

echarts.use([EChartsRadarChart, RadarComponent, TooltipComponent, CanvasRenderer])

const props = defineProps<{
  radar: Radar
  /** 重构：tooltip 附绝对值+单位（从候选预测映射 perf→value/unit）。 */
  predictions?: Prediction[]
}>()

const chartEl = useTemplateRef<HTMLDivElement>('chart')
const chart = shallowRef<EChartsType | null>(null)

function render(): void {
  const radar = props.radar ?? ({} as Radar)
  const values = RADAR_INDICATORS.map((i) => Number(radar[i.key]) || 0)
  chart.value?.setOption({
    tooltip: {
      trigger: 'item',
      formatter: (params: unknown) => {
        const p = params as { value?: number[] }
        const tooltipValues = p.value ?? []
        return RADAR_INDICATORS.map((ind, idx) => {
          const score = Number(tooltipValues[idx]) || 0
          const prediction = findRadarPrediction(props.predictions, ind.key)
          return formatRadarTooltip(ind.name, score, prediction)
        }).join('<br/>')
      },
    },
    radar: {
      indicator: RADAR_INDICATORS.map((i) => ({ name: i.name, max: 100 })),
      radius: '62%',
      center: ['50%', '55%'],
    },
    series: [{ type: 'radar', data: [{ value: values, name: '综合评分' }] }],
  })
}

function onResize(): void {
  chart.value?.resize()
}

onMounted(() => {
  if (!chartEl.value) return
  chart.value = echarts.init(chartEl.value)
  render()
  window.addEventListener('resize', onResize)
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', onResize)
  chart.value?.dispose()
})

watch(() => [props.radar, props.predictions], render)
</script>

<template>
  <div>
    <div ref="chart" class="radar-chart"></div>
    <p class="radar-caption">八维画像 · 绝对评分（0-100）</p>
  </div>
</template>

<style scoped>
.radar-chart {
  width: 100%;
  height: 260px;
}

.radar-caption {
  margin: 4px 0 12px;
  font-size: 12px;
  text-align: center;
  color: var(--el-text-color-secondary);
}
</style>
