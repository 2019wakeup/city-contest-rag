import { flushPromises, mount } from '@vue/test-utils'
import { ElInputNumber, ElSelect, ElSteps, ElTableColumn, ElTooltip } from 'element-plus'
import { readFileSync } from 'node:fs'
import { createPinia, setActivePinia } from 'pinia'
import { nextTick } from 'vue'
import { createMemoryHistory, createRouter } from 'vue-router'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { getCases, postChat, postRecommend, streamRecommend } from '@/api/client'
import { DOC_TYPE_LABELS, LAB_INDICATOR_LABELS, labelOf } from '@/utils/labels'
import { useRecommendStore } from '@/stores/recommend'
import type { Candidate, CaseSeed, RecommendationReport, SceneInput } from '@road-rec/contracts'
import RecommendView from '@/views/RecommendView.vue'
import BenchmarkTable from '@/components/BenchmarkTable.vue'
import CandidateCard from '@/components/CandidateCard.vue'
import ChatPanel from '@/components/ChatPanel.vue'
import EvidencePanel from '@/components/EvidencePanel.vue'
import RadarChart from '@/components/RadarChart.vue'
import ReportSection from '@/components/ReportSection.vue'
import StepStepper from '@/components/StepStepper.vue'
import ShapBar from '@/components/ShapBar.vue'
import WaterfallChart from '@/components/WaterfallChart.vue'
import { formatRadarTooltip } from '@/utils/radar'

vi.mock('@/api/client', () => ({
  getCases: vi.fn(),
  postRecommend: vi.fn(),
  postChat: vi.fn(),
  streamRecommend: vi.fn(),
}))

// ECharts 在 happy-dom 无真实 canvas：mock 掉 echarts/core 及其子模块；捕获 setOption 供断言。
const { chartOptions } = vi.hoisted(() => ({
  chartOptions: [] as Array<Record<string, unknown>>,
}))

vi.mock('echarts/core', () => ({
  use: () => {},
  init: () => ({
    setOption: (opt: Record<string, unknown>) => {
      chartOptions.push(opt)
    },
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
const streamRecommendMock = vi.mocked(streamRecommend)

const validScene: SceneInput = {
  schemaVersion: '1',
  climate: { zone: '1-4 华南湿热区', pgHigh: 76, pgLow: -22 },
  traffic: { level: 'heavy', esal: 20000000 },
  pavement: { layer: 'surface', structure: '半刚性基层沥青路面' },
  distresses: [{ type: 'rutting', severity: '中' }],
  constraints: { budget: 500, schedule: 30, env: 'normal', noise: 'none' },
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
  store.step = 'result'
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
  localStorage.clear()
  getCasesMock.mockReset()
  postRecommendMock.mockReset()
  postChatMock.mockReset()
  streamRecommendMock.mockReset()
  getCasesMock.mockResolvedValue([])
  postRecommendMock.mockResolvedValue(makeReport())
  streamRecommendMock.mockImplementation(async (_scene, handlers) => {
    handlers?.onDone?.(makeReport())
  })
})

/** 打开对话侧板（从 closed 状态点击悬浮胶囊）。 */
async function openChatDock(wrapper: Awaited<ReturnType<typeof mountView>>) {
  await wrapper.find('[data-testid="chat-fab"]').trigger('click')
  await flushPromises()
}

const dockWidthOf = (wrapper: Awaited<ReturnType<typeof mountView>>): string =>
  ((wrapper.find('[data-testid="chat-dock"]').element as HTMLElement | undefined)?.style.width) ?? ''

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

  it('ShapBar 仅在候选带 explanations 时渲染（UI8 替换瀑布为特征贡献）', async () => {
    const wrapper = await mountView()
    // fixture：cand-1 无 explanations、cand-2 有；cand-2 默认折叠 → 先展开再断言
    // UI8：切换后分析可视化卡片同步切到 cand-2 → 候选卡内 + 分析卡内共 2 个
    await wrapper.findAll('[data-testid="candidate-toggle"]')[1].trigger('click')
    await flushPromises()
    expect(wrapper.findAllComponents(ShapBar)).toHaveLength(2)
  })

  it('P3 场景 chips：气候/交通/病害/预算/工期与案例名（P3）', async () => {
    const pinia = createPinia()
    setActivePinia(pinia)
    const store = useRecommendStore()
    store.report = makeReport()
    store.status = 'done'
    store.step = 'result'
    store.scene = validScene
    store.activeCaseId = 'case-01'

    const router = createRouter({
      history: createMemoryHistory(),
      routes: [{ path: '/recommend', component: RecommendView }],
    })
    await router.push('/recommend')
    await router.isReady()
    getCasesMock.mockResolvedValue([caseFixture('case-01')])
    const wrapper = mount(RecommendView, { global: { plugins: [pinia, router] } })
    await flushPromises()

    const chips = wrapper.find('[data-testid="scene-chips"]')
    expect(chips.exists()).toBe(true)
    expect(chips.text()).toContain('1-4 华南湿热区')
    expect(chips.text()).toContain('重交通')
    expect(chips.text()).toContain('车辙')
    expect(chips.text()).toContain('500 万元')
    expect(chips.text()).toContain('30 天')
    expect(chips.text()).toContain('case-01 案例')
  })

  it('P3 微调差异提示与恢复原值（P3）', async () => {
    const wrapper = await mountView()

    const budgetInput = wrapper.find('[data-testid="adjust-budget"] input')
    await budgetInput.setValue('350')
    await wrapper.find('[data-testid="adjust-apply"]').trigger('click')
    await flushPromises()

    const notice = wrapper.find('[data-testid="adjust-notice"]')
    expect(notice.exists()).toBe(true)
    expect(notice.text()).toContain('预算 500→350 · 已重新生成')

    await wrapper.find('[data-testid="restore-original"]').trigger('click')
    await flushPromises()
    const lastScene = streamRecommendMock.mock.calls.at(-1)?.[0] as SceneInput
    expect(lastScene.constraints.budget).toBe(500)
  })

  it('P3 running 时工具栏：取消按钮/禁用按钮/进度条/sticky（P3）', async () => {
    const pinia = createPinia()
    setActivePinia(pinia)
    const store = useRecommendStore()
    store.report = makeReport()
    store.status = 'running'
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

    expect(wrapper.find('[data-testid="cancel-run"]').exists()).toBe(true)
    expect(wrapper.find('[data-testid="back-to-input"]').attributes('disabled')).toBeDefined()
    expect(wrapper.find('[data-testid="adjust-apply"]').attributes('disabled')).toBeDefined()
    expect(wrapper.find('[data-testid="rerun-progress"]').exists()).toBe(true)
    expect(wrapper.find('.result-toolbar').classes()).toContain('is-sticky')
    expect(wrapper.find('[data-testid="result-content"]').classes()).toContain('is-stale')
  })

  it('微调面板修改预算后调用 adjustAndRerun 重跑', async () => {
    const wrapper = await mountView()

    const budgetInput = wrapper.find('[data-testid="adjust-budget"] input')
    expect(budgetInput.exists()).toBe(true)
    await budgetInput.setValue('600')
    await wrapper.find('[data-testid="adjust-apply"]').trigger('click')
    await flushPromises()

    expect(streamRecommendMock).toHaveBeenCalledTimes(1)
    const sceneArg = streamRecommendMock.mock.calls[0]?.[0] as SceneInput
    expect(sceneArg.constraints.budget).toBe(600)
  })

  it('ChatPanel typing 三点脉冲：流式期间显示、结束移除（D）', async () => {
    let resolveChat: (value: string) => void = () => {}
    postChatMock.mockImplementation(
      () =>
        new Promise<string>((resolve) => {
          resolveChat = resolve
        }),
    )
    const wrapper = await mountView()
    await openChatDock(wrapper)
    await wrapper.find('[data-testid="chat-input"]').setValue('问一下')
    await wrapper.find('[data-testid="chat-send"]').trigger('click')
    await flushPromises()

    expect(wrapper.find('[data-testid="typing-dots"]').exists()).toBe(true)

    resolveChat('答复内容')
    await flushPromises()
    expect(wrapper.find('[data-testid="typing-dots"]').exists()).toBe(false)
    expect(wrapper.text()).toContain('答复内容')
  })

  it('ChatPanel 消息区自动滚底（D）', async () => {
    const wrapper = await mountView()
    await openChatDock(wrapper)
    const messages = wrapper.find('[data-testid="chat-messages"]').element as HTMLElement
    Object.defineProperty(messages, 'scrollHeight', { value: 500, configurable: true })

    const store = useRecommendStore()
    store.chat.push({ role: 'user', content: '你好' })
    await nextTick()
    await flushPromises()
    expect(messages.scrollTop).toBe(500)
  })

  it('ChatPanel 打开自动聚焦输入框（D）', async () => {
    const pinia = createPinia()
    setActivePinia(pinia)
    const holder = document.createElement('div')
    document.body.appendChild(holder)
    const wrapper = mount(ChatPanel, {
      props: { report: null },
      attachTo: holder,
    })
    await flushPromises()

    const input = wrapper.find('[data-testid="chat-input"]').element as HTMLElement
    expect(document.activeElement).toBe(input)

    wrapper.unmount()
    holder.remove()
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

  it('EvidencePanel 分数按首位归一化展示（F2 残留）', async () => {
    const evidence = [
      { ...makeReport().evidence[0], chunkId: 'top', score: 0.9 },
      { ...makeReport().evidence[0], chunkId: 'low', score: 0.02 },
    ]
    const wrapper = mount(EvidencePanel, {
      props: { evidence, ids: ['top', 'low'] },
    })

    // 卡片化后默认只展开首条 → 展开第二条再断言其归一化分数
    const items = wrapper.findAll('[data-testid="evidence-item"]')
    await items[1].trigger('click')

    const text = wrapper.text()
    expect(text).toContain('相关度（归一化）：100')
    expect(text).toContain('相关度（归一化）：2')
    expect(text).not.toContain('0.020')
    expect(text).not.toContain('0.900')
  })

  it('证据链卡片化：条目数/首条默认展开/点击切换/data-evidence-id（C）', async () => {
    const evidence = [
      { ...makeReport().evidence[0], chunkId: 'ev-a', score: 0.9 },
      { ...makeReport().evidence[0], chunkId: 'ev-b', score: 0.02 },
    ]
    const wrapper = mount(EvidencePanel, {
      props: { evidence, ids: ['ev-a', 'ev-b'] },
    })

    const items = wrapper.findAll('[data-testid="evidence-item"]')
    expect(items).toHaveLength(2)
    expect(wrapper.text()).toContain('共 2 条证据 · 按相关度排序')

    // 首条默认展开
    expect(items[0].classes()).toContain('is-expanded')
    expect(items[1].classes()).not.toContain('is-expanded')
    expect(items[0].attributes('data-evidence-id')).toBe('ev-a')

    // 点击第二条 → 展开；点击第一条 → 收起
    await items[1].trigger('click')
    expect(wrapper.findAll('[data-testid="evidence-item"]')[1].classes()).toContain('is-expanded')
    await wrapper.findAll('[data-testid="evidence-item"]')[0].trigger('click')
    expect(wrapper.findAll('[data-testid="evidence-item"]')[0].classes()).not.toContain('is-expanded')
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

  it('P5 候选卡：助剂 chips 与 PG 等级（P5）', () => {
    const cand = makeCandidate('cand-1')
    cand.formula.additives = [
      { type: '抗剥落剂', dosage: 0.3 },
      { type: '纤维稳定剂', dosage: 0.4 },
    ]
    const wrapper = mount(CandidateCard, {
      props: {
        candidate: cand,
        index: 0,
        adapterMode: { a: 'mock', c: 'mock' },
        evidence: [],
        expanded: true,
      },
    })

    const text = wrapper.text()
    expect(text).toContain('PG 等级')
    expect(text).toContain('76-22')
    expect(text).toContain('助剂')
    expect(text).toContain('抗剥落剂 0.3%')
    expect(text).toContain('纤维稳定剂 0.4%')
  })

  it('P5 缺置信区间显示「置信区间不可用（模块 C 未提供）」（P5）', () => {
    const cand = makeCandidate('cand-1')
    cand.predictions = [{ perf: 'highTemp', value: 80, ciLow: undefined, ciHigh: undefined, unit: '℃' }]
    const wrapper = mount(CandidateCard, {
      props: {
        candidate: cand,
        index: 0,
        adapterMode: { a: 'mock', c: 'mock' },
        evidence: [],
        expanded: true,
      },
    })

    expect(wrapper.text()).toContain('置信区间不可用（模块 C 未提供）')
  })

  it('排版重构：结论先行块/节编号/行宽（排版）', () => {
    const sections = [
      { title: '推荐理由', paragraphs: ['首段结论。', '普通正文。'], evidenceIds: [] },
      { title: '对比分析', paragraphs: ['第二段结论。'], evidenceIds: [] },
    ]
    const wrapper = mount(ReportSection, {
      props: { sections, llmStatus: 'ok' },
    })

    const leads = wrapper.findAll('.report-lead')
    expect(leads.length).toBe(2) // 每节第 1 段
    expect(leads[0].text()).toBe('首段结论。')

    const nums = wrapper.findAll('.report-title-num')
    expect(nums.map((n) => n.text())).toEqual(['01', '02'])
    expect(nums[0].classes()).toContain('mono')

    const source = readFileSync('src/components/ReportSection.vue', 'utf8')
    expect(source).toContain('max-width: 640px')
  })

  it('排版重构：连续要点段落合并为一个 ul（微调）', () => {
    const sections = [
      {
        title: '要点',
        paragraphs: ['· 一', '· 二', '· 三', '· 四', '· 五'],
        evidenceIds: [],
      },
    ]
    const wrapper = mount(ReportSection, {
      props: { sections, llmStatus: 'ok' },
    })

    const uls = wrapper.findAll('ul.report-points')
    expect(uls.length).toBe(1)
    expect(uls[0].findAll('li').length).toBe(5)
  })

  it('排版重构：非连续要点分组为多个 ul（微调）', () => {
    const sections = [
      {
        title: '要点',
        paragraphs: ['· 一', '普通正文段', '· 二', '· 三'],
        evidenceIds: [],
      },
    ]
    const wrapper = mount(ReportSection, {
      props: { sections, llmStatus: 'ok' },
    })

    const uls = wrapper.findAll('ul.report-points')
    expect(uls.length).toBe(2)
    expect(uls[0].findAll('li').length).toBe(1)
    expect(uls[1].findAll('li').length).toBe(2)
  })

  it('排版重构：要点段落转 ul 且去前缀（排版）', () => {
    const sections = [
      {
        title: '要点',
        paragraphs: ['· 掺量 4.5% 时效果最优\n· 低温性能提升明显'],
        evidenceIds: [],
      },
    ]
    const wrapper = mount(ReportSection, {
      props: { sections, llmStatus: 'ok' },
    })

    const ul = wrapper.find('ul.report-points')
    expect(ul.exists()).toBe(true)
    const lis = ul.findAll('li')
    expect(lis.length).toBe(2)
    expect(lis[0].text()).not.toContain('·')
    expect(lis[0].text()).toContain('掺量')
    expect(lis[1].text()).toContain('低温性能')
  })

  it('排版重构：数字单位 num-strong 与方案 N cand-chip（排版）', () => {
    const sections = [
      {
        title: '强调',
        paragraphs: ['掺量 4.5% 时较方案 2 更优，寿命达 12年。'],
        evidenceIds: [],
      },
    ]
    const wrapper = mount(ReportSection, {
      props: { sections, llmStatus: 'ok' },
    })

    const nums = wrapper.findAll('.num-strong')
    expect(nums.length).toBe(2)
    expect(nums[0].text()).toContain('4.5')
    expect(nums[1].text()).toContain('12')

    const chip = wrapper.find('.cand-chip')
    expect(chip.exists()).toBe(true)
    expect(chip.text()).toBe('方案 2')
  })

  it('跨节证据去重：第二节重复项不重复渲染、显示见上文（去重）', async () => {
    const sections = [
      {
        title: '推荐理由',
        paragraphs: ['段一。'],
        evidenceIds: ['chunk-1', 'chunk-2'],
      },
      {
        title: '对比分析',
        paragraphs: ['段二。'],
        evidenceIds: ['chunk-2', 'chunk-1', 'chunk-3'],
      },
    ]
    const wrapper = mount(ReportSection, {
      props: { sections, llmStatus: 'ok', evidence: [] },
    })

    // 双栏侧栏：两节 chips 常驻展示
    const secs = wrapper.findAll('.sidebar-sec')
    expect(secs.length).toBe(2)
    // 第一节：2 个 chip、无「见上文」
    expect(secs[0].findAll('[data-testid="evidence-cite"]').length).toBe(2)
    expect(secs[0].findAll('[data-testid="ref-seen"]').length).toBe(0)

    // 第二节：chunk-2/chunk-1 已见于上文 → 不重复渲染 chip，出现「见上文」小标
    expect(secs[1].findAll('[data-testid="evidence-cite"]').length).toBe(1)
    expect(secs[1].find('[data-testid="evidence-cite"]').text()).toBe('证据 3')
    const seen = secs[1].findAll('[data-testid="ref-seen"]')
    expect(seen.length).toBe(2)
    expect(seen[0].text()).toContain('见上文')
    expect(seen[1].text()).toContain('见上文')
  })

  it('双栏布局：证据侧栏常驻 chips、无旧折叠按钮、点击 cite（UI7）', async () => {
    const sections = [
      {
        title: '推荐理由',
        paragraphs: ['推荐依据如下。'],
        evidenceIds: ['chunk-1'],
      },
    ]
    const wrapper = mount(ReportSection, {
      props: { sections, llmStatus: 'ok', evidence: [] },
    })

    expect(wrapper.find('[data-testid="refs-toggle"]').exists()).toBe(false) // 旧折叠移除
    const sidebar = wrapper.find('[data-testid="evidence-sidebar"]')
    expect(sidebar.exists()).toBe(true)
    const chips = wrapper.findAll('[data-testid="evidence-cite"]')
    expect(chips.length).toBe(1)

    await chips[0].trigger('click')
    expect(wrapper.emitted('cite')?.[0]?.[0]).toBe('chunk-1')
  })

  it('双栏布局：grid 与阅读列规格（UI7）', () => {
    const source = readFileSync('src/components/ReportSection.vue', 'utf8')
    expect(source).toContain('minmax(0, 1fr) 280px')
    expect(source).toContain('position: sticky')
    expect(source).toContain('top: 96px')
    expect(source).toContain('max-width: 640px')
    expect(source).toContain('grid-template-columns: 1fr 1fr')
  })

  it('P5 报告正文排版规格 + 数字单位 &nbsp;（P5）', () => {
    const source = readFileSync('src/components/ReportSection.vue', 'utf8')
    expect(source).toContain('max-width: 640px')
    expect(source).toContain('font-size: 16px')

    const sections = [
      {
        title: '推荐理由',
        paragraphs: ['SBS掺量4.5%时寿命达12年，成本较基线降低8万元。'],
        evidenceIds: [],
      },
    ]
    const wrapper = mount(ReportSection, {
      props: { sections, llmStatus: 'ok' },
    })

    const paragraph = wrapper.find('.report-paragraph').text()
    expect(paragraph).toContain('4.5\u00A0%')
    expect(paragraph).toContain('12\u00A0年')
    expect(paragraph).toContain('8\u00A0万元')
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
    // 灵动层：得分数字滚动 420ms 完成后再断言终值
    await new Promise((resolve) => setTimeout(resolve, 500))

    const hero = wrapper.find('[data-testid="kpi-hero"]')
    expect(hero.exists()).toBe(true)
    expect(hero.text()).toContain('SBS改性沥青 + SMA-13')
    expect(hero.text()).toContain('0.850')
    expect(hero.text()).toContain('预期寿命')
    expect(hero.text()).toContain('LCC')
    expect(hero.text()).toContain('碳排')
    expect(hero.find('[data-testid="mock-badge"]').exists()).toBe(true)
  })

  it('报告段落中证据 id 渲染为编号角标并 emit cite（B）', async () => {
    const sections = [
      {
        title: '推荐理由',
        paragraphs: ['依据 k-modifier-002:0 的研究结论，SBS 改性效果显著。'],
        evidenceIds: ['k-modifier-002:0'],
      },
    ]
    const wrapper = mount(ReportSection, {
      props: { sections, llmStatus: 'ok', evidence: [] },
    })

    const cites = wrapper.findAll('[data-testid="evidence-cite"]')
    expect(cites.length).toBe(2) // 段落内联 1 + 侧栏引用 1
    // 展示编号而非裸 id
    expect(wrapper.text()).not.toContain('k-modifier-002:0')
    for (const c of cites) {
      expect(c.text()).toBe('证据 1')
    }
    await cites[0].trigger('click')
    expect(wrapper.emitted('cite')?.[0]?.[0]).toBe('k-modifier-002:0')
  })

  it('报告引用 chip：数量=evidenceIds、编号按 evidence 数组解析、无匹配提示来源不可用（B）', async () => {
    const sections = [
      {
        title: '推荐理由',
        paragraphs: ['推荐依据如下。'],
        evidenceIds: ['k-binder-001:0', 'std-9:1', 'k-missing-9:0'],
      },
    ]
    const evidence = [
      { ...makeReport().evidence[0], chunkId: 'k-binder-001:0', docType: 'knowledge' as const, text: 'SBS改性剂掺量4.5%时高温性能最优。' },
      { ...makeReport().evidence[0], chunkId: 'std-9:1', docType: 'standard' as const, text: '规范条文规定重交通路段采用改性沥青。' },
    ]
    const wrapper = mount(ReportSection, {
      props: { sections, llmStatus: 'ok', evidence },
    })

    const chips = wrapper.findAll('[data-testid="evidence-cite"]')
    expect(chips.length).toBe(3)
    expect(chips.map((c) => c.text())).toEqual(['证据 1', '证据 2', '证据 3'])
    expect(wrapper.text()).not.toContain('k-binder')
    expect(wrapper.text()).not.toContain('std-9')

    const tooltips = wrapper.findAllComponents(ElTooltip)
    const contents = tooltips.map((t) => t.props('content') as string)
    expect(contents[0]).toContain('[知识条目]')
    expect(contents[0]).toContain('SBS改性剂掺量')
    expect(contents[1]).toContain('[规范]')
    expect(contents[2]).toContain('来源不可用')

    await chips[1].trigger('click')
    expect(wrapper.emitted('cite')?.[0]?.[0]).toBe('std-9:1')
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
    // P2：优势项前缀 + 分后缀
    expect(wrapper.text()).toContain('优势项：高温 80 分 · 施工 80 分 · 水稳 75 分')
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

  it('P2 口径统一：无裸 cand-N、候选头与基准列头方案名、得分 tooltip', async () => {
    const wrapper = await mountView()
    const headers = wrapper.findAll('.el-collapse-item__header')
    for (const h of headers) {
      if (h.text().includes('基准')) await h.trigger('click')
    }
    await flushPromises()

    const text = wrapper.text()
    expect(text).not.toContain('cand-1')
    expect(text).not.toContain('cand-2')
    expect(text).toContain('方案 1')
    expect(text).toContain('方案 1·SBS改性沥青')
    expect(text).toContain('优势项：')
  })

  it('P2 基准表：方向/Δ与百分比/未达标标红/低越优注', async () => {
    const rows = [{ label: '高温性能', unit: '℃', baseline: 64, candidates: { 'cand-1': 76 } }]
    const targets = {
      schemaVersion: '1' as const,
      targets: [{ perf: '高温PG', value: 80, unit: '℃' }],
      priorities: [],
    }
    const wrapper = mount(BenchmarkTable, {
      props: { rows, candidates: [makeCandidate('cand-1')], targets },
    })
    await flushPromises()

    const text = wrapper.text()
    expect(text).toContain('高越好')
    expect(text).toContain('+12℃')
    expect(text).toContain('+18.8%')
    expect(wrapper.find('.is-below').exists()).toBe(true)
    expect(text).toContain('低温/成本/碳排越低越好')
  })

  it('P2 基准表：标题只出现一次（collapse 内不重复）', async () => {
    const wrapper = await mountView()
    const count = wrapper.text().split('与规范查表基线对比').length - 1
    expect(count).toBe(1)
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
    // 灵动层：空态交错入场 class
    expect(guide.classes()).toContain('stagger-item')

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
    // P2：动态候选列头改为「方案 N·简称」，同样右对齐
    expect(alignOf('方案 1·SBS改性沥青')).toBe('right')
    expect(alignOf('方案 2·SBS改性沥青')).toBe('right')
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
      global: { plugins: [pinia, router] },
    })
    await flushPromises()

    // 初始在参数页：有表单、无结果区与工具栏
    expect(wrapper.find('[data-testid="scene-form-submit"]').exists()).toBe(true)
    expect(wrapper.find('[data-testid="kpi-hero"]').exists()).toBe(false)
    expect(wrapper.find('[data-testid="back-to-input"]').exists()).toBe(false)

    // P1：必填校验——填齐数值与病害后提交
    for (const [path, value] of [
      ['climate.pgHigh', '76'],
      ['climate.pgLow', '-22'],
      ['traffic.esal', '2000'],
      ['constraints.budget', '500'],
      ['constraints.schedule', '30'],
    ] as const) {
      await wrapper.find(`[data-testid="field-${path}"] input`).setValue(value)
    }
    await wrapper
      .find('[data-testid="field-distresses"] input[type="checkbox"]')
      .setValue(true)

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

  it('对话侧板三态：closed→open→docked→open 恢复宽度→closed（侧板）', async () => {
    const wrapper = await mountView()
    // closed：仅悬浮胶囊，无面板
    expect(wrapper.find('[data-testid="chat-fab"]').exists()).toBe(true)
    expect(wrapper.find('[data-testid="chat-dock"]').exists()).toBe(false)

    await openChatDock(wrapper)
    // open：面板出现（默认 560px），胶囊隐藏；统一入场动画 class
    expect(wrapper.find('[data-testid="chat-dock"]').exists()).toBe(true)
    expect(wrapper.find('[data-testid="chat-dock"]').classes()).toContain('dock-enter')
    expect(wrapper.find('[data-testid="chat-fab"]').exists()).toBe(false)
    expect(wrapper.find('[data-testid="chat-input"]').exists()).toBe(true)
    expect(dockWidthOf(wrapper)).toBe('680px')

    // 收起 → docked：右缘竖条
    await wrapper.find('[data-testid="chat-dock-dock"]').trigger('click')
    await flushPromises()
    expect(wrapper.find('[data-testid="chat-dock"]').exists()).toBe(false)
    expect(wrapper.find('[data-testid="chat-rail"]').exists()).toBe(true)

    // docked 点击竖条 → open 且恢复记忆宽度
    await wrapper.find('[data-testid="chat-rail"]').trigger('click')
    await flushPromises()
    // 竖条 → open 与胶囊 → open 走同一动画（重新挂载即重新播放）
    expect(wrapper.find('[data-testid="chat-dock"]').exists()).toBe(true)
    expect(wrapper.find('[data-testid="chat-dock"]').classes()).toContain('dock-enter')
    expect(dockWidthOf(wrapper)).toBe('680px')

    // 头部关闭 → closed，胶囊回归
    await wrapper.find('[data-testid="chat-dock-close"]').trigger('click')
    await flushPromises()
    expect(wrapper.find('[data-testid="chat-dock"]').exists()).toBe(false)
    expect(wrapper.find('[data-testid="chat-fab"]').exists()).toBe(true)
  })

  it('Esc 将侧板收为 docked（不彻底关闭）', async () => {
    const wrapper = await mountView()
    await openChatDock(wrapper)
    expect(wrapper.find('[data-testid="chat-dock"]').exists()).toBe(true)

    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }))
    await flushPromises()

    expect(wrapper.find('[data-testid="chat-dock"]').exists()).toBe(false)
    expect(wrapper.find('[data-testid="chat-rail"]').exists()).toBe(true)
  })

  it('拖拽柄调整宽度并 clamp 到 480–960', async () => {
    const wrapper = await mountView()
    await openChatDock(wrapper)

    const handle = wrapper.find('[data-testid="chat-dock-handle"]')
    await handle.trigger('mousedown', { clientX: 600 })

    // 向左拖 400px：680+400=1080 → clamp 960
    window.dispatchEvent(new MouseEvent('mousemove', { clientX: 200 }))
    await flushPromises()
    expect(dockWidthOf(wrapper)).toBe('960px')

    // 向右拖到极端：600-1200=-600 → 680-600=80 → clamp 480
    window.dispatchEvent(new MouseEvent('mousemove', { clientX: 1200 }))
    await flushPromises()
    expect(dockWidthOf(wrapper)).toBe('480px')

    window.dispatchEvent(new MouseEvent('mouseup'))
    await flushPromises()
    // 拖拽结束恢复 body 可选文本
    expect(document.body.style.userSelect).toBe('')
  })

  it('侧板宽度持久化：localStorage chat-dock-width 读与写', async () => {
    localStorage.setItem('chat-dock-width', '600')
    const wrapper = await mountView()
    await openChatDock(wrapper)
    expect(dockWidthOf(wrapper)).toBe('600px')

    const handle = wrapper.find('[data-testid="chat-dock-handle"]')
    await handle.trigger('mousedown', { clientX: 500 })
    window.dispatchEvent(new MouseEvent('mousemove', { clientX: 400 }))
    window.dispatchEvent(new MouseEvent('mouseup'))
    await flushPromises()

    // 600 + (500-400) = 700
    expect(localStorage.getItem('chat-dock-width')).toBe('700')
  })

  it('radar tooltip 文本：维度名+绝对评分+绝对值与单位（重构）', () => {
    expect(formatRadarTooltip('高温', 80, { perf: 'highTemp', value: 83.8, unit: '℃' })).toBe(
      '高温：80 分（83.8℃）',
    )
    expect(formatRadarTooltip('疲劳', 70, undefined)).toBe('疲劳：70 分')
    expect(formatRadarTooltip('水稳', 75, { perf: 'waterStability', value: 1000000, unit: '次' })).toBe(
      '水稳：75 分（1,000,000次）',
    )
  })

  it('RadarChart 图下显示八维画像说明（重构）', () => {
    const cand = makeCandidate('cand-1')
    const wrapper = mount(RadarChart, {
      props: { radar: cand.radar, predictions: cand.predictions },
    })
    expect(wrapper.text()).toContain('八维画像 · 绝对评分（0-100）')
  })

  it('RadarChart 视觉规格：半径/中心/渐变面积/描边/圆点标记（A）', () => {
    chartOptions.length = 0
    document.documentElement.classList.add('dark')
    const cand = makeCandidate('cand-1')
    mount(RadarChart, {
      props: { radar: cand.radar, predictions: cand.predictions },
    })

    const option = chartOptions.at(-1) as
      | {
          radar?: {
            radius?: string
            center?: [string, string]
            splitLine?: { lineStyle?: { color?: string } }
            splitArea?: { areaStyle?: { color?: string[] } }
            axisName?: { color?: string; fontSize?: number }
          }
          series?: Array<{
            type?: string
            data?: Array<{ value?: number[] }>
            symbol?: string
            symbolSize?: number
            lineStyle?: { width?: number }
            areaStyle?: { opacity?: number; color?: unknown }
            emphasis?: { itemStyle?: { color?: string } }
          }>
        }
      | undefined

    const radar = option?.radar
    expect(radar?.radius).toBe('68%')
    expect(radar?.center).toEqual(['50%', '52%'])
    expect(radar?.splitLine?.lineStyle?.color).toBe('rgba(148,163,184,0.16)')
    expect(radar?.axisName?.fontSize).toBe(12)

    const series = option?.series?.[0]
    expect(series?.type).toBe('radar')
    expect(series?.symbol).toBe('circle')
    expect(series?.symbolSize).toBe(4)
    expect(series?.lineStyle?.width).toBe(2)
    expect(series?.emphasis?.itemStyle?.color).toBe('#6E7BF2')
    // 渐变面积（垂直渐变 linearGradient）
    const areaColor = series?.areaStyle?.color as { type?: string; x?: number; y?: number; colorStops?: unknown } | undefined
    expect(areaColor?.type).toBe('linear')
    expect(areaColor?.x).toBe(0)
    expect(areaColor?.y).toBe(0)
    document.documentElement.classList.remove('dark')
  })

  it('RadarChart 主题切换（html.class 变化）触发重绘（A）', async () => {
    chartOptions.length = 0
    const cand = makeCandidate('cand-1')
    mount(RadarChart, {
      props: { radar: cand.radar, predictions: cand.predictions },
    })
    const before = chartOptions.length
    expect(before).toBeGreaterThanOrEqual(1)

    document.documentElement.classList.add('dark')
    await new Promise((resolve) => setTimeout(resolve, 20))
    // 本次主题切换触发重绘（此前测试遗留实例的 observer 也可能触发，故用严格增长断言）
    expect(chartOptions.length).toBeGreaterThan(before)
    document.documentElement.classList.remove('dark')
  })

  it('段落打字机：60字/120ms 逐字揭示 + 生成中→已完成小标（E）', async () => {
    vi.useFakeTimers()
    try {
      const para = '字'.repeat(61) + '。'
      const sections = [{ title: '推荐理由', paragraphs: [para], evidenceIds: [] }]
      const wrapper = mount(ReportSection, {
        props: { sections, llmStatus: 'ok', typewriter: true },
      })

      const pEl = wrapper.find('.report-paragraph')
      const initial = pEl.text()
      expect(initial.length).toBeLessThanOrEqual(60)
      expect(wrapper.text()).toContain('生成中…')

      await vi.advanceTimersByTimeAsync(120)
      expect(pEl.text().length).toBeGreaterThan(initial.length)

      for (let i = 0; i < 4; i++) await vi.advanceTimersByTimeAsync(120)
      expect(pEl.text()).toBe(para)
      expect(wrapper.text()).toContain('已完成')
      expect(wrapper.text()).not.toContain('生成中')
    } finally {
      vi.useRealTimers()
    }
  })

  it('reduced-motion：打字机直接显示全文（E）', async () => {
    const original = window.matchMedia
    window.matchMedia = ((query: string) => ({
      matches: true,
      media: query,
      onchange: null,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => false,
    })) as unknown as typeof window.matchMedia
    try {
      const para = '字'.repeat(80)
      const wrapper = mount(ReportSection, {
        props: {
          sections: [{ title: 't', paragraphs: [para], evidenceIds: [] }],
          llmStatus: 'ok',
          typewriter: true,
        },
      })
      await wrapper.vm.$nextTick()
      expect(wrapper.find('.report-paragraph').text()).toBe(para)
      expect(wrapper.text()).not.toContain('生成中')
    } finally {
      window.matchMedia = original
    }
  })

  it('下一段占位：已有 i 段且流未结束 → 正在撰写第 i+1 段（E）', async () => {
    const pinia = createPinia()
    setActivePinia(pinia)
    const store = useRecommendStore()
    store.status = 'running'
    store.step = 'result'
    store.report = null
    store.streamSections = [{ title: '推荐理由', paragraphs: ['段'], evidenceIds: [] }]

    const router = createRouter({
      history: createMemoryHistory(),
      routes: [{ path: '/recommend', component: RecommendView }],
    })
    await router.push('/recommend')
    await router.isReady()
    const wrapper = mount(RecommendView, { global: { plugins: [pinia, router] } })
    await flushPromises()

    const placeholder = wrapper.find('[data-testid="section-placeholder"]')
    expect(placeholder.exists()).toBe(true)
    expect(placeholder.text()).toContain('正在撰写第 2 段…')

    store.status = 'done'
    await flushPromises()
    expect(wrapper.find('[data-testid="section-placeholder"]').exists()).toBe(false)
  })

  it('进入结果页首次 running 自动滚到报告区（仅一次）（E）', async () => {
    const pinia = createPinia()
    setActivePinia(pinia)
    const store = useRecommendStore()
    store.step = 'result'
    store.status = 'idle'

    const router = createRouter({
      history: createMemoryHistory(),
      routes: [{ path: '/recommend', component: RecommendView }],
    })
    await router.push('/recommend')
    await router.isReady()
    const holder = document.createElement('div')
    document.body.appendChild(holder)
    const wrapper = mount(RecommendView, {
      global: { plugins: [pinia, router] },
      attachTo: holder,
    })
    await flushPromises()

    const spy = vi.fn()
    const original = Element.prototype.scrollIntoView
    Element.prototype.scrollIntoView = spy as unknown as typeof original
    try {
      store.status = 'running'
      await flushPromises()
      expect(spy).toHaveBeenCalledTimes(1)

      store.status = 'done'
      await flushPromises()
      store.status = 'running'
      await flushPromises()
      expect(spy).toHaveBeenCalledTimes(1)
    } finally {
      Element.prototype.scrollIntoView = original
      wrapper.unmount()
      holder.remove()
    }
  })

  it('P6 button 语义：候选卡头与证据卡为真 button、角标保持 button（P6）', async () => {
    const wrapper = await mountView()
    const toggle = wrapper.findAll('[data-testid="candidate-toggle"]')[0]
    expect(toggle.element.tagName).toBe('BUTTON')
    const evidenceItem = wrapper.findAll('[data-testid="evidence-item"]')[0]
    expect(evidenceItem.element.tagName).toBe('BUTTON')
  })

  it('P6 ChatDock：role=dialog/aria-label，关闭后焦点归还触发按钮（P6）', async () => {
    const pinia = createPinia()
    setActivePinia(pinia)
    const store = useRecommendStore()
    store.report = makeReport()
    store.status = 'done'
    store.step = 'result'
    store.scene = validScene

    const router = createRouter({
      history: createMemoryHistory(),
      routes: [{ path: '/recommend', component: RecommendView }],
    })
    await router.push('/recommend')
    await router.isReady()
    const holder = document.createElement('div')
    document.body.appendChild(holder)
    const wrapper = mount(RecommendView, {
      global: { plugins: [pinia, router] },
      attachTo: holder,
    })
    await flushPromises()

    const fab = wrapper.find('[data-testid="chat-fab"]').element as HTMLElement
    fab.focus()
    await wrapper.find('[data-testid="chat-fab"]').trigger('click')
    await flushPromises()

    const dock = wrapper.find('[data-testid="chat-dock"]')
    expect(dock.attributes('role')).toBe('dialog')
    expect(dock.attributes('aria-label')).toBeTruthy()

    await wrapper.find('[data-testid="chat-dock-close"]').trigger('click')
    await flushPromises()
    await new Promise((resolve) => setTimeout(resolve, 20))
    expect(document.activeElement?.getAttribute('data-testid')).toBe('chat-fab')

    wrapper.unmount()
    holder.remove()
  })

  it('F4：企业实测指标 11 项中文名（labels）', () => {
    expect(labelOf(LAB_INDICATOR_LABELS, 'ds')).toBe('动稳定度 DS')
    expect(labelOf(LAB_INDICATOR_LABELS, 'bendingStrain')).toBe('弯拉应变')
    expect(labelOf(LAB_INDICATOR_LABELS, 'tsr')).toBe('TSR')
    expect(labelOf(LAB_INDICATOR_LABELS, 'retainedStability')).toBe('残留稳定度')
    expect(labelOf(LAB_INDICATOR_LABELS, 'vv')).toBe('空隙率 VV')
    expect(labelOf(LAB_INDICATOR_LABELS, 'ms')).toBe('稳定度 MS')
    expect(labelOf(LAB_INDICATOR_LABELS, 'fl')).toBe('流值 FL')
    expect(labelOf(LAB_INDICATOR_LABELS, 'bendingModulus')).toBe('劲度模量')
  })

  it('F2：候选卡企业实测指标表 11 行按 5 组展示、默认展开第一张卡', async () => {
    const cand = makeCandidate('cand-1')
    ;(cand as unknown as { labIndicators: unknown[] }).labIndicators = [
      { key: 'vv', label: '空隙率 VV', group: 'volume', unit: '%', value: 4.5, threshold: { min: 3, max: 6 }, pass: true, sampleSize: 116 },
      { key: 'vma', label: 'VMA', group: 'volume', unit: '%', value: 15.2, threshold: { min: 14 }, pass: true, sampleSize: 116 },
      { key: 'vfa', label: 'VFA', group: 'volume', unit: '%', value: 71, threshold: { min: 65, max: 75 }, pass: true, sampleSize: 116 },
      { key: 'asphaltContent', label: '沥青含量', group: 'volume', unit: '%', value: 4.8, sampleSize: 116 },
      { key: 'ms', label: '稳定度 MS', group: 'marshall', unit: 'kN', value: 9.2, threshold: { min: 8 }, pass: true, sampleSize: 116 },
      { key: 'fl', label: '流值 FL', group: 'marshall', unit: 'mm', value: 3.1, threshold: { min: 2, max: 4 }, pass: true, sampleSize: 116 },
      { key: 'bendingModulus', label: '劲度模量', group: 'marshall', unit: 'MPa', value: 3200, sampleSize: 116 },
      { key: 'tsr', label: 'TSR', group: 'water', unit: '%', value: 82, threshold: { min: 75 }, pass: true, sampleSize: 116 },
      { key: 'retainedStability', label: '残留稳定度', group: 'water', unit: '%', value: 88, threshold: { min: 85 }, pass: true, sampleSize: 116 },
      { key: 'ds', label: '动稳定度 DS', group: 'highTemp', unit: '次/mm', value: 6530, threshold: { min: 800 }, pass: true, sampleSize: 116 },
      { key: 'bendingStrain', label: '弯拉应变', group: 'lowTemp', unit: 'με', value: 2600, threshold: { min: 2000 }, pass: true, sampleSize: 116 },
    ]

    // index 0：默认展开
    const first = mount(CandidateCard, {
      props: { candidate: cand, index: 0, adapterMode: { a: 'mock', c: 'mock' }, evidence: [], expanded: true },
    })
    expect(first.find('[data-testid="lab-toggle"]').attributes('aria-expanded')).toBe('true')
    const rows = first.findAll('[data-testid="lab-row"]')
    expect(rows.length).toBe(11)
    const text = first.text()
    for (const group of ['体积性能', '马歇尔力学', '水稳', '高温', '低温']) {
      expect(text).toContain(group)
    }

    // index 1：默认收起
    const second = mount(CandidateCard, {
      props: { candidate: cand, index: 1, adapterMode: { a: 'mock', c: 'mock' }, evidence: [], expanded: true },
    })
    expect(second.find('[data-testid="lab-toggle"]').attributes('aria-expanded')).toBe('false')
    const bodyStyle = (second.find('[data-testid="lab-body"]').element as HTMLElement).getAttribute('style') ?? ''
    expect(bodyStyle).toContain('display: none')
    await second.find('[data-testid="lab-toggle"]').trigger('click')
    expect(
      ((second.find('[data-testid="lab-body"]').element as HTMLElement).getAttribute('style') ?? '').includes('display: none'),
    ).toBe(false)
  })

  it('F2：达标徽标三态（达标✓/不达标✗/无阈值—）与 TSR 显示 %', async () => {
    const cand = makeCandidate('cand-1')
    ;(cand as unknown as { labIndicators: unknown[] }).labIndicators = [
      { key: 'vv', label: '空隙率 VV', group: 'volume', unit: '%', value: 4.5, threshold: { min: 3, max: 6 }, pass: true, sampleSize: 116 },
      { key: 'bendingModulus', label: '劲度模量', group: 'marshall', unit: 'MPa', value: 3200, sampleSize: 116 }, // 无阈值 → —
      { key: 'tsr', label: 'TSR', group: 'water', unit: '%', value: 82, threshold: { min: 75 }, pass: true, sampleSize: 116 }, // TSR 显示 %
      { key: 'ds', label: '动稳定度 DS', group: 'highTemp', unit: '次/mm', value: 600, threshold: { min: 800 }, pass: false, sampleSize: 116 }, // <800 → 不达标
    ]
    const wrapper = mount(CandidateCard, {
      props: { candidate: cand, index: 0, adapterMode: { a: 'mock', c: 'mock' }, evidence: [], expanded: true },
    })

    // 渲染顺序按分组：体积(vv) → 马歇尔(bendingModulus) → 水稳(tsr) → 高温(ds)
    const passes = wrapper.findAll('[data-testid="lab-pass"]')
    expect(passes[0].text()).toBe('✓')
    expect(passes[0].classes()).toContain('is-pass')
    expect(passes[1].text()).toBe('—')
    expect(passes[1].classes()).toContain('is-none')
    expect(passes[2].text()).toBe('✓')
    expect(passes[3].text()).toBe('✗')
    expect(passes[3].classes()).toContain('is-fail')

    // TSR 行实测值显示为 82%（无空格）
    const tsrRow = wrapper.findAll('[data-testid="lab-row"]').find((r) => r.text().includes('TSR'))
    expect(tsrRow?.text()).toContain('82%')
    expect(tsrRow?.text()).toContain('>75')
  })

  it('F3：基准表验收阈值列与达标标记（acceptance min/max）', async () => {
    const rows = [
      { label: '动稳定度', unit: '次/mm', baseline: 5000, candidates: { 'cand-1': 6530 }, acceptance: { min: 800 } },
      { label: '空隙率', unit: '%', baseline: 5, candidates: { 'cand-1': 7 }, acceptance: { min: 3, max: 6 } },
      { label: '弯拉应变', unit: 'με', baseline: 2000, candidates: { 'cand-1': 2600 } },
    ]
    const wrapper = mount(BenchmarkTable, {
      props: { rows, candidates: [makeCandidate('cand-1')] },
    })
    await flushPromises()

    const text = wrapper.text()
    expect(text).toContain('验收阈值')
    expect(text).toContain('>800')
    expect(text).toContain('3–6')

    const marks = wrapper.findAll('[data-testid="bench-accept-mark"]')
    expect(marks.length).toBe(2)
    expect(marks[0].text()).toBe('✓') // 6530 ≥ 800
    expect(marks[1].text()).toBe('✗') // 7 > 6
    expect(wrapper.findAll('.is-accept-fail').length).toBe(1)
  })

  it('RAG P0：新 docType 标签映射与配色 class（表格/全文章节）', () => {
    expect(labelOf(DOC_TYPE_LABELS, 'table')).toBe('定量表格')
    expect(labelOf(DOC_TYPE_LABELS, 'literature-full')).toBe('文献章节')

    const evidence = [
      { ...makeReport().evidence[0], chunkId: 't-1', docType: 'table' as const, text: '实测对比\n| 指标 | 值 |\n| --- | --- |\n| 高温 | 82 |' },
      { ...makeReport().evidence[0], chunkId: 'lf-1', docType: 'literature-full' as const, text: '论文全文章节内容。' },
    ]
    const wrapper = mount(EvidencePanel, { props: { evidence, ids: ['t-1', 'lf-1'] } })

    const chips = wrapper.findAll('.evidence-item .evidence-doc-type')
    expect(chips[0].text()).toBe('定量表格')
    expect(chips[0].classes()).toContain('doc-type--table')
    expect(chips[1].text()).toBe('文献章节')
    expect(chips[1].classes()).toContain('doc-type--literature-full')
  })

  it('RAG P0：表格证据展开渲染 table、行截断提示、折叠态显示 caption（表格展示）', () => {
    const rows = Array.from({ length: 10 }, (_, i) => `| 第${i + 1}行 | ${i + 1} |`).join('\n')
    const evidence = [
      {
        ...makeReport().evidence[0],
        chunkId: 't-1',
        docType: 'table' as const,
        text: `实测数据对比表。\n| 指标 | 值 |\n| --- | --- |\n${rows}`,
      },
    ]
    const wrapper = mount(EvidencePanel, { props: { evidence, ids: ['t-1'] } })

    // 展开态（首条默认展开）：渲染 <table>，表头正确
    const table = wrapper.find('table.evidence-table')
    expect(table.exists()).toBe(true)
    expect(table.find('thead').text()).toContain('指标')
    expect(table.findAll('tbody tr').length).toBe(9) // 8 行 + 1 截断提示行
    expect(wrapper.text()).toContain('…（共 10 行）')
    expect(wrapper.text()).not.toContain('第9行')
  })

  it('RAG P0：表格证据折叠态只显示 caption 首句（表格展示）', () => {
    const evidence = [
      { ...makeReport().evidence[0], chunkId: 'a-1', text: '普通段落。' },
      {
        ...makeReport().evidence[0],
        chunkId: 't-1',
        docType: 'table' as const,
        text: '实测数据对比表。\n| 指标 | 值 |\n| --- | --- |\n| 高温 | 82 |',
      },
    ]
    const wrapper = mount(EvidencePanel, { props: { evidence, ids: ['a-1', 't-1'] } })

    const items = wrapper.findAll('[data-testid="evidence-item"]')
    const summary = items[1].find('.evidence-summary').text()
    expect(summary).toContain('实测数据对比表')
    expect(summary).not.toContain('|')
  })

  it('P6 文案：空态无 build:index、源码无 Failed to fetch（P6）', () => {
    const wrapper = mount(EvidencePanel, { props: { evidence: [], ids: [] } })
    expect(wrapper.text()).toContain('知识库暂无内容，请先导入资料')
    expect(wrapper.text()).not.toContain('build:index')
    for (const file of ['src/api/client.ts', 'src/components/ChatPanel.vue']) {
      expect(readFileSync(file, 'utf8')).not.toContain('Failed to fetch')
    }
  })

  it('P6 降级提示改文案（P6）', () => {
    const wrapper = mount(ReportSection, {
      props: { sections: [], llmStatus: 'degraded' },
    })
    expect(wrapper.text()).toContain('AI 文案暂不可用，以下为模板文案（数值不受影响）')
  })

  it('P6 雷达图：ResizeObserver 监听容器重绘 + role=img/aria-label（P6）', async () => {
    const observedCallbacks: Array<() => void> = []
    class MockResizeObserver {
      constructor(callback: () => void) {
        observedCallbacks.push(callback)
      }
      observe(): void {}
      unobserve(): void {}
      disconnect(): void {}
    }
    const original = (globalThis as { ResizeObserver?: unknown }).ResizeObserver
    ;(globalThis as { ResizeObserver?: unknown }).ResizeObserver = MockResizeObserver

    try {
      chartOptions.length = 0
      const cand = makeCandidate('cand-1')
      const wrapper = mount(RadarChart, {
        props: { radar: cand.radar, predictions: cand.predictions },
      })
      const before = chartOptions.length
      expect(before).toBeGreaterThanOrEqual(1)

      const container = wrapper.find('.radar-chart')
      expect(container.attributes('role')).toBe('img')
      expect(container.attributes('aria-label')).toContain('八维画像')

      observedCallbacks[0]?.()
      await new Promise((resolve) => setTimeout(resolve, 20))
      expect(chartOptions.length).toBe(before + 1)
    } finally {
      ;(globalThis as { ResizeObserver?: unknown }).ResizeObserver = original
    }
  })

  it('P4 done 态渲染紧凑步进条：全链路总耗时与六步名（P4）', async () => {
    const wrapper = await mountView()
    const summary = wrapper.find('[data-testid="step-summary"]')
    expect(summary.exists()).toBe(true)

    const text = summary.text()
    expect(text).toContain('全链路')
    expect(text).toContain('21ms') // 1+2+3+4+5+6
    for (const name of ['解析', '映射', '召回', '预测', '排序', '报告']) {
      expect(text).toContain(name)
    }
    expect(text).toContain('解析 1ms')
    expect(text).toContain('报告 6ms')
  })

  it('P4 首次 running 时隐藏紧凑步进条（维持逐步点亮）', async () => {
    const pinia = createPinia()
    setActivePinia(pinia)
    const store = useRecommendStore()
    store.status = 'running'
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

    expect(wrapper.find('[data-testid="step-summary"]').exists()).toBe(false)
    expect(wrapper.findComponent(StepStepper).exists()).toBe(true)
  })

  it('灵动层：候选卡聚光 class 与弹性展开切换（微动效）', async () => {
    const wrapper = await mountView()
    const card = wrapper.findAll('[data-testid="candidate-card"]')[0]
    expect(card.classes()).toContain('spotlight-card')

    const toggle = wrapper.findAll('[data-testid="candidate-toggle"]')[0]
    expect(toggle.attributes('aria-expanded')).toBe('true') // 首卡默认展开
    expect(wrapper.findAll('[data-testid="candidate-body"]')[0].classes()).toContain('is-expanded')

    await toggle.trigger('click')
    expect(wrapper.findAll('[data-testid="candidate-body"]')[0].classes()).not.toContain(
      'is-expanded',
    )
  })

  it('灵动层：证据卡弹性展开 aria-expanded 切换（微动效）', async () => {
    const wrapper = await mountView()
    // 首卡默认展开（其证据链在 DOM 中）
    const item = wrapper.findAll('[data-testid="evidence-item"]')[0]
    expect(item.attributes('aria-expanded')).toBe('true')

    await item.trigger('click')
    expect(wrapper.findAll('[data-testid="evidence-item"]')[0].attributes('aria-expanded')).toBe(
      'false',
    )
    await wrapper.findAll('[data-testid="evidence-item"]')[0].trigger('click')
    expect(wrapper.findAll('[data-testid="evidence-item"]')[0].attributes('aria-expanded')).toBe(
      'true',
    )
  })

  it('UI7 追问面板规格：78vh/输入区 88px/字号 14.5px/竖条 44px（源文件断言）', () => {
    const dock = readFileSync('src/components/ChatDock.vue', 'utf8')
    expect(dock).toContain('max-height: 78vh')
    expect(dock).toContain('width: 44px')
    expect(dock).toContain('width: 52px')

    const panel = readFileSync('src/components/ChatPanel.vue', 'utf8')
    expect(panel).toContain('min-height: 88px')
    expect(panel).toContain('14.5px')
  })

  it('灵动层：追问发送按钮 pressable class（微动效）', async () => {
    const wrapper = await mountView()
    await openChatDock(wrapper)
    expect(wrapper.find('[data-testid="chat-send"]').classes()).toContain('pressable')
  })

  it('灵动层：count-up reduced-motion 直接显示终值（微动效）', async () => {
    const original = window.matchMedia
    window.matchMedia = ((query: string) => ({
      matches: query === '(prefers-reduced-motion: reduce)',
      media: query,
      onchange: null,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => false,
    })) as unknown as typeof window.matchMedia
    try {
      const wrapper = await mountView()
      const hero = wrapper.find('[data-testid="kpi-hero"]')
      expect(hero.text()).toContain('0.850')
      expect(hero.text()).toContain('100')
      expect(hero.text()).toContain('12')
    } finally {
      window.matchMedia = original
    }
  })

  it('灵动层：步骤条 running 脉冲 class 仅 running（微动效）', () => {
    const running = mount(StepStepper, { props: { steps: [], running: true } })
    expect(running.find('.el-steps').classes()).toContain('is-running')

    const done = mount(StepStepper, {
      props: { steps: [{ name: 'parse', ms: 1 }], running: false },
    })
    expect(done.find('.el-steps').classes()).not.toContain('is-running')
  })

  it('灵动层：证据定位 is-flash 高亮 + 已定位 toast 自动消失（微动效）', async () => {
    vi.useFakeTimers()
    try {
      const wrapper = await mountView()
      await wrapper.findAll('[data-testid="evidence-cite"]')[0].trigger('click')
      await flushPromises()

      const toast = wrapper.find('[data-testid="evidence-toast"]')
      expect(toast.exists()).toBe(true)
      expect(toast.text()).toContain('已定位证据 1')
      expect(wrapper.find('[data-evidence-id="chunk-1"]').classes()).toContain('is-flash')

      await vi.advanceTimersByTimeAsync(1600)
      expect(wrapper.find('[data-testid="evidence-toast"]').exists()).toBe(false)

      await vi.advanceTimersByTimeAsync(700)
      expect(wrapper.find('[data-evidence-id="chunk-1"]').classes()).not.toContain('is-flash')
    } finally {
      vi.useRealTimers()
    }
  })

  it('UI8 瀑布图：贡献累加=score、penalty 负红柱（可视化）', async () => {
    chartOptions.length = 0
    const breakdown = [
      { dimension: 'd1', label: '高温', weight: 0.4, normalized: 0.8, contribution: 0.32 },
      { dimension: 'd2', label: '水稳', weight: 0.3, normalized: 0.9, contribution: 0.27 },
      { dimension: 'd3', label: '低温', weight: 0.3, normalized: 0.8, contribution: 0.24 },
    ]
    const wrapper = mount(WaterfallChart, {
      props: { score: 0.75, breakdown, penalty: 0.08 },
    })
    await flushPromises()

    const option = chartOptions.at(-1) as
      | { series?: Array<Record<string, unknown>> }
      | undefined
    const base = (option?.series?.[0]?.data ?? []) as number[]
    const contrib = (option?.series?.[1]?.data ?? []) as Array<{ value: number; itemStyle?: { color?: string } }>
    expect(base.map((v) => Math.round(v * 100) / 100)).toEqual([0, 0.32, 0.59, 0.83])
    expect(contrib.map((c) => c.value)).toEqual([0.32, 0.27, 0.24, -0.08])
    // 累加 0.32+0.27+0.24-0.08 = 0.75 = score
    expect(contrib.reduce((acc, c) => acc + c.value, 0)).toBeCloseTo(0.75, 10)
    // penalty 红柱
    expect(contrib[3].itemStyle?.color).toBe('#EF4444')
    wrapper.unmount()
  })

  it('UI8 SHAP：按 |contribution| 排序、正向主色负向红、标注文案（可视化）', async () => {
    chartOptions.length = 0
    const wrapper = mount(ShapBar, {
      props: {
        explanations: [
          { feature: 'A', contribution: 1 },
          { feature: 'B', contribution: -3 },
          { feature: 'C', contribution: 2 },
        ],
      },
    })
    await flushPromises()

    expect(wrapper.find('[data-testid="shap-note"]').text()).toContain(
      '特征贡献（模拟阶段确定性生成，真实模块 C 接入后自动替换）',
    )

    const option = chartOptions.at(-1) as
      | {
          yAxis?: Array<{ data?: string[] }> | { data?: string[] }
          series?: Array<{ data?: Array<{ value: number; itemStyle?: { color?: string } }> }>
        }
      | undefined
    const yData = Array.isArray(option?.yAxis) ? option?.yAxis?.[0]?.data : option?.yAxis?.data
    expect(yData).toEqual(['B', 'C', 'A']) // |−3| > |2| > |1|
    const colors = option?.series?.[0]?.data?.map((d) => d.itemStyle?.color)
    expect(colors).toEqual(['#EF4444', '#6E7BF2', '#6E7BF2'])
    wrapper.unmount()
  })

  it('UI8 分析可视化卡：无数据占位、候选切换重绘、与候选卡联动（可视化）', async () => {
    chartOptions.length = 0
    const wrapper = await mountView()
    const card = wrapper.find('[data-testid="analysis-visuals"]')
    expect(card.exists()).toBe(true)
    // fixture 无 scoreBreakdown → 占位文案
    expect(wrapper.find('[data-testid="waterfall-placeholder"]').exists()).toBe(true)
    expect(wrapper.find('[data-testid="shap-placeholder"]').exists()).toBe(true)
    expect(card.text()).toContain('暂无得分分解数据')
    expect(card.text()).toContain('暂无特征贡献数据')
  })

  it('UI8 分析可视化：注入 scoreBreakdown 后渲染瀑布并随候选切换重绘（可视化）', async () => {
    chartOptions.length = 0
    const pinia = createPinia()
    setActivePinia(pinia)
    const store = useRecommendStore()
    const rep = makeReport()
    rep.candidates[0].scoreBreakdown = [
      { dimension: 'd1', label: '高温', weight: 0.5, normalized: 0.8, contribution: 0.4 },
    ]
    rep.candidates[1].scoreBreakdown = [
      { dimension: 'd1', label: '水稳', weight: 0.5, normalized: 0.6, contribution: 0.3 },
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

    const waterfallCount = () =>
      chartOptions.filter(
        (o) => ((o as { series?: Array<Record<string, unknown>> }).series?.[0]?.name) === '底座',
      ).length
    expect(waterfallCount()).toBe(1)
    const firstContrib = (
      chartOptions.find(
        (o) => ((o as { series?: Array<Record<string, unknown>> }).series?.[0]?.name) === '底座',
      ) as { series?: Array<Record<string, unknown>> } | undefined
    )?.series?.[1]?.data as Array<{ value: number }>
    expect(firstContrib[0].value).toBe(0.4)

    // 切换到方案 2 → 重绘为 cand-2 贡献
    await wrapper.findAll('[data-testid="analysis-switch"] input')[1].setValue(true)
    await flushPromises()
    expect(waterfallCount()).toBe(2)
    const secondContrib = (
      chartOptions
        .filter(
          (o) => ((o as { series?: Array<Record<string, unknown>> }).series?.[0]?.name) === '底座',
        )
        .at(-1) as { series?: Array<Record<string, unknown>> } | undefined
    )?.series?.[1]?.data as Array<{ value: number }>
    expect(secondContrib[0].value).toBe(0.3)
  })

  it('running 分阶段文案 1.5s 轮换（流式加载动效）', async () => {
    vi.useFakeTimers()
    try {
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

      const phase = () => wrapper.find('[data-testid="loading-phase"]').text()
      expect(phase()).toBe('正在解析养护场景…')

      await vi.advanceTimersByTimeAsync(1500)
      expect(phase()).toBe('正在检索知识库…')

      await vi.advanceTimersByTimeAsync(1500)
      expect(phase()).toBe('正在生成推荐理由…')

      await vi.advanceTimersByTimeAsync(1500)
      expect(phase()).toBe('正在解析养护场景…')
    } finally {
      vi.useRealTimers()
    }
  })

  it('报告 sections 错峰淡入：stagger class 与延迟变量', () => {
    const sections = [
      { title: '推荐理由', paragraphs: ['a'], evidenceIds: [] },
      { title: '候选对比', paragraphs: ['b'], evidenceIds: [] },
    ]
    const wrapper = mount(ReportSection, {
      props: { sections, llmStatus: 'ok' },
    })

    const blocks = wrapper.findAll('.report-block')
    expect(blocks).toHaveLength(2)
    for (const [i, b] of blocks.entries()) {
      expect(b.classes()).toContain('report-stagger')
      expect((b.element as HTMLElement).style.getPropertyValue('--i')).toBe(String(i))
    }
  })

  it('running 时步进条末步显示 spinner，完成后无 spinner', () => {
    const running = mount(StepStepper, { props: { steps: [], running: true } })
    expect(running.find('[data-testid="step-spinner"]').exists()).toBe(true)

    const done = mount(StepStepper, {
      props: {
        steps: [
          { name: 'parse', ms: 1 },
          { name: 'report', ms: 2 },
        ],
        running: false,
      },
    })
    expect(done.find('[data-testid="step-spinner"]').exists()).toBe(false)
  })

  it('案例一键填入：?case= 查询参数自动填充表单并可提交', async () => {
    getCasesMock.mockResolvedValue([caseFixture('case-01'), caseFixture('case-02')])

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

    const sceneArg = streamRecommendMock.mock.calls[0]?.[0] as SceneInput
    expect(sceneArg.climate.zone).toBe(validScene.climate.zone)
    expect(sceneArg.traffic.level).toBe('heavy')
    expect(sceneArg.distresses).toEqual(validScene.distresses)
  })
})
