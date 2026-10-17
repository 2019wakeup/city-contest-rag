import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { CaseSeedSchema, KnowledgeEntrySchema } from '@road-rec/contracts';
import { createRelationSchema, initRelationDb } from './db';

export interface SeedStats {
  materials: number;
  relations: number;
  cases: number;
}

interface SceneTagRaw {
  id: string;
  label: string;
  kind: string;
  synonyms?: string[];
}

interface CaseRaw {
  id: string;
  title: string;
  sceneJson: string;
  expectedJson: string;
}

/**
 * 从语料真相源（T3）灌入关系表，幂等：先 DROP 再重建。
 * - materials 取自 entries.json（含 T3 passthrough 字段 name/type/specs）；
 * - relations = entries 内全部 relations（materialId 指向 entry id）；
 * - scene_tags 取自 scene-tags.json；cases 取自 cases/cases.json。
 */
export async function seedFromCorpus(corpusDir: string, dbPath: string): Promise<SeedStats> {
  const db = initRelationDb(dbPath);
  db.exec(
    'DROP TABLE IF EXISTS materials; DROP TABLE IF EXISTS relations; DROP TABLE IF EXISTS scene_tags; DROP TABLE IF EXISTS cases;',
  );
  createRelationSchema(db);

  const entriesRaw = JSON.parse(
    readFileSync(join(corpusDir, 'knowledge', 'entries.json'), 'utf8'),
  ) as unknown[];
  const tagsRaw = (
    JSON.parse(readFileSync(join(corpusDir, 'scene-tags.json'), 'utf8')) as { tags: SceneTagRaw[] }
  ).tags;
  const casesRaw = JSON.parse(readFileSync(join(corpusDir, 'cases', 'cases.json'), 'utf8')) as unknown[];

  const entries = entriesRaw.map((e) => KnowledgeEntrySchema.parse(e));
  const cases = casesRaw.map((c) => CaseSeedSchema.parse(c));

  const insMaterial = db.prepare(
    'INSERT INTO materials (id, type, name, specsJson, sourceRef) VALUES (?, ?, ?, ?, ?)',
  );
  const insRelation = db.prepare(
    'INSERT INTO relations (id, materialId, property, effect, direction, magnitude, applicableSceneJson, sourceRef) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
  );
  const insTag = db.prepare(
    'INSERT INTO scene_tags (id, label, kind, synonymsJson) VALUES (?, ?, ?, ?)',
  );
  const insCase = db.prepare(
    'INSERT INTO cases (id, title, summary, sceneJson, expectedJson) VALUES (?, ?, ?, ?, ?)',
  );

  let relationCount = 0;
  db.exec('BEGIN');
  try {
    for (const e of entries) {
      // T3 passthrough 字段：name / type / specs 不进契约核心，但 materials 种子需要
      const extra = e as unknown as { type?: string; name?: string; specs?: unknown };
      insMaterial.run(
        e.id,
        extra.type ?? '',
        extra.name ?? e.title,
        JSON.stringify(extra.specs ?? {}),
        e.sourceRef,
      );
      e.relations.forEach((r, idx) => {
        insRelation.run(
          `${e.id}:r${idx}`,
          e.id,
          r.property,
          r.effect,
          r.direction,
          r.magnitude,
          JSON.stringify(r.applicableScene),
          r.sourceRef,
        );
        relationCount += 1;
      });
    }
    for (const t of tagsRaw) {
      insTag.run(t.id, t.label, t.kind, JSON.stringify(t.synonyms ?? []));
    }
    for (const c of cases) {
      // UI#11：summary 存 cases.json 的原始中文摘要（passthrough 字段）
      const extra = c as unknown as { summary?: string };
      insCase.run(c.id, c.title, extra.summary ?? '', JSON.stringify(c.scene), JSON.stringify(c.expected));
    }
    db.exec('COMMIT');
  } catch (err) {
    db.exec('ROLLBACK');
    throw err;
  }
  return { materials: entries.length, relations: relationCount, cases: cases.length };
}
