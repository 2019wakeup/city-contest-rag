<script setup lang="ts">
import type { KbStats as KbStatsShape } from '@/api/client'

defineProps<{ stats: KbStatsShape | null }>()
</script>

<template>
  <el-card shadow="never" class="kb-stats">
    <template #header>知识库统计</template>
    <div class="kb-stats-row">
      <span class="kb-stats-label">文档 / 块总数</span>
      <span data-testid="kb-count" class="kb-stats-value">{{ stats?.count ?? '—' }}</span>
    </div>
    <div class="kb-stats-row">
      <span class="kb-stats-label">检索后端</span>
      <span class="kb-stats-value">{{ stats?.backend ?? '—' }}</span>
    </div>
    <div class="kb-stats-row">
      <span class="kb-stats-label">类型分布</span>
      <span class="kb-stats-value">
        <el-tag v-for="(v, k) in stats?.docTypes ?? {}" :key="k" size="small" class="kb-type-tag">
          {{ k }}：{{ v }}
        </el-tag>
        <template v-if="Object.keys(stats?.docTypes ?? {}).length === 0">—</template>
      </span>
    </div>
  </el-card>
</template>

<style scoped>
.kb-stats-row {
  display: flex;
  gap: 12px;
  margin-bottom: 8px;
}

.kb-stats-label {
  color: var(--el-text-color-secondary);
}

.kb-stats-value {
  font-weight: 600;
}

.kb-type-tag {
  margin-right: 6px;
}
</style>
