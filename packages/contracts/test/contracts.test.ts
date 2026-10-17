import { describe, expect, it } from 'vitest';
import type { z } from 'zod';
import {
  SCHEMA_VERSION,
  SceneInputSchema,
  TargetProfileSchema,
  FormulaSchema,
  FormulaPredictionSchema,
  CandidateSchema,
  EvidenceRefSchema,
  RecommendationReportSchema,
  ChatRequestSchema,
  CaseSeedSchema,
  KnowledgeEntrySchema,
  CorpusChunkSchema,
  SearchHitSchema,
  FIELD_REGISTRY,
  toJsonSchema,
} from '../src/index';

const validScene = {
  climate: { zone: '华南高温区', pgHigh: 76, pgLow: -22 },
  traffic: { level: '重交通', esal: 20_000_000 },
  pavement: { layer: '上面层', structure: '半刚性基层沥青路面' },
  distresses: [{ type: '车辙', severity: '重' }],
  constraints: { budget: 500, schedule: 30, env: '环保要求高', noise: '低噪' },
  notes: '演示场景',
};

const validChunk = {
  chunkId: 'k-binder-001:0:v1',
  text: 'SBS 改性沥青可显著提高混合料高温抗车辙性能。',
  docType: 'knowledge',
  tags: ['高温', '车辙'],
  provenance: {
    sourceDocId: 'k-binder-001',
    contentHash: 'abc123',
    embeddingModel: 'bge-m3',
    modelVersion: 'v1',
    dim: 1024,
    pipelineRev: 'abc1234',
    embeddedAt: '2026-10-17T00:00:00Z',
  },
};

const validFormula = {
  binder: { type: 'SBS改性沥青', grade: '70号', pg: 'PG 76-22' },
  modifier: { type: 'SBS', dosage: 4.5 },
  gradation: { type: 'SMA-13' },
  additives: [{ type: '木质素纤维', dosage: 0.3 }],
  oilStoneRatio: 6.1,
  airVoids: 4.0,
};

describe('contracts 契约包', () => {
  it('SceneInput 解析成功且保留未知字段（passthrough 前向兼容）', () => {
    const parsed = SceneInputSchema.parse({ ...validScene, extraField: 1, nested: { x: 2 } });
    expect(parsed.climate.zone).toBe('华南高温区');
    expect((parsed as unknown as Record<string, unknown>).extraField).toBe(1);
    expect(
      ((parsed as unknown as Record<string, unknown>).nested as { x: number }).x,
    ).toBe(2);
  });

  it('每个顶层 schema 都带 schemaVersion 且枚举为 1', () => {
    const topLevel: Array<[string, z.ZodObject<z.ZodRawShape>]> = [
      ['SceneInput', SceneInputSchema],
      ['TargetProfile', TargetProfileSchema],
      ['Formula', FormulaSchema],
      ['FormulaPrediction', FormulaPredictionSchema],
      ['Candidate', CandidateSchema],
      ['EvidenceRef', EvidenceRefSchema],
      ['RecommendationReport', RecommendationReportSchema],
      ['ChatRequest', ChatRequestSchema],
      ['CaseSeed', CaseSeedSchema],
      ['KnowledgeEntry', KnowledgeEntrySchema],
      ['CorpusChunk', CorpusChunkSchema],
      ['SearchHit', SearchHitSchema],
    ];
    for (const [name, schema] of topLevel) {
      expect(schema.shape, `${name} 缺少 schemaVersion`).toHaveProperty('schemaVersion');
    }
    // 缺省时补 1
    expect(SceneInputSchema.parse(validScene).schemaVersion).toBe(SCHEMA_VERSION);
    expect(SceneInputSchema.parse(validScene).schemaVersion).toBe('1');
    // 错误版本被拒绝
    expect(SceneInputSchema.safeParse({ ...validScene, schemaVersion: '2' }).success).toBe(false);
  });

  it('toJsonSchema 输出 JSON Schema 骨架', () => {
    const js = toJsonSchema(SceneInputSchema) as Record<string, unknown>;
    expect(js.$schema).toBe('http://json-schema.org/draft-07/schema#');
    expect(js.type).toBe('object');
    expect(js).toHaveProperty('properties');
  });

  it('FIELD_REGISTRY 覆盖表单 7 条必查路径且各有 label/control', () => {
    const requiredPaths = [
      'climate.zone',
      'climate.pgHigh',
      'climate.pgLow',
      'traffic.level',
      'distresses',
      'constraints.budget',
      'notes',
    ];
    for (const path of requiredPaths) {
      const def = FIELD_REGISTRY[path];
      expect(def, `FIELD_REGISTRY 缺少 ${path}`).toBeDefined();
      expect(def.label, `${path}.label`).toBeTypeOf('string');
      expect(def.control, `${path}.control`).toBeTypeOf('string');
    }
  });

  it('RecommendationReport 解析成功且保留未知字段（Review Focus #1）', () => {
    const report = {
      scene: validScene,
      targets: {
        targets: [{ perf: 'highTemp', value: 76, unit: '℃' }],
        priorities: [{ perf: 'highTemp', weight: 0.5 }],
      },
      candidates: [
        {
          id: 'cand-1',
          formula: validFormula,
          predictions: [{ perf: 'highTemp', value: 82, ciLow: 80, ciHigh: 84, unit: '℃' }],
          radar: {
            highTemp: 88,
            lowTemp: 70,
            fatigue: 75,
            waterStability: 85,
            lcc: 60,
            carbon: 55,
            expectedLife: 80,
            constructability: 90,
          },
          lcc: 120,
          carbon: 15,
          expectedLife: 12,
          score: 0.82,
          evidenceIds: [validChunk.chunkId],
        },
      ],
      evidence: [{ ...validChunk, score: 0.9 }],
      benchmark: [{ label: '高温性能', unit: '℃', baseline: 70, candidates: { 'cand-1': 82 } }],
      sections: [],
      llmStatus: 'degraded',
      adapterMode: { a: 'mock', c: 'mock' },
      warnings: [],
      steps: [{ name: 'parse', ms: 1 }],
    };
    const parsed = RecommendationReportSchema.parse({ ...report, futureField: 'x' });
    expect(parsed.candidates).toHaveLength(1);
    expect(parsed.llmStatus).toBe('degraded');
    expect(parsed.adapterMode).toEqual({ a: 'mock', c: 'mock' });
    expect((parsed as unknown as Record<string, unknown>).futureField).toBe('x');
  });
});
