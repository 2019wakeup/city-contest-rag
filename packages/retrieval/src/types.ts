import type { CorpusChunk, SearchHit } from '@road-rec/contracts';

/**
 * VectorStore 统一检索接口（spec §4 防线 1：接口抽象，业务代码不得直接依赖具体引擎）。
 * `search` 的 `vector` 省略 = 纯 BM25 检索（金标准评估 / 无 embedding 环境）。
 */
export interface VectorSearchQuery {
  vector?: number[];
  text: string;
  topK: number;
  filter?: {
    docTypes?: string[];
    tags?: string[];
  };
}

export interface VectorStore {
  add(chunks: CorpusChunk[], vectors: number[][]): Promise<void>;
  search(q: VectorSearchQuery): Promise<SearchHit[]>;
  delete(docId: string): Promise<void>;
  rebuild(): Promise<void>;
  stats(): Promise<{ count: number; docTypes: Record<string, number> }>;
}
