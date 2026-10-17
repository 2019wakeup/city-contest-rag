import type { OpenAPIHono } from '@hono/zod-openapi';
import type { AppDeps } from '../app';

export function registerHealth(app: OpenAPIHono, deps: AppDeps): void {
  app.get('/api/v1/health', async (c) => {
    let count = 0;
    let ok = false;
    try {
      const stats = await deps.store.stats();
      count = stats.count;
      ok = stats.count > 0; // 空库 = 需要 pnpm build:index（spec §5 三档降级）
    } catch {
      ok = false; // 引擎不可访问/损坏
    }
    return c.json({
      vectorStore: { backend: deps.backend, count, ok },
      llm: {
        configured: Boolean(process.env.DEEPSEEK_API_KEY && process.env.LLM_OFF !== '1'),
      },
      adapters: {
        a: process.env.MODULE_A_ENDPOINT ? 'real' : 'mock',
        c: process.env.MODULE_C_ENDPOINT ? 'real' : 'mock',
      },
    });
  });
}
