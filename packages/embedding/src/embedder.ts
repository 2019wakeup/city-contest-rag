/**
 * 本地 embedding（T4，packages/embedding）
 *
 * 默认模型 Xenova/bge-m3（中英均衡，1024 维）；备选 Xenova/multilingual-e5-small（384 维）。
 * 换模型 = 改 opts.model，入库管线凭 modelName/modelVersion 差异强制全量重建（spec §4 防线 3）。
 *
 * 测试不下载真实模型：通过 deps 注入 fake pipeline（见 test/embedder.test.ts）。
 * 真实路径经动态 import 加载 @huggingface/transformers，单元测试零模型依赖。
 */
import { env } from '@huggingface/transformers';

export type EmbedderModel = 'bge-m3' | 'multilingual-e5-small';

export const MODEL_REGISTRY: Record<EmbedderModel, { name: string; dim: number }> = {
  'bge-m3': { name: 'Xenova/bge-m3', dim: 1024 },
  'multilingual-e5-small': { name: 'Xenova/multilingual-e5-small', dim: 384 },
};

/** 嵌入模式：query（检索侧）/ passage（文档侧）。e5 系列需要 query:/passage: 前缀，bge-m3 不加。 */
export type EmbedMode = 'query' | 'passage';

const E5_PREFIX: Record<EmbedMode, string> = { query: 'query: ', passage: 'passage: ' };

export interface Embedder {
  /** 返回 n×dim 矩阵（mean 池化 + L2 归一化）；mode 决定 e5 的 query/passage 前缀（默认 passage） */
  embed(texts: string[], opts?: { mode?: EmbedMode }): Promise<number[][]>;
  dim: number;
  modelName: string;
  /** 模型版本标识（transformers.js 库版本），参与 provenance，换库/换模型强制重建 */
  modelVersion: string;
}

export interface EmbedderOptions {
  model?: EmbedderModel;
  cacheDir?: string;
}

/** transformers.js feature-extraction pipeline 的最小接口面 */
export interface TransformerPipeline {
  (texts: string | string[], options?: Record<string, unknown>): Promise<unknown>;
}

/** 测试注入缝（默认实现走 transformers.js） */
export interface EmbedderDeps {
  createPipeline: (modelId: string, cacheDir?: string) => Promise<TransformerPipeline>;
  getLibraryVersion: () => string;
}

async function defaultCreatePipeline(modelId: string, cacheDir?: string): Promise<TransformerPipeline> {
  const { pipeline } = await import('@huggingface/transformers');
  // cache_dir 以 pipeline options 传递（v3 的 FileCache 读取 options.cache_dir ?? env.cacheDir，
  // 仅改 env.cacheDir 在部分加载路径不生效，曾导致 CLI 误用包内默认缓存的截断模型）
  const pipe = await pipeline('feature-extraction', modelId, cacheDir ? { cache_dir: cacheDir } : {});
  return pipe as unknown as TransformerPipeline;
}

const defaultDeps: EmbedderDeps = {
  createPipeline: defaultCreatePipeline,
  getLibraryVersion: () => env.version,
};

type VectorLike = number[] | { data: Float32Array | number[]; dims?: number[] };

function isTensorLike(v: unknown): v is { data: Float32Array | number[]; dims?: number[] } {
  return typeof v === 'object' && v !== null && 'data' in (v as object);
}

/** 把 pipeline 输出单元展平为若干行向量（支持 [n,dim] 批量 Tensor 与 Tensor 数组按行拆分） */
function flattenVectors(v: unknown): number[][] {
  if (Array.isArray(v)) {
    if (v.length > 0 && (Array.isArray(v[0]) || isTensorLike(v[0]))) {
      return (v as unknown[]).flatMap((row) => flattenVectors(row));
    }
    return [v as number[]];
  }
  if (isTensorLike(v)) {
    const flat = Array.from(v.data);
    if (v.dims && v.dims.length === 2 && typeof v.dims[0] === 'number' && typeof v.dims[1] === 'number') {
      const [n, d] = v.dims as [number, number];
      const rows: number[][] = [];
      for (let i = 0; i < n; i++) rows.push(flat.slice(i * d, (i + 1) * d));
      return rows;
    }
    return [flat];
  }
  throw new Error(`embedding pipeline 输出形态无法识别: ${String(v).slice(0, 80)}`);
}

export async function createEmbedder(
  opts: EmbedderOptions = {},
  deps: EmbedderDeps = defaultDeps,
): Promise<Embedder> {
  const model: EmbedderModel = opts.model ?? 'bge-m3';
  const { name: modelName, dim } = MODEL_REGISTRY[model];

  // HF 下载镜像（spec §12 风险预案：HF_ENDPOINT=https://hf-mirror.com）
  if (process.env.HF_ENDPOINT) {
    env.remoteHost = process.env.HF_ENDPOINT;
  }

  // e5 系列 query/passage 前缀开关：auto（默认，e5 开 bge 关）| off
  const prefixMode = process.env.EMBEDDING_PREFIX_MODE === 'off' ? 'off' : 'auto';
  const usePrefix = prefixMode === 'auto' && model === 'multilingual-e5-small';

  const pipe = await deps.createPipeline(modelName, opts.cacheDir);
  const modelVersion = deps.getLibraryVersion();

  return {
    dim,
    modelName,
    modelVersion,
    async embed(texts: string[], embedOpts?: { mode?: EmbedMode }): Promise<number[][]> {
      if (texts.length === 0) return [];
      const mode: EmbedMode = embedOpts?.mode ?? 'passage';
      const inputs = usePrefix ? texts.map((t) => `${E5_PREFIX[mode]}${t}`) : texts;
      // 分批嵌入：单次超大 batch 会让 onnxruntime 按最长序列整体分配（曾实测 130GB OOM），
      // 每批 ≤32 条既控内存又不显著损失吞吐
      const EMBED_BATCH = 32;
      const vectors: number[][] = [];
      for (let i = 0; i < inputs.length; i += EMBED_BATCH) {
        const batch = inputs.slice(i, i + EMBED_BATCH);
        // 文档侧嵌入：mean 池化 + L2 归一化
        const outputs = await pipe(batch, { pooling: 'mean', normalize: true });
        const rows = flattenVectors(outputs);
        if (rows.length !== batch.length) {
          throw new Error(
            `embedding 输出行数与输入不一致：期望 ${batch.length}，实际 ${rows.length}（第 ${i} 批）`,
          );
        }
        for (const [j, vec] of rows.entries()) {
          if (vec.length !== dim) {
            throw new Error(
              `embedding 维度不匹配：模型 ${modelName} 声明 dim=${dim}，实际 ${vec.length}（第 ${i + j} 条）`,
            );
          }
        }
        vectors.push(...rows);
      }
      return vectors;
    },
  };
}
