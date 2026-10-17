<script setup lang="ts">
import { computed } from 'vue'

import { formatNumber } from '@/utils/format'
import type { BenchmarkRow } from '@road-rec/contracts'

const props = defineProps<{ rows: BenchmarkRow[] }>()

// 对比列 = 所有行里出现过的候选 id（未知候选 id 也能渲染，前向兼容）。
const candidateIds = computed(() => [
  ...new Set((props.rows ?? []).flatMap((r) => Object.keys(r.candidates ?? {}))),
])
</script>

<template>
  <el-card shadow="never" class="benchmark-table">
    <template #header>与规范查表基线对比</template>
    <el-table :data="rows ?? []" size="small">
      <el-table-column prop="label" label="指标" />
      <el-table-column label="规范基线" align="right">
        <template #default="{ row }">
          <span class="tabular">{{ formatNumber(row.baseline) }} {{ row.unit ?? '' }}</span>
        </template>
      </el-table-column>
      <el-table-column v-for="cid in candidateIds" :key="cid" :label="cid" align="right">
        <template #default="{ row }">
          <span class="tabular">{{ formatNumber(row.candidates?.[cid]) }}</span>
        </template>
      </el-table-column>
    </el-table>
    <el-empty
      v-if="(rows ?? []).length === 0"
      description="暂无基准对比数据"
      :image-size="40"
    />
  </el-card>
</template>
