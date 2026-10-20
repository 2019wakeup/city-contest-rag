# 技术交接文档（DELIVERY）

> 对应赛题预期成果 (4)：可复用的数据与技术交接成果
> 面向对象：后续接手研发的工程师 / 揭榜企业研发团队
> 配套：README（运行）· spec（设计）· plan（任务分解）· docs/reviews/（评审记录）

## 1. 系统概览与模块关系

```
┌────────────────────── apps/web（Vue3 三视图）──────────────────────┐
│ /recommend 工作台 │ /cases 典型案例 │ /knowledge 知识库管理          │
└───────────────┬────────────────────────────────────────────────────┘
                │ REST /api/v1（JSON；报告为结构化 JSON，非 Markdown）
┌───────────────▼──────────────────── apps/server（Hono）─────────────┐
│ 六步 pipeline：解析→模块A映射→召回→模块C预测→确定性排序→LLM报告       │
│ adapters/：模块 A/C 客户端（mock ⇄ 真实服务，env 切换，zod 校验降级）  │
│ relation/：better-sqlite3 换成 node:sqlite（Node 24 内置，零原生依赖）│
│ llm/：openai SDK→DeepSeek；失败→模板文案降级（llmStatus: degraded）   │
└───┬──────────────────┬───────────────────────┬──────────────────────┘
    │                  │                       │
┌───▼─────────┐ ┌──────▼──────────┐ ┌──────────▼───────────┐
│ packages/   │ │ packages/       │ │ data/                │
│ retrieval   │ │ embedding       │ │ corpus（真相源，git） │
│ VectorStore │ │ transformers.js │ │ db、index（可重建，  │
│ 接口 + 2 实现│ │ bge-m3/e5-small │ │ 不入 git）           │
└─────────────┘ └─────────────────┘ └──────────────────────┘
```

**关键设计红线**（改动前必读）：
1. **量化红线**：排序/雷达图/LCC/碳排放全部确定性计算；LLM 只写文案，prompt 禁止编造 evidenceIds（代码层有过滤兜底）。
2. **向量库是可重建的缓存**：真相源 = `data/corpus/`；索引随时 `pnpm build:index --rebuild` 重建（秒级）。换 embedding 模型 = 必须全量重建（chunk provenance 的 modelVersion 变化触发）。
3. **契约可演进**：所有消息 zod `.passthrough()` + `schemaVersion:'1'`；新字段一律 optional；改 contracts = 改一处（前端表单由 FIELD_REGISTRY 驱动）。
4. **三档降级**：A/C 不可达→mock（adapterMode 角标）；LLM 不可用→模板文案；向量库空→warnings 标注且主流程完成。

## 2. 数据结构（核心表与集合）

### 2.1 关系表（`data/db/relation.db`，SQLite，自动种子自 data/corpus）

| 表 | 字段 |
|---|---|
| materials | id, type（binder\|gradation\|modifier\|additive\|mixture）, name, specsJson, sourceRef |
| relations | id, materialId, property（高温PG/低温PG/疲劳/水稳TSR/E*/成本/碳排…）, effect, direction(±), magnitude（定量描述）, applicableSceneJson（标签数组）, sourceRef |
| scene_tags | id, label, kind（climate/traffic/distress/constraint）, synonymsJson |
| cases | id, title, sceneJson, expectedJson（5 个典型案例） |

### 2.2 向量库（`data/index/lancedb` 或 `sqlite.db`）

- collection `chunks`：id（`{docId}:{chunkIdx}`，两段式等价替代 model_version 段——见 §5 遗留项 C3）、vector、text、docType、tags、provenance
- provenance 七字段：sourceDocId / contentHash / embeddingModel / modelVersion / dim / pipelineRev / embeddedAt
- 混合检索：BM25（FTS5 trigram，中文）+ 向量余弦 → RRF(k=60) 融合 → docTypes/tags 过滤 → topK

### 2.3 语料（`data/corpus/`，git 版本化）

| 路径 | 内容 | 规模 |
|---|---|---|
| knowledge/entries.json | 知识条目（实体+定量关系，全部 DOI/规范号溯源） | 42 条材料 × 94 维度块（拆分后入库 94 个维度 chunk） |
| standards/*.md | 8 份规范条文摘录（JTG 3410/5142/5210/5421/F40/D50 + AASHTO） | 57 条文 |
| literature/from-xlsx.json | 文献题录（由 City_Contest/文献调研.xlsx 脚本转换） | 142 条（109 含 DOI） |
| literature-full/*.md | 「材料-性能关系」7 篇文献全文（按章节切块入库，溯源头部含原 PDF 路径） | 7 篇 |
| cases/cases.json | 5 典型案例（场景+期望方案） | 5 |
| scene-tags.json | 场景标签词典 | 27 标签 |

### 2.4 全文语料交接资源（`literature_md/`，不入 git）

81 份已获取全文 PDF 的 MinerU 提取产物，按原分类组织（共 126 个文档目录、990 万字符、4,552 张图、797MB）：

```
literature_md/
├── INDEX.md                总索引
├── reference/{背景知识(67),推荐算法(9),评估方法(7),材料-性能关系(7),规范标准(6),开源代码(2),数据集(1)}/  # 其中 40 篇全文精选入库
└── city_contest_ref/       按调研序号命名的 26 个文档目录
    每个文档目录/
    ├── markdown.md             正文（图片相对路径引用）
    ├── images/                 外置图片
    ├── middle_json.json / structured_content.json / model_output.json   结构化中间结果
    └── SOURCE.txt              原始 PDF 路径与页数
```

- **已入索引**：「材料-性能关系」7 篇全文（`data/corpus/literature-full/`，按章节切块，证据链可引用原文段落）。
- **交接用途**：其余 119 篇全文供企业后续研发——扩充知识库、微调模型、人工精读。入库方式：复制对应 `markdown.md` 至 `data/corpus/literature-full/` 后重跑 `pnpm build:index --rebuild`（章节自动切块，provenance 自动生成）。

## 3. 输入输出字段（契约）

- 契约唯一来源：`packages/contracts/src/schemas.ts`（zod）+ `src/registry.ts`（字段注册表）
- 导出给队友的 JSON Schema：`toJsonSchema(...)`（详见 contracts 包）
- 核心消息：
  - `SceneInput`：climate{zone,pgHigh,pgLow} / traffic{level,esal} / pavement{layer,structure} / distresses[{type,severity}] / constraints{budget,schedule,env,noise} / notes
  - 模块 A：`POST /mapping {SceneInput} → TargetProfile{targets,priorities}`
  - 模块 C：`POST /predict {formulas[]} → [{formula,predictions[{perf,value,ciLow,ciHigh,unit}],explanations?}]`
  - `RecommendationReport`：scene/targets/candidates[]（含 formula、predictions、radar 8 维、lcc/carbon/expectedLife、evidenceIds）/evidence[]/benchmark[]/sections[]/steps[]/llmStatus/adapterMode/warnings

## 4. 接口样例（curl）

```bash
# 健康检查
curl http://localhost:3010/api/v1/health
# → {"vectorStore":{"backend":"lancedb","count":241,"ok":true},"llm":{"configured":false},"adapters":{"a":"mock","c":"mock"}}

# 推荐（案例场景可取自 data/corpus/cases/cases.json）
curl -X POST http://localhost:3010/api/v1/recommend \
  -H 'content-type: application/json' \
  -d @<(python3 -c "import json;print(json.dumps(json.load(open('data/corpus/cases/cases.json'))[0]['scene']))")

# 知识库检索
curl -X POST http://localhost:3010/api/v1/kb/search \
  -H 'content-type: application/json' -d '{"query":"车辙 SBS","topK":5}'

# OpenAPI 文档
open http://localhost:3010/openapi
```

## 5. 遗留项与假设（诚实标注）

| 编号 | 事项 | 状态 |
|---|---|---|
| C3 | chunk id 两段式（无 model_version 段），由 manifest 的 modelVersion 等价替代 | 已知，保持 |
| C5 | e5-small 无 query/passage 前缀（bge-m3 亦无需） | 已知，保持 |
| C7 | manifest pipelineRev 在无 git 环境下为 'unknown' | 已知，兜底 |
| R22 | 演示 embedding 用 multilingual-e5-small；bge-m3 因本机网络（huggingface.co 不可达）暂不可用，网络恢复后可切换（换模型强制重建） | 环境限制 |
| R24 | case-02 低温场景 top-1 为环氧沥青（mock 数据领域合理性）；真实模块 A/C 接入后自然消除；演示按 top-5 口径 | 演示口径 |
| — | 模拟数据：模块 A/C 的 mock（固定 seed 42 确定性）与 LCC/碳排规则估算均为演示数据，接入真实数据/模型后替换 | 明确标注 |

## 6. 数据需求说明（供企业后续研发）

1. **材料产品体系数据**：沥青品种/改性剂/级配/助剂的产品规格、掺量范围、价格（用于关系表与 LCC 估算——当前为公开文献数据）。
2. **工程案例数据**：场景（气候/荷载/病害）→ 实际配方 → 实测性能，用于扩充案例库与验证推荐。
3. **路用性能监测数据**：实施后性能回传，用于 `/api/v1/feedback`（当前为 stub）落地"推荐→验证→优化"闭环（模块 E）。
4. **模块 A/C 模型**：队友按 §3 契约实现 `/mapping`、`/predict` 后，`.env` 填 `MODULE_A_ENDPOINT`/`MODULE_C_ENDPOINT` 即切换真实实现。

## 7. 代码与测试交接

- 全仓测试：`pnpm test`（contracts 5 / retrieval 14 / embedding 9 / server 37 / web 40 / scripts 28+skip）
- 金标准：`data/golden/golden.json` **38 条**（8 维度 × 4 语料类），评估口径为**混合检索**（text + query 向量，与生产一致；`--bm25` 回退纯关键词离线模式），doc 级期望（topK×3 命中按 sourceDocId 去重取前 5 文档）→ recall@5 = **38/38**（lancedb）
- 检索策略与可调项：混合检索（BM25+向量 RRF，融合权重默认 1:1，`HYBRID_WEIGHTS=bm25,vec` 可调）；**MMR 默认关闭**（实测在本语料下 MMR=on 去重 8–12/15、文献参与 17/25，劣于 off 的 13–14/15、22/25；`MMR=on` 可显式开启并配 `MMR_LAMBDA`/`MMR_POOL` 调参）；LLM 批量重排（5 查询×6 命中，~2.2–2.6s，超时/失败自动回退 RRF 原序）
- 引用支撑率（faithfulness）：`scripts/faithfulness-eval.ts`（LLM 裁判：报告段落主张是否被「证据 + 完整确定性数据」支撑；`--calibrate` 人造幻觉自检必须判不支撑）→ 5 案例 **49/49 段 = 100%**，阈值 85%
- 证据多样性：每候选 3 条、15 槽位去重 13–15 条、任意两候选集合互异、文献/规范/表格/章节类参与 25/25
- 端到端：`pnpm e2e`（5 案例 + 三档降级）
- 评审记录：`docs/reviews/`（R1–R4 通过；R5 见文件）
