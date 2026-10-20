import { join } from 'node:path';
import { LanceDBVectorStore, SqliteVectorStore } from '@road-rec/retrieval';
import type { VectorStore } from '@road-rec/retrieval';
import type { EmbedderModel } from '@road-rec/embedding';

// P1·D5（data 实验）：multilingual-e5-base（768 维，e5 前缀规则同 small）；
// 类型以 packages/embedding 的 EmbedderModel 为准（data 并行落地，此处用字符串列表保持先行兼容）
const SUPPORTED: readonly string[] = ['bge-m3', 'multilingual-e5-small', 'multilingual-e5-base'];

/**
 * EMBEDDING_MODEL 环境变量解析（bge-m3 默认 | multilingual-e5-small）。
 * 非法值抛错（启动退出），避免"用 e5-small 建的索引 + bge-m3 查询"的维度静默不匹配。
 */
export function resolveEmbeddingModel(
  env: NodeJS.ProcessEnv = process.env,
): EmbedderModel {
  const raw = env.EMBEDDING_MODEL;
  if (raw === undefined || raw === '') return 'bge-m3';
  if (SUPPORTED.includes(raw)) return raw as EmbedderModel;
  throw new Error(
    `EMBEDDING_MODEL 非法值：${raw}（支持 ${SUPPORTED.join(' | ')}）`,
  );
}

/**
 * 向量库创建（R3-C2：启动顺序先 embedder 后 store）。
 * LanceDB 表维度必须与 embedder.dim 一致；embedder 失败时 dim=null → 默认 1024（纯 BM25 可用）。
 * lancedb 初始化失败自动降级 sqlite。
 */
export function createVectorStore(opts: {
  backend: string;
  indexDir: string;
  dim: number | null;
}): VectorStore {
  if (opts.backend === 'sqlite') {
    return new SqliteVectorStore(join(opts.indexDir, 'sqlite.db'));
  }
  try {
    return new LanceDBVectorStore(join(opts.indexDir, 'lancedb'), {
      dim: opts.dim ?? 1024,
    });
  } catch (err) {
    console.warn('LanceDB 初始化失败，自动降级 SQLite：', err);
    return new SqliteVectorStore(join(opts.indexDir, 'sqlite.db'));
  }
}
