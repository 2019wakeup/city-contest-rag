<script setup lang="ts">
import { RadarChart as EChartsRadarChart } from 'echarts/charts'
import { RadarComponent, TooltipComponent } from 'echarts/components'
import * as echarts from 'echarts/core'
import type { EChartsType } from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import { onBeforeUnmount, onMounted, shallowRef, watch, useTemplateRef } from 'vue'

import type { Radar } from '@road-rec/contracts'

echarts.use([EChartsRadarChart, RadarComponent, TooltipComponent, CanvasRenderer])

const props = defineProps<{ radar: Radar }>()

// 雷达图 8 维（spec §7 G3）：高温/低温/疲劳/水稳/LCC/碳排放/预期寿命/施工可行性。
const INDICATORS = [
  { name: '高温', key: 'highTemp' },
  { name: '低温', key: 'lowTemp' },
  { name: '疲劳', key: 'fatigue' },
  { name: '水稳', key: 'waterStability' },
  { name: 'LCC', key: 'lcc' },
  { name: '碳排', key: 'carbon' },
  { name: '寿命', key: 'expectedLife' },
  { name: '施工', key: 'constructability' },
] as const

const chartEl = useTemplateRef<HTMLDivElement>('chart')
const chart = shallowRef<EChartsType | null>(null)

function render(): void {
  const radar = props.radar ?? ({} as Radar)
  const values = INDICATORS.map((i) => Number(radar[i.key]) || 0)
  chart.value?.setOption({
    tooltip: {},
    radar: {
      indicator: INDICATORS.map((i) => ({ name: i.name, max: 100 })),
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

watch(() => props.radar, render)
</script>

<template>
  <div ref="chart" class="radar-chart"></div>
</template>

<style scoped>
.radar-chart {
  width: 100%;
  height: 260px;
}
</style>
