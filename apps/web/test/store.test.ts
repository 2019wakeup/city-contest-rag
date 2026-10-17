import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { postRecommend } from '@/api/client'
import { useRecommendStore } from '@/stores/recommend'
import type { RecommendationReport, SceneInput } from '@road-rec/contracts'

vi.mock('@/api/client', () => ({
  postRecommend: vi.fn(),
}))

const postRecommendMock = vi.mocked(postRecommend)

const validScene: SceneInput = {
  schemaVersion: '1',
  climate: { zone: '华南高温区', pgHigh: 76, pgLow: -22 },
  traffic: { level: '重交通', esal: 20000000 },
  pavement: { layer: '上面层', structure: '半刚性基层沥青路面' },
  distresses: [{ type: '车辙', severity: '中' }],
  constraints: { budget: 500, schedule: 30, env: '环保要求高', noise: '低噪' },
  notes: '',
}

const reportFixture = (llmStatus: 'ok' | 'degraded' = 'ok'): RecommendationReport => ({
  schemaVersion: '1',
  scene: validScene,
  targets: {
    schemaVersion: '1',
    targets: [{ perf: 'highTemp', value: 76, unit: '℃' }],
    priorities: [{ perf: 'highTemp', weight: 0.6 }],
  },
  candidates: [
    {
      schemaVersion: '1',
      id: 'cand-1',
      formula: {
        schemaVersion: '1',
        binder: { type: 'SBS改性沥青', grade: 'PG76-22', pg: '76-22' },
        modifier: { type: 'SBS', dosage: 4.5 },
        gradation: { type: 'SMA-13' },
        additives: [],
        oilStoneRatio: 6.1,
        airVoids: 4,
      },
      predictions: [{ perf: 'highTemp', value: 80, unit: '℃' }],
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
    },
  ],
  evidence: [
    {
      schemaVersion: '1',
      chunkId: 'chunk-1',
      text: '证据文本',
      docType: 'standard',
      tags: ['车辙'],
      score: 0.9,
      provenance: {
        sourceDocId: 'std-1',
        contentHash: 'abc',
        embeddingModel: 'bge-m3',
        modelVersion: '1',
        dim: 1024,
        pipelineRev: 'abc1234',
        embeddedAt: '2026-10-17',
      },
    },
  ],
  benchmark: [{ label: '高温PG', unit: '℃', baseline: 64, candidates: { 'cand-1': 76 } }],
  sections: [{ title: '推荐理由', paragraphs: ['文案'], evidenceIds: ['chunk-1'] }],
  llmStatus,
  adapterMode: { a: 'mock', c: 'mock' },
  warnings: [],
  steps: [
    { name: '解析', ms: 1 },
    { name: '映射', ms: 2 },
  ],
})

describe('recommend store 状态机', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    postRecommendMock.mockReset()
  })

  it('初始状态为 idle，无报告无步骤', () => {
    const store = useRecommendStore()
    expect(store.status).toBe('idle')
    expect(store.step).toBe('input')
    expect(store.report).toBeNull()
    expect(store.scene).toBeNull()
    expect(store.steps).toEqual([])
  })

  it('run 成功 → step 切到 result；backToInput 返回 input（两页式）', async () => {
    postRecommendMock.mockResolvedValue(reportFixture('ok'))
    const store = useRecommendStore()

    await store.run(validScene)
    expect(store.step).toBe('result')

    store.backToInput()
    expect(store.step).toBe('input')
    expect(store.scene).toEqual(validScene) // 返回时场景保留供回填
  })

  it('初次提交失败 → 回到 input 页并记录错误', async () => {
    postRecommendMock.mockRejectedValue(new Error('网络错误'))
    const store = useRecommendStore()

    await store.run(validScene)

    expect(store.status).toBe('error')
    expect(store.step).toBe('input')
  })

  it('结果页微调失败 → 留在 result 页', async () => {
    postRecommendMock.mockResolvedValue(reportFixture('ok'))
    const store = useRecommendStore()
    await store.run(validScene)
    expect(store.step).toBe('result')

    postRecommendMock.mockRejectedValue(new Error('网络错误'))
    await store.adjustAndRerun({ notes: 'x' })

    expect(store.status).toBe('error')
    expect(store.step).toBe('result')
  })

  it('run 成功（llmStatus ok）→ done，报告与步骤就绪', async () => {
    postRecommendMock.mockResolvedValue(reportFixture('ok'))
    const store = useRecommendStore()

    await store.run(validScene)

    expect(postRecommendMock).toHaveBeenCalledWith(validScene)
    expect(store.status).toBe('done')
    expect(store.report?.llmStatus).toBe('ok')
    expect(store.steps.map((s) => s.name)).toEqual(['解析', '映射'])
  })

  it('run 成功但 llmStatus degraded → degraded', async () => {
    postRecommendMock.mockResolvedValue(reportFixture('degraded'))
    const store = useRecommendStore()

    await store.run(validScene)

    expect(store.status).toBe('degraded')
    expect(store.report?.llmStatus).toBe('degraded')
  })

  it('run 失败（API 抛错）→ error 且记录错误信息', async () => {
    postRecommendMock.mockRejectedValue(new Error('网络错误'))
    const store = useRecommendStore()

    await store.run(validScene)

    expect(store.status).toBe('error')
    expect(store.errorMessage).toContain('网络错误')
  })

  it('adjustAndRerun 将补丁合并进当前场景并重跑', async () => {
    postRecommendMock.mockResolvedValue(reportFixture('ok'))
    const store = useRecommendStore()
    await store.run(validScene)

    await store.adjustAndRerun({ notes: '调整为重载场景' })

    expect(postRecommendMock).toHaveBeenLastCalledWith({
      ...validScene,
      notes: '调整为重载场景',
    })
    expect(store.scene?.notes).toBe('调整为重载场景')
  })

  it('adjustAndRerun 在无场景时直接进入 error 且不调 API', async () => {
    const store = useRecommendStore()

    await store.adjustAndRerun({ notes: 'x' })

    expect(store.status).toBe('error')
    expect(postRecommendMock).not.toHaveBeenCalled()
  })
})
