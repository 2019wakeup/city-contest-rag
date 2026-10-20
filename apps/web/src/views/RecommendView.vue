<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, shallowRef, useTemplateRef, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import { ripple } from '@/composables/ripple'
import { useCountUp } from '@/composables/useCountUp'
import { getCases } from '@/api/client'
import { useRecommendStore } from '@/stores/recommend'
import { DISTRESS_LABELS, TRAFFIC_LEVEL_LABELS, labelOf, STEP_LABELS } from '@/utils/labels'
import { formatNumber } from '@/utils/format'
import type { Candidate, CaseSeed, SceneInput } from '@road-rec/contracts'
import BenchmarkTable from '@/components/BenchmarkTable.vue'
import ShapBar from '@/components/ShapBar.vue'
import WaterfallChart from '@/components/WaterfallChart.vue'
import CandidateCard from '@/components/CandidateCard.vue'
import ChatDock from '@/components/ChatDock.vue'
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

// UI8：分析可视化候选选择（默认首选；候选卡展开联动切换）
const analysisCandidateId = shallowRef<string | null>(null)

watch(
  () => report.value?.candidates ?? [],
  (list) => {
    const current = analysisCandidateId.value
    if (!current || !list.some((c) => c.id === current)) {
      analysisCandidateId.value = list[0]?.id ?? null
    }
  },
  { immediate: true },
)

const analysisCandidate = computed(() => {
  const id = analysisCandidateId.value
  return (report.value?.candidates ?? []).find((c) => c.id === id) ?? null
})

// 候选卡展开/收起联动分析候选
function toggleCandidate(id: string): void {
  const next = new Set(expandedIds.value)
  if (next.has(id)) next.delete(id)
  else next.add(id)
  expandedIds.value = next
  analysisCandidateId.value = id
}

// 灵动层：hero 得分与三指标数字滚动（420ms rAF；reduced-motion 直显）
const scoreCount = useCountUp(() => topCandidate.value?.score ?? 0)
const lccCount = useCountUp(() => topCandidate.value?.lcc ?? 0)
const carbonCount = useCountUp(() => topCandidate.value?.carbon ?? 0)
const lifeCount = useCountUp(() => topCandidate.value?.expectedLife ?? 0)
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

// P3：微调差异提示 + 恢复原值（基线 = 最近一次报告场景的预算/工期）
const adjustNotice = shallowRef('')
const baselineBudget = shallowRef<number | null>(null)
const baselineSchedule = shallowRef<number | null>(null)

watch(
  () => store.report,
  (r) => {
    baselineBudget.value = r?.scene?.constraints?.budget ?? null
    baselineSchedule.value = r?.scene?.constraints?.schedule ?? null
    adjustNotice.value = ''
  },
)

function onClickAdjust(event: MouseEvent): void {
  ripple(event, event.currentTarget as HTMLElement)
  void applyAdjust()
}

async function applyAdjust(): Promise<void> {
  const scene = store.scene
  if (!scene) return
  const oldBudget = scene.constraints?.budget
  const oldSchedule = scene.constraints?.schedule
  const constraints = {
    ...(scene.constraints ?? {}),
    ...(adjustBudget.value != null ? { budget: adjustBudget.value } : {}),
    ...(adjustSchedule.value != null ? { schedule: adjustSchedule.value } : {}),
  }
  await store.adjustAndRerun({ constraints })
  if (store.status !== 'error') {
    const parts: string[] = []
    if (oldBudget != null && adjustBudget.value != null && oldBudget !== adjustBudget.value) {
      parts.push(`预算 ${oldBudget}→${adjustBudget.value}`)
    }
    if (
      oldSchedule != null &&
      adjustSchedule.value != null &&
      oldSchedule !== adjustSchedule.value
    ) {
      parts.push(`工期 ${oldSchedule}→${adjustSchedule.value}`)
    }
    if (parts.length > 0) adjustNotice.value = `${parts.join(' · ')} · 已重新生成`
  }
}

function restoreOriginal(): void {
  adjustBudget.value = baselineBudget.value
  adjustSchedule.value = baselineSchedule.value
  void applyAdjust()
}

// P3：场景 chips（气候/交通/病害/预算/工期）——来自 report.scene（标签统一 labels.ts，P6）
const sceneChips = computed<string[]>(() => {
  const scene = report.value?.scene
  if (!scene) return []
  const chips: string[] = []
  if (scene.climate?.zone) chips.push(scene.climate.zone)
  if (scene.traffic?.level) {
    chips.push(labelOf(TRAFFIC_LEVEL_LABELS, scene.traffic.level))
  }
  for (const d of scene.distresses ?? []) {
    chips.push(labelOf(DISTRESS_LABELS, d.type))
  }
  if (scene.constraints?.budget != null) chips.push(`${scene.constraints.budget} 万元`)
  if (scene.constraints?.schedule != null) chips.push(`${scene.constraints.schedule} 天`)
  return chips
})

const activeCaseTitle = computed<string | null>(() => {
  if (!store.activeCaseId) return null
  return cases.value.find((c) => c.id === store.activeCaseId)?.title ?? null
})

// P4：完成态紧凑步进条（report.steps 增量 ms + 总耗时）
const stepSummaryText = computed<string | null>(() => {
  const stepRecords = report.value?.steps ?? []
  if (stepRecords.length === 0) return null
  const total = stepRecords.reduce<number>(
    (acc, s) => acc + (typeof s.ms === 'number' ? s.ms : 0),
    0,
  )
  const totalText = total >= 1000 ? `${(total / 1000).toFixed(1)}s` : `${total}ms`
  const parts = stepRecords.map(
    (s) => `${labelOf(STEP_LABELS, s.name)} ${formatNumber(s.ms)}ms`,
  )
  return `全链路 ${totalText} · ${parts.join(' → ')}`
})

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

  // 灵动层：定位微确认——目标证据卡 600ms flash + 右上角 toast（1.6s 自动消失）
  flashEvidenceId.value = evidenceId
  if (flashTimer) clearTimeout(flashTimer)
  flashTimer = setTimeout(() => {
    flashEvidenceId.value = null
  }, 700)
  const index = (report.value?.evidence ?? []).findIndex((e) => e.chunkId === evidenceId)
  evidenceToast.value = `已定位证据 ${index >= 0 ? index + 1 : '—'}`
  if (toastTimer) clearTimeout(toastTimer)
  toastTimer = setTimeout(() => {
    evidenceToast.value = ''
  }, 1600)
}

// 灵动层：定位微确认状态
const flashEvidenceId = shallowRef<string | null>(null)
const evidenceToast = shallowRef('')
let flashTimer: ReturnType<typeof setTimeout> | undefined
let toastTimer: ReturnType<typeof setTimeout> | undefined

// ---- 空态引导卡（UI二轮）----
function focusCaseSelect(): void {
  caseSelectRef.value?.focus()
}

function gotoCases(): void {
  void router.push('/cases')
}

// ---- 键盘：Esc 收起已展开候选卡（ChatDock 已 preventDefault 时跳过）----
function onKeydown(event: KeyboardEvent): void {
  if (event.key !== 'Escape') return
  if (event.defaultPrevented) return
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
  if (flashTimer) clearTimeout(flashTimer)
  if (toastTimer) clearTimeout(toastTimer)
  window.removeEventListener('keydown', onKeydown)
})

// E：进入结果页首次 running 自动滚到报告区顶部（仅一次，确保生成过程在视口内）
const scrolledToReport = shallowRef(false)
watch(
  () => store.status,
  async (s) => {
    if (s !== 'running' || scrolledToReport.value) return
    scrolledToReport.value = true
    await nextTick()
    document
      .querySelector('[data-testid="loading-report"]')
      ?.scrollIntoView?.({ behavior: 'smooth', block: 'start' })
  },
)
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
      <h1 class="page-title">推荐工作台</h1>
      <p class="page-subtitle">① 参数 ② 结果</p>
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

      <el-card
        data-testid="empty-guide"
        class="panel input-card empty-guide stagger-item"
        style="--i: 0"
      >
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
      <!-- 工具栏（P3：sticky+模糊背景）：返回修改参数 + 微调 + 取消生成 -->
      <div class="panel result-toolbar is-sticky">
        <el-button
          data-testid="back-to-input"
          :disabled="store.status === 'running'"
          @click="onBackToInput"
        >
          修改参数
        </el-button>
        <div class="toolbar-adjust">
          <span class="toolbar-label">预算（万元）</span>
          <el-input-number
            v-model="adjustBudget"
            data-testid="adjust-budget"
            :min="0"
            size="small"
            :disabled="store.status === 'running'"
            class="toolbar-input"
          />
          <span class="toolbar-label">工期（天）</span>
          <el-input-number
            v-model="adjustSchedule"
            data-testid="adjust-schedule"
            :min="0"
            size="small"
            :disabled="store.status === 'running'"
            class="toolbar-input"
          />
          <el-button
            type="primary"
            size="small"
            class="pressable ripple-host"
            data-testid="adjust-apply"
            :disabled="store.status === 'running'"
            @click="onClickAdjust"
          >
            应用并重新推荐
          </el-button>
          <el-button
            v-if="store.status === 'running'"
            size="small"
            data-testid="cancel-run"
            @click="store.cancel()"
          >
            取消生成
          </el-button>
        </div>
      </div>

      <!-- P3：错误横幅 + 重试（旧报告保留，供回滚） -->
      <div v-if="store.status === 'error'" class="status-alert">
        <el-alert
          type="error"
          :closable="false"
          show-icon
          title="服务暂时不可用，请稍后重试"
        />
        <el-button size="small" data-testid="error-retry" @click="store.retry()">
          重试
        </el-button>
      </div>

      <!-- P3：微调差异提示 + 恢复原值 -->
      <div v-if="adjustNotice" class="adjust-notice" data-testid="adjust-notice">
        <span>{{ adjustNotice }}</span>
        <el-button size="small" text data-testid="restore-original" @click="restoreOriginal">
          恢复原值
        </el-button>
      </div>

      <!-- running：分阶段文案 + 实时步进 + 增量报告 + 骨架屏（首次无旧报告） -->
      <template v-if="store.status === 'running' && !report">
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
            :typewriter="true"
          />
          <!-- E：下一段占位（已有 i 段且流未结束） -->
          <div
            v-if="store.streamSections.length > 0"
            data-testid="section-placeholder"
            class="section-placeholder"
          >
            <div class="section-placeholder-label">
              正在撰写第 {{ store.streamSections.length + 1 }} 段…
            </div>
            <div class="app-skeleton" style="height: 14px; margin: 8px 0"></div>
            <div class="app-skeleton" style="height: 14px; width: 70%"></div>
          </div>
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
        <div
          class="result-content"
          data-testid="result-content"
          :class="{ 'is-stale': store.status === 'running' }"
        >
          <!-- P3：重跑进度条（旧报告变淡时置顶） -->
          <div v-if="store.status === 'running'" class="panel rerun-progress" data-testid="rerun-progress">
            <el-progress :indeterminate="true" :show-text="false" />
          </div>

          <!-- P3：场景 chips（气候/交通/病害/预算/工期 + 案例名） -->
          <div v-if="sceneChips.length > 0" class="panel scene-chips" data-testid="scene-chips">
            <el-tag
              v-for="chip in sceneChips"
              :key="chip"
              size="small"
              effect="plain"
              class="scene-chip"
            >
              {{ chip }}
            </el-tag>
            <span v-if="activeCaseTitle" class="scene-case-name">
              {{ activeCaseTitle }} 案例
            </span>
          </div>

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
                {{ scoreCount.display.value.toFixed(3) }}
                <span class="kpi-hero-score-label">综合得分</span>
              </div>
            </div>
            <div class="kpi-hero-metrics">
              <div class="kpi-hero-metric">
                <div class="kpi-hero-metric-label">预期寿命</div>
                <div class="kpi-hero-metric-value tabular">
                  {{ formatNumber(lifeCount.display.value) }} 年
                </div>
              </div>
              <div class="kpi-hero-metric">
                <div class="kpi-hero-metric-label">LCC</div>
                <div class="kpi-hero-metric-value tabular">
                  {{ formatNumber(lccCount.display.value) }} 万元
                </div>
              </div>
              <div class="kpi-hero-metric">
                <div class="kpi-hero-metric-label">碳排</div>
                <div class="kpi-hero-metric-value tabular">
                  {{ formatNumber(carbonCount.display.value) }} tCO2e
                </div>
              </div>
            </div>
          </div>
        </el-card>

        <!-- P4：完成态紧凑步进条（全链路总耗时 + 六步增量耗时） -->
        <div v-if="stepSummaryText" class="panel step-summary" data-testid="step-summary">
          {{ stepSummaryText }}
        </div>

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

        <!-- UI8：分析可视化（得分瀑布 + 特征贡献），插在报告卡与基准表之间 -->
        <el-card
          v-if="report"
          shadow="hover"
          data-testid="analysis-visuals"
          class="panel analysis-card"
        >
          <template #header>分析可视化</template>
          <div v-if="(report.candidates ?? []).length > 1" class="analysis-head">
            <el-radio-group v-model="analysisCandidateId" size="small" data-testid="analysis-switch">
              <el-radio-button
                v-for="(c, i) in report.candidates ?? []"
                :key="c.id"
                :value="c.id"
              >
                方案 {{ i + 1 }}
              </el-radio-button>
            </el-radio-group>
          </div>
          <template v-if="(analysisCandidate?.scoreBreakdown ?? []).length > 0">
            <WaterfallChart
              :score="analysisCandidate?.score ?? 0"
              :breakdown="analysisCandidate?.scoreBreakdown ?? []"
              :penalty="analysisCandidate?.penalty ?? null"
              data-testid="analysis-waterfall"
            />
          </template>
          <div
            v-else
            class="analysis-placeholder"
            data-testid="waterfall-placeholder"
          >
            暂无得分分解数据（旧版报告或降级模式）
          </div>
          <template v-if="(analysisCandidate?.explanations ?? []).length > 0">
            <ShapBar
              :explanations="analysisCandidate?.explanations ?? []"
              data-testid="analysis-shap"
            />
          </template>
          <div v-else class="analysis-placeholder" data-testid="shap-placeholder">
            暂无特征贡献数据
          </div>
        </el-card>

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
            <BenchmarkTable
              :rows="report.benchmark ?? []"
              :candidates="report.candidates ?? []"
              :targets="report.targets ?? null"
            />
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
          :flash-id="flashEvidenceId"
          @toggle="toggleCandidate(c.id)"
        />
        </div>
      </template>
    </div>

    <!-- 灵动层：证据定位 toast（aria-live） -->
    <transition name="toast-fade">
      <div
        v-if="evidenceToast"
        class="evidence-toast"
        data-testid="evidence-toast"
        role="status"
        aria-live="polite"
      >
        {{ evidenceToast }}
      </div>
    </transition>

    <!-- ============ 追问侧板（ChatDock：三态/拖拽/右缘收起） ============ -->
    <ChatDock :report="report" />
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

/* E：下一段占位（脉冲标签 + 骨架线） */
.section-placeholder {
  margin-top: 8px;
}

.section-placeholder-label {
  font-size: 13px;
  color: var(--el-text-color-secondary);
  animation: placeholder-pulse 1.4s ease-in-out infinite;
}

@keyframes placeholder-pulse {
  0%,
  100% {
    opacity: 0.55;
  }

  50% {
    opacity: 1;
  }
}

/* 参数页：单卡居中 */
.input-page {
  max-width: 640px;
  margin: 0 auto;
}

.page-title {
  margin: 0 0 4px;
  font-size: 22px;
  font-weight: 700;
}

.page-subtitle {
  margin: 0 0 16px;
  font-size: 13px;
  color: var(--el-text-color-secondary);
}

.input-card :deep(.el-card__body) {
  padding: 20px;
}

.case-select {
  width: 100%;
}

/* 结果页工具栏（P3：sticky + 半透明模糊） */
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

.evidence-toast {
  position: fixed;
  top: 16px;
  right: 24px;
  z-index: 2100;
  padding: 8px 14px;
  border-radius: 8px;
  background: var(--el-color-primary);
  color: #fff;
  font-size: 13px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.35);
}

.toast-fade-enter-active,
.toast-fade-leave-active {
  transition:
    opacity var(--motion-base) var(--ease-out),
    transform var(--motion-base) var(--ease-out);
}

.toast-fade-enter-from,
.toast-fade-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}

.result-toolbar.is-sticky {
  position: sticky;
  top: 0;
  z-index: 100;
  background: color-mix(in srgb, var(--color-elevated) 72%, transparent);
  backdrop-filter: blur(14px) saturate(140%);
  -webkit-backdrop-filter: blur(14px) saturate(140%);
  border: 1px solid var(--app-hairline);
}

/* P3：重跑进度条 + 旧内容变淡 */
/* P4：完成态紧凑步进条 */
.step-summary {
  padding: 8px 16px;
  font-size: 13px;
  color: var(--el-text-color-secondary);
}

.rerun-progress {
  padding: 10px 16px;
  margin-bottom: 16px;
}

.result-content {
  transition: opacity 0.2s ease;
}

.result-content.is-stale {
  opacity: 0.5;
}

/* P3：场景 chips + 案例名 */
.scene-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  align-items: center;
}

.scene-case-name {
  font-size: 13px;
  color: var(--el-color-primary);
}

/* P3：微调差异提示 */
.adjust-notice {
  display: flex;
  gap: 8px;
  align-items: center;
  margin-bottom: 16px;
  font-size: 13px;
  color: var(--el-text-color-regular);
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

</style>
