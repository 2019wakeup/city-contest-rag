# R1 评审报告 — T2 检索核心（VectorStore 接口 + RRF + SQLite 降级实现）

- **评审人**：critic（独立评审，代码只读）
- **日期**：2026-10-17
- **Commit 范围**：`ae82bd0`(T1 base)..`71506d2`(T2)
- **覆盖路径**：`packages/retrieval/`（package.json、src/types.ts、src/fusion.ts、src/sqlite.ts、src/index.ts、test/）+ 本次 commit 触及的根 `package.json`/`pnpm-workspace.yaml`
- **对照依据**：spec §4（四道防线）、spec §5（检索细节/量化红线）、计划 Task 2（Interfaces 签名、Step 1 测试断言清单）、Global Constraints、Lead 裁决 R14（node:sqlite 零原生依赖）

## 结论：CHANGES_REQUIRED

1 条 Important（SQLite 后端 upsert 产生 FTS 脏行，实证复现），5 条 Minor。其余全部符合。修复建议为单点小改（add 前先删 FTS 行 + 补回归测试），修复后即可过门。

---

## 一、Spec 符合性发现（编号 + 位置 + 严重级）

### C1 · Important · FTS upsert 语义错误 → 旧文本残留可检索（静默漂移）

- **位置**：`packages/retrieval/src/sqlite.ts:49`（`INSERT OR REPLACE INTO chunks_fts`），配合 `:62`（`insertFts.run`）；对比 `:46`（chunks 主表 PK 正确 upsert）
- **问题**：FTS5 虚拟表上 `INSERT OR REPLACE` 等同普通 INSERT——`chunk_id` 是 UNINDEXED 列，FTS5 不保证唯一。同一 `chunk_id` 重新 add（文本已更新）时，主表被替换为新文本，但 FTS 表**保留旧行并追加新行**，旧文本仍可被检索命中。
- **实证**：critic 用 `node:sqlite` 独立复现（Node v24.21.0）：同 chunk_id 先插"旧文本 高温车辙"再 OR REPLACE"新文本 低温开裂"，FTS 表出现 2 行，`MATCH '高温车辙'` 仍命中该 chunk_id。非推测。
- **为何重要**：spec §4 防线 3 明确点名"**静默检索漂移——不报错、检索悄悄变差，产业界踩过的大坑**"作为防线对象；本缺陷正是该坑的 SQLite 实例。触发路径真实存在：T4 buildIndex 幂等跳过按 `contentHash` 判定，语料文本修订后（hash 变、`{doc_id}:{chunk_idx}:{model_version}` 不变）走 add 重写 → 同一 chunk 新旧文本同时可搜 → RAG 证据链可能引用已不存在的旧文本。另：重复行还会使同 id 在 bm25 榜单出现两次，RRF 中该 id 双倍加分（`fusion.ts:12` 的 Map 累加不区分同 ranking 内重复 id）。
- **修复建议**：`add()` 中 insertFts 前先 `DELETE FROM chunks_fts WHERE chunk_id = ?`（或改用 content= 外部内容表）；并补回归测试：同 chunk_id 二次 add 不同文本后，旧文本 MATCH 不再命中、`stats.count` 不变。

### C2 · Minor · add 批次无事务，校验失败留半截数据

- **位置**：`packages/retrieval/src/sqlite.ts:52`（`CorpusChunkSchema.parse` 在循环内抛错）
- **问题**：`add(chunks, vectors)` 未包事务；若第 k 条 parse 失败，前 k-1 条已落库（主表 + FTS）。
- **为何不重要到 Important**：buildIndex 幂等重跑可自愈（同 hash 跳过）；失败即报错不静默。但既然 C1 修复会动 add()，建议顺手包一个事务。

### C3 · Minor · 检索评分语义（RRF 原始分 ~0.016–0.07）未约定

- **位置**：`packages/retrieval/src/sqlite.ts:211`（bm25 取负）、`fusion.ts:16-22`（RRF 输出）
- **问题**：`SearchHit.score` 为 RRF 融合原始分（量级 1/61≈0.016），仅排序有意义。spec/计划未钉 score 语义，不违约束；但 T10 kb/search 与 T11 前端"分数"展示会直接渲染该值，视觉上像"0.02 分"。
- **建议**：R3 前后端联调时由 Lead 裁决是否归一化/放大展示（契约字段可不动）。

### C4 · Minor · FTS 查询串直接进 MATCH，英文操作符词会被误解析

- **位置**：`packages/retrieval/src/sqlite.ts:207-208`（`MATCH ?` 传原始 q）
- **问题**：trigram tokenizer 下 FTS5 语法仍生效；含 `AND/OR/NOT/NEAR` 的英文查询被当操作符解析（不抛错、不落 substring 兜底），可能漏召回。语法错误（特殊符号）已有 try/catch → substring 兜底（`:214`），但操作符误解析不触发兜底。
- **影响**：中文字段为主语料，触发面小；SQLite 为降级后端。建议：查询词转义（双引号包裹）或直接统一走子串检索可彻底规避。

### C5 · Minor · package.json 未声明 node:sqlite 的 engines 下限

- **位置**：`packages/retrieval/package.json`（无 `engines` 字段）；`src/sqlite.ts:1`（`node:sqlite` 需 Node ≥22.5）
- **问题**：无运行时版本约束；低版本 Node 下 `node:sqlite` 直接 import 失败，报错信息不友好。
- **背景**：spec §2 钉死本机 Node 24.21，风险仅存在于环境漂移。建议加 `"engines": {"node": ">=22.5"}` 一行。

---

## 二、Spec/计划符合性核对表（逐条）

| 项 | 计划/spec 要求 | 实现 | 结论 |
|---|---|---|---|
| 接口五方法签名 | `add(chunks, vectors)` / `search(q)` / `delete(docId)` / `rebuild()` / `stats()` | `types.ts:17-22` 逐一对齐；`vector?` 可选=纯 BM25（注释明示金标准用途） | ✅ |
| search 查询形参 | `{vector?, text, topK, filter?{docTypes?, tags?}}` | `VectorSearchQuery`（`types.ts:7-15`）同名结构（命名接口替代内联类型，结构等价） | ✅ |
| RRF 公式 | `1/(k+rank)`、k=60、同 id 双路相加、并集齐全 | `fusion.ts:12-22`；测试数值断言 `1/61`、`1/62`、`1/62+1/61` | ✅ |
| SQLite 实现 | FTS5 存 text + chunks 表向量 JSON + JS 精确余弦；融合 = RRF(BM25 top-40, 余弦 top-40) → filter → topK；rebuild 清空重建 | `sqlite.ts:140-167` 顺序一致；`cosineSearch` JS 余弦（`:229-237`）；`rebuild` DROP+重建（`:248-251`） | ✅ |
| 不引入原生 sqlite-vec | 计划明示"JS 精确余弦（不引入原生 sqlite-vec）" | 无 sqlite-vec 依赖 | ✅ |
| 引擎选型偏差 | 计划写 better-sqlite3；Lead 裁决 **R14** 改用 Node 24 内置 `node:sqlite`（零原生依赖） | commit message 引述 R14；`package.json` 依赖仅 contracts；`pnpm-workspace.yaml` 未新增 better-sqlite3 | ✅ 已裁决，记录在案（见"declined"） |
| SearchHit 字段 | `{chunkId, text, score, docType, tags, provenance}` | `SearchHitSchema.parse` 输出（`sqlite.ts:187-195`），含 `schemaVersion:'1'` | ✅ |
| 匿名红线 | 无身份信息 | 代码/注释/commit（author=contest-team）无实名 | ✅ |
| SQL 注入 | 参数化 | 全部 `?` 占位；IN 子句占位数由 fused 列表长度决定（≤80），无拼接外部输入 | ✅ |
| Global Constraints | TS strict、不引 agent 框架/向量库 server | 基 tsconfig `strict:true`；无违规依赖 | ✅ |

## 三、测试证据核查

| 命令 | 结果 | 证据 |
|---|---|---|
| `pnpm -C packages/retrieval test`（critic 亲跑） | **10/10 PASS**（fusion 3 + sqlite 7，61ms） | 本轮实测输出 |
| `pnpm -C packages/retrieval typecheck`（critic 亲跑） | **exit 0**，tsc --noEmit 无输出 | 本轮实测输出 |
| 计划 Step 1 断言清单 | 并集/k=60 数值断言/同 id 双路相加 ✅；add→count=2→search 命中降序→delete→rebuild→filter.docTypes ✅ | `fusion.test.ts:6-27`、`sqlite.test.ts:36-103` |
| 额外覆盖（超出计划） | 纯 BM25 路径、短中文 query trigram 兜底（<3 字符）、filter.tags、向量融合排序、长度不匹配抛错 | `sqlite.test.ts` 各 case |
| 测试真实断言 | 数值用 `toBeCloseTo` 精确断言；search 断言命中/排序/过滤语义，非 smoke | 通读确认 |
| TDD 红绿 | 单 commit 内无法从历史独立取证；critic 工作树快照观察到 test/ 先于 src/ 出现（RED 先行），绿侧本轮亲测 | 观察记录 |

**C1 的缺口在测试**：无"同 chunk_id 重写文本"用例——这正是 C1 溜过测试的原因。修复应配套该回归测试。

## 四、Declined to judge（本次搁置不判）

- LanceDB 默认实现与 `RETRIEVAL_BACKEND` 切换接线：属 T4/T8/T10，非本门路径。
- contracts 包 schema 定义正确性（passthrough 全量）：属 R3（T1）。本门仅验证 retrieval 对它的消费方式（parse 校验落库，方向正确）。
- better-sqlite3→node:sqlite 的选型合理性本身：Lead 已裁决 R14 并写入 commit message，critic 不复议；仅验证实现与裁决一致（一致）。
- 金标准集与评估脚本：属 R2（T5）。
- 检索性能（全量向量扫描）：计划已明示语料量级下精确检索可接受，不判。

## 五、Strengths

- 接口抽象干净，`VectorSearchQuery` 命名导出利于 T4/T8/T10 复用；向量可选的纯 BM25 路径为金标准离线评估铺路。
- RRF 实现简洁正确，tie-break 用 id 字典序保证确定性输出（`fusion.ts:17`），利于演示复现。
- 中文检索考虑周到：trigram tokenizer + <3 字符子串兜底 + FTS 语法异常兜底，并有对应测试。
- 全部 SQL 参数化；`add` 长度不一致 fail-fast；`search` 的 IN 占位数有界（≤80），无 topK 炸弹。
- 测试断言真实且超出计划最低清单。

## 六、评审记录

- 复审条件：C1 修复（建议顺带 C2 事务）+ 回归测试，重跑 `pnpm -C packages/retrieval test` + `typecheck` 后 scoped re-review。

---

## Re-review（fix round 1，commit `86d69ae`，范围 `71506d2..86d69ae`）

**复审结论：CHANGES_REQUIRED（round 2）**——原 findings 均已处理，但 C4 修复引入一处新 breakage（C6，Important）。

### 逐条判定

| # | 原发现 | 判定 | 证据 |
|---|---|---|---|
| C1 | FTS5 同 id 重写残留旧文本 | **ADDRESSED** | `sqlite.ts:45` 增加 `deleteFts`（`DELETE FROM chunks_fts WHERE chunk_id = ?`），`add()` 内先删后插（`:56-59` 注释明示 FTS5 虚表 REPLACE 无效）；新回归测试 `sqlite.test.ts:138-149` 断言同 id 重写后旧文本不命中、新文本命中、count=1 |
| C2 | add 无事务 | **ADDRESSED** | `sqlite.ts:67-89`：`BEGIN` / try-catch `ROLLBACK` / `COMMIT` 包裹整批 |
| C4 | MATCH 操作符误解析 | **ADDRESSED（但引入 C6，见下）** | `sqlite.ts:142` 整串引号包裹 + `""` 转义；新测试 `sqlite.test.ts:151-165`（'A AND B' 按字面命中） |
| C5 | engines 缺失 | **ADDRESSED** | `package.json` 增加 `"engines": {"node": ">=22.5"}` |
| C3 | score 语义 | 按 Lead 指示记账到 R3，本轮不判 | — |

### 新发现（fix round 1 引入）

#### C6 · Important · phrase 语义使"空格分隔多词查询"召回归零（新 breakage）

- **位置**：`packages/retrieval/src/sqlite.ts:142`（整串 `"..."` 包裹 → FTS5 phrase 查询）
- **问题**：修复前（裸查询串）空格分隔多词走 FTS5 **AND 语义**（每词独立命中即可）；修复后整串成为**短语**，要求各 token 相邻出现，否则空结果。
- **实证（critic 用 node:sqlite 复现）**：text=`路面车辙处治采用改性沥青`；query=`"车辙处治 改性沥青"`（空格分隔，两词均≥3 字）→ **空结果**；同 query 裸传（AND 语义）→ 命中。即修复引入了对旧行为的真实回归。
- **为何重要**：kb 检索测试框（spec §8.3）与用户手输查询出现"改性沥青 高温"这类空格多关键词是正常输入；静默空结果破坏检索预期，且与 spec §1.3 成功标准 3（recall@k 全过）的风险直接相关。
- **修复建议**：按空白分词后**逐 token 引号化、空格连接**（`"车辙处治" "改性沥青"` = FTS5 隐式 AND of 字面短语），既保操作符字面义、又保 AND 召回；并补一条空格多词回归测试（断言可命中非相邻文本）。

### 测试证据（critic 亲跑）

- `pnpm -C packages/retrieval test` → **12/12 PASS**（新增 C1/C4 两条回归测试真跑过，非 smoke：C1 断言旧文本不命中，其失败前提已由 critic 独立 FTS5 实验证实——同表 REPLACE 确实留双行）
- `pnpm -C packages/retrieval typecheck` → exit 0
- C1 红绿链：旧代码下新测试必红（critic 实测 OR REPLACE 产生双行 + 旧文本可 MATCH），新代码下绿——回归测试真实有效。

### 其余观察（不阻塞）

- fix commit 顺带为 `packages/retrieval` 添加 `@lancedb/lancedb` 依赖（属 T4 写区内容提前落位，中性）。
- C6 修复后建议 R2 门审金标准集时留意查询书写方式（无空格或按词条 id 召回），并在 T5 golden-eval 全绿前不做引擎切换。

---

## Re-review（fix round 2，commit `6cec3a1`，范围 `86d69ae..6cec3a1`）

**复审结论：PASS——C6 ADDRESSED，无新 breakage，R1 门通过。**

### C6 判定：ADDRESSED

- `sqlite.ts:139-144`：按空白分词，逐 token 引号包裹 + `""` 转义后空格连接——FTS5 隐式 AND of 字面短语。操作符（AND/OR/NOT/NEAR）按字面检索（保 C4），空格多词恢复 AND 召回（修 C6）。
- `sqlite.ts:159-171`：substring 兜底同步改写为多词 AND 语义（每 token 都出现才命中，分数=出现次数和），语义与 FTS 主路径一致。
- 新回归测试 `sqlite.test.ts:172-187`（R1-C6）：两 token 非相邻文本（"车辙处治**方案采用**改性沥青混凝土"）命中、缺一词文本不命中——正是 fix round 1 回归的精确场景。

### 测试证据（critic 亲跑）

- `pnpm -C packages/retrieval test` → **13/13 PASS**（含新增 C6 测试）
- `pnpm -C packages/retrieval typecheck` → exit 0
- critic 独立 node:sqlite 复现：逐 token 引号化查询 `"车辙处治" "改性沥青"` 对非相邻文本 **命中**（fix round 1 的整串 phrase 版本实测为空——红绿成立）

### 新 breakage 排查

- substringSearch 重写：无回归（旧行为单串 instr 对空格多词几乎必然空命中，新 AND 语义严格更优）；空 token 由上游 `q.trim()` 早退保护；私有方法仅此两处调用。
- 本次 commit 仅改 `sqlite.ts` + `sqlite.test.ts` 两个文件，未动接口与其他模块。
- 附注：`86d69ae..6cec3a1` 区间内夹带 T4 产物（`build.ts`、`lancedb.ts`、`index.ts` 导出），属 R2 门评审范围，本轮不判、R2 全量审。

### R1 门最终状态

| 项 | 状态 |
|---|---|
| C1（Important）| ADDRESSED（fix round 1 + 回归测试）|
| C2/C4/C5（Minor）| ADDRESSED（fix round 1）|
| C6（Important，round 1 引入）| ADDRESSED（fix round 2 + 回归测试）|
| C3（Minor）| 记账 R3 裁决 |
| 最终结论 | **PASS** |
