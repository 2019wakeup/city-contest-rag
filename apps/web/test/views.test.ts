import { flushPromises, mount } from '@vue/test-utils'
import { ElMenu } from 'element-plus'
import { createMemoryHistory, createRouter } from 'vue-router'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { getCases, kbRebuild, kbSearch, kbStats, kbUpload, kbUploadFile } from '@/api/client'
import type { CaseSeed, SceneInput, SearchHit } from '@road-rec/contracts'
import App from '@/App.vue'
import CaseCard from '@/components/CaseCard.vue'
import CasesView from '@/views/CasesView.vue'
import KnowledgeView from '@/views/KnowledgeView.vue'
import WelcomeView from '@/views/WelcomeView.vue'

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

  it('渲染标题/定位/三亮点卡/双 CTA（欢迎页）', async () => {
    const router = makeWelcomeRouter()
    await router.push('/')
    await router.isReady()

    const wrapper = mount(WelcomeView, { global: { plugins: [router] } })
    await flushPromises()

    expect(wrapper.text()).toContain('数智选材')
    expect(wrapper.text()).toContain('AI 驱动的道路养护决策与沥青材料方案智能推荐')
    expect(wrapper.text()).toContain('场景→性能量化映射')
    expect(wrapper.text()).toContain('配方反向设计推荐')
    expect(wrapper.text()).toContain('可解释证据溯源')
    expect(wrapper.find('[data-testid="cta-recommend"]').exists()).toBe(true)
    expect(wrapper.find('[data-testid="cta-cases"]').exists()).toBe(true)
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
    expect(badges.text()).toContain('规范条文 57')
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

    expect(wrapper.findAll('[data-testid="case-card"]')).toHaveLength(5)
    expect(wrapper.text()).toContain('华南高温重载车辙')
    expect(wrapper.text()).toContain('华南高温重载车辙摘要')
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

describe('CaseCard 场景行中文标签（UI#11）', () => {
  const caseWithEnTags: CaseSeed = {
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
    expect(sceneText).toContain('推挤')
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
