/**
 * LanceDB VectorStore 实现（T4，默认引擎，spec D3 / RETRIEVAL_BACKEND=lancedb）。
 *
 * - 表 `chunks`：chunkId/docId/text/docType/tags(JSON)/provenance(JSON)/vector(FixedSizeList<Float32, dim>)
 * - FTS 索引（ngram 2-6 中文友好）+ 向量检索，RRF 融合复用 ./fusion（与 SqliteVectorStore 同口径）
 * - add 采用"先删同 chunkId 再插入"实现幂等覆盖（与 SQLite 端 INSERT OR REPLACE 语义对齐）
 * - 构造器同步返回（不抛 async 初始化）：首次操作时懒初始化连接与表。
 */
import * as lancedb from '@lancedb/lancedb';
import { CorpusChunkSchema, SearchHitSchema } from '@road-rec/contracts';
import type { CorpusChunk, SearchHit } from '@road-rec/contracts';
import { rrf } from './fusion';
import type { RankedItem } from './fusion';
import type { VectorSearchQuery, VectorStore } from './types';

const TABLE_NAME = 'chunks';

interface Row {
  chunkId: string;
  docId: string;
  text: string;
  docType: string;
  tags: string;
  provenance: string;
  vector: number[];
  _score?: number;
  _distance?: number;
}

export interface LanceDBVectorStoreOptions {
  /** 向量维度（与 embedder.dim 一致；换模型维度变化时 buildIndex 会强制重建表） */
  dim?: number;
}

export class LanceDBVectorStore implements VectorStore {
  private readonly dbPath: string;
  private readonly dim: number;
  private initPromise: Promise<{ conn: lancedb.Connection; table: lancedb.Table }> | null = null;

  constructor(dbPath: string, options: LanceDBVectorStoreOptions = {}) {
    this.dbPath = dbPath;
    this.dim = options.dim ?? 1024;
  }

  private init(): Promise<{ conn: lancedb.Connection; table: lancedb.Table }> {
    if (!this.initPromise) {
      this.initPromise = this.doInit();
    }
    return this.initPromise;
  }

  private async doInit(): Promise<{ conn: lancedb.Connection; table: lancedb.Table }> {
    const conn = await lancedb.connect(this.dbPath);
    const names = await conn.tableNames();
    let table: lancedb.Table;
    if (names.includes(TABLE_NAME)) {
      table = await conn.openTable(TABLE_NAME);
    } else {
      // 空表无法推断 schema（lancedb：empty input 需 schema）→ 用 dummy 行建表再删除。
      // makeArrowTable 默认把名为 vector 的列转成 FixedSizeList<Float32>（官方约定）。
      const dummy = {
        chunkId: '__init__',
        docId: '__init__',
        text: '',
        docType: 'knowledge',
        tags: '[]',
        provenance: '{}',
        vector: new Array<number>(this.dim).fill(0),
      };
      table = await conn.createTable(TABLE_NAME, lancedb.makeArrowTable([dummy]), { mode: 'create' });
      await table.delete("chunkId = '__init__'");
      await table.createIndex('text', {
        config: lancedb.Index.fts({
          baseTokenizer: 'ngram',
          ngramMinLength: 2,
          ngramMaxLength: 6,
          lowercase: true,
        }),
      });
    }
    return { conn, table };
  }

  async add(chunks: CorpusChunk[], vectors: number[][]): Promise<void> {
    if (chunks.length !== vectors.length) {
      throw new Error(`chunks(${chunks.length}) 与 vectors(${vectors.length}) 数量不一致`);
    }
    if (chunks.length === 0) return;
    const { table } = await this.init();
    const rows: Record<string, unknown>[] = chunks.map((chunk, i) => {
      const parsed = CorpusChunkSchema.parse(chunk);
      if (vectors[i].length !== this.dim) {
        throw new Error(`向量维度不匹配：表 dim=${this.dim}，实际 ${vectors[i].length}（chunk ${parsed.chunkId}）`);
      }
      return {
        chunkId: parsed.chunkId,
        docId: parsed.provenance.sourceDocId,
        text: parsed.text,
        docType: parsed.docType,
        tags: JSON.stringify(parsed.tags),
        provenance: JSON.stringify(parsed.provenance),
        vector: vectors[i],
      };
    });
    // 幂等覆盖：先删同 chunkId 旧行（与 SQLite 后端 INSERT OR REPLACE 语义对齐）
    for (const r of rows) {
      await table.delete(`chunkId = '${escapeSql(r.chunkId as string)}'`);
    }
    await table.add(rows);
  }

  async search(q: VectorSearchQuery): Promise<SearchHit[]> {
    const { table } = await this.init();
    const rankings: RankedItem[][] = [];

    if (q.text && q.text.trim()) {
      const ftsRows = (await table
        .search(q.text.trim(), 'fts', 'text')
        .limit(40)
        .toArray()) as Row[];
      rankings.push(ftsRows.map((r) => ({ id: r.chunkId, score: r._score ?? 0 })));
    }
    if (q.vector && q.vector.length > 0) {
      const vecRows = (await table
        .vectorSearch(new Float32Array(q.vector))
        .limit(40)
        .toArray()) as Row[];
      rankings.push(vecRows.map((r) => ({ id: r.chunkId, score: r._distance ?? 0 })));
    }

    const fused = rrf(rankings);
    if (fused.length === 0) return [];

    const fetched = (await table.query().toArray()) as Row[];
    const byChunkId = new Map(fetched.map((r) => [r.chunkId, r]));

    const hits: SearchHit[] = [];
    for (const { id, score } of fused) {
      const row = byChunkId.get(id);
      if (!row) continue;
      if (q.filter?.docTypes && !q.filter.docTypes.includes(row.docType)) continue;
      if (q.filter?.tags && q.filter.tags.length > 0) {
        const tags = JSON.parse(row.tags) as string[];
        if (!q.filter.tags.some((t) => tags.includes(t))) continue;
      }
      hits.push(
        SearchHitSchema.parse({
          schemaVersion: '1',
          chunkId: row.chunkId,
          text: row.text,
          docType: row.docType,
          tags: JSON.parse(row.tags),
          provenance: JSON.parse(row.provenance),
          score,
        }),
      );
      if (hits.length >= q.topK) break;
    }
    return hits;
  }

  async delete(docId: string): Promise<void> {
    const { table } = await this.init();
    await table.delete(`docId = '${escapeSql(docId)}'`);
  }

  async rebuild(): Promise<void> {
    const { conn } = await this.init();
    await conn.dropTable(TABLE_NAME);
    this.initPromise = null;
    await this.init();
  }

  async stats(): Promise<{ count: number; docTypes: Record<string, number> }> {
    const { table } = await this.init();
    const count = await table.countRows();
    const rows = (await table.query().select(['docType']).toArray()) as Row[];
    const docTypes: Record<string, number> = {};
    for (const r of rows) docTypes[r.docType] = (docTypes[r.docType] ?? 0) + 1;
    return { count, docTypes };
  }
}

function escapeSql(value: string): string {
  return value.replace(/'/g, "''");
}
