<script setup lang="ts">
import { computed } from 'vue'

import { formatNumber } from '@/utils/format'
import type { StepRecord } from '@road-rec/contracts'

const props = defineProps<{ steps: StepRecord[]; running?: boolean }>()

// 后端步骤名 → 中文显示；未知步骤名直接显示原名（前向兼容）。
const STEP_LABELS: Record<string, string> = {
  parse: '解析',
  mapping: '映射',
  recall: '召回',
  predict: '预测',
  rank: '排序',
  report: '报告',
}

const items = computed(() =>
  (props.steps ?? []).map((s) => ({
    title: STEP_LABELS[s.name] ?? s.name,
    description: s.ms != null ? `${formatNumber(s.ms)} ms` : '',
  })),
)

// UI#9：running 时停在最后一步之前，渲染"进行中"过程感；完成后全部点亮。
const activeStep = computed(() => {
  const total = items.value.length
  if (total === 0) return 0
  return props.running ? Math.max(total - 1, 0) : total
})
</script>

<template>
  <el-card shadow="never" class="step-stepper">
    <template #header>执行步骤</template>
    <el-steps :active="activeStep" align-center finish-status="success">
      <el-step
        v-for="(item, i) in items"
        :key="`${item.title}-${i}`"
        :title="item.title"
      >
        <template v-if="!running" #description>
          <span class="tabular">{{ item.description }}</span>
        </template>
      </el-step>
    </el-steps>
    <el-empty v-if="items.length === 0" description="暂无步骤信息" :image-size="40" />
  </el-card>
</template>
