<script setup lang="ts">
import { computed, ref, watch } from 'vue'

import { DOC_TYPE_LABELS } from '@/utils/labels'
import { scoreDisplayText } from '@/utils/score'
import type { EvidenceRef } from '@road-rec/contracts'

const props = defineProps<{
  evidence: EvidenceRef[]
  ids: string[]
  /** 报告角标点击后高亮定位的 chunkId（滚动目标不变）。 */
  highlightId?: string | null
  /** 灵动层：定位后的 600ms 背景 flash（一次性）。 */
  flashId?: string | null
}>()


/** 类型色条（色彩只表达类型；table 深青、literature-full 石板灰，避免与既有 4 类撞色）。 */
const DOC_TYPE_COLORS: Record<string, string> = {
  knowledge: '#6E7BF2',
  standard: '#14B8A6',
  literature: '#F59E0B',
  enterprise: '#94A3B8',
  table: '#0F766E',
  'literature-full': '#64748B',
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

// ---- RAG P0：markdown 表格证据（简单按行/列解析，不做完整 markdown） ----
const TABLE_ROW_LIMIT = 8
const TABLE_COL_LIMIT = 6

const isSeparatorLine = (line: string): boolean =>
  /^\s*\|[\s:|-]+\|\s*$/.test(line) && line.includes('-')

const isTableText = (text: string): boolean => (text ?? '').split('\n').some(isSeparatorLine)

function splitCells(line: string): string[] {
  return line
    .replace(/^\s*\|/, '')
    .replace(/\|\s*$/, '')
    .split('|')
    .map((c) => c.trim())
    .slice(0, TABLE_COL_LIMIT)
}

interface ParsedTable {
  header: string[]
  rows: string[][]
  totalRows: number
}

function parseTable(text: string): ParsedTable {
  const lines = (text ?? '').split('\n')
  const sepIndex = lines.findIndex(isSeparatorLine)
  const header = sepIndex > 0 ? splitCells(lines[sepIndex - 1]) : []
  const rows: string[][] = []
  for (let i = sepIndex + 1; i < lines.length; i++) {
    const line = lines[i].trim()
    if (!line.startsWith('|')) break
    rows.push(splitCells(line))
  }
  return { header, rows, totalRows: rows.length }
}

const summaryOf = (text: string): string => {
  const source = text ?? ''
  let first = ''
  if (isTableText(source)) {
    // 折叠态只显示 caption 首句（表格分隔行之前的内容）
    const lines = source.split('\n')
    const sepIndex = lines.findIndex(isSeparatorLine)
    const caption = lines.slice(0, sepIndex > 0 ? sepIndex : 1).join(' ').trim()
    first = caption.split(/[。！？；]/)[0]?.trim() ?? ''
    if (!first) return '表格数据'
  } else {
    first = source.split(/[。！？；\n]/)[0]?.trim() ?? ''
  }
  return first.length > 80 ? `${first.slice(0, 80)}…` : first || source.slice(0, 40)
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
      description="知识库暂无内容，请先导入资料"
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
        <button
          v-for="hit in matches"
          :key="hit.chunkId"
          type="button"
          class="evidence-item"
          :class="{
            'is-expanded': expandedIds.has(hit.chunkId),
            'is-highlighted': highlightId === hit.chunkId,
            'is-flash': flashId === hit.chunkId,
          }"
          :data-evidence-id="hit.chunkId"
          data-testid="evidence-item"
          :aria-expanded="expandedIds.has(hit.chunkId)"
          @click="toggle(hit.chunkId)"
        >
          <span class="evidence-type-bar" :style="{ background: docTypeColor(hit.docType ?? '') }"></span>
          <div class="evidence-item-body">
            <div class="evidence-item-head">
              <span class="evidence-doc-type" :class="`doc-type--${hit.docType ?? ''}`">
                <el-tag
                  size="small"
                  :color="docTypeColor(hit.docType ?? '')"
                  effect="dark"
                >
                  {{ docTypeLabel(hit.docType ?? '') }}
                </el-tag>
              </span>
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
              <div class="evidence-detail-inner">
              <template v-if="isTableText(hit.text ?? '')">
                <div class="evidence-table-wrap">
                  <table class="evidence-table" data-testid="evidence-table">
                    <thead>
                      <tr>
                        <th v-for="(cell, ci) in parseTable(hit.text ?? '').header" :key="ci">
                          {{ cell }}
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr
                        v-for="(row, ri) in parseTable(hit.text ?? '').rows.slice(0, TABLE_ROW_LIMIT)"
                        :key="ri"
                      >
                        <td v-for="(cell, ci) in row" :key="ci">{{ cell }}</td>
                      </tr>
                      <tr v-if="parseTable(hit.text ?? '').totalRows > TABLE_ROW_LIMIT">
                        <td
                          :colspan="parseTable(hit.text ?? '').header.length || 1"
                          class="evidence-table-more"
                        >
                          …（共 {{ parseTable(hit.text ?? '').totalRows }} 行）
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </template>
              <p v-else class="evidence-text">{{ hit.text }}</p>
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
        </button>
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
  width: 100%;
  text-align: left;
  font: inherit;
  color: inherit;
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

/* 灵动层：定位 flash（一次性 600ms 背景高亮） */
.evidence-item.is-flash {
  animation: evidence-flash 0.6s var(--ease-out);
}

@keyframes evidence-flash {
  0% {
    background: var(--el-color-primary-light-8);
  }

  100% {
    background: var(--el-fill-color-blank);
  }
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
  transition: transform var(--motion-base) var(--ease-spring);
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
  display: grid;
  grid-template-rows: 0fr;
  opacity: 0;
  transition:
    grid-template-rows var(--motion-fast) var(--ease-sharp),
    opacity var(--motion-fast) var(--ease-sharp);
}

.evidence-item.is-expanded .evidence-item-detail {
  grid-template-rows: 1fr;
  opacity: 1;
  transition:
    grid-template-rows var(--motion-slow) var(--ease-out),
    opacity var(--motion-base) var(--ease-out);
}

.evidence-detail-inner {
  min-height: 0;
  overflow: hidden;
}

.evidence-text {
  margin: 10px 0 8px;
  line-height: 1.7;
  color: var(--el-text-color-primary);
}

/* RAG P0：结构化表格证据 */
.evidence-table-wrap {
  margin: 10px 0 8px;
  overflow-x: auto;
}

.evidence-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;
  font-variant-numeric: tabular-nums;
}

.evidence-table th,
.evidence-table td {
  padding: 6px 10px;
  border: 1px solid var(--app-border);
  text-align: left;
  white-space: nowrap;
}

.evidence-table th {
  background: var(--el-fill-color-light);
  font-weight: 600;
}

.evidence-table-more {
  text-align: center;
  color: var(--el-text-color-secondary);
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
