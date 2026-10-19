import { afterEach, beforeEach, describe, expect, it } from 'vitest';
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
import { recommend, selectCandidateHits } from '../src/orchestrator';
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

/** 21 条命中：literature/knowledge/standard 交错（各 7 条），每个 chunk 独立 docId；
 * 其中 literature 混合 litfull-（全文块，噪声）与 lit-（题录）。 */
function makeHitList(): SearchHit[] {
  const pattern: Array<SearchHit['docType']> = ['literature', 'knowledge', 'standard'];
  return Array.from({ length: 21 }, (_, i) => {
    const dt = pattern[i % 3];
    const prefix = dt === 'literature' && i % 6 === 0 ? 'litfull' : 'doc';
    return makeHit(`${prefix}-${String(i).padStart(2, '0')}:0:v1`, dt, `命中 ${i}`);
  });
}

describe('R6 挑选逻辑（selectCandidateHits 单元）', () => {
  it('配额与去重：知识 ≤2、文献 ≤2 优先、标准不限、docId 不重复、chunk 全局 ≤3', () => {
    const global = new Map<string, number>();
    const othersUsed = new Set<string>();
    const hits = makeHitList();
    for (let round = 0; round < 5; round++) {
      const chosen = selectCandidateHits(hits, global, othersUsed);
      expect(chosen.length).toBeGreaterThanOrEqual(2);
      const docIds = chosen.map((h) => h.provenance.sourceDocId);
      expect(new Set(docIds).size).toBe(docIds.length);
      const types = chosen.map((h) => h.docType);
      expect(types.filter((t) => t === 'knowledge').length).toBeLessThanOrEqual(2);
      expect(types.filter((t) => t === 'literature').length).toBeLessThanOrEqual(2);
      for (const h of chosen) othersUsed.add(h.chunkId);
    }
    for (const [, n] of global) expect(n).toBeLessThanOrEqual(3);
  });

  it('S1：文献槽排除 litfull- 全文块（退而用题录/知识/标准补齐）', () => {
    const global = new Map<string, number>();
    const othersUsed = new Set<string>();
    const hits = makeHitList();
    for (let round = 0; round < 3; round++) {
      const chosen = selectCandidateHits(hits, global, othersUsed);
      expect(chosen.some((h) => h.chunkId.startsWith('litfull-'))).toBe(false);
      for (const h of chosen) othersUsed.add(h.chunkId);
    }
  });
});

/** 模拟"每候选检索到不同证据"的假 store：按查询调用轮转偏移 */
class RotatingEvidenceStore implements VectorStore {
  readonly queries: Array<{ text: string; docTypes?: string[] }> = [];
  private calls = 0;

  constructor(private hits: SearchHit[]) {}

  async add(): Promise<void> {}
  async delete(): Promise<void> {}
  async rebuild(): Promise<void> {}

  async stats(): Promise<{ count: number; docTypes: Record<string, number> }> {
    return { count: this.hits.length, docTypes: {} };
  }

  async search(q: VectorSearchQuery): Promise<SearchHit[]> {
    this.queries.push({ text: q.text, docTypes: q.filter?.docTypes });
    const offset = (this.calls++ * 4) % this.hits.length;
    return [...this.hits.slice(offset), ...this.hits.slice(0, offset)].slice(0, q.topK);
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

type ReportWithDebug = RecommendationReport & {
  evidenceQueries?: string[];
  evidenceSlotSources?: number[][];
};

describe('R6 证据多样性验收（fake store 注入）', () => {
  let dir: string;
  let relationDb: RelationDb;

  beforeEach(async () => {
    dir = mkdtempSync(join(tmpdir(), 'r6-'));
    relationDb = initRelationDb(join(dir, 'relation.db'));
    await seedFromCorpus(CORPUS_DIR, join(dir, 'relation.db'));
  });

  afterEach(() => {
    relationDb.close();
    rmSync(dir, { recursive: true, force: true });
  });

  it('每候选必凑满 3 条、集合两两不同、查询两两互异、来源查询序号标注', async () => {
    const store = new RotatingEvidenceStore(makeHitList());
    const report = (await recommend(loadCaseScene('case-01'), {
      store,
      embedder: fakeEmbedder,
      relationDb,
    })) as ReportWithDebug;
    expect(report.candidates).toHaveLength(5);

    // R6-3：5 条候选查询两两互异
    const queries = report.evidenceQueries ?? [];
    expect(queries).toHaveLength(5);
    expect(new Set(queries).size).toBe(5);
    for (const q of queries) {
      expect(/高温|低温|疲劳|水稳|LCC|碳排|寿命|施工/.test(q)).toBe(true);
      expect(q).toContain('沥青');
    }

    // R6-1：每候选 3 条 + 来源查询序号
    const sets: string[][] = [];
    for (const cand of report.candidates) {
      expect(cand.evidenceIds).toHaveLength(3);
      sets.push(cand.evidenceIds);
    }
    const sources = report.evidenceSlotSources ?? [];
    expect(sources).toHaveLength(5);
    for (const s of sources) expect(s).toHaveLength(3);

    // R6-2：任意两候选集合不相等
    for (let i = 0; i < sets.length; i++) {
      for (let j = i + 1; j < sets.length; j++) {
        const a = new Set(sets[i]);
        const b = new Set(sets[j]);
        expect(a.size === b.size && [...a].every((x) => b.has(x)), `候选${i} 与候选${j} 集合相同`).toBe(false);
      }
    }

    // chunk 全局 ≤3、同候选 docId 不重复
    const docByChunk = new Map(report.evidence.map((e) => [e.chunkId, e.provenance.sourceDocId]));
    const chunkCount = new Map<string, number>();
    for (const ids of sets) {
      const docIds = ids.map((id) => docByChunk.get(id)!);
      expect(new Set(docIds).size).toBe(docIds.length);
      for (const id of ids) chunkCount.set(id, (chunkCount.get(id) ?? 0) + 1);
    }
    for (const [, n] of chunkCount) expect(n).toBeLessThanOrEqual(3);

    // S1：证据链不含 litfull- 全文块
    expect(report.evidence.some((e) => e.chunkId.startsWith('litfull-'))).toBe(false);
  });
});
