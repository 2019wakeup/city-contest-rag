import { z } from 'zod';

/**
 * 契约版本。全局约束：所有 API 消息 schema 带 schemaVersion: '1' 且 .passthrough()。
 * 演进规则（spec §7）：只增不删，新字段一律 optional，删除走弃用标记。
 */
export const SCHEMA_VERSION = '1' as const;

const schemaVersionField = () => z.literal(SCHEMA_VERSION).default(SCHEMA_VERSION);

// P0 扩展（向后兼容）：table=文献/规范定量表格块；literature-full=文献全文章节块
export const DocTypeSchema = z.enum([
  'knowledge',
  'standard',
  'literature',
  'enterprise',
  'table',
  'literature-full',
]);
export type DocType = z.infer<typeof DocTypeSchema>;

// ---------------------------------------------------------------------------
// 场景输入（模块 A 入参 / 主流程第一步）
// ---------------------------------------------------------------------------

export const DistressSchema = z
  .object({
    type: z.string(),
    severity: z.string(),
  })
  .passthrough();
export type Distress = z.infer<typeof DistressSchema>;

export const SceneInputSchema = z
  .object({
    schemaVersion: schemaVersionField(),
    climate: z
      .object({
        zone: z.string(),
        pgHigh: z.number(),
        pgLow: z.number(),
      })
      .passthrough(),
    traffic: z
      .object({
        level: z.string(),
        esal: z.number(),
      })
      .passthrough(),
    pavement: z
      .object({
        layer: z.string(),
        structure: z.string(),
      })
      .passthrough(),
    distresses: z.array(DistressSchema),
    constraints: z
      .object({
        budget: z.number(),
        schedule: z.number(),
        env: z.string(),
        noise: z.string(),
      })
      .passthrough(),
    notes: z.string(),
  })
  .passthrough();
export type SceneInput = z.infer<typeof SceneInputSchema>;

// ---------------------------------------------------------------------------
// 模块 A 输出：目标性能 + 优先级权重
// ---------------------------------------------------------------------------

export const PerfTargetSchema = z
  .object({
    perf: z.string(),
    value: z.number(),
    unit: z.string(),
  })
  .passthrough();
export type PerfTarget = z.infer<typeof PerfTargetSchema>;

export const PrioritySchema = z
  .object({
    perf: z.string(),
    weight: z.number(),
  })
  .passthrough();
export type Priority = z.infer<typeof PrioritySchema>;

export const TargetProfileSchema = z
  .object({
    schemaVersion: schemaVersionField(),
    targets: z.array(PerfTargetSchema),
    priorities: z.array(PrioritySchema),
  })
  .passthrough();
export type TargetProfile = z.infer<typeof TargetProfileSchema>;

// ---------------------------------------------------------------------------
// 配方（模块 C 入参）
// ---------------------------------------------------------------------------

export const BinderSchema = z
  .object({
    type: z.string(),
    grade: z.string(),
    pg: z.string(),
  })
  .passthrough();
export type Binder = z.infer<typeof BinderSchema>;

export const ModifierSchema = z
  .object({
    type: z.string(),
    dosage: z.number(),
  })
  .passthrough();
export type Modifier = z.infer<typeof ModifierSchema>;

export const GradationSchema = z
  .object({
    type: z.string(),
  })
  .passthrough();
export type Gradation = z.infer<typeof GradationSchema>;

export const AdditiveSchema = z
  .object({
    type: z.string(),
    dosage: z.number(),
  })
  .passthrough();
export type Additive = z.infer<typeof AdditiveSchema>;

export const ConstructionSchema = z
  .object({
    mixingTemp: z.number().optional(),
    pavingTemp: z.number().optional(),
    compaction: z.string().optional(),
  })
  .passthrough();
export type Construction = z.infer<typeof ConstructionSchema>;

export const FormulaSchema = z
  .object({
    schemaVersion: schemaVersionField(),
    binder: BinderSchema,
    modifier: ModifierSchema,
    gradation: GradationSchema,
    additives: z.array(AdditiveSchema),
    oilStoneRatio: z.number(),
    airVoids: z.number(),
    construction: ConstructionSchema.optional(),
  })
  .passthrough();
export type Formula = z.infer<typeof FormulaSchema>;

// ---------------------------------------------------------------------------
// 模块 C 输出：预测值 + 置信区间（可选）+ 可解释性（可选）
// 部分可用语义：缺 ciLow/ciHigh 不整体失败（spec §7.5）
// ---------------------------------------------------------------------------

export const PredictionSchema = z
  .object({
    perf: z.string(),
    value: z.number(),
    ciLow: z.number().optional(),
    ciHigh: z.number().optional(),
    unit: z.string(),
  })
  .passthrough();
export type Prediction = z.infer<typeof PredictionSchema>;

export const ExplanationSchema = z
  .object({
    feature: z.string(),
    contribution: z.number(),
  })
  .passthrough();
export type Explanation = z.infer<typeof ExplanationSchema>;

export const FormulaPredictionSchema = z
  .object({
    schemaVersion: schemaVersionField(),
    formula: FormulaSchema,
    predictions: z.array(PredictionSchema),
    explanations: z.array(ExplanationSchema).optional(),
  })
  .passthrough();
export type FormulaPrediction = z.infer<typeof FormulaPredictionSchema>;

// ---------------------------------------------------------------------------
// 语料与检索（provenance 四道防线之三）
// ---------------------------------------------------------------------------

export const ProvenanceSchema = z
  .object({
    sourceDocId: z.string(),
    contentHash: z.string(),
    embeddingModel: z.string(),
    modelVersion: z.string(),
    dim: z.number(),
    pipelineRev: z.string(),
    embeddedAt: z.string(),
  })
  .passthrough();
export type Provenance = z.infer<typeof ProvenanceSchema>;

export const CorpusChunkSchema = z
  .object({
    schemaVersion: schemaVersionField(),
    chunkId: z.string(),
    text: z.string(),
    docType: DocTypeSchema,
    tags: z.array(z.string()),
    provenance: ProvenanceSchema,
  })
  .passthrough();
export type CorpusChunk = z.infer<typeof CorpusChunkSchema>;

export const SearchHitSchema = CorpusChunkSchema.extend({
  score: z.number(),
}).passthrough();
export type SearchHit = z.infer<typeof SearchHitSchema>;

/** 证据引用与检索命中同构（chunkId 即证据 id）。 */
export const EvidenceRefSchema = SearchHitSchema;
export type EvidenceRef = SearchHit;

// ---------------------------------------------------------------------------
// 推荐报告（主流程产出，前端渲染唯一依据）
// ---------------------------------------------------------------------------

/** 雷达图 8 维（spec §7 G3）：高温/低温/疲劳/水稳/LCC/碳排放/预期寿命/施工可行性，0-100。 */
export const RadarSchema = z
  .object({
    highTemp: z.number().min(0).max(100),
    lowTemp: z.number().min(0).max(100),
    fatigue: z.number().min(0).max(100),
    waterStability: z.number().min(0).max(100),
    lcc: z.number().min(0).max(100),
    carbon: z.number().min(0).max(100),
    expectedLife: z.number().min(0).max(100),
    constructability: z.number().min(0).max(100),
  })
  .passthrough();
export type Radar = z.infer<typeof RadarSchema>;

/** C1：企业实测指标（实验室/现场检测 11 项）。
 * key：vv|vma|vfa|ms|fl|tsr|retainedStability|ds|bendingStrain|tensileStrength|bendingModulus
 * group：volume|marshall|water|highTemp|lowTemp；unit：%|kN|mm|次/mm|με|MPa。
 * threshold 为验收阈值（VV 3-6、FL 2-4、DS>800、弯拉应变>2000、MS>8、TSR>75、残留稳定度>85、VMA/VFA 按规范）；
 * pass 为阈值判定（无阈值时缺省）；sampleSize 为组级样本量。 */
export const LabIndicatorSchema = z
  .object({
    key: z.string(),
    label: z.string(),
    group: z.enum(['volume', 'marshall', 'water', 'highTemp', 'lowTemp']),
    unit: z.enum(['%', 'kN', 'mm', '次/mm', 'με', 'MPa']),
    value: z.number(),
    threshold: z
      .object({ min: z.number().optional(), max: z.number().optional() })
      .passthrough()
      .optional(),
    pass: z.boolean().optional(),
    sampleSize: z.number().int().positive().optional(),
    ciLow: z.number().optional(),
    ciHigh: z.number().optional(),
  })
  .passthrough();
export type LabIndicator = z.infer<typeof LabIndicatorSchema>;

export const CandidateSchema = z
  .object({
    schemaVersion: schemaVersionField(),
    id: z.string(),
    formula: FormulaSchema,
    predictions: z.array(PredictionSchema),
    explanations: z.array(ExplanationSchema).optional(),
    radar: RadarSchema,
    lcc: z.number(),
    carbon: z.number(),
    expectedLife: z.number(),
    score: z.number(),
    evidenceIds: z.array(z.string()),
    labIndicators: z.array(LabIndicatorSchema).optional(),
  })
  .passthrough();
export type Candidate = z.infer<typeof CandidateSchema>;

/** LLM 报告段落（T9 接入真实 LLM；prompt 禁编造 evidenceIds）。 */
export const ReportSectionSchema = z
  .object({
    title: z.string(),
    paragraphs: z.array(z.string()),
    evidenceIds: z.array(z.string()),
  })
  .passthrough();
export type ReportSection = z.infer<typeof ReportSectionSchema>;

/** 与规范查表基线对比行（G6）：baseline 为基线值，candidates 为 candidateId→值；
 * C4：acceptance 为企业验收阈值（min/max，前端据此画达标带）。 */
export const BenchmarkRowSchema = z
  .object({
    label: z.string(),
    unit: z.string(),
    baseline: z.number(),
    candidates: z.record(z.string(), z.number()),
    acceptance: z
      .object({ min: z.number().optional(), max: z.number().optional() })
      .passthrough()
      .optional(),
  })
  .passthrough();
export type BenchmarkRow = z.infer<typeof BenchmarkRowSchema>;

export const AdapterModeSchema = z
  .object({
    a: z.enum(['mock', 'real']),
    c: z.enum(['mock', 'real']),
  })
  .passthrough();
export type AdapterMode = z.infer<typeof AdapterModeSchema>;

/** 六步 pipeline 每步耗时（前端步进条数据源）。 */
export const StepRecordSchema = z
  .object({
    name: z.string(),
    ms: z.number(),
  })
  .passthrough();
export type StepRecord = z.infer<typeof StepRecordSchema>;

export const RecommendationReportSchema = z
  .object({
    schemaVersion: schemaVersionField(),
    scene: SceneInputSchema,
    targets: TargetProfileSchema,
    candidates: z.array(CandidateSchema),
    evidence: z.array(EvidenceRefSchema),
    benchmark: z.array(BenchmarkRowSchema),
    sections: z.array(ReportSectionSchema),
    charts: z.object({}).passthrough().optional(),
    llmStatus: z.enum(['ok', 'degraded']),
    adapterMode: AdapterModeSchema,
    warnings: z.array(z.string()),
    steps: z.array(StepRecordSchema),
  })
  .passthrough();
export type RecommendationReport = z.infer<typeof RecommendationReportSchema>;

// ---------------------------------------------------------------------------
// 对话面板
// ---------------------------------------------------------------------------

export const ChatMessageSchema = z
  .object({
    role: z.enum(['user', 'assistant']),
    content: z.string(),
  })
  .passthrough();
export type ChatMessage = z.infer<typeof ChatMessageSchema>;

export const ChatRequestSchema = z
  .object({
    schemaVersion: schemaVersionField(),
    question: z.string(),
    history: z.array(ChatMessageSchema).optional(),
    reportContext: RecommendationReportSchema.optional(),
  })
  .passthrough();
export type ChatRequest = z.infer<typeof ChatRequestSchema>;

// ---------------------------------------------------------------------------
// 语料数据契约（T3 数据文件 / T6 种子 / cases 路由共用）
// ---------------------------------------------------------------------------

export const CaseSeedSchema = z
  .object({
    schemaVersion: schemaVersionField(),
    id: z.string(),
    title: z.string(),
    summary: z.string(),
    scene: SceneInputSchema,
    expected: z
      .object({
        // 期望配方方向：允许部分字段（方向性描述，非完整配方）
        formulas: z.array(FormulaSchema.deepPartial().passthrough()),
      })
      .passthrough(),
  })
  .passthrough();
export type CaseSeed = z.infer<typeof CaseSeedSchema>;

export const KnowledgeRelationSchema = z
  .object({
    property: z.string(),
    effect: z.string(),
    direction: z.enum(['+', '-']),
    magnitude: z.string(),
    applicableScene: z.array(z.string()),
    sourceRef: z.string(),
  })
  .passthrough();
export type KnowledgeRelation = z.infer<typeof KnowledgeRelationSchema>;

export const KnowledgeEntrySchema = z
  .object({
    schemaVersion: schemaVersionField(),
    id: z.string(),
    category: z.enum(['binder', 'modifier', 'gradation', 'additive', 'mixture']),
    title: z.string(),
    text: z.string(),
    tags: z.array(z.string()).optional(),
    sourceRef: z.string(),
    relations: z.array(KnowledgeRelationSchema),
  })
  .passthrough();
export type KnowledgeEntry = z.infer<typeof KnowledgeEntrySchema>;
