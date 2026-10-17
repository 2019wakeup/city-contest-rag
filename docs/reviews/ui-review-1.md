# UI 评审一轮（ui-review-1）

> 日期：2026-10-17 ｜ 评审者：Lead（better-ui / better-layout / better-typography / better-writing 四技能）
> 对象：apps/web 三视图（推荐工作台 / 典型案例 / 知识库管理），1440×900 视口
> 方式：浏览器 DOM 走查（空态/结果态/案例/知识库四状态）+ 12 个组件源码通读；console 0 error

## 结论

**Needs changes**（无 HIGH 阻塞项，12 项 MEDIUM/LOW 打磨项）。核心问题一句话：**信息架构把结论埋了 + 全站视觉层级同质化 + 多处英文键名/未格式化数字直接面向用户**。

---

## Findings

### Layout

#### 1. 报告埋在 5 张巨型候选卡之后（MEDIUM）
| Severity | Location | Before | After | Why |
| --- | --- | --- | --- | --- |
| MEDIUM | `views/RecommendView.vue:201-216` | 顺序 = 步进→目标→基准对比→**5 张全展开候选卡**（每张含 8 项预测+雷达图+证据链）→报告→对话 | 把 `ReportSection` 提到候选卡列表**之前**；候选卡默认折叠为「方案 N 摘要行」可展开 | 用户点完"生成推荐方案"，首屏全是表格和 5 大卡，最重要的"推荐结论"要滚动很远才见——违反 order-by-importance |

#### 2. 视觉层级同质化，核心内容无强调（MEDIUM）
| Severity | Location | Before | After | Why |
| --- | --- | --- | --- | --- |
| MEDIUM | 全站 `shadow="never"`（RecommendView/CandidateCard/EvidencePanel/StepStepper 等） | 候选卡、目标表、证据链、报告、步进条视觉重量完全相同 | 辅助面板（步进/目标/基准）保持 never；**候选卡与报告用 hover 阴影 + 更重边框色**，或候选卡 `shadow="hover"` | 层级只能靠位置猜，核心产出（候选方案）没有"主角感" |

#### 3. 间距无节奏（LOW）
| Severity | Location | Before | After | Why |
| --- | --- | --- | --- | --- |
| LOW | `.panel{margin-bottom:16px}` 与 `.status-alert{margin-bottom:12px}`、`li{margin-bottom:4px}` 混用 | 12/16/4px 无规则 | 统一 4/8/12/16/24 步长：卡片内部组内 8、组间 16、区块间 24 | 组间间隙应 ≥2× 组内，否则分组读成噪声 |

### Typography

#### 4. 变化数值无等宽数字（MEDIUM）
| Severity | Location | Before | After | Why |
| --- | --- | --- | --- | --- |
| MEDIUM | `CandidateCard.vue:53-57,92`、`StepStepper.vue:21`、`BenchmarkTable`、`RecommendView.vue:190-194` | 得分 0.729 / 预测 83.8 / 耗时 0 ms / 权重 0.2697 全是比例数字 | 数值元素加 `font-variant-numeric: tabular-nums`（全局 `.tabular` 工具类，或统一 CSS 规则） | 比例数字宽度不一，数值变化/对比时视觉跳动 |

#### 5. 预测列表用英文键名（MEDIUM）
| Severity | Location | Before | After | Why |
| --- | --- | --- | --- | --- |
| MEDIUM | `CandidateCard.vue:51-55` | `highTemp：83.8（79.61~87.99）℃` | `高温性能：83.8（79.61~87.99）℃`（perf→中文映射表，与雷达图 8 维中文名一致） | 同一指标在雷达图叫"高温性能"、在预测列表叫 "highTemp"——面向工程师的界面不应出现内部键名，且两处口径不一 |

#### 6. 数字格式（LOW）
| Severity | Location | Before | After | Why |
| --- | --- | --- | --- | --- |
| LOW | `RecommendView.vue:194` | 权重 `0.2697` | `27.0%`（toFixed(1)+%） | 权重是比例，百分数更可读 |
| LOW | `RecommendView.vue:190`、`CandidateCard.vue:57` | 疲劳目标 `1000000 次` | `1,000,000 次`（toLocaleString） | 长数字无千分位难读 |

#### 7. 字体渲染基线（LOW）
| Severity | Location | Before | After | Why |
| --- | --- | --- | --- | --- |
| LOW | `main.ts:9` 后无全局样式 | 无 `antialiased`、无 type scale 定制 | 根布局加 `-webkit-font-smoothing: antialiased`；卡片 header 统一 15px/600、正文 14px、辅文 13px | macOS/Windows 渲染差异与字号随意性 |

### UI（better-ui）

#### 8. 无按压缩放与 hover 反馈（MEDIUM）
| Severity | Location | Before | After | Why |
| --- | --- | --- | --- | --- |
| MEDIUM | 全部按钮（`SceneForm.vue:153`、`RecommendView.vue:139` 等）与候选卡 | 无 `active` 状态；候选卡 hover 无变化 | 主按钮 `active:scale(0.96)` + `transition: transform .15s`；候选卡/案例卡 hover 阴影提升 | 按压缩放是最便宜的"有响应"触觉反馈；全站无则显得死板 |

#### 9. 步进条无过程感（LOW）
| Severity | Location | Before | After | Why |
| --- | --- | --- | --- | --- |
| LOW | `StepStepper.vue:29` | `:active="items.length"` 一次性全完成态渲染 | 用 `store.status==='running' ? items.length-1 : items.length` 过渡，或跑完前不显示描述 | 6 步 0ms 全绿瞬间出现，"演示感"为 0；耗时展示无过程 |

#### 10. 侧栏品牌感（LOW）
| Severity | Location | Before | After | Why |
| --- | --- | --- | --- | --- |
| LOW | `App.vue:13` | logo 纯文字"数智选材" | 加主题色方块图标 + 副标题"沥青材料智能推荐" | 200px 侧栏只有三个菜单项，页面太素 |

### Writing

#### 11. 案例卡英文标签 + 重复行（MEDIUM）
| Severity | Location | Before | After | Why |
| --- | --- | --- | --- | --- |
| MEDIUM | `CaseCard.vue:12-13,24-25` + DOM 实测（cases 页每卡两行相同文本） | `1-4 华南湿热区 · heavy · rutting、shoving` 显示两遍，中文 summary 未呈现 | 场景行标签映射中文（heavy→重交通、rutting→车辙、shoving→推挤、transverse-crack→横向裂缝、fatigue-crack→疲劳裂缝、raveling→松散、pothole→坑槽、water-damage→水损害、skid→抗滑不足、noise→降噪要求）；修复 summary/sceneSummary 重复渲染，两行各司其职 | 面向用户的界面不应出现内部英文标签；重复行是明显视觉 bug |

#### 12. 对话面板禁用无说明（LOW）
| Severity | Location | Before | After | Why |
| --- | --- | --- | --- | --- |
| LOW | `ChatPanel.vue` 发送按钮 disabled（LLM 未配置时） | 无解释 | disabled 时 tooltip/提示「配置 DEEPSEEK_API_KEY 后可用」 | 用户不知道为何点不动——错误/受限状态要说原因与下一步 |

---

## Verification

- 走查状态：推荐工作台空态 ✓、结果态（案例回填+生成）✓、典型案例页 ✓、知识库页 ✓；1440×900。
- 实测证据：cases 页每卡摘要行重复（DOM 9_9/9_10 相同文本）；结果态预测列表为英文键名；权重 0.2697 未格式化；console 0 error/warn。
- 未验证项：窄视口（<768px 栅格已存在但未走查）、真实 hover/active 手感（需修复后浏览器复核）、动效（现无动效可查）。

## Verdict

**Needs changes**（MEDIUM×6、LOW×6；无 HIGH）。建议由 builder-frontend 单轮修复：11、5、4 优先，其余合并一轮，修复后浏览器截图复核。
