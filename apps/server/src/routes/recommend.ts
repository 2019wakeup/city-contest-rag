import { createRoute } from '@hono/zod-openapi';
import type { OpenAPIHono } from '@hono/zod-openapi';
import { streamSSE } from 'hono/streaming';
import { z } from 'zod';
import { RecommendationReportSchema, SceneInputSchema } from '@road-rec/contracts';
import { recommend } from '../orchestrator';
import type { RecommendDeps } from '../orchestrator';
import type { AppDeps } from '../app';

export const recommendRoute = createRoute({
  method: 'post',
  path: '/api/v1/recommend',
  request: {
    body: {
      content: { 'application/json': { schema: SceneInputSchema } },
    },
  },
  responses: {
    200: {
      description: '推荐报告（六步 pipeline 产物，schemaVersion 1）',
      // passthrough 的索引签名会让 zod-openapi 的响应类型推断失效/爆栈（运行时 docs 生成不受影响），
      // 类型层放开，运行时校验仍由 RecommendationReportSchema.parse 保证。
      content: {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        'application/json': { schema: RecommendationReportSchema as any },
      },
    },
    400: {
      description: '场景输入不合法',
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      content: { 'application/json': { schema: z.object({ error: z.string() }).passthrough() as any } },
    },
  },
});

function toRecommendDeps(deps: AppDeps): RecommendDeps {
  return {
    store: deps.store,
    embedder: deps.embedder,
    relationDb: deps.relationDb,
    llmCall: deps.llmCall,
  };
}

export function registerRecommend(app: OpenAPIHono, deps: AppDeps): void {
  app.openapi(recommendRoute, async (c) => {
    const scene = SceneInputSchema.parse(c.req.valid('json'));
    const report = await recommend(scene, toRecommendDeps(deps));
    return c.json(report, 200);
  });

  // SSE 流式（与 JSON 接口共用同一六步 pipeline，不复制实现）：
  // step×6 → section×N（每 section 一次 LLM 结构化调用）→ done(完整 report) / error
  app.post('/api/v1/recommend/stream', async (c) => {
    const raw = await c.req.json().catch(() => null);
    const parsed = SceneInputSchema.safeParse(raw);
    return streamSSE(c, async (stream) => {
      if (!parsed.success) {
        await stream.writeSSE({
          event: 'error',
          data: JSON.stringify({ message: `场景输入不合法：${parsed.error.issues[0]?.message ?? ''}` }),
        });
        return;
      }
      try {
        const report = await recommend(parsed.data, toRecommendDeps(deps), {
          onStep: (step) => {
            void stream.writeSSE({ event: 'step', data: JSON.stringify(step) });
          },
          onSection: (index, section) => {
            void stream.writeSSE({ event: 'section', data: JSON.stringify({ index, section }) });
          },
        });
        await stream.writeSSE({ event: 'done', data: JSON.stringify(report) });
      } catch (err) {
        await stream.writeSSE({
          event: 'error',
          data: JSON.stringify({ message: err instanceof Error ? err.message : String(err) }),
        });
      }
    });
  });
}
