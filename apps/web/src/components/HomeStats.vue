<script setup lang="ts">
import { PieChart } from 'echarts/charts'
import { LegendComponent, TooltipComponent } from 'echarts/components'
import * as echarts from 'echarts/core'
import type { EChartsType } from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import { onBeforeUnmount, onMounted, shallowRef, useTemplateRef, watch } from 'vue'

import { DOC_TYPE_LABELS } from '@/utils/labels'
import type { KbStats } from '@/api/client'

/**
 * 知识库构成环形图（ECharts donut）：六类文档块数，中心显示总数。
 * 数据来自 /kb/stats（失败静默隐藏），颜色用主题 token 近似。
 */
echarts.use([PieChart, LegendComponent, TooltipComponent, CanvasRenderer])

const props = defineProps<{ stats: KbStats | null }>()

const chartEl = useTemplateRef<HTMLDivElement>('chart')
const chart = shallowRef<EChartsType | null>(null)

const DOC_ORDER: Array<{ key: keyof NonNullable<KbStats['docTypes']>; label: string; color: string }> = [
  { key: 'knowledge', label: '知识条目', color: '#6E7BF2' },
  { key: 'standard', label: '规范', color: '#14B8A6' },
  { key: 'literature', label: '文献', color: '#F59E0B' },
  { key: 'literature-full', label: '文献章节', color: '#64748B' },
  { key: 'table', label: '定量表格', color: '#0F766E' },
  { key: 'enterprise', label: '企业资料', color: '#94A3B8' },
]

const total = shallowRef(0)

function render(): void {
  const docTypes = props.stats?.docTypes ?? {}
  total.value = props.stats?.count ?? 0
  const data = DOC_ORDER.map((d) => ({
    name: d.label,
    value: Number((docTypes as Record<string, unknown>)[d.key]) || 0,
    itemStyle: { color: d.color },
  })).filter((d) => d.value > 0)

  chart.value?.setOption({
    tooltip: { trigger: 'item' },
    legend: { bottom: 0, textStyle: { color: '#8B93A7', fontSize: 12 } },
    series: [
      {
        type: 'pie',
        radius: ['55%', '78%'],
        center: ['50%', '42%'],
        data,
        label: { show: false },
        itemStyle: { borderColor: '#0E121A', borderWidth: 2 },
      },
    ],
    graphic: [
      {
        type: 'text',
        left: 'center',
        top: '34%',
        style: {
          text: String(total.value.toLocaleString()),
          fill: '#E5EAF3',
          fontSize: 24,
          fontWeight: 'bold',
          fontFamily: 'ui-monospace, monospace',
          textAlign: 'center',
        },
      },
      {
        type: 'text',
        left: 'center',
        top: '46%',
        style: {
          text: '知识库条目',
          fill: '#8B93A7',
          fontSize: 12,
          textAlign: 'center',
        },
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
    resizeObserver = new ResizeObserver(() => chart.value?.resize())
    resizeObserver.observe(chartEl.value)
  }
})

onBeforeUnmount(() => {
  resizeObserver?.disconnect()
  chart.value?.dispose()
})

watch(() => props.stats, render)
</script>

<template>
  <section v-if="stats && (stats.count ?? 0) > 0" class="home-stats" data-testid="home-stats">
    <div data-testid="stats-badges" class="home-stats-badges">
      <span class="welcome-stat-badge">知识块 {{ stats.count }}</span>
      <span
        v-for="(v, k) in stats.docTypes ?? {}"
        :key="k"
        class="welcome-stat-badge"
      >
        {{ DOC_TYPE_LABELS[k] ?? k }} {{ v }}
      </span>
    </div>
    <h2 class="home-section-title">知识库构成</h2>
    <div ref="chart" class="home-stats-chart" role="img" aria-label="知识库构成环形图"></div>
  </section>
</template>

<style scoped>
.home-stats {
  flex: 1;
  min-width: 260px;
  margin-bottom: 32px;
}

.home-stats-badges {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 16px;
}

.welcome-stat-badge {
  padding: 4px 12px;
  border: 1px solid var(--app-border-strong);
  border-radius: 999px;
  background: var(--app-panel-bg);
  color: var(--el-text-color-secondary);
  font-size: 12px;
}

.home-section-title {
  margin: 0 0 16px;
  font-size: 18px;
  font-weight: 600;
}

.home-stats-chart {
  width: 100%;
  height: 300px;
}
</style>
