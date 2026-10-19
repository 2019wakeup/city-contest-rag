import { afterEach, describe, expect, it, vi } from 'vitest';
import type { SearchHit } from '@road-rec/contracts';
import { rerankHits } from '../src/rag/rerank';
import type { LlmCall } from '../src/llm/client';

function makeHit(chunkId: string, text: string): SearchHit {
  return {
    schemaVersion: '1',
    chunkId,
    text,
    docType: 'knowledge',
    tags: [],
    score: 0.5,
    provenance: {
      sourceDocId: chunkId.split(':')[0],
      contentHash: `hash-${chunkId}`,
      embeddingModel: 'bge-m3',
      modelVersion: 'v1',
      dim: 1024,
      pipelineRev: 'abc1234',
      embeddedAt: '2026-10-17T00:00:00Z',
    },
  };
}

const hits = [makeHit('doc-a:0:v1', '甲'), makeHit('doc-b:0:v1', '乙'), makeHit('doc-c:0:v1', '丙')];
const perCandidate = [{ query: 'q1', hits }];

describe('B3 LLM 批量重排（rerankHits）', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('fake LLM 合法 JSON → 按分数降序', async () => {
    const llm: LlmCall = async () =>
      JSON.stringify({
        results: [
          { queryIndex: 0, chunkId: 'doc-a:0:v1', score: 0.4, reason: '一般' },
          { queryIndex: 0, chunkId: 'doc-b:0:v1', score: 0.9, reason: '高度相关' },
          { queryIndex: 0, chunkId: 'doc-c:0:v1', score: 0.7, reason: '相关' },
        ],
      });
    const map = await rerankHits(perCandidate, { llm });
    expect(map.get(0)!.map((r) => r.hit.chunkId)).toEqual(['doc-b:0:v1', 'doc-c:0:v1', 'doc-a:0:v1']);
    expect(map.get(0)![0].reason).toBe('高度相关');
  });

  it('非法 JSON → 回退原序且不抛错', async () => {
    const map = await rerankHits(perCandidate, { llm: async () => 'not-json{{{' });
    expect(map.get(0)!.map((r) => r.hit.chunkId)).toEqual(['doc-a:0:v1', 'doc-b:0:v1', 'doc-c:0:v1']);
  });

  it('超时 → 回退原序且不抛错', async () => {
    const hanging: LlmCall = () => new Promise<string>(() => {});
    const map = await rerankHits(perCandidate, { llm: hanging, timeoutMs: 50 });
    expect(map.get(0)!.map((r) => r.hit.chunkId)).toEqual(['doc-a:0:v1', 'doc-b:0:v1', 'doc-c:0:v1']);
  });

  it('RERANK=off → 不调用 LLM 且保持原序', async () => {
    vi.stubEnv('RERANK', 'off');
    let called = false;
    const spy: LlmCall = async () => {
      called = true;
      return '{}';
    };
    const map = await rerankHits(perCandidate, { llm: spy });
    expect(called).toBe(false);
    expect(map.get(0)!.map((r) => r.hit.chunkId)).toEqual(['doc-a:0:v1', 'doc-b:0:v1', 'doc-c:0:v1']);
  });

  it('未配置 LLM（无 key）→ 原序回退', async () => {
    vi.stubEnv('DEEPSEEK_API_KEY', '');
    const map = await rerankHits(perCandidate, {});
    expect(map.get(0)!.map((r) => r.hit.chunkId)).toEqual(['doc-a:0:v1', 'doc-b:0:v1', 'doc-c:0:v1']);
  });
});
