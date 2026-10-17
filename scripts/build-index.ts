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

async function main(): Promise<void> {
  const args = process.argv.slice(2);
  const rebuild = args.includes('--rebuild');
  const backendArg = args.find((a) => a.startsWith('--backend='));
  const backend = backendArg?.split('=')[1] ?? process.env.RETRIEVAL_BACKEND ?? 'lancedb';
  const modelArg = args.find((a) => a.startsWith('--model='));
  const model = (modelArg?.split('=')[1] ?? process.env.EMBEDDING_MODEL ?? 'bge-m3') as EmbedderModel;

  if (backend !== 'sqlite' && backend !== 'lancedb') {
    throw new Error(`不支持的 backend: ${backend}（可选 sqlite|lancedb）`);
  }

  const embedder = await createEmbedder({ model });
  let store: VectorStore;
  if (backend === 'sqlite') {
    store = new SqliteVectorStore(path.join(indexDir, 'app.db'));
  } else {
    const { LanceDBVectorStore } = await import('../packages/retrieval/src/lancedb');
    store = new LanceDBVectorStore(path.join(indexDir, 'lancedb'), { dim: embedder.dim });
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

main().catch((err) => {
  console.error('build-index 失败:', err);
  process.exit(1);
});
