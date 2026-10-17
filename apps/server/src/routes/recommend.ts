import { createRoute } from '@hono/zod-openapi';
import type { OpenAPIHono } from '@hono/zod-openapi';
import { z } from 'zod';
import { RecommendationReportSchema, SceneInputSchema } from '@road-rec/contracts';
import { recommend } from '../orchestrator';
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

export function registerRecommend(app: OpenAPIHono, deps: AppDeps): void {
  app.openapi(recommendRoute, async (c) => {
    const scene = SceneInputSchema.parse(c.req.valid('json'));
    const report = await recommend(scene, {
      store: deps.store,
      embedder: deps.embedder,
      relationDb: deps.relationDb,
      llmCall: deps.llmCall,
    });
    return c.json(report, 200);
  });
}
