// @vitest-environment node
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import {
  getCases,
  kbRebuild,
  kbSearch,
  kbStats,
  kbUpload,
  postChat,
  postRecommend,
} from '@/api/client'
import type { CaseSeed, RecommendationReport, SceneInput } from '@road-rec/contracts'

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

const caseFixture = (): CaseSeed => ({
  schemaVersion: '1',
  id: 'case-01',
  title: '华南高温重载车辙',
  summary: '案例摘要',
  scene: validScene,
  expected: { formulas: [] },
})

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json' },
  })
}

function sseResponse(chunks: string[]): Response {
  const encoder = new TextEncoder()
  const stream = new ReadableStream<Uint8Array>({
    start(controller) {
      for (const chunk of chunks) controller.enqueue(encoder.encode(chunk))
      controller.close()
    },
  })
  return new Response(stream, { headers: { 'content-type': 'text/event-stream' } })
}

const fetchMock = vi.fn()

beforeEach(() => {
  fetchMock.mockReset()
  vi.stubGlobal('fetch', fetchMock)
})

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('api client - 推荐与案例', () => {
  it('postRecommend 以 POST /api/v1/recommend 提交场景并返回报告', async () => {
    const report = reportFixture('ok')
    fetchMock.mockResolvedValueOnce(jsonResponse(report))

    await expect(postRecommend(validScene)).resolves.toEqual(report)

    expect(fetchMock).toHaveBeenCalledTimes(1)
    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit]
    expect(url).toBe('/api/v1/recommend')
    expect(init.method).toBe('POST')
    expect(JSON.parse(init.body as string)).toEqual(validScene)
  })

  it('getCases 调 GET /api/v1/cases 返回案例数组', async () => {
    const cases = [caseFixture()]
    fetchMock.mockResolvedValueOnce(jsonResponse(cases))

    await expect(getCases()).resolves.toEqual(cases)
    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit]
    expect(url).toBe('/api/v1/cases')
    expect(init.method).toBeUndefined()
  })

  it('HTTP 非 2xx 时 postRecommend 抛错', async () => {
    fetchMock.mockResolvedValueOnce(jsonResponse({ message: 'oops' }, 500))
    await expect(postRecommend(validScene)).rejects.toThrow(/500/)
  })
})

describe('api client - 对话（SSE）', () => {
  it('解析 event-stream 的 delta 事件并回调', async () => {
    fetchMock.mockResolvedValueOnce(
      sseResponse(['data: {"delta":"你"}\n\n', 'data: {"delta":"好"}\n\n']),
    )
    const onDelta = vi.fn()

    await expect(
      postChat({ schemaVersion: '1', question: '为什么推荐它？' }, onDelta),
    ).resolves.toBe('你好')
    expect(onDelta.mock.calls.map((c) => c[0])).toEqual(['你', '好'])
  })

  it('容忍非 JSON 与 [DONE] 事件行', async () => {
    fetchMock.mockResolvedValueOnce(
      sseResponse(['data: {"delta":"方案"}\n\n', 'data: 值得\n\n', 'data: [DONE]\n\n']),
    )
    await expect(postChat({ schemaVersion: '1', question: 'x' })).resolves.toBe('方案值得')
  })

  it('非 event-stream 响应按 JSON {reply} 降级处理', async () => {
    fetchMock.mockResolvedValueOnce(jsonResponse({ reply: '模板降级回复' }))
    const onDelta = vi.fn()

    await expect(postChat({ schemaVersion: '1', question: 'x' }, onDelta)).resolves.toBe(
      '模板降级回复',
    )
    expect(onDelta).not.toHaveBeenCalled()
  })
})

describe('api client - 知识库', () => {
  it('kbStats 调 GET /api/v1/kb/stats', async () => {
    const stats = { count: 10, docTypes: { knowledge: 5 }, backend: 'sqlite' }
    fetchMock.mockResolvedValueOnce(jsonResponse(stats))

    await expect(kbStats()).resolves.toEqual(stats)
    const [url] = fetchMock.mock.calls[0] as [string]
    expect(url).toBe('/api/v1/kb/stats')
  })

  it('kbSearch 以 POST /api/v1/kb/search 提交查询并返回命中', async () => {
    const hit = {
      schemaVersion: '1',
      chunkId: 'chunk-9',
      text: '条文文本',
      docType: 'standard',
      tags: [],
      score: 0.8,
      provenance: {
        sourceDocId: 'std-9',
        contentHash: 'x',
        embeddingModel: 'bge-m3',
        modelVersion: '1',
        dim: 1024,
        pipelineRev: 'abc1234',
        embeddedAt: '2026-10-17',
      },
    }
    fetchMock.mockResolvedValueOnce(jsonResponse([hit]))

    await expect(kbSearch({ query: '车辙', topK: 5 })).resolves.toEqual([hit])
    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit]
    expect(url).toBe('/api/v1/kb/search')
    expect(init.method).toBe('POST')
    expect(JSON.parse(init.body as string)).toEqual({ query: '车辙', topK: 5 })
  })

  it('kbUpload 以 POST /api/v1/kb/documents 上传文本资料', async () => {
    fetchMock.mockResolvedValueOnce(jsonResponse({ added: 1, chunks: 2 }))

    await expect(
      kbUpload({ title: '企业资料', docType: 'enterprise', text: '正文' }),
    ).resolves.toEqual({ added: 1, chunks: 2 })
    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit]
    expect(url).toBe('/api/v1/kb/documents')
    expect(JSON.parse(init.body as string)).toEqual({
      title: '企业资料',
      docType: 'enterprise',
      text: '正文',
    })
  })

  it('kbRebuild 调 POST /api/v1/kb/rebuild', async () => {
    fetchMock.mockResolvedValueOnce(jsonResponse({ count: 42 }))

    await expect(kbRebuild()).resolves.toEqual({ count: 42 })
    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit]
    expect(url).toBe('/api/v1/kb/rebuild')
    expect(init.method).toBe('POST')
  })
})
