import { flushPromises, mount } from '@vue/test-utils'
import { ElInputNumber } from 'element-plus'
import { createPinia, setActivePinia } from 'pinia'
import { createMemoryHistory, createRouter } from 'vue-router'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { getCases, postChat, postRecommend } from '@/api/client'
import { useRecommendStore } from '@/stores/recommend'
import type { Candidate, CaseSeed, RecommendationReport, SceneInput } from '@road-rec/contracts'
import RecommendView from '@/views/RecommendView.vue'
import EvidencePanel from '@/components/EvidencePanel.vue'
import WaterfallChart from '@/components/WaterfallChart.vue'

vi.mock('@/api/client', () => ({
  getCases: vi.fn(),
  postRecommend: vi.fn(),
  postChat: vi.fn(),
}))

// ECharts 在 happy-dom 无真实 canvas：mock 掉 echarts/core 及其子模块，视图测试只关心渲染结构。
vi.mock('echarts/core', () => ({
  use: () => {},
  init: () => ({
    setOption: () => {},
    resize: () => {},
    dispose: () => {},
  }),
}))
vi.mock('echarts/charts', () => ({ RadarChart: {}, BarChart: {} }))
vi.mock('echarts/components', () => ({
  RadarComponent: {},
  TooltipComponent: {},
  LegendComponent: {},
  GridComponent: {},
}))
vi.mock('echarts/renderers', () => ({ CanvasRenderer: {} }))

const getCasesMock = vi.mocked(getCases)
const postRecommendMock = vi.mocked(postRecommend)
const postChatMock = vi.mocked(postChat)

const validScene: SceneInput = {
  schemaVersion: '1',
  climate: { zone: '华南高温区', pgHigh: 76, pgLow: -22 },
  traffic: { level: 'heavy', esal: 20000000 },
  pavement: { layer: '上面层', structure: '半刚性基层沥青路面' },
  distresses: [{ type: '车辙', severity: '中' }],
  constraints: { budget: 500, schedule: 30, env: '环保要求高', noise: '低噪' },
  notes: '',
}

const makeCandidate = (
  id: string,
  options: { withExplanations?: boolean; extra?: boolean } = {},
): Candidate => ({
  schemaVersion: '1',
  id,
  formula: {
    schemaVersion: '1',
    binder: { type: 'SBS改性沥青', grade: 'PG76-22', pg: '76-22' },
    modifier: { type: 'SBS', dosage: 4.5 },
    gradation: { type: 'SMA-13' },
    additives: [],
    oilStoneRatio: 6.1,
    airVoids: 4,
  },
  predictions: [{ perf: 'highTemp', value: 80, ciLow: 76, ciHigh: 84, unit: '℃' }],
  explanations: options.withExplanations
    ? [{ feature: 'SBS掺量', contribution: 12.5 }]
    : undefined,
  radar: {
    highTemp: 80,
    lowTemp: 60,
    fatigue: 70,
    waterStability: 75,
    lcc: 65,
    carbon: 55,
    expectedLife: 70,
    constructability: 80,
  },
  lcc: 100,
  carbon: 50,
  expectedLife: 12,
  score: 0.85,
  evidenceIds: ['chunk-1'],
  ...(options.extra ? { futureField: '未知字段' } : {}),
})

const makeReport = (overrides: Partial<RecommendationReport> = {}): RecommendationReport => ({
  schemaVersion: '1',
  scene: validScene,
  targets: {
    schemaVersion: '1',
    targets: [
      { perf: '高温PG', value: 76, unit: '℃' },
      { perf: '成本', value: 500, unit: '万元' },
    ],
    priorities: [{ perf: '高温PG', weight: 0.7 }],
  },
  candidates: [makeCandidate('cand-1'), makeCandidate('cand-2', { withExplanations: true })],
  evidence: [
    {
      schemaVersion: '1',
      chunkId: 'chunk-1',
      text: 'SBS改性沥青可显著提高高温抗车辙性能。',
      docType: 'standard',
      tags: ['车辙'],
      score: 0.9,
      provenance: {
        sourceDocId: 'std-jtg5142-4',
        contentHash: 'abc',
        embeddingModel: 'bge-m3',
        modelVersion: '1',
        dim: 1024,
        pipelineRev: 'abc1234',
        embeddedAt: '2026-10-17',
      },
    },
  ],
  benchmark: [
    { label: '高温性能', unit: '℃', baseline: 64, candidates: { 'cand-1': 80, 'cand-2': 75 } },
  ],
  sections: [
    { title: '推荐理由', paragraphs: ['本方案针对高温重载车辙场景。'], evidenceIds: ['chunk-1'] },
  ],
  charts: {},
  llmStatus: 'ok',
  adapterMode: { a: 'mock', c: 'mock' },
  warnings: [],
  steps: [
    { name: 'parse', ms: 1 },
    { name: 'mapping', ms: 2 },
    { name: 'recall', ms: 3 },
    { name: 'predict', ms: 4 },
    { name: 'rank', ms: 5 },
    { name: 'report', ms: 6 },
  ],
  ...overrides,
  // 模拟后端前向兼容：报告含未知顶层字段
  extraTopLevelField: '未知字段不崩' as never,
} as unknown as RecommendationReport)

const caseFixture = (id: string): CaseSeed => ({
  schemaVersion: '1',
  id,
  title: `${id} 案例`,
  summary: '案例摘要',
  scene: validScene,
  expected: { formulas: [] },
})

async function mountView(routePath = '/recommend') {
  const pinia = createPinia()
  setActivePinia(pinia)
  const store = useRecommendStore()
  store.report = makeReport()
  store.status = 'done'
  store.scene = validScene

  const router = createRouter({
    history: createMemoryHistory(),
    routes: [{ path: '/recommend', name: 'recommend', component: RecommendView }],
  })
  await router.push(routePath)
  await router.isReady()

  const wrapper = mount(RecommendView, {
    global: { plugins: [pinia, router] },
  })
  await flushPromises()
  return wrapper
}

beforeEach(() => {
  getCasesMock.mockReset()
  postRecommendMock.mockReset()
  postChatMock.mockReset()
  getCasesMock.mockResolvedValue([])
  postRecommendMock.mockResolvedValue(makeReport())
})

describe('RecommendView 推荐工作台', () => {
  it('注入含未知字段的报告：不抛错且渲染候选卡片数 = fixture 数', async () => {
    const wrapper = await mountView()

    expect(wrapper.findAll('[data-testid="candidate-card"]')).toHaveLength(2)
    // 未知字段不影响渲染；报告段落正常显示
    expect(wrapper.text()).toContain('本方案针对高温重载车辙场景。')
  })

  it('adapterMode 为 mock 时显示「模拟数据」角标', async () => {
    const wrapper = await mountView()
    expect(wrapper.findAll('[data-testid="mock-badge"]').length).toBeGreaterThan(0)
    expect(wrapper.text()).toContain('模拟数据')
  })

  it('llmStatus 为 degraded 时显示降级提示', async () => {
    const pinia = createPinia()
    setActivePinia(pinia)
    const store = useRecommendStore()
    store.report = makeReport({ llmStatus: 'degraded' })
    store.status = 'degraded'
    store.scene = validScene

    const router = createRouter({
      history: createMemoryHistory(),
      routes: [{ path: '/recommend', component: RecommendView }],
    })
    await router.push('/recommend')
    await router.isReady()
    const wrapper = mount(RecommendView, { global: { plugins: [pinia, router] } })
    await flushPromises()

    expect(wrapper.text()).toContain('文案模板降级')
  })

  it('空 evidence 显示「知识库为空」提示', async () => {
    const pinia = createPinia()
    setActivePinia(pinia)
    const store = useRecommendStore()
    store.report = makeReport({ evidence: [], warnings: ['知识库为空，请执行 pnpm build:index'] })
    store.status = 'done'
    store.scene = validScene

    const router = createRouter({
      history: createMemoryHistory(),
      routes: [{ path: '/recommend', component: RecommendView }],
    })
    await router.push('/recommend')
    await router.isReady()
    const wrapper = mount(RecommendView, { global: { plugins: [pinia, router] } })
    await flushPromises()

    expect(wrapper.text()).toContain('知识库为空')
  })

  it('WaterfallChart 仅在候选带 explanations 时渲染', async () => {
    const wrapper = await mountView()
    // fixture：cand-1 无 explanations、cand-2 有 → 只渲染一个瀑布图
    expect(wrapper.findAllComponents(WaterfallChart)).toHaveLength(1)
  })

  it('微调面板修改预算后调用 adjustAndRerun 重跑', async () => {
    const wrapper = await mountView()

    const budgetInput = wrapper.find('[data-testid="adjust-budget"] input')
    expect(budgetInput.exists()).toBe(true)
    await budgetInput.setValue('600')
    await wrapper.find('[data-testid="adjust-apply"]').trigger('click')
    await flushPromises()

    expect(postRecommendMock).toHaveBeenCalledTimes(1)
    const sceneArg = postRecommendMock.mock.calls[0]?.[0] as SceneInput
    expect(sceneArg.constraints.budget).toBe(600)
  })

  it('ChatPanel 发送问题后展示流式回复', async () => {
    postChatMock.mockImplementation(async (_req, onDelta) => {
      onDelta?.('推荐')
      onDelta?.('方案一')
      return '推荐方案一'
    })
    const wrapper = await mountView()

    const input = wrapper.find('[data-testid="chat-input"]')
    expect(input.exists()).toBe(true)
    await input.setValue('为什么推荐它？')
    await wrapper.find('[data-testid="chat-send"]').trigger('click')
    await flushPromises()

    expect(postChatMock).toHaveBeenCalledTimes(1)
    expect(wrapper.text()).toContain('推荐方案一')
  })

  it('ChatPanel 中文输入法选词回车不误发（isComposing 过滤，F4）', async () => {
    const wrapper = await mountView()
    const input = wrapper.find('[data-testid="chat-input"]')
    await input.setValue('推荐这个方案')

    await input.trigger('keydown.enter', { key: 'Enter', isComposing: true })
    await flushPromises()
    expect(postChatMock).not.toHaveBeenCalled()

    await input.trigger('keydown.enter', { key: 'Enter' })
    await flushPromises()
    expect(postChatMock).toHaveBeenCalledTimes(1)
  })

  it('EvidencePanel 分数按首位归一化展示（F2 残留）', () => {
    const evidence = [
      { ...makeReport().evidence[0], chunkId: 'top', score: 0.9 },
      { ...makeReport().evidence[0], chunkId: 'low', score: 0.02 },
    ]
    const wrapper = mount(EvidencePanel, {
      props: { evidence, ids: ['top', 'low'] },
    })

    const text = wrapper.text()
    expect(text).toContain('相关度（归一化）：100')
    expect(text).toContain('相关度（归一化）：2')
    expect(text).not.toContain('0.020')
    expect(text).not.toContain('0.900')
  })

  it('案例一键填入：?case= 查询参数自动填充表单并可提交', async () => {
    getCasesMock.mockResolvedValue([caseFixture('case-01'), caseFixture('case-02')])
    postRecommendMock.mockResolvedValue(makeReport())

    const pinia = createPinia()
    setActivePinia(pinia)
    const store = useRecommendStore()

    const router = createRouter({
      history: createMemoryHistory(),
      routes: [{ path: '/recommend', name: 'recommend', component: RecommendView }],
    })
    await router.push('/recommend?case=case-01')
    await router.isReady()
    const wrapper = mount(RecommendView, { global: { plugins: [pinia, router] } })
    await flushPromises()

    expect(store.activeCaseId).toBe('case-01')
    // F3：回填后交通荷载控件显示中文 label 而非英文值
    const trafficField = wrapper.find('[data-testid="field-traffic.level"]')
    expect(trafficField.text()).toContain('重交通')
    expect(trafficField.text()).not.toContain('heavy')
    await wrapper.find('[data-testid="scene-form-submit"]').trigger('click')
    await flushPromises()

    const sceneArg = postRecommendMock.mock.calls[0]?.[0] as SceneInput
    expect(sceneArg.climate.zone).toBe(validScene.climate.zone)
    expect(sceneArg.traffic.level).toBe('heavy')
    expect(sceneArg.distresses).toEqual(validScene.distresses)
  })
})
