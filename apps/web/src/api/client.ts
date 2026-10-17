import type {
  CaseSeed,
  ChatRequest,
  DocType,
  RecommendationReport,
  SceneInput,
  SearchHit,
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

/** 典型案例列表。 */
export function getCases(): Promise<CaseSeed[]> {
  return request<CaseSeed[]>('/cases')
}

/**
 * 逐事件解析 SSE 文本：data 行支持 {delta}/{reply}/{content} 字段与纯文本；
 * 事件以空行分隔，[DONE] 结束标记忽略。
 */
async function readSseText(
  stream: ReadableStream<Uint8Array> | null,
  onDelta?: (delta: string) => void,
): Promise<string> {
  if (!stream) return ''
  const reader = stream.getReader()
  const decoder = new TextDecoder()
  let buffer = ''
  let dataLines: string[] = []
  let result = ''

  const finalizeEvent = () => {
    const raw = dataLines.join('\n').trim()
    dataLines = []
    if (!raw || raw === '[DONE]') return
    let text = raw
    try {
      const parsed = JSON.parse(raw) as Record<string, unknown>
      if (typeof parsed.delta === 'string') text = parsed.delta
      else if (typeof parsed.reply === 'string') text = parsed.reply
      else if (typeof parsed.content === 'string') text = parsed.content
    } catch {
      // 非 JSON 的 data 行按纯文本处理
    }
    result += text
    onDelta?.(text)
  }

  for (;;) {
    const { done, value } = await reader.read()
    if (done) break
    buffer += decoder.decode(value, { stream: true })
    const lines = buffer.split(/\r?\n/)
    buffer = lines.pop() ?? ''
    for (const line of lines) {
      if (line === '') {
        finalizeEvent()
      } else if (line.startsWith('data:')) {
        dataLines.push(line.slice(5).trimStart())
      }
    }
  }
  finalizeEvent()
  return result
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
  if (contentType.includes('text/event-stream')) {
    return readSseText(res.body, onDelta)
  }
  const data = (await res.json()) as { reply?: string }
  return data.reply ?? ''
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
