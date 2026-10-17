import { existsSync, mkdirSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { loadEnvFile } from 'node:process';
import { fileURLToPath } from 'node:url';
import { serve } from '@hono/node-server';
import { SqliteVectorStore } from '@road-rec/retrieval';
import { initRelationDb } from './relation/db';
import { seedFromCorpus } from './relation/seed';
import { createApp } from './app';
import { streamChat } from './llm/client';
import { createVectorStore, resolveEmbeddingModel } from './config';
import type { EmbedderLike } from './orchestrator';

const REPO_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../../..');

async function main(): Promise<void> {
  // 加载根目录 .env（Node 24 内置；不覆盖已存在的环境变量）。
  // 必须在任何读取 env 的逻辑（llmConfigured/resolveEmbeddingModel 等）之前执行。
  const envPath = resolve(REPO_ROOT, '.env');
  if (existsSync(envPath)) {
    try {
      loadEnvFile(envPath);
    } catch {
      // .env 损坏时忽略，走真实环境变量
    }
  }

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

  // embedding（EMBEDDING_MODEL: bge-m3 默认 | multilingual-e5-small；首次需联网下载，走 HF_ENDPOINT 镜像）。
  // 非法模型名启动即报错退出；下载失败降级纯 BM25 检索。缓存目录与 build-index CLI 口径一致。
  const embeddingModel = resolveEmbeddingModel();
  let embedder: EmbedderLike | null = null;
  try {
    const { createEmbedder } = await import('@road-rec/embedding');
    embedder = await createEmbedder({
      model: embeddingModel,
      cacheDir: join(indexDir, 'hf-cache'),
    });
  } catch (err) {
    console.warn(
      'embedding 模型不可用（未下载/无网络），检索降级纯 BM25：',
      err instanceof Error ? err.message : String(err),
    );
  }

  // 向量库（R3-C2：先 embedder 后 store，LanceDB 表维度 = embedder.dim；
  // embedder 失败时 dim 用默认，store 仍可用纯 BM25）。RETRIEVAL_BACKEND=sqlite 显式降级。
  const backend = process.env.RETRIEVAL_BACKEND ?? 'lancedb';
  const store = createVectorStore({ backend, indexDir, dim: embedder?.dim ?? null });

  const llmConfigured = Boolean(process.env.DEEPSEEK_API_KEY && process.env.LLM_OFF !== '1');
  const app = createApp({
    store,
    embedder,
    relationDb,
    backend: store instanceof SqliteVectorStore ? 'sqlite' : 'lancedb',
    corpusDir: join(REPO_ROOT, 'data/corpus'),
    manifestPath: join(REPO_ROOT, 'data/index', 'manifest.json'),
    chatResponder: llmConfigured ? streamChat : undefined,
  });

  const port = Number(process.env.PORT ?? 3000);
  serve({ fetch: app.fetch, port }, (info) => {
    console.log(`数智选材 RAG 服务已启动：http://localhost:${info.port}（OpenAPI 文档 /openapi）`);
  });
}

void main();
