import { parseSseStream } from '@/utils/sse'
import type {
  CaseSeed,
  ChatRequest,
  DocType,
  RecommendationReport,
  ReportSection,
  SceneInput,
  SearchHit,
  StepRecord,
} from '@road-rec/contracts'

/**
 * 类型化 API 客户端：统一走 Vite dev proxy `/api` → http://localhost:3000。
 * 返回体按后端契约（T8/T9/T10）作类型断言；字段名以 contracts 为真相源。
 */

const API_BASE = '/api/v1'

/** 知识库统计（T10 路由契约 {count, docTypes, backend}）。 */
export interface KbStats {
  count: number
  docTypes: Record<string, number>
  backend: string
}

export interface KbSearchQuery {
  query: string
  topK?: number
  docTypes?: DocType[]
}

export interface KbUploadPayload {
  title: string
  docType: DocType
  text: string
}

export interface KbUploadResult {
  added: number
  chunks: number
}

export interface KbRebuildResult {
  count: number
}

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers: { 'Content-Type': 'application/json', ...(init.headers as object) },
  })
  if (!res.ok) {
    throw new Error(`请求失败（${res.status}）: ${path}`)
  }
  return (await res.json()) as T
}

/** 主流程：场景 → 推荐报告。 */
export function postRecommend(scene: SceneInput): Promise<RecommendationReport> {
  return request<RecommendationReport>('/recommend', {
    method: 'POST',
    body: JSON.stringify(scene),
  })
}

/** 推荐流式回调（后端 /api/v1/recommend/stream 契约）。 */
export interface StreamRecommendHandlers {
  /** event: step → {"name","ms"}，六步各一次（report 步在报告完成时发出）。 */
  onStep?: (step: StepRecord) => void
  /** event: section → {"index","section":{...}}，解析取 data.section。 */
  onSection?: (section: ReportSection) => void
  /** event: done → 完整 RecommendationReport（以它为准存 store）。 */
  onDone?: (report: RecommendationReport) => void
  /** event: error → {"message"}；收到后调用方回退普通 JSON 接口。 */
  onError?: (message: string) => void
}

/** P3：流式请求选项（AbortController + 30s 超时）。 */
export interface StreamRecommendOptions {
  signal?: AbortSignal
  timeoutMs?: number
}

/**
 * 流式推荐：POST /api/v1/recommend/stream，fetch ReadableStream 解析 SSE。
 * 宽容解析：未知 event 忽略、坏 data 行跳过；非 event-stream 且为报告 JSON 时按 onDone 兜底。
 */
export async function streamRecommend(
  scene: SceneInput,
  handlers: StreamRecommendHandlers = {},
  options: StreamRecommendOptions = {},
): Promise<void> {
  const { signal, timeoutMs = 30000 } = options
  const controller = new AbortController()
  const onExternalAbort = () => controller.abort()
  if (signal) {
    if (signal.aborted) controller.abort()
    else signal.addEventListener('abort', onExternalAbort)
  }
  const timer = setTimeout(() => controller.abort(), timeoutMs)
  try {
    const res = await fetch(`${API_BASE}/recommend/stream`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(scene),
      signal: controller.signal,
    })
  if (!res.ok) {
    handlers.onError?.(`请求失败（${res.status}）`)
    return
  }
  const contentType = res.headers.get('content-type') ?? ''
  if (!contentType.includes('text/event-stream')) {
    const data = (await res.json().catch(() => null)) as RecommendationReport | null
    if (data && typeof data === 'object' && 'candidates' in data) {
      handlers.onDone?.(data)
    } else {
      handlers.onError?.('流式响应格式异常')
    }
    return
  }

  await parseSseStream(res.body, (event, data) => {
    if (event === 'done') {
      try {
        handlers.onDone?.(JSON.parse(data) as RecommendationReport)
      } catch {
        handlers.onError?.('done 载荷解析失败')
      }
      return
    }
    if (event === 'error') {
      let message = '流式推荐失败'
      try {
        const parsed = JSON.parse(data) as { message?: string }
        if (typeof parsed.message === 'string' && parsed.message) message = parsed.message
      } catch {
        // 保留默认 message
      }
      handlers.onError?.(message)
      return
    }
    if (event === 'step') {
      try {
        handlers.onStep?.(JSON.parse(data) as StepRecord)
      } catch {
        // 宽容：忽略坏行
      }
      return
    }
    if (event === 'section') {
      try {
        const parsed = JSON.parse(data) as { section?: ReportSection }
        if (parsed.section) handlers.onSection?.(parsed.section)
      } catch {
        // 宽容：忽略坏行
      }
    }
    // 未知 event 忽略
  })
  } finally {
    clearTimeout(timer)
    signal?.removeEventListener('abort', onExternalAbort)
  }
}

/** 典型案例列表。 */
export function getCases(): Promise<CaseSeed[]> {
  return request<CaseSeed[]>('/cases')
}

/**
 * 对话面板：SSE 流式（text/event-stream）优先；
 * 后端降级为普通 JSON `{reply}` 时同样可用。
 */
export async function postChat(
  req: ChatRequest,
  onDelta?: (delta: string) => void,
): Promise<string> {
  const res = await fetch(`${API_BASE}/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(req),
  })
  if (!res.ok) {
    throw new Error(`请求失败（${res.status}）: /chat`)
  }
  const contentType = res.headers.get('content-type') ?? ''
  if (!contentType.includes('text/event-stream')) {
    const data = (await res.json()) as { reply?: string }
    return data.reply ?? ''
  }
  let result = ''
  await parseSseStream(res.body, (_event, data) => {
    if (data === '[DONE]') return
    let text = data
    try {
      const parsed = JSON.parse(data) as Record<string, unknown>
      if (typeof parsed.delta === 'string') text = parsed.delta
      else if (typeof parsed.reply === 'string') text = parsed.reply
      else if (typeof parsed.content === 'string') text = parsed.content
    } catch {
      // 非 JSON 的 data 行按纯文本处理
    }
    result += text
    onDelta?.(text)
  })
  return result
}

/** 知识库统计。 */
export function kbStats(): Promise<KbStats> {
  return request<KbStats>('/kb/stats')
}

/** 知识库检索测试框。 */
export function kbSearch(query: KbSearchQuery): Promise<SearchHit[]> {
  return request<SearchHit[]>('/kb/search', {
    method: 'POST',
    body: JSON.stringify(query),
  })
}

/** 知识库文本上传入库。 */
export function kbUpload(payload: KbUploadPayload): Promise<KbUploadResult> {
  return request<KbUploadResult>('/kb/documents', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

/**
 * 知识库文件上传（multipart，PDF 由后端 pdf-parse 抽取文本；.md/.txt 走原文）。
 * 不手动设置 content-type：浏览器自动生成 multipart 边界。
 */
export async function kbUploadFile(file: File): Promise<KbUploadResult> {
  const form = new FormData()
  form.append('file', file)
  const res = await fetch(`${API_BASE}/kb/documents`, { method: 'POST', body: form })
  if (!res.ok) {
    throw new Error(`请求失败（${res.status}）: /kb/documents`)
  }
  return (await res.json()) as KbUploadResult
}

/** 索引重建。 */
export function kbRebuild(): Promise<KbRebuildResult> {
  return request<KbRebuildResult>('/kb/rebuild', { method: 'POST' })
}
