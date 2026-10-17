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

export interface Embedder {
  /** 返回 n×dim 矩阵（mean 池化 + L2 归一化） */
  embed(texts: string[]): Promise<number[][]>;
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
  if (cacheDir) env.cacheDir = cacheDir;
  const pipe = await pipeline('feature-extraction', modelId);
  return pipe as unknown as TransformerPipeline;
}

const defaultDeps: EmbedderDeps = {
  createPipeline: defaultCreatePipeline,
  getLibraryVersion: () => env.version,
};

type VectorLike = number[] | { data: Float32Array | number[]; dims?: number[] };

function flattenVector(v: unknown): number[] {
  if (Array.isArray(v)) {
    // 可能是一维向量，也可能是 [1, n] 形状的嵌套数组
    if (v.length > 0 && Array.isArray(v[0])) return flattenVector(v[0]);
    return v as number[];
  }
  if (v && typeof v === 'object' && 'data' in (v as object)) {
    const data = (v as { data: Float32Array | number[] }).data;
    return Array.from(data);
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

  const pipe = await deps.createPipeline(modelName, opts.cacheDir);
  const modelVersion = deps.getLibraryVersion();

  return {
    dim,
    modelName,
    modelVersion,
    async embed(texts: string[]): Promise<number[][]> {
      if (texts.length === 0) return [];
      // 文档侧嵌入：mean 池化 + L2 归一化（bge-m3 推荐；e5 系列的 query/passage 前缀由调用方决定）
      const outputs = await pipe(texts, { pooling: 'mean', normalize: true });
      const arr = Array.isArray(outputs) ? outputs : [outputs];
      const vectors = arr.map(flattenVector);
      for (const [i, vec] of vectors.entries()) {
        if (vec.length !== dim) {
          throw new Error(
            `embedding 维度不匹配：模型 ${modelName} 声明 dim=${dim}，实际 ${vec.length}（第 ${i} 条）`,
          );
        }
      }
      return vectors;
    },
  };
}
