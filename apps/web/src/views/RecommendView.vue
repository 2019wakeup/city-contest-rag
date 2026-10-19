<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, shallowRef, useTemplateRef, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import { getCases } from '@/api/client'
import { useRecommendStore } from '@/stores/recommend'
import { formatNumber } from '@/utils/format'
import type { Candidate, CaseSeed, SceneInput } from '@road-rec/contracts'
import BenchmarkTable from '@/components/BenchmarkTable.vue'
import CandidateCard from '@/components/CandidateCard.vue'
import ChatPanel from '@/components/ChatPanel.vue'
import ReportSection from '@/components/ReportSection.vue'
import SceneForm from '@/components/SceneForm.vue'
import StepStepper from '@/components/StepStepper.vue'

// 推荐工作台（两页式）：参数页（案例填入+表单+引导）→ 结果页（工具栏/hero/报告/折叠区块/候选）。
const route = useRoute()
const router = useRouter()
const store = useRecommendStore()

const cases = shallowRef<CaseSeed[]>([])
const selectedCaseId = shallowRef<string | null>(null)
const initialScene = shallowRef<SceneInput | null>(null)

const report = computed(() => store.report)
const topCandidate = computed<Candidate | null>(() => report.value?.candidates?.[0] ?? null)
const isMock = computed(() => {
  const mode = report.value?.adapterMode
  return mode?.a === 'mock' || mode?.c === 'mock'
})

async function loadCases(): Promise<void> {
  try {
    cases.value = await getCases()
  } catch {
    cases.value = []
  }
}

function fillCase(caseId: string | null): void {
  store.activeCaseId = caseId
  selectedCaseId.value = caseId
  const found = cases.value.find((c) => c.id === caseId)
  initialScene.value = found?.scene ?? null
}

watch(
  () => route.query.case,
  (id) => {
    const caseId = typeof id === 'string' ? id : null
    if (cases.value.length > 0) fillCase(caseId)
  },
)

onMounted(async () => {
  await loadCases()
  const caseId = typeof route.query.case === 'string' ? route.query.case : null
  if (caseId) fillCase(caseId)
})

function onSubmit(scene: SceneInput): void {
  void store.run(scene)
}

/** 返回修改参数：用 store.scene 回填表单后切回参数页。 */
function onBackToInput(): void {
  initialScene.value = store.scene
  store.backToInput()
}

// ---- 结果页工具栏微调（G5：改约束后 adjustAndRerun 复用同一 pipeline）----
const adjustBudget = shallowRef<number | null>(null)
const adjustSchedule = shallowRef<number | null>(null)

watch(
  () => store.scene,
  (s) => {
    adjustBudget.value = s?.constraints?.budget ?? null
    adjustSchedule.value = s?.constraints?.schedule ?? null
  },
  { immediate: true },
)

async function applyAdjust(): Promise<void> {
  const scene = store.scene
  if (!scene) return
  const constraints = {
    ...(scene.constraints ?? {}),
    ...(adjustBudget.value != null ? { budget: adjustBudget.value } : {}),
    ...(adjustSchedule.value != null ? { schedule: adjustSchedule.value } : {}),
  }
  await store.adjustAndRerun({ constraints })
}

const weightOf = (perf: string): string => {
  const p = report.value?.targets?.priorities?.find((x) => x.perf === perf)
  if (p?.weight == null || !Number.isFinite(p.weight)) return '—'
  return `${(p.weight * 100).toFixed(1)}%`
}

// ---- 候选卡折叠（UI#1）：默认只展开 top-1，其余折叠为摘要行 ----
const expandedIds = shallowRef<Set<string>>(new Set())

watch(
  () => report.value?.candidates,
  (candidates) => {
    const firstId = candidates?.[0]?.id
    expandedIds.value = firstId ? new Set([firstId]) : new Set()
  },
  { immediate: true },
)

function toggleCandidate(id: string): void {
  const next = new Set(expandedIds.value)
  if (next.has(id)) {
    next.delete(id)
  } else {
    next.add(id)
  }
  expandedIds.value = next
}

// ---- 报告证据角标（UI二轮）：点击 → 高亮 + 展开所属候选 + 滚动定位 ----
const highlightId = shallowRef<string | null>(null)
const caseSelectRef = useTemplateRef('caseSelect')

async function onCite(evidenceId: string): Promise<void> {
  highlightId.value = evidenceId
  const ownerIds = (report.value?.candidates ?? [])
    .filter((c) => (c.evidenceIds ?? []).includes(evidenceId))
    .map((c) => c.id)
  if (ownerIds.length > 0) {
    const next = new Set(expandedIds.value)
    for (const id of ownerIds) next.add(id)
    expandedIds.value = next
  }
  await nextTick()
  const el = document.querySelector(`[data-evidence-id="${CSS.escape(evidenceId)}"]`)
  ;(el as HTMLElement | null)?.scrollIntoView?.({ behavior: 'smooth', block: 'center' })
}

// ---- 空态引导卡（UI二轮）----
function focusCaseSelect(): void {
  caseSelectRef.value?.focus()
}

function gotoCases(): void {
  void router.push('/cases')
}

// ---- 对话侧板（可停靠/可拖动/右缘收起）----
type ChatDockState = 'closed' | 'open' | 'docked'
const DOCK_MIN_WIDTH = 360
const DOCK_MAX_WIDTH = 720
const DOCK_DEFAULT_WIDTH = 480
const DOCK_STORAGE_KEY = 'chat-dock-width'

const chatDock = shallowRef<ChatDockState>('closed')
const chatDockWidth = shallowRef(readDockWidth())

function readDockWidth(): number {
  const saved = Number(localStorage.getItem(DOCK_STORAGE_KEY))
  return Number.isFinite(saved) && saved >= DOCK_MIN_WIDTH && saved <= DOCK_MAX_WIDTH
    ? saved
    : DOCK_DEFAULT_WIDTH
}

function persistDockWidth(width: number): void {
  localStorage.setItem(DOCK_STORAGE_KEY, String(width))
}

function openChatDock(): void {
  chatDock.value = 'open'
}

function dockChatDock(): void {
  chatDock.value = 'docked'
}

function closeChatDock(): void {
  chatDock.value = 'closed'
}

// 拖拽改宽度：左边缘 6px 柄（mousedown→mousemove clamp 360–720→mouseup 持久化）。
const dockDragging = shallowRef(false)
let dragStartX = 0
let dragStartWidth = DOCK_DEFAULT_WIDTH

function onDragStart(event: MouseEvent): void {
  dockDragging.value = true
  dragStartX = event.clientX
  dragStartWidth = chatDockWidth.value
  document.body.style.userSelect = 'none'
  window.addEventListener('mousemove', onDragMove)
  window.addEventListener('mouseup', onDragEnd)
}

function onDragMove(event: MouseEvent): void {
  if (!dockDragging.value) return
  const delta = dragStartX - event.clientX
  chatDockWidth.value = Math.min(DOCK_MAX_WIDTH, Math.max(DOCK_MIN_WIDTH, dragStartWidth + delta))
}

function onDragEnd(): void {
  dockDragging.value = false
  document.body.style.userSelect = ''
  persistDockWidth(chatDockWidth.value)
  window.removeEventListener('mousemove', onDragMove)
  window.removeEventListener('mouseup', onDragEnd)
}

// ---- 键盘（UI二轮+侧板）：Esc 优先收起侧板为 docked，否则收起已展开候选卡 ----
function onKeydown(event: KeyboardEvent): void {
  if (event.key !== 'Escape') return
  if (chatDock.value === 'open') {
    dockChatDock()
    return
  }
  const firstId = report.value?.candidates?.[0]?.id
  expandedIds.value = firstId ? new Set([firstId]) : new Set()
}

// ---- 流式加载动效：分阶段文案 1.5s 轮换（running 状态驱动）----
const LOADING_PHASES = ['正在解析养护场景…', '正在检索知识库…', '正在生成推荐理由…']
const loadingPhase = shallowRef(0)
let phaseTimer: ReturnType<typeof setInterval> | undefined

watch(
  () => store.status,
  (s) => {
    if (phaseTimer) {
      clearInterval(phaseTimer)
      phaseTimer = undefined
    }
    if (s === 'running') {
      loadingPhase.value = 0
      phaseTimer = setInterval(() => {
        loadingPhase.value = (loadingPhase.value + 1) % LOADING_PHASES.length
      }, 1500)
    }
  },
  { immediate: true },
)

onMounted(() => window.addEventListener('keydown', onKeydown))
onBeforeUnmount(() => {
  if (phaseTimer) clearInterval(phaseTimer)
  window.removeEventListener('keydown', onKeydown)
  window.removeEventListener('mousemove', onDragMove)
  window.removeEventListener('mouseup', onDragEnd)
  document.body.style.userSelect = ''
})
</script>

<template>
  <div class="recommend-view">
    <el-alert
      v-if="store.status === 'error'"
      type="error"
      :closable="false"
      :title="`推荐失败：${store.errorMessage}`"
      class="status-alert"
    />

    <!-- ============ 第 1 页：参数 ============ -->
    <div v-if="store.step === 'input'" class="input-page">
      <el-card shadow="never" class="panel input-card">
        <template #header>典型案例一键填入</template>
        <el-select
          ref="caseSelect"
          v-model="selectedCaseId"
          placeholder="选择预置案例"
          clearable
          class="case-select"
          @change="fillCase"
        >
          <el-option
            v-for="c in cases ?? []"
            :key="c.id"
            :label="c.title"
            :value="c.id"
          />
        </el-select>
      </el-card>

      <el-card shadow="never" class="panel input-card">
        <template #header>养护场景</template>
        <SceneForm :initial-scene="initialScene" @submit="onSubmit" />
      </el-card>

      <el-card data-testid="empty-guide" class="panel input-card empty-guide">
        <div class="empty-guide-body">
          <div class="empty-guide-icon" aria-hidden="true">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="1.6"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <path d="M12 3l1.9 5.1L19 10l-5.1 1.9L12 17l-1.9-5.1L5 10l5.1-1.9z" />
              <path d="M19 15l.9 2.4L22 18l-2.1.6L19 21l-.9-2.4L16 18l2.1-.6z" />
            </svg>
          </div>
          <h3 class="empty-guide-title">开始一次材料推荐</h3>
          <p class="empty-guide-desc">
            填写养护场景（或从典型案例一键填入），系统将输出 Top-5 沥青材料方案、
            8 维雷达对比与可溯源证据链。
          </p>
          <div class="empty-guide-actions">
            <el-button type="primary" data-testid="focus-case-select" @click="focusCaseSelect">
              选择预置案例
            </el-button>
            <el-button data-testid="goto-cases" @click="gotoCases">
              查看典型案例
            </el-button>
          </div>
        </div>
      </el-card>
    </div>

    <!-- ============ 第 2 页：结果 ============ -->
    <div v-else class="result-page">
      <!-- 工具栏：返回修改参数 + 微调 -->
      <div class="panel result-toolbar">
        <el-button data-testid="back-to-input" @click="onBackToInput">
          修改参数
        </el-button>
        <div class="toolbar-adjust">
          <span class="toolbar-label">预算（万元）</span>
          <el-input-number
            v-model="adjustBudget"
            data-testid="adjust-budget"
            :min="0"
            size="small"
            class="toolbar-input"
          />
          <span class="toolbar-label">工期（天）</span>
          <el-input-number
            v-model="adjustSchedule"
            data-testid="adjust-schedule"
            :min="0"
            size="small"
            class="toolbar-input"
          />
          <el-button type="primary" size="small" data-testid="adjust-apply" @click="applyAdjust">
            应用并重新推荐
          </el-button>
        </div>
      </div>

      <!-- running：分阶段文案 + 实时步进 + 增量报告 + 骨架屏 -->
      <template v-if="store.status === 'running'">
        <StepStepper :steps="store.liveSteps" :running="true" class="panel" />
        <div class="panel loading-report" data-testid="loading-report">
          <div class="loading-phase" data-testid="loading-phase">
            {{ LOADING_PHASES[loadingPhase] }}
          </div>
          <ReportSection
            v-if="store.streamSections.length > 0"
            :sections="store.streamSections"
            :llm-status="'ok'"
            :evidence="store.report?.evidence ?? []"
          />
          <div
            v-else
            data-testid="skeleton-report"
            class="app-skeleton"
            style="height: 180px"
          ></div>
        </div>
        <div data-testid="skeleton-cards" class="panel">
          <div v-for="n in 3" :key="n" class="app-skeleton" style="height: 96px; margin-bottom: 16px"></div>
        </div>
      </template>

      <template v-else-if="report">
        <!-- KPI hero（UI二轮）：首选方案 + 得分 + 核心三指标 + 徽章收纳于此 -->
        <el-card shadow="hover" data-testid="kpi-hero" class="panel kpi-hero">
          <div class="kpi-hero-row">
            <div class="kpi-hero-main">
              <div class="kpi-hero-kicker">
                首选方案
                <el-tag v-if="isMock" type="warning" data-testid="mock-badge" size="small">
                  模拟数据
                </el-tag>
                <el-tag v-if="report.llmStatus === 'degraded'" type="info" size="small">
                  文案模板降级
                </el-tag>
              </div>
              <div class="kpi-hero-mix">
                {{ topCandidate?.formula?.binder?.type ?? '—' }}
                +
                {{ topCandidate?.formula?.gradation?.type ?? '—' }}
              </div>
              <div class="kpi-hero-score tabular">
                {{ (topCandidate?.score ?? 0).toFixed(3) }}
                <span class="kpi-hero-score-label">综合得分</span>
              </div>
            </div>
            <div class="kpi-hero-metrics">
              <div class="kpi-hero-metric">
                <div class="kpi-hero-metric-label">预期寿命</div>
                <div class="kpi-hero-metric-value tabular">
                  {{ formatNumber(topCandidate?.expectedLife) }} 年
                </div>
              </div>
              <div class="kpi-hero-metric">
                <div class="kpi-hero-metric-label">LCC</div>
                <div class="kpi-hero-metric-value tabular">
                  {{ formatNumber(topCandidate?.lcc) }} 万元
                </div>
              </div>
              <div class="kpi-hero-metric">
                <div class="kpi-hero-metric-label">碳排</div>
                <div class="kpi-hero-metric-value tabular">
                  {{ formatNumber(topCandidate?.carbon) }} tCO2e
                </div>
              </div>
            </div>
          </div>
        </el-card>

        <el-alert
          v-for="(w, i) in report.warnings ?? []"
          :key="i"
          type="warning"
          :closable="false"
          :title="w"
          class="status-alert"
        />

        <ReportSection
          :sections="report.sections ?? []"
          :llm-status="report.llmStatus ?? 'degraded'"
          :evidence="report.evidence ?? []"
          class="panel"
          @cite="onCite"
        />

        <!-- 目标性能/基准对比：默认折叠为可展开区块（重构） -->
        <el-collapse class="panel detail-collapse">
          <el-collapse-item title="目标性能与权重" name="targets">
            <el-table :data="report.targets?.targets ?? []" size="small">
              <el-table-column prop="perf" label="性能指标" />
              <el-table-column label="目标值" align="right">
                <template #default="{ row }">
                  <span class="tabular">{{ formatNumber(row.value) }} {{ row.unit ?? '' }}</span>
                </template>
              </el-table-column>
              <el-table-column label="权重" align="right">
                <template #default="{ row }">
                  <span class="tabular">{{ weightOf(row.perf) }}</span>
                </template>
              </el-table-column>
            </el-table>
          </el-collapse-item>
          <el-collapse-item title="与规范查表基线对比" name="benchmark">
            <BenchmarkTable :rows="report.benchmark ?? []" />
          </el-collapse-item>
        </el-collapse>

        <CandidateCard
          v-for="(c, i) in report.candidates ?? []"
          :key="c.id"
          :candidate="c"
          :index="i"
          :adapter-mode="report.adapterMode ?? { a: 'mock', c: 'mock' }"
          :evidence="report.evidence ?? []"
          :expanded="expandedIds.has(c.id)"
          :highlight-id="highlightId"
          @toggle="toggleCandidate(c.id)"
        />
      </template>
    </div>

    <!-- ============ 对话侧板（可停靠/可拖动/右缘收起） ============ -->
    <!-- open：固定右侧面板 + 左边缘拖拽柄 -->
    <div
      v-if="report && chatDock === 'open'"
      class="chat-dock"
      data-testid="chat-dock"
      :style="{ width: `${chatDockWidth}px` }"
    >
      <div
        class="chat-dock-handle"
        data-testid="chat-dock-handle"
        aria-label="拖拽调整宽度"
        @mousedown.prevent="onDragStart"
      ></div>
      <div class="chat-dock-head">
        <span class="chat-dock-title">对话面板</span>
        <div class="chat-dock-actions">
          <el-button text size="small" data-testid="chat-dock-dock" @click="dockChatDock">
            收起
          </el-button>
          <el-button text size="small" data-testid="chat-dock-close" @click="closeChatDock">
            关闭
          </el-button>
        </div>
      </div>
      <ChatPanel :report="report" />
    </div>

    <!-- docked：右缘竖条，点击恢复 open（记忆宽度） -->
    <button
      v-else-if="report && chatDock === 'docked'"
      type="button"
      class="chat-rail"
      data-testid="chat-rail"
      aria-label="展开追问面板"
      @click="openChatDock"
    >
      <svg
        class="chat-fab-icon"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
      >
        <path
          d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"
        />
      </svg>
      <span class="chat-rail-text">追问</span>
    </button>

    <!-- closed：右下角悬浮胶囊 -->
    <button
      v-else-if="report"
      type="button"
      class="chat-fab"
      data-testid="chat-fab"
      aria-label="追问"
      @click="openChatDock"
    >
      <svg
        class="chat-fab-icon"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
      >
        <path
          d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"
        />
      </svg>
      追问
    </button>
  </div>
</template>

<style scoped>
.panel {
  margin-bottom: 24px;
}

.status-alert {
  margin-bottom: 12px;
}

.loading-report {
  position: relative;
}

.loading-phase {
  margin-bottom: 12px;
  font-size: 13px;
  color: var(--el-color-primary);
}

/* 参数页：单卡居中 */
.input-page {
  max-width: 640px;
  margin: 0 auto;
}

.input-card :deep(.el-card__body) {
  padding: 20px;
}

.case-select {
  width: 100%;
}

/* 结果页工具栏 */
.result-toolbar {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  border: 1px solid var(--app-border);
  border-radius: var(--app-radius-card);
  background: var(--app-panel-bg);
}

.toolbar-adjust {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  align-items: center;
}

.toolbar-label {
  font-size: 13px;
  color: var(--el-text-color-secondary);
}

.toolbar-input {
  width: 130px;
}

/* KPI hero（UI二轮） */
.kpi-hero-row {
  display: flex;
  flex-wrap: wrap;
  gap: 24px;
  align-items: center;
}

.kpi-hero-kicker {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  color: var(--el-text-color-secondary);
  margin-bottom: 8px;
}

.kpi-hero-mix {
  font-size: 22px;
  font-weight: 600;
  line-height: 1.4;
}

.kpi-hero-score {
  font-size: 32px;
  font-weight: 700;
  color: var(--el-color-primary);
  line-height: 1.2;
}

.kpi-hero-score-label {
  margin-left: 8px;
  font-size: 13px;
  font-weight: 400;
  color: var(--el-text-color-secondary);
}

.kpi-hero-metrics {
  display: flex;
  gap: 32px;
  margin-left: auto;
}

.kpi-hero-metric-label {
  font-size: 12px;
  color: var(--el-text-color-secondary);
  margin-bottom: 4px;
}

.kpi-hero-metric-value {
  font-size: 16px;
  font-weight: 600;
}

/* 目标/基准折叠区块 */
.detail-collapse {
  border: 1px solid var(--app-border);
  border-radius: var(--app-radius-card);
  background: var(--app-panel-bg);
}

/* 空态引导卡（UI二轮） */
.empty-guide-body {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 32px 16px;
  text-align: center;
}

.empty-guide-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 56px;
  height: 56px;
  border-radius: 14px;
  background: var(--el-color-primary-light-9);
  color: var(--el-color-primary);
  margin-bottom: 16px;
}

.empty-guide-icon svg {
  width: 28px;
  height: 28px;
}

.empty-guide-title {
  margin: 0 0 8px;
  font-size: 17px;
  font-weight: 600;
}

.empty-guide-desc {
  margin: 0 0 24px;
  max-width: 460px;
  color: var(--el-text-color-secondary);
  line-height: 1.7;
}

.empty-guide-actions {
  display: flex;
  gap: 12px;
}

/* 对话侧板：可停靠/可拖动/右缘收起 */
.chat-dock {
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  z-index: 2000;
  display: flex;
  flex-direction: column;
  padding: 16px;
  background: var(--app-panel-bg);
  border-left: 1px solid var(--app-border);
  box-shadow: -8px 0 24px rgba(0, 0, 0, 0.25);
}

.chat-dock-handle {
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 6px;
  cursor: ew-resize;
  transition: background 0.15s ease;
}

.chat-dock-handle:hover {
  background: var(--el-color-primary);
}

.chat-dock-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-bottom: 12px;
  margin-bottom: 12px;
  border-bottom: 1px solid var(--app-border);
}

.chat-dock-title {
  font-size: 15px;
  font-weight: 600;
}

.chat-dock-actions {
  display: flex;
  gap: 4px;
}

.chat-rail {
  position: fixed;
  right: 0;
  top: 40%;
  transform: translateY(-50%);
  z-index: 2000;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  width: 36px;
  padding: 12px 0;
  border: 1px solid var(--app-border-strong);
  border-right: none;
  border-radius: 10px 0 0 10px;
  background: var(--el-bg-color-overlay, #161b24);
  color: var(--el-text-color-primary);
  cursor: pointer;
  box-shadow: -4px 0 16px rgba(0, 0, 0, 0.25);
  transition:
    transform 0.15s ease,
    box-shadow 0.15s ease;
}

.chat-rail:hover {
  box-shadow: -8px 0 24px rgba(0, 0, 0, 0.35);
}

.chat-rail:active {
  transform: translateY(-50%) scale(0.96);
}

.chat-rail-text {
  font-size: 12px;
  writing-mode: vertical-rl;
  letter-spacing: 2px;
}

.chat-fab {
  position: fixed;
  right: 24px;
  bottom: 24px;
  z-index: 2000;
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 10px 18px;
  border: 1px solid var(--app-border-strong);
  border-radius: 999px;
  background: var(--el-bg-color-overlay, #161b24);
  color: var(--el-text-color-primary);
  font-size: 14px;
  cursor: pointer;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.35);
  transition:
    transform 0.15s ease,
    box-shadow 0.15s ease;
}

.chat-fab:hover {
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.45);
}

.chat-fab:active {
  transform: scale(0.96);
}

.chat-fab-icon {
  width: 16px;
  height: 16px;
}
</style>
