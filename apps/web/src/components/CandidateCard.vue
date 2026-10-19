<script setup lang="ts">
import { computed } from 'vue'

import type { AdapterMode, Candidate, EvidenceRef } from '@road-rec/contracts'
import { formatNumber } from '@/utils/format'
import { useSpotlight } from '@/composables/useSpotlight'
import { PERF_LABELS, labelOf } from '@/utils/labels'
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


const perfLabel = (perf: string): string => labelOf(PERF_LABELS, perf)

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
    .map((d) => `${d.label} ${d.value} 分`)
    .join(' · ')
})

const strengthSummary = computed(() =>
  strengths.value ? `优势项：${strengths.value}` : '',
)

const isTop1 = computed(() => props.index === 0)

// 灵动层：聚光（候选卡，不含表格行）
const spotlight = useSpotlight()
</script>

<template>
  <el-card
    shadow="hover"
    data-testid="candidate-card"
    class="candidate-card spotlight-card hover-lift"
    :class="{ 'is-top1': isTop1 }"
    @pointermove="spotlight.onPointerMove"
    @pointerleave="spotlight.onPointerLeave"
  >
    <template #header>
      <button
        type="button"
        class="candidate-header"
        data-testid="candidate-toggle"
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
          方案 {{ index + 1 }} · {{ formula?.binder?.type ?? '—' }}
        </span>
        <span v-if="!expanded" class="candidate-strengths tabular">{{ strengthSummary }}</span>
        <el-tooltip content="加权归一化得分（0–1，越高越好）" placement="top">
          <span class="candidate-score tabular">
            综合得分 {{ (candidate?.score ?? 0).toFixed(3) }}
          </span>
        </el-tooltip>
        <el-tag v-if="isMock" type="warning" data-testid="mock-badge">模拟数据</el-tag>
        <span class="candidate-toggle-hint">{{ expanded ? '收起' : '展开' }}</span>
      </button>
    </template>

    <div
      class="candidate-body"
      :class="{ 'is-expanded': expanded }"
      data-testid="candidate-body"
    >
      <div class="candidate-body-inner">
      <template v-if="expanded">
      <el-descriptions :column="2" size="small" border class="candidate-formula">
        <el-descriptions-item label="沥青">
          {{ formula?.binder?.type ?? '—' }}（{{ formula?.binder?.grade ?? '—' }}）
        </el-descriptions-item>
        <el-descriptions-item label="PG 等级">
          {{ formula?.binder?.pg ?? '—' }}
        </el-descriptions-item>
        <el-descriptions-item label="改性剂">
          {{ formula?.modifier?.type || '无' }}
          <template v-if="formula?.modifier?.type">
            · 掺量 {{ formula?.modifier?.dosage ?? '—' }}%
          </template>
        </el-descriptions-item>
        <el-descriptions-item label="助剂">
          <template v-if="(formula?.additives ?? []).length > 0">
            <el-tag
              v-for="a in formula?.additives ?? []"
              :key="a.type"
              size="small"
              class="additive-tag"
            >
              {{ a.type }} {{ a.dosage != null ? `${a.dosage}%` : '' }}
            </el-tag>
          </template>
          <span v-else>无</span>
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
            （{{ formatNumber(p.ciLow) }} ~ {{ formatNumber(p.ciHigh) }}）</template><template v-else>
            （置信区间不可用（模块 C 未提供））</template> {{ p.unit ?? '' }}
        </li>
        <li class="candidate-kpis tabular">
          LCC {{ formatNumber(candidate?.lcc) }} 万元 · 碳排 {{ formatNumber(candidate?.carbon) }} tCO2e
          · 预期寿命 {{ formatNumber(candidate?.expectedLife) }} 年
        </li>
      </ul>

      <RadarChart
        v-if="radar"
        :radar="radar"
        :predictions="candidate?.predictions ?? []"
      />

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
      </div>
    </div>
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
  width: 100%;
  padding: 0;
  border: none;
  background: none;
  color: inherit;
  font: inherit;
  text-align: left;
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

.additive-tag {
  margin-right: 4px;
}

/* 灵动层：弹性展开（grid-template-rows 0fr↔1fr，可打断） */
.candidate-body {
  display: grid;
  grid-template-rows: 0fr;
  opacity: 0;
  transition:
    grid-template-rows var(--motion-fast) var(--ease-sharp),
    opacity var(--motion-fast) var(--ease-sharp);
}

.candidate-body.is-expanded {
  grid-template-rows: 1fr;
  opacity: 1;
  transition:
    grid-template-rows var(--motion-slow) var(--ease-out),
    opacity var(--motion-base) var(--ease-out);
}

.candidate-body-inner {
  min-height: 0;
  overflow: hidden;
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
