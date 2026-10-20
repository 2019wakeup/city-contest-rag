import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import type { RecommendationReport, SearchHit, SceneInput } from '@road-rec/contracts';
import { SceneInputSchema } from '@road-rec/contracts';
import type { VectorStore, VectorSearchQuery } from '@road-rec/retrieval';
import { initRelationDb } from '../src/relation/db';
import type { RelationDb } from '../src/relation/db';
import { seedFromCorpus } from '../src/relation/seed';
import { evidenceSimilarity, recommend, selectMmrHits } from '../src/orchestrator';
import type { EmbedderLike } from '../src/orchestrator';

const REPO_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../../..');
const CORPUS_DIR = join(REPO_ROOT, 'data/corpus');

const fakeEmbedder: EmbedderLike = {
  dim: 2,
  modelName: 'fake',
  modelVersion: 'v0',
  embed: async (texts: string[]) => texts.map(() => [0, 0]),
};

function makeHit(chunkId: string, text: string, docType: SearchHit['docType'] = 'knowledge'): SearchHit {
  return {
    schemaVersion: '1',
    chunkId,
    text,
    docType,
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

describe('B5 MMR 单元（selectMmrHits / evidenceSimilarity）', () => {
  it('近重复文本 sim 高、同 docId sim=1、无关文本 sim 低', () => {
    const a = makeHit('x-1:0:v1', '高温车辙改性沥青混合料性能研究');
    const b = makeHit('x-2:0:v1', '高温车辙改性沥青混合料性能研究');
    const c = makeHit('y-1:0:v1', '低温抗裂橡胶沥青研究');
    expect(evidenceSimilarity(a, b)).toBeGreaterThan(0.7);
    expect(evidenceSimilarity(a, c)).toBeLessThan(0.3);
    const sameDoc = makeHit('x-1:1:v1', '另一段完全不同的文字内容');
    expect(evidenceSimilarity(a, sameDoc)).toBe(1);
  });

  it('高冗余命中（近重复不同 doc）→ MMR 抑制重复、选 3 条不同文本', () => {
    const items = [
      { hit: makeHit('x-1:0:v1', '高温车辙改性沥青混合料性能研究'), rel: 1.0 },
      { hit: makeHit('x-2:0:v1', '高温车辙改性沥青混合料性能研究'), rel: 0.9 },
      { hit: makeHit('y-1:0:v1', '低温抗裂橡胶沥青研究'), rel: 0.8 },
      { hit: makeHit('z-1:0:v1', '排水降噪路面技术'), rel: 0.7 },
      { hit: makeHit('lit-1:0:v1', '车辙处治文献综述', 'literature'), rel: 0.6 },
    ];
    const chosen = selectMmrHits(items, new Map());
    expect(chosen).toHaveLength(3);
    expect(chosen.map((h) => h.chunkId)).not.toContain('x-2:0:v1'); // 近重复被抑制
    expect(new Set(chosen.map((h) => h.provenance.sourceDocId)).size).toBe(3);
  });
});

/** 固定命中假 store（每次查询同序返回；docTypes 过滤生效） */
class FixedEvidenceStore implements VectorStore {
  constructor(private hits: SearchHit[]) {}

  async add(): Promise<void> {}
  async delete(): Promise<void> {}
  async rebuild(): Promise<void> {}
  async stats(): Promise<{ count: number; docTypes: Record<string, number> }> {
    return { count: this.hits.length, docTypes: {} };
  }
  async search(q: VectorSearchQuery): Promise<SearchHit[]> {
    const list = q.filter?.docTypes
      ? this.hits.filter((h) => q.filter!.docTypes!.includes(h.docType))
      : this.hits;
    return list.slice(0, q.topK);
  }
}

function loadCaseScene(id: string): SceneInput {
  const cases = JSON.parse(
    readFileSync(join(CORPUS_DIR, 'cases', 'cases.json'), 'utf8'),
  ) as Array<{ id: string; scene: unknown }>;
  const found = cases.find((c) => c.id === id);
  if (!found) throw new Error(`case ${id} 不存在`);
  return SceneInputSchema.parse(found.scene);
}

describe('B5 MMR 集成（fake store 注入，MMR on/off 对比）', () => {
  let dir: string;
  let relationDb: RelationDb;

  beforeEach(async () => {
    dir = mkdtempSync(join(tmpdir(), 'mmr-'));
    relationDb = initRelationDb(join(dir, 'relation.db'));
    await seedFromCorpus(CORPUS_DIR, join(dir, 'relation.db'));
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    relationDb.close();
    rmSync(dir, { recursive: true, force: true });
  });

  it('MMR=on 抑制近重复（x-1/x-2 不同 doc 同文本）；MMR=off 按配额原序会同时入选', async () => {
    const hits = [
      makeHit('x-1:0:v1', '高温车辙改性沥青混合料性能研究'),
      makeHit('x-2:0:v1', '高温车辙改性沥青混合料性能研究'),
      makeHit('y-1:0:v1', '低温抗裂橡胶沥青研究'),
      makeHit('z-1:0:v1', '排水降噪路面技术'),
      makeHit('lit-1:0:v1', '车辙处治文献综述', 'literature'),
      makeHit('k-1:0:v1', '常规知识条目'),
      makeHit('k-2:0:v1', '另一知识条目'),
    ];

    const run = async (mmr: 'on' | 'off'): Promise<RecommendationReport> => {
      if (mmr === 'off') vi.stubEnv('MMR', 'off');
      else vi.stubEnv('MMR', 'on');
      vi.stubEnv('RERANK', 'off'); // 固定命中顺序，隔离重排
      const store = new FixedEvidenceStore(hits);
      return recommend(loadCaseScene('case-01'), { store, embedder: fakeEmbedder, relationDb });
    };

    const on = await run('on');
    const off = await run('off');
    expect(on.candidates[0].evidenceIds).toHaveLength(3);
    expect(off.candidates[0].evidenceIds).toHaveLength(3);
    // MMR=off：文献优先 pass → lit-1，随后按相关度取 x-1、x-2（近重复同时入选）
    expect(off.candidates[0].evidenceIds).toContain('x-1:0:v1');
    expect(off.candidates[0].evidenceIds).toContain('x-2:0:v1');
    // MMR=on：x-2 因与 x-1 近重复被抑制，选多样性更强的集合
    expect(on.candidates[0].evidenceIds).toContain('x-1:0:v1');
    expect(on.candidates[0].evidenceIds).not.toContain('x-2:0:v1');
    // 两模式集合不同（重排开/关口径不同 → 选择确实变化）
    const setOn = new Set(on.candidates[0].evidenceIds);
    const setOff = new Set(off.candidates[0].evidenceIds);
    expect([...setOn].every((id) => setOff.has(id)) && setOn.size === setOff.size).toBe(false);
  });

  it('MMR_LAMBDA 环境变量生效：λ=1 时退化为纯相关度（近重复重新入选）', async () => {
    const hits = [
      makeHit('x-1:0:v1', '高温车辙改性沥青混合料性能研究'),
      makeHit('x-2:0:v1', '高温车辙改性沥青混合料性能研究'),
      makeHit('y-1:0:v1', '低温抗裂橡胶沥青研究'),
      makeHit('z-1:0:v1', '排水降噪路面技术'),
      makeHit('lit-1:0:v1', '车辙处治文献综述', 'literature'),
      makeHit('k-1:0:v1', '常规知识条目'),
    ];
    vi.stubEnv('MMR', 'on');
    vi.stubEnv('MMR_LAMBDA', '1');
    vi.stubEnv('RERANK', 'off');
    const store = new FixedEvidenceStore(hits);
    const report = await recommend(loadCaseScene('case-01'), { store, embedder: fakeEmbedder, relationDb });
    // λ=1：多样性项归零 → 近重复 x-1/x-2 同时入选（与 λ=0.7 的行为相反）
    expect(report.candidates[0].evidenceIds).toContain('x-1:0:v1');
    expect(report.candidates[0].evidenceIds).toContain('x-2:0:v1');
  });
});
