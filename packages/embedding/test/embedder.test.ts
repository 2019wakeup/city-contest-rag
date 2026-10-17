import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { env } from '@huggingface/transformers';
import {
  createEmbedder,
  MODEL_REGISTRY,
  type EmbedderDeps,
  type EmbedderModel,
  type TransformerPipeline,
} from '../src/embedder';

/** 构造 fake pipeline：每个文本返回一个"已池化"向量（number[][] 形态） */
function fakePipelineByText(vectors: Record<string, number[]>): TransformerPipeline {
  return (async (texts) => {
    const arr = Array.isArray(texts) ? texts : [texts];
    return arr.map((t) => vectors[t] ?? vectors.__default ?? [0]);
  }) as TransformerPipeline;
}

function makeDeps(overrides: Partial<EmbedderDeps> = {}): EmbedderDeps {
  return {
    createPipeline: overrides.createPipeline ?? (async () => fakePipelineByText({ __default: [1, 2, 3] })),
    getLibraryVersion: overrides.getLibraryVersion ?? (() => 'test-lib-1.0.0'),
  };
}

describe('createEmbedder（stub pipeline，不下载真实模型）', () => {
  it('embed 返回 n×dim 矩阵且数值透传', async () => {
    const dim = MODEL_REGISTRY['bge-m3'].dim;
    const vectors = {
      '文本一': Array.from({ length: dim }, (_, i) => i),
      '文本二': Array.from({ length: dim }, (_, i) => dim - i),
    };
    const deps = makeDeps({ createPipeline: async () => fakePipelineByText(vectors) });
    const e = await createEmbedder({ model: 'bge-m3' }, deps);
    const out = await e.embed(['文本一', '文本二']);
    expect(out).toHaveLength(2);
    expect(out[0]).toHaveLength(dim);
    expect(out[0]).toEqual(vectors['文本一']);
    expect(out[1]).toEqual(vectors['文本二']);
  });

  it('以 mean 池化方式请求 pipeline 并归一化', async () => {
    const dim = MODEL_REGISTRY['bge-m3'].dim;
    const vec = Array.from({ length: dim }, () => 0.5);
    const seen: { texts: unknown; options?: Record<string, unknown> }[] = [];
    const createPipeline = async (): Promise<TransformerPipeline> =>
      ((texts: unknown, options?: Record<string, unknown>) => {
        seen.push({ texts, options });
        return Promise.resolve([vec]);
      }) as TransformerPipeline;
    const e = await createEmbedder({}, makeDeps({ createPipeline }));
    await e.embed(['查询文本']);
    expect(seen[0].texts).toEqual(['查询文本']);
    expect(seen[0].options).toMatchObject({ pooling: 'mean', normalize: true });
  });

  it('展平 Tensor 形态（data/dims）输出为 number[]', async () => {
    const dim = MODEL_REGISTRY['multilingual-e5-small'].dim;
    const createPipeline = async (): Promise<TransformerPipeline> =>
      (async () => [
        { data: new Float32Array(Array.from({ length: dim }, (_, i) => i + 1)), dims: [1, dim] },
        { data: new Float32Array(Array.from({ length: dim }, (_, i) => i + 5)), dims: [1, dim] },
      ]) as TransformerPipeline;
    const e = await createEmbedder({ model: 'multilingual-e5-small' }, makeDeps({ createPipeline }));
    const out = await e.embed(['a', 'b']);
    expect(out).toEqual([
      Array.from({ length: dim }, (_, i) => i + 1),
      Array.from({ length: dim }, (_, i) => i + 5),
    ]);
  });

  it('批量 Tensor（dims=[n, dim]）按行拆分为 n 个向量', async () => {
    const dim = MODEL_REGISTRY['bge-m3'].dim;
    // 真实 transformers.js 批量输出：单个 Tensor，data 为拼接的 n×dim 平铺数组
    const createPipeline = async (): Promise<TransformerPipeline> =>
      (async () => ({
        data: new Float32Array(Array.from({ length: 3 * dim }, (_, i) => i + 1)),
        dims: [3, dim],
      })) as TransformerPipeline;
    const e = await createEmbedder({}, makeDeps({ createPipeline }));
    const out = await e.embed(['t1', 't2', 't3']);
    expect(out).toHaveLength(3);
    expect(out[0]).toEqual(Array.from({ length: dim }, (_, i) => i + 1));
    expect(out[1]).toEqual(Array.from({ length: dim }, (_, i) => dim + i + 1));
    expect(out[2]).toEqual(Array.from({ length: dim }, (_, i) => 2 * dim + i + 1));
  });

  it('dim 与 modelName 取自模型注册表', async () => {
    for (const model of ['bge-m3', 'multilingual-e5-small'] as EmbedderModel[]) {
      const e = await createEmbedder({ model }, makeDeps());
      expect(e.modelName).toBe(MODEL_REGISTRY[model].name);
      expect(e.dim).toBe(MODEL_REGISTRY[model].dim);
    }
  });

  it('modelVersion 来自 deps（transformers 库版本）', async () => {
    const e = await createEmbedder({}, makeDeps({ getLibraryVersion: () => 'lib-9.9.9' }));
    expect(e.modelVersion).toBe('lib-9.9.9');
  });

  it('HF_ENDPOINT 环境变量写入 env.remoteHost', async () => {
    process.env.HF_ENDPOINT = 'https://hf-mirror.com';
    try {
      await createEmbedder({}, makeDeps());
      expect(env.remoteHost).toBe('https://hf-mirror.com');
    } finally {
      delete process.env.HF_ENDPOINT;
    }
  });

  it('cacheDir 透传给 createPipeline', async () => {
    const dim = MODEL_REGISTRY['bge-m3'].dim;
    let got: string | undefined;
    const deps = makeDeps({
      createPipeline: async (_modelId: string, cacheDir?: string) => {
        got = cacheDir;
        return fakePipelineByText({ __default: Array.from({ length: dim }, () => 1) });
      },
    });
    await createEmbedder({ cacheDir: '/tmp/hf-cache' }, deps);
    expect(got).toBe('/tmp/hf-cache');
  });

  it('空数组输入返回空数组', async () => {
    const e = await createEmbedder({}, makeDeps());
    expect(await e.embed([])).toEqual([]);
  });
});
