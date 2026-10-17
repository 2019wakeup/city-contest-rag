import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { filterByScene, initRelationDb } from '../src/relation/db';
import type { RelationDb } from '../src/relation/db';
import { seedFromCorpus } from '../src/relation/seed';

const REPO_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../../..');
const CORPUS_DIR = join(REPO_ROOT, 'data/corpus');

function countRows(db: RelationDb, table: string): number {
  const row = db.prepare(`SELECT COUNT(*) AS n FROM ${table}`).get() as unknown as { n: number };
  return row.n;
}

describe('关系层（T6）', () => {
  let dir: string;
  let dbPath: string;

  beforeEach(() => {
    dir = mkdtempSync(join(tmpdir(), 'relation-'));
    dbPath = join(dir, 'test.db');
  });

  afterEach(() => {
    rmSync(dir, { recursive: true, force: true });
  });

  it('seedFromCorpus：materials ≥40、relations = entries 内 relations 总和、cases=5', async () => {
    const stats = await seedFromCorpus(CORPUS_DIR, dbPath);
    expect(stats.materials).toBeGreaterThanOrEqual(40);
    expect(stats.cases).toBe(5);

    const entries = JSON.parse(
      readFileSync(join(CORPUS_DIR, 'knowledge/entries.json'), 'utf8'),
    ) as Array<{ relations?: unknown[] }>;
    const expectedRelations = entries.reduce((acc, e) => acc + (e.relations?.length ?? 0), 0);
    expect(expectedRelations).toBeGreaterThan(0);
    expect(stats.relations).toBe(expectedRelations);

    const db = initRelationDb(dbPath);
    expect(countRows(db, 'materials')).toBe(stats.materials);
    expect(countRows(db, 'relations')).toBe(stats.relations);
    expect(countRows(db, 'cases')).toBe(5);
    expect(countRows(db, 'scene_tags')).toBeGreaterThan(0);
    // UI#11：cases 表含原始中文摘要列（非英文标签串）
    const caseRow = db
      .prepare("SELECT summary FROM cases WHERE id = 'case-01'")
      .get() as unknown as { summary: string };
    expect(caseRow.summary).toContain('车辙');
    expect(caseRow.summary).not.toContain('heavy');
    db.close();
  });

  it('filterByScene：高温+重载+车辙标签返回非空集合并含 SBS 类材料', async () => {
    await seedFromCorpus(CORPUS_DIR, dbPath);
    const db = initRelationDb(dbPath);
    const set = filterByScene(db, {
      targets: [],
      tags: ['c-hot-humid', 't-heavy', 'd-rutting'],
    });
    expect(set.binders.length).toBeGreaterThan(0);
    expect(set.binders.some((n) => n.includes('SBS'))).toBe(true);
    expect(set.gradations.length).toBeGreaterThan(0);
    db.close();
  });

  it('filterByScene：完全不匹配的标签 + 空 targets 返回空集', async () => {
    await seedFromCorpus(CORPUS_DIR, dbPath);
    const db = initRelationDb(dbPath);
    const set = filterByScene(db, { targets: [], tags: ['no-such-tag'] });
    expect(set.binders).toEqual([]);
    expect(set.gradations).toEqual([]);
    expect(set.modifiers).toEqual([]);
    expect(set.additives).toEqual([]);
    db.close();
  });

  it('filterByScene：property ∈ targets 也命中（标签为空）', async () => {
    await seedFromCorpus(CORPUS_DIR, dbPath);
    const db = initRelationDb(dbPath);
    const set = filterByScene(db, {
      targets: [{ perf: '低温PG', value: -28, unit: '℃' }],
      tags: [],
    });
    expect(set.binders.length).toBeGreaterThan(0);
    db.close();
  });

  it('seedFromCorpus 幂等：重复执行后各表行数不变', async () => {
    await seedFromCorpus(CORPUS_DIR, dbPath);
    const db1 = initRelationDb(dbPath);
    const before = ['materials', 'relations', 'scene_tags', 'cases'].map((t) => countRows(db1, t));
    db1.close();

    await seedFromCorpus(CORPUS_DIR, dbPath);
    const db2 = initRelationDb(dbPath);
    const after = ['materials', 'relations', 'scene_tags', 'cases'].map((t) => countRows(db2, t));
    db2.close();

    expect(after).toEqual(before);
  });
});
