import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import type { CorpusChunk, DocType } from '@road-rec/contracts';
import { SqliteVectorStore } from '../src/sqlite';

function makeChunk(
  chunkId: string,
  text: string,
  docType: DocType = 'knowledge',
  tags: string[] = [],
): CorpusChunk {
  return {
    schemaVersion: '1',
    chunkId,
    text,
    docType,
    tags,
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

describe('SqliteVectorStore', () => {
  let store: SqliteVectorStore;

  beforeEach(() => {
    store = new SqliteVectorStore(':memory:');
  });

  afterEach(() => {
    store.close();
  });

  it('add 两条 → stats.count=2；delete 后 =1；rebuild 后 =0', async () => {
    await store.add(
      [
        makeChunk('doc-a:0:v1', 'SBS改性沥青提高高温抗车辙性能'),
        makeChunk('doc-b:0:v1', '橡胶沥青提升低温抗裂性能'),
      ],
      [
        [1, 0],
        [0, 1],
      ],
    );
    expect(await store.stats()).toMatchObject({ count: 2 });

    await store.delete('doc-a');
    expect((await store.stats()).count).toBe(1);

    await store.rebuild();
    expect(await store.stats()).toEqual({ count: 0, docTypes: {} });
  });

  it('纯 BM25 检索（不传 vector）：命中预期 id 且 score 降序', async () => {
    await store.add(
      [
        makeChunk('doc-a:0:v1', 'SBS改性沥青显著提高混合料高温抗车辙性能'),
        makeChunk('doc-b:0:v1', '橡胶沥青改善低温抗裂性能'),
        makeChunk('doc-c:0:v1', '抗车辙性能不足时应掺加改性剂'),
      ],
      [
        [1, 0],
        [0, 1],
        [1, 1],
      ],
    );
    const hits = await store.search({ text: '高温抗车辙性能', topK: 5 });
    expect(hits.map((h) => h.chunkId)).toContain('doc-a:0:v1');
    expect(hits[0].chunkId).toBe('doc-a:0:v1');
    expect(hits.map((h) => h.chunkId)).not.toContain('doc-b:0:v1');
    for (let i = 1; i < hits.length; i++) {
      expect(hits[i - 1].score).toBeGreaterThanOrEqual(hits[i].score);
    }
    expect(hits[0].schemaVersion).toBe('1');
    expect(hits[0].provenance.sourceDocId).toBe('doc-a');
  });

  it('filter.docTypes 生效：只返回指定类型', async () => {
    await store.add(
      [
        makeChunk('doc-a:0:v1', 'SBS改性沥青提高高温抗车辙性能', 'knowledge', ['高温', '车辙']),
        makeChunk('std-1:0:v1', 'SMA-13级配适用于高温重载交通', 'standard', ['高温']),
      ],
      [
        [1, 0],
        [0, 1],
      ],
    );
    const hits = await store.search({
      text: '高温',
      topK: 10,
      filter: { docTypes: ['standard'] },
    });
    expect(hits.length).toBeGreaterThan(0);
    expect(hits.every((h) => h.docType === 'standard')).toBe(true);
    expect(hits.map((h) => h.chunkId)).toContain('std-1:0:v1');
  });

  it('向量检索：与查询向量更近的 chunk 排前（RRF 融合）', async () => {
    await store.add(
      [makeChunk('doc-a:0:v1', 'A chunk'), makeChunk('doc-b:0:v1', 'B chunk')],
      [
        [1, 0],
        [0, 1],
      ],
    );
    const hits = await store.search({ text: '无关词', vector: [0, 1], topK: 5 });
    expect(hits[0].chunkId).toBe('doc-b:0:v1');
  });

  it('短中文 query 走子串兜底仍命中（trigram 不支持 <3 字符）', async () => {
    await store.add([makeChunk('doc-a:0:v1', '路面出现严重车辙病害')], [[1, 0]]);
    const hits = await store.search({ text: '车辙', topK: 5 });
    expect(hits.map((h) => h.chunkId)).toContain('doc-a:0:v1');
  });

  it('filter.tags 生效：命中任一标签的 chunk 才返回', async () => {
    await store.add(
      [
        makeChunk('doc-a:0:v1', '车辙处治材料', 'knowledge', ['高温']),
        makeChunk('doc-b:0:v1', '低温开裂材料', 'knowledge', ['低温']),
      ],
      [
        [1, 0],
        [0, 1],
      ],
    );
    const hits = await store.search({ text: '材料', topK: 10, filter: { tags: ['高温'] } });
    expect(hits.map((h) => h.chunkId)).toEqual(['doc-a:0:v1']);
  });

  it('add 时 vectors 与 chunks 数量不一致抛错', async () => {
    await expect(store.add([makeChunk('doc-a:0:v1', 'x')], [])).rejects.toThrow();
  });

  it('同 chunk_id 重写文本后旧文本不再命中（防静默检索漂移，R1-C1）', async () => {
    await store.add([makeChunk('doc-a:0:v1', '旧文本：水稳性能增强剂')], [[1, 0]]);
    // 同 id 重写（contentHash 变更后的重入库路径）
    await store.add([makeChunk('doc-a:0:v1', '新文本：高温抗车辙改性剂')], [[0, 1]]);
    expect((await store.stats()).count).toBe(1);

    const hitsOld = await store.search({ text: '水稳性能', topK: 5 });
    expect(hitsOld.map((h) => h.chunkId)).not.toContain('doc-a:0:v1');

    const hitsNew = await store.search({ text: '高温抗车辙', topK: 5 });
    expect(hitsNew.map((h) => h.chunkId)).toContain('doc-a:0:v1');
  });

  it('MATCH 查询中的英文操作符按字面短语转义（R1-C4）', async () => {
    await store.add(
      [
        makeChunk('doc-a:0:v1', 'A 与 B 双掺方案'),
        makeChunk('doc-b:0:v1', 'A AND B 双掺方案'),
      ],
      [
        [1, 0],
        [0, 1],
      ],
    );
    const hits = await store.search({ text: 'A AND B', topK: 5 });
    expect(hits.map((h) => h.chunkId)).toContain('doc-b:0:v1');
    expect(hits.map((h) => h.chunkId)).not.toContain('doc-a:0:v1');
  });
});
