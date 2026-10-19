<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, reactive, watch } from 'vue'

import { DOC_TYPE_LABELS } from '@/utils/labels'
import type { EvidenceRef, ReportSection as ReportSectionItem } from '@road-rec/contracts'

const props = defineProps<{
  sections: ReportSectionItem[]
  llmStatus: 'ok' | 'degraded'
  /** B：证据编号化——按报告 evidence 数组解析裸 chunkId 为「证据 N」。 */
  evidence?: EvidenceRef[]
  /** E：打字机逐字揭示（~60 字/120ms）；reduced-motion 直接显示。 */
  typewriter?: boolean
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

/** P2：正文中 cand-N（backend 已按名次重编号）→ 「方案 N」。 */
function humanizeCandidateRefs(text: string): string {
  return text.replace(/\bcand-(\d+)\b/gi, (_match, n: string) => `方案 ${n}`)
}

/** P5：数字与单位之间用 &nbsp;（避免断行拆散 4.5%/12年/8万元）。 */
function withUnitNbsp(text: string): string {
  return text.replace(/(\d+)(\s*)(%|℃|年|天|万元|mm|MPa|次|tCO2e|ESAL)/g, '$1\u00A0$3')
}

// ===== E：打字机逐字揭示 =====
const TYPE_CHARS_PER_TICK = 60
const TYPE_TICK_MS = 120

interface FlatParagraph {
  text: string
  secIndex: number
  start: number // 全局起始字符偏移（累计）
}

const flatParagraphs = computed<FlatParagraph[]>(() => {
  let offset = 0
  const list: FlatParagraph[] = []
  ;(props.sections ?? []).forEach((s, si) => {
    ;(s.paragraphs ?? []).forEach((text) => {
      list.push({ text, secIndex: si, start: offset })
      offset += text.length
    })
  })
  return list
})

const totalChars = computed(() => {
  const list = flatParagraphs.value
  return list.length > 0 ? list[list.length - 1].start + list[list.length - 1].text.length : 0
})

/** 每 section 结束偏移（用于判断该段是否揭示完成）。 */
const sectionEnds = computed(() => {
  const ends: number[] = []
  let offset = 0
  ;(props.sections ?? []).forEach((s) => {
    ;(s.paragraphs ?? []).forEach((text) => {
      offset += text.length
    })
    ends.push(offset)
  })
  return ends
})

const reveal = reactive({ shown: 0, done: false })
let typeTimer: ReturnType<typeof setInterval> | undefined

function prefersReducedMotion(): boolean {
  return typeof window.matchMedia === 'function' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

function stopTypewriter(): void {
  if (typeTimer) {
    clearInterval(typeTimer)
    typeTimer = undefined
  }
}

function ensureTypewriter(): void {
  if (!props.typewriter || typeTimer) return
  if (reveal.shown >= totalChars.value) {
    reveal.done = reveal.shown > 0 || totalChars.value === 0
    return
  }
  typeTimer = setInterval(() => {
    reveal.shown = Math.min(totalChars.value, reveal.shown + TYPE_CHARS_PER_TICK)
    if (reveal.shown >= totalChars.value) {
      stopTypewriter()
      reveal.done = true
    }
  }, TYPE_TICK_MS)
}

function restartTypewriter(): void {
  stopTypewriter()
  if (!props.typewriter) return
  if (prefersReducedMotion()) {
    reveal.shown = totalChars.value
    reveal.done = true
    return
  }
  reveal.shown = Math.min(reveal.shown, totalChars.value)
  reveal.done = reveal.shown >= totalChars.value && totalChars.value > 0
  ensureTypewriter()
}

onMounted(restartTypewriter)
watch(() => totalChars.value, restartTypewriter)
onBeforeUnmount(stopTypewriter)

const visibleText = (flat: FlatParagraph): string => {
  if (!props.typewriter) return flat.text
  const visible = reveal.shown - flat.start
  if (visible <= 0) return ''
  return flat.text.slice(0, visible)
}

const sectionDone = (si: number): boolean => {
  if (!props.typewriter) return true
  const end = sectionEnds.value[si] ?? 0
  return reveal.shown >= end
}

const flatIndexOf = (secIndex: number, paraIndex: number): number => {
  let idx = 0
  for (let si = 0; si < secIndex; si++) {
    idx += (props.sections?.[si]?.paragraphs ?? []).length
  }
  return idx + paraIndex
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
      title="AI 文案暂不可用，以下为模板文案（数值不受影响）"
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
      <h4 class="report-title">
        {{ s.title }}
        <span v-if="typewriter && !sectionDone(i)" class="reveal-badge">生成中…</span>
        <span v-else-if="typewriter" class="reveal-badge is-done">已完成</span>
      </h4>
      <p v-for="(p, j) in s.paragraphs ?? []" :key="j" class="report-paragraph">
        <template
          v-for="(seg, k) in parseSegments(
            withUnitNbsp(
              humanizeCandidateRefs(
                visibleText(flatParagraphs[flatIndexOf(i, j)] ?? { text: p, secIndex: i, start: 0 }),
              ),
            ),
          )"
          :key="k"
        >
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

/* P5：节标题 16px/600 + 上间距 24px；节间 32px */
.report-block + .report-block {
  margin-top: 32px;
}

.report-title {
  margin: 0 0 8px;
  font-size: 16px;
  font-weight: 600;
}

.reveal-badge {
  margin-left: 8px;
  font-size: 12px;
  font-weight: 400;
  color: var(--el-color-primary);
  vertical-align: middle;
}

.reveal-badge.is-done {
  animation: reveal-done-fade 1.2s ease forwards;
  color: var(--el-text-color-secondary);
}

@keyframes reveal-done-fade {
  0% {
    opacity: 1;
  }

  100% {
    opacity: 0;
  }
}

.report-paragraph {
  max-width: 40em;
  margin: 0 0 16px;
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
