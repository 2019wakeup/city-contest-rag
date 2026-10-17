import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { SqliteVectorStore } from '@road-rec/retrieval';
import { createVectorStore, resolveEmbeddingModel } from '../src/config';

describe('EMBEDDING_MODEL 启动参数解析', () => {
  it('未设置 → 默认 bge-m3', () => {
    expect(resolveEmbeddingModel({})).toBe('bge-m3');
  });

  it('合法值 bge-m3 / multilingual-e5-small 透传', () => {
    expect(resolveEmbeddingModel({ EMBEDDING_MODEL: 'bge-m3' })).toBe('bge-m3');
    expect(resolveEmbeddingModel({ EMBEDDING_MODEL: 'multilingual-e5-small' })).toBe(
      'multilingual-e5-small',
    );
  });

  it('非法值 → 抛错（启动退出）', () => {
    expect(() => resolveEmbeddingModel({ EMBEDDING_MODEL: 'gpt-99' })).toThrow(
      /EMBEDDING_MODEL/,
    );
  });
});

describe('createVectorStore（R3-C2：先 embedder 后 store，dim 对齐）', () => {
  let dir: string;

  afterEach(() => {
    if (dir) rmSync(dir, { recursive: true, force: true });
  });

  beforeEach(() => {
    dir = mkdtempSync(join(tmpdir(), 't8store-'));
  });

  it('lancedb：store 构造器收到的 dim == embedder.dim', () => {
    const store = createVectorStore({ backend: 'lancedb', indexDir: dir, dim: 384 });
    expect((store as unknown as { dim: number }).dim).toBe(384);
  });

  it('lancedb：embedder 失败（dim null）→ 默认 dim 1024', () => {
    const store = createVectorStore({ backend: 'lancedb', indexDir: dir, dim: null });
    expect((store as unknown as { dim: number }).dim).toBe(1024);
  });

  it('sqlite 后端 → SqliteVectorStore（不受 dim 影响）', () => {
    const store = createVectorStore({ backend: 'sqlite', indexDir: dir, dim: 384 });
    expect(store).toBeInstanceOf(SqliteVectorStore);
  });
});
