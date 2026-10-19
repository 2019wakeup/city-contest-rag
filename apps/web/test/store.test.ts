import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { postRecommend, streamRecommend } from '@/api/client'
import { useRecommendStore } from '@/stores/recommend'
import type { RecommendationReport, SceneInput } from '@road-rec/contracts'

vi.mock('@/api/client', () => ({
  postRecommend: vi.fn(),
  streamRecommend: vi.fn(),
}))

const postRecommendMock = vi.mocked(postRecommend)
const streamRecommendMock = vi.mocked(streamRecommend)

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

/** 默认流式成功：直接 onDone 一份报告。 */
function mockStreamDone(report: RecommendationReport) {
  streamRecommendMock.mockImplementation(async (_scene, handlers) => {
    handlers?.onDone?.(report)
  })
}

describe('recommend store 状态机', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    postRecommendMock.mockReset()
    streamRecommendMock.mockReset()
    mockStreamDone(reportFixture('ok'))
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
    const store = useRecommendStore()

    await store.run(validScene)
    expect(store.step).toBe('result')

    store.backToInput()
    expect(store.step).toBe('input')
    expect(store.scene).toEqual(validScene) // 返回时场景保留供回填
  })

  it('初次提交失败 → 回到 input 页并记录错误', async () => {
    streamRecommendMock.mockImplementation(async (_scene, handlers) => {
      handlers?.onError?.('流式失败')
    })
    postRecommendMock.mockRejectedValue(new Error('网络错误'))
    const store = useRecommendStore()

    await store.run(validScene)

    expect(store.status).toBe('error')
    expect(store.step).toBe('input')
  })

  it('结果页微调失败 → 留在 result 页', async () => {
    const store = useRecommendStore()
    await store.run(validScene)
    expect(store.step).toBe('result')

    streamRecommendMock.mockImplementation(async (_scene, handlers) => {
      handlers?.onError?.('流式失败')
    })
    postRecommendMock.mockRejectedValue(new Error('网络错误'))
    await store.adjustAndRerun({ notes: 'x' })

    expect(store.status).toBe('error')
    expect(store.step).toBe('result')
  })

  it('run 成功（llmStatus ok）→ done，报告与步骤就绪', async () => {
    const store = useRecommendStore()

    await store.run(validScene)

    expect(streamRecommendMock).toHaveBeenCalledWith(
      validScene,
      expect.objectContaining({ onDone: expect.any(Function) }),
      expect.anything(),
    )
    expect(store.status).toBe('done')
    expect(store.report?.llmStatus).toBe('ok')
    expect(store.steps.map((s) => s.name)).toEqual(['解析', '映射'])
  })

  it('run 成功但 llmStatus degraded → degraded', async () => {
    mockStreamDone(reportFixture('degraded'))
    const store = useRecommendStore()

    await store.run(validScene)

    expect(store.status).toBe('degraded')
    expect(store.report?.llmStatus).toBe('degraded')
  })

  it('流式消费：onStep/onSection 增量更新，onDone 收尾清理', async () => {
    const store = useRecommendStore()
    let midSteps = 0
    let midSections = 0
    streamRecommendMock.mockImplementation(async (_scene, handlers) => {
      handlers?.onStep?.({ name: 'parse', ms: 1 })
      midSteps = store.liveSteps.length
      handlers?.onSection?.({ title: '推荐理由', paragraphs: ['段'], evidenceIds: [] })
      midSections = store.streamSections.length
      handlers?.onDone?.(reportFixture('ok'))
    })

    await store.run(validScene)

    expect(midSteps).toBe(1)
    expect(midSections).toBe(1)
    expect(store.status).toBe('done')
    expect(store.liveSteps).toEqual([])
    expect(store.streamSections).toEqual([])
    expect(store.report?.llmStatus).toBe('ok')
  })

  it('步骤排队渐进点亮：首个立即，后续每 220ms 一个（E）', async () => {
    vi.useFakeTimers()
    try {
      const store = useRecommendStore()
      let finish: () => void = () => {}
      streamRecommendMock.mockImplementation(async (_scene, handlers) => {
        handlers?.onStep?.({ name: 'parse', ms: 1 })
        handlers?.onStep?.({ name: 'mapping', ms: 2 })
        handlers?.onStep?.({ name: 'recall', ms: 3 })
        await new Promise<void>((resolve) => {
          finish = () => {
            handlers?.onDone?.(reportFixture('ok'))
            resolve()
          }
        })
      })

      const runPromise = store.run(validScene)
      await vi.advanceTimersByTimeAsync(0)
      expect(store.liveSteps.length).toBe(1) // 首个立即放出

      await vi.advanceTimersByTimeAsync(220)
      expect(store.liveSteps.length).toBe(2)
      await vi.advanceTimersByTimeAsync(220)
      expect(store.liveSteps.length).toBe(3)

      finish()
      await runPromise
      expect(store.status).toBe('done')
      expect(store.liveSteps).toEqual([])
    } finally {
      vi.useRealTimers()
    }
  })

  it('流太快结束时剩余步骤以 100ms 快速补放后才转 done（E）', async () => {
    vi.useFakeTimers()
    try {
      const store = useRecommendStore()
      streamRecommendMock.mockImplementation(async (_scene, handlers) => {
        handlers?.onStep?.({ name: 'parse', ms: 1 })
        handlers?.onStep?.({ name: 'mapping', ms: 2 })
        handlers?.onStep?.({ name: 'recall', ms: 3 })
        handlers?.onDone?.(reportFixture('ok'))
      })

      const runPromise = store.run(validScene)
      await vi.advanceTimersByTimeAsync(0)
      expect(store.status).toBe('running') // onDone 已到，仍有 2 步待补放

      await vi.advanceTimersByTimeAsync(100)
      await vi.advanceTimersByTimeAsync(100)
      await runPromise
      expect(store.status).toBe('done')
      expect(store.liveSteps).toEqual([])
    } finally {
      vi.useRealTimers()
    }
  })

  it('流式失败（onError）→ 回退 JSON 接口重试一次成功', async () => {
    streamRecommendMock.mockImplementation(async (_scene, handlers) => {
      handlers?.onError?.('流式挂了')
    })
    postRecommendMock.mockResolvedValue(reportFixture('ok'))
    const store = useRecommendStore()

    await store.run(validScene)

    expect(postRecommendMock).toHaveBeenCalledTimes(1)
    expect(store.status).toBe('done')
    expect(store.step).toBe('result')
  })

  it('流式失败且 JSON 重试也失败 → error 且记录错误信息', async () => {
    streamRecommendMock.mockImplementation(async (_scene, handlers) => {
      handlers?.onError?.('流式挂了')
    })
    postRecommendMock.mockRejectedValue(new Error('网络错误'))
    const store = useRecommendStore()

    await store.run(validScene)

    expect(store.status).toBe('error')
    expect(store.errorMessage).toContain('网络错误')
  })

  it('P3 重跑不清空旧报告：流式期间保留、失败回滚（P3）', async () => {
    mockStreamDone(reportFixture('ok'))
    const store = useRecommendStore()
    await store.run(validScene)
    const oldReport = store.report

    // 重跑期间：旧报告仍在
    streamRecommendMock.mockImplementation(
      () => new Promise<void>(() => {}), // 永不结束
    )
    const rerun = store.adjustAndRerun({ notes: 'z' })
    expect(store.status).toBe('running')
    expect(store.report).toBe(oldReport)

    // 失败（onError + JSON 重试失败）→ 旧报告保留 + error
    streamRecommendMock.mockImplementation(async (_scene, handlers) => {
      handlers?.onError?.('流式挂了')
    })
    postRecommendMock.mockRejectedValue(new Error('网络错误'))
    await store.adjustAndRerun({ notes: 'y' })

    expect(store.status).toBe('error')
    expect(store.report).toBe(oldReport)
    void rerun
  })

  it('P3 取消生成：AbortSignal 传递、取消后回滚到旧状态（P3）', async () => {
    mockStreamDone(reportFixture('ok'))
    const store = useRecommendStore()
    await store.run(validScene)

    streamRecommendMock.mockImplementation(async (_scene, _handlers, options) => {
      await new Promise<void>((_resolve, reject) => {
        options?.signal?.addEventListener('abort', () =>
          reject(new DOMException('Aborted', 'AbortError')),
        )
      })
    })

    const rerun = store.adjustAndRerun({ notes: 'x' })
    store.cancel()
    await rerun

    expect(store.status).toBe('done') // 回滚到旧报告状态
    expect(store.report?.llmStatus).toBe('ok')
    expect(streamRecommendMock).toHaveBeenCalledWith(
      expect.anything(),
      expect.anything(),
      expect.objectContaining({ signal: expect.any(AbortSignal) }),
    )
  })

  it('P4 新报告清空旧对话（避免旧 history 污染新 reportContext）（P4）', async () => {
    mockStreamDone(reportFixture('ok'))
    const store = useRecommendStore()
    store.chat.push({ role: 'user', content: '旧问题' })
    store.chat.push({ role: 'assistant', content: '旧回答' })

    await store.run(validScene)

    expect(store.chat).toEqual([])
  })

  it('adjustAndRerun 将补丁合并进当前场景并重跑', async () => {
    const store = useRecommendStore()
    await store.run(validScene)

    await store.adjustAndRerun({ notes: '调整为重载场景' })

    expect(streamRecommendMock).toHaveBeenLastCalledWith(
      {
        ...validScene,
        notes: '调整为重载场景',
      },
      expect.objectContaining({ onDone: expect.any(Function) }),
      expect.anything(),
    )
    expect(store.scene?.notes).toBe('调整为重载场景')
  })

  it('adjustAndRerun 在无场景时直接进入 error 且不调 API', async () => {
    const store = useRecommendStore()

    await store.adjustAndRerun({ notes: 'x' })

    expect(store.status).toBe('error')
    expect(streamRecommendMock).not.toHaveBeenCalled()
  })
})
