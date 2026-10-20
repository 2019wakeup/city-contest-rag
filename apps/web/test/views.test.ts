import { flushPromises, mount } from '@vue/test-utils'
import { ElMenu } from 'element-plus'
import { readFileSync } from 'node:fs'
import { createMemoryHistory, createRouter } from 'vue-router'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { getCases, kbRebuild, kbSearch, kbStats, kbUpload, kbUploadFile } from '@/api/client'
import type { CaseSeed, SceneInput, SearchHit } from '@road-rec/contracts'
import App from '@/App.vue'
import CaseCard from '@/components/CaseCard.vue'
import HomeStats from '@/components/HomeStats.vue'
import CasesView from '@/views/CasesView.vue'
import KnowledgeView from '@/views/KnowledgeView.vue'
import WelcomeView from '@/views/WelcomeView.vue'

const { chartOptions, initSpy, disposeSpy } = vi.hoisted(() => ({
  chartOptions: [] as Array<Record<string, unknown>>,
  initSpy: vi.fn(() => ({
    setOption: (opt: Record<string, unknown>) => {
      chartOptions.push(opt)
    },
    resize: () => {},
    dispose: () => {
      disposeSpy()
    },
  })),
  disposeSpy: vi.fn(),
}))

vi.mock('echarts/core', () => ({
  use: () => {},
  init: initSpy,
}))
vi.mock('echarts/charts', () => ({ PieChart: {}, RadarChart: {}, BarChart: {}, CustomChart: {}, LineChart: {} }))
vi.mock('echarts/components', () => ({
  RadarComponent: {},
  TooltipComponent: {},
  LegendComponent: {},
  GridComponent: {},
}))
vi.mock('echarts/renderers', () => ({ CanvasRenderer: {} }))

vi.mock('@/api/client', () => ({
  getCases: vi.fn(),
  kbStats: vi.fn(),
  kbSearch: vi.fn(),
  kbUpload: vi.fn(),
  kbUploadFile: vi.fn(),
  kbRebuild: vi.fn(),
}))

const getCasesMock = vi.mocked(getCases)
const kbStatsMock = vi.mocked(kbStats)
const kbSearchMock = vi.mocked(kbSearch)
const kbUploadMock = vi.mocked(kbUpload)
const kbUploadFileMock = vi.mocked(kbUploadFile)
const kbRebuildMock = vi.mocked(kbRebuild)

const validScene: SceneInput = {
  schemaVersion: '1',
  climate: { zone: '华南高温区', pgHigh: 76, pgLow: -22 },
  traffic: { level: '重交通', esal: 20000000 },
  pavement: { layer: '上面层', structure: '半刚性基层沥青路面' },
  distresses: [{ type: '车辙', severity: '中' }],
  constraints: { budget: 500, schedule: 30, env: '环保要求高', noise: '低噪' },
  notes: '',
}

const caseFixture = (id: string, title: string): CaseSeed => ({
  schemaVersion: '1',
  id,
  title,
  summary: `${title}摘要`,
  scene: validScene,
  expected: { formulas: [] },
})

const fiveCases = [
  caseFixture('case-01', '华南高温重载车辙'),
  caseFixture('case-02', '寒冷地区横向裂缝'),
  caseFixture('case-03', '多雨冻融水损害'),
  caseFixture('case-04', '旧路高RAP再生'),
  caseFixture('case-05', '城市低噪排水'),
]

const hitFixture = (score?: number): SearchHit => ({
  schemaVersion: '1',
  chunkId: `chunk-${score ?? 'x'}`,
  text: 'SBS改性沥青显著提升高温抗车辙性能，适用于重交通路段。',
  docType: 'standard',
  tags: ['车辙'],
  score: score ?? 0.8,
  provenance: {
    sourceDocId: 'std-9',
    contentHash: 'x',
    embeddingModel: 'bge-m3',
    modelVersion: '1',
    dim: 1024,
    pipelineRev: 'abc1234',
    embeddedAt: '2026-10-17',
  },
})

function makeRouter() {
  return createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: '/cases', name: 'cases', component: CasesView },
      { path: '/recommend', name: 'recommend', component: { template: '<div />' } },
      { path: '/knowledge', name: 'knowledge', component: KnowledgeView },
    ],
  })
}

beforeEach(() => {
  getCasesMock.mockReset()
  kbStatsMock.mockReset()
  kbSearchMock.mockReset()
  kbUploadMock.mockReset()
  kbRebuildMock.mockReset()
  kbStatsMock.mockResolvedValue({ count: 42, docTypes: { knowledge: 30, standard: 12 }, backend: 'sqlite' })
  kbSearchMock.mockResolvedValue([hitFixture()])
  kbUploadMock.mockResolvedValue({ added: 1, chunks: 2 })
  kbUploadFileMock.mockResolvedValue({ added: 1, chunks: 2 })
  kbRebuildMock.mockResolvedValue({ count: 42 })
  getCasesMock.mockResolvedValue([])
})

describe('WelcomeView 欢迎页', () => {
  const makeWelcomeRouter = () =>
    createRouter({
      history: createMemoryHistory(),
      routes: [
        { path: '/', name: 'home', component: WelcomeView },
        { path: '/recommend', component: { template: '<div />' } },
        { path: '/cases', component: { template: '<div />' } },
      ],
    })

  it('渲染标题/定位/能力旅程/双 CTA（欢迎页，UI8 叙事流）', async () => {
    const router = makeWelcomeRouter()
    await router.push('/')
    await router.isReady()

    const wrapper = mount(WelcomeView, { global: { plugins: [router] } })
    await flushPromises()

    expect(wrapper.text()).toContain('数智选材')
    expect(wrapper.text()).toContain('AI 驱动的道路养护决策与沥青材料方案智能推荐')
    expect(wrapper.text()).toContain('场景输入')
    expect(wrapper.text()).toContain('智能推荐')
    expect(wrapper.text()).toContain('证据溯源')
    expect(wrapper.find('[data-testid="cta-recommend"]').exists()).toBe(true)
    expect(wrapper.find('[data-testid="cta-cases"]').exists()).toBe(true)
  })

  it('UI8 五段编号叙事：eyebrow 01-05/流程连线/同高容器/指标 chip/页脚技术词', async () => {
    kbStatsMock.mockResolvedValue({
      count: 11143,
      docTypes: { knowledge: 8000 },
      backend: 'lancedb',
    })
    getCasesMock.mockResolvedValue(fiveCases)
    const router = makeWelcomeRouter()
    await router.push('/')
    await router.isReady()

    const wrapper = mount(WelcomeView, { global: { plugins: [router] } })
    await flushPromises()

    // 01 Hero 无 eyebrow（叙事从 02 开始编号展示），段落共 5 个
    expect(wrapper.findAll('[data-testid="narrative-section"]').length).toBe(5)
    const eyebrows = wrapper.findAll('[data-testid="eyebrow"]')
    expect(eyebrows.map((e) => e.text())).toEqual(['02', '03', '04', '05'])

    expect(wrapper.find('[data-testid="journey-connector"]').exists()).toBe(true)
    expect(wrapper.find('[data-testid="data-base"]').exists()).toBe(true)
    expect(wrapper.findAll('[data-testid="lab-chip"]').length).toBe(10)
    expect(wrapper.find('[data-testid="hero-numbers"]').text()).toContain('11,143')
    expect(wrapper.find('[data-testid="hero-numbers"]').text()).toContain('38/38')
    expect(wrapper.find('[data-testid="hero-numbers"]').text()).toContain('85%')

    const footer = wrapper.find('.welcome-footer')
    expect(footer.text()).toContain('LanceDB')
    expect(footer.text()).toContain('混合检索 + LLM 重排')
    expect(footer.text()).toContain('DeepSeek')
    expect(footer.text()).toContain('38 条金标准')
  })

  it('CTA 跳转：开始推荐→/recommend、查看案例→/cases（欢迎页）', async () => {
    const router = makeWelcomeRouter()
    await router.push('/')
    await router.isReady()

    const wrapper = mount(WelcomeView, { global: { plugins: [router] } })
    await flushPromises()

    await wrapper.find('[data-testid="cta-recommend"]').trigger('click')
    await flushPromises()
    expect(router.currentRoute.value.path).toBe('/recommend')

    await router.push('/')
    await wrapper.find('[data-testid="cta-cases"]').trigger('click')
    await flushPromises()
    expect(router.currentRoute.value.path).toBe('/cases')
  })

  it('UI7 首页模块渲染：流水线 6 节点/迷你图/技术条/画廊（欢迎页）', async () => {
    kbStatsMock.mockResolvedValue({
      count: 241,
      docTypes: { knowledge: 42, standard: 57, literature: 142 },
      backend: 'lancedb',
    })
    getCasesMock.mockResolvedValue(fiveCases)
    const router = makeWelcomeRouter()
    await router.push('/')
    await router.isReady()

    const wrapper = mount(WelcomeView, { global: { plugins: [router] } })
    await flushPromises()

    expect(wrapper.find('[data-testid="home-pipeline"]').exists()).toBe(true)
    expect(wrapper.findAll('[data-testid="pipeline-node"]').length).toBe(6)
    expect(wrapper.find('[data-testid="home-mini-charts"]').exists()).toBe(true)
    // UI8：技术信息移入页脚一行
    expect(wrapper.find('.welcome-footer').text()).toContain('LanceDB')
    expect(wrapper.findAll('[data-testid="gallery-card"]').length).toBe(5)
    expect(wrapper.text()).toContain('演示示意')
  })

  it('UI7 首页画廊点击案例 → /recommend?case=xxx（欢迎页）', async () => {
    kbStatsMock.mockResolvedValue({
      count: 241,
      docTypes: { knowledge: 42 },
      backend: 'lancedb',
    })
    getCasesMock.mockResolvedValue([fiveCases[0]])
    const router = makeWelcomeRouter()
    await router.push('/')
    await router.isReady()

    const wrapper = mount(WelcomeView, { global: { plugins: [router] } })
    await flushPromises()

    await wrapper.find('[data-testid="gallery-card"]').trigger('click')
    await flushPromises()
    expect(router.currentRoute.value.path).toBe('/recommend')
    expect(router.currentRoute.value.query.case).toBe(fiveCases[0].id)
  })

  it('UI7 修复：HomeStats stats=null 挂载不 init，异步到达后 init+pie 渲染+卸载 dispose（回归）', async () => {
    initSpy.mockClear()
    disposeSpy.mockClear()
    chartOptions.length = 0

    const wrapper = mount(HomeStats, { props: { stats: null } })
    await flushPromises()
    // ① stats=null：容器 v-if 假 → 不 init
    expect(initSpy).not.toHaveBeenCalled()

    // ② 异步 stats 到达 → nextTick 后 init + setOption pie
    await wrapper.setProps({
      stats: {
        count: 200,
        docTypes: { knowledge: 100, standard: 60, literature: 40 },
        backend: 'lancedb',
      },
    })
    await flushPromises()
    expect(initSpy).toHaveBeenCalledTimes(1)
    const option = chartOptions.at(-1) as
      | { series?: Array<{ type?: string; data?: Array<{ name: string; value: number }> }> }
      | undefined
    expect(option?.series?.[0]?.type).toBe('pie')
    // 图例 label 带数量（toLocaleString）
    expect(option?.series?.[0]?.data?.map((d) => d.name)).toEqual([
      '知识条目 100',
      '规范 60',
      '文献 40',
    ])
    // 中心浮层文本
    const center = wrapper.find('[data-testid="stats-center"]')
    expect(center.text()).toContain('200')
    expect(center.text()).toContain('知识库条目')
    expect(center.attributes('aria-hidden')).toBe('true')

    // 数据更新后中心数字跟随变化
    await wrapper.setProps({
      stats: { count: 300, docTypes: { knowledge: 300 }, backend: 'lancedb' },
    })
    await flushPromises()
    expect(wrapper.find('[data-testid="stats-center"]').text()).toContain('300')

    // ③ 卸载 dispose
    wrapper.unmount()
    expect(disposeSpy).toHaveBeenCalled()
  })

  it('UI7 HomeStats donut：docTypes 映射为六类数据与中心总数（欢迎页）', async () => {
    chartOptions.length = 0
    kbStatsMock.mockResolvedValue({
      count: 11143,
      docTypes: { knowledge: 8000, standard: 2000, table: 143, enterprise: 1000 },
      backend: 'lancedb',
    })
    const wrapper = mount(HomeStats, {
      props: {
        stats: { count: 11143, docTypes: { knowledge: 8000, standard: 2000, table: 143, enterprise: 1000 }, backend: 'lancedb' },
      },
    })
    await flushPromises()

    const option = chartOptions.at(-1) as
      | { series?: Array<{ data?: Array<{ name: string; value: number }> }>; graphic?: Array<{ style?: { text?: string } }> }
      | undefined
    const data = option?.series?.[0]?.data ?? []
    expect(data.map((d) => d.name)).toEqual([
      '知识条目 8,000',
      '规范 2,000',
      '定量表格 143',
      '企业资料 1,000',
    ])
    const center = wrapper.find('[data-testid="stats-center"]').text()
    expect(center).toContain('11,143')
    expect(center).toContain('知识库条目')
    wrapper.unmount()
  })

  it('stats 徽章：实时取 kb/stats 展示规模（欢迎页）', async () => {
    kbStatsMock.mockResolvedValue({
      count: 241,
      docTypes: { knowledge: 42, standard: 57, literature: 142 },
      backend: 'lancedb',
    })
    const router = makeWelcomeRouter()
    await router.push('/')
    await router.isReady()

    const wrapper = mount(WelcomeView, { global: { plugins: [router] } })
    await flushPromises()

    const badges = wrapper.find('[data-testid="stats-badges"]')
    expect(badges.exists()).toBe(true)
    expect(badges.text()).toContain('241')
    expect(badges.text()).toContain('知识条目 42')
    expect(badges.text()).toContain('规范 57')
    expect(badges.text()).toContain('文献 142')
  })

  it('stats 获取失败时静默隐藏徽章区（欢迎页）', async () => {
    kbStatsMock.mockRejectedValue(new Error('不可用'))
    const router = makeWelcomeRouter()
    await router.push('/')
    await router.isReady()

    const wrapper = mount(WelcomeView, { global: { plugins: [router] } })
    await flushPromises()

    expect(wrapper.find('[data-testid="stats-badges"]').exists()).toBe(false)
  })

  it('App 导航含「首页」，点击 logo 回首页', async () => {
    const router = createRouter({
      history: createMemoryHistory(),
      routes: [
        { path: '/', component: { template: '<div />' } },
        { path: '/cases', component: { template: '<div />' } },
      ],
    })
    await router.push('/cases')
    await router.isReady()

    const wrapper = mount(App, { global: { plugins: [router] } })
    expect(wrapper.text()).toContain('首页')

    await wrapper.find('[data-testid="app-logo-mark"]').trigger('click')
    await flushPromises()
    expect(router.currentRoute.value.path).toBe('/')
  })
})

describe('CasesView 典型案例页', () => {
  it('渲染 5 个案例卡片（标题+摘要）', async () => {
    getCasesMock.mockResolvedValue(fiveCases)
    const router = makeRouter()
    await router.push('/cases')
    await router.isReady()

    const wrapper = mount(CasesView, { global: { plugins: [router] } })
    await flushPromises()

    const cards = wrapper.findAll('[data-testid="case-card"]')
    expect(cards).toHaveLength(5)
    expect(wrapper.text()).toContain('华南高温重载车辙')
    expect(wrapper.text()).toContain('华南高温重载车辙摘要')

    // 灵动层：交错入场 class + --i 序号
    expect(cards[0].classes()).toContain('stagger-item')
    expect(cards[0].attributes('style')).toContain('--i')
    expect(cards[4].attributes('style')).toContain('--i: 4')
  })

  it('点击案例卡片载入工作台（router.push /recommend?case=…）', async () => {
    getCasesMock.mockResolvedValue(fiveCases)
    const router = makeRouter()
    await router.push('/cases')
    await router.isReady()

    const wrapper = mount(CasesView, { global: { plugins: [router] } })
    await flushPromises()

    await wrapper.findAll('[data-testid="case-load"]')[0].trigger('click')
    await flushPromises()

    expect(router.currentRoute.value.path).toBe('/recommend')
    expect(router.currentRoute.value.query.case).toBe('case-01')
  })
})

describe('CaseCard 场景行中文标签（UI#11）', () => {  const caseWithEnTags: CaseSeed = {
    schemaVersion: '1',
    id: 'case-01',
    title: '华南高温重载车辙',
    summary: '1-4 华南湿热区 · heavy · rutting、shoving',
    scene: {
      schemaVersion: '1',
      climate: { zone: '1-4 华南湿热区', pgHigh: 76, pgLow: -10 },
      traffic: { level: 'heavy', esal: 30000000 },
      pavement: { layer: 'surface', structure: '半刚性基层沥青路面' },
      distresses: [
        { type: 'rutting', severity: '高' },
        { type: 'shoving', severity: '中' },
      ],
      constraints: { budget: 500, schedule: 30, env: '高', noise: '低' },
      notes: '',
    },
    expected: { formulas: [] },
  }

  it('场景行标签映射为中文，summary 与场景行各司其职且各出现一次', () => {
    const wrapper = mount(CaseCard, { props: { item: caseWithEnTags } })

    // 灵动层：案例卡聚光
    expect(wrapper.find('[data-testid="case-card"]').classes()).toContain('spotlight-card')

    // P6：载入按钮带 aria-label
    expect(wrapper.find('[data-testid="case-load"]').attributes('aria-label')).toBe(
      '载入案例：华南高温重载车辙',
    )

    const summaryEl = wrapper.find('[data-testid="case-summary"]')
    const sceneEl = wrapper.find('[data-testid="case-scene"]')
    expect(summaryEl.exists()).toBe(true)
    expect(sceneEl.exists()).toBe(true)

    // summary 行保留原始文案且只出现一次（不复读进场景行）
    expect(summaryEl.text()).toContain('华南湿热区')
    const summaryCount = wrapper.text().split('heavy · rutting、shoving').length - 1
    expect(summaryCount).toBe(1)

    // 场景行：英文标签全部映射为中文
    const sceneText = sceneEl.text()
    expect(sceneText).toContain('重交通')
    expect(sceneText).toContain('车辙')
    expect(sceneText).toContain('推移拥包')
    expect(sceneText).not.toContain('heavy')
    expect(sceneText).not.toContain('rutting')
    expect(sceneText).not.toContain('shoving')
  })
})

describe('App 主题切换与侧栏折叠（UI二轮）', () => {
  const mountApp = async () => {
    const router = createRouter({
      history: createMemoryHistory(),
      routes: [{ path: '/', component: { template: '<div />' } }],
    })
    await router.push('/')
    await router.isReady()
    const wrapper = mount(App, { global: { plugins: [router] } })
    await flushPromises()
    return wrapper
  }

  beforeEach(() => {
    localStorage.clear()
    document.documentElement.classList.remove('dark')
  })

  it('默认暗色：挂载后 html 带 dark 类', async () => {
    await mountApp()
    expect(document.documentElement.classList.contains('dark')).toBe(true)
  })

  it('点击主题切换 → 切到亮色并持久化到 localStorage', async () => {
    const wrapper = await mountApp()
    expect(document.documentElement.classList.contains('dark')).toBe(true)

    await wrapper.find('[data-testid="theme-toggle"]').trigger('click')

    expect(document.documentElement.classList.contains('dark')).toBe(false)
    expect(localStorage.getItem('theme')).toBe('light')
  })

  it('UI7 Aurora：token 存在断言与极光背景元素（主题）', async () => {
    const theme = readFileSync('src/styles/theme.css', 'utf8')
    expect(theme).toContain('#080b11')
    expect(theme).toContain('#0e121a')
    expect(theme).toContain('#141a26')
    expect(theme).toContain('rgba(255, 255, 255, 0.06)')
    expect(theme).toContain('#6e7bf2')
    expect(theme).toContain('#8b5cf6')
    expect(theme).toContain('#22d3ee')
    expect(theme).toContain('blur(14px) saturate(140%)')

    const wrapper = await mountApp()
    expect(wrapper.find('[data-testid="app-aurora"]').exists()).toBe(true)
  })

  it('灵动层：主题切换单 SVG 形变（不换两套图标资源）（微动效）', async () => {
    const wrapper = await mountApp()
    const toggle = wrapper.find('[data-testid="theme-toggle"]')
    const svgs = toggle.findAll('svg')
    expect(svgs.length).toBe(1)
    // 暗色默认 → moon 态
    expect(svgs[0].classes()).toContain('is-moon')

    await toggle.trigger('click')
    expect(toggle.findAll('svg')[0].classes()).not.toContain('is-moon')
  })

  it('localStorage 记录 light 时挂载不启用暗色', async () => {
    localStorage.setItem('theme', 'light')
    await mountApp()
    expect(document.documentElement.classList.contains('dark')).toBe(false)
  })

  it('侧栏折叠切换：菜单 collapse 与宽度 200↔64', async () => {
    const wrapper = await mountApp()
    const aside = wrapper.find('[data-testid="app-aside"]')
    expect(wrapper.findComponent(ElMenu).props('collapse')).toBe(false)
    expect((aside.element as HTMLElement).style.getPropertyValue('--el-aside-width')).toBe('200px')

    await wrapper.find('[data-testid="collapse-toggle"]').trigger('click')

    expect(wrapper.findComponent(ElMenu).props('collapse')).toBe(true)
    expect((aside.element as HTMLElement).style.getPropertyValue('--el-aside-width')).toBe('64px')
  })
})

describe('App 侧栏品牌（UI#10）', () => {
  it('含主题色块 logo 与副标题', async () => {
    const router = createRouter({
      history: createMemoryHistory(),
      routes: [{ path: '/', component: { template: '<div />' } }],
    })
    await router.push('/')
    await router.isReady()

    const wrapper = mount(App, { global: { plugins: [router] } })
    expect(wrapper.find('[data-testid="app-logo-mark"]').exists()).toBe(true)
    expect(wrapper.text()).toContain('数智选材')
    expect(wrapper.text()).toContain('沥青材料智能推荐')
  })
})

describe('KnowledgeView 知识库管理页', () => {
  it('渲染统计卡（count/docTypes/backend）', async () => {
    const router = makeRouter()
    await router.push('/knowledge')
    await router.isReady()

    const wrapper = mount(KnowledgeView, { global: { plugins: [router] } })
    await flushPromises()

    expect(wrapper.find('[data-testid="kb-count"]').text()).toContain('42')
    expect(wrapper.text()).toContain('sqlite')
    expect(wrapper.text()).toContain('knowledge')
  })

  it('检索返回 fixture 渲染 hit 列表（含来源行与分数）', async () => {
    const router = makeRouter()
    await router.push('/knowledge')
    await router.isReady()

    const wrapper = mount(KnowledgeView, { global: { plugins: [router] } })
    await flushPromises()

    await wrapper.find('[data-testid="kb-search-input"]').setValue('车辙')
    await wrapper.find('[data-testid="kb-search-btn"]').trigger('click')
    await flushPromises()

    expect(kbSearchMock).toHaveBeenCalledWith({ query: '车辙', topK: 5 })
    expect(wrapper.text()).toContain('SBS改性沥青显著提升高温抗车辙性能')
    expect(wrapper.text()).toContain('std-9')
    // C7：分数按首位归一化展示，单条命中 = 100
    expect(wrapper.text()).toContain('相关度（归一化）：100')
  })

  it('检索分数按首位归一化 0-100 展示，负值显示 —（C7）', async () => {
    kbSearchMock.mockResolvedValue([hitFixture(0.9), hitFixture(0.45), hitFixture(-0.2)])
    const router = makeRouter()
    await router.push('/knowledge')
    await router.isReady()

    const wrapper = mount(KnowledgeView, { global: { plugins: [router] } })
    await flushPromises()

    await wrapper.find('[data-testid="kb-search-input"]').setValue('车辙')
    await wrapper.find('[data-testid="kb-search-btn"]').trigger('click')
    await flushPromises()

    const scores = wrapper.findAll('[data-testid="kb-hit-score"]').map((n) => n.text())
    expect(scores).toEqual([
      '相关度（归一化）：100',
      '相关度（归一化）：50',
      '相关度（归一化）：—',
    ])
  })

  it('上传按钮触发 kbUpload 调用并刷新统计', async () => {
    const router = makeRouter()
    await router.push('/knowledge')
    await router.isReady()

    const wrapper = mount(KnowledgeView, { global: { plugins: [router] } })
    await flushPromises()
    expect(kbStatsMock).toHaveBeenCalledTimes(1)

    await wrapper.find('[data-testid="kb-upload-title"]').setValue('企业资料')
    await wrapper.find('[data-testid="kb-upload-text"]').setValue('企业提供的新资料正文')
    await wrapper.find('[data-testid="kb-upload-btn"]').trigger('click')
    await flushPromises()

    expect(kbUploadMock).toHaveBeenCalledWith({
      title: '企业资料',
      docType: 'enterprise',
      text: '企业提供的新资料正文',
    })
    expect(kbStatsMock).toHaveBeenCalledTimes(2)
  })

  it('PDF 文件上传触发 kbUploadFile 并刷新统计', async () => {
    const router = makeRouter()
    await router.push('/knowledge')
    await router.isReady()

    const wrapper = mount(KnowledgeView, { global: { plugins: [router] } })
    await flushPromises()
    expect(kbStatsMock).toHaveBeenCalledTimes(1)

    const fileInput = wrapper.find('[data-testid="kb-upload-file"]')
    expect(fileInput.exists()).toBe(true)
    const file = new File(['pdf-bytes'], '企业资料.pdf', { type: 'application/pdf' })
    Object.defineProperty(fileInput.element, 'files', { value: [file] })
    await fileInput.trigger('change')
    await flushPromises()

    expect(kbUploadFileMock).toHaveBeenCalledWith(file)
    expect(kbStatsMock).toHaveBeenCalledTimes(2)
  })

  it('重建按钮触发 kbRebuild 并刷新统计', async () => {
    const router = makeRouter()
    await router.push('/knowledge')
    await router.isReady()

    const wrapper = mount(KnowledgeView, { global: { plugins: [router] } })
    await flushPromises()

    await wrapper.find('[data-testid="kb-rebuild-btn"]').trigger('click')
    await flushPromises()

    expect(kbRebuildMock).toHaveBeenCalledTimes(1)
    expect(kbStatsMock).toHaveBeenCalledTimes(2)
  })
})
