<script setup lang="ts">
import { computed } from 'vue'

import type { EvidenceRef, ReportSection as ReportSectionItem } from '@road-rec/contracts'

const props = defineProps<{
  sections: ReportSectionItem[]
  llmStatus: 'ok' | 'degraded'
  /** B：证据编号化——按报告 evidence 数组解析裸 chunkId 为「证据 N」。 */
  evidence?: EvidenceRef[]
}>()
const emit = defineEmits<{ cite: [evidenceId: string] }>()

// chunkId 形态（如 k-modifier-002:0、std-9:1、lit-012:0:bge-m3@1）。
const ID_PATTERN = /[a-z][a-z0-9-]*(?::\d+)+(?::[a-z0-9._-]+)?/gi

interface Segment {
  text: string
  id?: string
}

/** 段落中裸证据 id → 可点击角标（点击滚动定位到证据链对应 chunk）。 */
function parseSegments(paragraph: string): Segment[] {
  const segments: Segment[] = []
  let last = 0
  for (const m of paragraph.matchAll(ID_PATTERN)) {
    const index = m.index ?? 0
    if (index > last) segments.push({ text: paragraph.slice(last, index) })
    segments.push({ text: m[0], id: m[0] })
    last = index + m[0].length
  }
  if (last < paragraph.length) segments.push({ text: paragraph.slice(last) })
  return segments
}

const DOC_TYPE_LABELS: Record<string, string> = {
  knowledge: '知识条目',
  standard: '规范',
  literature: '文献',
  enterprise: '企业资料',
}

const evidenceById = computed(
  () => new Map((props.evidence ?? []).map((e) => [e.chunkId, e])),
)

/** 编号映射：按出现顺序（引用块→段落内联）给每个 chunkId 分配「证据 N」。 */
const citeNumber = computed(() => {
  const map = new Map<string, number>()
  let next = 1
  const assign = (id: string): number => {
    if (!map.has(id)) {
      map.set(id, next)
      next += 1
    }
    return map.get(id) as number
  }
  for (const s of props.sections ?? []) {
    for (const id of s.evidenceIds ?? []) assign(id)
  }
  for (const s of props.sections ?? []) {
    for (const p of s.paragraphs ?? []) {
      for (const seg of parseSegments(p)) {
        if (seg.id) assign(seg.id)
      }
    }
  }
  return map
})

const citeLabel = (id: string): string => `证据 ${citeNumber.value.get(id) ?? '?'}`

const citeTooltip = (id: string): string => {
  const hit = evidenceById.value.get(id)
  if (!hit) return '证据来源不可用'
  return `[${DOC_TYPE_LABELS[hit.docType ?? ''] ?? hit.docType ?? '未知'}] ${(hit.text ?? '').slice(0, 40)}`
}

function onCite(id: string): void {
  emit('cite', id)
}
</script>

<template>
  <el-card shadow="hover" data-testid="report-section" class="report-section">
    <template #header>推荐报告</template>
    <el-alert
      v-if="llmStatus === 'degraded'"
      type="info"
      :closable="false"
      show-icon
      title="文案模板降级：LLM 不可用，以下文案由确定性模板生成，数据结果不受影响"
      class="report-degraded"
    />
    <el-empty
      v-if="(sections ?? []).length === 0"
      description="暂无报告文案"
      :image-size="48"
    />
    <section
      v-for="(s, i) in sections ?? []"
      :key="`${s.title}-${i}`"
      class="report-block report-stagger"
      :style="{ '--i': i }"
    >
      <h4 class="report-title">{{ s.title }}</h4>
      <p v-for="(p, j) in s.paragraphs ?? []" :key="j" class="report-paragraph">
        <template v-for="(seg, k) in parseSegments(p)" :key="k">
          <el-tooltip v-if="seg.id" :content="citeTooltip(seg.id)" placement="top">
            <button
              type="button"
              class="report-cite"
              data-testid="evidence-cite"
              @click="onCite(seg.id)"
            >
              {{ citeLabel(seg.id) }}
            </button>
          </el-tooltip>
          <template v-else>{{ seg.text }}</template>
        </template>
      </p>
      <div v-if="(s.evidenceIds ?? []).length > 0" class="report-refs">
        <el-tooltip
          v-for="eid in s.evidenceIds ?? []"
          :key="eid"
          :content="citeTooltip(eid)"
          placement="top"
        >
          <span class="report-ref-wrap" data-testid="evidence-cite" @click="onCite(eid)">
            <el-tag size="small" type="info" class="report-ref-tag">
              {{ citeLabel(eid) }}
            </el-tag>
          </span>
        </el-tooltip>
      </div>
    </section>
  </el-card>
</template>

<style scoped>
.report-degraded {
  margin-bottom: 12px;
}

.report-title {
  margin: 0 0 8px;
}

.report-paragraph {
  margin: 0 0 8px;
  line-height: 1.7;
  color: var(--el-text-color-regular);
}

.report-cite {
  display: inline-block;
  margin: 0 2px;
  padding: 0 6px;
  border: none;
  border-radius: 4px;
  background: var(--el-color-primary-light-9);
  color: var(--el-color-primary);
  font-size: 12px;
  line-height: 20px;
  font-variant-numeric: tabular-nums;
  cursor: pointer;
}

.report-cite:hover {
  background: var(--el-color-primary-light-8);
}

.report-refs {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-bottom: 12px;
}

.report-ref-wrap {
  cursor: pointer;
}

.report-ref-tag {
  cursor: pointer;
}

/* 错峰淡入（stagger 100ms；遵守 reduced-motion） */
.report-block.report-stagger {
  animation: report-fade-in 0.4s ease both;
  animation-delay: calc(var(--i, 0) * 100ms);
}

@keyframes report-fade-in {
  from {
    opacity: 0;
    transform: translateY(8px);
  }

  to {
    opacity: 1;
    transform: none;
  }
}

@media (prefers-reduced-motion: reduce) {
  .report-block.report-stagger {
    animation: none;
  }
}
</style>
