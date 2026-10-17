# R2 评审报告 — T3 语料 + T4 入库管线/LanceDB/embedding + T5 金标准

- **评审人**：critic（独立评审，代码只读）
- **日期**：2026-10-17
- **Commit 范围**：`ae82bd0`(T1 base)..`5e67b24`（含 T3=8a8fa12、T4=201d250/296ac95/5e67b24、T5=0f6a44f、检索语义修复 00439fc）
- **覆盖路径**：`data/corpus/`、`data/golden/`、`scripts/`（validate-corpus、convert-literature、build-index、golden-eval、test/）、`packages/embedding/`、`packages/retrieval/src/{build,lancedb}.ts`、`packages/retrieval/src/sqlite.ts`（00439fc 部分）
- **对照依据**：spec §4（四道防线）、§5（检索细节）、§6（数据模型/入库 pipeline）、§12（风险预案）；计划 Task 3/4/5 Interfaces 与 Step 断言；Global Constraints（sourceRef、匿名、HF_ENDPOINT）；Lead 裁决 R17（语料数据来源署名允许）

## 结论：CHANGES_REQUIRED

1 条 Critical（buildIndex 增量路径 docId 级删除致兄弟 chunk 静默丢失——spec §4 防线 3 点名的"静默漂移"形态，已实证复现），1 条 Important（工作树 embedder 处于未提交 RED 状态，需完成修复后才能关门），若干 Minor/观察。语料质量与金标准证据核查全部通过（双引擎 20/20 由 critic 亲跑复现）。

---

## 一、发现清单（编号 + 位置 + 严重级 + 依据）

### C1 · Critical · buildIndex 增量路径：docId 级删除吞掉未变化的兄弟 chunk（静默索引漂移）

- **位置**：`packages/retrieval/src/build.ts:209-224`（toDelete 按 `m.docId` 收集 → `store.delete(docId)` 整 doc 删除），根因是 `VectorStore.delete` 接口为 docId 粒度（`types.ts:20`、`sqlite.ts:239-246`、`lancedb.ts:165-169`）
- **问题**：语料中删除某 doc 的**单个 chunk**（如规范文件删一条条文）时，该 doc 的**全部 chunk** 被 `delete(docId)` 移除；其中 hash 未变的幸存 chunk 在增量循环里被 `skipped`（`build.ts:214`）而**不会重新 add**。最终：索引静默缺块，manifest 却记载存在（`buildManifest` 照抄 planned）。直至 `--rebuild` 前，检索与证据链静默缺该 doc 的内容。
- **实证（critic 独立复现，非推测）**：3 条文规范 → 首次 build count=3；删除第 3 条 → 第二次 build 走 `[store.delete] jtg-test` → 仅 `[store.add] jtg-test:1`（其 hash 因正文吞入文末 source 注释而恰好变化被重嵌）→ **count=1**，但 manifest.chunks 记载 2 个 chunkId；jtg-test:0 已从库中消失。规范条文重排序/插入条文（chunk 序号重排）会进一步放大此问题（`build.ts:114` 的 `idx` 取自条文在文件中的位置索引）。
- **为何 Critical**：spec §4 防线 3 明确以"**不报错、检索悄悄变差**"为头号产业大坑并以此设立防线；本缺陷是防线内建逻辑自身制造的静默漂移，且触发路径真实——开发期语料迭代（增删条文）与 T10 `POST /kb/rebuild` 默认增量路径都会走到。
- **修复建议（任选）**：① 对 `toDelete` 中 docId 的其余 planned 幸存 chunk 全部加入 `toEmbed`（删除后重嵌）；② 接口加 `deleteChunks(chunkIds)` 按 chunk 粒度删；③ 检测到"部分 chunk 删除"时退化为全量重建（最简单且符合"向量库是可重建缓存"定位）。补测试：多条文 doc 删一条后，其余条文仍可检索且 `stats.count` 正确。

### C2 · Important · packages/embedding 工作树处于未提交 RED 状态（R2 关门前提）

- **位置**：`packages/embedding/src/embedder.ts`、`test/embedder.test.ts`（工作树未提交修改）
- **证据**：critic 亲跑 `pnpm -C packages/embedding test` → **1 FAILED / 8 passed**。失败点 `embedder.test.ts:65`（"展平 Tensor 形态"）：新增的"输出行数校验"（embedder.ts:104-106）将 `[{data,dims},{data,dims}]`（array-of-tensor）误判为 1 行——`flattenVectors` 对"tensor 对象数组"形态未处理（仅处理 array-of-array 与单 tensor）。同时 critic 将**已提交版**（0f6a44f）代码+测试隔离到 /tmp 复跑 → **8/8 PASS**：提交基线是绿的，当前红由进行中的迭代引入。
- **处置**：此为实现者进行中工作，非已提交缺陷；但 R2 关门（PASS）前必须完成修复并 commit（含 array-of-tensor 用例回归）。请 Lead 知会 builder-data；修复后我复跑 `pnpm -C packages/embedding test` 复审。

### C3 · Minor · chunk id 未含 model_version（spec §6.2 偏差）

- **位置**：`packages/retrieval/src/build.ts:93/114/140`（`{docId}:{chunkIdx}` 两段式）
- **问题**：spec §6.2 规定 `id = {doc_id}:{chunk_idx}:{model_version}`。实现以 manifest 的 modelChanged 全量重建机制替代（`build.ts:186-197`），功能上等价防漂移；但 id 约定偏离 spec 文本，且条文 `idx` 用位置索引（重排即换 id，与 C1 叠加）。
- **建议**：要么补第三段 model_version 恢复 spec 一致性，要么在 DELIVERY.md 记录该等价替代决策（Lead 裁决）。

### C4 · Minor · CLI `--model` 无运行时校验

- **位置**：`scripts/build-index.ts:63`（`as EmbedderModel` 强转）
- **问题**：非法模型名传入 → `MODEL_REGISTRY[model]` 为 undefined → 深层 TypeError（"reading dim"），报错不可读。
- **建议**：加一行白名单校验并给出可读错误。

### C5 · Minor · multilingual-e5-small 未加 query/passage 前缀

- **位置**：`packages/embedding/src/embedder.ts:64-66`（注释自认"前缀由调用方决定"，但当前无任何调用方加前缀）
- **问题**：e5 系列模型检索质量依赖 query/passage 前缀；作为 D4 备选模型，无前缀会降低召回质量（bge-m3 默认不受影响）。且真实构建（data/index/manifest.json）显示当前实机索引用的是 **multilingual-e5-small(384 维)** 而非默认 bge-m3——即备选路径已在真实使用。
- **建议**：embedder 暴露 `embedQuery/embedPassage` 或在 build/server 侧统一加前缀；至少 DELIVERY.md 记录该已知限制。

### C6 · Important（观察项，转 R3 验证）· SQLite 检索语义改为 trigram-OR，宽松召回可能稀释证据精度

- **位置**：`packages/retrieval/src/sqlite.ts:140-156`（00439fc；每 token 展开字符 trigram 后 OR 连接）
- **问题**：任意 3 字重叠即召回。critic 实测：查询"第一条正文内容甲"命中仅共享"正文内容"共现的 chunk（jtg-test:1）。金标准只钉 recall（双引擎 20/20 已复跑通过），precision 无人钉；T8 证据检索 top3 若被弱相关 chunk 占据，演示的证据链质量受损。
- **为何不阻塞 R2**：这是有回归测试的显式决策（T5 反馈驱动），且 LanceDB 端 ngram FTS 语义与之不同但同样过金标准；属检索质量权衡，交由 R3 端到端看 evidence 实际质量再判。若需收紧：可改"每 token 至少 1 个 trigram 命中"的 AND-of-tokens 结构（改后重跑金标准双引擎）。

### C7 · Minor · 真实索引 pipelineRev 为 "unknown"

- **位置**：`data/index/manifest.json`（`"pipelineRev": "unknown"`）
- **问题**：`getGitHeadShort()`（build.ts:127-133）execSync 失败回退 unknown——provenance 字段失实。演示环境影响小（无多人并发构建），但 spec 防线 3 要求 provenance 如实。
- **建议**：构建脚本 cwd 固定到仓库根再取 rev（`cwd: repoRoot`）。

### C8 · 观察 · 金标准门槛贴近实测值（轻度调参）

- c01-enterprise 门槛 0.5 且实测恰 0.5（1/2 命中，两引擎一致）；c04-knowledge 实测 0.80=门槛。门槛本身合理（多期望 id 允许 0.75/0.8），不构成过拟合证据；R5 复核时重跑确认无回归即可。

---

## 二、重点核验结果（Lead 要求的六项）

1. **语料 ≥40 条/每条 sourceRef/匿名** ✅ — entries=42（binder 9/modifier 4/gradation 7/additive 11/mixture 11），id 格式 100% 合法，sourceRef 无空（DOI 或规范号），relations=94 条全字段齐全；scene-tags=27 覆盖 5 案例全部引用（validate-corpus 断言引用完整性）；cases=5 场景必填字段齐全、期望配方 2-3 个；规范 8 份 57 条条文带 `<!-- source: -->` 标注；文献 142 条全带 sourceRef。匿名：commit author=contest-team；语料中文献作者为外部署名，按 R17 允许。
2. **chunk provenance 7 字段 + 幂等 contentHash** ✅ — `build.ts:239-254`（addWithProvenance）7 字段齐全（sourceDocId/contentHash/embeddingModel/modelVersion/dim/pipelineRev/embeddedAt）；幂等测试实测：二次构建 skip 6/count 不变、单条修改 added=1、rebuild=true 全量、modelVersion 变化强制全量（build-index.test.ts 7 用例，critic 亲跑 PASS）。
3. **buildIndex 共用抽取** ✅ — `packages/retrieval/src/build.ts` 独立于引擎与 CLI，T10 可直接 import（T10 卡已依赖 task-7）。
4. **金标准 20 条双引擎 20/20 证据真实** ✅ — critic 亲跑复现：复制实机 LanceDB 索引（data/index/lancedb）→ `golden-eval.ts lancedb` **20/20 exit 0**；用 fake embedder 重建 SQLite 索引（/tmp，纯 BM25 评估不依赖向量）→ **20/20 exit 0**。另有结构测试钉住 expectedDocIds 全部存在于真实语料。
5. **embedder 模型版本/备选切换、HF_ENDPOINT** ✅ — MODEL_REGISTRY 双模型注册、modelVersion=transformers 库版本参与 manifest 强制重建、`HF_ENDPOINT→env.remoteHost` 有测试钉住、EMBEDDING_CACHE_DIR 缓存目录已支持（5e67b24）。注：实机索引当前用备选 e5（384 维）——spec 允许的降级路径，但演示默认 bge-m3 下载失败的自动兜底提示建议写入 README（转 T15）。
6. **金标准过拟合检查** ✅（无互锁证据）— 20 条 query 均为自然语言多关键词；抽查 12 个期望 id 与 query 语义确实相关（如"高模量…抗车辙"→lit-089/005 HMAM 文献、"机器学习 气候分区 沥青选型"→lit-032）；expectedDocIds 引用真实语料 id 且有校验器保证存在性；未发现 query 机械摘抄 chunk 文本的互锁。

## 三、测试证据核查（critic 亲跑，全部本轮实测）

| 命令 | 结果 |
|---|---|
| `pnpm exec vitest run --root scripts` | 21/21 PASS + lancedb 组 1 skip（需 LANCEDB_TEST=1，符合计划） |
| `pnpm -C packages/retrieval test` | 14/14 PASS（含 00439fc trigram 回归测试） |
| `pnpm -C packages/embedding test` | **1 FAIL / 8 pass（工作树未提交修改，见 C2）**；已提交版隔离复跑 8/8 PASS |
| `tsx scripts/golden-eval.ts lancedb --db-path=/tmp/...`（实机索引副本） | 20/20 exit 0 |
| `tsx scripts/golden-eval.ts sqlite --db-path=/tmp/...`（fake embedder 重建） | 20/20 exit 0 |
| C1 复现脚本（/tmp，3 条文删 1） | count 3→1、manifest 虚记 2 chunk、幸存 chunk 不可检索——bug 实锤 |

## 四、Declined to judge（本次搁置不判）

- 实机索引用 e5 而非 bge-m3 的选型本身：spec 允许的备选路径，下载可行性由 builder-data 现场决定；仅建议 README 写明兜底（转 T15）。
- 金标准门槛数值设定：属 T5 内容工程裁量，已复核无过拟合互锁。
- 检索 precision（C6）：转 R3 端到端验证证据链实际质量。
- T7 适配器、T6 关系层等 backend 产物：R3 门范围。
- 匿名词表扫描：T15 审计脚本职责（R17 口径已遵行）。

## 五、Strengths

- 语料内容工程质量高：条目带定量 magnitude（"4.58%/3.96%"、"PG64→PG76"、"60℃≥20000 Pa·s"）、DOI/规范号齐全、规范条文带 OCR 免责声明，可直接支撑证据链溯源演示。
- 校验器（validate-corpus）覆盖 id 格式/category 一致性/property 词汇表/标签引用完整性/条文分节结构——比计划要求更严。
- build 幂等设计完整（manifest + hash + 模型变更强制重建 + storeLost 自愈），测试钉住 Review Focus #5/#6。
- 金标准评估器离线可跑（纯 BM25 不依赖模型下载），双引擎实测全绿；测试还断言 expectedDocIds 引用真实语料 id，防悬空引用。
- LanceDB 实现与 SQLite 实现共享 RRF 口径；add 幂等覆盖、rebuild 重置 initPromise、全接口测试齐备（LANCEDB_TEST 门控合理）。

## 六、复审条件

1. **C1（Critical）**：buildIndex 增量删除路径修复 + 回归测试（多条文 doc 删一条后幸存条文仍可检索）。
2. **C2（Important）**：packages/embedding 未提交修改完成并 commit（`pnpm -C packages/embedding test` 全绿），由我复跑确认。
3. C3–C7：Minor 可由 Lead 裁决立即修或记账（建议 C4/C7 顺手修，C3/C5 记 DELIVERY.md）。
4. C6：转 R3 验证，不阻塞 R2。

---

## Re-review（fix round 1，commit `056b778`，范围 `96b40a1..056b778` data 路径）

**复审结论：PASS——C1/C2/C4 全部 ADDRESSED，无新 breakage，R2 门通过。**

### 逐条判定

| # | 发现 | 判定 | 证据 |
|---|---|---|---|
| C1（Critical）| 增量路径 docId 级删除吞兄弟 chunk | **ADDRESSED** | `build.ts:213-226`：toDelete 涉及的 docId 的幸存 planned chunk 全部并入 toEmbed 重嵌；skipped 改 total-added 口径。回归测试 build-index.test.ts「删除中间条文」用例（3 条文删 1 条：added=2/skipped=0/count=2、幸存条文按新索引可检索、被删条文检索为空）。critic 独立复现脚本重跑：删 1 条后 count 3→2、两条幸存 chunk 均重嵌且可检索、manifest 与 store 一致 |
| C2（Important）| embedder 工作树 RED | **ADDRESSED** | 96b40a1（flattenVectors 批量 Tensor 按行拆分 + cache_dir pipeline options）；critic 复跑 `pnpm -C packages/embedding test` **9/9 PASS**；data 相关路径工作树干净（无未提交修改） |
| C4（Minor）| CLI --model 无校验 | **ADDRESSED** | `scripts/build-index.ts:32-43` resolveCliOptions 枚举校验（非法 backend/model 明确报错）+ main 加 import 副作用守卫；新增 build-index-cli.test.ts 6 条全过 |
| C3/C5/C7（Minor）| — | 记账（DELIVERY.md 记录 chunk id 两段式等价替代、e5 前缀限制、pipelineRev 建议）；不阻塞 R2 | — |

### 新 breakage 排查

- skipped 口径变更：幂等 {added:0,skipped:6}、单改 {added:1,skipped:5}、整 doc 删 {added:0,skipped:5} 均与既有断言一致（scripts 套件 28+1skip 全绿佐证）。
- `toEmbed.includes` O(n²) 仅作用于 toDelete docId 的幸存 chunk，规模上限=语料 chunk 数（241），无性能风险。
- 实测：`pnpm exec vitest run --root scripts` → **28 passed + 1 skipped**（与实现者报告一致）；retrieval 14/14、embedding 9/9（均已由 critic 亲跑）。

### R2 门最终状态：**PASS**
