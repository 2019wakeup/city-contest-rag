import { describe, expect, it } from 'vitest';
import { DEFAULT_RRF_K, rrf } from '../src/fusion';

describe('rrf 融合', () => {
  it('并集齐全，分数为 1/(k+rank) 求和（k=60 数值断言）', () => {
    const rankings = [
      [
        { id: 'a', score: 1.0 },
        { id: 'b', score: 0.9 },
      ],
      [
        { id: 'b', score: 0.95 },
        { id: 'c', score: 0.8 },
      ],
    ];
    const fused = rrf(rankings, 60);
    expect(fused.map((x) => x.id)).toEqual(['b', 'a', 'c']);
    const byId = new Map(fused.map((x) => [x.id, x.score]));
    expect(byId.get('a')).toBeCloseTo(1 / 61);
    expect(byId.get('c')).toBeCloseTo(1 / 62);
    expect(byId.get('b')).toBeCloseTo(1 / 62 + 1 / 61);
  });

  it('空 ranking 忽略，默认 k=60', () => {
    const fused = rrf([[], [{ id: 'x', score: 1 }]]);
    expect(fused).toEqual([{ id: 'x', score: 1 / (DEFAULT_RRF_K + 1) }]);
  });

  it('平分时按 id 字典序稳定排序', () => {
    const fused = rrf([[{ id: 'b', score: 1 }], [{ id: 'a', score: 1 }]]);
    expect(fused.map((x) => x.id)).toEqual(['a', 'b']);
  });
});
