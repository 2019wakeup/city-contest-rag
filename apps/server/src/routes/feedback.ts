import type { OpenAPIHono } from '@hono/zod-openapi';
import type { AppDeps } from '../app';

/**
 * 反馈闭环 stub（spec §9 G9：模块 E 概念设计落点，仅接收不回写）。
 */
export function registerFeedback(app: OpenAPIHono, _deps: AppDeps): void {
  app.post('/api/v1/feedback', async (c) => {
    await c.req.json().catch(() => null);
    return c.json({ received: true });
  });
}
