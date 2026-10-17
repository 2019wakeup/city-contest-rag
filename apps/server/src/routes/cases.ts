import type { OpenAPIHono } from '@hono/zod-openapi';
import { SceneInputSchema } from '@road-rec/contracts';
import { deriveSceneTags, summarizeScene } from '../orchestrator';
import type { AppDeps } from '../app';

interface CaseRow {
  id: string;
  title: string;
  sceneJson: string;
  expectedJson: string;
}

export function registerCases(app: OpenAPIHono, deps: AppDeps): void {
  const toDto = async (row: CaseRow) => {
    const scene = SceneInputSchema.parse(JSON.parse(row.sceneJson));
    let canPreRun = false;
    try {
      canPreRun = (await deps.store.stats()).count > 0;
    } catch {
      canPreRun = false;
    }
    return {
      id: row.id,
      title: row.title,
      summary: summarizeScene(scene),
      scene,
      expected: JSON.parse(row.expectedJson),
      tags: deriveSceneTags(scene, deps.relationDb),
      canPreRun,
    };
  };

  app.get('/api/v1/cases', async (c) => {
    const rows = deps.relationDb
      .prepare('SELECT id, title, sceneJson, expectedJson FROM cases ORDER BY id')
      .all() as unknown as CaseRow[];
    return c.json(await Promise.all(rows.map(toDto)));
  });

  app.get('/api/v1/cases/:id', async (c) => {
    const id = c.req.param('id');
    const row = deps.relationDb
      .prepare('SELECT id, title, sceneJson, expectedJson FROM cases WHERE id = ?')
      .get(id) as unknown as CaseRow | undefined;
    if (!row) return c.json({ error: '案例不存在' }, 404);
    return c.json(await toDto(row));
  });
}
