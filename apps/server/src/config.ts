import type { EmbedderModel } from '@road-rec/embedding';

const SUPPORTED: readonly EmbedderModel[] = ['bge-m3', 'multilingual-e5-small'];

/**
 * EMBEDDING_MODEL 环境变量解析（bge-m3 默认 | multilingual-e5-small）。
 * 非法值抛错（启动退出），避免"用 e5-small 建的索引 + bge-m3 查询"的维度静默不匹配。
 */
export function resolveEmbeddingModel(
  env: NodeJS.ProcessEnv = process.env,
): EmbedderModel {
  const raw = env.EMBEDDING_MODEL;
  if (raw === undefined || raw === '') return 'bge-m3';
  if ((SUPPORTED as readonly string[]).includes(raw)) return raw as EmbedderModel;
  throw new Error(
    `EMBEDDING_MODEL 非法值：${raw}（支持 ${SUPPORTED.join(' | ')}）`,
  );
}
