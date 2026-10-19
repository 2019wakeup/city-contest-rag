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
  /** tooltip 附绝对值+单位（从候选预测映射 perf→value/unit）。 */
  predictions?: Prediction[]
}>()

const chartEl = useTemplateRef<HTMLDivElement>('chart')
const chart = shallowRef<EChartsType | null>(null)

interface ThemeTokens {
  dark: boolean
  axisLabel: string
  split: string
  splitArea: string
  primary: string
}

/** 从 CSS 变量读主题（暗色/亮色各给兜底），主题切换时 MutationObserver 重绘。 */
function readThemeTokens(): ThemeTokens {
  const root = document.documentElement
  const styles = getComputedStyle(root)
  const dark = root.classList.contains('dark')
  return {
    dark,
    axisLabel:
      styles.getPropertyValue('--el-text-color-secondary').trim() || (dark ? '#8B93A7' : '#64748B'),
    split: dark ? 'rgba(148,163,184,0.16)' : 'rgba(100,116,139,0.18)',
    splitArea: dark ? 'rgba(148,163,184,0.05)' : 'rgba(100,116,139,0.06)',
    primary: styles.getPropertyValue('--el-color-primary').trim() || '#6E7BF2',
  }
}

function render(): void {
  const radar = props.radar ?? ({} as Radar)
  const tokens = readThemeTokens()
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
      radius: '68%',
      center: ['50%', '52%'],
      axisName: { color: tokens.axisLabel, fontSize: 12 },
      splitLine: { lineStyle: { color: tokens.split } },
      splitArea: { areaStyle: { color: [tokens.splitArea, 'transparent'] } },
    },
    series: [
      {
        type: 'radar',
        data: [{ value: values, name: '综合评分' }],
        symbol: 'circle',
        symbolSize: 4,
        lineStyle: { width: 2, color: tokens.primary },
        itemStyle: { color: tokens.primary },
        areaStyle: {
          opacity: 0.35,
          color: {
            type: 'linear',
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              { offset: 0, color: `${tokens.primary}59` },
              { offset: 1, color: `${tokens.primary}0d` },
            ],
          },
        },
        emphasis: { itemStyle: { color: tokens.primary } },
      },
    ],
  })
}



let themeObserver: MutationObserver | null = null
let resizeObserver: ResizeObserver | null = null

onMounted(() => {
  if (!chartEl.value) return
  chart.value = echarts.init(chartEl.value)
  render()
  // P6：容器 ResizeObserver（折叠侧栏等布局变化即时重绘）
  if (typeof ResizeObserver !== 'undefined') {
    resizeObserver = new ResizeObserver(() => {
      chart.value?.resize()
      render()
    })
    resizeObserver.observe(chartEl.value)
  } else {
    window.addEventListener('resize', render)
  }
  // 主题切换（html.class 变化）→ 重绘（A：暗色/亮色即时生效）
  themeObserver = new MutationObserver(() => render())
  themeObserver.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['class'],
  })
})

onBeforeUnmount(() => {
  resizeObserver?.disconnect()
  resizeObserver = null
  window.removeEventListener('resize', render)
  themeObserver?.disconnect()
  themeObserver = null
  chart.value?.dispose()
})

watch(() => [props.radar, props.predictions], render)
</script>

<template>
  <div>
    <div
      ref="chart"
      class="radar-chart"
      role="img"
      aria-label="八维画像雷达图：高温、低温、疲劳、水稳、LCC、碳排、寿命、施工（0-100 分）"
    ></div>
    <p class="radar-caption">八维画像 · 绝对评分（0-100）</p>
  </div>
</template>

<style scoped>
.radar-chart {
  width: 100%;
  height: 320px;
}

.radar-caption {
  margin: 4px 0 12px;
  font-size: 12px;
  text-align: center;
  color: var(--el-text-color-secondary);
}
</style>
