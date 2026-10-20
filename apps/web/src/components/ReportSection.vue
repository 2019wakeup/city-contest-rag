<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, reactive, ref, watch } from 'vue'

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

// 排版重构：数字+单位 → num-strong；方案 N → cand-chip（先切证据 id，再对纯文本段强调）。
const NUM_STRONG_PATTERN = /(\d+(?:\.\d+)?)\s*(mm|℃|%|年|万元|tCO2e|万次|分)/g
const CAND_CHIP_PATTERN = /方案\s*\d+/g

interface Segment {
  text: string
  id?: string
  /** 纯文本段的内联强调类型。 */
  em?: 'num' | 'chip'
}

function emphasizeText(text: string): Segment[] {
  const combined = new RegExp(
    `(${CAND_CHIP_PATTERN.source})|(${NUM_STRONG_PATTERN.source})`,
    'g',
  )
  const segments: Segment[] = []
  let last = 0
  for (const m of text.matchAll(combined)) {
    const index = m.index ?? 0
    if (index > last) segments.push({ text: text.slice(last, index) })
    if (m[1]) segments.push({ text: m[1], em: 'chip' })
    else if (m[2]) segments.push({ text: m[2], em: 'num' })
    last = index + m[0].length
  }
  if (last < text.length) segments.push({ text: text.slice(last) })
  return segments
}

/** 段落分段：先切证据 id（不受强调影响），再对纯文本段做 num-strong/cand-chip。 */
function parseSegments(paragraph: string): Segment[] {
  const segments: Segment[] = []
  let last = 0
  for (const m of paragraph.matchAll(ID_PATTERN)) {
    const index = m.index ?? 0
    if (index > last) segments.push(...emphasizeText(paragraph.slice(last, index)))
    segments.push({ text: m[0], id: m[0] })
    last = index + m[0].length
  }
  if (last < paragraph.length) segments.push(...emphasizeText(paragraph.slice(last)))
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

/** 段落最终文本（揭示 → 方案化 → 单位 nbsp）。 */
const finalTextOf = (secIndex: number, paraIndex: number): string => {
  const flat = flatParagraphs.value[flatIndexOf(secIndex, paraIndex)]
  const raw = flat?.text ?? (props.sections?.[secIndex]?.paragraphs ?? [])[paraIndex] ?? ''
  return withUnitNbsp(
    humanizeCandidateRefs(visibleText(flat ?? { text: raw, secIndex, start: 0 })),
  )
}

// 排版重构：要点自动成列表（每行均以 · / - / • 前缀开头）
const isPointList = (text: string): boolean => {
  const lines = text
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean)
  return lines.length > 0 && lines.every((l) => /^[·\-•]\s/.test(l))
}

const pointItems = (text: string): string[] =>
  text
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean)
    .map((l) => l.replace(/^[·\-•]\s*/, ''))

// 微调：连续的要点段落合并为一个 ul（非连续的分组）
interface ParagraphRun {
  kind: 'points' | 'para'
  paraIndex: number
  items: string[]
}

const sectionRuns = computed<ParagraphRun[][]>(() =>
  (props.sections ?? []).map((s, si) => {
    const runs: ParagraphRun[] = []
    let pendingItems: string[] | null = null
    ;(s.paragraphs ?? []).forEach((_p, j) => {
      const text = finalTextOf(si, j)
      if (isPointList(text)) {
        if (!pendingItems) {
          pendingItems = []
          runs.push({ kind: 'points', paraIndex: j, items: pendingItems })
        }
        pendingItems.push(...pointItems(text))
      } else {
        pendingItems = null
        runs.push({ kind: 'para', paraIndex: j, items: [] })
      }
    })
    return runs
  }),
)

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

// UI7：侧栏 chip 类型色点（与证据卡类型色一致）
const DOC_TYPE_COLORS: Record<string, string> = {
  knowledge: '#6E7BF2',
  standard: '#14B8A6',
  literature: '#F59E0B',
  enterprise: '#94A3B8',
  table: '#0F766E',
  'literature-full': '#64748B',
}

const docTypeColorOf = (id: string): string =>
  DOC_TYPE_COLORS[evidenceById.value.get(id)?.docType ?? ''] ?? '#94A3B8'

/** 对比节要点双列（UI7）。 */
const isCompareSection = (title: string): boolean => /对比|比较/.test(title)

// 排版重构：关联证据收拢（每节独立展开态，默认收起）
const openRefs = ref<Set<number>>(new Set())

function refsOpen(secIndex: number): boolean {
  return openRefs.value.has(secIndex)
}

function toggleRefs(secIndex: number): void {
  const next = new Set(openRefs.value)
  if (next.has(secIndex)) next.delete(secIndex)
  else next.add(secIndex)
  openRefs.value = next
}

// 跨节去重：chunkId → 首次出现的节序号（防御性；后端已按节去重，前端兜底）
const firstSeenIn = computed(() => {
  const map = new Map<string, number>()
  ;(props.sections ?? []).forEach((s, si) => {
    for (const id of s.evidenceIds ?? []) {
      if (!map.has(id)) map.set(id, si)
    }
  })
  return map
})

/** 每节展示的引用：节内去重；跨节重复的标 duplicate（渲染「见上文」小标）。 */
const refsOf = (secIndex: number): Array<{ id: string; duplicate: boolean }> => {
  const seen = new Set<string>()
  const list: Array<{ id: string; duplicate: boolean }> = []
  for (const id of props.sections?.[secIndex]?.evidenceIds ?? []) {
    if (seen.has(id)) continue
    seen.add(id)
    const first = firstSeenIn.value.get(id)
    list.push({ id, duplicate: first !== undefined && first < secIndex })
  }
  return list
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
    <div v-else class="report-grid">
      <!-- 左列：阅读列 -->
      <div class="report-main">
        <section
          v-for="(s, i) in sections ?? []"
          :key="`${s.title}-${i}`"
          class="report-block report-stagger"
          :style="{ '--i': i }"
        >
          <h4 class="report-title">
            <span class="report-title-num mono tabular">{{ String(i + 1).padStart(2, '0') }}</span>
            {{ s.title }}
            <span v-if="typewriter && !sectionDone(i)" class="reveal-badge">生成中…</span>
            <span v-else-if="typewriter" class="reveal-badge is-done">已完成</span>
          </h4>

          <template v-for="(run, r) in sectionRuns[i] ?? []" :key="r">
            <ul
              v-if="run.kind === 'points'"
              class="report-points"
              :class="{ 'two-col': isCompareSection((sections ?? [])[i]?.title ?? '') }"
            >
              <li v-for="(item, li) in run.items" :key="li">
                <template v-for="(seg, k) in parseSegments(item)" :key="k">
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
                  <span v-else-if="seg.em === 'num'" class="num-strong">{{ seg.text }}</span>
                  <span v-else-if="seg.em === 'chip'" class="cand-chip">{{ seg.text }}</span>
                  <template v-else>{{ seg.text }}</template>
                </template>
              </li>
            </ul>
            <p
              v-else
              class="report-paragraph"
              :class="{ 'report-lead': run.paraIndex === 0 }"
            >
              <template v-for="(seg, k) in parseSegments(finalTextOf(i, run.paraIndex))" :key="k">
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
                <span v-else-if="seg.em === 'num'" class="num-strong">{{ seg.text }}</span>
                <span v-else-if="seg.em === 'chip'" class="cand-chip">{{ seg.text }}</span>
                <template v-else>{{ seg.text }}</template>
              </template>
            </p>
          </template>
        </section>
      </div>

      <!-- 右列：sticky 证据侧栏（UI7：报告各节 chips 常驻） -->
      <aside class="report-sidebar" data-testid="evidence-sidebar">
        <template v-for="(s, i) in sections ?? []" :key="`side-${s.title}-${i}`">
          <div v-if="refsOf(i).length > 0" class="sidebar-sec">
            <div class="sidebar-sec-title mono">
              {{ String(i + 1).padStart(2, '0') }} · {{ s.title }}
            </div>
            <div class="sidebar-chips">
              <template v-for="ref in refsOf(i)" :key="ref.id">
                <el-tooltip
                  v-if="!ref.duplicate"
                  :content="citeTooltip(ref.id)"
                  placement="left"
                >
                  <button
                    type="button"
                    class="sidebar-chip"
                    data-testid="evidence-cite"
                    @click="onCite(ref.id)"
                  >
                    <span
                      class="chip-dot"
                      :style="{ background: docTypeColorOf(ref.id) }"
                    ></span>
                    {{ citeLabel(ref.id) }}
                  </button>
                </el-tooltip>
                <span v-else class="report-ref-seen" data-testid="ref-seen">
                  见上文 · {{ citeLabel(ref.id) }}
                </span>
              </template>
            </div>
          </div>
        </template>
      </aside>
    </div>
  </el-card>
</template>

<style scoped>
.report-degraded {
  margin-bottom: 12px;
}

/* UI7：双栏 grid（≥1280px 右列 280px 侧栏；窄屏侧栏下移为横向 chips） */
.report-grid {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: 24px;
}

@media (min-width: 1280px) {
  .report-grid {
    grid-template-columns: minmax(0, 1fr) 280px;
    align-items: start;
  }

  .report-sidebar {
    position: sticky;
    top: 96px;
    max-height: calc(100vh - 120px);
    overflow: auto;
  }
}

@media (max-width: 1279px) {
  .report-main {
    order: 1;
  }

  .report-sidebar {
    order: 2;
  }

  .sidebar-chips {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
  }
}

/* 排版重构：节间 40px */
.report-block + .report-block {
  margin-top: 40px;
}

/* UI7：节标题 = mono 两位编号 + 16px/600 标题 + 横线分隔，间距 8px */
.report-title {
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 0 0 8px;
  font-size: 16px;
  font-weight: 600;
}

.report-title::after {
  content: '';
  flex: 1;
  height: 1px;
  background: var(--app-border);
}

.report-title-num {
  font-family:
    'SF Mono', 'JetBrains Mono', ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
  font-size: 12px;
  font-weight: 400;
  color: var(--el-text-color-secondary);
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

/* UI7：阅读列正文 640px；段距 20px */
.report-paragraph {
  max-width: 640px;
  margin: 0 0 20px;
  font-size: 14px;
  line-height: 1.75;
  color: var(--el-text-color-regular);
}

/* 排版重构：结论先行块（每节第 1 段） */
.report-paragraph.report-lead {
  max-width: 640px;
  padding: 10px 12px;
  border-left: 3px solid var(--el-color-primary);
  background: var(--el-fill-color-light);
  background: color-mix(in srgb, var(--el-color-primary-light-9) 8%, transparent);
  border-radius: 0 var(--app-radius-inner) var(--app-radius-inner) 0;
  font-size: 15px;
  line-height: 1.7;
}

/* 排版重构：要点列表（去前缀，条目间距 8px）；对比节 ≥1280px 双列 */
.report-points {
  max-width: 640px;
  margin: 0 0 20px;
  padding-left: 22px;
  font-size: 14px;
  line-height: 1.75;
  color: var(--el-text-color-regular);
}

.report-points li {
  margin: 8px 0;
}

@media (min-width: 1280px) {
  .report-points.two-col {
    display: grid;
    grid-template-columns: 1fr 1fr;
    grid-auto-flow: row dense;
    gap: 0 24px;
  }
}

/* 排版重构：数字+单位强调 */
.num-strong {
  font-variant-numeric: tabular-nums;
  font-weight: 600;
  color: var(--el-color-primary);
}

/* 排版重构：「方案 N」胶囊 */
.cand-chip {
  display: inline-block;
  margin: 0 2px;
  padding: 0 8px;
  border-radius: 999px;
  background: var(--el-color-primary-light-9);
  color: var(--el-color-primary);
  font-size: 13px;
  line-height: 20px;
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

/* UI7：证据侧栏 */
.report-sidebar {
  padding: 12px;
  border: 1px solid var(--app-border);
  border-radius: var(--app-radius-inner);
  background: var(--app-panel-bg);
}

.sidebar-sec + .sidebar-sec {
  margin-top: 12px;
}

.sidebar-sec-title {
  margin-bottom: 6px;
  font-size: 12px;
  color: var(--el-text-color-secondary);
}

.sidebar-chip {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  margin: 0 6px 6px 0;
  padding: 3px 10px;
  border: 1px solid var(--app-border-strong);
  border-radius: 999px;
  background: var(--el-fill-color-blank);
  color: var(--el-text-color-regular);
  font-size: 12px;
  cursor: pointer;
  transition:
    border-color var(--motion-fast) var(--ease-out),
    color var(--motion-fast) var(--ease-out);
}

.sidebar-chip:hover {
  border-color: var(--el-color-primary);
  color: var(--el-color-primary);
}

.chip-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
}

/* 排版重构：关联证据收拢胶囊 */
.report-refs {
  margin-bottom: 12px;
}

.report-refs-toggle {
  padding: 4px 12px;
  border: 1px solid var(--app-border-strong);
  border-radius: 999px;
  background: var(--el-fill-color-blank);
  color: var(--el-text-color-secondary);
  font-size: 12px;
  cursor: pointer;
  transition:
    border-color var(--motion-fast) var(--ease-out),
    color var(--motion-fast) var(--ease-out);
}

.report-refs-toggle:hover {
  border-color: var(--el-color-primary);
  color: var(--el-color-primary);
}

.report-refs-row {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 8px;
}

.report-ref-wrap {
  cursor: pointer;
}

.report-ref-tag {
  cursor: pointer;
}

.report-ref-seen {
  display: inline-flex;
  align-items: center;
  padding: 0 8px;
  border-radius: 999px;
  background: var(--el-fill-color-light);
  color: var(--el-text-color-secondary);
  font-size: 12px;
  line-height: 24px;
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
