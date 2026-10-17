# T14 端到端验收报告（e2e-report）

> 日期：2026-10-17 凌晨（PDT 10-16 深夜）　｜　执行者：Lead
> 环境：Node 24.21 · server PORT=3010（3000 被本机 grafana 占用，R4 预案）· Vite 5174（5173 被 docker 占用）· `EMBEDDING_MODEL=multilingual-e5-small`（R22 裁决）· lancedb 241 chunk · LLM_OFF=1（无 key，模板降级路径）

## 1. 脚本验收

### 1.1 e2e-cases（`scripts/e2e-cases.ts`）

| 断言 | 结果 |
|---|---|
| 5 案例 HTTP 200 | ✓ 5/5 |
| candidates=5 / evidence 非空 / radar 8 维 0-100 | ✓ 5/5 |
| steps 六步序列（parse/mapping/recall/predict/rank/report） | ✓ 5/5 |
| adapterMode mock + 两遍确定性（剔除 steps 耗时后全等） | ✓ 5/5 |
| top-1 配方签名 ≥3 种（场景敏感，R3-C1 回归） | ✓ 3/5 种 |

```
✓ case-01 top1=SBS改性沥青+高模量剂      evidence=11
✓ case-02 top1=环氧沥青+SBS(OGFC高粘体系) evidence=5
✓ case-03 top1=SBS改性沥青+SBS(OGFC)     evidence=8
✓ case-04 top1=SBS改性沥青+高模量剂      evidence=7
✓ case-05 top1=SBS改性沥青+SBS(OGFC)     evidence=11
e2e-cases 全绿 5/5（top-1 差异化 3/5）
```

### 1.2 e2e-degradation（`scripts/e2e-degradation.ts`，自起 3100 降级实例）

- LLM_OFF=1 → `llmStatus:'degraded'` + sections 模板文案非空 ✓
- A/C 端点指向不可达端口 → `adapterMode:{a:'mock',c:'mock'}`，主流程不崩 ✓
- 空向量库（sqlite 未建索引）→ 200 + `warnings:["知识库为空…"]` 明确标注 ✓

## 2. 浏览器走查（chrome-devtools-mcp，三视图 + 检索）

| 视图 | 验证点 | 结果 |
|---|---|---|
| /recommend | 表单 schema 驱动渲染；案例一键填入（中文 label）；生成推荐→六步步进条+目标性能+基准对比表+5 候选卡（模拟数据角标+置信区间+LCC/碳排/寿命）+证据链（归一化相关度+provenance 来源行）+模板降级提示+对话面板 | ✓（截图 01） |
| /cases | 5 案例卡片渲染 | ✓（截图 02） |
| /knowledge | 统计 241（knowledge42/standard57/literature142）+ 上传区（粘贴/PDF）+ 检索测试 + 重建按钮；检索"车辙 SBS"返回命中 | ✓（截图 03/04） |
| console | 全程 0 error / 0 warn | ✓ |

截图：`docs/reviews/screenshots/shot-0{1..4}-*.png`

## 3. 演示运维备忘（写入 T15 文档）

1. 端口：后端 3010（`PORT=3010`）、前端 5174（`--port 5174`）、Vite proxy `API_PROXY_TARGET=http://localhost:3010`（3000/5173 被本机 grafana/docker 占用）。
2. 模型：`EMBEDDING_MODEL=multilingual-e5-small`（已缓存 465M；bge-m3 因本机 huggingface.co 不可达暂不可用，R22）；换模型需 `pnpm build:index --rebuild`。
3. 索引：`pnpm build:index --rebuild --backend=lancedb --model=multilingual-e5-small`（13s，241 chunk）。
4. LLM：无 key 时自动模板降级，演示确定性部分完整；有 key 后填 `.env` 的 DEEPSEEK_API_KEY 即恢复 LLM 文案。
5. 三命令一键起（README 将按此写）：`pnpm install && pnpm build:index && pnpm dev`。

## 4. 遗留口径（已裁决）

- **R24**：case-02 低温场景 top-1 为环氧沥青（领域合理性存疑，R3 残差观察）。处理：演示脚本按 top-5 口径讲解，低温维度推荐重点提 SBS/橡胶方案（top-5 内）；mock C 的领域微调列为赛后项（真实 A/C 接入后自然消失）。
- **R25**：pavement.layer 回填显示英文 `surface`（registry 未含该 value）——已派 frontend 小修（label 对齐）。
