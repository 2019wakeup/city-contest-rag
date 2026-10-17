import { mkdirSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { serve } from '@hono/node-server';
import { LanceDBVectorStore, SqliteVectorStore } from '@road-rec/retrieval';
import type { VectorStore } from '@road-rec/retrieval';
import { initRelationDb } from './relation/db';
import { seedFromCorpus } from './relation/seed';
import { createApp } from './app';
import { streamChat } from './llm/client';
import type { EmbedderLike } from './orchestrator';

const REPO_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../../..');

async function main(): Promise<void> {
  const dbDir = join(REPO_ROOT, 'data/db');
  const indexDir = join(REPO_ROOT, 'data/index');
  mkdirSync(dbDir, { recursive: true });
  mkdirSync(indexDir, { recursive: true });

  // 关系表：空则自动种子（幂等）
  const relationDbPath = join(dbDir, 'relation.db');
  const relationDb = initRelationDb(relationDbPath);
  const { n } = relationDb.prepare('SELECT COUNT(*) AS n FROM materials').get() as unknown as { n: number };
  if (n === 0) {
    console.log('关系表为空，从 data/corpus 种子……');
    await seedFromCorpus(join(REPO_ROOT, 'data/corpus'), relationDbPath);
  }

  // 向量库：RETRIEVAL_BACKEND=sqlite 显式降级；lancedb 初始化失败自动降级 SQLite
  const backend = process.env.RETRIEVAL_BACKEND ?? 'lancedb';
  let store: VectorStore;
  if (backend === 'sqlite') {
    store = new SqliteVectorStore(join(indexDir, 'sqlite.db'));
  } else {
    try {
      store = new LanceDBVectorStore(join(indexDir, 'lancedb'));
    } catch (err) {
      console.warn('LanceDB 初始化失败，自动降级 SQLite：', err);
      store = new SqliteVectorStore(join(indexDir, 'sqlite.db'));
    }
  }

  // embedding（bge-m3，首次需联网下载，走 HF_ENDPOINT 镜像）；失败降级纯 BM25 检索
  let embedder: EmbedderLike | null = null;
  try {
    const { createEmbedder } = await import('@road-rec/embedding');
    embedder = await createEmbedder({});
  } catch (err) {
    console.warn(
      'embedding 模型不可用（未下载/无网络），检索降级纯 BM25：',
      err instanceof Error ? err.message : String(err),
    );
  }

  const llmConfigured = Boolean(process.env.DEEPSEEK_API_KEY && process.env.LLM_OFF !== '1');
  const app = createApp({
    store,
    embedder,
    relationDb,
    backend: store instanceof SqliteVectorStore ? 'sqlite' : 'lancedb',
    chatResponder: llmConfigured ? streamChat : undefined,
  });

  const port = Number(process.env.PORT ?? 3000);
  serve({ fetch: app.fetch, port }, (info) => {
    console.log(`数智选材 RAG 服务已启动：http://localhost:${info.port}（OpenAPI 文档 /openapi）`);
  });
}

void main();
