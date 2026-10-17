<script setup lang="ts">
import { computed } from 'vue'

import type { CaseSeed } from '@road-rec/contracts'

const props = defineProps<{ item: CaseSeed }>()
const emit = defineEmits<{ load: [id: string] }>()

const sceneSummary = computed(() => {
  const scene = props.item?.scene
  if (!scene) return props.item?.summary ?? ''
  const distress = (scene.distresses ?? []).map((d) => d.type).join('、') || '无病害'
  return `${scene.climate?.zone ?? ''} · ${scene.traffic?.level ?? ''} · ${distress}`
})

function onLoad(): void {
  emit('load', props.item.id)
}
</script>

<template>
  <el-card shadow="hover" data-testid="case-card" class="case-card" @click="onLoad">
    <h4 class="case-title">{{ item.title }}</h4>
    <p class="case-summary">{{ item.summary }}</p>
    <p class="case-scene">{{ sceneSummary }}</p>
    <el-button type="primary" size="small" data-testid="case-load" @click.stop="onLoad">
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
  margin: 0 0 4px;
  color: var(--el-text-color-regular);
}

.case-scene {
  margin: 0 0 12px;
  font-size: 13px;
  color: var(--el-text-color-secondary);
}
</style>
