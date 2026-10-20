import { describe, expect, it } from 'vitest';
import { DEFAULT_RRF_K, parseHybridWeights, rrf } from '../src/fusion';

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

  it('B6 加权：weights=[2, 0.5] 时分数 = w/(k+rank)', () => {
    const fused = rrf([[{ id: 'a', score: 1 }], [{ id: 'b', score: 1 }]], 60, [2, 0.5]);
    expect(fused.map((x) => x.id)).toEqual(['a', 'b']);
    expect(fused[0].score).toBeCloseTo(2 / 61);
    expect(fused[1].score).toBeCloseTo(0.5 / 61);
  });

  it('B6 默认兼容：不传 weights 与 [1,1] 等价', () => {
    const rankings = [[{ id: 'a', score: 1 }], [{ id: 'b', score: 1 }]];
    expect(rrf(rankings)).toEqual(rrf(rankings, 60, [1, 1]));
  });
});

describe('B6 parseHybridWeights', () => {
  it('合法 "1.5,0.8" → [1.5, 0.8]；空/非法 → [1, 1] 默认', () => {
    expect(parseHybridWeights({ HYBRID_WEIGHTS: '1.5,0.8' })).toEqual([1.5, 0.8]);
    expect(parseHybridWeights({})).toEqual([1, 1]);
    expect(parseHybridWeights({ HYBRID_WEIGHTS: 'abc' })).toEqual([1, 1]);
    expect(parseHybridWeights({ HYBRID_WEIGHTS: '2' })).toEqual([1, 1]);
  });
});
