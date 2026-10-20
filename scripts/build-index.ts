/**
 * build-index CLI（T4，薄封装）：入库管线入口（spec §6.4 "可重建缓存"防线的执行者）。
 *
 * 用法（pnpm build:index 已绑定默认用法）：
 *   tsx scripts/build-index.ts [--rebuild] [--backend=sqlite|lancedb]
 *
 * 环境变量：
 *   RETRIEVAL_BACKEND=sqlite|lancedb  后端引擎（默认 lancedb，见 spec D3）
 *   EMBEDDING_MODEL=bge-m3|multilingual-e5-small  嵌入模型（默认 bge-m3）
 *   HF_ENDPOINT=https://hf-mirror.com  模型下载镜像（网络受限时）
 */
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { SqliteVectorStore } from '../packages/retrieval/src/sqlite';
import { buildIndex } from '../packages/retrieval/src/build';
import type { VectorStore } from '../packages/retrieval/src/types';
import { createEmbedder, type EmbedderModel } from '../packages/embedding/src/embedder';

const here = path.dirname(fileURLToPath(import.meta.url));
const corpusDir = path.resolve(here, '../data/corpus');
const indexDir = path.resolve(here, '../data/index');

export const EMBEDDING_MODELS = ['bge-m3', 'multilingual-e5-small', 'multilingual-e5-base'] as const;

export interface CliOptions {
  rebuild: boolean;
  backend: 'sqlite' | 'lancedb';
  model: EmbedderModel;
  /** 库目录覆盖（D5 双索引实验；默认 data/index/{lancedb|app.db}） */
  dbPath?: string;
}

/** 纯参数解析（可测试）：非法 backend/model 抛明确错误（C4） */
export function resolveCliOptions(args: string[], env: NodeJS.ProcessEnv): CliOptions {
  const rebuild = args.includes('--rebuild');
  const backendArg = args.find((a) => a.startsWith('--backend='));
  const backend = backendArg?.split('=')[1] ?? env.RETRIEVAL_BACKEND ?? 'lancedb';
  const modelArg = args.find((a) => a.startsWith('--model='));
  const model = modelArg?.split('=')[1] ?? env.EMBEDDING_MODEL ?? 'bge-m3';
  const dbPathArg = args.find((a) => a.startsWith('--db-path='));

  if (backend !== 'sqlite' && backend !== 'lancedb') {
    throw new Error(`不支持的 backend: ${backend}（可选 sqlite|lancedb）`);
  }
  if (!(EMBEDDING_MODELS as readonly string[]).includes(model)) {
    throw new Error(`不支持的 embedding 模型: ${model}（可选 ${EMBEDDING_MODELS.join('|')}）`);
  }
  return {
    rebuild,
    backend: backend as CliOptions['backend'],
    model: model as EmbedderModel,
    dbPath: dbPathArg?.split('=')[1] || undefined,
  };
}

async function main(): Promise<void> {
  const { rebuild, backend, model, dbPath } = resolveCliOptions(process.argv.slice(2), process.env);

  const embedder = await createEmbedder({
    model,
    cacheDir: process.env.EMBEDDING_CACHE_DIR ?? path.join(indexDir, 'hf-cache'),
  });
  let store: VectorStore;
  if (backend === 'sqlite') {
    store = new SqliteVectorStore(dbPath ?? path.join(indexDir, 'app.db'));
  } else {
    const { LanceDBVectorStore } = await import('../packages/retrieval/src/lancedb');
    store = new LanceDBVectorStore(dbPath ?? path.join(indexDir, 'lancedb'), { dim: embedder.dim });
  }

  const startedAt = Date.now();
  const result = await buildIndex({
    corpusDir,
    store,
    embedder,
    rebuild,
    manifestPath: path.join(indexDir, 'manifest.json'),
  });
  const stats = await store.stats();
  console.log(
    [
      `build-index 完成：added=${result.added} skipped=${result.skipped} total=${result.total}`,
      `backend=${backend} model=${embedder.modelName} dim=${embedder.dim} pipelineRev=${process.env.PIPELINE_REV ?? 'git-HEAD'}`,
      `store: count=${stats.count} docTypes=${JSON.stringify(stats.docTypes)}`,
      `耗时 ${Date.now() - startedAt}ms`,
    ].join('\n'),
  );
}

// 仅 CLI 直跑时执行（被测试/其他模块 import 时无副作用）
if (import.meta.url === `file://${process.argv[1]}` || path.resolve(fileURLToPath(import.meta.url)) === path.resolve(process.argv[1] ?? '')) {
  main().catch((err) => {
    console.error('build-index 失败:', err);
    process.exit(1);
  });
}
