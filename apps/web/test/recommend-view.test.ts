import { flushPromises, mount } from '@vue/test-utils'
import { ElInputNumber, ElSelect, ElSteps, ElTableColumn } from 'element-plus'
import { createPinia, setActivePinia } from 'pinia'
import { createMemoryHistory, createRouter } from 'vue-router'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { getCases, postChat, postRecommend } from '@/api/client'
import { useRecommendStore } from '@/stores/recommend'
import type { Candidate, CaseSeed, RecommendationReport, SceneInput } from '@road-rec/contracts'
import RecommendView from '@/views/RecommendView.vue'
import CandidateCard from '@/components/CandidateCard.vue'
import EvidencePanel from '@/components/EvidencePanel.vue'
import ReportSection from '@/components/ReportSection.vue'
import StepStepper from '@/components/StepStepper.vue'
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

/** el-drawer 测试桩：按 modelValue 渲染内容（teleport 不参与，便于 wrapper 查询）。 */
const DrawerStub = {
  props: ['modelValue'],
  template: '<div v-if="modelValue" data-testid="drawer-stub"><slot /></div>',
}

async function mountView(routePath = '/recommend') {
  const pinia = createPinia()
  setActivePinia(pinia)
  const store = useRecommendStore()
  store.report = makeReport()
  store.status = 'done'
  store.step = 'result'
  store.scene = validScene

  const router = createRouter({
    history: createMemoryHistory(),
    routes: [{ path: '/recommend', name: 'recommend', component: RecommendView }],
  })
  await router.push(routePath)
  await router.isReady()

  const wrapper = mount(RecommendView, {
    global: {
      plugins: [pinia, router],
      stubs: { 'el-drawer': DrawerStub },
    },
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
    store.step = 'result'
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
    store.step = 'result'
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
    // fixture：cand-1 无 explanations、cand-2 有；cand-2 默认折叠 → 先展开再断言
    await wrapper.findAll('[data-testid="candidate-toggle"]')[1].trigger('click')
    await flushPromises()
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

    await wrapper.find('[data-testid="chat-fab"]').trigger('click')
    await flushPromises()
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
    await wrapper.find('[data-testid="chat-fab"]').trigger('click')
    await flushPromises()
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

  it('CandidateCard 预测项显示中文键名（UI#5）', () => {
    const wrapper = mount(CandidateCard, {
      props: {
        candidate: makeCandidate('cand-1'),
        index: 0,
        adapterMode: { a: 'mock', c: 'mock' },
        evidence: [],
        expanded: true,
      },
    })

    const text = wrapper.text()
    expect(text).toContain('高温性能')
    expect(text).not.toContain('highTemp')
  })

  it('报告位于候选卡列表之前（UI#1）', async () => {
    const wrapper = await mountView()
    const els = wrapper.findAll('[data-testid="report-section"], [data-testid="candidate-card"]')
    expect(els.length).toBe(3) // 1 报告 + 2 候选卡
    expect(els[0].attributes('data-testid')).toBe('report-section')
  })

  it('候选卡默认仅展开 top-1，点击折叠卡可展开（UI#1）', async () => {
    const wrapper = await mountView()
    const cards = wrapper.findAll('[data-testid="candidate-card"]')
    expect(cards).toHaveLength(2)
    expect(cards[0].find('[data-testid="evidence-panel"]').exists()).toBe(true)
    expect(cards[1].find('[data-testid="evidence-panel"]').exists()).toBe(false)

    await wrapper.findAll('[data-testid="candidate-toggle"]')[1].trigger('click')
    await flushPromises()

    expect(wrapper.findAll('[data-testid="candidate-card"]')[1].find('[data-testid="evidence-panel"]').exists()).toBe(true)
  })

  it('目标表：权重显示百分比、长数字千分位（UI#6）', async () => {
    const pinia = createPinia()
    setActivePinia(pinia)
    const store = useRecommendStore()
    store.report = makeReport({
      targets: {
        schemaVersion: '1',
        targets: [{ perf: '疲劳', value: 1000000, unit: '次' }],
        priorities: [{ perf: '疲劳', weight: 0.2697 }],
      },
    })
    store.status = 'done'
    store.step = 'result'
    store.scene = validScene

    const router = createRouter({
      history: createMemoryHistory(),
      routes: [{ path: '/recommend', component: RecommendView }],
    })
    await router.push('/recommend')
    await router.isReady()
    const wrapper = mount(RecommendView, { global: { plugins: [pinia, router] } })
    await flushPromises()

    expect(wrapper.text()).toContain('27.0%')
    expect(wrapper.text()).toContain('1,000,000 次')
  })

  it('StepStepper running 时 active 为最后一步之前（UI#9）', () => {
    const steps = [
      { name: 'parse', ms: 1 },
      { name: 'mapping', ms: 2 },
      { name: 'recall', ms: 3 },
    ]
    const running = mount(StepStepper, { props: { steps, running: true } })
    expect(running.findComponent(ElSteps).props('active')).toBe(2)

    const done = mount(StepStepper, { props: { steps, running: false } })
    expect(done.findComponent(ElSteps).props('active')).toBe(3)
  })

  it('对话面板：LLM 未配置时提示配置 API Key（UI#12）', async () => {
    const healthFetch = vi.fn(async () =>
      new Response(JSON.stringify({ llm: { configured: false } }), {
        headers: { 'content-type': 'application/json' },
      }),
    )
    vi.stubGlobal('fetch', healthFetch)
    try {
      const wrapper = await mountView()
      await wrapper.find('[data-testid="chat-fab"]').trigger('click')
      await flushPromises()

      // 空输入时给输入提示
      expect(wrapper.find('[data-testid="chat-hint"]').text()).toContain('请输入问题')

      const input = wrapper.find('[data-testid="chat-input"]')
      await input.setValue('为什么推荐它？')
      await flushPromises()

      expect(wrapper.find('[data-testid="chat-hint"]').text()).toContain('配置 DEEPSEEK_API_KEY 后可用')
    } finally {
      vi.unstubAllGlobals()
    }
  })

  it('结果区顶部渲染 KPI hero：首选方案+得分+三指标+徽章（UI二轮）', async () => {
    const wrapper = await mountView()

    const hero = wrapper.find('[data-testid="kpi-hero"]')
    expect(hero.exists()).toBe(true)
    expect(hero.text()).toContain('SBS改性沥青 + SMA-13')
    expect(hero.text()).toContain('0.850')
    expect(hero.text()).toContain('预期寿命')
    expect(hero.text()).toContain('LCC')
    expect(hero.text()).toContain('碳排')
    expect(hero.find('[data-testid="mock-badge"]').exists()).toBe(true)
  })

  it('报告段落中证据 id 渲染为可点击角标并 emit cite（UI二轮）', async () => {
    const sections = [
      {
        title: '推荐理由',
        paragraphs: ['依据 k-modifier-002:0 的研究结论，SBS 改性效果显著。'],
        evidenceIds: [],
      },
    ]
    const wrapper = mount(ReportSection, {
      props: { sections, llmStatus: 'ok' },
    })

    const cite = wrapper.find('[data-testid="evidence-cite"]')
    expect(cite.exists()).toBe(true)
    expect(cite.text()).toBe('k-modifier-002:0')
    await cite.trigger('click')

    expect(wrapper.emitted('cite')?.[0]?.[0]).toBe('k-modifier-002:0')
  })

  it('点击报告角标 → 含该证据的折叠候选卡自动展开（UI二轮）', async () => {
    const pinia = createPinia()
    setActivePinia(pinia)
    const store = useRecommendStore()
    const rep = makeReport({
      sections: [
        {
          title: '推荐理由',
          paragraphs: ['依据 k-binder-001:0 的规范条文。'],
          evidenceIds: [],
        },
      ],
    })
    // 两个候选都引用 k-binder-001:0
    for (const c of rep.candidates) c.evidenceIds = ['k-binder-001:0']
    rep.evidence = [
      {
        ...rep.evidence[0],
        chunkId: 'k-binder-001:0',
      },
    ]
    store.report = rep
    store.status = 'done'
    store.step = 'result'
    store.scene = validScene

    const router = createRouter({
      history: createMemoryHistory(),
      routes: [{ path: '/recommend', component: RecommendView }],
    })
    await router.push('/recommend')
    await router.isReady()
    const wrapper = mount(RecommendView, { global: { plugins: [pinia, router] } })
    await flushPromises()

    // cand-2 默认折叠
    expect(
      wrapper.findAll('[data-testid="candidate-card"]')[1].find('[data-testid="evidence-panel"]').exists(),
    ).toBe(false)

    await wrapper.find('[data-testid="evidence-cite"]').trigger('click')
    await flushPromises()

    expect(
      wrapper.findAll('[data-testid="candidate-card"]')[1].find('[data-testid="evidence-panel"]').exists(),
    ).toBe(true)
  })

  it('running 状态渲染骨架屏（报告区+卡片区），无计算中提示（UI二轮）', async () => {
    const pinia = createPinia()
    setActivePinia(pinia)
    const store = useRecommendStore()
    store.status = 'running'
    store.step = 'result'
    store.report = null

    const router = createRouter({
      history: createMemoryHistory(),
      routes: [{ path: '/recommend', component: RecommendView }],
    })
    await router.push('/recommend')
    await router.isReady()
    const wrapper = mount(RecommendView, { global: { plugins: [pinia, router] } })
    await flushPromises()

    expect(wrapper.find('[data-testid="skeleton-report"]').exists()).toBe(true)
    expect(wrapper.find('[data-testid="skeleton-cards"]').exists()).toBe(true)
    expect(wrapper.text()).not.toContain('推荐计算中')
  })

  it('StepStepper running 且无 steps 时显示六步占位（UI二轮）', () => {
    const w = mount(StepStepper, { props: { steps: [], running: true } })
    const titles = w.findAll('.el-step__title').map((n) => n.text())
    expect(titles).toEqual(['解析', '映射', '召回', '预测', '排序', '报告'])
    expect(w.findComponent(ElSteps).props('active')).toBe(0)
  })

  it('折叠候选卡显示雷达三强项，index 0 带首选徽章（UI二轮）', () => {
    const cand = makeCandidate('cand-1')
    const wrapper = mount(CandidateCard, {
      props: {
        candidate: cand,
        index: 0,
        adapterMode: { a: 'mock', c: 'mock' },
        evidence: [],
        expanded: false,
      },
    })
    expect(wrapper.text()).toContain('高温 80 · 施工 80 · 水稳 75')
    expect(wrapper.find('[data-testid="top1-badge"]').exists()).toBe(true)

    const second = mount(CandidateCard, {
      props: {
        candidate: makeCandidate('cand-2'),
        index: 1,
        adapterMode: { a: 'mock', c: 'mock' },
        evidence: [],
        expanded: false,
      },
    })
    expect(second.find('[data-testid="top1-badge"]').exists()).toBe(false)
  })

  it('空态引导卡：两个行动按钮，查看案例跳转 /cases（UI二轮）', async () => {
    const pinia = createPinia()
    setActivePinia(pinia)
    const store = useRecommendStore()
    store.status = 'idle'
    store.report = null

    const router = createRouter({
      history: createMemoryHistory(),
      routes: [
        { path: '/recommend', component: RecommendView },
        { path: '/cases', component: { template: '<div />' } },
      ],
    })
    await router.push('/recommend')
    await router.isReady()
    const wrapper = mount(RecommendView, { global: { plugins: [pinia, router] } })
    await flushPromises()

    const guide = wrapper.find('[data-testid="empty-guide"]')
    expect(guide.exists()).toBe(true)

    await wrapper.find('[data-testid="goto-cases"]').trigger('click')
    await flushPromises()
    expect(router.currentRoute.value.path).toBe('/cases')

    await router.push('/recommend')
    const select = wrapper.findComponent(ElSelect)
    const focusSpy = vi.spyOn(select.vm, 'focus')
    await wrapper.find('[data-testid="focus-case-select"]').trigger('click')
    expect(focusSpy).toHaveBeenCalled()
  })

  it('表格数值列右对齐（目标表+基准对比，UI二轮）', async () => {
    const wrapper = await mountView()

    // 目标/基准为默认折叠区块 → 先展开
    const headers = wrapper.findAll('.el-collapse-item__header')
    for (const h of headers) {
      if (h.text().includes('目标性能') || h.text().includes('基准')) {
        await h.trigger('click')
      }
    }
    await flushPromises()

    const columns = wrapper.findAllComponents(ElTableColumn)
    const propsOf = (c: (typeof columns)[number]) => c.props() as Record<string, unknown>
    const byLabel = (label: string) => columns.find((c) => propsOf(c).label === label)
    const alignOf = (label: string) => {
      const col = byLabel(label)
      return col ? (propsOf(col).align as string | undefined) : undefined
    }

    expect(alignOf('目标值')).toBe('right')
    expect(alignOf('权重')).toBe('right')
    expect(alignOf('规范基线')).toBe('right')
    // 动态候选列（cand-1/cand-2）同样右对齐
    expect(alignOf('cand-1')).toBe('right')
    expect(alignOf('cand-2')).toBe('right')
  })

  it('Esc 收起已展开候选卡（UI二轮键盘）', async () => {
    const wrapper = await mountView()
    // 展开 cand-2
    await wrapper.findAll('[data-testid="candidate-toggle"]')[1].trigger('click')
    await flushPromises()
    expect(
      wrapper.findAll('[data-testid="candidate-card"]')[1].find('[data-testid="evidence-panel"]').exists(),
    ).toBe(true)

    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }))
    await flushPromises()

    expect(
      wrapper.findAll('[data-testid="candidate-card"]')[1].find('[data-testid="evidence-panel"]').exists(),
    ).toBe(false)
    // top-1 保持展开
    expect(
      wrapper.findAll('[data-testid="candidate-card"]')[0].find('[data-testid="evidence-panel"]').exists(),
    ).toBe(true)
  })

  it('两页式：提交切结果页，返回修改参数回填表单（重构）', async () => {
    postRecommendMock.mockResolvedValue(makeReport())
    const pinia = createPinia()
    setActivePinia(pinia)
    const store = useRecommendStore()

    const router = createRouter({
      history: createMemoryHistory(),
      routes: [{ path: '/recommend', component: RecommendView }],
    })
    await router.push('/recommend')
    await router.isReady()
    const wrapper = mount(RecommendView, {
      global: { plugins: [pinia, router], stubs: { 'el-drawer': DrawerStub } },
    })
    await flushPromises()

    // 初始在参数页：有表单、无结果区与工具栏
    expect(wrapper.find('[data-testid="scene-form-submit"]').exists()).toBe(true)
    expect(wrapper.find('[data-testid="kpi-hero"]').exists()).toBe(false)
    expect(wrapper.find('[data-testid="back-to-input"]').exists()).toBe(false)

    await wrapper.find('[data-testid="scene-form-submit"]').trigger('click')
    await flushPromises()

    expect(store.step).toBe('result')
    expect(wrapper.find('[data-testid="kpi-hero"]').exists()).toBe(true)
    expect(wrapper.find('[data-testid="scene-form-submit"]').exists()).toBe(false)

    // 模拟结果页上场景为 heavy（返回时必须用它回填表单）
    store.scene = {
      ...(store.scene as SceneInput),
      traffic: { ...(store.scene as SceneInput).traffic, level: 'heavy' },
    }

    await wrapper.find('[data-testid="back-to-input"]').trigger('click')
    await flushPromises()

    expect(store.step).toBe('input')
    // 回填：store.scene 的 traffic.level=heavy → 表单显示中文 label
    const trafficField = wrapper.find('[data-testid="field-traffic.level"]')
    expect(trafficField.text()).toContain('重交通')
  })

  it('追问悬浮按钮打开/收起对话抽屉（重构）', async () => {
    const wrapper = await mountView()
    expect(wrapper.find('[data-testid="drawer-stub"]').exists()).toBe(false)

    await wrapper.find('[data-testid="chat-fab"]').trigger('click')
    await flushPromises()
    expect(wrapper.find('[data-testid="drawer-stub"]').exists()).toBe(true)
    expect(wrapper.find('[data-testid="chat-input"]').exists()).toBe(true)

    await wrapper.find('[data-testid="chat-close"]').trigger('click')
    await flushPromises()
    expect(wrapper.find('[data-testid="drawer-stub"]').exists()).toBe(false)
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
