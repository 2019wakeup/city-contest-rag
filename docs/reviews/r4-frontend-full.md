# R4 评审报告 — 前端整体 T11–T13（apps/web）

- **评审人**：critic（独立评审，代码只读）
- **日期**：2026-10-17
- **Commit 范围**：`8ff6fb8`(脚手架 base)..HEAD（T11=ec696c7、T12=0a52192、T13=908f7b8）
- **覆盖路径**：`apps/web/` 全部
- **对照依据**：spec §8（三视图设计）、spec §7（契约驱动 UI/未知字段容错）、Global Constraints（Composition API+script setup、Element Plus、ECharts、中文文案、匿名）；计划 T11/T12/T13 Interfaces 与 Step 断言；R3 裁决 C7（score 展示归一化）

## 结论：CHANGES_REQUIRED

1 条 Important（知识库页缺失 spec §8.3 明列的 PDF 上传入口），4 条 Minor（C7 裁决落实、案例回填双口径显示、中文输入法误发、预跑结果未落地）。核心核验项全部通过：Composition API+script setup 全组件、表单 schema 驱动、未知字段不崩（fixture 实测）、模拟数据角标/降级提示、SSE 解析、XSS 安全（全 `{{ }}` 渲染）、测试 36/36 真实断言。

---

## 一、发现清单

### F1 · Important · 知识库页无 PDF 上传入口（spec §8.3 明列功能缺失）

- **位置**：`apps/web/src/components/KbUpload.vue:20-27`（`accept=".md,.txt,.markdown"`，仅文本通道）
- **问题**：spec §8.3 知识库管理页明确要求「上传（企业资料 **PDF**/MD/粘贴文本）」，计划 T10 后端已实现 multipart + pdf-parse；但前端 `onFileChange` 只走 `file.text()` 的 JSON 通道，PDF 文件在 UI 层完全不可选。前后端能力断链：后端 PDF 解析代码对演示用户不可达。
- **修复建议**：KbUpload 增加 PDF 分支（accept 加 `.pdf`，选择 PDF 时走 multipart FormData 上传通道；client.ts 增加 `kbUploadFile(formData)` 或复用 fetch multipart）。改动量小（client + 组件各一处）。
- **备选（Lead 裁决）**：若时间紧，砍 MVP 口径并让 UI 文案明示"暂仅支持文本/MD"，在 DELIVERY.md 记录 PDF 为后端已备能力。

### F2 · Minor · C7 裁决未落实：相关度展示 RRF 原始分

- **位置**：`apps/web/src/components/EvidencePanel.vue:622`、`apps/web/src/components/KbSearchBox.vue:710`（均 `(hit.score ?? 0).toFixed(3)`）
- **问题**：R3 裁决 C7 明确"契约保留原始分，前端展示归一化 0–100（相对首位）或显示排名"；当前直接展示 0.016~0.07 级数值（views.test.ts:2901 断言 `0.800` 恰为 fixture 假分掩盖了真实量级）。真实检索结果观感为"相关度 0.016"。
- **修复建议**：两处统一改为 `Math.round(score / maxScore * 100)` 或展示排名序号（首位分数为基准 100）。补测试用真实量级分数（如 0.016）断言归一化行为。

### F3 · Minor · 案例一键填入后 traffic.level 双口径显示不一致

- **位置**：`apps/web/src/components/SceneForm.vue:1148-1156`（applyScene 直接回填原始值）；`packages/contracts/src/registry.ts:46-56`（选项为中文值）；`data/corpus/cases/cases.json`（场景值为 'heavy'/'medium'/'light'）
- **问题**：R3 C5 已记后端双口径；前端影响面为：案例填入后 el-select 值为 'heavy'，不在中文选项中 → 显示原始英文值且提交时值域与表单选项不一致。
- **修复建议**：随 R3 C5 一并统一（cases.json 场景值改中文，或注册表加英文 alias 映射）。此条不阻塞，与 C5 同单处理。

### F4 · Minor · 对话输入中文 IME 回车会误发消息

- **位置**：`apps/web/src/components/ChatPanel.vue:24-26`（`@keydown.enter.exact.prevent="send"`）
- **问题**：中文输入法组合期间确认候选词的回车（`isComposing=true`）会触发 send，把未完成的中文输入中途发出。中文对话面板的真实 UX 缺陷。
- **修复建议**：`@keydown.enter.exact.prevent="!$event.isComposing && send()"`（一行）。补测试可选（jsdom 模拟 composition 较繁琐，可只改代码 + 手测）。

### F5 · Minor · 案例页「预跑结果」未落地（spec §8.2）

- **位置**：`apps/web/src/views/CasesView.vue`、`apps/web/src/components/CaseCard.vue`（仅标题/摘要/场景，无预跑结果）
- **问题**：spec §8.2 案例卡片含「预跑结果」；后端 `GET /cases` 已返回 `canPreRun` 字段但前端未消费（字段闲置）。
- **裁决**：Lead 定——演示时间紧可砍（DELIVERY.md 记录），或展示 canPreRun 状态标记（"可预跑/需先建索引"）成本极低（建议顺手做后者）。

## 二、Spec/计划符合性核对（通过项）

| 项 | 要求 | 核查结果 |
|---|---|---|
| Composition API + `<script setup lang="ts">` | 全部组件 | ✅ 13 个组件 + 3 视图 + store 全符合，无 Options API |
| Schema 驱动表单 | 不写死任何字段，改 contracts 即改表单 | ✅ SceneForm 完全遍历 FIELD_REGISTRY 渲染（唯一特例 distresses 对象数组有注释说明）；测试断言"每个注册表路径渲染一个控件" |
| 未知字段不崩（Review Focus #1） | `report.x ?? fallback` 全链路 | ✅ 渲染层全部可选链/??；测试注入含 `extraTopLevelField` + `futureField` 的报告 fixture 挂载不抛错（亲跑 PASS） |
| 模拟数据角标 | adapterMode mock → 角标 | ✅ RecommendView 全局徽章 + CandidateCard 每卡 tag，测试断言「模拟数据」出现 |
| 降级提示 | llmStatus degraded → 提示 | ✅ 视图级 alert + ReportSection 内 alert 双处，测试断言「文案模板降级」 |
| 空证据提示 | 知识库为空 | ✅ EvidencePanel 空态文案"知识库为空，请执行 pnpm build:index"+ 视图 warnings 渲染，测试断言 |
| SSE 解析（R15） | delta 流式 + [DONE] 容忍 + JSON 降级 | ✅ client.readSseText 实现三态；client.test.ts 3 条 SSE 用例（含非 JSON 行与 [DONE]）亲跑 PASS |
| XSS 安全 | LLM 文案仅文本渲染 | ✅ 全组件 `{{ }}` 插值渲染，无 v-html（ReportSection/ChatPanel/EvidencePanel 均确认） |
| SHAP 瀑布图 | 有 explanations 才渲染 | ✅ WaterfallChart v-if + 测试断言 cand-1 无/cand-2 有 → 恰好 1 个 |
| 微调面板（G5） | 改约束 → adjustAndRerun | ✅ 预算/工期两个入口；测试断言重跑 payload 的 budget=600 |
| 案例一键载入 | ?case= → 表单回填 | ✅ RecommendView watch route.query.case + SceneForm applyScene；测试断言 store.activeCaseId 与提交 payload |
| 知识库页 | 统计/上传/检索/重建 | ✅ 四要素齐（F1 为其中上传的 PDF 缺口）；测试 4 条全过 |
| ECharts 按需引入 | 树摇 | ✅ echarts/core + charts/components/renderers 分模块 use |
| Vite proxy | /api → localhost:3000（R4 裁决） | ✅ vite.config.ts 固定 3000 |
| 匿名文案 | 无身份信息 | ✅ 全部中文 UI 文案中性；app 名"数智选材" |
| 测试真实断言 | 无 smoke | ✅ 断言渲染结构/行为调用/精确文本；36/36 亲跑 PASS |
| 类型检查 | vue-tsc | ✅ `pnpm -C apps/web typecheck` exit 0（critic 亲跑） |

## 三、测试证据核查（critic 亲跑，本轮实测）

| 命令 | 结果 |
|---|---|
| `pnpm -C apps/web test` | **36/36 PASS**（client 8 + recommend-view 8 + scene-form 4 + store 6 + views 10 组分布） |
| `pnpm -C apps/web typecheck` | vue-tsc exit 0 |
| 脚手架核查 | vite proxy 3000 ✓、router 三视图 ✓、main.ts Element Plus zh-cn ✓、App.vue 薄壳导航 ✓ |

## 四、Declined to judge（本次搁置不判）

- 视觉美工/布局细节（better-ui 级打磨）：T15 美化阶段 Lead 负责。
- 前端未做端到端浏览器走查：T14（chrome-devtools-mcp）职责。
- 表单 select 选项的领域值合理性（气候分区清单等）：语料口径，随 C5 统一时复核。
- F2 归一化公式细节（相对首位 vs 排名）：实现方自选，R4 复审时确认量级合理即可。

## 五、Strengths

- Schema 驱动表单是计划要求的教科书式实现：零硬编码字段、注册表路径即控件、测试逐个路径断言存在性与控件类型。
- 未知字段容错做得彻底：fixture 注入未来字段 + 全渲染层 ?? 兜底 + 专项测试。
- SSE 客户端健壮：容忍非 JSON 行/[DONE]/多行 data，降级 JSON 路径有测试。
- 状态机语义清晰（degraded 与 error 区分正确：降级仍是成功渲染，错误才报错）。
- 测试质量高：行为断言（调用参数、路由跳转、渲染条件）而非快照/存在性烟雾。

## 六、复审条件

1. **F1（Important）**：PDF 上传入口（或 Lead 裁决砍口径 + UI 文案明示）。
2. F2–F5：建议随修复轮一并处理（F4 一行、F2 一处工具函数、F3 随 R3-C5、F5 按裁决）；Minor 不阻塞门，但 F2/F4 建议修。
3. 修复后我复跑 `pnpm -C apps/web test` + typecheck 做 scoped re-review。

---

## Re-review（fix round 1，范围 `908f7b8..HEAD` apps/web/）

**复审结论：F1/F3/F4 ADDRESSED、F5 waived、F2 部分 ADDRESSED（EvidencePanel 残留 Minor）——门结论待 Lead 对 F2 残留的裁决（补一行 / 注销）。**

### 逐条判定

| # | 发现 | 判定 | 证据 |
|---|---|---|---|
| F1（Important）| 知识库页无 PDF 上传 | **ADDRESSED** | a33ae03：client.ts 新增 `kbUploadFile`（multipart、不手动设 content-type）；KbUpload accept 加 .pdf 且文件选择直走 multipart 通道；client.test.ts 新增 FormData 断言（含"不得手动覆盖 content-type"） |
| F2（Minor）| 相关度展示 RRF 原始分 | **部分 ADDRESSED** | KbSearchBox ✓（1300334：按首位归一化 0-100，非法值显示「—」，views.test.ts 断言改为归一化口径）；**EvidencePanel.vue:47 仍为 `(hit.score ?? 0).toFixed(3)` 原始分展示（0.016 量级），未修** |
| F3（Minor）| 案例回填双口径显示 | **ADDRESSED** | 依赖 R3-C5 注册表值对齐（heavy/medium/light/channelized）+ adf6265 回归测试断言：回填后控件显示中文 label「重交通」而非英文值，提交 payload 仍为 'heavy'（39/39 中该用例 PASS） |
| F4（Minor）| 中文输入法回车误发 | **ADDRESSED** | adf6265：ChatPanel 新增 `onEnterKey`（`event.isComposing \|\| event.key === 'Process'` 早退）；新回归测试「isComposing 过滤」：组合回车不调 API、普通回车调 1 次（亲跑 PASS） |
| F5（Minor）| 案例页预跑结果 | **waived（Lead 裁决砍）** | — |

### 附：0f89ab3（vite proxy 可配置）

- 默认 target 仍为 `http://localhost:3000`，`API_PROXY_TARGET` 环境变量可覆盖——与裁决 R4 的预案（"3000 被占需改 env，README 注明"）一致，判定兼容 ✓。

### 测试证据（critic 亲跑，本轮实测）

- `pnpm -C apps/web test` → **39/39 PASS**（36 旧 + F1 multipart 1 + F4 isComposing 1 + F3 回填断言并入既有用例）
- `pnpm -C apps/web typecheck` → vue-tsc exit 0
- EvidencePanel 原始分残留：`grep` 确认 0a52192 后无任何 commit 触及该文件

### 待 Lead 裁决

- F2 残留（EvidencePanel 相关度原始分）：建议复用 KbSearchBox 的归一化逻辑（3-5 行）补一个 commit，或 Lead 正式注销。裁决后我即可给出 R4 最终门结论并关 task-19。

---

## Re-review 补判（F2 残留，commit `0dc62b9`）

- **F2 残留 ADDRESSED**：EvidencePanel 改用共享工具 `apps/web/src/utils/score.ts` 的 `scoreDisplayText`（按列表首位归一化 0-100、非法值「—」），KbSearchBox 亦重构复用同一函数（消除双份实现）；新增 evidence-score 展示行。
- 测试证据（critic 亲跑）：`pnpm -C apps/web test` → **40/40 PASS**；vue-tsc exit 0。

### R4 门最终状态：**PASS**（F1/F2/F3/F4 ADDRESSED，F5 waived by Lead）
