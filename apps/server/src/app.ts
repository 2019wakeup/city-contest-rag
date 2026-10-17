import { OpenAPIHono } from '@hono/zod-openapi';
import type { VectorStore } from '@road-rec/retrieval';
import type { RelationDb } from './relation/db';
import type { EmbedderLike } from './orchestrator';
import type { LlmCall } from './llm/client';
import type { ChatResponder } from './llm/client';
import { registerRecommend } from './routes/recommend';
import { registerCases } from './routes/cases';
import { registerHealth } from './routes/health';
import { registerFeedback } from './routes/feedback';
import { registerChat } from './routes/chat';
import { registerKb } from './routes/kb';

export interface AppDeps {
  store: VectorStore;
  embedder: EmbedderLike | null;
  relationDb: RelationDb;
  backend: string;
  /** 语料真相源目录（kb/rebuild 用） */
  corpusDir: string;
  /** buildIndex manifest 路径（幂等记录；测试注入临时路径） */
  manifestPath: string;
  /** 测试注入：fake LLM 调用（缺省走 env） */
  llmCall?: LlmCall;
  /** 对话流式响应器（index.ts 按 env 配置；null = 普通 JSON 降级） */
  chatResponder?: ChatResponder;
}

/** Hono 应用工厂（测试直接 app.request，无需真实网络）。OpenAPI 文档挂 /openapi。 */
export function createApp(deps: AppDeps): OpenAPIHono {
  const app = new OpenAPIHono();
  registerRecommend(app, deps);
  registerCases(app, deps);
  registerHealth(app, deps);
  registerFeedback(app, deps);
  registerChat(app, deps);
  registerKb(app, deps);
  app.doc('/openapi', {
    openapi: '3.1.0',
    info: { title: '数智选材 RAG 演示 API', version: '1.0.0' },
  });
  return app;
}
