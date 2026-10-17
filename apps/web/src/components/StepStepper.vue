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

// UI二轮：running 且尚无真实 steps 时显示六步占位（逐步点亮的过程感）。
const PLACEHOLDER_TITLES = ['解析', '映射', '召回', '预测', '排序', '报告']

const items = computed(() => {
  const list = (props.steps ?? []).map((s) => ({
    title: STEP_LABELS[s.name] ?? s.name,
    description: s.ms != null ? `${formatNumber(s.ms)} ms` : '',
  }))
  if (list.length === 0 && props.running) {
    return PLACEHOLDER_TITLES.map((title) => ({ title, description: '' }))
  }
  return list
})

// UI#9：running 时停在最后一步之前（有真实步骤则停在末步，占位阶段从第 0 步开始）。
const activeStep = computed(() => {
  const total = items.value.length
  if (total === 0) return 0
  if (!props.running) return total
  return (props.steps ?? []).length > 0 ? Math.max((props.steps ?? []).length - 1, 0) : 0
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
