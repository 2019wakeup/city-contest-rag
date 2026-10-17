<script setup lang="ts">
import { shallowRef } from 'vue'

import { kbSearch } from '@/api/client'
import type { SearchHit } from '@road-rec/contracts'

const query = shallowRef('')
const topK = shallowRef(5)
const searching = shallowRef(false)
const searched = shallowRef(false)
const hits = shallowRef<SearchHit[]>([])
const errorMessage = shallowRef('')

async function search(): Promise<void> {
  if (!query.value.trim() || searching.value) return
  searching.value = true
  errorMessage.value = ''
  try {
    hits.value = await kbSearch({ query: query.value.trim(), topK: topK.value })
    searched.value = true
  } catch (err) {
    hits.value = []
    errorMessage.value = err instanceof Error ? err.message : String(err)
  } finally {
    searching.value = false
  }
}
</script>

<template>
  <el-card shadow="never" class="kb-search">
    <template #header>检索测试</template>
    <div class="kb-search-row">
      <el-input
        v-model="query"
        data-testid="kb-search-input"
        placeholder="输入检索词，如：车辙 SBS"
        @keydown.enter.prevent="search"
      />
      <el-input-number v-model="topK" :min="1" :max="20" class="kb-search-topk" />
      <el-button
        type="primary"
        data-testid="kb-search-btn"
        :disabled="searching || !query.trim()"
        @click="search"
      >
        {{ searching ? '检索中…' : '检索' }}
      </el-button>
    </div>
    <el-alert
      v-if="errorMessage"
      type="error"
      :closable="false"
      :title="`检索失败：${errorMessage}`"
      class="kb-search-alert"
    />
    <div v-for="hit in hits" :key="hit.chunkId" class="kb-hit">
      <p class="kb-hit-text">{{ hit.text }}</p>
      <p class="kb-hit-provenance">
        来源：{{ hit.provenance?.sourceDocId ?? '未知' }}
        · {{ hit.docType ?? '' }}
        · 模型 {{ hit.provenance?.embeddingModel ?? '-' }} v{{ hit.provenance?.modelVersion ?? '-' }}
        · 相关度 {{ (hit.score ?? 0).toFixed(3) }}
      </p>
    </div>
    <el-empty
      v-if="!searching && searched && hits.length === 0"
      description="无命中结果"
      :image-size="48"
    />
  </el-card>
</template>

<style scoped>
.kb-search-row {
  display: flex;
  gap: 8px;
  align-items: center;
  margin-bottom: 12px;
}

.kb-search-topk {
  width: 110px;
}

.kb-search-alert {
  margin-bottom: 12px;
}

.kb-hit {
  padding: 8px 0;
  border-bottom: 1px solid var(--el-border-color-lighter);
}

.kb-hit-text {
  margin: 0 0 4px;
  line-height: 1.6;
}

.kb-hit-provenance {
  margin: 0;
  font-size: 12px;
  color: var(--el-text-color-secondary);
}
</style>
