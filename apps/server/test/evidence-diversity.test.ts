import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import type { SearchHit, SceneInput } from '@road-rec/contracts';
import { SceneInputSchema } from '@road-rec/contracts';
import type { VectorStore, VectorSearchQuery } from '@road-rec/retrieval';
import { initRelationDb } from '../src/relation/db';
import type { RelationDb } from '../src/relation/db';
import { seedFromCorpus } from '../src/relation/seed';
import { recommend, selectDiverseEvidence } from '../src/orchestrator';
import type { EmbedderLike } from '../src/orchestrator';

const REPO_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../../..');
const CORPUS_DIR = join(REPO_ROOT, 'data/corpus');

const fakeEmbedder: EmbedderLike = {
  dim: 2,
  modelName: 'fake',
  modelVersion: 'v0',
  embed: async (texts: string[]) => texts.map(() => [0, 0]),
};

function makeHit(chunkId: string, docType: SearchHit['docType'], text: string): SearchHit {
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

/** 21 条命中：literature/knowledge/standard 交错（各 7 条），每个 chunk 独立 docId */
function makeHitList(): SearchHit[] {
  const pattern: Array<SearchHit['docType']> = ['literature', 'knowledge', 'standard'];
  return Array.from({ length: 21 }, (_, i) =>
    makeHit(`doc-${String(i).padStart(2, '0')}:0:v1`, pattern[i % 3], `命中 ${i}`),
  );
}

describe('R2 证据多样性挑选（selectDiverseEvidence 单元）', () => {
  it('配额与去重：每候选 3 条、知识 ≤2、标准 ≤1、文献优先、docId 不重复、chunk 全局 ≤2', () => {
    const global = new Map<string, number>();
    const hits = makeHitList();
    for (let round = 0; round < 5; round++) {
      const chosen = selectDiverseEvidence(hits, global);
      expect(chosen).toHaveLength(3);
      const docIds = chosen.map((h) => h.provenance.sourceDocId);
      expect(new Set(docIds).size).toBe(docIds.length);
      const types = chosen.map((h) => h.docType);
      expect(types.filter((t) => t === 'knowledge').length).toBeLessThanOrEqual(2);
      expect(types.filter((t) => t === 'standard').length).toBeLessThanOrEqual(1);
      expect(types.includes('literature')).toBe(true);
    }
    for (const [, n] of global) expect(n).toBeLessThanOrEqual(2);
  });
});

/** 模拟"每候选检索到不同证据"的假 store：每次 search 错开 3 条偏移（R1 差异化的代理） */
class RotatingEvidenceStore implements VectorStore {
  readonly queries: string[] = [];
  private calls = 0;

  constructor(private hits: SearchHit[]) {}

  async add(): Promise<void> {}
  async delete(): Promise<void> {}
  async rebuild(): Promise<void> {}

  async stats(): Promise<{ count: number; docTypes: Record<string, number> }> {
    return { count: this.hits.length, docTypes: {} };
  }

  async search(q: VectorSearchQuery): Promise<SearchHit[]> {
    this.queries.push(q.text);
    const offset = (this.calls++ * 4) % this.hits.length;
    return [...this.hits.slice(offset), ...this.hits.slice(0, offset)].slice(0, q.topK);
  }
}

describe('R5 证据多样性验收（fake store 注入）', () => {
  let dir: string;
  let relationDb: RelationDb;

  beforeEach(async () => {
    dir = mkdtempSync(join(tmpdir(), 'r5-'));
    relationDb = initRelationDb(join(dir, 'relation.db'));
    await seedFromCorpus(CORPUS_DIR, join(dir, 'relation.db'));
  });

  afterEach(() => {
    relationDb.close();
    rmSync(dir, { recursive: true, force: true });
  });

  function loadCaseScene(id: string): SceneInput {
    const cases = JSON.parse(
      readFileSync(join(CORPUS_DIR, 'cases', 'cases.json'), 'utf8'),
    ) as Array<{ id: string; scene: unknown }>;
    const found = cases.find((c) => c.id === id);
    if (!found) throw new Error(`case ${id} 不存在`);
    return SceneInputSchema.parse(found.scene);
  }

  it('15 槽去重 ≥12、chunk ≤2、同候选 docId 不重复、≥2 候选含文献/规范、查询差异化', async () => {
    const store = new RotatingEvidenceStore(makeHitList());
    const report = await recommend(loadCaseScene('case-01'), {
      store,
      embedder: fakeEmbedder,
      relationDb,
    });
    expect(report.candidates).toHaveLength(5);

    // R1：5 个候选的查询互不相同（差异化检索）
    expect(store.queries).toHaveLength(5);
    expect(new Set(store.queries).size).toBeGreaterThanOrEqual(5);
    for (const q of store.queries) {
      expect(q.length).toBeGreaterThan(20);
      expect(/高温|低温|疲劳|水稳|LCC|碳排|寿命|施工/.test(q)).toBe(true);
      expect(q).toContain('沥青'); // 配方全字段进入查询
    }

    const docByChunk = new Map(report.evidence.map((e) => [e.chunkId, e.provenance.sourceDocId]));
    const typeByChunk = new Map(report.evidence.map((e) => [e.chunkId, e.docType]));
    const chunkCount = new Map<string, number>();
    let withLitOrStd = 0;

    for (const cand of report.candidates) {
      expect(cand.evidenceIds).toHaveLength(3);
      const docIds = cand.evidenceIds.map((id) => docByChunk.get(id)!);
      expect(new Set(docIds).size).toBe(docIds.length); // 同候选 docId 不重复
      const types = cand.evidenceIds.map((id) => typeByChunk.get(id)!);
      if (types.includes('literature') || types.includes('standard')) withLitOrStd += 1;
      for (const id of cand.evidenceIds) chunkCount.set(id, (chunkCount.get(id) ?? 0) + 1);
    }
    for (const [, n] of chunkCount) expect(n).toBeLessThanOrEqual(2);
    expect(report.evidence.length).toBeGreaterThanOrEqual(12); // 去重并集 ≥12
    expect(withLitOrStd).toBeGreaterThanOrEqual(2);
  });
});
