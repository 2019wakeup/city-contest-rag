import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildIndex, SqliteVectorStore } from '@road-rec/retrieval';
import type { RecommendationReport, SceneInput } from '@road-rec/contracts';
import { SceneInputSchema } from '@road-rec/contracts';
import { initRelationDb } from '../src/relation/db';
import type { RelationDb } from '../src/relation/db';
import { seedFromCorpus } from '../src/relation/seed';
import { recommend } from '../src/orchestrator';
import type { EmbedderLike } from '../src/orchestrator';

const REPO_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../../..');
const CORPUS_DIR = join(REPO_ROOT, 'data/corpus');

const fakeEmbedder: EmbedderLike = {
  dim: 2,
  modelName: 'fake',
  modelVersion: 'v0',
  embed: async (texts: string[]) => texts.map(() => [0, 0]),
};

type ReportWithDebug = RecommendationReport & {
  evidenceQueries?: string[];
  evidenceSlotSources?: number[][];
};

const CASE_IDS = ['case-01', 'case-02', 'case-03', 'case-04', 'case-05'];

function loadCaseScene(id: string): SceneInput {
  const cases = JSON.parse(
    readFileSync(join(CORPUS_DIR, 'cases', 'cases.json'), 'utf8'),
  ) as Array<{ id: string; scene: unknown }>;
  const found = cases.find((c) => c.id === id);
  if (!found) throw new Error(`case ${id} 不存在`);
  return SceneInputSchema.parse(found.scene);
}

describe('R6 验收（真实语料索引 + SqliteVectorStore，真实 BM25 检索）', () => {
  let dir: string;
  let relationDb: RelationDb;
  let store: SqliteVectorStore;

  beforeAll(async () => {
    dir = mkdtempSync(join(tmpdir(), 'r6real-'));
    relationDb = initRelationDb(join(dir, 'relation.db'));
    await seedFromCorpus(CORPUS_DIR, join(dir, 'relation.db'));
    store = new SqliteVectorStore(join(dir, 'index.db'));
    await buildIndex({
      corpusDir: CORPUS_DIR,
      store,
      embedder: fakeEmbedder,
      rebuild: true,
      manifestPath: join(dir, 'manifest.json'),
      pipelineRev: 'r6test',
    });
  }, 120000);

  afterAll(() => {
    store.close();
    relationDb.close();
    rmSync(dir, { recursive: true, force: true });
  });

  it('5 案例逐项达标：每候选 3 条、15 槽、集合两两不同、查询互异、≥60% 候选含文献/规范、sections 达标', async () => {
    let totalLitOrStd = 0;
    let totalCandidates = 0;
    for (const id of CASE_IDS) {
      const report = (await recommend(loadCaseScene(id), {
        store,
        embedder: fakeEmbedder,
        relationDb,
      })) as ReportWithDebug;
      expect(report.candidates.length, `${id} 候选数`).toBe(5);
      const slots = report.candidates.reduce((acc, c) => acc + c.evidenceIds.length, 0);
      expect(slots, `${id} 槽位总数`).toBe(15);

      // R6-1：每候选凑满 3 条
      for (const cand of report.candidates) {
        expect(cand.evidenceIds, `${id}/${cand.id} 条数`).toHaveLength(3);
      }
      // 来源查询序号标注（0=主查询 1=场景查询 2=池补 3=文献补）
      const sources = report.evidenceSlotSources ?? [];
      expect(sources, `${id} 来源标注`).toHaveLength(5);
      for (const s of sources) expect(s).toHaveLength(3);

      // R6-3：候选查询两两互异
      const queries = report.evidenceQueries ?? [];
      expect(queries, `${id} 查询数`).toHaveLength(5);
      expect(new Set(queries).size, `${id} 查询互异`).toBe(5);

      // R6-2：任意两候选集合不相等
      const sets = report.candidates.map((c) => c.evidenceIds);
      for (let i = 0; i < sets.length; i++) {
        for (let j = i + 1; j < sets.length; j++) {
          const a = new Set(sets[i]);
          const b = new Set(sets[j]);
          expect(a.size === b.size && [...a].every((x) => b.has(x)), `${id} 候选${i}/${j} 集合相同`).toBe(false);
        }
      }

      // R6-4：文献/规范参与 + S1：证据链不含 litfull- 全文块
      const typeByChunk = new Map(report.evidence.map((e) => [e.chunkId, e.docType]));
      expect(report.evidence.some((e) => e.chunkId.startsWith('litfull-')), `${id} 含 litfull`).toBe(false);
      for (const cand of report.candidates) {
        totalCandidates += 1;
        const types = cand.evidenceIds.map((cid) => typeByChunk.get(cid)!);
        if (types.includes('literature') || types.includes('standard')) totalLitOrStd += 1;
      }

      // R6-5：结论节 ≥2、对比节 ≥3、互不重叠
      const s0 = report.sections[0]?.evidenceIds ?? [];
      const s1 = report.sections[1]?.evidenceIds ?? [];
      expect(s0.length, `${id} 结论节证据`).toBeGreaterThanOrEqual(2);
      expect(s1.length, `${id} 对比节证据`).toBeGreaterThanOrEqual(3);
      expect(s1.every((x) => !s0.includes(x)), `${id} 两节重叠`).toBe(true);
    }
    expect(totalCandidates).toBe(25);
    expect(totalLitOrStd).toBeGreaterThanOrEqual(15); // R6-4：≥60%
  }, 120000);
});
