<script setup lang="ts">
import { computed } from 'vue'

import { useSpotlight } from '@/composables/useSpotlight'

import { DISTRESS_LABELS, TRAFFIC_LEVEL_LABELS, labelOf as labelOfLabel } from '@/utils/labels'

import type { CaseSeed } from '@road-rec/contracts'

const props = defineProps<{ item: CaseSeed }>()
const emit = defineEmits<{ load: [id: string] }>()

const TAG_LABELS: Record<string, string> = {
  ...TRAFFIC_LEVEL_LABELS,
  ...DISTRESS_LABELS,
}

const labelOf = (tag: string): string => labelOfLabel(TAG_LABELS, tag)

// 灵动层：聚光（案例卡）
const spotlight = useSpotlight()

const sceneSummary = computed(() => {
  const scene = props.item?.scene
  if (!scene) return ''
  const distress = (scene.distresses ?? []).map((d) => labelOf(d.type)).join('、') || '无病害'
  return `${scene.climate?.zone ?? ''} · ${labelOf(scene.traffic?.level ?? '')} · ${distress}`
})

function onLoad(): void {
  emit('load', props.item.id)
}
</script>

<template>
  <el-card
    shadow="hover"
    data-testid="case-card"
    class="case-card spotlight-card hover-lift"
    @click="onLoad"
    @pointermove="spotlight.onPointerMove"
    @pointerleave="spotlight.onPointerLeave"
  >
    <h4 class="case-title">{{ item.title }}</h4>
    <p data-testid="case-summary" class="case-summary">{{ item.summary }}</p>
    <p v-if="sceneSummary" data-testid="case-scene" class="case-scene">{{ sceneSummary }}</p>
    <el-button
      type="primary"
      size="small"
      data-testid="case-load"
      :aria-label="`载入案例：${item.title}`"
      @click.stop="onLoad"
    >
      载入工作台
    </el-button>
  </el-card>
</template>

<style scoped>
.case-card {
  cursor: pointer;
}

.case-title {
  margin: 0 0 8px;
}

.case-summary {
  margin: 0 0 8px;
  color: var(--el-text-color-regular);
}

.case-scene {
  margin: 0 0 12px;
  font-size: 13px;
  color: var(--el-text-color-secondary);
}
</style>
