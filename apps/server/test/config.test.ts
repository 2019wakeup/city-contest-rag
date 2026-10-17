import { describe, expect, it } from 'vitest';
import { resolveEmbeddingModel } from '../src/config';

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
