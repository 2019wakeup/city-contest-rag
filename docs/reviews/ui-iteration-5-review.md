# UI / 产品评审 · 第五轮迭代（ui-iteration-5-review）

> 评审对象：`/bigdisk/lhg/road_rec` @ `cae5e74`（证据链卡片化）+ 评审时工作树未提交改动
> 运行环境：前端 http://127.0.0.1:5174（Vite，代理 → 3010）｜后端 http://127.0.0.1:3010（DeepSeek 已配置，模块 A/C = mock，向量库 lancedb / 1340 chunk）
> 评审方式：前端源码通读（App/4 视图/14 组件/store/utils）＋ 后端路由/适配器/契约通读 ＋ 接口实测（`/health`、`/cases`、`/recommend`、`/recommend/stream`、5 案例 scene 字段）＋ 浏览器实测（1440×900 / 1024×768 / 800×700；暗/亮双主题；输入页、运行中、结果页、基准表、雷达、证据链、案例页、知识库页+检索、追问侧板、离线错误态）
> 未覆盖：真实屏幕阅读器实操、Safari/Firefox、200% 缩放、触屏、<768 移动端、真实模块 A/C 与 SHAP（当前均 mock）
> 行号说明：评审期间 builder-frontend 正在改 `RadarChart`/`ReportSection`/`EvidencePanel`/`RecommendView`/`ChatPanel`（并新增 `ChatDock.vue`），下列行号以 2026-10-19 17:0x 工作树为准，可能有 ±20 行偏移；定位时以「文件 + 函数名/选择器」为准。
> 用户已提的 5 点（雷达图、追问面板、报告裸证据 id、证据链单调、流式感知）**不重复评审**，仅在文末 §5 给补充意见。

---

## 1. 结论

**当前版本的主要短板是「口径不统一」而不是「视觉不够漂亮」。** 演示主路径（案例回填 → 表单 → 推荐 → 报告 → 对比 → 微调）中，"看到的"和"实际用的"多处对不上：疲劳量纲/置信区间自相矛盾、案例回填后病害复选框显示为空、候选编号与展示序号错位、步进条永远只显示 5 步、重跑会先清空旧结果。雷达/证据链的视觉迭代方向是对的，但评委或企业工程师第一次细看时，这些口径问题会先一步损伤可信度。

---

## 2. Findings

> 严重级：**Critical** = 演示主路径上会当众穿帮或产生错误认知；**Important** = 明显损害理解/操作/可信度，应本轮修；**Minor** = 局部打磨，可本轮或下轮。
> 原则引用简写：layout=better-layout、type=better-typography、ui=better-ui、writing=better-writing；spec 指 `docs/superpowers/specs/2026-10-16-city-contest-rag-system-design.md`。

### 2.1 Critical

| 编号 | 严重级 | 位置 | 现状 | 建议改法 | 为何影响体验 |
|---|---|---|---|---|---|
| C1 | Critical | `apps/server/src/adapters/mock-c-baseline.ts:37,47-54,131-133`；`apps/server/src/adapters/mock-a-rules.ts:17`；`apps/web/src/components/CandidateCard.vue:126-127`；`apps/web/src/components/BenchmarkTable.vue:22` | 疲劳指标三处口径互相矛盾：候选预测 **81.75"次"**（CI 77.66~85.84"次"）、模块 A 目标 **1,000,000 次**、基准表同列为 "1,000,000 次 / 81.75"。另：低温预测因 CI 用 `value*0.95/1.05` 生成，负值下显示为 **"-26.55 ~ -29.35"（下界 > 上界）**；报告正文/LLM 生成的方案对比仍可能说"满足设计目标"。 | 统一量纲：mock C 的 fatigue 改为真实次数（基准值 ×10⁴，`RADAR_ANCHORS.fatigue` 同步改 60万~100万），或单位统一为"万次"并把目标/基线改为"100 万次"；CI 改为 `value ± 5% × abs(value)` 且保证 `low ≤ high`；目标/预测/基准/报告共用同一 unit 来源（`DIM_META`）。 | 工程师一眼能看出"疲劳寿命 81.75 次"不成立；demo step5 要求"量化显示提升幅度"（`docs/demo-script.md:38`、spec §9 G6），量纲错会让整份报告和排序失去可信度——比任何视觉细节都致命。 |
| C2 | Critical | `apps/web/src/components/SceneForm.vue:51-59`；`packages/contracts/src/registry.ts:22-35,76-86,107-115`；`data/corpus/cases/cases.json` | 案例一键填入后表单"显示 ≠ 状态"：① 回填 `values.distresses = ['rutting','shoving']`，而复选框选项 value 是中文（车辙/横向裂缝…）→ **5 个案例载入后"病害类型"全部未勾选**（实测 7 个 checkbox `is-checked=false`），但提交仍携带隐藏的 rutting/shoving，用户既看不见也删不掉；② 案例 zone 为「1-4 华南湿热区 / 2-2 东北寒冷区 / 1-3 江淮湿润区 / 2-1 华北温区」，均不在 registry 选项内（华南高温区/寒冷地区/…），下拉显示为"列表外值"，改选后无法回选；③ 环保/降噪是自由文本，回填后显示内部枚举 **normal/none/strict**。 | 统一"值 vs 标签"：distresses 用 `{value:'rutting', label:'车辙'}`；zone 选项覆盖案例实际分区（或把案例值映射到标准分区并保留展示文案）；env/noise 改为 select（标准/环保要求高/严格…）。回填后加值域断言并在缺失时显示"未选择"，不要静默塞入列表外值。 | demo step1 旁白"病害=车辙（severe）+推挤"时，屏幕上病害区是空的（`docs/demo-script.md:14`；spec §7-3 schema 驱动 UI、§8 表单由注册表渲染）。这是"控件不反映真实状态"（layout 原则 2/10），且隐藏值会实际影响推荐结果，属功能性缺陷而非样式问题。 |

### 2.2 Important

| 编号 | 严重级 | 位置 | 现状 | 建议改法 | 为何影响体验 |
|---|---|---|---|---|---|
| I1 | Important | `apps/web/src/components/CandidateCard.vue:92-99,54-63,98`；`apps/web/src/components/BenchmarkTable.vue:25`；`apps/web/src/views/RecommendView.vue` KPI hero（约 :313-352） | 同一候选三种称谓且编号错位：卡片写"**方案 1（cand-2）**、方案 2（cand-1）、方案 3（cand-3）、方案 4（cand-5）、方案 5（cand-4）"（id 是召回顺序，展示是得分重排）；报告正文与基准表列头全是裸 `cand-N`；折叠摘要行"碳排 70 · 高温 63 · 低温 60"是**雷达绝对分（0-100）**，与同名物理量（碳排 52.08 tCO2e、高温 82.5℃）混淆；"综合得分 0.630"无刻度说明，旁边雷达却是 0-100。 | 排序完成后按名次重编 `candidate.id`（cand-1=第一名）并同步 benchmark/evidence 映射；或前端统一"方案 N"显示层（benchmark 列头 → "方案 N · SBS+AC"），报告 prompt 要求用"方案 N"指代；摘要行加"分"字或改为"优势项：碳排/高温/低温"；得分加 tooltip"加权归一化得分（0–1，越高越好）"。 | 用户要在 5 张卡、报告正文、基准表之间来回对照；"方案 2（cand-1）"与正文"cand-1 紧随其后"读起来像两个对象，直接增加决策成本。违反 writing 原则 2（一致性）与 layout 原则 3（共享对齐边）。 |
| I2 | Important | `apps/web/src/components/BenchmarkTable.vue:18-35`；`apps/web/src/views/RecommendView.vue` 折叠区（约 :376-395）；`apps/server/src/orchestrator.ts:608-620`；`docs/demo-script.md:38` | 基准表只有裸数值：没有"越高越好/越低越好"方向、没有差值/提升百分比、没有达标标记；候选单元格无单位（基线列有 ℃/分）；低温 -10 → -27.95 视觉上像"变差"；表头"与规范查表基线对比"重复出现两次（collapse 标题 + 内层 card 标题）；demo 台词"量化显示提升幅度"没有对应列。 | 每行加方向与差值/百分比（如"较基线 +7.8℃ / +10.3%"）并对未达标值标红；列头用"方案 N·材料名"；候选单元格补单位或列头统一单位；去掉内层 card 的重复标题（collapse 内直接放表格）；表下补一句"低温/成本/碳排为越低越好"。 | 评委要看"比规范基线好在哪、好多少"（spec §9 G6、预期成果(3)），当前表只能靠领域知识猜方向；重复标题是明显排版瑕疵（layout 原则 1/3，writing 原则 10）。 |
| I3 | Important | `apps/web/src/views/RecommendView.vue` running 模板（约 :286-310）、`LOADING_PHASES`（约 :160-180）；`apps/web/src/components/StepStepper.vue:22-39,62-64`；`apps/web/src/stores/recommend.ts:37-39`；`apps/server/src/orchestrator.ts:128-133` | 进度语义前后矛盾：① 步进条 items 来自 `liveSteps`，实测运行中只显示"解析→排序"**5 步**，第 6 步"报告"在 done 到达时被清空（基本不绘制）；② 活动步停在"排序"，而真实耗时（实测约 16.5s）发生在报告生成；③ 完成后 `StepStepper` 整块消失，无总耗时/链路回看；④ 阶段文案每 1.5s 无条件轮播，排序阶段却显示"正在检索知识库…"；⑤ 若恢复"完成后展示"，server 的 `steps.ms` 是**累计时间戳**（`performance.now()-startedAt`），会显示成每步 ~860ms 的错误值。 | 始终渲染六步（占位 + `active = liveSteps.length`），完成态保留一条紧凑步进（显示总耗时"全链路 17.5s"），每步耗时改增量（server 记录 Δ 或前端做差），阶段文案绑定 step 而非定时器；报告步文案写"LLM 文案生成中"。 | demo step2 要"六步步进条实时展示，各步毫秒级"（`docs/demo-script.md:19`），观众实际只看到 5 步；三处进度互相矛盾会让人怀疑系统状态（ui 状态走查要求 loading 自洽；writing 原则 2 一致语气）。 |
| I4 | Important | `apps/web/src/stores/recommend.ts:59-70,49-57`；`apps/web/src/views/RecommendView.vue` 工具栏（约 :259-285） | 每次 `run()`（含微调）**先 `report.value = null`** 再请求；SSE 失败→回退 JSON，再失败→结果页只剩错误 alert + 工具栏，旧报告不可恢复；`streamRecommend`/fetch 无 AbortController/超时/取消按钮；running 时"应用并重新推荐"仍可点，可并发两个 run，`liveSteps` 会交错；结果页发起失败时留在结果页空白（`fallbackJsonRun` 只在非结果页回退到输入页）。 | 保留旧报告直到新报告 `onDone`（新数据到达前用遮罩/骨架叠在旧内容上，失败回滚并提示）；run 期间禁用"应用并重新推荐/修改参数"或二次确认；加 AbortController + 30s 超时 + "取消生成"；失败时提供"重试"并展示可读原因。 | demo step7 改预算重跑，一旦 LLM 抖动就整页空白，现场无法救场；并发 run 会让结果不可信（spec §5 三档降级要求系统不崩；ui 加载/错误状态必须自洽）。 |
| I5 | Important | `apps/web/src/views/RecommendView.vue` 结果页（工具栏约 :259、hero 约 :313、`onCite` 约 :127）；`apps/web/src/router.ts`（无结果路由）；`report.scene` 在前端 0 引用 | 结果页不显示本次输入场景（气候/交通/病害/预算/工期）与来源案例；微调预算/工期后没有任何"已修改 500→350"的差异提示；工具栏不吸顶，结果页实测高约 3100px，滚到证据链后要回顶才能改预算/返回；两页流程只在内存（`step`），**刷新或浏览器后退直接丢结果**（后退会离开工作台）。 | hero 上方加一行场景 chips（来自 `report.scene`）+ 案例名；微调后显示"预算 500→350 已生效"和"恢复原值"；工具栏 `position: sticky; top: 0`；`step` 同步到 URL query/history 或 sessionStorage，刷新可恢复（至少给"结果未保存"提示）。 | 用户无法确认"这份推荐基于什么条件"，微调是否生效也不可见（layout 原则 4/10：重要信息靠上、关键动作不要随滚动消失；spec §8 微调面板是核心流程末步）。 |
| I6 | Important | `apps/web/src/components/ReportSection.vue:106-121,145-155`；`apps/web/src/assets/base.css:1-6` | 1440 视口下报告卡片正文宽约 **1150px**（14px 字号），实测每行 **57–77 个全角字（平均约 66）**，远超舒适行宽；段间距 8px < 行距 23.8px（14×1.7），4–6 段长文读起来成块；节标题 h4 与正文同字号（14px），只靠加粗区分。 | `.report-paragraph { max-width: 40em }`（约 560–640px，或给报告正文单独 720px 容器）；段间距 12–16px，节标题 16px/600 + 上间距 24px、节间 32px；行高保留 1.7；数字与单位用 `&nbsp;` 防断裂。 | 报告是主交付物、评委逐段读；行宽/段距是可读性第一因素（type 原则 9 cap the measure、原则 7 line-height、原则 6 heading 层级）。 |
| I7 | Important | `apps/web/src/components/CandidateCard.vue:76-82`；`apps/web/src/components/ReportSection.vue:129-132`；`apps/web/src/components/EvidencePanel.vue:100-105`；`apps/web/src/App.vue:46-52`；`apps/web/src/components/ChatDock.vue`（in-progress）；`apps/web/src/components/CaseCard.vue:44` | 键盘/读屏走不通主流程：候选卡展开/收起是 `div role="button"` 无 `tabindex`（实测 -1）；报告"证据 N"是 `span @click`；证据卡整卡是 `div @click`；logo 的 `role="button"` 同样不可聚焦；追问侧板打开后没有 `role="dialog"`/焦点圈、关闭不归还焦点（新 ChatDock 已自动聚焦输入框，但焦点返回/圈定仍缺）；5 张案例卡按钮无障碍名都叫"载入工作台"。 | 可点击非按钮元素一律改真 `<button>`（项目已有全局 `button:focus-visible` 样式），或补 `role/tabindex/Enter/Space/focus-visible`；候选卡头用 button + `aria-controls`；侧板补 `role="dialog"`、`aria-modal`（或至少 `aria-label`）、Esc 关闭语义、关闭后 focus 回 FAB；案例按钮 `aria-label="载入案例：${title}"`。 | 键盘用户/读屏用户无法完成"展开方案→看证据→追问"的主流程；与团队「键盘交互」迭代承诺和 spec §10 浏览器手测相冲突（ui 状态走查明确要求覆盖 focus；WCAG 2.1.1 键盘可操作）。 |
| I8 | Important | `apps/web/src/components/SceneForm.vue:22-39,89-91,124-129`；`apps/web/src/views/RecommendView.vue` 输入页（约 :199-255）；`packages/contracts/src/registry.ts:58-64` | 参数页可提交"空场景"：数值字段默认 **0**（PG 高温/低温、ESAL、预算、工期），无必填校验；实测直接点"生成推荐方案"返回 200 + targets 高温 64℃/低温 -22℃ + 5 候选 + 完整报告，界面没有任何"输入不完整"提示；ESAL 用默认步进 1 的 input-number（要敲 8 位数字）、无千分位；参数页无标题/两步流程提示，第一张卡是"典型案例一键填入"。 | 数值字段初值 `null` + 占位示例（如 20000000）；PG、ESAL、预算、至少 1 个病害设必填并内联报错；ESAL 以"万次"输入 + `formatter` 千分位（或 step=1000000）；参数页加 h1"推荐工作台 · 养护场景"+ ①参数 ②结果 步骤条，顶部说明"所有字段均可由典型案例回填"。 | 用户可能没填完就提交，得到一份"看起来正常"的报告——比报错更危险；ESAL 输入方式不符合工程师习惯（writing 原则 10 错误靠近字段、原则 12 placeholder 是示例；type 原则 11 千分位；layout 原则 4 重要信息靠上）。 |
| I9 | Important | `apps/web/src/components/EvidencePanel.vue:84`；`apps/web/src/api/client.ts:54,93,166,221`；`apps/web/src/views/RecommendView.vue:194`（错误 alert）、约 :322（"文案模板降级"）；`apps/web/src/components/KbStats.vue:16,18-25`；`apps/web/src/components/KbSearchBox.vue:76` | 面向用户的界面直接暴露实现细节：证据链空态写"知识库为空，**请执行 pnpm build:index**"；错误 alert 实际显示"推荐失败：**Failed to fetch**"（离线实测）或"请求失败（500）: /recommend"；知识库统计显示 `knowledge：42 / standard：57 / literature：1241`；检索结果 provenance 显示 `knowledge`；"检索后端 `lancedb`"；降级角标"文案模板降级"是内部行话。 | 抽 `utils/labels.ts` 统一 DOC_TYPE_LABELS/DIM_LABELS；空态写"知识库暂无内容，请先导入资料"（维护者入口另放"重建索引"）；错误写"服务暂时不可用，请稍后重试（错误码 500）"，去掉 API 路径；错误 alert 加"重试"按钮；"文案模板降级"→"AI 文案暂不可用，以下为模板文案（数值不受影响）"。 | 现场评委/企业工程师看到 `pnpm`、英文 `Failed to fetch` 会立刻判定"这是开发版"；文案是产品可信度的一部分（writing 原则 3/4/10/11）。 |

### 2.3 Minor

| 编号 | 严重级 | 位置 | 现状 | 建议改法 | 为何影响体验 |
|---|---|---|---|---|---|
| M1 | Minor | `apps/web/src/components/RadarChart.vue:104-126`；`apps/web/src/components/WaterfallChart.vue:43-57` | 图表只监听 `window.resize`；实测折叠侧栏后容器 734→870px，画布仍停在 734px（右侧留白）。canvas 无 `aria-label`/数据表替代。 | 用 `ResizeObserver` 监听图表容器（两者共用一个小 composable）；ECharts 开 `aria.enabled` 或补可见数据表；图表容器加 `role="img"` + 摘要 aria-label。 | 侧栏折叠是常用操作，图表不随布局重绘显得"没做完"；图表数据对读屏用户不可达（ui 细节；layout 原则 10 适配）。 |
| M2 | Minor | `apps/web/src/components/KbUpload.vue:95-102`；`apps/web/src/components/KbSearchBox.vue:55`；`apps/web/src/views/KnowledgeView.vue:64-75` | 知识库页：原生 `<input type="file">`（暗色下显示英文 "Choose File / No file chosen"、未样式化）；Top-K 数字框无标签；"重建索引"无二次确认/耗时说明，且按钮 `type=warning` 显得像危险操作。 | 用 el-upload 或隐藏 input + 主按钮；Top-K 前加"Top-K"标签/tooltip；重建索引加确认弹窗 + "会重新切块并嵌入全部语料（约 X 秒）"说明。 | demo step8 会打开此页，原生控件与整体中文深色界面割裂；重建属破坏性/耗时操作，需要确认与预期（ui 一致性；writing 原则 5 动词按钮）。 |
| M3 | Minor | `apps/web/src/views/WelcomeView.vue:119-128`；`apps/web/src/components/KbStats.vue:10-17`；`docs/demo-script.md:43,53` | 统计口径不清：欢迎页徽章"知识块 1340 / 知识条目 42 / 规范条文 57 / **文献 1241**"中后三者是 **chunk 数**（相加=1340），不是"条目/篇"数；知识库页写"文档 / 块总数 1340"混称；demo 台词说"42 条知识条目、57 条规范条文、142 篇文献题录"，与"文献 1241"冲突，且"241 个知识块"已过时。 | 徽章标"知识块"并加 tooltip"按文档类型切块数；文献题录 142 条、全文 7 篇"；后端 stats 增加 `docCount` 并列展示；同步修正 demo-script 数字。 | 数据规模是可信度卖点，口径不清会被追问（writing 原则 4 plain words；spec §6.3 语料规模）。 |
| M4 | Minor | `apps/web/src/components/CandidateCard.vue:105-122,126-127` | 配方卡只展示沥青/改性剂/级配/油石比/空隙率：未展示 `formula.additives`（报告正文与 KPI 都提"外掺 0.3% 木质素纤维"）与 `binder.pg`（PG76-10）；`ciLow/ciHigh` 缺失时静默省略区间，spec §7-5 要求"标'置信区间不可用'"。 | 补"助剂"与"PG 等级"行（或 chips）；缺 CI 时显示"置信区间不可用（模块 C 未提供）"。 | 配方核对是工程师看卡片的主要目的；报告里有、卡片里没有会让人来回翻（layout 原则 4；spec §7-5 部分可用语义）。 |
| M5 | Minor | `apps/web/src/App.vue:14,44`；`apps/web/src/components/BenchmarkTable.vue`；`apps/web/src/components/CandidateCard.vue` 头部；`apps/web/src/views/RecommendView.vue` 工具栏 | 窄视口适配不足（<1024）：侧栏固定 200/64px、无自动折叠；800px（侧栏展开）实测基准表 table 560px > wrapper 508px，**最后一列 cand-4 被裁掉且无横向滚动**；候选卡头"收起"被拆成两行；微调工具栏折成 3 行。 | <1024 自动折叠侧栏（抽屉/rail）；表格允许横向滚动或窄屏隐藏次要列；候选卡头允许 `flex-wrap` 并把"收起/展开"放到独立按钮；工具栏改两行网格。 | 现场投影/窗口缩放常见；1024 可用，但再窄会丢数据（layout 原则 10 clipping）。 |
| M6 | Minor | `apps/web/src/assets/base.css:31-59`；`apps/web/src/components/StepStepper.vue:78-91`；`apps/web/src/components/ChatPanel.vue`（in-progress） | 骨架 shimmer、步进 spinner 为无限动画，仅 `ReportSection` 处理了 `prefers-reduced-motion`；聊天流式回复无 `aria-live` 播报。 | 全局 `@media (prefers-reduced-motion: reduce)` 关掉 shimmer/spin；聊天消息容器 `aria-live="polite"`。 | 低动效偏好用户与读屏用户（ui 动效克制原则；无障碍）。 |
| M7 | Minor | `apps/web/src/components/WaterfallChart.vue:18-41`；`apps/server/src/adapters/mock-c-baseline.ts`（不返回 explanations） | SHAP 瀑布图当前 mock 不触发（无 `explanations`）；一旦接真实模块 C，会出现无标题/无释义的柱状图，横轴是英文 feature 名、纵轴"贡献"无单位。 | 接真实 C 前先补：标题"各因素贡献（SHAP）"、feature 中文映射、"正值促进/负值抑制"说明；无数据时显示"模块 C 暂未提供可解释性"。 | 真实 C 接入后第一时间穿帮；spec §9 G4 要求可解释但未规定展示口径。 |
| M8 | Minor | `apps/web/src/components/CaseCard.vue:40-46`；`apps/server/src/routes/cases.ts:23-31`；spec §8 | `/cases` 已返回 `expected`（期望配方）、`tags`、`canPreRun`，前端一个都没用；案例卡只有标题/摘要/场景行；spec §8 写"一键载入工作台跑通 + **预跑结果**"，当前只回填表单不预跑，按钮"载入工作台"也不说明下一步要手动点"生成推荐方案"。 | 卡片加"预期方案：SBS + 高模量剂 + AC（示例）"或"查看案例说明"折叠（用 `expected`）；按钮改"载入并生成推荐"（回填+自动提交）或载入后提示/聚焦"生成推荐方案"；可用 `canPreRun` 显示"向量库就绪"状态。 | 案例页是说服评委"有金标准"的地方，后端能力不展示等于浪费（spec §8；layout 原则 4 重要信息靠上）。 |

---

## 3. 本次迭代建议包（≤6 项，按优先级）

> 工作量口径：S ≤ 0.5 天、M ≈ 1 天、L > 1 天（单人）。建议在用户已提 5 点的改造落地后合并，避免同文件冲突。

| 优先级 | 建议包 | 覆盖问题 | 预估工作量 | 用户价值 | 验收口径 |
|---|---|---|---|---|---|
| P1 | **表单回填与校验闭环**：案例回填值域统一（病害 value/label、zone 选项、env/noise 改 select）+ 数值默认空值 + 必填校验 + ESAL 万次/千分位 | C2、I8 | S | 演示 step1 不再"说填了显示没填"；避免空场景出报告；工程师能正常输入 ESAL | 5 个案例回填后 DOM 勾选/选择项与 scene 一致；空表单被拦截并给字段级错误；ESAL 显示 3,000 万次 |
| P2 | **数值与命名口径统一**：疲劳量纲、低温 CI 方向、基准表方向/差值/单位/达标标记/去重复标题、cand-N → 方案 N、得分刻度说明 | C1、I1、I2 | M | 报告/基准/卡片三处自洽，评委细看不出硬伤；"提升幅度"可被直接引用 | 任一案例：目标/预测/基准同量纲且 CI low≤high；基准表含方向、Δ%、达标标记与单位；方案 N 与 cand-N 一一对应（或不再露出 cand-N） |
| P3 | **结果页状态与重跑安全**：旧结果保留到新报告到达、run 期间禁用/取消/超时、失败重试、场景摘要 chips、微调变化提示、工具栏吸顶 | I4、I5 | M | 微调演示不因网络抖动空白；用户可核对推荐依据 | running 时"应用并重新推荐"禁用且可取消；失败后旧报告仍在并可重试；结果页显示场景 chips 与"预算 500→350"；滚到页面底部仍可操作工具栏 |
| P4 | **进度真实性与运行详情**：固定六步占位、active=下一步、报告步可见、完成后紧凑步骤+总耗时、`steps.ms` 改增量、阶段文案绑定真实 step | I3 | M | demo step2 的"六步/毫秒级"成立，耗时可解释 | 运行全程显示 6 步且报告步可见；完成后可回看每一步 Δms 与总耗时；阶段文案与当前步一致 |
| P5 | **报告阅读体验与配方补全**：正文 max-width/段距/节标题层级；候选卡补 additives/PG；缺 CI 标注"不可用" | I6、M4 | S | 主交付物可读，工程师能在卡片核对配方 | 1440 下正文 ≤45 全角字/行、段间 12–16px、节标题 16px；卡片含助剂与 PG；缺 CI 有文案 |
| P6 | **可访问性与对外文案收口**：可点击 div/span → button/tabindex+键盘事件+focus-visible；侧板 role/焦点归还；图表 ResizeObserver + aria；统一术语/错误/空态文案（去 pnpm、API 路径、英文错误、docType 键） | I7、I9、M1 | S–M | 键盘可走通主流程；界面不再露出开发信息 | Tab 可展开候选/证据/侧板并返回触发按钮；图表随侧栏折叠重绘；空态/错误/统计无内部实现细节 |

**为什么是这 6 项**：C1/C2 是可信度硬伤（P2/P1）；P3/P4 直接影响现场演示的可控性与叙事；P5 提升主交付物（报告）的阅读质量；P6 是把已存在却不可用的交互补成可用。其余问题（M2/M3/M5/M6/M7/M8）价值真实但优先级低于以上，见 §4。

---

## 4. 明确不建议本轮做

| 项 | 原因 |
|---|---|
| 继续扩雷达图视觉/交互（多方案叠加、点击联动、动画） | 用户已提，且 `dbeaf57` 已做暗色适配；本轮先把 P1–P6 的口径/交互补完，雷达叠加对比属新功能（L）。 |
| 追问面板功能扩张（多轮记忆、引用高亮、历史持久化、消息收藏） | 用户已提"显示逻辑/尺寸"；`ChatDock.vue` 正在重构，本轮先把三态/焦点/文案收口，功能扩张留下一轮（L）。 |
| 继续重设计证据链/报告证据样式 | 用户已提，`d97617e` + `cae5e74` 已落地"证据 N + 卡片化"；本轮只补 §5 的编号联动/来源 DOI/自动展开（S），不重启视觉方案。 |
| 流式 token 级改造（逐字输出） | 用户已提"感知弱"；真正的 token 流需要改后端 LLM 调用结构（M–L）且与报告结构化输出耦合，本轮用分节到达+进度真实化（P4）即可改善感知。 |
| 案例页自动预跑/预跑结果缓存 | spec §8 有此表述，但实测两节 LLM 调用约 16.5s；预跑会让案例页首屏等待或引入缓存复杂度（M–L），本轮先展示 `expected` 预期方案文案（M8 的一半，S）。 |
| 报告导出 PDF/Markdown、分享链接 | 演示以录屏/现场讲解为主，当前无此痛点；实现涉及后端渲染或前端打印样式（L）。 |
| 真实 SHAP explanations 接入与瀑布图完善 | 依赖模块 C 团队返回 `explanations`，当前 mock 无数据；先按 M7 预留文案即可（L，队友范围）。 |
| 移动端 <768 / 触屏完整适配 | 演示设备为桌面/投影；本轮 P6 只做 <1024 自动折叠侧栏，完整响应式留赛后（L）。 |
| 全站健康指示/系统状态页 | spec §8 的"健康指示"加分项，但与演示主叙事无关，价值低于口径类问题（M）。 |
| 刷新恢复/结果深链的完整方案 | 本轮 P3 先做"旧结果不丢 + 失败可重试 + 提示"，完整的 URL/sessionStorage 状态持久化需要定义边界与冲突策略（M–L），下一轮再做。 |
| 引入新组件库 / 视觉回归自动化 / 全站主题重制 | 冻结前风险高、收益低；现有 Element Plus + token 体系够用。 |
| 用前端字符串替换把 `cand-N` 改成"方案 N" | 治标：LLM 文案里的 id 组合不可控；应在后端排序后重编号或前端统一映射层（并入 P2）。 |

---

## 5. 补充意见：对用户已提 5 点的补充（不重复评审）

1. **雷达图**：`dbeaf57` 已用 CSS token + `MutationObserver` 做暗色适配，方向对；建议顺手加 `ResizeObserver`（M1）并把"雷达分 0-100 / 预测值+单位"的关系在 tooltip/图注里说清，避免和 I1 的"摘要行数值混淆"叠在一起。
2. **追问面板**：`ChatDock.vue` 正在重构（标题"追问/基于当前报告"、自动聚焦、消息撑满高度、打字点），这些都对；剩余建议：`role="dialog"`+关闭后焦点归还触发按钮（I7），以及"换一份报告时是否清空旧对话"需要产品决策（当前 `store.chat` 跨报告保留，会把旧对话作为 history 发给新 reportContext）。
3. **报告裸证据 id**：`d97617e` 已改为"证据 N"编号，`cae5e74` 已卡片化。补充：① 点击"证据 2"实测只高亮目标卡、**不自动展开**（`is-expanded=false`），仍需二次点击才能看到原文——建议 `onCite` 时把目标 chunk 加入 `expandedIds`；② 证据卡片上没有"证据 N"徽章，报告编号与证据列表无法互认；③ tooltip 只有 40 字摘要，建议补"来源规范号/DOI"。
4. **证据链单调**：卡片化后好很多；建议再加"类型色图例"和按"知识条目/规范/文献"分组（或过滤），"相关度（归一化）：100"改为"相关度 100/100（相对首位）"更诚实（当前首位恒为 100，容易被读成绝对相关度）。
5. **流式感知**：当前每节一次 LLM 调用（实测首节 ~8s、两节 ~16.5s），"分节到达 + 骨架+阶段文案"确实弱；若本轮不做 token 级流式，P4 的"真实进度+总耗时"是性价比最高的补强，同时能避免"循环文案"造成的误导。
6. **文档口径（非 UI 代码）**：`docs/demo-script.md:53` 的"241 个知识块"应为 1340；"142 篇文献题录"与欢迎页"文献 1241（块）"需统一为"142 条题录 / 7 篇全文 / 1241 个切块"。建议本轮顺手同步，避免演示台词与界面打架。

---

## 6. 评审方法与验证边界

- **源码**：`apps/web/src/**`（4 视图、14 组件、Pinia store、utils、theme/base 样式、router/router-view）；`apps/server/src/**`（routes/cases、recommend、chat、kb；adapters/mock-a-rules、mock-c-baseline；orchestrator 六步与 `buildBenchmark`；report/fallback）；`packages/contracts/src/schemas.ts`、`registry.ts`；`docs/demo-script.md`、`docs/DELIVERY.md`、spec §1–§10。
- **接口实测**：`/api/v1/health` → lancedb/1340/ok、llm configured、a/c mock；`/cases` → 5 案例（含 zone 取值）；`/recommend`（case-01 与「默认空场景」均 200 + 完整报告）；`/recommend/stream` → step×6 + section×2 + done（实测 parse~rank 0.92s、report 累计 17.49s）；5 案例 scene 字段逐项核对。
- **浏览器实测**：1440×900（暗/亮）、1024×768（暗）、800×700（暗）；覆盖输入页（案例回填前后 DOM）、运行中（步进条/阶段文案/骨架）、结果页（KPI/报告/基准表/雷达/证据链/候选折叠）、案例页、知识库页（统计/检索/上传/重建）、追问侧板、离线错误态；console 无 JS error（离线网络错误除外）。
- **关键实测数据**：案例回填后 7 个病害 checkbox 均未勾选；候选顺序 cand-2、cand-1、cand-3、cand-5、cand-4；疲劳 81.75"次" vs 目标 1,000,000 次；低温 CI "-26.55 ~ -29.35"；折叠侧栏后图表容器 734→870px 而 canvas 仍 734px；800px 下基准表最后列被裁且无横向滚动；默认空场景可产出完整报告；浏览器后退直接离开工作台。
- **未验证/边界**：真实屏幕阅读器、Safari/Firefox、200% 缩放与文本放大、触屏、<768、真实模块 A/C、SHAP、LLM 降级路径（当前 LLM 已配置）。这些项若在演示环境有差异，需在修复后复测。

---

*评审者：ux-reviewer ｜ 日期：2026-10-19 ｜ 本报告只读评审，未修改任何产品代码。*
