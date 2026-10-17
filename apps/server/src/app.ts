import { OpenAPIHono } from '@hono/zod-openapi';
import type { VectorStore } from '@road-rec/retrieval';
import type { RelationDb } from './relation/db';
import type { EmbedderLike } from './orchestrator';
import { registerRecommend } from './routes/recommend';
import { registerCases } from './routes/cases';
import { registerHealth } from './routes/health';
import { registerFeedback } from './routes/feedback';

export interface AppDeps {
  store: VectorStore;
  embedder: EmbedderLike | null;
  relationDb: RelationDb;
  backend: string;
}

/** Hono 应用工厂（测试直接 app.request，无需真实网络）。OpenAPI 文档挂 /openapi。 */
export function createApp(deps: AppDeps): OpenAPIHono {
  const app = new OpenAPIHono();
  registerRecommend(app, deps);
  registerCases(app, deps);
  registerHealth(app, deps);
  registerFeedback(app, deps);
  app.doc('/openapi', {
    openapi: '3.1.0',
    info: { title: '数智选材 RAG 演示 API', version: '1.0.0' },
  });
  return app;
}
