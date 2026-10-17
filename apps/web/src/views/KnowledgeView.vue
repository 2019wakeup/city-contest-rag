<script setup lang="ts">
import { onMounted, shallowRef } from 'vue'

import { kbRebuild, kbStats } from '@/api/client'
import type { KbStats as KbStatsShape } from '@/api/client'
import KbSearchBox from '@/components/KbSearchBox.vue'
import KbStats from '@/components/KbStats.vue'
import KbUpload from '@/components/KbUpload.vue'

// 知识库管理页：统计卡 + 上传（粘贴文本/文本文件）+ 检索测试框 + 重建索引按钮。
const stats = shallowRef<KbStatsShape | null>(null)
const loadError = shallowRef('')
const rebuilding = shallowRef(false)
const rebuildResult = shallowRef('')

async function refreshStats(): Promise<void> {
  try {
    stats.value = await kbStats()
  } catch (err) {
    loadError.value = err instanceof Error ? err.message : String(err)
  }
}

onMounted(refreshStats)

async function rebuild(): Promise<void> {
  if (rebuilding.value) return
  rebuilding.value = true
  rebuildResult.value = ''
  try {
    const result = await kbRebuild()
    rebuildResult.value = `重建完成：共 ${result.count ?? 0} 条`
    await refreshStats()
  } catch (err) {
    rebuildResult.value = `重建失败：${err instanceof Error ? err.message : String(err)}`
  } finally {
    rebuilding.value = false
  }
}
</script>

<template>
  <div class="knowledge-view">
    <h3 class="knowledge-title">知识库管理</h3>
    <el-alert
      v-if="loadError"
      type="error"
      :closable="false"
      :title="`统计加载失败：${loadError}`"
      class="knowledge-alert"
    />

    <KbStats :stats="stats" class="knowledge-panel" />

    <el-row :gutter="16">
      <el-col :xs="24" :md="12">
        <KbUpload @uploaded="refreshStats" class="knowledge-panel" />
      </el-col>
      <el-col :xs="24" :md="12">
        <KbSearchBox class="knowledge-panel" />
      </el-col>
    </el-row>

    <el-card shadow="never" class="knowledge-panel">
      <template #header>索引维护</template>
      <el-button
        type="warning"
        data-testid="kb-rebuild-btn"
        :loading="rebuilding"
        @click="rebuild"
      >
        重建索引
      </el-button>
      <span v-if="rebuildResult" class="knowledge-rebuild-result">{{ rebuildResult }}</span>
    </el-card>
  </div>
</template>

<style scoped>
.knowledge-title {
  margin: 0 0 16px;
}

.knowledge-alert {
  margin-bottom: 12px;
}

.knowledge-panel {
  margin-bottom: 16px;
}

.knowledge-rebuild-result {
  margin-left: 12px;
  color: var(--el-color-success);
}
</style>
