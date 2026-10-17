/**
 * LanceDBVectorStore 真实引擎测试（T4）。
 *
 * 默认跳过：需要原生依赖 @lancedb/lancedb 已安装且设置 LANCEDB_TEST=1。
 * 运行方式：
 *   LANCEDB_TEST=1 pnpm exec vitest run --root scripts test/lancedb.test.ts
 * 模块用动态 import 加载，未设 LANCEDB_TEST 时不会触发原生依赖加载。
 */
import { describe, expect, it } from 'vitest';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import type { VectorStore } from '../../packages/retrieval/src/types';

const DIM = 8;

function makeChunk(chunkId: string, docId: string, text: string, docType: 'knowledge' | 'standard' | 'literature' | 'enterprise', tags: string[] = []) {
  return {
    schemaVersion: '1',
    chunkId,
    text,
    docType,
    tags,
    provenance: {
      sourceDocId: docId,
      contentHash: `hash-${chunkId}`,
      embeddingModel: 'fake/test',
      modelVersion: 'fake-1',
      dim: DIM,
      pipelineRev: 'testrev',
      embeddedAt: new Date().toISOString(),
    },
  };
}

const vec = (seed: number): number[] => Array.from({ length: DIM }, (_, i) => Math.sin(seed + i));
const vecN = (n: number, seed: number): number[] => Array.from({ length: n }, (_, i) => Math.sin(seed + i));

describe.skipIf(!process.env.LANCEDB_TEST)('LanceDBVectorStore（LANCEDB_TEST=1）', () => {
  it('add/search(文本+向量)/stats/delete/rebuild 全接口', async () => {
    const { LanceDBVectorStore } = await import('../../packages/retrieval/src/lancedb');
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'lancedb-'));
    const store: VectorStore = new LanceDBVectorStore(path.join(dir, 'test.lance'), { dim: DIM });

    await store.add(
      [
        makeChunk('doc-a:0', 'doc-a', '高温重载路段推荐 SBS 改性沥青与 SMA 级配。', 'knowledge', ['d-rutting']),
        makeChunk('doc-b:0', 'doc-b', '多雨地区水损害处治采用消石灰抗剥落剂。', 'knowledge', ['d-water-damage']),
      ],
      [vec(1), vec(2)],
    );
    const s = await store.stats();
    expect(s.count).toBe(2);
    expect(s.docTypes).toEqual({ knowledge: 2 });

    // 纯文本（BM25/FTS）检索
    const textHits = await store.search({ text: '消石灰', topK: 5 });
    expect(textHits.length).toBeGreaterThan(0);
    expect(textHits[0].chunkId).toBe('doc-b:0');
    expect(textHits[0].provenance.sourceDocId).toBe('doc-b');

    // 向量检索（余弦近邻）
    const vecHits = await store.search({ text: '', vector: vec(2), topK: 5 });
    expect(vecHits.length).toBeGreaterThan(0);
    expect(vecHits[0].chunkId).toBe('doc-b:0');

    // filter.docTypes 生效
    const filtered = await store.search({ text: '沥青', topK: 5, filter: { docTypes: ['standard'] } });
    expect(filtered).toEqual([]);

    // delete + rebuild
    await store.delete('doc-a');
    expect((await store.stats()).count).toBe(1);
    await store.rebuild();
    expect((await store.stats()).count).toBe(0);
  });

  it('dim=384 构造：add 384 维向量通过（与 multilingual-e5-small 对齐）', async () => {
    const { LanceDBVectorStore } = await import('../../packages/retrieval/src/lancedb');
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'lancedb-384-'));
    const store: VectorStore = new LanceDBVectorStore(path.join(dir, 'test384.lance'), { dim: 384 });

    const chunk = {
      schemaVersion: '1',
      chunkId: 'doc-384:0',
      text: 'e5-small 384 维嵌入测试文本。',
      docType: 'knowledge',
      tags: [] as string[],
      provenance: {
        sourceDocId: 'doc-384',
        contentHash: 'hash-384',
        embeddingModel: 'Xenova/multilingual-e5-small',
        modelVersion: 'fake-1',
        dim: 384,
        pipelineRev: 'testrev',
        embeddedAt: new Date().toISOString(),
      },
    };
    await store.add([chunk], [vecN(384, 7)]);
    expect((await store.stats()).count).toBe(1);
    const hits = await store.search({ text: '', vector: vecN(384, 7), topK: 5 });
    expect(hits[0].chunkId).toBe('doc-384:0');
  });

  it('dim 不匹配：add 报错', async () => {
    const { LanceDBVectorStore } = await import('../../packages/retrieval/src/lancedb');
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'lancedb-mismatch-'));
    const store: VectorStore = new LanceDBVectorStore(path.join(dir, 'test8.lance'), { dim: 8 });
    await expect(
      store.add([makeChunk('doc-x:0', 'doc-x', '维度不匹配测试。', 'knowledge')], [vecN(384, 1)]),
    ).rejects.toThrow(/向量维度不匹配/);
  });
});
