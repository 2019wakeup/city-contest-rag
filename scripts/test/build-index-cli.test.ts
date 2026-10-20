import { describe, expect, it } from 'vitest';
import { EMBEDDING_MODELS, resolveCliOptions } from '../build-index';

describe('build-index CLI 参数解析（C4）', () => {
  it('默认参数：backend=lancedb、model=bge-m3、rebuild=false', () => {
    const r = resolveCliOptions([], {});
    expect(r).toEqual({ rebuild: false, backend: 'lancedb', model: 'bge-m3' });
  });

  it('显式参数解析', () => {
    const r = resolveCliOptions(['--rebuild', '--backend=sqlite', '--model=multilingual-e5-small'], {});
    expect(r).toEqual({ rebuild: true, backend: 'sqlite', model: 'multilingual-e5-small' });
  });

  it('环境变量兜底', () => {
    const r = resolveCliOptions([], { RETRIEVAL_BACKEND: 'sqlite', EMBEDDING_MODEL: 'multilingual-e5-small' });
    expect(r).toEqual({ rebuild: false, backend: 'sqlite', model: 'multilingual-e5-small' });
  });

  it('非法 model 明确报错退出', () => {
    expect(() => resolveCliOptions(['--model=llama-3'], {})).toThrow(/embedding 模型/);
    expect(() => resolveCliOptions(['--model=llama-3'], {})).toThrow(/bge-m3/);
  });

  it('非法 backend 明确报错退出', () => {
    expect(() => resolveCliOptions(['--backend=chroma'], {})).toThrow(/backend/);
  });

  it('模型枚举含三个约定模型（D5：+ multilingual-e5-base）', () => {
    expect(EMBEDDING_MODELS).toEqual(['bge-m3', 'multilingual-e5-small', 'multilingual-e5-base']);
    expect(resolveCliOptions(['--model=multilingual-e5-base'], {}).model).toBe('multilingual-e5-base');
  });

  it('--db-path 解析（D5 双索引实验：建到独立目录）', () => {
    const r = resolveCliOptions(['--backend=lancedb', '--model=multilingual-e5-base', '--db-path=data/index/lancedb-e5base'], {});
    expect(r.backend).toBe('lancedb');
    expect(r.model).toBe('multilingual-e5-base');
    expect(r.dbPath).toBe('data/index/lancedb-e5base');
  });
});
