import { DatabaseSync } from 'node:sqlite';
import { CorpusChunkSchema, SearchHitSchema } from '@road-rec/contracts';
import type { CorpusChunk, SearchHit } from '@road-rec/contracts';
import type { VectorSearchQuery, VectorStore } from './types';
import { rrf } from './fusion';
import type { RankedItem } from './fusion';

/**
 * SQLite 降级实现（spec §4 防线 1：RETRIEVAL_BACKEND=sqlite）：
 * - FTS5(trigram) 表存 text，BM25 打分；trigram tokenizer 兼容中文子串检索；
 * - chunks 表存向量 JSON，KNN 用 JS 精确余弦（不引入原生 sqlite-vec）；
 * - search 融合 = RRF(BM25 top-40, 余弦 top-40) → filter 过滤 → 截 topK；
 * - rebuild 清空重建表。零原生依赖（Node 24 内置 node:sqlite）。
 */
export class SqliteVectorStore implements VectorStore {
  private readonly db: DatabaseSync;

  constructor(dbPath: string) {
    this.db = new DatabaseSync(dbPath);
    this.createSchema();
  }

  private createSchema(): void {
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS chunks (
        chunk_id TEXT PRIMARY KEY,
        doc_id TEXT NOT NULL,
        text TEXT NOT NULL,
        doc_type TEXT NOT NULL,
        tags TEXT NOT NULL,
        provenance TEXT NOT NULL,
        vector TEXT
      );
      CREATE INDEX IF NOT EXISTS idx_chunks_doc ON chunks(doc_id);
    `);
    this.db.exec(
      `CREATE VIRTUAL TABLE IF NOT EXISTS chunks_fts USING fts5(chunk_id UNINDEXED, text, tokenize = 'trigram');`,
    );
  }

  async add(chunks: CorpusChunk[], vectors: number[][]): Promise<void> {
    if (chunks.length !== vectors.length) {
      throw new Error(`chunks(${chunks.length}) 与 vectors(${vectors.length}) 数量不一致`);
    }
    const deleteFts = this.db.prepare('DELETE FROM chunks_fts WHERE chunk_id = ?');
    const insertChunk = this.db.prepare(
      'INSERT OR REPLACE INTO chunks (chunk_id, doc_id, text, doc_type, tags, provenance, vector) VALUES (?, ?, ?, ?, ?, ?, ?)',
    );
    const insertFts = this.db.prepare(
      'INSERT OR REPLACE INTO chunks_fts (chunk_id, text) VALUES (?, ?)',
    );
    this.db.exec('BEGIN');
    try {
      chunks.forEach((chunk, i) => {
        const parsed = CorpusChunkSchema.parse(chunk);
        // FTS5 虚表 INSERT OR REPLACE 等同 INSERT（无法按 UNINDEXED chunk_id 判重），
        // 先删旧行再插入，防止同 id 重写后旧文本残留可被命中（防静默检索漂移）。
        deleteFts.run(parsed.chunkId);
        insertChunk.run(
          parsed.chunkId,
          parsed.provenance.sourceDocId,
          parsed.text,
          parsed.docType,
          JSON.stringify(parsed.tags),
          JSON.stringify(parsed.provenance),
          vectors[i] ? JSON.stringify(vectors[i]) : null,
        );
        insertFts.run(parsed.chunkId, parsed.text);
      });
      this.db.exec('COMMIT');
    } catch (err) {
      this.db.exec('ROLLBACK');
      throw err;
    }
  }

  async search(q: VectorSearchQuery): Promise<SearchHit[]> {
    const bm25 = this.bm25Search(q.text, 40);
    const cosine = q.vector && q.vector.length > 0 ? this.cosineSearch(q.vector, 40) : [];
    const fused = rrf([bm25, cosine]);
    if (fused.length === 0) return [];

    const placeholders = fused.map(() => '?').join(', ');
    const rows = this.db
      .prepare(`SELECT chunk_id, doc_type, tags FROM chunks WHERE chunk_id IN (${placeholders})`)
      .all(...fused.map((f) => f.id)) as unknown as Array<{
      chunk_id: string;
      doc_type: string;
      tags: string;
    }>;

    const meta = new Map(rows.map((r) => [r.chunk_id, r]));
    const filtered = fused.filter(({ id }) => {
      const m = meta.get(id);
      if (!m) return false;
      if (q.filter?.docTypes && !q.filter.docTypes.includes(m.doc_type)) return false;
      if (q.filter?.tags && q.filter.tags.length > 0) {
        const tags: string[] = JSON.parse(m.tags) as string[];
        if (!q.filter.tags.some((t) => tags.includes(t))) return false;
      }
      return true;
    });

    const top = filtered.slice(0, q.topK);
    if (top.length === 0) return [];

    const topPlaceholders = top.map(() => '?').join(', ');
    const full = this.db
      .prepare(
        `SELECT chunk_id, text, doc_type, tags, provenance FROM chunks WHERE chunk_id IN (${topPlaceholders})`,
      )
      .all(...top.map((f) => f.id)) as unknown as Array<{
      chunk_id: string;
      text: string;
      doc_type: string;
      tags: string;
      provenance: string;
    }>;
    const fullMap = new Map(full.map((r) => [r.chunk_id, r]));

    return top.map(({ id, score }) => {
      const r = fullMap.get(id);
      if (!r) throw new Error(`chunk ${id} 元数据缺失`);
      return SearchHitSchema.parse({
        schemaVersion: '1',
        chunkId: r.chunk_id,
        text: r.text,
        docType: r.doc_type,
        tags: JSON.parse(r.tags),
        provenance: JSON.parse(r.provenance),
        score,
      });
    });
  }

  private bm25Search(text: string, limit: number): RankedItem[] {
    const q = text.trim();
    if (!q) return [];
    const tokens = q.split(/\s+/).filter(Boolean);
    // FTS 操作符出现（独立大写 AND/OR/NOT/NEAR）→ 整串按字面子串检索（R1-C4）
    if (tokens.some((t) => ['AND', 'OR', 'NOT', 'NEAR'].includes(t.toUpperCase()))) {
      return this.substringSearchLiteral(q, limit);
    }
    // trigram tokenizer 不支持 <3 字符查询 → 子串兜底（多词按任意词命中计分）
    if (tokens.some((t) => Array.from(t).length < 3)) return this.substringSearch(q, limit);
    // 中文长查询召回（金标准反馈）：按字符 trigram 展开为 OR——
    // 任意 3 字重叠即命中，bm25 加权；否则长短语 AND 语义在真实语料上恒为空集。
    const trigrams = [
      ...new Set(
        tokens
          .flatMap((t) => trigramsOf(t))
          .map((g) => `"${g.replace(/"/g, '""')}"`),
      ),
    ].join(' OR ');
    try {
      const rows = this.db
        .prepare(
          'SELECT chunk_id AS id, bm25(chunks_fts) AS score FROM chunks_fts WHERE chunks_fts MATCH ? ORDER BY score LIMIT ?',
        )
        .all(trigrams, limit) as unknown as Array<{ id: string; score: number | null }>;
      // bm25 越小越好 → 取负统一为"越大越好"
      return rows.map((r) => ({ id: r.id, score: typeof r.score === 'number' ? -r.score : 0 }));
    } catch {
      // FTS 语法异常（特殊字符等）→ 子串兜底
      return this.substringSearch(q, limit);
    }
  }

  private substringSearch(q: string, limit: number): RankedItem[] {
    const tokens = q.split(/\s+/).filter(Boolean);
    const rows = this.db
      .prepare('SELECT chunk_id AS id, text FROM chunks')
      .all() as unknown as Array<{ id: string; text: string }>;
    return rows
      .map((r) => {
        // 多词 = 任意词命中即召回；分数 = 各词出现次数总和
        const perToken = tokens.map((t) => countOccurrences(r.text, t));
        const matched = perToken.some((n) => n > 0);
        return {
          id: r.id,
          score: matched ? perToken.reduce((a, b) => a + b, 0) : -1,
          len: r.text.length,
        };
      })
      .filter((r) => r.score > 0)
      .sort((a, b) => b.score - a.score || a.len - b.len || a.id.localeCompare(b.id))
      .slice(0, limit)
      .map(({ id, score }) => ({ id, score }));
  }

  /** 整串字面子串检索（操作符查询兜底路径） */
  private substringSearchLiteral(q: string, limit: number): RankedItem[] {
    const rows = this.db
      .prepare('SELECT chunk_id AS id, text FROM chunks WHERE instr(text, ?) > 0')
      .all(q) as unknown as Array<{ id: string; text: string }>;
    return rows
      .map((r) => ({ id: r.id, score: countOccurrences(r.text, q), len: r.text.length }))
      .sort((a, b) => b.score - a.score || a.len - b.len || a.id.localeCompare(b.id))
      .slice(0, limit)
      .map(({ id, score }) => ({ id, score }));
  }

  private cosineSearch(vector: number[], limit: number): RankedItem[] {
    const rows = this.db
      .prepare('SELECT chunk_id AS id, vector FROM chunks WHERE vector IS NOT NULL')
      .all() as unknown as Array<{ id: string; vector: string }>;
    return rows
      .map((r) => ({ id: r.id, score: cosineSimilarity(vector, JSON.parse(r.vector) as number[]) }))
      .sort((a, b) => b.score - a.score || a.id.localeCompare(b.id))
      .slice(0, limit);
  }

  async delete(docId: string): Promise<void> {
    const rows = this.db
      .prepare('SELECT chunk_id FROM chunks WHERE doc_id = ?')
      .all(docId) as unknown as Array<{ chunk_id: string }>;
    this.db.prepare('DELETE FROM chunks WHERE doc_id = ?').run(docId);
    const delFts = this.db.prepare('DELETE FROM chunks_fts WHERE chunk_id = ?');
    for (const { chunk_id } of rows) delFts.run(chunk_id);
  }

  async rebuild(): Promise<void> {
    this.db.exec('DROP TABLE IF EXISTS chunks; DROP TABLE IF EXISTS chunks_fts;');
    this.createSchema();
  }

  async stats(): Promise<{ count: number; docTypes: Record<string, number> }> {
    const { n } = this.db.prepare('SELECT COUNT(*) AS n FROM chunks').get() as unknown as {
      n: number;
    };
    const rows = this.db
      .prepare('SELECT doc_type AS docType, COUNT(*) AS c FROM chunks GROUP BY doc_type')
      .all() as unknown as Array<{ docType: string; c: number }>;
    const docTypes: Record<string, number> = {};
    for (const r of rows) docTypes[r.docType] = r.c;
    return { count: n, docTypes };
  }

  close(): void {
    this.db.close();
  }
}

function countOccurrences(haystack: string, needle: string): number {
  let count = 0;
  let from = 0;
  for (;;) {
    const idx = haystack.indexOf(needle, from);
    if (idx === -1) return count;
    count += 1;
    from = idx + needle.length;
  }
}

/** 按 Unicode 字符切 trigram（≤3 字符即整词） */
function trigramsOf(token: string): string[] {
  const chars = Array.from(token);
  if (chars.length <= 3) return [chars.join('')];
  const out: string[] = [];
  for (let i = 0; i + 3 <= chars.length; i++) out.push(chars.slice(i, i + 3).join(''));
  return out;
}

function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length === 0 || a.length !== b.length) return 0;
  let dot = 0;
  let na = 0;
  let nb = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    na += a[i] * a[i];
    nb += b[i] * b[i];
  }
  if (na === 0 || nb === 0) return 0;
  return dot / (Math.sqrt(na) * Math.sqrt(nb));
}
