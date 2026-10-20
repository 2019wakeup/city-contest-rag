import { describe, expect, it } from 'vitest';
import { bigramExpand, synonymExpand } from '../query-expansion-eval';

describe('查询扩展辅助函数（D6）', () => {
  it('bigramExpand：连续中文串拆 2-gram 追加', () => {
    const out = bigramExpand('改性沥青');
    expect(out).toBe('改性沥青 改性 性沥 沥青');
  });

  it('bigramExpand：短串与 ASCII/空格原样保留', () => {
    expect(bigramExpand('车辙 SMA')).toBe('车辙 SMA');
    expect(bigramExpand('TSR 试验')).toBe('TSR 试验');
  });

  it('synonymExpand：命中关键词追加英文/别名', () => {
    const out = synonymExpand('车辙与改性沥青');
    expect(out).toContain('rutting');
    expect(out).toContain('SBS');
    expect(out).toContain('改性');
    // 未命中词不引入
    expect(synonymExpand('降噪')).not.toContain('rutting');
  });

  it('synonymExpand：未命中任何词时等于原查询', () => {
    expect(synonymExpand('XYZABC')).toBe('XYZABC');
  });
});
