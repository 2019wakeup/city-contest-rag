<script setup lang="ts">
import { computed } from 'vue'

import type { AdapterMode, Candidate, EvidenceRef } from '@road-rec/contracts'
import EvidencePanel from '@/components/EvidencePanel.vue'
import RadarChart from '@/components/RadarChart.vue'
import WaterfallChart from '@/components/WaterfallChart.vue'

const props = defineProps<{
  candidate: Candidate
  index: number
  adapterMode: AdapterMode
  evidence: EvidenceRef[]
}>()

const isMock = computed(
  () => props.adapterMode?.a === 'mock' || props.adapterMode?.c === 'mock',
)

const formula = computed(() => props.candidate?.formula)
const radar = computed(() => props.candidate?.radar)
const explanations = computed(() => props.candidate?.explanations ?? [])
</script>

<template>
  <el-card shadow="never" data-testid="candidate-card" class="candidate-card">
    <template #header>
      <div class="candidate-header">
        <span class="candidate-title">方案 {{ index + 1 }}（{{ candidate?.id ?? '未知' }}）</span>
        <span class="candidate-score">综合得分 {{ (candidate?.score ?? 0).toFixed(3) }}</span>
        <el-tag v-if="isMock" type="warning" data-testid="mock-badge">模拟数据</el-tag>
      </div>
    </template>

    <el-descriptions :column="2" size="small" border class="candidate-formula">
      <el-descriptions-item label="沥青">
        {{ formula?.binder?.type ?? '—' }}（{{ formula?.binder?.grade ?? '—' }}）
      </el-descriptions-item>
      <el-descriptions-item label="改性剂">
        {{ formula?.modifier?.type || '无' }}
        <template v-if="formula?.modifier?.type"> · 掺量 {{ formula?.modifier?.dosage ?? '—' }}%</template>
      </el-descriptions-item>
      <el-descriptions-item label="级配">
        {{ formula?.gradation?.type ?? '—' }}
      </el-descriptions-item>
      <el-descriptions-item label="油石比 / 空隙率">
        {{ formula?.oilStoneRatio ?? '—' }}% / {{ formula?.airVoids ?? '—' }}%
      </el-descriptions-item>
    </el-descriptions>

    <ul class="candidate-predictions">
      <li v-for="(p, i) in candidate?.predictions ?? []" :key="`${p.perf}-${i}`">
        {{ p.perf }}：{{ p.value }}<template v-if="p.ciLow != null && p.ciHigh != null">
          （{{ p.ciLow }} ~ {{ p.ciHigh }}）</template> {{ p.unit ?? '' }}
      </li>
      <li class="candidate-kpis">
        LCC {{ candidate?.lcc ?? '—' }} 万元 · 碳排 {{ candidate?.carbon ?? '—' }} tCO2e
        · 预期寿命 {{ candidate?.expectedLife ?? '—' }} 年
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
    />
  </el-card>
</template>

<style scoped>
.candidate-card {
  margin-bottom: 16px;
}

.candidate-header {
  display: flex;
  align-items: center;
  gap: 12px;
}

.candidate-title {
  font-weight: 600;
}

.candidate-score {
  color: var(--el-color-primary);
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
  margin-bottom: 4px;
}

.candidate-kpis {
  list-style: none;
}

.candidate-waterfall {
  margin-bottom: 12px;
}
</style>
