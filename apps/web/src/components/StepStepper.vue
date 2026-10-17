<script setup lang="ts">
import { computed } from 'vue'

import type { StepRecord } from '@road-rec/contracts'

const props = defineProps<{ steps: StepRecord[] }>()

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
    description: s.ms != null ? `${s.ms} ms` : '',
  })),
)
</script>

<template>
  <el-card shadow="never" class="step-stepper">
    <template #header>执行步骤</template>
    <el-steps :active="items.length" align-center finish-status="success">
      <el-step
        v-for="(item, i) in items"
        :key="`${item.title}-${i}`"
        :title="item.title"
        :description="item.description"
      />
    </el-steps>
    <el-empty v-if="items.length === 0" description="暂无步骤信息" :image-size="40" />
  </el-card>
</template>
