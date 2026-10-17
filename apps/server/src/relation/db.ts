import { DatabaseSync } from 'node:sqlite';
import type { PerfTarget } from '@road-rec/contracts';

/**
 * 关系层数据库（spec §6.1）：materials / relations / scene_tags / cases。
 * R14：引擎 = Node 24 内置 node:sqlite，零原生依赖。
 */
export type RelationDb = DatabaseSync;

export interface CandidateMaterialSet {
  binders: string[];
  gradations: string[];
  modifiers: string[];
  additives: string[];
}

/** materials.type（spec §6.1 中文标签）→ CandidateMaterialSet 桶；混合料不进候选集合。 */
const TYPE_BUCKET: Record<string, keyof CandidateMaterialSet> = {
  沥青品种: 'binders',
  级配: 'gradations',
  改性剂: 'modifiers',
  助剂: 'additives',
};

export function createRelationSchema(db: RelationDb): void {
  db.exec(`
    CREATE TABLE IF NOT EXISTS materials (
      id TEXT PRIMARY KEY,
      type TEXT NOT NULL,
      name TEXT NOT NULL,
      specsJson TEXT NOT NULL,
      sourceRef TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS relations (
      id TEXT PRIMARY KEY,
      materialId TEXT NOT NULL,
      property TEXT NOT NULL,
      effect TEXT NOT NULL,
      direction TEXT NOT NULL,
      magnitude TEXT NOT NULL,
      applicableSceneJson TEXT NOT NULL,
      sourceRef TEXT NOT NULL
    );
    CREATE INDEX IF NOT EXISTS idx_relations_material ON relations(materialId);
    CREATE TABLE IF NOT EXISTS scene_tags (
      id TEXT PRIMARY KEY,
      label TEXT NOT NULL,
      kind TEXT NOT NULL,
      synonymsJson TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS cases (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      summary TEXT NOT NULL,
      sceneJson TEXT NOT NULL,
      expectedJson TEXT NOT NULL
    );
  `);
  // 旧库迁移：补充 summary 列（UI#11 后新增；既有 data/db/relation.db 无此列）
  const caseCols = db
    .prepare('PRAGMA table_info(cases)')
    .all() as unknown as Array<{ name: string }>;
  if (!caseCols.some((c) => c.name === 'summary')) {
    db.exec("ALTER TABLE cases ADD COLUMN summary TEXT NOT NULL DEFAULT ''");
  }
}

export function initRelationDb(dbPath: string): RelationDb {
  const db = new DatabaseSync(dbPath);
  createRelationSchema(db);
  return db;
}

/**
 * 场景标签硬过滤（六步 pipeline 第三步前半）：relations.applicableScene ∩ tags 命中
 * 或 relations.property ∈ targets 的 material，按类型分桶返回材料名（去重、稳定排序）。
 */
export function filterByScene(
  db: RelationDb,
  opts: { targets: PerfTarget[]; tags: string[] },
): CandidateMaterialSet {
  const targetProps = new Set(opts.targets.map((t) => t.perf));
  const tagSet = new Set(opts.tags);

  const materials = db.prepare('SELECT id, type, name FROM materials').all() as unknown as Array<{
    id: string;
    type: string;
    name: string;
  }>;
  const relations = db
    .prepare('SELECT materialId, property, applicableSceneJson FROM relations')
    .all() as unknown as Array<{ materialId: string; property: string; applicableSceneJson: string }>;

  const matched = new Set<string>();
  for (const r of relations) {
    if (matched.has(r.materialId)) continue;
    const scenes = JSON.parse(r.applicableSceneJson) as string[];
    if (scenes.some((s) => tagSet.has(s)) || targetProps.has(r.property)) {
      matched.add(r.materialId);
    }
  }

  const result: CandidateMaterialSet = { binders: [], gradations: [], modifiers: [], additives: [] };
  for (const m of materials) {
    if (!matched.has(m.id)) continue;
    const bucket = TYPE_BUCKET[m.type];
    if (bucket) result[bucket].push(m.name);
  }
  for (const key of Object.keys(result) as Array<keyof CandidateMaterialSet>) {
    result[key] = [...new Set(result[key])].sort((a, b) => a.localeCompare(b, 'zh-CN'));
  }
  return result;
}
