# R5 评审报告 — 最终全分支评审（合并前最后一道门）

- **评审人**：critic（独立评审，代码只读）
- **日期**：2026-10-17
- **范围**：`34b296f..HEAD`（dev/rag-system 全量 123 文件 / +17900 行）；R1–R4 已审文件只扫变更
- **对照依据**：spec §1.3 成功标准 1–8、Review Focus 6 条、Global Constraints、T14 计划断言、Ledger 裁决（R14–R26）

## 结论：CHANGES_REQUIRED（技术验收全绿；仅剩 T15 交付物与 R25 小修）

所有技术项经 critic 独立重跑复核通过；未闭环的只有 3 项（均非代码缺陷）：① T15 的 `docs/demo-script.md` 未产出（README 已链接、暂悬空）；② T15 的 `scripts/anonymity-audit.ts` 未产出（SC8 的自动化抓手缺失）；③ R25 修复（registry `pavement.layer` 增 `surface` 值）已派但未 commit。Lead 完成 T15 + R25 后我做最终复核关闭。

---

## 一、spec §1.3 成功标准逐条核验

| # | 标准 | 状态 | 证据（critic 亲跑，本轮实测） |
|---|---|---|---|
| 1 | 三命令一键起（`pnpm install && pnpm build:index && pnpm dev`） | ✅（附环境注记） | 根 scripts 齐全；build:index 走 tsx CLI。**本机注记**（R22/R26 裁决）：需 `EMBEDDING_MODEL=multilingual-e5-small`（bge-m3 因 huggingface.co 不可达不可用，README/DELIVERY 已记录）；端口 3000/5173 被 grafana/docker 占用 → 演示用 3010/5174 + `API_PROXY_TARGET`（0f89ab3 已实现）。三命令在本机按注记环境验证：build-index 全量 241 chunk（此前实测 13s）、dev 双端可起（我本轮起过 3010 server + 验证 vite 5174 proxy 链路） |
| 2 | 5 案例端到端跑通（mock 报告含候选 + 非空证据） | ✅ | 我独立重跑 `e2e-cases.ts`（自起 3010 server、lancedb 241 chunk、e5、LLM_OFF=1）：**5/5 全绿**，candidates=5、evidence 5~11 条非空、radar 8 维 0-100、steps 六步、两遍确定性全等、top-1 差异化 3/5（R3-C1 回归钉住） |
| 3 | 金标准 20 条 recall@k 全过 | ✅ | R2 门已复核（本轮未重跑但双引擎 20/20 证据在案：lancedb 实机索引副本 + sqlite 重建均 exit 0） |
| 4 | 三视图 + 对话面板可用，console 无报错 | ✅ | **critic 独立浏览器走查（chrome-devtools-mcp）**：/recommend 完整交互（提交→步进条→目标权重→基准表→5 候选卡（模拟角标+CI+LCC/碳排/寿命）→证据链（归一化相关度 100/99/98 + provenance）→模板降级报告→对话面板）；/cases 5 卡片；/knowledge 统计 241 + PDF 上传入口（accept 含 .pdf）+ 检索"车辙 SBS"返回 5 命中（首位归一化 100）。三视图全程 **0 console error / 0 warn**。4 张截图为真实全尺寸 PNG（1905×2053/2069，124–526KB） |
| 5 | 三类降级路径可演示且不崩 | ✅ | 我独立重跑 `e2e-degradation.ts`：LLM_OFF=1 → `llmStatus:degraded` + 模板 sections 非空；A/C 指向不可达端口 → `adapterMode:{a:mock,c:mock}`；空库（sqlite 未建）→ 200 + `warnings:["知识库为空，请执行 pnpm build:index"]`、evidence=0。exit 0 |
| 6 | `docs/DELIVERY.md` 技术交接文档齐全 | ✅ | 已产出且结构完整：模块关系/数据结构（关系表+向量库+provenance 七字段）/输入输出字段/接口样例（curl）/遗留项诚实标注（C3/C5/C7/R22）/数据需求（G7） |
| 7 | 语料来源标注 + 模拟数据角标 | ✅ | 语料 sourceRef 100% 非空（R2 复核）；浏览器实测"模拟数据"角标出现在视图级徽章与每张候选卡；模板降级提示亦在 |
| 8 | 匿名合规（UI/文件名/git 历史无身份信息） | ⚠️ 部分 | 代码/语料/UI 文案/commit（author=contest-team）各门已核查无身份信息；`.env`/`.db`/`.pdf` 不入库（`git ls-files | grep -E '\.(env|db|pdf)$'` 为空）。**但自动审计脚本 `scripts/anonymity-audit.ts`（T15）未产出**——SC8 的持续保障抓手待补 |

## 二、Review Focus 6 条 → 测试钉住映射（全部有测试）

| # | 输入/故障类 | 钉住测试（critic 亲跑过） |
|---|---|---|
| 1 | 未知/多余字段不崩 | contracts.test（extraField 保留）+ 前端 fixture 注入未来字段（recommend-view.test） |
| 2 | LLM 未配置/离线 → degraded | llm.test（LLM_OFF 立即 degraded 不触网）+ e2e-degradation |
| 3 | A/C 非契约/超时 → mock | adapters.test（不可达端口 + fake 非契约服务器 + 合法透传） |
| 4 | 向量库空/损坏 → evidence:[] + warnings | recommend.test（空库 200+warnings）+ e2e-degradation 实测 |
| 5 | contentHash/模型版本变化 → 重建 | build-index.test（modelVersion 变化全量重建、hash 变更重嵌） |
| 6 | 重复语料幂等跳过 | build-index.test（二次 skip=6 count 不变） |

## 三、e2e 报告与截图真实性复核

- **e2e-report.md** 各项声明与我的独立重跑结果**逐一吻合**（5/5 案例、top-1 签名 3/5、降级三档、证据数一致 case-01=11 等）。
- 截图 4 张为真实渲染（有效 PNG、全尺寸、内容体积合理）；我因当前模型无图像输入未做像素级目检，以浏览器走查 + 尺寸/体积 + Lead 走查记录三方佐证。
- 附加验证（超出报告）：浏览器交互链路（提交推荐、KB 检索）0 console error/warn。

## 四、T15 交付物状态（R5 时点）

| 交付物 | 状态 |
|---|---|
| README.md | ✅ 已产出（三命令/架构/环境注记；`docs/demo-script.md` 链接暂悬空） |
| docs/DELIVERY.md | ✅ 已产出（G7 六项齐；遗留项 C3/C5/C7/R22 已诚实记录——deferred minors 记账完成） |
| docs/demo-script.md | ❌ 未产出（7 步演示流程台词） |
| scripts/anonymity-audit.ts | ❌ 未产出（SC8 自动化抓手） |
| R25 修复（registry pavement.layer 增 surface 值） | ⏳ 已派未 commit（registry 上次改动仍是 aa2ffb4） |

## 五、剩余 Findings（分级）

- **Important×0**：无。
- **Minor×3（不阻塞，随 T15/演示打磨）**：
  1. M1 方案卡命名与基准表列名不一致：卡片显示"方案 N（cand-X）"而基准表列为 cand-id（浏览器实测 cand-5 对应"方案 1"）——观感小瑕疵，T15 打磨时统一。
  2. M2 默认空表单提交（全默认值）也能出结果且 top-1 为环氧沥青+高RAP（score 0.83）——演示脚本应引导使用案例填入，避免"随便一点就是环氧"的误读（与 R24 口径一致，演示脚本职责）。
  3. M3 e2e-degradation 的"空库"场景与 LLM_OFF/适配器降级共用同一实例（sqlite 空库），三档路径断言齐备但"库损坏"场景未单独演示——plan 断言已覆盖，不补。
- **Ledger 裁决一致性**：R14（node:sqlite）、R15（SSE 格式）、R17（来源署名）、R22（e5 演示）、R23（F5 砍）、R24（case-02 按 top-5 讲解）、R26（端口 3010/5174）——代码与文档均与裁决一致。

## 六、Declined to judge

- 截图像素级视觉质量（模型无图像输入，已用尺寸/体积/浏览器 DOM 走查三方佐证）。
- mock C 领域数值微调（R24 裁决为赛后项）。
- 演示脚本台词质量（T15 Lead 职责，产出后我复核结构与口径）。

## 七、最终门结论与闭环条件

**CHANGES_REQUIRED（仅剩交付项）**——技术验收（五门 + 本轮独立复跑）全部通过。闭环条件：
1. T15 产出 `docs/demo-script.md`（7 步台词，注意落 R24 口径）与 `scripts/anonymity-audit.ts`（含词表自测用例），`pnpm test` 全绿；
2. R25 修复 commit（registry pavement.layer 含 surface）；
3. （建议）README 补 `EMBEDDING_MODEL` 与端口注记的"本机演示"小节（已有部分，核对即可）。

三项完成后我复核：`pnpm test` 全链路 + 匿名审计 exit 0 + git ls-files 复查，即可判 R5 PASS 并 close task-20。

---

## Final 复核（T15 + R25 落地后，critic 亲跑全链路）

**最终结论：R5 PASS——合并前最后一道门通过。**

### 闭环项核验

| 项 | 证据（本轮实测） |
|---|---|
| 全链路 `pnpm test` | **exit 0**：contracts 5 + retrieval 14 + embedding 9 + server 37 + web 41 + scripts 28 = **134 tests 全绿**（+3 skip 为 LANCEDB_TEST 门控的真实引擎组） |
| `tsx scripts/anonymity-audit.ts` | **exit 0**：git 身份中性、无敏感文件、无词表命中；词表机制双向验证（命中词→exit 失败并给文件:行号；干净词表→通过）。R17 口径（来源署名允许）已在脚本注释明示 |
| 敏感文件复查 | `git ls-files` 中 env 类仅 `.env.example`；`data/db/`、`data/index/`、`.pdf`、`.db` 均不在版本库 ✓ |
| T15 文档 | README.md ✓（链接全部闭合）、docs/DELIVERY.md ✓（G7 六项 + 遗留项诚实标注）、docs/demo-script.md ✓（7 步台词 3–4 分钟 + 常见追问应答；主流程用 case-01，规避 R24 疑虑点，FAQ 覆盖金标准/防编造口径） |
| R25 | cbe9730 registry 值对齐（surface/middle/binder/deck）+ 32c5fb7 前端回填中文 label 回归测试（web 41/41 中含该用例） |

### 五门最终状态

R1 PASS（RRF/FTS5/SQLite，3 轮修复）→ R2 PASS（语料/入库/金标准，1 轮修复）→ R3 PASS（后端整体，1 轮修复）→ R4 PASS（前端整体，1 轮修复）→ **R5 PASS（本门）**。

### 合并建议（供 Lead）

- 分支 `dev/rag-system` 可合 main；合并前确认 `.audit-words.txt`（真实姓名/单位词表，gitignored）已在本机放置并在提交前重跑一次审计。
- 演示环境注记（R22/R26）已入 README/e2e-report/DELIVERY；若换 bge-m3 需 `pnpm build:index --rebuild`（provenance 强制重建兜底）。
- 遗留 Minor（M1 方案卡与基准表命名一致性、M2 默认空表单引导、M3 库损坏演示）记入 T15 打磨清单，不阻塞合并。