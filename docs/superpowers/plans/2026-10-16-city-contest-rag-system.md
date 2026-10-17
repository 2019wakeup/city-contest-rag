# 数智选材 RAG 演示系统 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use subagent-driven-development (recommended) or executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.
> 本计划按 **Agent Teams** 执行：Lead + builder-backend + builder-data + builder-frontend + critic（见 §团队与写边界）。

**Goal:** 交付课题一可演示系统：输入养护场景 → 目标性能 → Top-5 材料方案 → 六维雷达图/基准对比 → 可溯源推荐报告与证据链 → 对话面板，三视图 + 知识库管理，全部语料标注来源。

**Architecture:** pnpm 单仓（contracts 契约包 / retrieval 检索包 / Hono 后端 / Vue3 前端 / 语料与脚本）。六步确定性 pipeline，LLM 只写文案；向量库走接口抽象（LanceDB 默认、SQLite FTS5+精确KNN 降级），语料是真相源、索引可一键重建。

**Tech Stack:** Node 24 / TypeScript strict / pnpm workspace；zod（contracts 单一真相源）、Hono + zod-openapi、better-sqlite3、@lancedb/lancedb、@huggingface/transformers（bge-m3）、openai SDK（DeepSeek）、Vue 3 `<script setup lang="ts">` + Vite + Element Plus + ECharts + Pinia；vitest。

**Spec:** [docs/superpowers/specs/2026-10-16-city-contest-rag-system-design.md](../specs/2026-10-16-city-contest-rag-system-design.md) —— 任务从 spec 论证，实现者需同时读 spec 与本计划。

## Global Constraints

- Node 24.21 / pnpm 12.11；TypeScript `strict`；workspace 根 `/bigdisk/lhg/road_rec`（已是 git 仓库，git 身份 `contest-team`）。
- 所有 API 消息 schema 必须 `.passthrough()`，且带 `schemaVersion: '1'`；URL 前缀 `/api/v1`。
- **匿名红线**：代码、注释、UI 文案、文件名、commit message 不得出现真实姓名/培养单位/导师；git 身份已设为 `contest-team`，不得改回。
- **不引入** agent 框架（Mastra/LangGraph）与向量库服务器（Milvus/Chroma/Qdrant server）。
- LLM 仅经 openai SDK + `.env` 的 `DEEPSEEK_API_KEY`/`DEEPSEEK_BASE_URL`；`.env` 不入 git（提供 `.env.example`）。
- **量化红线**：雷达图/排序/LCC/碳排放等数值全部确定性计算，LLM 不得产出任何数值；prompt 禁止编造证据（只能引用传入 evidenceId）。
- 每条 chunk 必须带 provenance：`sourceDocId / contentHash / embeddingModel / modelVersion / dim / pipelineRev / embeddedAt`；换 embedding 模型必须全量重建。
- `RETRIEVAL_BACKEND=sqlite|lancedb`（默认 lancedb）；后端通过 `VectorStore` 接口访问，不得直接 import 具体实现。
- embedding 下载走 `HF_ENDPOINT=https://hf-mirror.com`（`scripts/setup-env` 或 README 说明）。
- Vue 必须 Composition API + `<script setup lang="ts">`；UI 文案中文；组件库 Element Plus；图表 ECharts。
- 测试框架 vitest；服务端集成测试直接起 Hono app（supertest 风格），不依赖真实网络/真实 LLM。
- 所有语料条目必须带 `sourceRef`（DOI 或规范号）；模拟数据在 UI 上必须带"模拟数据"角标（`adapterMode` 驱动）。

## Review Focus

| # | 输入/故障类 | 期望行为 | 钉住它的任务 |
|---|---|---|---|
| 1 | 任何 API 载荷含未知/多余字段（前向兼容） | passthrough 不丢弃；前端渲染不崩 | T1、T13 |
| 2 | LLM 未配置/离线 | 报告 `llmStatus: 'degraded'`，确定性部分照常渲染 | T9 |
| 3 | 队友 A/C 响应非契约 JSON 或超时 | 自动降级 mock，`adapterMode: 'mock'`，主流程不崩 | T7 |
| 4 | 向量库为空/损坏未重建 | 检索返回 `evidence: []` + `warnings` 标注，推荐仍完成 | T8 |
| 5 | chunk 的 contentHash 与模型版本变化 | build-index 重建而非静默部分更新 | T4 |
| 6 | 重复语料（相同 contentHash） | 幂等跳过，统计中可见 skip 数 | T4 |

---

## 团队与写边界（write scopes）

| 角色 | 拥有任务 | 写边界（workspace 相对路径） |
|---|---|---|
| **Lead**（本会话） | T14、T15、集成与验收、任务板调度 | `docs/`、`scripts/e2e-*`、根级 README 等交付文档 |
| **builder-backend** | T1、T2、T6、T7、T8、T9、T10 | `packages/contracts/`、`packages/retrieval/src/`（除 `lancedb.ts`）、`apps/server/`、`prompts/`、根 `package.json`/`pnpm-workspace.yaml`/`tsconfig*.json`/`.env.example` |
| **builder-data** | T3、T4、T5 | `data/corpus/`、`scripts/`（除 `e2e-*`）、`packages/embedding/`、`packages/retrieval/src/lancedb.ts` |
| **builder-frontend** | T11、T12、T13 | `apps/web/` |
| **critic** | 评审门 R1–R5（T2/T4/T10/T13/T14 完成后） | 仅写 `docs/reviews/`；代码只读，发现需改代码的问题一律反馈 Lead 派单，不自行改 |

**协作规则**：任务板用 team_task（含 write_scopes 与 blocked_by）；跨角色依赖只通过已合入 main 的接口（Interfaces 块）；每天 Lead 集成一次 `git pull`-等价同步（共享工作区直接可见）；critic 评审结论 = task 能否 complete 的门。

---

## Task 1: 单仓脚手架 + contracts 契约包（builder-backend）

**Files:**
- Create: `pnpm-workspace.yaml`、根 `package.json`（scripts: `dev/test/build:index/e2e`；devDeps: typescript, vitest, tsx）、`tsconfig.base.json`、`.env.example`（DEEPSEEK_API_KEY、DEEPSEEK_BASE_URL、MODULE_A_ENDPOINT、MODULE_C_ENDPOINT、RETRIEVAL_BACKEND、HF_ENDPOINT、LLM_OFF）
- Create: `packages/contracts/package.json`、`src/index.ts`、`src/schemas.ts`、`src/registry.ts`、`src/json-schema.ts`
- Test: `packages/contracts/test/contracts.test.ts`

**Interfaces:**
- Consumes: 无（首任务）
- Produces:
  - `SCHEMA_VERSION = '1'`
  - `SceneInput / TargetProfile / Formula / FormulaPrediction / Candidate / EvidenceRef / RecommendationReport / ChatRequest / CaseSeed / KnowledgeEntry / CorpusChunk / SearchHit`（全部 zod schema + 推导 TS 类型，全部 `.passthrough()`）
  - `FIELD_REGISTRY`：SceneInput 字段注册表（点路径 key，含 `label/unit/control/options/placeholder`）
  - `toJsonSchema(schema: ZodType): object`
  - 类型名与字段名严格按 spec §7（`adapterMode: {a:'mock'|'real', c:'mock'|'real'}`、`llmStatus: 'ok'|'degraded'`、雷达维度 `highTemp/lowTemp/fatigue/waterStability/lcc/carbon/expectedLife/constructability`）

- [ ] **Step 1: 写失败测试** `packages/contracts/test/contracts.test.ts`：① `SceneInput.parse({...合法样例, extraField: 1})` 成功且输出保留 `extraField`；② 每个顶层 schema 含 `schemaVersion` 枚举 `'1'`；③ `toJsonSchema(SceneInput)` 返回 object 含 `$schema`、`type:'object'`；④ `FIELD_REGISTRY` 覆盖 `climate.zone/climate.pgHigh/climate.pgLow/traffic.level/distresses/constraints.budget/notes` 七条路径且各有 `label/control`。
- [ ] **Step 2: 运行测试确认失败** Run: `pnpm -C packages/contracts test` Expected: FAIL（模块不存在）
- [ ] **Step 3: 实现**：zod schema（类型结构按 spec §7 契约核心段）；`FIELD_REGISTRY` 中文 label（"气候分区/PG高温等级/PG低温等级/交通荷载等级/病害类型/预算/备注"）；`toJsonSchema` 用 `zod-to-json-schema`（写入 packages/contracts 依赖）。根 package.json 的 workspace glob：`apps/*`、`packages/*`。
- [ ] **Step 4: 运行测试确认通过** Run: `pnpm -C packages/contracts test` Expected: 4 组断言 PASS
- [ ] **Step 5: Commit** `git add -A && git commit -m "feat(contracts): monorepo scaffold + zod 契约包（passthrough/版本/字段注册表）"`

## Task 2: 检索核心——VectorStore 接口 + RRF 融合 + SQLite 降级实现（builder-backend）

**Files:**
- Create: `packages/retrieval/package.json`、`src/types.ts`、`src/fusion.ts`、`src/sqlite.ts`
- Test: `packages/retrieval/test/fusion.test.ts`、`test/sqlite.test.ts`

**Interfaces:**
- Consumes: T1 的 `CorpusChunk / SearchHit`（来自 packages/contracts）
- Produces:
  - `interface VectorStore { add(chunks: CorpusChunk[], vectors: number[][]): Promise<void>; search(q: {vector: number[]; text: string; topK: number; filter?: {docTypes?: string[]; tags?: string[]}}): Promise<SearchHit[]>; delete(docId: string): Promise<void>; rebuild(): Promise<void>; stats(): Promise<{count: number; docTypes: Record<string, number>}> }`
  - `rrf(rankings: Array<Array<{id: string; score: number}>>, k?: number): {id: string; score: number}[]`
  - `class SqliteVectorStore implements VectorStore`（构造 `new SqliteVectorStore(dbPath: string)`）：FTS5 表存 text（BM25）+ chunks 表存向量 JSON；KNN 用 JS 精确余弦（不引入原生 sqlite-vec，理由见任务内说明）；`search` 融合 = RRF(BM25 top-40, 余弦 top-40) 后按 filter 过滤再截 topK；`rebuild` 清空重建表。
- 注：`SearchHit` 字段 `{chunkId, text, score, docType, tags, provenance}`。

- [ ] **Step 1: 写失败测试**：`fusion.test.ts`——两个 rankings 融合后 id 并集齐全、RRF 公式数值断言（k=60，同 id 双路出现则分数相加）；`sqlite.test.ts`——add 两条→stats.count=2→search 命中预期 id 且 score 降序→delete 后 stats.count=1→rebuild 后为 0；filter.docTypes 生效。
- [ ] **Step 2: 运行测试确认失败** Run: `pnpm -C packages/retrieval test` Expected: FAIL
- [ ] **Step 3: 实现**：better-sqlite3（dep 写入 packages/retrieval）；RRF 公式 `1/(k+rank)` 求和；余弦相似度自实现。
- [ ] **Step 4: 运行测试确认通过** Run: `pnpm -C packages/retrieval test` Expected: PASS
- [ ] **Step 5: Commit** `git commit -m "feat(retrieval): VectorStore 接口 + RRF 融合 + SQLite FTS5 精确KNN 降级实现"`

## Task 3: 语料内容工程——知识条目/规范条文/案例/标签词典（builder-data）

**Files:**
- Create: `data/corpus/scene-tags.json`、`data/corpus/knowledge/entries.json`、`data/corpus/standards/*.md`（8 份规范各一文件，按条文分节）、`data/corpus/cases/cases.json`、`data/corpus/literature/from-xlsx.json`（占位，T3 只建目录与校验）、`scripts/validate-corpus.ts`、`scripts/convert-literature.ts`
- Test: `scripts/validate-corpus.ts` 本身即校验器（vitest 包装 `scripts/test/validate-corpus.test.ts`）

**Interfaces:**
- Consumes: T1 的 `KnowledgeEntry / CaseSeed` 类型（import 校验）
- Produces（数据约定，后续任务依赖其 shape）:
  - `entries.json`: `KnowledgeEntry[]`——id 格式 `k-<category>-<nnn>`（category ∈ binder|modifier|gradation|additive|mixture），每条含 `relations[]`（property/effect/direction(±)/magnitude 定量描述/applicableScene 标签数组/sourceRef DOI 或规范号）。**首版 ≥40 条**（5 案例方向各 ≥6 条，其余通用），原料 = 文献调研报告 §3.2/3.3 + `reference/材料-性能关系/` 全文。
  - `scene-tags.json`: `{tags: [{id, label, kind: 'climate'|'traffic'|'distress'|'constraint', synonyms?: string[]}]}`，覆盖 5 案例全部标签（华南高温/重载/车辙/低温/横向裂缝/冻融/水损害/RAP再生/降噪排水/预算/工期/环保…）。
  - `cases/cases.json`: 5 条 `CaseSeed`——id `case-01` 华南高温重载车辙 / `case-02` 寒冷地区横向裂缝 / `case-03` 多雨冻融水损害 / `case-04` 旧路高RAP再生 / `case-05` 城市低噪排水；每条含完整 `scene`（所有必填字段）+ `expected.formulas`（2~3 个期望配方方向）。
  - `standards/*.md`: 每条规范条文 `## <规范号>-<条号> <主题>` + 正文 200~500 字 + 文末 `<!-- source: <规范名+条号> -->`。
- [ ] **Step 1: 写失败测试**：`validate-corpus.test.ts`——跑 `validate-corpus` 校验器断言通过（entries 每条的 id/relations/quantity 合法、cases 5 条、scene 必填字段齐全、tags 覆盖 cases 引用、sourceRef 非空）。
- [ ] **Step 2: 运行确认失败** Expected: FAIL（文件不存在）
- [ ] **Step 3: 实现**：先写 `scripts/validate-corpus.ts`（zod 校验 + 引用完整性：cases 的标签 ∈ scene-tags），再填数据。`convert-literature.ts` 读 `City_Contest/文献调研.xlsx`（openpyxl 不可用→用 `xlsx` npm 包解析）产出 `literature/from-xlsx.json`（149 条：id `lit-<序号>`、title/authors/journal/year/DOI/taskZh/abstract 有则填）。
- [ ] **Step 4: 运行确认通过** Expected: PASS
- [ ] **Step 5: Commit** `git commit -m "feat(corpus): 场景标签词典+40条知识条目+8规范条文+5案例+文献转换脚本"`

## Task 4: embedding 包 + build-index 入库管线 + LanceDB 实现（builder-data）

**Files:**
- Create: `packages/embedding/package.json`、`src/embedder.ts`；`packages/retrieval/src/lancedb.ts`；`scripts/build-index.ts`
- Test: `packages/embedding/test/embedder.test.ts`（模型离线时用 stub 断言接口行为）；`packages/retrieval/test/lancedb.test.ts`（标 `describe.skipIf(!process.env.LANCEDB_TEST)`，CI/本机无网可跳过）；`scripts/test/build-index.test.ts`（用注入的 fake embedder + SqliteVectorStore 跑全流程，不下载模型）

**Interfaces:**
- Consumes: T1 `CorpusChunk`；T2 `VectorStore`/`SqliteVectorStore`；T3 语料文件
- Produces:
  - `createEmbedder(opts: {model?: 'bge-m3' | 'multilingual-e5-small'; cacheDir?: string}): Promise<Embedder>`；`Embedder = { embed(texts: string[]): Promise<number[][]>; dim: number; modelName: string; modelVersion: string }`（@huggingface/transformers，`env.remoteHost` 读 HF_ENDPOINT）
  - `class LanceDBVectorStore implements VectorStore`（`new LanceDBVectorStore(dbPath: string)`，`@lancedb/lancedb`，collection `chunks` + FTS 索引，混合检索 RRF 复用 T2 fusion）
  - `scripts/build-index.ts` CLI：`--rebuild` / `--backend=sqlite|lancedb`；流程 = 读 corpus → 切块（entry/条文/题录 各一 chunk）→ contentHash（sha256 text）→ 幂等跳过已入库同 hash → embed → 写 provenance（`pipelineRev` = git rev-parse HEAD 前 7 位，`embeddingModel/modelVersion/dim` 取自 embedder）→ VectorStore.add → 打印 stats。
- [ ] **Step 1: 写失败测试**：`embedder.test.ts`——stub pipeline 下 `embed` 返回 n×dim 矩阵、provenance 字段齐全；`build-index.test.ts`——fake embedder（固定向量）+ SqliteVectorStore，跑两遍断言第二遍 skip 数 >0 且 count 不变（幂等，Review Focus #6）；`--rebuild` 后 count 与首遍一致。
- [ ] **Step 2: 运行确认失败** Expected: FAIL
- [ ] **Step 3: 实现**：embedder（`@huggingface/transformers`，feature-extraction pipeline，池化 mean；model 名 `Xenova/bge-m3`，备选 `Xenova/multilingual-e5-small`）；`lancedb.ts`（add/search/delete/rebuild/stats 全接口）；`build-index.ts`（tsx 运行）。
- [ ] **Step 4: 运行确认通过** Expected: PASS（lancedb 组在本机网络允许时补跑）
- [ ] **Step 5: Commit** `git commit -m "feat(index): bge-m3 embedder + build-index 幂等入库 + LanceDB VectorStore 实现"`

## Task 5: 金标准检索回归集 + 评估脚本（builder-data）

**Files:**
- Create: `data/golden/golden.json`、`scripts/golden-eval.ts`
- Test: `scripts/test/golden-eval.test.ts`（fake store 注入，验证评估器判定逻辑）

**Interfaces:**
- Consumes: T2 `VectorStore`；T3 语料 id 约定
- Produces: `scripts/golden-eval.ts <backend> [--json]` → 每用例 recall@k（k=5）打印表，任一用例低于 `minRecallAt5` 则 exit 1；用例 shape `{id, query, expectedDocIds: string[], minRecallAt5: number}`。**20 条用例** = 5 案例 × 4 类语料（knowledge/standard/literature/enterprise 各一条 query，enterprise 暂用揭榜需求相关 query）；expectedDocIds 用 T3 中真实 id（如 `k-binder-001`、`std-jtg5142-4`、`lit-012`）。
- [ ] **Step 1: 写失败测试**：fake VectorStore 返回固定 hits——① 命中达标用例 PASS ② 缺命中用例 FAIL 并 exit 1 ③ `--json` 输出含 recall 字段。
- [ ] **Step 2: 运行确认失败** Expected: FAIL
- [ ] **Step 3: 实现**：golden.json（20 条）+ 评估脚本（embed query 用 T4 embedder；或先用「BM25-only」模式跑通——评估器只依赖 VectorStore.search）。
- [ ] **Step 4: 运行确认通过** Expected: PASS
- [ ] **Step 5: Commit** `git commit -m "feat(eval): 金标准20条 recall@5 回归集与评估脚本"`

## Task 6: 关系层——SQLite 种子 + 场景标签硬过滤（builder-backend）

**Files:**
- Create: `apps/server/package.json`、`src/relation/db.ts`、`src/relation/seed.ts`
- Test: `apps/server/test/relation.test.ts`

**Interfaces:**
- Consumes: T1 `SceneInput/TargetProfile`；T3 语料（entries/scene-tags/cases）
- Produces:
  - `initRelationDb(dbPath: string): Database`——表 `materials(id,type,name,specsJson,sourceRef)`、`relations(id,materialId,property,effect,direction,magnitude,applicableSceneJson,sourceRef)`、`scene_tags(id,label,kind,synonymsJson)`、`cases(id,title,sceneJson,expectedJson)`
  - `seedFromCorpus(corpusDir: string, dbPath: string): Promise<{materials: number; relations: number; cases: number}>`（幂等：先 DROP 再建）
  - `filterByScene(db, {targets: PerfTarget[]; tags: string[]}): CandidateMaterialSet`——`{binders: string[]; gradations: string[]; modifiers: string[]; additives: string[]}`：relations.applicableScene ∩ tags 命中或 property ∈ targets 的 material 集合。
- [ ] **Step 1: 写失败测试**：seedFromCorpus 后行数断言（≥40 materials、relations 数 = entries 内 relations 总和、cases=5）；filterByScene（车辙+高温标签）返回集合非空且含 SBS 类 material；标签不匹配查询返回空集。
- [ ] **Step 2: 运行确认失败** Expected: FAIL
- [ ] **Step 3: 实现**：better-sqlite3；JSON 列用 TEXT + JSON.parse。
- [ ] **Step 4: 运行确认通过** Expected: PASS
- [ ] **Step 5: Commit** `git commit -m "feat(relation): 材料-性能-场景关系表种子与场景标签硬过滤"`

## Task 7: 模块 A/C 适配器 + 内置 mock（builder-backend）

**Files:**
- Create: `apps/server/src/adapters/a.ts`、`c.ts`、`mock-a-rules.ts`、`mock-c-baseline.ts`
- Test: `apps/server/test/adapters.test.ts`

**Interfaces:**
- Consumes: T1 `SceneInput/TargetProfile/Formula/FormulaPrediction`
- Produces:
  - `mapSceneToTargets(scene: SceneInput): Promise<TargetProfile & {adapterMode: 'mock'|'real'}>`——`MODULE_A_ENDPOINT` 未设或请求失败/校验失败 → mock（规则表 `mock-a-rules.ts`：场景标签 → targets 数值 + priorities 权重，值取自规范基线，全部确定性）并 `adapterMode:'mock'`。
  - `predictFormulas(formulas: Formula[]): Promise<FormulaPrediction[] & {adapterMode}>`——mock 用 `mock-c-baseline.ts` 基准表（按 binder/modifier/gradation 类型给 8 维预测值）+ mulberry32(seed=42) 扰动（**固定 seed 保证演示可复现**）；真实响应 zod 校验失败 → 整体降级 mock。
  - 超时 3s（AbortController）。
- [ ] **Step 1: 写失败测试**：mock 模式——同一 scene 两次调用结果逐位相等（确定性）；`predictFormulas` 空数组返回 `[]`；端点设为 `http://127.0.0.1:9`（不可达）时返回 mock 且 `adapterMode:'mock'`（Review Focus #3）；fake HTTP server 返回非契约 JSON → 同样降级。
- [ ] **Step 2: 运行确认失败** Expected: FAIL
- [ ] **Step 3: 实现**：fetch + zod safeParse；mock 表数据写在 `mock-*.ts` 常量中并注释"模拟数据"。
- [ ] **Step 4: 运行确认通过** Expected: PASS
- [ ] **Step 5: Commit** `git commit -m "feat(adapters): 模块A/C 适配器（契约校验+超时+mock确定性降级）"`

## Task 8: 六步 orchestrator + /api/v1/recommend（builder-backend）

**Files:**
- Create: `apps/server/src/index.ts`、`src/orchestrator.ts`、`src/routes/recommend.ts`、`src/routes/cases.ts`、`src/routes/health.ts`、`src/routes/feedback.ts`（stub）
- Test: `apps/server/test/recommend.test.ts`（SqliteVectorStore + mock 适配器 + 空向量库两种场景）

**Interfaces:**
- Consumes: T2 `VectorStore`；T6 `filterByScene`；T7 `mapSceneToTargets/predictFormulas`；T4 `createEmbedder`
- Produces: `recommend(scene: SceneInput, deps: {store, embedder, relationDb}): Promise<RecommendationReport>`——六步：① zod 解析场景（notes 非空时走 LLM 抽取，LLM_OFF 时忽略 notes）② mapSceneToTargets ③ `filterByScene` 组装候选 Formula（binder×gradation×modifier×additive 组合上限 5）④ predictFormulas ⑤ 加权排序（Σ priorities.weight×归一化预测值 + 约束惩罚）+ 雷达图 8 维 0-100 分 + LCC/碳排/寿命/施工可行性规则估算（规则表 + 假设写在代码注释）⑥ 证据检索（每候选按类型标签 search top3）→ 组装 report。向量库空 → `evidence:[]` + `warnings:['知识库为空，请执行 pnpm build:index']`，主流程仍完成（Review Focus #4）。
- REST：`POST /api/v1/recommend`（body=SceneInput，200=RecommendationReport）；`GET /api/v1/cases`、`GET /api/v1/cases/:id`（返回 cases 表内容 + 是否可预跑）；`GET /api/v1/health`（`{vectorStore:{backend,count,ok}, llm:{configured}, adapters:{a,c}}`）；`POST /api/v1/feedback`（200 `{received:true}`，stub）。Hono + `@hono/zod-openapi` 自动文档挂 `/openapi`。
- [ ] **Step 1: 写失败测试**：mock 全链路——case-01 scene → report 断言：`candidates.length===5`、`evidence` 非空（先 seed 一条 chunk）、`radar` 每候选 8 维 0-100、`llmStatus==='ok'|'degraded'`、确定性两次调用 report 数值一致；空库场景 → `warnings` 含 `build:index` 且 200。
- [ ] **Step 2: 运行确认失败** Expected: FAIL
- [ ] **Step 3: 实现**：orchestrator 六步；步骤耗时记录进 report 隐藏字段 `steps: {name, ms}[]`（前端步进条数据源）。
- [ ] **Step 4: 运行确认通过** Expected: PASS
- [ ] **Step 5: Commit** `git commit -m "feat(server): 六步orchestrator与recommend/cases/health/feedback路由"`

## Task 9: LLM 报告生成 + 对话面板（builder-backend）

**Files:**
- Create: `apps/server/src/llm/client.ts`、`src/report/fallback.ts`、`src/routes/recommend-report.ts`（或并入 T8 的 recommend 流程）、`src/routes/chat.ts`、`prompts/report.md`、`prompts/extract-scene.md`、`prompts/chat.md`
- Test: `apps/server/test/llm.test.ts`（fake LLM 注入 + LLM_OFF）

**Interfaces:**
- Consumes: T8 `RecommendationReport`（候选与证据部分）
- Produces:
  - `generateStructured<T>(opts: {prompt: string; schema: ZodType<T>; temperature?: number}): Promise<{data: T; status: 'ok'|'degraded'}>`——openai SDK（baseURL/key 从 env；未配置→立即 degraded）；zod 校验失败重试 ≤2，仍败 → degraded。
  - `buildReportSections(deterministic: ReportBase, llm): Promise<ReportSection[] & {llmStatus}>`——prompt 要求：每个 section `{title, paragraphs[], evidenceIds[]}`，evidenceIds 只能是传入 evidence 的 chunkId（prompt 内明写"禁止编造引用"）；degraded 时用 `fallback.ts` 模板（段落由确定性数据拼中文文案，evidenceIds 取相关性 top3）。
  - `POST /api/v1/chat`：SSE 流式（`text/event-stream`），body `ChatRequest`（含可选当前 report 上下文）；降级：普通 JSON `{reply}`。prompt `chat.md` 同禁编造约束。
- [ ] **Step 1: 写失败测试**：fake LLM 返回合法 JSON → status ok 且 sections 非空；fake LLM 返回非法 JSON 两次 → degraded 且 fallback 段落非空、evidenceIds ⊆ 传入 ids；`LLM_OFF=1` → 立即 degraded；fake 返回的 evidenceIds 含未传入 id → 被过滤（防编造兜底）。
- [ ] **Step 2: 运行确认失败** Expected: FAIL
- [ ] **Step 3: 实现**：openai SDK `new OpenAI({baseURL, apiKey})`；`chat/completions` + `response_format: {type:'json_object'}`；SSE 用 Hono `streamSSE`。
- [ ] **Step 4: 运行确认通过** Expected: PASS
- [ ] **Step 5: Commit** `git commit -m "feat(llm): DeepSeek报告生成/场景抽取/对话SSE+模板降级"`

## Task 10: 知识库管理路由 + 索引重建（builder-backend）

**Files:**
- Create: `apps/server/src/routes/kb.ts`
- Test: `apps/server/test/kb.test.ts`

**Interfaces:**
- Consumes: T2 `VectorStore`；T4 `createEmbedder`/build 逻辑（抽 `lib/build-index.ts` 供 server 与 CLI 共用——若 T4 未抽出，此任务内抽出到 `packages/retrieval/src/build.ts`，CLI 改为调用它）
- Produces:
  - `GET /api/v1/kb/stats` → `{count, docTypes, backend}`
  - `POST /api/v1/kb/documents`（JSON body `{title, docType: 'enterprise'|'standard'|'knowledge', text}` 或 multipart `.pdf/.md/.txt`；PDF 用 pdf-parse 抽文本）→ 切块入库（provenance 同 build-index）→ `{added, chunks}`
  - `POST /api/v1/kb/search` `{query, topK?, docTypes?}` → `SearchHit[]`（含 provenance 供证据链展示）
  - `POST /api/v1/kb/rebuild` → 调 build 逻辑 → `{count}`
- [ ] **Step 1: 写失败测试**：stats 空库 `{count:0}`；documents 文本入库后 stats.count 增且 docType 正确；search 命中返回 chunkId 与 provenance；rebuild 后 count 不变（幂等）。
- [ ] **Step 2: 运行确认失败** Expected: FAIL
- [ ] **Step 3: 实现**：路由 + 共用 build 抽取。
- [ ] **Step 4: 运行确认通过** Expected: PASS
- [ ] **Step 5: Commit** `git commit -m "feat(kb): 知识库stats/上传/检索/重建路由"`

## Task 11: 前端脚手架 + API 客户端 + schema 驱动场景表单（builder-frontend）

**Files:**
- Create: `apps/web/package.json`（vue@3, vite@7, @vitejs/plugin-vue, element-plus, echarts, pinia, vue-router@4, vitest, @vue/test-utils, vue-tsc）、`vite.config.ts`（proxy `/api`→`http://localhost:3000`）、`index.html`、`src/main.ts`、`src/App.vue`、`src/router.ts`、`src/api/client.ts`、`src/stores/recommend.ts`、`src/components/SceneForm.vue`
- Test: `apps/web/test/scene-form.test.ts`、`test/store.test.ts`

**Interfaces:**
- Consumes: T1 `FIELD_REGISTRY`、契约类型（直接 import `packages/contracts`）
- Produces:
  - `client.ts`: `typed fetch 封装`——`postRecommend(scene): Promise<RecommendationReport>`、`getCases()`、`postChat(req)`（SSE 读流）、`kbStats()/kbSearch()/kbUpload()/kbRebuild()`
  - `stores/recommend.ts`: 状态机 `idle→running→done|degraded|error`，字段 `scene, report, steps, activeCaseId, chat`；actions `run(scene)`、`adjustAndRerun(patch)`
  - `SceneForm.vue`: 遍历 FIELD_REGISTRY 渲染控件（select/number/text/checkbox/textarea），emit 合法 `SceneInput`——**表单不写死任何字段**（改 contracts 即改表单）
- [ ] **Step 1: 写失败测试**：mount SceneForm → 注册表 7 个必查字段各渲染一个控件；提交事件 payload 满足 zod 解析；store 状态机 `run` 失败（api 抛错）→ `error`。
- [ ] **Step 2: 运行确认失败** Expected: FAIL
- [ ] **Step 3: 实现**：Composition API + `<script setup lang="ts">`；Pinia setup store。
- [ ] **Step 4: 运行确认通过** Expected: PASS
- [ ] **Step 5: Commit** `git commit -m "feat(web): Vue3脚手架+类型化API客户端+schema驱动表单+状态机store"`

## Task 12: 推荐工作台视图（结果/雷达图/基准/证据链/对话）（builder-frontend）

**Files:**
- Create: `src/views/RecommendView.vue`、`src/components/StepStepper.vue`、`CandidateCard.vue`、`RadarChart.vue`、`BenchmarkTable.vue`、`EvidencePanel.vue`、`ReportSection.vue`、`ChatPanel.vue`、`WaterfallChart.vue`
- Test: `apps/web/test/recommend-view.test.ts`

**Interfaces:**
- Consumes: T11 store/API；T8 report 结构（含 `steps` 数组、`radar`、`benchmark`、`evidence`、`sections`、`adapterMode`、`warnings`）
- Produces: 完整推荐工作台——左栏 SceneForm+案例一键填入+微调面板（改约束后 `adjustAndRerun`）；右栏 StepStepper（steps 数组渲染状态/耗时）→ 目标性能表（targets+priorities）→ 结果区：CandidateCard 列表（含 `adapterMode==='mock'` 时"模拟数据"角标）、RadarChart（8 维，ECharts radar，仅 LLM 无关数值）、BenchmarkTable（vs 规范查表基线）、EvidencePanel（引用角标点击展开 chunk + provenance 来源行）、ReportSection（段落文本渲染，`llmStatus:'degraded'` 时顶部提示"文案模板降级"）、ChatPanel（SSE 流式）、WaterfallChart（有 `explanations` 才渲染）。**report 含未知字段不崩**（Review Focus #1，渲染层全部按 `report.x ?? fallback` 取值）。
- [ ] **Step 1: 写失败测试**：注入含额外字段的 report fixture → mount 视图不抛错且渲染候选卡片数=fixture 数；`adapterMode.mock` 显示"模拟数据"；`llmStatus.degraded` 显示降级提示；空 evidence 显示"知识库为空"提示。
- [ ] **Step 2: 运行确认失败** Expected: FAIL
- [ ] **Step 3: 实现**：ECharts 按需引入（radar 图）；SSE 用 fetch ReadableStream 解析。
- [ ] **Step 4: 运行确认通过** Expected: PASS
- [ ] **Step 5: Commit** `git commit -m "feat(web): 推荐工作台（步进条/雷达图/基准对比/证据链/降级提示/对话面板）"`

## Task 13: 典型案例页 + 知识库管理页（builder-frontend）

**Files:**
- Create: `src/views/CasesView.vue`、`src/views/KnowledgeView.vue`、`src/components/CaseCard.vue`、`KbStats.vue`、`KbUpload.vue`、`KbSearchBox.vue`
- Test: `apps/web/test/views.test.ts`

**Interfaces:**
- Consumes: T11 API 客户端；T10 KB 路由契约
- Produces: CasesView——5 卡片（标题/场景摘要）→ 点击载入工作台（`router.push('/recommend?case=case-01')` 或 store 注入）；KnowledgeView——统计卡、上传表单（文本粘贴 + 文件上传）、检索测试框（top-k 结果含 provenance 来源行与分数）、重建按钮（调 kbRebuild 后刷新 stats）。
- [ ] **Step 1: 写失败测试**：CasesView mock 5 案例渲染 5 卡片；KnowledgeView 检索返回 fixture 渲染 hit 列表含来源；上传按钮触发 kbUpload 调用。
- [ ] **Step 2: 运行确认失败** Expected: FAIL
- [ ] **Step 3: 实现**：同上组件规范。
- [ ] **Step 4: 运行确认通过** Expected: PASS
- [ ] **Step 5: Commit** `git commit -m "feat(web): 典型案例页与知识库管理页"`

## Task 14: 端到端验收——5 案例 + 降级路径 + 浏览器走查（Lead）

**Files:**
- Create: `scripts/e2e-cases.ts`、`scripts/e2e-degradation.ts`、`docs/reviews/e2e-report.md`
- Test: 脚本即测试（CI 断言 exit code）

**Interfaces:**
- Consumes: T8/T9/T10 服务；T3 cases.json
- Produces: `pnpm e2e` 一键验收：
  1. 起 server（临时 db + mock 适配器 + LLM_OFF 可选）→ 对 5 个 case 各 POST recommend → 断言：200、`candidates.length===5`、`evidence.length>0`、`radar` 8 维、数值确定性（跑两遍相等）；
  2. 降级场景：`LLM_OFF=1` 全 5 案例 `llmStatus==='degraded'` 且 sections 非空；A/C 端点指向不可达端口 → `adapterMode==='mock'`；
  3. 浏览器走查（chrome-devtools-mcp 已装）：三视图加载无 console error，截图存入 `docs/reviews/screenshots/`。
- [ ] **Step 1: 写失败测试**：e2e 脚本先写断言再跑（首次必然 FAIL：服务未就绪）。
- [ ] **Step 2: 运行确认失败** Expected: FAIL
- [ ] **Step 3: 实现**：脚本 + 修复执行中发现的集成问题（修 bug 走 systematic-debugging，改代码回退给对应 owner）。
- [ ] **Step 4: 运行确认通过** Expected: `pnpm e2e` exit 0，5 案例全绿 + 降级全绿 + 截图齐。
- [ ] **Step 5: Commit** `git commit -m "test(e2e): 5案例端到端+降级路径+浏览器走查验收"`

## Task 15: 交付文档——README/DELIVERY/演示脚本/匿名审计（Lead）

**Files:**
- Create: 根 `README.md`、`docs/DELIVERY.md`、`docs/demo-script.md`、`scripts/anonymity-audit.ts`
- Test: `scripts/anonymity-audit.ts` 全仓扫描

**Interfaces:**
- Consumes: 全部任务产物
- Produces:
  - `README.md`：三命令一键起（`pnpm install && pnpm build:index && pnpm dev`）+ `.env.example` 说明 + 演示前置检查表。
  - `docs/DELIVERY.md`：数据结构（表/chunk/provenance 字段表）、输入输出字段（契约引用）、接口样例（curl 示例）、模块关系图、数据需求说明（G7）。
  - `docs/demo-script.md`：7 步演示流程台词（对应 spec §11）。
  - `scripts/anonymity-audit.ts`：扫描 `apps/ packages/ scripts/ docs/ data/corpus/ prompts/` 全部文本与文件名、git log——命中已知真实姓名/单位词表 → 列出文件行号，exit 1。
- [ ] **Step 1: 写失败测试**：审计脚本先在词表里放一个必中词验证能抓到（如临时含"张"姓名的测试 fixture），跑通后从词表移除测试词。
- [ ] **Step 2: 运行确认失败** Expected: FAIL
- [ ] **Step 3: 实现**：四份文档 + 审计脚本 + `.gitignore` 复查（`.env`/`data/db`/`data/index` 不入库）。
- [ ] **Step 4: 运行确认通过** Expected: 审计 exit 0；`git ls-files | grep -E '\.(env|db|pdf)$'` 为空。
- [ ] **Step 5: Commit** `git commit -m "docs: README/DELIVERY/演示脚本 + 匿名审计通过"`

---

## 依赖图（任务板 blocked_by）

```
T1 ─┬─ T2 ──────┬─ T4 ─ T5
    │           │    ▲
    │   T3 ─────┘    │
    ├─ T6 ────── T8 ─ T9 ─┐
    ├─ T7 ──────┘         ├─ T10 ─┐
    └─────────────────────┘       ├─ T11 ─ T12 ─ T13 ─┐
                                   └──────────────────┴─ T14 ─ T15
critic 门: R1(T2后) R2(T4后) R3(T10后) R4(T13后) R5(T14后)
```

## 自审记录（写作时已核）

1. **Spec 覆盖**：spec §3→T1/T2/T4；§4 防线→T2(接口)/T3(语料真相源)/T4(provenance+幂等)/T5(金标准)；§5 六步→T6+T7+T8+T9；§6 数据模型→T3/T6；§7 契约→T1/T7/T8/T10；§8 前端→T11/T12/T13；§9 gap→G2(T3)/G4(T1 explanations)/G5(T12 微调)/G6(T12)/G7(T15)/G8(T15)/G9(T8 feedback stub)；§10 测试→各任务 test + T14；§11 交付→T15；§12 时间线→见 §团队节奏。
2. **步骤扫描**：每步=一个动作+可核验输出；测试步骤含具体断言；代码步骤含签名与文件。
3. **类型一致性**：`CorpusChunk/SearchHit/RecommendationReport` 在 T1 定义、T2/T4/T8/T11 引用名一致；`VectorStore` 接口 T2 定义、T4/T8/T10 引用一致；`filterByScene` 返回 `CandidateMaterialSet` T6 定义、T8 消费一致。
4. **Review Focus**：6 条均已钉到任务（#1→T1/T13、#2→T9、#3→T7、#4→T8、#5/#6→T4）。
5. **比例**：本计划为 15 任务/约 300 行，与 spec（296 行）同级，未转录代码。
