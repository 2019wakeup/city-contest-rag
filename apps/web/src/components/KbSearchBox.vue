<script setup lang="ts">
import { computed, shallowRef } from 'vue'

import { kbSearch } from '@/api/client'
import { scoreDisplayText } from '@/utils/score'
import type { SearchHit } from '@road-rec/contracts'

const query = shallowRef('')
const topK = shallowRef(5)
const searching = shallowRef(false)
const searched = shallowRef(false)
const hits = shallowRef<SearchHit[]>([])
const errorMessage = shallowRef('')

/**
 * C7 裁决：分数仅前端展示换算——按首位命中的原始分归一化到 0-100（共享工具
 * src/utils/score.ts，与 EvidencePanel 同逻辑）；契约里的原始 score 不动。
 */
const displayHits = computed<Array<{ hit: SearchHit; scoreText: string }>>(() =>
  (hits.value ?? []).map((h) => ({
    hit: h,
    scoreText: scoreDisplayText(
      (hits.value ?? []).map((x) => x.score),
      h?.score,
    ),
  })),
)

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
    <div v-for="dh in displayHits" :key="dh.hit.chunkId" class="kb-hit">
      <p class="kb-hit-text">{{ dh.hit.text }}</p>
      <p class="kb-hit-provenance">
        来源：{{ dh.hit.provenance?.sourceDocId ?? '未知' }}
        · {{ dh.hit.docType ?? '' }}
        · 模型 {{ dh.hit.provenance?.embeddingModel ?? '-' }} v{{ dh.hit.provenance?.modelVersion ?? '-' }}
      </p>
      <p data-testid="kb-hit-score" class="kb-hit-score">相关度（归一化）：{{ dh.scoreText }}</p>
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

.kb-hit-score {
  margin: 0;
  font-size: 12px;
  color: var(--el-color-primary);
}
</style>
