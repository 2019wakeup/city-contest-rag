<script setup lang="ts">
import { computed, ref } from 'vue'

import type { AdapterMode, Candidate, EvidenceRef } from '@road-rec/contracts'
import { formatNumber } from '@/utils/format'
import { useSpotlight } from '@/composables/useSpotlight'
import { PERF_LABELS, labelOf } from '@/utils/labels'
import { LAB_GROUP_NAMES, labLabelOf, labPassOf, labUnitOf, thresholdTextOf } from '@/utils/lab'
import type { LabIndicator } from '@road-rec/contracts'
import EvidencePanel from '@/components/EvidencePanel.vue'
import RadarChart from '@/components/RadarChart.vue'
import ShapBar from '@/components/ShapBar.vue'

const props = defineProps<{
  candidate: Candidate
  index: number
  adapterMode: AdapterMode
  evidence: EvidenceRef[]
  expanded: boolean
  highlightId?: string | null
  /** 灵动层：定位后的 600ms flash（一次性）。 */
  flashId?: string | null
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

// F2：企业实测指标折叠区（默认展开第一张卡）
const openLab = ref(props.index === 0)

const labIndicators = computed<LabIndicator[]>(() => props.candidate?.labIndicators ?? [])

const labGroupOrder: Array<{ key: string; name: string }> = ['volume', 'marshall', 'water', 'highTemp', 'lowTemp'].map((key) => ({
  key,
  name: LAB_GROUP_NAMES[key] ?? key,
}))

const labRowsOf = (groupKey: string): LabIndicator[] =>
  labIndicators.value.filter((i) => i.group === groupKey)

const labPassClass = (pass: boolean | null): string =>
  pass === true ? 'is-pass' : pass === false ? 'is-fail' : 'is-none'
const labPassText = (pass: boolean | null): string =>
  pass === true ? '✓' : pass === false ? '✗' : '—'

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

      <!-- F2：企业实测指标（折叠，默认展开第一张卡） -->
      <div v-if="labIndicators.length > 0" class="lab-section">
        <button
          type="button"
          class="lab-toggle"
          data-testid="lab-toggle"
          :aria-expanded="openLab"
          @click="openLab = !openLab"
        >
          企业实测指标
          <span class="lab-toggle-hint">{{ openLab ? '收起' : '展开' }}</span>
        </button>
        <div v-show="openLab" class="lab-body" data-testid="lab-body">
          <template v-for="group in labGroupOrder" :key="group.key">
            <div v-if="labRowsOf(group.key).length > 0" class="lab-group">
              <div class="lab-group-title">{{ group.name }}</div>
              <table class="lab-table" data-testid="lab-table">
                <thead>
                  <tr>
                    <th>指标</th>
                    <th>单位</th>
                    <th class="lab-col-num">实测值</th>
                    <th class="lab-col-num">阈值</th>
                    <th>达标</th>
                    <th class="lab-col-num">样本量</th>
                  </tr>
                </thead>
                <tbody>
                  <tr
                    v-for="row in labRowsOf(group.key)"
                    :key="row.key"
                    data-testid="lab-row"
                  >
                    <td>{{ labLabelOf(row) }}</td>
                    <td>{{ labUnitOf(row) }}</td>
                    <td class="lab-col-num tabular">
                      {{ formatNumber(row.value) }}{{ labUnitOf(row) }}
                    </td>
                    <td class="lab-col-num tabular">{{ thresholdTextOf(row.threshold) }}</td>
                    <td>
                      <span
                        class="lab-pass"
                        :class="labPassClass(labPassOf(row))"
                        data-testid="lab-pass"
                      >
                        {{ labPassText(labPassOf(row)) }}
                      </span>
                    </td>
                    <td class="lab-col-num tabular">
                      {{ row.sampleSize != null ? `n=${row.sampleSize}` : '—' }}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </template>
        </div>
      </div>

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

      <ShapBar
        v-if="explanations.length > 0"
        :explanations="explanations"
        class="candidate-waterfall"
      />

      <EvidencePanel
        :evidence="evidence ?? []"
        :ids="candidate?.evidenceIds ?? []"
        :highlight-id="highlightId"
        :flash-id="flashId"
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

/* F2：企业实测指标折叠表 */
.lab-section {
  margin: 0 0 12px;
}

.lab-toggle {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 0;
  border: none;
  background: none;
  color: var(--el-text-color-primary);
  font: inherit;
  font-weight: 600;
  cursor: pointer;
}

.lab-toggle-hint {
  font-size: 12px;
  font-weight: 400;
  color: var(--el-text-color-secondary);
}

.lab-group {
  margin-bottom: 8px;
}

.lab-group-title {
  margin: 4px 0;
  font-size: 13px;
  font-weight: 600;
  color: var(--el-text-color-regular);
}

.lab-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;
}

.lab-table th,
.lab-table td {
  padding: 4px 8px;
  border: 1px solid var(--app-border);
  text-align: left;
}

.lab-table th {
  background: var(--el-fill-color-light);
  font-weight: 600;
}

.lab-col-num {
  font-variant-numeric: tabular-nums;
}

.lab-pass {
  font-weight: 600;
}

.lab-pass.is-pass {
  color: #10b981;
}

.lab-pass.is-fail {
  color: #ef4444;
}

.lab-pass.is-none {
  color: var(--el-text-color-placeholder);
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
