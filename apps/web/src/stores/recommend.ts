import { defineStore } from 'pinia'
import { computed, ref, shallowRef } from 'vue'

import { postRecommend, streamRecommend } from '@/api/client'
import type {
  ChatMessage,
  RecommendationReport,
  ReportSection,
  SceneInput,
  StepRecord,
} from '@road-rec/contracts'

/**
 * 推荐流程状态机：idle → running → done | degraded | error。
 * - done / degraded 由报告的 llmStatus 决定（degraded = LLM 文案降级，确定性结果照常）；
 * - error = API 请求失败（网络/服务不可用），错误信息存 errorMessage；
 * - step：工作台两页式流程（input=参数页 / result=结果页）。
 */
export type RecommendStatus = 'idle' | 'running' | 'done' | 'degraded' | 'error'
export type RecommendStep = 'input' | 'result'

export const useRecommendStore = defineStore('recommend', () => {
  const status = shallowRef<RecommendStatus>('idle')
  const step = shallowRef<RecommendStep>('input')
  const scene = shallowRef<SceneInput | null>(null)
  const report = shallowRef<RecommendationReport | null>(null)
  const activeCaseId = shallowRef<string | null>(null)
  const chat = ref<ChatMessage[]>([])
  const errorMessage = shallowRef('')

  /** 流式消费的实时步进（running 期间逐 step 点亮，完成后清空走 report.steps）。 */
  const liveSteps = shallowRef<StepRecord[]>([])
  /** 流式消费的增量报告段落（每段淡入渲染，完成后清空走 report.sections）。 */
  const streamSections = shallowRef<ReportSection[]>([])

  /** 六步 pipeline 每步耗时（StepStepper 数据源）。 */
  const steps = computed(() =>
    status.value === 'running' ? liveSteps.value : (report.value?.steps ?? []),
  )

  function applyReport(result: RecommendationReport): void {
    report.value = result
    liveSteps.value = []
    streamSections.value = []
    status.value = result.llmStatus === 'degraded' ? 'degraded' : 'done'
  }

  /** 流式失败/异常 → 回退普通 JSON 接口重试一次。 */
  async function fallbackJsonRun(sceneInput: SceneInput, fromResult: boolean): Promise<void> {
    try {
      applyReport(await postRecommend(sceneInput))
    } catch (err) {
      status.value = 'error'
      errorMessage.value = err instanceof Error ? err.message : String(err)
      if (!fromResult) step.value = 'input'
    }
  }

  async function run(sceneInput: SceneInput): Promise<void> {
    status.value = 'running'
    errorMessage.value = ''
    scene.value = sceneInput
    liveSteps.value = []
    streamSections.value = []
    report.value = null
    // 结果页发起的微调重跑失败时留在结果页；参数页初次提交失败回到参数页。
    const fromResult = step.value === 'result'
    step.value = 'result'

    let streamFailed = false
    try {
      await streamRecommend(sceneInput, {
        onStep: (s) => {
          liveSteps.value = [...liveSteps.value, s]
        },
        onSection: (sec) => {
          streamSections.value = [...streamSections.value, sec]
        },
        onDone: applyReport,
        onError: () => {
          streamFailed = true
        },
      })
    } catch {
      streamFailed = true
    }
    if (streamFailed) await fallbackJsonRun(sceneInput, fromResult)
  }

  /** 结果页「修改参数」：回到参数页，scene 保留供表单回填。 */
  function backToInput(): void {
    step.value = 'input'
  }

  /** 微调面板：补丁合并进当前场景后重跑同一 pipeline。 */
  async function adjustAndRerun(patch: Partial<SceneInput>): Promise<void> {
    if (!scene.value) {
      status.value = 'error'
      errorMessage.value = '尚未提交场景，无法微调'
      return
    }
    await run({ ...scene.value, ...patch })
  }

  return {
    status,
    step,
    scene,
    report,
    steps,
    liveSteps,
    streamSections,
    activeCaseId,
    chat,
    errorMessage,
    run,
    backToInput,
    adjustAndRerun,
  }
})
