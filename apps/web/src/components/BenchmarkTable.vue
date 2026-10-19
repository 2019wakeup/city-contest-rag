<script setup lang="ts">
import { computed } from 'vue'

import { formatNumber } from '@/utils/format'
import { LOWER_BETTER_DIMS, radarDimOfLabel } from '@/utils/radar'
import type { BenchmarkRow, Candidate, TargetProfile } from '@road-rec/contracts'

const props = defineProps<{
  rows: BenchmarkRow[]
  /** P2：候选信息（列头「方案 N·简称」）与目标（达标判定）。 */
  candidates?: Candidate[]
  targets?: TargetProfile | null
}>()

// 对比列 = 所有行里出现过的候选 id（未知候选 id 也能渲染，前向兼容）。
const candidateIds = computed(() => [
  ...new Set((props.rows ?? []).flatMap((r) => Object.keys(r.candidates ?? {}))),
])

const candidateLabel = (id: string): string => {
  const index = (props.candidates ?? []).findIndex((c) => c.id === id)
  const binder = props.candidates?.[index]?.formula?.binder?.type
  if (index >= 0 && binder) return `方案 ${index + 1}·${binder}`
  return `方案 ${id.replace(/^cand-/, '')}`
}

const directionOf = (label: string): string => {
  const dim = radarDimOfLabel(label)
  if (dim && LOWER_BETTER_DIMS.has(dim)) return '低越好'
  return '高越好'
}

/** 目标值（按维度匹配报告目标）。 */
function targetValueOf(label: string): number | null {
  const dim = radarDimOfLabel(label)
  if (!dim) return null
  const target = (props.targets?.targets ?? []).find(
    (t) => radarDimOfLabel(t.perf) === dim || t.perf === dim,
  )
  return target?.value != null && Number.isFinite(target.value) ? target.value : null
}

/** P2：未达标判定——高越优 value < 目标；低越优 value > 目标。 */
function isBelow(row: BenchmarkRow, id: string): boolean {
  const value = row.candidates?.[id]
  if (value == null || !Number.isFinite(value)) return false
  const target = targetValueOf(row.label)
  if (target == null) return false
  const dim = radarDimOfLabel(row.label)
  if (dim && LOWER_BETTER_DIMS.has(dim)) return value > target
  return value < target
}

/** P2：相对基线差值 + 百分比（如 +12℃ / +18.8%）。 */
function deltaText(row: BenchmarkRow, id: string): string {
  const value = row.candidates?.[id]
  if (value == null || !Number.isFinite(value)) return '—'
  const baseline = row.baseline
  if (baseline == null || !Number.isFinite(baseline) || baseline === 0) {
    return formatNumber(value)
  }
  const delta = value - baseline
  const percent = (delta / Math.abs(baseline)) * 100
  const sign = delta >= 0 ? '+' : ''
  return `${sign}${formatNumber(delta)}${row.unit ?? ''} / ${sign}${percent.toFixed(1)}%`
}
</script>

<template>
  <el-card shadow="never" class="benchmark-table">
    <el-table :data="rows ?? []" size="small">
      <el-table-column prop="label" label="指标" />
      <el-table-column label="方向">
        <template #default="{ row }">
          <span class="bench-direction">{{ directionOf(row.label) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="规范基线" align="right">
        <template #default="{ row }">
          <span class="tabular">{{ formatNumber(row.baseline) }} {{ row.unit ?? '' }}</span>
        </template>
      </el-table-column>
      <el-table-column
        v-for="cid in candidateIds"
        :key="cid"
        :label="candidateLabel(cid)"
        align="right"
      >
        <template #default="{ row }">
          <div class="bench-cell" :class="{ 'is-below': isBelow(row, cid) }">
            <div class="bench-value tabular">
              {{ formatNumber(row.candidates?.[cid]) }}{{ row.unit ?? '' }}
            </div>
            <div class="bench-delta tabular">{{ deltaText(row, cid) }}</div>
          </div>
        </template>
      </el-table-column>
    </el-table>
    <p class="bench-note">低温/成本/碳排越低越好</p>
    <el-empty
      v-if="(rows ?? []).length === 0"
      description="暂无基准对比数据"
      :image-size="40"
    />
  </el-card>
</template>

<style scoped>
.bench-cell {
  text-align: right;
}

.bench-cell.is-below .bench-value {
  color: var(--el-color-danger);
}

.bench-delta {
  font-size: 12px;
  color: var(--el-text-color-secondary);
}

.bench-direction {
  font-size: 12px;
  color: var(--el-text-color-secondary);
}

.bench-note {
  margin: 8px 0 0;
  font-size: 12px;
  text-align: right;
  color: var(--el-text-color-placeholder);
}
</style>
