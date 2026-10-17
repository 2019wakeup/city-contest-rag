<script setup lang="ts">
import { computed } from 'vue'

import type { AdapterMode, Candidate, EvidenceRef } from '@road-rec/contracts'
import { formatNumber } from '@/utils/format'
import EvidencePanel from '@/components/EvidencePanel.vue'
import RadarChart from '@/components/RadarChart.vue'
import WaterfallChart from '@/components/WaterfallChart.vue'

const props = defineProps<{
  candidate: Candidate
  index: number
  adapterMode: AdapterMode
  evidence: EvidenceRef[]
  expanded: boolean
  highlightId?: string | null
}>()
const emit = defineEmits<{ toggle: [] }>()

const isMock = computed(
  () => props.adapterMode?.a === 'mock' || props.adapterMode?.c === 'mock',
)

const formula = computed(() => props.candidate?.formula)
const radar = computed(() => props.candidate?.radar)
const explanations = computed(() => props.candidate?.explanations ?? [])

// 预测项英文键名 → 中文（与雷达图 8 维口径一致，UI#5）。
const PERF_LABELS: Record<string, string> = {
  highTemp: '高温性能',
  lowTemp: '低温性能',
  fatigue: '疲劳',
  waterStability: '水稳TSR',
  lcc: 'LCC',
  carbon: '碳排',
  expectedLife: '预期寿命',
  constructability: '施工可行性',
}

const perfLabel = (perf: string): string => PERF_LABELS[perf] ?? perf

// UI二轮：折叠摘要行显示雷达三强项（与雷达图维度口径一致）。
const RADAR_STRENGTH_LABELS: Array<{ key: keyof NonNullable<Candidate['radar']>; label: string }> = [
  { key: 'highTemp', label: '高温' },
  { key: 'lowTemp', label: '低温' },
  { key: 'fatigue', label: '疲劳' },
  { key: 'waterStability', label: '水稳' },
  { key: 'lcc', label: 'LCC' },
  { key: 'carbon', label: '碳排' },
  { key: 'expectedLife', label: '寿命' },
  { key: 'constructability', label: '施工' },
]

const strengths = computed(() => {
  const r = radar.value
  if (!r) return ''
  return [...RADAR_STRENGTH_LABELS]
    .map((d) => ({ label: d.label, value: Number(r[d.key]) || 0 }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 3)
    .map((d) => `${d.label} ${d.value}`)
    .join(' · ')
})

const isTop1 = computed(() => props.index === 0)
</script>

<template>
  <el-card
    shadow="hover"
    data-testid="candidate-card"
    class="candidate-card"
    :class="{ 'is-top1': isTop1 }"
  >
    <template #header>
      <div
        class="candidate-header"
        data-testid="candidate-toggle"
        role="button"
        :aria-expanded="expanded"
        @click="emit('toggle')"
      >
        <el-tag
          v-if="isTop1"
          type="primary"
          effect="dark"
          size="small"
          data-testid="top1-badge"
        >
          首选
        </el-tag>
        <span class="candidate-title">
          方案 {{ index + 1 }}（{{ candidate?.id ?? '未知' }}）
          <span class="candidate-mix">
            {{ formula?.binder?.type ?? '—' }} + {{ formula?.gradation?.type ?? '—' }}
          </span>
        </span>
        <span v-if="!expanded" class="candidate-strengths tabular">{{ strengths }}</span>
        <span class="candidate-score tabular">综合得分 {{ (candidate?.score ?? 0).toFixed(3) }}</span>
        <el-tag v-if="isMock" type="warning" data-testid="mock-badge">模拟数据</el-tag>
        <span class="candidate-toggle-hint">{{ expanded ? '收起' : '展开' }}</span>
      </div>
    </template>

    <template v-if="expanded">
      <el-descriptions :column="2" size="small" border class="candidate-formula">
        <el-descriptions-item label="沥青">
          {{ formula?.binder?.type ?? '—' }}（{{ formula?.binder?.grade ?? '—' }}）
        </el-descriptions-item>
        <el-descriptions-item label="改性剂">
          {{ formula?.modifier?.type || '无' }}
          <template v-if="formula?.modifier?.type">
            · 掺量 {{ formula?.modifier?.dosage ?? '—' }}%
          </template>
        </el-descriptions-item>
        <el-descriptions-item label="级配">
          {{ formula?.gradation?.type ?? '—' }}
        </el-descriptions-item>
        <el-descriptions-item label="油石比 / 空隙率">
          {{ formula?.oilStoneRatio ?? '—' }}% / {{ formula?.airVoids ?? '—' }}%
        </el-descriptions-item>
      </el-descriptions>

      <ul class="candidate-predictions">
        <li v-for="(p, i) in candidate?.predictions ?? []" :key="`${p.perf}-${i}`" class="tabular">
          {{ perfLabel(p.perf) }}：{{ formatNumber(p.value) }}<template v-if="p.ciLow != null && p.ciHigh != null">
            （{{ formatNumber(p.ciLow) }} ~ {{ formatNumber(p.ciHigh) }}）</template> {{ p.unit ?? '' }}
        </li>
        <li class="candidate-kpis tabular">
          LCC {{ formatNumber(candidate?.lcc) }} 万元 · 碳排 {{ formatNumber(candidate?.carbon) }} tCO2e
          · 预期寿命 {{ formatNumber(candidate?.expectedLife) }} 年
        </li>
      </ul>

      <RadarChart v-if="radar" :radar="radar" />

      <WaterfallChart
        v-if="explanations.length > 0"
        :explanations="explanations"
        class="candidate-waterfall"
      />

      <EvidencePanel
        :evidence="evidence ?? []"
        :ids="candidate?.evidenceIds ?? []"
        :highlight-id="highlightId"
      />
    </template>
  </el-card>
</template>

<style scoped>
.candidate-card {
  margin-bottom: 24px;
}

.candidate-header {
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
  user-select: none;
}

.candidate-title {
  font-weight: 600;
}

.candidate-mix {
  margin-left: 8px;
  font-weight: 400;
  color: var(--el-text-color-regular);
}

.candidate-score {
  margin-left: auto;
  color: var(--el-color-primary);
}

.candidate-strengths {
  font-size: 13px;
  color: var(--el-text-color-secondary);
}

.is-top1 {
  border-color: var(--el-color-primary) !important;
}

.candidate-toggle-hint {
  margin-left: 8px;
  font-size: 12px;
  color: var(--el-text-color-secondary);
}

.candidate-formula {
  margin-bottom: 8px;
}

.candidate-predictions {
  margin: 0 0 12px;
  padding-left: 20px;
  color: var(--el-text-color-regular);
}

.candidate-predictions li {
  margin-bottom: 8px;
}

.candidate-kpis {
  list-style: none;
}

.candidate-waterfall {
  margin-bottom: 16px;
}
</style>
