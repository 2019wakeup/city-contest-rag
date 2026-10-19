<script setup lang="ts">
import { computed } from 'vue'

import { formatNumber } from '@/utils/format'
import { labelOf, STEP_LABELS } from '@/utils/labels'
import type { StepRecord } from '@road-rec/contracts'

const props = defineProps<{ steps: StepRecord[]; running?: boolean }>()

// UI二轮：running 且尚无真实 steps 时显示六步占位（逐步点亮的过程感）。
const PLACEHOLDER_TITLES = ['解析', '映射', '召回', '预测', '排序', '报告']

const items = computed(() => {
  const list = (props.steps ?? []).map((s) => ({
    title: labelOf(STEP_LABELS, s.name),
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
        <template #title>
          <span class="step-title-row">
            {{ item.title }}
            <span
              v-if="running && i === items.length - 1"
              class="step-spinner"
              data-testid="step-spinner"
              aria-label="进行中"
            ></span>
          </span>
        </template>
        <template v-if="!running && item.description" #description>
          <span class="tabular">{{ item.description }}</span>
        </template>
      </el-step>
    </el-steps>
    <el-empty v-if="items.length === 0" description="暂无步骤信息" :image-size="40" />
  </el-card>
</template>

<style scoped>
.step-title-row {
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.step-spinner {
  width: 12px;
  height: 12px;
  border: 2px solid var(--el-color-primary-light-7);
  border-top-color: var(--el-color-primary);
  border-radius: 50%;
  animation: step-spin 0.8s linear infinite;
}

@keyframes step-spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
