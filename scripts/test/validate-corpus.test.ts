import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { validateCorpus, type CorpusReport } from '../validate-corpus';

const REAL_CORPUS = path.resolve(__dirname, '../../data/corpus');

function tmpCorpus(files: Record<string, unknown>): string {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'corpus-'));
  for (const [rel, content] of Object.entries(files)) {
    const p = path.join(dir, rel);
    fs.mkdirSync(path.dirname(p), { recursive: true });
    fs.writeFileSync(p, JSON.stringify(content, null, 2));
  }
  return dir;
}

const VALID_TAGS = {
  tags: [
    { id: 'c-hot', label: '高温', kind: 'climate' },
    { id: 'd-rutting', label: '车辙', kind: 'distress' },
  ],
};

const VALID_SCENE = {
  schemaVersion: '1',
  climate: { zone: '1-4', pgHigh: 76, pgLow: -10 },
  traffic: { level: 'heavy', esal: 30000000 },
  pavement: { layer: 'surface', structure: '半刚性基层沥青路面' },
  distresses: [{ type: 'rutting', severity: 'severe' }],
  constraints: { budget: 500, schedule: 30, env: 'normal', noise: 'none' },
  notes: '',
};

const VALID_FORMULAS = [
  {
    binder: { type: 'SBS改性沥青', grade: 'I-D', pg: 'PG76-22' },
    modifier: { type: 'SBS', dosage: 4.5 },
    gradation: { type: 'SMA-13' },
    additives: [{ type: '木质素纤维', dosage: 0.3 }],
    oilStoneRatio: 6.0,
    airVoids: 4.0,
  },
  {
    binder: { type: '基质沥青', grade: '70#', pg: 'PG64-22' },
    modifier: { type: '无', dosage: 0 },
    gradation: { type: 'AC-13' },
    additives: [],
    oilStoneRatio: 5.0,
    airVoids: 3.5,
  },
];

const VALID_ENTRY = {
  schemaVersion: '1',
  id: 'k-binder-001',
  category: 'binder',
  title: '基质沥青',
  text: '基质沥青是通用基准胶结料。',
  name: '基质沥青',
  type: '沥青品种',
  sourceRef: 'JTG F40-2004',
  relations: [
    {
      property: '成本',
      effect: '基准成本',
      direction: '+',
      magnitude: '成本最低',
      applicableScene: ['d-rutting'],
      sourceRef: 'JTG F40-2004',
    },
  ],
};

describe('validate-corpus', () => {
  it('真实语料目录整体校验通过且统计达标', () => {
    const r: CorpusReport = validateCorpus(REAL_CORPUS);
    expect(r.errors).toEqual([]);
    expect(r.ok).toBe(true);
    expect(r.stats.entries).toBeGreaterThanOrEqual(40);
    expect(r.stats.cases).toBe(5);
    expect(r.stats.tags).toBeGreaterThanOrEqual(20);
    expect(r.stats.standards).toBeGreaterThanOrEqual(8);
    expect(r.stats.literature).toBeGreaterThanOrEqual(140);
  });

  it('真实语料条目 id 与 sourceRef 合法', () => {
    const r = validateCorpus(REAL_CORPUS);
    expect(r.errors.filter((e) => e.includes('id') || e.includes('sourceRef'))).toEqual([]);
  });

  it('拒绝非法 id 格式的条目', () => {
    const dir = tmpCorpus({
      'scene-tags.json': VALID_TAGS,
      'knowledge/entries.json': [{ ...VALID_ENTRY, id: 'k-binder-abc' }],
      'cases/cases.json': [],
    });
    const r = validateCorpus(dir);
    expect(r.ok).toBe(false);
    expect(r.errors.some((e) => e.includes('k-binder-abc'))).toBe(true);
  });

  it('拒绝缺失 sourceRef 的条目', () => {
    const dir = tmpCorpus({
      'scene-tags.json': VALID_TAGS,
      'knowledge/entries.json': [{ ...VALID_ENTRY, sourceRef: '' }],
      'cases/cases.json': [],
    });
    const r = validateCorpus(dir);
    expect(r.ok).toBe(false);
    expect(r.errors.some((e) => e.includes('sourceRef'))).toBe(true);
  });

  it('拒绝方向非 ± 的关系', () => {
    const bad = structuredClone(VALID_ENTRY);
    (bad.relations[0] as Record<string, unknown>).direction = '↑';
    const dir = tmpCorpus({
      'scene-tags.json': VALID_TAGS,
      'knowledge/entries.json': [bad],
      'cases/cases.json': [],
    });
    const r = validateCorpus(dir);
    expect(r.ok).toBe(false);
    expect(r.errors.some((e) => e.includes('direction'))).toBe(true);
  });

  it('拒绝引用未定义标签的案例', () => {
    const dir = tmpCorpus({
      'scene-tags.json': VALID_TAGS,
      'knowledge/entries.json': [],
      'cases/cases.json': [
        {
          schemaVersion: '1',
          id: 'case-01',
          title: '测试案例',
          summary: '测试',
          tags: ['c-hot', 'd-unknown-tag'],
          scene: VALID_SCENE,
          expected: { formulas: VALID_FORMULAS },
        },
      ],
    });
    const r = validateCorpus(dir);
    expect(r.ok).toBe(false);
    expect(r.errors.some((e) => e.includes('d-unknown-tag'))).toBe(true);
  });

  it('拒绝 scene 必填字段缺失的案例', () => {
    const dir = tmpCorpus({
      'scene-tags.json': VALID_TAGS,
      'knowledge/entries.json': [],
      'cases/cases.json': [
        {
          schemaVersion: '1',
          id: 'case-01',
          title: '测试',
          summary: '测试',
          scene: { climate: { zone: '1-4' } },
          expected: { formulas: VALID_FORMULAS },
        },
      ],
    });
    const r = validateCorpus(dir);
    expect(r.ok).toBe(false);
    expect(r.errors.some((e) => e.includes('case-01'))).toBe(true);
  });

  it('拒绝无条文分节的规范文件', () => {
    const dir = tmpCorpus({
      'scene-tags.json': VALID_TAGS,
      'knowledge/entries.json': [],
      'cases/cases.json': [],
      'standards/empty.md': '只有正文没有条文标题',
    });
    const r = validateCorpus(dir);
    expect(r.ok).toBe(false);
    expect(r.errors.some((e) => e.includes('empty.md'))).toBe(true);
  });
});
