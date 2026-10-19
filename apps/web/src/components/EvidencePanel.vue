<script setup lang="ts">
import { computed, ref, watch } from 'vue'

import { scoreDisplayText } from '@/utils/score'
import type { EvidenceRef } from '@road-rec/contracts'

const props = defineProps<{
  evidence: EvidenceRef[]
  ids: string[]
  /** 报告角标点击后高亮定位的 chunkId（滚动目标不变）。 */
  highlightId?: string | null
}>()

const DOC_TYPE_LABELS: Record<string, string> = {
  knowledge: '知识条目',
  standard: '规范',
  literature: '文献',
  enterprise: '企业资料',
}

/** 类型色条（色彩只表达类型，不喧宾夺主）。 */
const DOC_TYPE_COLORS: Record<string, string> = {
  knowledge: '#6E7BF2',
  standard: '#14B8A6',
  literature: '#F59E0B',
  enterprise: '#94A3B8',
}

const matches = computed(() => {
  const byId = new Map((props.evidence ?? []).map((e) => [e.chunkId, e]))
  return (props.ids ?? []).map((id) => byId.get(id)).filter((e): e is EvidenceRef => e != null)
})

const scoreTextOf = (hit: EvidenceRef): string =>
  scoreDisplayText(
    matches.value.map((m) => m.score),
    hit.score,
  )

const scorePercentOf = (hit: EvidenceRef): number => {
  const top = Math.max(
    0,
    ...matches.value.map((m) => (typeof m.score === 'number' && m.score > 0 ? m.score : 0)),
  )
  if (top <= 0 || typeof hit.score !== 'number' || hit.score < 0) return 0
  return Math.round((hit.score / top) * 100)
}

const summaryOf = (text: string): string => {
  const first = (text ?? '').split(/[。！？；\n]/)[0]?.trim() ?? ''
  return first.length > 80 ? `${first.slice(0, 80)}…` : first || (text ?? '').slice(0, 40)
}

const docTypeLabel = (docType: string): string => DOC_TYPE_LABELS[docType] ?? docType
const docTypeColor = (docType: string): string => DOC_TYPE_COLORS[docType] ?? '#94A3B8'

// C：卡片化——默认展开第 1 条，其余折叠；点击切换（高度过渡 180ms）。
const expandedIds = ref<Set<string>>(new Set())

watch(
  matches,
  (list) => {
    expandedIds.value = list.length > 0 ? new Set([list[0].chunkId]) : new Set()
  },
  { immediate: true },
)

function toggle(id: string): void {
  const next = new Set(expandedIds.value)
  if (next.has(id)) {
    next.delete(id)
  } else {
    next.add(id)
  }
  expandedIds.value = next
}
</script>

<template>
  <el-card shadow="never" data-testid="evidence-panel" class="evidence-panel">
    <template #header>证据链</template>
    <el-empty
      v-if="(evidence ?? []).length === 0"
      description="知识库为空，请执行 pnpm build:index"
      :image-size="48"
    />
    <el-empty
      v-else-if="matches.length === 0"
      description="该方案暂无证据引用"
      :image-size="48"
    />
    <template v-else>
      <p class="evidence-count">共 {{ matches.length }} 条证据 · 按相关度排序</p>
      <div class="evidence-list">
        <div
          v-for="hit in matches"
          :key="hit.chunkId"
          class="evidence-item"
          :class="{
            'is-expanded': expandedIds.has(hit.chunkId),
            'is-highlighted': highlightId === hit.chunkId,
          }"
          :data-evidence-id="hit.chunkId"
          data-testid="evidence-item"
          @click="toggle(hit.chunkId)"
        >
          <span class="evidence-type-bar" :style="{ background: docTypeColor(hit.docType ?? '') }"></span>
          <div class="evidence-item-body">
            <div class="evidence-item-head">
              <el-tag size="small" :color="docTypeColor(hit.docType ?? '')" effect="dark">
                {{ docTypeLabel(hit.docType ?? '') }}
              </el-tag>
              <span class="evidence-summary">{{ summaryOf(hit.text ?? '') }}</span>
              <span class="evidence-arrow" aria-hidden="true">⌄</span>
            </div>
            <div class="evidence-progress">
              <div
                class="evidence-progress-fill"
                :style="{ width: `${scorePercentOf(hit)}%` }"
              ></div>
            </div>
            <div class="evidence-item-detail">
              <p class="evidence-text">{{ hit.text }}</p>
              <p class="evidence-provenance">
                来源：{{ hit.provenance?.sourceDocId ?? '未知' }}
                · 模型 {{ hit.provenance?.embeddingModel ?? '-' }}
                v{{ hit.provenance?.modelVersion ?? '-' }}
              </p>
              <p data-testid="evidence-score" class="evidence-score">
                相关度（归一化）：{{ scoreTextOf(hit) }}
              </p>
            </div>
          </div>
        </div>
      </div>
    </template>
  </el-card>
</template>

<style scoped>
.evidence-count {
  margin: 0 0 12px;
  font-size: 13px;
  color: var(--el-text-color-secondary);
}

.evidence-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.evidence-item {
  position: relative;
  display: flex;
  gap: 10px;
  padding: 10px 12px 10px 16px;
  border: 1px solid var(--app-border);
  border-radius: var(--app-radius-inner);
  background: var(--el-fill-color-blank);
  cursor: pointer;
  transition:
    border-color 0.18s ease,
    background 0.18s ease;
}

.evidence-item:hover {
  border-color: var(--app-border-strong);
}

.evidence-item.is-highlighted {
  border-color: var(--el-color-primary);
  box-shadow: 0 0 0 1px var(--el-color-primary);
}

.evidence-type-bar {
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 3px;
  border-radius: var(--app-radius-inner) 0 0 var(--app-radius-inner);
}

.evidence-item-body {
  flex: 1;
  min-width: 0;
}

.evidence-item-head {
  display: flex;
  align-items: center;
  gap: 8px;
}

.evidence-summary {
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 13px;
  color: var(--el-text-color-regular);
}

.evidence-arrow {
  color: var(--el-text-color-secondary);
  transition: transform 0.18s ease;
}

.evidence-item.is-expanded .evidence-arrow {
  transform: rotate(180deg);
}

.evidence-progress {
  height: 3px;
  margin-top: 8px;
  border-radius: 2px;
  background: var(--el-fill-color-light);
  overflow: hidden;
}

.evidence-progress-fill {
  height: 100%;
  background: var(--el-color-primary);
  transition: width 0.18s ease;
}

.evidence-item-detail {
  max-height: 0;
  opacity: 0;
  overflow: hidden;
  transition:
    max-height 0.18s ease,
    opacity 0.18s ease;
}

.evidence-item.is-expanded .evidence-item-detail {
  max-height: 600px;
  opacity: 1;
}

.evidence-text {
  margin: 10px 0 8px;
  line-height: 1.7;
  color: var(--el-text-color-primary);
}

.evidence-provenance {
  margin: 0;
  font-size: 12px;
  color: var(--el-text-color-secondary);
}

.evidence-score {
  margin: 4px 0 0;
  font-size: 12px;
  color: var(--el-color-primary);
}
</style>
