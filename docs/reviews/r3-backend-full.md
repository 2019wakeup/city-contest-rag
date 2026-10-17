# R3 评审报告 — 后端整体 T1–T10（contracts/retrieval/server/prompts）

- **评审人**：critic（独立评审，代码只读）
- **日期**：2026-10-17
- **Commit 范围**：`ae82bd0`..HEAD（截至 `68e0db3` T10；中间含 T6/T7/T8/T9 及 R1/R2 修复）
- **覆盖路径**：`packages/contracts/`、`apps/server/`、`prompts/`、根 `package.json`/`pnpm-workspace.yaml`/`tsconfig*.json`/`.env.example`；R1/R2 已审文件仅查交叉面
- **对照依据**：spec §1.3（成功标准）、§5（六步 pipeline/量化红线/三档降级）、§7（契约）、§8（前端依赖）、Global Constraints；计划 T1/T6/T7/T8/T9/T10 Interfaces；Review Focus #1–#4

## 结论：CHANGES_REQUIRED

1 条 Critical（候选组装/排序对场景不敏感——5 案例 top-1 恒为同一组合，实证复现）、1 条 Important（server 构造 LanceDBVectorStore 未传 dim，与实机 e5(384) 不匹配致 kb 上传/重建必 500，实证复现）、若干 Minor。契约/passthrough/降级/量化红线/匿名/SSE 全部核查通过；测试 28/28 亲跑通过但未覆盖上述两缺陷。

---

## 一、发现清单

### C1 · Critical · 候选组装与排序对场景不敏感：5 案例 top-1 恒为「SBS 改性沥青 + 高 RAP 掺量再生混合料」

- **位置**：`apps/server/src/orchestrator.ts:253-299`（assembleCandidates 命中计数与 top-5 选取）、`apps/server/src/adapters/mock-a-rules.ts:12-39`（BASE_TARGETS 恒含全部 8 维）、`apps/server/src/relation/db.ts:1235-1270`（filterByScene 的 `property ∈ targets` 子句）
- **机制**：mock A 对**任何**场景都输出同样的 8 个目标属性（仅数值不同）→ `filterByScene` 的 `property ∈ targets` 子句恒匹配几乎所有材料（8 个常见属性覆盖了绝大多数 relations）→ 硬过滤近乎失效 → `assembleCandidates` 按 relations 命中数排序后，前 5 组合池在 5 个案例间几乎相同 → 加权排序在同一候选池上归一化后，SBS 在全部案例中胜出。
- **实证（critic 用真实语料关系表 + 真实索引亲跑 5 案例 recommend，embedder=null 不影响候选链路）**：
  - case-01/02/03/04/05 的 top-1 **全部**为「SBS 改性沥青 + 高 RAP 掺量再生混合料」，score 0.5984–0.6756；
  - cases.json 期望方案无一命中 top-1（case-02 期望橡胶粉/SBR 低温方案 → 实际 top-1 SBS+高RAP，且其 modifier 选到「SBS 掺量梯度（OGFC 高粘体系）」——对寒冷裂缝场景明显不当；case-05 期望高粘高弹+OGFC → 实际 top-2 才是 OGFC，top-1 仍为高RAP 再生）；
  - case-02/03/05 的候选池与 case-01 仅 1–2 个条目不同，top-1 无差异。
- **为何 Critical**：演示系统的核心叙事（场景 → 差异化方案 → 多方案对比）失效；spec §1.1/§1.3-2 与 5 案例 curated 期望（cases.json）均未达成。**这是"计划规则照字面实现、但 emergent 行为违反 spec 意图"的情形**：计划 T6/T7/T8 的规则各自成立，组合后硬过滤退化。按分工由 Lead 裁决修复方向。
- **修复方向建议（供 Lead 裁决，二选一或组合）**：① mock A 只输出场景相关目标子集（病害/约束驱动，而非恒 8 维）；② filterByScene/命中计数只统计「applicableScene ∩ tags」且按 tags 命中数加权，`property ∈ targets` 仅作次级加分；③ top-5 选取改为按场景优先级加权命中数。修复后应加断言：5 案例 top-1 互不相同且与 cases.json expected.formulas 方向一致（可放宽为"top-3 覆盖期望方向"）。

### C2 · Important · server 构造 LanceDBVectorStore 未传 dim：lancedb 后端 + e5(384) 下 kb 上传/重建必 500

- **位置**：`apps/server/src/index.ts:37`（`new LanceDBVectorStore(join(indexDir, 'lancedb'))`，缺省 dim=1024）与 `:47-48`（store 先于 embedder 构造）；`packages/retrieval/src/lancedb.ts` add 的维度校验
- **实证（critic 用 lancedb 原生依赖复现）**：默认构造（dim 1024）+ 384 维向量 add → 抛「向量维度不匹配：表 dim=1024，实际 384」。当前实机索引正是 e5-small(384)（data/index/manifest.json），即演示环境默认组合（RETRIEVAL_BACKEND=lancedb + e5）下 `POST /kb/documents` 与 `POST /kb/rebuild` 必然 500。recommend 证据检索不走 add 故不受影响；sqlite 后端不受影响。
- **修复建议**：index.ts 先建 embedder 再建 store，`new LanceDBVectorStore(path, { dim: embedder?.dim ?? 1024 })`；embedder=null 时 lancedb 后端的 kb 写入路径要么禁用并给明确 400 文案（"模型不可用，暂不支持上传"），要么让 LanceDB 侧对零向量跳过维度校验（不推荐）。补一条 server 级测试（lancedb+384 fake embedder → kb/documents 200）。

### C3 · Minor · recommend 证据检索硬编码 docTypes，enterprise 文档永不进入证据链

- **位置**：`apps/server/src/orchestrator.ts:510`（`filter: { docTypes: ['knowledge','standard','literature'] }`）
- **问题**：用户经 kb 页上传企业资料（docType='enterprise'）后，推荐报告的证据链永远不会引用它——上传功能的演示价值折损（检索测试框能看到，推荐里看不到）。计划 T8 只写"按类型标签 search top3"未列 enterprise，可辩护为 MVP 口径；但建议把 enterprise 纳入或在前端上传说明中提示"仅供检索测试"。
- **裁决**：Lead 定 MVP 口径即可，不阻塞。

### C4 · Minor · modifier/additive 每管线全局取唯一最优，案例间无差异且可能取到不当条目

- **位置**：`apps/server/src/orchestrator.ts:293-297`（bestOf 全局单值）
- **问题**：所有候选共享同一 modifier/additive（case-02 的 modifier 取到「SBS 掺量梯度（OGFC 高粘体系）」——该条目名称像研究结论而非改性剂材料，语料命名质量问题）。计划明写"每候选至多各 1"且为 MVP 简化，但与 C1 叠加放大场景失配。
- **建议**：随 C1 修复一并处理（至少对 candidate 级 modifier 选择按场景标签过滤）；语料侧该条目名称建议改为材料名。

### C5 · Minor · traffic.level 双口径并存（表单注册表中文值 vs 案例场景英文值）

- **位置**：`packages/contracts/src/registry.ts:46-56`（选项 轻/中/重/特重交通）、`data/corpus/cases/cases.json`（'heavy'/'medium'/'light'）
- **问题**：匹配逻辑（hasAny 兼容中英文）两口径都通，但同一字段两种枚举值不利于维护与金标准。建议统一为中文值（表单即场景，cases 同步改）。

### C6 · Minor · 观察项 C6（trigram-OR 宽松召回）实证判定：证据链质量可接受，降级为记录

- **证据**：critic 用真实语料跑 5 案例，top 候选的证据引用与其材料名直接相关（SBS 候选 → k-binder-002「SBS 改性沥青…」等），未见弱相关条目混入 top3。SQLite 端 trigram-OR 的 precision 风险在"证据查询=候选材料名拼接（短、专名化）"的实际用法下影响有限。LanceDB 端 ngram 2-6 亦正常。
- **维持建议**：R5 端到端复核时抽查 2 个案例的证据文本相关性即可，无需改代码。

### C7 · 裁决（Lead 委托 C3 项）：SearchHit.score 语义——RRF 原始分不直接展示，前端需归一化

- RRF 原始分区间约 0.016–0.07（纯 BM25 单路时 rank1 = 1/61 ≈ 0.016），直接展示为"分数"对人类无意义且视觉像"0.02 分"。
- **裁决**：契约字段不动（保留原始分供排序/调试）；前端 kb 检索展示时归一化为 0–100（相对首位：`score / maxScore × 100`）并保留 3 位小数的原始分于 tooltip，或仅展示排名。R4 门将按此裁决核查 KnowledgeView 的展示实现。

## 二、Spec 符合性核对（通过项）

| 项 | 要求 | 核查结果 |
|---|---|---|
| 契约 passthrough | 全部 API 消息 schema `.passthrough()` | ✅ 28/28 schema 逐一核查（含 server 侧 DocBody/SearchBody/SectionsResponse 本地 schema） |
| schemaVersion | 顶层 schema 带 `'1'` | ✅ `schemaVersionField()` 枚举+default，10 个顶层 schema 全覆盖 |
| FIELD_REGISTRY | 7 必查路径 + label/control | ✅ 全在且中文 label 正确（climate.zone/pgHigh/pgLow、traffic.level、distresses、constraints.budget、notes），另有 7 个扩展路径 |
| toJsonSchema | 含 `$schema`、`type:'object'` | ✅ json-schema.ts 统一注入 draft-07 |
| 量化红线 | LLM 不产任何数值 | ✅ 报告 prompt 明确"不得引入任何新的数值结论"；排序/雷达/LCC/碳排/寿命全部确定性规则计算（orchestrator.ts:975-1088 注释+实现）；LLM 仅写 paragraphs/evidenceIds（字符串）与场景抽取（①步，spec 允许） |
| 证据防编造 | 只能引用传入 evidenceId | ✅ prompt 明写 + 代码层过滤兜底（fallback.ts:1449-1453）+ 测试断言 |
| 三档降级 | LLM 挂/适配器挂/向量库空 | ✅ 均有测试且亲跑过：LLM_OFF 立即 degraded（不触网）；适配器不可达/非契约 → mock（3s 超时 AbortController）；空库 → evidence:[] + warnings 含 build:index 且 200 |
| 六步 pipeline | 解析→映射→召回→预测→排序→报告 | ✅ 结构与 spec §5 一致；steps 耗时记录；adapterMode {a,c}；报告 schemaVersion '1' |
| SSE（R15 格式） | `data {"delta"}` + `event: done` + `{"done":true}`；降级普通 JSON | ✅ chat.ts + llm.test.ts 断言 exact 格式（亲跑 PASS） |
| REST 端点 | 7 类端点 + /openapi | ✅ recommend/cases(/:id)/health/feedback/chat/kb(stats/documents/search/rebuild)/openapi 全在且有路由测试 |
| 端口 | `PORT ?? 3000` | ✅ index.ts:496 |
| 匿名红线 | server/prompts 无身份信息 | ✅ 通读全部文案与 commit（author=contest-team）无实名/单位/导师 |
| `.env` | 不入 git；`.env.example` 六变量齐全 | ✅ .gitignore 覆盖；.env.example 含 DEEPSEEK_API_KEY/BASE_URL、MODULE_A/C_ENDPOINT、RETRIEVAL_BACKEND、HF_ENDPOINT、LLM_OFF（+PORT） |
| 引擎抽象 | 业务代码不得直接 import 具体实现 | ✅ server 仅 import `VectorStore` 类型与两个实现类的**构造**（index.ts 组装层，可接受）；orchestrator/routes 全走接口 |
| R14/R15 裁决落实 | node:sqlite 零原生、SSE 格式 | ✅ relation 层用 node:sqlite；SSE 见上 |

## 三、测试证据核查（critic 亲跑，本轮实测）

| 命令 | 结果 |
|---|---|
| `pnpm -C apps/server test` | **28/28 PASS**（relation 5/adapters 7/llm 8/kb 5/recommend 3 组分布，含 REST/SSE/降级/确定性两遍断言） |
| `pnpm -C apps/server typecheck` | exit 0 |
| `pnpm -C packages/contracts test` | 5/5 PASS |
| C1 复现（真实语料 recommend × 5 案例） | top-1 恒为 SBS+高RAP再生（见上） |
| C2 复现（lancedb 默认 dim + 384 向量） | add 抛维度不匹配（见上） |
| C6 证据链抽查（真实语料 × 5 案例） | 证据与候选材料名直接相关，无弱相关混入 |

**缺口**：28/28 套件没有钉住 C1（无"5 案例 top-1 差异化"断言，T14 e2e 也只断 candidates.length===5——建议 e2e 增补"案例间 top-1 不全部相同 + 期望方向覆盖"断言）；也没有钉住 C2（kb 测试全用 SqliteVectorStore，未覆盖 lancedb+非 1024 维组合）。

## 四、Declined to judge（本次搁置不判）

- 计划规则本身 vs spec 意图的冲突裁量（C1 修复方向）：报 Lead 裁决。
- mock C 基准表数值合理性：演示假设，已注释"模拟数据"，不判。
- 前端实现：R4 门。
- e2e 脚本与浏览器走查：T14/R5。
- 检索质量数字阈值：R5 复核。

## 五、Strengths

- 契约包是教科书级执行：28/28 passthrough、版本字段默认注入、注册表驱动表单、mock 直接引用 contracts 类型（编译期绑定）。
- 六步 pipeline 职责清晰，量化红线在代码结构上得到保证（LLM 输出 schema 只有字符串字段）；证据防编造双保险（prompt+代码过滤+测试）。
- 三档降级全部有真实测试（fake server/不可达端口/空库），非 smoke。
- SSE 格式有 exact 断言；OpenAPI 自动文档可用。
- 测试不依赖真实网络/真实 LLM（注入缝设计干净）。

## 六、复审条件

1. **C1（Critical）**：Lead 裁决修复方向 → builder-backend 实现 → 我复跑 5 案例断言差异化。
2. **C2（Important）**：index.ts 传 dim + 补 lancedb 维度组合测试。
3. C3–C7：C5 建议 R4 前顺手统一；其余记账/转 R4/R5。

---

## Re-review（fix round 1，commit `aa2ffb4` 等，范围 `68e0db3..HEAD` 后端路径）

**复审结论：PASS——C1/C2/C3/C5 全部 ADDRESSED，无新 breakage，R3 门通过（task-18 complete）。**

### 逐条判定

| # | 发现 | 判定 | 证据 |
|---|---|---|---|
| C1（Critical）| 候选组装/排序对场景不敏感 | **ADDRESSED** | mock-a-rules.ts 改为**场景相关目标子集**（高温PG/低温PG 恒在 + 病害/交通/约束驱动增删，不再恒 8 维）；assembleCandidates 的 modifier/additive 改按命中数降序逐候选轮转（消除全局唯一最优）；buildBenchmark 只覆盖目标子集维度。新回归测试「R3-C1 回归」：5 案例 top-1 签名 ≥3 种 + top-5 含 cases.json 期望方向。critic 亲跑 5 案例探针：top-1 现为 4 种签名（SBS+AC / 环氧+高RAP / SBS+高RAP / SBS+OGFC），case-01/03/04/05 top-1 与期望方向吻合（case-02 top-5 含橡胶粉方向） |
| C2（Important）| LanceDB 未传 dim → kb 写入必 500 | **ADDRESSED** | 新 config.ts：`createVectorStore({dim: embedder?.dim ?? 1024})`，index.ts 改为**先 embedder 后 store**；EMBEDDING_MODEL 环境变量解析（非法值启动报错，防 e5 索引+bge-m3 查询的静默维度错配）。critic 实证：dim=384 构造 + 384 维 add **成功**（修复前实测抛错）；config.test.ts 3 条 dim 断言 |
| C3（Minor）| enterprise 不进证据链 | **ADDRESSED** | orchestrator.ts:521 filter 增 enterprise + 测试「R3-C3：enterprise 语料进入证据链」 |
| C5（Minor）| traffic.level 双口径 | **ADDRESSED** | registry.ts 选项值改英文（light/medium/heavy/channelized）与 cases.json 对齐（中文 label 保留）；deriveSceneTags 增加 env/noise 英文取值映射（strict/low-noise → k-env/k-noise-ctl） |
| C4/C6/C7 | — | C7 前端展示已由 1300334 修（R4 复审判）；C4 随 C1 的轮转分配缓解（R4 看效果）；C6 转 R5 抽查 | — |

### 测试证据（critic 亲跑，本轮实测）

- `pnpm -C apps/server test` → **37/37 PASS**（新增：目标子集 1、config 6、enterprise 1、5 案例差异化 1；实现者报告数吻合）
- 5 案例差异化探针（真实语料）→ 4 种 top-1 签名，期望方向全覆盖（见上表）
- lancedb dim=384 add 实证 → 成功（修复前必抛"维度不匹配"）
- `pnpm -C apps/web test` → 38 passed + **1 failed**——失败为**未提交的 F4 回归测试**（工作树 ChatPanel 已修但 happy-dom 下 isComposing 事件传播问题，属前端在途工作，R4 门跟踪，非本门 breakage）

### 新 breakage 排查

- mock A 确定性测试（同场景两遍逐位相等）仍 PASS ✓；adapters 全组 PASS ✓
- 金标准评估不受影响（本轮未动 retrieval 查询语义）
- benchmark 行数随目标子集变化——前端 BenchmarkTable 按行渲染动态列，天然兼容（R4 已核 `??` 兜底）

### 残差观察（不阻塞）

- case-02 的 top-1 为「环氧沥青 + 高 RAP 再生」而非期望的橡胶/SBR——差异化达标但领域合理性可再调 mock C 基准表/权重（builder-data 后续打磨，建议 T14 前快速过一眼）。
- channelized 交通等级在 mock A 未触发重载 boost（`hasAny(level, ['heavy','重','特重'])` 不含 channelized）——标签侧已匹配，权重侧可补。

### R3 门最终状态：**PASS**
