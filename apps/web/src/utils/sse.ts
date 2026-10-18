/**
 * SSE 流解析公共工具：按 event 行/data 行逐事件回调（事件以空行分隔）。
 * 未知事件由调用方决定是否忽略；data 行为纯文本（JSON 由调用方解析）。
 */
export async function parseSseStream(
  stream: ReadableStream<Uint8Array> | null,
  onEvent: (event: string, data: string) => void,
): Promise<void> {
  if (!stream) return
  const reader = stream.getReader()
  const decoder = new TextDecoder()
  let buffer = ''
  let eventName = 'message'
  let dataLines: string[] = []

  const dispatch = () => {
    const raw = dataLines.join('\n').trim()
    dataLines = []
    if (!raw) {
      eventName = 'message'
      return
    }
    onEvent(eventName, raw)
    eventName = 'message'
  }

  for (;;) {
    const { done, value } = await reader.read()
    if (done) break
    buffer += decoder.decode(value, { stream: true })
    const lines = buffer.split(/\r?\n/)
    buffer = lines.pop() ?? ''
    for (const line of lines) {
      if (line === '') {
        dispatch()
      } else if (line.startsWith('event:')) {
        eventName = line.slice(6).trim()
      } else if (line.startsWith('data:')) {
        dataLines.push(line.slice(5).trimStart())
      }
    }
  }
  dispatch()
}
