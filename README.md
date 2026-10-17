# 数智选材 · 沥青材料智能推荐系统

> 第十二届中国研究生智慧城市技术与创意设计大赛 · 企业揭榜赛道 · 课题一
> **AI 驱动的道路养护决策与沥青材料方案智能推荐系统**
>
> 设计规格：[docs/superpowers/specs/2026-10-16-city-contest-rag-system-design.md](docs/superpowers/specs/2026-10-16-city-contest-rag-system-design.md)
> 实施计划：[docs/superpowers/plans/2026-10-16-city-contest-rag-system.md](docs/superpowers/plans/2026-10-16-city-contest-rag-system.md)
> 技术交接：[docs/DELIVERY.md](docs/DELIVERY.md) ｜ 演示脚本：[docs/demo-script.md](docs/demo-script.md)

## 一句话简介

输入养护场景（气候分区 / 交通荷载 / 病害 / 约束）→ 系统输出目标性能与优先级 → Top-5 沥青材料候选方案 → 8 维雷达图与规范基线对比 → 可溯源推荐报告与证据链。**量化依据全部确定性计算，LLM 只负责文案与解释。**

## 架构

```
apps/web      Vue3 + Vite + Element Plus + ECharts + Pinia（三视图：推荐工作台/典型案例/知识库管理）
apps/server   Hono + zod-openapi（六步推荐 pipeline + 对话 SSE + 知识库路由）
packages/contracts   zod 契约 + 字段注册表（前后端与队友模块 A/C 共用）
packages/retrieval   VectorStore 接口 + LanceDB 实现 + SQLite(FTS5+精确KNN) 降级实现
packages/embedding   transformers.js 本地 embedding（bge-m3 默认 / multilingual-e5-small 备选）
data/corpus    语料真相源（知识条目 42 / 规范条文 57 / 文献题录 142 / 案例 5，全部标注来源）
scripts        build-index（幂等入库）/ golden-eval（金标准回归）/ e2e
```

## 快速开始（本机演示）

```bash
# 1. 安装依赖
pnpm install

# 2. 构建索引（约 13 秒；模型走 HF 镜像，仅首次需联网）
HF_ENDPOINT=https://hf-mirror.com \
EMBEDDING_MODEL=multilingual-e5-small \
pnpm build:index --rebuild --backend=lancedb --model=multilingual-e5-small

# 3. 启动（后端 3010 + 前端 5174）
# 终端 A：后端
PORT=3010 EMBEDDING_MODEL=multilingual-e5-small HF_ENDPOINT=https://hf-mirror.com \
  pnpm -C apps/server run dev

# 终端 B：前端（proxy → 后端）
API_PROXY_TARGET=http://localhost:3010 \
  pnpm -C apps/web run dev -- --port 5174 --strictPort

# 打开 http://localhost:5174
```

> ⚠️ 本机 3000 / 5173 端口分别被 grafana / docker 占用；换机器演示时按 `.env.example` 用默认 3000 / 5173 亦可。
> ⚠️ 若 HuggingFace 模型不可下载（网络受限），系统自动降级**纯 BM25 检索**，主流程不受影响。

### 配置（.env 或环境变量，参考 .env.example）

| 变量 | 说明 |
|---|---|
| `DEEPSEEK_API_KEY` / `DEEPSEEK_BASE_URL` | LLM（OpenAI 兼容）。**未配置时报告自动降级为模板文案**，确定性数据不受影响 |
| `EMBEDDING_MODEL` | `bge-m3`（默认，1024 维）\| `multilingual-e5-small`（384 维，本机已缓存）。**换模型必须重建索引**（provenance 强制） |
| `RETRIEVAL_BACKEND` | `lancedb`（默认）\| `sqlite`（FTS5+精确KNN 降级） |
| `MODULE_A_ENDPOINT` / `MODULE_C_ENDPOINT` | 队友模块 A（场景→性能映射）/ C（性能预测）真实服务地址；**留空 = 内置确定性 mock**（UI 显示"模拟数据"角标） |
| `PORT` | 后端端口，默认 3000 |

## 测试与验收

```bash
pnpm test                # 全仓单测（contracts/retrieval/embedding/server/web/scripts）
pnpm build:index         # 重建索引
tsx scripts/golden-eval.ts lancedb   # 金标准 20 条 recall@5（双后端 20/20）
pnpm e2e                 # 5 案例端到端 + 三档降级路径
tsx scripts/anonymity-audit.ts       # 匿名合规审计（git 身份/密钥/文件名）
```

## 目录速查

- 接口文档：后端启动后 `http://localhost:3010/openapi`
- 评审记录：`docs/reviews/`（R1–R4 已通过，R5 见文件）
- 语料统计：`tsx scripts/validate-corpus.ts`
