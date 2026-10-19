import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { SqliteVectorStore } from '@road-rec/retrieval';
import { initRelationDb } from '../src/relation/db';
import type { RelationDb } from '../src/relation/db';
import { createApp } from '../src/app';
import type { EmbedderLike } from '../src/orchestrator';

const REPO_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../../..');
const CORPUS_DIR = join(REPO_ROOT, 'data/corpus');

const fakeEmbedder: EmbedderLike = {
  dim: 2,
  modelName: 'fake',
  modelVersion: 'v0',
  embed: async (texts: string[]) => texts.map(() => [0, 0]),
};

describe('T10 知识库管理路由', () => {
  let dir: string;
  let relationDb: RelationDb;
  let store: SqliteVectorStore;

  beforeEach(() => {
    dir = mkdtempSync(join(tmpdir(), 't10-'));
    relationDb = initRelationDb(join(dir, 'relation.db'));
    store = new SqliteVectorStore(':memory:');
  });

  afterEach(() => {
    store.close();
    relationDb.close();
    rmSync(dir, { recursive: true, force: true });
  });

  function makeApp() {
    return createApp({
      store,
      embedder: fakeEmbedder,
      relationDb,
      backend: 'sqlite',
      corpusDir: CORPUS_DIR,
      manifestPath: join(dir, 'manifest.json'),
    });
  }

  it('stats：空库 {count:0, docTypes:{}, backend}', async () => {
    const res = await (await makeApp().request('/api/v1/kb/stats')).json();
    expect(res).toEqual({ count: 0, docTypes: {}, backend: 'sqlite' });
  });

  it('documents JSON 文本入库 → stats 增 + docType 正确 + {added,chunks}', async () => {
    const app = makeApp();
    const up = (await (
      await app.request('/api/v1/kb/documents', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ title: '企业资料一', docType: 'enterprise', text: '企业提供的高性能沥青材料资料，适用于重载路段。' }),
      })
    ).json()) as { added: number; chunks: number };
    expect(up.added).toBe(1);
    expect(up.chunks).toBe(1);

    const stats = (await (await app.request('/api/v1/kb/stats')).json()) as {
      count: number;
      docTypes: Record<string, number>;
    };
    expect(stats.count).toBe(1);
    expect(stats.docTypes.enterprise).toBe(1);
  });

  it('search：命中返回 chunkId 与 provenance', async () => {
    const app = makeApp();
    await app.request('/api/v1/kb/documents', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ title: '企业资料一', docType: 'enterprise', text: '企业提供的高性能沥青材料资料，适用于重载路段。' }),
    });
    const hits = (await (
      await app.request('/api/v1/kb/search', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ query: '高性能沥青', topK: 5 }),
      })
    ).json()) as Array<{ chunkId: string; docType: string; provenance: { sourceDocId: string; contentHash: string } }>;
    expect(hits.length).toBeGreaterThan(0);
    expect(hits[0].chunkId.length).toBeGreaterThan(0);
    expect(hits[0].docType).toBe('enterprise');
    expect(hits[0].provenance.sourceDocId.length).toBeGreaterThan(0);
    expect(hits[0].provenance.contentHash.length).toBe(64);
  });

  it('documents multipart 文本文件上传入库', async () => {
    const app = makeApp();
    const form = new FormData();
    form.append('file', new File(['企业资料：排水降噪路面技术说明。'], '说明.txt', { type: 'text/plain' }));
    form.append('docType', 'enterprise');
    const res = await app.request('/api/v1/kb/documents', { method: 'POST', body: form });
    expect(res.status).toBe(200);
    const up = (await res.json()) as { added: number; chunks: number };
    expect(up.added).toBe(1);
    const stats = (await (await app.request('/api/v1/kb/stats')).json()) as { count: number };
    expect(stats.count).toBe(1);
  });

  it(
    'rebuild：语料全量重建，两次 count 不变（幂等）',
    async () => {
      const app = makeApp();
      const first = (await (
        await app.request('/api/v1/kb/rebuild', { method: 'POST', headers: { 'content-type': 'application/json' }, body: '{}' })
      ).json()) as { count: number };
      expect(first.count).toBeGreaterThan(0);
      const second = (await (
        await app.request('/api/v1/kb/rebuild', { method: 'POST', headers: { 'content-type': 'application/json' }, body: '{}' })
      ).json()) as { count: number };
      expect(second.count).toBe(first.count);
    },
    180000, // 语料扩容（全文/表格块）后全量重建约 30s
  );
});
