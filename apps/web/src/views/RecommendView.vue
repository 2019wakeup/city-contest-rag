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

// 推荐工作台：左栏（案例一键填入 + schema 驱动表单 + 微调面板）· 右栏（KPI hero/报告/步进/目标/对比/候选/对话）。
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

// ---- 微调面板（G5：改约束后 adjustAndRerun 复用同一 pipeline）----
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

// ---- 键盘（UI二轮）：Esc 收起已展开候选卡（回到默认仅展开 top-1）----
function onKeydown(event: KeyboardEvent): void {
  if (event.key !== 'Escape') return
  const firstId = report.value?.candidates?.[0]?.id
  expandedIds.value = firstId ? new Set([firstId]) : new Set()
}

onMounted(() => window.addEventListener('keydown', onKeydown))
onBeforeUnmount(() => window.removeEventListener('keydown', onKeydown))
</script>

<template>
  <div class="recommend-view">
    <el-row :gutter="16">
      <el-col :xs="24" :md="9">
        <el-card shadow="never" class="panel">
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

        <el-card shadow="never" class="panel">
          <template #header>养护场景</template>
          <SceneForm :initial-scene="initialScene" @submit="onSubmit" />
        </el-card>

        <el-card v-if="report" shadow="never" class="panel">
          <template #header>微调面板</template>
          <el-form label-position="top">
            <el-form-item label="预算（万元）">
              <el-input-number
                v-model="adjustBudget"
                data-testid="adjust-budget"
                :min="0"
                class="adjust-input"
              />
            </el-form-item>
            <el-form-item label="工期（天）">
              <el-input-number
                v-model="adjustSchedule"
                data-testid="adjust-schedule"
                :min="0"
                class="adjust-input"
              />
            </el-form-item>
          </el-form>
          <el-button type="primary" data-testid="adjust-apply" @click="applyAdjust">
            应用并重新推荐
          </el-button>
        </el-card>
      </el-col>

      <el-col :xs="24" :md="15">
        <el-alert
          v-if="store.status === 'error'"
          type="error"
          :closable="false"
          :title="`推荐失败：${store.errorMessage}`"
          class="status-alert"
        />

        <!-- UI二轮：running 骨架屏（替代计算中提示） -->
        <template v-if="store.status === 'running'">
          <div data-testid="skeleton-report" class="panel app-skeleton" style="height: 180px"></div>
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
                  <el-tag
                    v-if="report.llmStatus === 'degraded'"
                    type="info"
                    size="small"
                  >
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
            class="panel"
            @cite="onCite"
          />

          <StepStepper :steps="report.steps ?? []" :running="false" class="panel" />

          <el-card shadow="never" class="panel">
            <template #header>目标性能与权重</template>
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
          </el-card>

          <BenchmarkTable :rows="report.benchmark ?? []" class="panel" />

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

          <ChatPanel :report="report" class="panel" />
        </template>

        <!-- UI二轮：空态引导卡 -->
        <el-card v-else data-testid="empty-guide" class="panel empty-guide">
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
      </el-col>
    </el-row>
  </div>
</template>

<style scoped>
.panel {
  margin-bottom: 24px;
}

.case-select {
  width: 100%;
}

.adjust-input {
  width: 100%;
}

.status-alert {
  margin-bottom: 12px;
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
