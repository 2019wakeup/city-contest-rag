import type { OpenAPIHono } from '@hono/zod-openapi';
import { streamSSE } from 'hono/streaming';
import { ChatRequestSchema } from '@road-rec/contracts';
import type { AppDeps } from '../app';

/**
 * 对话面板：SSE 流式（R15 格式：data {"delta":"..."} 行；结束 event: done + data {"done":true}）。
 * LLM 未配置（无 responder）→ 普通 JSON {reply} 降级。
 */
export function registerChat(app: OpenAPIHono, deps: AppDeps): void {
  app.post('/api/v1/chat', async (c) => {
    const raw = await c.req.json().catch(() => null);
    const parsed = ChatRequestSchema.safeParse(raw);
    if (!parsed.success) return c.json({ error: '对话请求不合法' }, 400);
    const body = parsed.data;

    const responder = deps.chatResponder;
    if (!responder) {
      return c.json({ reply: 'LLM 未配置或已关闭（LLM_OFF=1），当前为降级模式，确定性推荐结果不受影响。' });
    }

    return streamSSE(c, async (stream) => {
      await responder(
        { question: body.question, history: body.history, reportContext: body.reportContext },
        (delta) => {
          void stream.writeSSE({ data: JSON.stringify({ delta }) });
        },
      );
      await stream.writeSSE({ event: 'done', data: JSON.stringify({ done: true }) });
    });
  });
}
