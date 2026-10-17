# 数智选材 RAG 演示系统 — 开发规格（Design Spec）

> 状态：**已获团队批准**（2026-10-16，头脑风暴 §1–§6 逐节确认 + gap 修订确认）
> 所属项目：第十二届中国研究生智慧城市技术与创意设计大赛 · 企业揭榜赛道 · 课题一《数智选材——AI 驱动的道路养护决策与沥青材料方案智能推荐系统》
> 本文是开发与评审的单一真相源；实施计划由 writing-plans 基于本文生成。

---

## 1. 目标、范围与成功标准

### 1.1 目标

交付一个可演示的 **LLM + RAG + 向量知识库 + 前后端** 系统：输入养护场景（气候/荷载/病害/约束），输出 Top-N 沥青材料方案、多方案对比（雷达图）、可溯源推荐报告与证据链，支持工程师微调确认。

### 1.2 范围边界（已确认）

| 范围 | 内容 | 归属 |
|---|---|---|
| **做** | 模块 B 召回（关系表硬过滤 + 混合检索）、模块 D（LLM+RAG 报告生成、多方案对比、证据链）、模块 F（前后端原型）、知识库管理、5 案例、对话面板 | 本项目 |
| **不做（队友）** | 模块 A（场景→性能映射）、模块 C（性能预测模型） | 队友，经契约对接 |
| **不做（文档级）** | 模块 E 反馈闭环（仅概念设计 + `/api/v1/feedback` stub） | 文档 |

### 1.3 成功标准

1. `pnpm install && pnpm build:index && pnpm dev` 三命令一键起系统；
2. 5 个典型案例端到端跑通（mock 模式下报告必含候选方案 + 非空证据引用）；
3. 金标准 20 条检索用例 recall@k 全部通过；
4. 三视图 + 对话面板可用，浏览器验证 console 无报错；
5. 三类降级路径（LLM 挂 / 适配器挂 / 向量库空）均可演示且系统不崩；
6. `docs/DELIVERY.md` 技术交接文档齐全；
7. 全部语料标注来源，模拟数据有角标；
8. 匿名合规：UI 文案、文件名、git 历史无身份信息。

---

## 2. 背景与约束

- **赛题**：企业揭榜赛道课题一；交付形态为创意方案 + 可演示原型，硬约束提交 2026-10-25 12:00、审核 2026-10-23 12:00，功能冻结定 **10-22**。
- **匿名红线**（参赛指南）：作品各部分（含源代码、文件名、演示）不得出现培养单位、导师、队员身份信息。
- **本机环境**：Node 24.21 / pnpm 12.11（现代可用）；Python 3.8.10（已 EOL，本方案不依赖）；GPU 未确认用于推理（bge-m3 走 CPU 足够）；MinerU PDF→Markdown 提取管线已实测可用（3 页/11.5s）。
- **LLM**：DeepSeek API（OpenAI 兼容），key 走 `.env`（不进 git）。
- **语料现状**：149 条文献题录已核验；81/149 全文在手（`reference/` 63 份唯一 PDF + `City_Contest/ref/` 50 份）；规范 PDF 原文 8 份（JTG 3410/5142/5210/5421/F40/D50 等）；材料-性能关系专项 PDF 7 份。11 份扫描件无文字层需 OCR（MinerU 已备）。

---

## 3. 总体架构

### 3.1 单仓结构（pnpm workspace，git 根 = `/bigdisk/lhg/road_rec`）

```
road_rec/
├─ apps/web/             Vue 3 + Vite 前端
├─ apps/server/          Hono 后端（Node 24）
├─ packages/contracts/   zod 契约 schema + 字段注册表（单一真相源）
├─ packages/retrieval/   VectorStore 接口 + LanceDB 实现 + SQLite(FTS5+vec) 降级实现
├─ scripts/              build-index.ts 等入库/校验脚本
├─ data/corpus/          语料真相源（文本，git 版本化）
├─ prompts/              LLM 提示词模板（git 版本化）
├─ docs/                 spec / 实施计划 / DELIVERY.md / 作战计划
└─ City_Contest/         比赛资料（原档；ref 大 PDF 不入 git）
```

> git 策略：原始 PDF（`reference/`、`City_Contest/ref/`、`reference.zip`、`.tools/`、`.analysis/`、`.mineru/`、`.npm-cache/`）不入 git；**派生的文本语料（`data/corpus/`）与全部代码/文档入 git**。原始 PDF 是上游原料，文本语料是可重建索引的真相源。

### 3.2 运行时拓扑

```
Vue3 前端（三视图 + 对话面板）
   │ REST（/api/v1，zod 校验，OpenAPI 自动生成）
Hono 后端
   ├─ orchestrator        主流程 POST /api/v1/recommend（六步 pipeline）
   ├─ adapters/           模块A客户端 / 模块C客户端（env 切换 mock ⇄ 队友真实服务）
   ├─ retrieval/          VectorStore 混合检索（LanceDB 默认；SQLite 降级）
   ├─ relation/           better-sqlite3 材料-性能-场景关系表（SQL 硬过滤）
   ├─ embedding/          transformers.js 本地 bge-m3（CPU，中英均衡）
   └─ llm/                openai SDK → DeepSeek（.env 配置，mock 模式可关）
```

### 3.3 关键取舍（决策记录 D1–D9，依据见 §13）

- **D1 全 TypeScript**：Node 24 是本机最现代运行时；Python 3.8 已 EOL。
- **D2 不引入 agent 框架**：主流程是确定性六步 pipeline，无状态机/多 agent/长时工作流；自研编排约 200 行。Mastra/LangGraph 列入赛后演进（§15）。
- **D3 向量库默认 LanceDB、降级 SQLite**：嵌入式零运维；稳定性靠四道防线（§4）而非"选一个不会坏的引擎"。
- **D4 embedding = bge-m3（transformers.js 本地）**：中英均衡（团队要求）；备选 multilingual-e5-small；换模型强制全量重建。
- **D5 LLM = DeepSeek API**：openai SDK + 结构化输出；开发期 mock-first。
- **D6 后端 Hono**：TS 优先、轻量、zod-openapi 免费得 OpenAPI 文档。
- **D7 报告 = 结构化 JSON**：数值全确定性计算，LLM 只写文案；前端组件化渲染，规避 XSS。

---

## 4. 检索层四道防线（回应"向量库不稳定怎么办"）

产业界共识：**向量库是可重建的缓存，不是真相源**（向量 = f(源文档, 切块策略, embedding 模型, 模型版本)；验收标准 = 删掉整个向量库能否从语料一键重建）。

1. **接口抽象（防引擎不稳）**：`packages/retrieval` 定义 `VectorStore` 接口（`add / search / delete / rebuild / stats`）。
   - 默认实现：LanceDB（向量 + FTS 混合检索，官方支持）。
   - 降级实现：SQLite **FTS5(BM25) + sqlite-vec 精确 KNN**（零索引损坏面；语料量级下精确检索更快）。`RETRIEVAL_BACKEND=sqlite|lancedb` 切换，业务代码零改动。
2. **语料即真相源（防数据丢失）**：`data/corpus/` 进 git；`pnpm build:index` 全量重建（本规模秒级）。向量库损坏 = 重跑一条命令，不是事故。
3. **Provenance 元数据（防静默漂移）**：每条 chunk 记录 `source_doc_id / content_hash / embedding_model / model_version / dim / pipeline_rev / embedded_at`。**换 embedding 模型强制全量重建**——杜绝"旧向量 + 新查询"的静默检索漂移（不报错、检索悄悄变差，产业界踩过的大坑）。
4. **金标准回归集（防质量塌方）**：`scripts/golden-set.ts` 约 20 条「查询→期望命中文档」用例（5 场景 × 4 类语料）；换引擎/换模型/改切块后跑 recall@k 断言，不通过不允许切换。

---

## 5. 核心数据流（POST /api/v1/recommend 六步）

```
① 场景解析    表单结构化输入 zod 校验；可选自由文本→LLM 抽取成同构 JSON
② 调模块A     adapters: 场景 → 目标性能向量 + 优先级权重（mock=内置JTG简化查表基线）
③ 召回(核心B) 关系表 SQL 硬过滤 → 混合检索(向量+BM25, RRF 融合) → Top-N 候选（默认 N=5，可配 3–8）+ 证据引用
④ 调模块C     adapters: 每个候选配方 → 多性能预测值+置信区间（mock=基准表+固定seed扰动）
⑤ 确定性排序  按A权重对C预测加权 + 约束惩罚；雷达图8维/LCC/碳排放 全规则计算
⑥ LLM报告生成 DeepSeek 写推荐理由与结论文案（结构化输出 zod 校验重试≤2）
   附：对话面板  以当前报告+证据为上下文回答追问（单次无工具 LLM 调用，SSE 流式）
```

**量化红线**：排序、雷达图数据、LCC/碳排放估算**全部确定性计算**，LLM 不参与任何数值；prompt 强制"只能引用传入证据 id，不得编造"。

**检索细节**：切块——知识条目/规范条文按条目切（200~500 字）；文献全文（PDF→MinerU/pdftotext→Markdown）按标题/段落切；文献题录一条一 chunk。融合用 RRF（免调权重、稳健）。rerank 默认不做（语料小），本地 bge-reranker 作加分项。

**LLM 细节**：`deepseek-chat`；报告温度 0.3、场景解析 0；function calling / JSON mode + zod 校验失败重试≤2；prompt 模板 `prompts/` 版本化。

**三档降级**：

| 故障 | 行为 |
|---|---|
| 模块 A/C 不可达或校验不过 | 切 mock，报告标 `adapter_mode: mock`，前端"模拟数据"角标 |
| LLM 失败 | 模板文案降级，`llm_status: degraded`，确定性部分照常渲染 |
| 向量库空/损坏 | 健康检查报警 + 提示执行 `pnpm build:index`；检索返回空证据并明确标注 |

---

## 6. 数据模型与语料

### 6.1 关系表（better-sqlite3，`data/db/app.db`，可重建不入 git）

- `materials`：id / type（沥青品种·级配·改性剂·助剂·混合料）/ name / specs(JSON：标号、PG、掺量范围) / source_ref
- `relations`：material_id / property（高温PG·低温PG·疲劳·水稳TSR·E*·成本·碳排）/ effect / direction(±) / magnitude（定量描述）/ applicable_scene（场景标签）/ source_ref(DOI或规范号)
- `cases`：5 个预置案例（场景 JSON + 期望方案）
- `scene_tags`：**场景标签体系词典**（需求(1) 要求标准化场景描述，支撑检索与案例匹配；G2）

### 6.2 VectorStore 集合 `chunks`

- `id = {doc_id}:{chunk_idx}:{model_version}`；vector（bge-m3，1024 维）；text；FTS 索引列
- metadata（provenance，§4 防线 3）：source_doc_id / content_hash / embedding_model / model_version / dim / pipeline_rev / embedded_at / doc_type（知识条目·规范·文献·企业资料）/ tags

### 6.3 语料清单

| 语料 | 来源 | 形态 | 规模预估 |
|---|---|---|---|
| 材料-性能-场景知识条目 | 文献调研报告 §3.2/3.3 + `reference/材料-性能关系/` 7 份全文 | 人工整理 JSON → 关系表 + 切片 | 80~120 条 |
| 规范条文 | 8 份规范 PDF 原文（JTG 系列），MinerU 提取后按条文切 | 短条目切片 | 40~80 条 |
| 文献摘要库 | `City_Contest/文献调研.xlsx`（149 条题录）自动脚本转换 | 一条一 chunk | ~149 条 |
| 文献全文（可选二期） | `reference/` 63 份全文 PDF | MinerU → Markdown → 章节切 | 增量 |
| 企业资料 | 揭榜需求 PDF + 后续企业提供文件 | 知识库页上传→切块入库 | 增量 |

### 6.4 入库 pipeline（`scripts/build-index.ts`）

语料 → 清洗 → 切块 → bge-m3 嵌入 → 写 VectorStore + 关系表种子 → 输出统计；按 content_hash 幂等跳过；`--rebuild` 全量重建。**这是"可重建缓存"防线的执行者。**

---

## 7. 接口契约（字段可演进设计）

字段结构只定"够 MVP 跑通"的形态，演进机制内建：

1. **版本化**：每条消息带 `schemaVersion`；contracts 包按 v1 namespace 组织；URL 前缀 `/api/v1`。
2. **宽容解析**：全部 schema 用 `passthrough()` + `safeParse`——未知字段保留不丢；新字段一律 optional；只增不删，删除走"弃用标记"。
3. **schema 驱动 UI**：contracts 附字段注册表（label/单位/控件类型/选项），前端表单由注册表渲染——**改字段 = 改 contracts 一处，表单自动跟随**。
4. **mock 编译期绑定**：mock A/C 数据生成器直接引用 contracts 类型，契约变更 mock 编译报错提醒同步。
5. **部分可用语义**：队友响应缺字段（如 C 不给置信区间）→ 不整体失败；雷达图省区间并标"置信区间不可用"。

**契约核心（packages/contracts，zod）**：

- `SceneInput`：climate{zone, pgHigh, pgLow} / traffic{level, esal} / pavement{layer, structure} / distresses[{type, severity}] / constraints{budget, schedule, env, noise} / notes（自由文本）
- 模块 A：`POST /mapping {SceneInput} → TargetProfile {targets:[{perf,value,unit}], priorities:[{perf,weight}]}`
- `Formula`：binder{type,grade,pg} / modifier{type,dosage} / gradation{type} / additives[{type,dosage}] / oilStoneRatio / airVoids / construction{mixingTemp,pavingTemp,compaction}（施工工艺参数 optional，回应需求瓶颈三）
- 模块 C：`POST /predict {formulas[]} → [{formula, predictions:[{perf,value,ciLow,ciHigh,unit}], explanations?:[{feature,contribution}]}]`（explanations 承接队友 SHAP 输出，G4）
- `RecommendationReport`：scene / targets / candidates[] / evidence[] / charts（雷达图 **8 维**：高温·低温·疲劳·水稳·LCC·碳排放·预期寿命·施工可行性，G3）/ benchmark（vs 规范查表基线对比行，G6）/ llm_status / adapter_mode / schemaVersion

**后端 REST（Hono + zod-openapi）**：

| 端点 | 说明 |
|---|---|
| `POST /api/v1/recommend` | 主流程（普通 JSON；SSE 加分项） |
| `POST /api/v1/chat` | 对话面板（SSE 流式，降级普通请求） |
| `GET /api/v1/cases` · `/cases/:id` | 5 个预置案例 |
| `GET /api/v1/kb/stats` · `POST /kb/documents` · `POST /kb/search` | 知识库统计/上传入库/检索测试 |
| `POST /api/v1/kb/rebuild` | 重建索引 |
| `GET /api/v1/health` | vectorStore 状态 + llm 配置 + A/C mock/real |
| `POST /api/v1/feedback` | stub（模块E 概念设计落点，G9） |

**mock 语义**：`.env` 中 `MODULE_A_ENDPOINT` / `MODULE_C_ENDPOINT` 为空 → 内置 mock；mock A = 文献调研的"规范查表基线"规则表；mock C = 配方-性能基准表 + 固定 seed 扰动（演示可复现）。响应带 `adapter_mode`，前端角标。

---

## 8. 前端设计（Vue 3 + Vite + Element Plus + ECharts + Pinia）

**三视图 + 对话面板**：

1. **推荐工作台**（主视图）：左栏 = schema 驱动场景表单 + 5 案例一键填入 + 微调面板；右栏 = 步骤状态条（解析→映射→召回→预测→排序→报告，每步状态/耗时）→ 目标性能+权重 → 结果区（多方案卡片 / 8 维雷达图 / 与基准对比表 / 证据链 / 报告 / 对话面板）。微调参数→重新推荐复用同 pipeline（G5）。
2. **典型案例页**：5 案例卡片（高温重载 / 寒冷裂缝 / 水损害 / 高RAP再生 / 低噪排水）→ 一键载入工作台跑通 + 预跑结果。
3. **知识库管理页**：统计（文档/chunk/类型分布）+ 上传（企业资料 PDF/MD/粘贴文本）+ 检索测试框（top-k 命中 + 来源元数据 + 分数）+ 重建索引按钮。

**技术要点**：Vite proxy `/api`→3000；报告结构化 JSON 组件化渲染（仅 LLM 文案段落渲染为文本，防 XSS）；证据链引用角标点击展开 chunk；SHAP 瀑布图有数据才渲染；`adapter_mode` 徽章；健康指示。开发时加载 `vue-best-practices` / `vue-pinia-best-practices` / `vue-router-best-practices` / `vue-testing-best-practices` 技能并遵循 Vue 官方 Style Guide + eslint-plugin-vue。

---

## 9. Gap 核对（对照赛题要求逐条闭环）

| # | 缺口 | 处理 |
|---|---|---|
| G1 | 对话问答区（分工表 task 8/11 要求） | ✅ 加轻量对话面板（§5 第⑥步附） |
| G2 | 场景标签体系（需求(1)） | ✅ `scene_tags` 词典入关系表（§6.1） |
| G3 | 雷达图缺预期寿命/施工可行性（需求(2) 六维） | ✅ 六维雷达图 + 规则估算（§5⑤、§7） |
| G4 | SHAP 可解释（需求(3)，队友 C 输出） | ✅ C 契约 optional `explanations`，前端有则画瀑布图 |
| G5 | 人工微调确认（需求(4) 全流程末步） | ✅ 微调面板→重新推荐（§8） |
| G6 | 与基准对比（预期成果(3)） | ✅ 报告含 vs 规范查表基线对比行 |
| G7 | 技术交接（预期成果(4)） | ✅ `docs/DELIVERY.md`（数据结构/字段/接口样例/模块关系/数据需求） |
| G8 | 匿名红线（参赛指南） | ✅ 交付清单含匿名合规检查（§11） |
| G9 | 反馈闭环（需求(2)，加分项） | ✅ 文档级概念设计 + `/api/v1/feedback` stub |
| G10 | 时间口径 | ✅ 时间线以 10-22 冻结、10-23 审核、10-25 12:00 提交排 |

---

## 10. 测试与质量

- **contracts 单测**（vitest）：passthrough / 版本校验 / 注册表完整性。
- **金标准回归**：~20 条「查询→期望命中」recall@k 断言（§4 防线 4）。
- **端到端**：5 案例 mock 模式断言（报告必含候选 + 证据引用非空 + 确定性数值一致性）。
- **降级路径**：LLM 挂 / 适配器挂 / 向量库空 三场景测试。
- **浏览器手测**：复用已装 chrome-devtools-mcp——三视图 + 对话面板走查，console 无报错，截图存档。
- **不做**：完整 UI 自动化、性能压测。

---

## 11. 交付物与合规

1. 可运行系统：README 三命令一键起（`pnpm install && pnpm build:index && pnpm dev`）。
2. `docs/DELIVERY.md`：数据结构、输入输出字段、接口样例、模块关系、数据需求说明（G7）。
3. 演示脚本（7 步流程台词）+ 录屏素材支持（OBS/录屏后剪辑）。
4. 匿名合规清单：UI 文案 / 文件名 / git 历史 / 打包产物中无身份信息（G8）。
5. 语料来源标注：每条知识条目/规范条文带 DOI 或规范号；模拟数据标注"模拟"。
6. git 身份已设为中性（`contest-team`），仓库内不得提交真实姓名。

---

## 12. 时间线与风险预案

**时间线**（自 2026-10-17 起，6 个工作日，10-22 冻结）：

| 天 | 日期 | 内容 |
|---|---|---|
| D1 | 10.17 | 仓库/契约/骨架/mock A-C；知识条目语料整理开工（内容工程先行） |
| D2 | 10.18 | 入库 pipeline + 检索链路 + 金标准集 |
| D3 | 10.19 | 报告生成 + 对话面板（后端） |
| D4 | 10.20 | 前端三视图 + 联调 |
| D5 | 10.21 | 5 案例端到端 + 降级路径 + 演示脚本 |
| D6 | 10.22 | 功能冻结、美化、录屏素材、DELIVERY.md、匿名检查 |

**风险预案汇总**：

| 风险 | 预案 |
|---|---|
| HF 下载 bge-m3 慢/不通 | `HF_ENDPOINT=https://hf-mirror.com`；备选 multilingual-e5-small（471MB），换模型强制全量重建 |
| LanceDB JS SDK 踩坑 | `RETRIEVAL_BACKEND=sqlite` 切 SQLite FTS5+sqlite-vec 降级实现 |
| 演示现场 LLM 不可用 | 模板文案降级渲染，确定性部分不受影响 |
| 队友契约变更/不可用 | schemaVersion 演进 + passthrough + mock 兜底 |
| 语料整理延期 | 砍到"5 案例 × 关键 30 条"最小集，其余赛后补 |
| MinerU/OCR 提取慢 | 已有 8 份规范 PDF 的提取优先级最高；文献全文提取为二期 |

---

## 13. 决策记录（含调研依据）

| # | 决策 | 依据 |
|---|---|---|
| D1 | 全 TypeScript | Node 24 现代可用；Python 3.8 EOL（torch/chromadb 新版不支持） |
| D2 | 不引入 agent 框架 | [AgentMail 2026 九框架实测](https://www.agentmail.to/blog/best-ai-agent-frameworks-2026)：单 agent + 少量工具 + 无持久化 → 自编编排是正当架构；Mastra 240 依赖 176MB |
| D3 | LanceDB 默认 + SQLite 降级 + 四道防线 | [向量库即缓存](https://hackernoon.com/lite/why-your-vector-database-should-be-treated-like-a-cache)（Dell 首席工程师）；[嵌入式向量库 2026 对比](https://dreaming.press/posts/lancedb-vs-sqlite-vec-vs-duckdb.html)（sqlite-vec 零索引损坏面）；静态小语料性能过剩，稳定性靠接口+重建+金标准 |
| D4 | bge-m3 本地 embedding | 中英均衡需求；[Xenova/bge-m3](https://huggingface.co/Xenova/bge-m3) transformers.js 官方移植 |
| D5 | DeepSeek API + openai SDK | 团队已有 key；OpenAI 兼容 |
| D6 | Hono 后端 | TS 优先、zod-openapi 自动文档 |
| D7 | 报告结构化 JSON | 量化红线（LLM 只写文案）；组件化渲染防 XSS |
| D8 | Pi agent 不适用 | [enjoyZhou/pi](https://github.com/enjoyZhou/pi) 是终端编程助手 CLI，非可嵌入应用框架 |
| D9 | Milvus 不选 | 完整版需 server；Milvus Lite 仅 Python，Node 后端不可用 |

## 14. 赛后演进方向（不进 MVP）

1. agent 框架化：Mastra / LangGraph JS（当流程出现多分支/持久状态时）；
2. 本地 bge-reranker-base 精排；多路召回扩展（稀疏 bge-m3）；
3. 真实模块 A/C 接入（契约已就绪）；GraphRAG 知识图谱层；
4. 反馈闭环落地（`/api/v1/feedback` stub → 增量学习）；
5. 文献全文语料二期入库；企业脱敏数据接入；
6. 部署化：docker compose / 公网演示环境。
