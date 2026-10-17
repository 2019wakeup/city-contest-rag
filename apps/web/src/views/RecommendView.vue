<script setup lang="ts">
import { computed, onMounted, shallowRef, watch } from 'vue'
import { useRoute } from 'vue-router'

import { getCases } from '@/api/client'
import { useRecommendStore } from '@/stores/recommend'
import type { CaseSeed, SceneInput } from '@road-rec/contracts'
import BenchmarkTable from '@/components/BenchmarkTable.vue'
import CandidateCard from '@/components/CandidateCard.vue'
import ChatPanel from '@/components/ChatPanel.vue'
import ReportSection from '@/components/ReportSection.vue'
import SceneForm from '@/components/SceneForm.vue'
import StepStepper from '@/components/StepStepper.vue'

// 推荐工作台：左栏（案例一键填入 + schema 驱动表单 + 微调面板）· 右栏（步进/目标/对比/候选/证据/报告/对话）。
const route = useRoute()
const store = useRecommendStore()

const cases = shallowRef<CaseSeed[]>([])
const selectedCaseId = shallowRef<string | null>(null)
const initialScene = shallowRef<SceneInput | null>(null)

const report = computed(() => store.report)
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
  return p?.weight != null ? String(p.weight) : '—'
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
</script>

<template>
  <div class="recommend-view">
    <el-row :gutter="16">
      <el-col :xs="24" :md="9">
        <el-card shadow="never" class="panel">
          <template #header>典型案例一键填入</template>
          <el-select
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
        <el-alert
          v-if="store.status === 'running'"
          type="info"
          :closable="false"
          title="推荐计算中，请稍候…"
          class="status-alert"
        />

        <template v-if="report">
          <el-tag v-if="isMock" type="warning" data-testid="mock-badge" class="mode-badge">
            模拟数据：模块适配器当前为内置 mock 模式
          </el-tag>
          <el-alert
            v-if="report.llmStatus === 'degraded'"
            type="info"
            :closable="false"
            show-icon
            title="文案模板降级：LLM 不可用，以下文案由模板生成，确定性数据不受影响"
            class="status-alert"
          />
          <el-alert
            v-for="(w, i) in report.warnings ?? []"
            :key="i"
            type="warning"
            :closable="false"
            :title="w"
            class="status-alert"
          />

          <StepStepper :steps="report.steps ?? []" class="panel" />

          <el-card shadow="never" class="panel">
            <template #header>目标性能与权重</template>
            <el-table :data="report.targets?.targets ?? []" size="small">
              <el-table-column prop="perf" label="性能指标" />
              <el-table-column label="目标值">
                <template #default="{ row }">
                  {{ row.value }} {{ row.unit ?? '' }}
                </template>
              </el-table-column>
              <el-table-column label="权重">
                <template #default="{ row }">{{ weightOf(row.perf) }}</template>
              </el-table-column>
            </el-table>
          </el-card>

          <BenchmarkTable :rows="report.benchmark ?? []" class="panel" />

          <ReportSection
            :sections="report.sections ?? []"
            :llm-status="report.llmStatus ?? 'degraded'"
            class="panel"
          />

          <CandidateCard
            v-for="(c, i) in report.candidates ?? []"
            :key="c.id"
            :candidate="c"
            :index="i"
            :adapter-mode="report.adapterMode ?? { a: 'mock', c: 'mock' }"
            :evidence="report.evidence ?? []"
            :expanded="expandedIds.has(c.id)"
            @toggle="toggleCandidate(c.id)"
          />

          <ChatPanel :report="report" class="panel" />
        </template>

        <el-empty
          v-else-if="store.status !== 'running'"
          description="填写养护场景并点击「生成推荐方案」开始推荐"
          class="panel"
        />
      </el-col>
    </el-row>
  </div>
</template>

<style scoped>
.panel {
  margin-bottom: 16px;
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

.mode-badge {
  margin-bottom: 12px;
}
</style>
