# DSH Superpowers 与前后端联调工具调研（Ubuntu · 2026-10）

> 本机实测环境：DSH **0.2.0-rc.2**，活动 profile = **`web`**（GUI 在 `127.0.0.1:19387`），
> `DSH_HOME=/bigdisk/lhg/dsh/home`，Ubuntu 20.04.4，node 24.21.0 / pnpm 12.11.2。
> 本次**已实测连通**：`github.com`、`registry.npmjs.org`、`registry.npmmirror.com` 全部 200。
> 结论日期 2026-10-14，npm 数据以当日 `npm view` 为准。

---

## 0. 一分钟结论

| 目标 | 首选 | 一句话 |
|---|---|---|
| 装 superpowers（工程技能） | **`superpowers-dsh`**（LayneChai） | 同步到上游 obra/superpowers v6.4.2、15 技能、零依赖、0.2.0-rc.2 实测通过 |
| 前后端联调（浏览器调试） | **官方实验包 `@deepseek-ai/dsh-experimental-browser-use-chrome-devtools-mcp@0.2.0-rc.2`**（或 playwright 版） | 官方 per-Session 浏览器工具，`headless:true` 适合无显示器的 Ubuntu，`attach` 模式正好对应 SSH 转发/CDP |
| 通用 MCP 接入（不用装插件） | 内置 `@deepseek-ai/dsh-mcp-client` | 一条 cordis.patch.yml `insert` 就能把 `chrome-devtools-mcp` / `@playwright/mcp` 接进来 |

关键更新（相对你那份《安装经验》文档）：**GitHub 现在通了**，所以：
1. `dsh plugin add github:LayneChai/superpowers-dsh` 这种 GitHub 直装路线现在可用；
2. 官方在 npm 上发了**实验性浏览器包**，`next` 标签就是 `0.2.0-rc.2`，与本机版本严格对齐；
3. `chrome-devtools-mcp`（Google）/ `@playwright/mcp`（Microsoft）经内置 MCP client 接入，无需自写适配。

---

## 1. Superpowers（DSH 可安装清单）

### 1.1 插件形态（装进 profile，推荐）

| 包 | 最新 | 技能 | 对 0.2.0-rc.2 | 备注 |
|---|---|---|---|---|
| **`superpowers-dsh`** ⭐ | 0.2.0 | 15 | ✅ **无 peer，闸门不拦截；实测通过** | 同步 obra/superpowers **v6.4.2**（含新增 `diagnosing-superpowers`）；零运行时依赖；dshbase CI「已验证」；105+ stars |
| `@wenaixi/dsh-superpower` | 7.7.2 | 15 | ✅ peer 全满足 | 中英双语描述、逐技能开关、设置页；你文档里的主推 |
| `@jasonfreelab/dsh-superpowers` | 0.3.1 | 15 | ✅ `dsh-skill ^0.2.0-rc.2` 精确匹配 | GitHub Actions 发布 |
| `@blugart-dev/dsh-superpowers` | 1.0.1 | 15 同款 | ✅ `>=0.2.0-rc.2` | 与上面重复，无增益 |
| `@zfdx123/dsh-superpowers` | 1.0.13 | 15 | ❌ 需 `^0.2.1-alpha.2` | 要版本豁免 |
| `@firefly0621/dsh-superpowers` | 0.1.0-rc.35 | 15 | ❌ 钉死 `0.2.1-alpha.2` | 要版本豁免 |

**推荐顺序**：
1. 想跟上游最新（v6.4.2）+ 最省事 → `superpowers-dsh`；
2. 想要中文描述/开关/设置页 → `@wenaixi/dsh-superpower`；
3. 二者别同时装同名技能（rank 冲突，后装者被遮蔽或白装）。

**安装命令**（本机 `dsh` 不在 PATH，用应用内置 CLI）：

```bash
DSH_BIN=/bigdisk/lhg/dsh/app/node_modules/.bin/dsh

# 路线 1：npm 直装（GitHub/npm 都已通）
"$DSH_BIN" plugin --profile web add superpowers-dsh
# 路线 2：GitHub 直装（现在通了）
"$DSH_BIN" plugin --profile web add github:LayneChai/superpowers-dsh
# 或加镜像源（国内快）
"$DSH_BIN" plugin --profile web add superpowers-dsh --registry=https://registry.npmmirror.com/
```

> ⚠️ 本机 profile 在 `/bigdisk/lhg/dsh/home/profiles/web`，位于会话沙箱工作区之外，
> 需要用户点 GUI「插件 → 添加插件」，或对命令做 `danger-full-access` 提权（见你文档 §6）。

### 1.2 技能根形态（原生 `SKILL.md`，零适配）

DSH 文件系统技能提供方按 rank 扫描（数字小者胜）：`<项目根>/.dsh/skills`(100) → `<项目根>/.agents/skills`(200) → `customSkillDirs`(300) → `$DSH_HOME/skills`(400) → `<agentsHome>/skills`(500) → bundled(600)。

- **上游 obra/superpowers**：原样 14 个 `skills/<name>/SKILL.md` 可直接放进 `$DSH_HOME/skills/`（frontmatter 恰好是 `name`+`description`）。
- **`superpowers-zh` 1.7.14**：21 个（15 汉化 + 4 中国原创 + `mcp-builder`/`workflow-runner`），tarball 解包拷贝。
- **`microsoft/playwright-cli`**：自带 `skills/playwright-cli/SKILL.md`，CLI 驱动的浏览器自动化技能，可同样落到技能根（需本机装 `playwright-cli`）。

GitHub 通之后，可免走 npmmirror tarball，直接：

```bash
curl -L https://codeload.github.com/obra/superpowers/tar.gz/refs/tags/v6.4.2 | tar -xz
# 把 skills/* 拷到 $DSH_HOME/skills/（rank 400）或项目 .dsh/skills/（rank 100）
```

### 1.3 市场 / 目录类（发现与一键安装）

| 包 | 最新 | 兼容性 | 说明 |
|---|---|---|---|
| `dshmarket` | 1.66.21 | ✅ `dsh-settings ^0.2.0-rc.1` 等 | DSH 内可视化插件市场（[dshmarket.com](https://dshmarket.com)） |
| `dshbase-catalog` | — | — | 目录插件，装后对 agent 说「帮我装 xx」即可自动找+装 |
| `dsh-armory` | 1.9.3 | ❌ peer `>=0.1.5-rc.1 <0.2.0` | 一体化看板（MCP+技能+市场），但**被 0.2.0-rc.2 版本闸拦**，等作者升版 |

---

## 2. 前后端联调：浏览器调试 skill/工具

### 2.0 先理解 SSH 转发需求（远程 Ubuntu / 无显示器）

三条路线，对应三种「看浏览器」方式：

1. **纯 headless（最简单，无需转端口）**：Chrome 无头跑在服务器上，截图作为图片直接进 DSH 会话（DSH 的 attachment 通道）。你只需 SSH 转发 DSH web UI 端口看对话。
2. **CDP attach + SSH 转发 9222（要看真实浏览器/复用登录态）**：服务器起 `google-chrome --remote-debugging-port=9222`，`ssh -L 9222:127.0.0.1:9222 user@host`，让 MCP/插件 `attach` 到这个端口；本地 Chrome DevTools 也能连 9222 实时看。
3. **X11/VNC 转发**：`ssh -X` 或 VNC 起 headed Chrome（重、慢，一般不必）。

### 2.1 官方实验性浏览器包（**首选，版本严格对齐**）

DeepSeek 官方在 npm 发布了 per-Session 浏览器工具（实验性），`next` 标签 = `0.2.0-rc.2`，peer 全部钉在本机版本：

| 包 @0.2.0-rc.2 | 底层 | deps |
|---|---|---|
| `@deepseek-ai/dsh-browser-use` | 独占 provider 注册（基座） | — |
| `@deepseek-ai/dsh-experimental-browser-use-chrome-devtools-mcp` | `chrome-devtools-mcp@1.9.0` | 官方 |
| `@deepseek-ai/dsh-experimental-browser-use-playwright-mcp` | `@playwright/mcp@0.0.80` | 官方 |
| `@deepseek-ai/dsh-experimental-browser-use-stagehand-native` | Stagehand 原生 | 需另配 native 模型 |

**安装 + 配置**（以 Chrome DevTools 版为例）：

```bash
DSH_BIN=/bigdisk/lhg/dsh/app/node_modules/.bin/dsh
"$DSH_BIN" plugin --profile web add @deepseek-ai/dsh-browser-use@0.2.0-rc.2
"$DSH_BIN" plugin --profile web add @deepseek-ai/dsh-experimental-browser-use-chrome-devtools-mcp@0.2.0-rc.2
```

然后在 profile 的 `cordis.patch.yml` 加配置（无显示器服务器用 `headless: true`；SSH 转发复用登录态用 `mode: attach`）：

```yaml
# 无显示器服务器：headless
- id: browser-use-chrome-devtools
  name: '@deepseek-ai/dsh-experimental-browser-use-chrome-devtools-mcp'
  config:
    mode: launch
    headless: true

# 或：attach 到自己起的 Chrome（CDP 9222，可 SSH 转发）
# google-chrome --remote-debugging-port=9222 --user-data-dir="$HOME/.dsh-chrome"
# - id: browser-use-chrome-devtools
#   name: '@deepseek-ai/dsh-experimental-browser-use-chrome-devtools-mcp'
#   config:
#     mode: attach
#     endpoint: http://127.0.0.1:9222
```

配置项：`mode`(`launch`/`attach`)、`headless`(bool)、`executablePath`(Chrome 路径)、`endpoint`(attach 时的 CDP 地址)、`toolCallTimeoutMs`。

> Ubuntu 排错（官方 README 原话）：
> - `No usable sandbox!`：容器/WSL/Ubuntu23.10+ AppArmor 常见。需 root 修 `chrome-sandbox` 权限，或 `executablePath` 指向 `--no-sandbox` 包装脚本。
> - `Missing X server`：设 `headless: true`。
> - 截图变文本：模型路由需支持图片输入 + profile 有 attachment store（本机已具备）。

### 2.2 社区 DSH 插件（封装上面能力 / 直接可用）

| 插件 | 形态 | 能力 | 安装 |
|---|---|---|---|
| **`DevTarlow/dsh-chrome-devtools`** | GitHub bundle | 封装官方 chrome-devtools-mcp，真实 Chrome 窗口，`launch`/`attach`/`headless` 全支持 | `github:DevTarlow/dsh-chrome-devtools` |
| **`kyo615/dsh-browser-control`** | GitHub | 基于 Playwright MCP，约 **80 个 `browser_*` 工具**，GUI 内嵌实时截图面板 | `github:kyo615/dsh-browser-control` |
| `dsh-browser-control`（PangYiMing） | npm 0.1.0 | CDP 驱动，6 个 `browser_*` 工具，**复用日常 Chrome 登录态** | `dsh plugin add dsh-browser-control` |

### 2.3 内置 MCP client（**通用通道，不用装插件**）

本机已捆绑 `@deepseek-ai/dsh-mcp-client@0.2.0-rc.2`（`/bigdisk/lhg/dsh/app/node_modules/@deepseek-ai/dsh-mcp-client`）。
工具命名 `mcp__<serverName>__<tool>`。支持 `stdio`（本地子进程）与 `streamable-http`（远程服务）。

直接在 profile 的 `cordis.patch.yml` 加 `insert`：

```yaml
# Google 官方 chrome-devtools-mcp（本地跑，headless 起 Chrome）
- insert:
    - id: mcp-chrome
      name: '@deepseek-ai/dsh-mcp-client'
      config:
        serverName: chrome
        transport: stdio
        command: npx
        args: ['-y', 'chrome-devtools-mcp@1.10.1', '--headless', '--no-usage-statistics']

# 微软官方 @playwright/mcp（本地跑）
- insert:
    - id: mcp-playwright
      name: '@deepseek-ai/dsh-mcp-client'
      config:
        serverName: playwright
        transport: stdio
        command: npx
        args: ['-y', '@playwright/mcp@0.0.83']

# 接一个远程 CDP/已有 Chrome（streamable-http 或直连 CDP 端点）
# - insert:
#     - id: mcp-chrome-attach
#       name: '@deepseek-ai/dsh-mcp-client'
#       config:
#         serverName: chrome
#         transport: streamable-http
#         url: http://127.0.0.1:9222/json/version   # 或你的 MCP HTTP 端点
```

`chrome-devtools-mcp` 关键 flag：`--headless`（无头）、`--slim`（轻量工具集）、`--no-usage-statistics`（关统计）、`--browserUrl=<CDP ws>` / attach 已有实例、`--proxy-server`。`@playwright/mcp` 也支持 `--browser`、`--cdp-endpoint`、`--headless`。

### 2.4 方法论 / 技能（skill）

- **superpowers `systematic-debugging`**：先找根因的调试纪律，前后端问题都适用（装 superpowers 即得）。
- **superpowers `verification-before-completion`**：改完先拿证据，配合浏览器工具验证联调结果。
- **`microsoft/playwright-cli` 的 `SKILL.md`**：CLI 驱动（`playwright-cli open/goto/click/...`），token 更省；落到技能根即可当 DSH 技能用（需本机 `npm i -g playwright-cli`，其 `SKILL.md` 的 `allowed-tools` 是 Claude 特有字段，DSH 会忽略但不影响正文）。

---

## 3. 推荐组合（本机 Ubuntu，一条龙）

**目标：让 agent 能起前后端 + 用浏览器联调验证**

```bash
DSH_BIN=/bigdisk/lhg/dsh/app/node_modules/.bin/dsh

# 1) 工程技能（调试纪律 + TDD + 计划）
"$DSH_BIN" plugin --profile web add superpowers-dsh

# 2) 浏览器调试：官方实验包（Chrome DevTools 版，headless）
"$DSH_BIN" plugin --profile web add @deepseek-ai/dsh-browser-use@0.2.0-rc.2
"$DSH_BIN" plugin --profile web add @deepseek-ai/dsh-experimental-browser-use-chrome-devtools-mcp@0.2.0-rc.2
```

再往 `cordis.patch.yml` 写入 §2.1 的 `headless: true` 配置（或 §2.3 的 MCP insert），重启 profile 后对新会话说：

> 「起后端和前端 dev server，用浏览器打开 http://localhost:3000，把 console 报错和 network 失败发我，再截个图。」

SSH 侧：`ssh -L 19387:127.0.0.1:19387 user@host` 看 DSH GUI；若要实时看真实浏览器，再 `ssh -L 9222:127.0.0.1:9222` 并用 `mode: attach`。

---

## 4. 附：本机关键路径与版本速查

- DSH CLI：`/bigdisk/lhg/dsh/app/node_modules/.bin/dsh`（`--version` → 0.2.0-rc.2）
- 活动 profile：`web`（`/bigdisk/lhg/dsh/home/profiles/web/`），已装 `dsh-better-sidebar`
- 内置 MCP client：`@deepseek-ai/dsh-mcp-client@0.2.0-rc.2`（已捆绑，无需装）
- 官方实验浏览器包 `next` 标签 = `0.2.0-rc.2`，peer 与本机严格对齐 ✅
- 上游 obra/superpowers 当前 tag：`v6.4.2`

**关键来源**：
- [LayneChai/superpowers-dsh](https://github.com/LayneChai/superpowers-dsh) · npm `superpowers-dsh`
- [deepseek-ai/deepseek-harness](https://github.com/deepseek-ai/deepseek-harness)（官方实验浏览器包、`@deepseek-ai/dsh-mcp-client`）
- [ChromeDevTools/chrome-devtools-mcp](https://github.com/ChromeDevTools/chrome-devtools-mcp)（npm `chrome-devtools-mcp`）
- [microsoft/playwright-mcp](https://github.com/microsoft/playwright-mcp)（npm `@playwright/mcp`）
- [DevTarlow/dsh-chrome-devtools](https://github.com/DevTarlow/dsh-chrome-devtools) · [kyo615/dsh-browser-control](https://github.com/kyo615/dsh-browser-control)
- 目录/市场：[dshbase.com](https://dshbase.com) · [dshmarket.com](https://dshmarket.com)
- 官方 MCP 指南：[Memory MCP](https://deepseek-harness.github.io/deepseek-harness/en/guide/mcp-memory)（含 `dsh-mcp-client` insert 写法）

---

## 5. 实测安装结果（本机已执行，2026-10-15）

### 已安装（web profile `/bigdisk/lhg/dsh/home/profiles/web/`）

| 包 | 版本 | 状态 |
|---|---|---|
| `superpowers-dsh` | 0.2.0 | ✅ 已装，进入 `dsh.profile.bundles`，15 技能已注册到会话技能目录 |
| `@deepseek-ai/dsh-browser-use` | 0.2.0-rc.2 | ✅ 已装（plain dependency，无 bundle，作 peer 基座） |
| `@deepseek-ai/dsh-experimental-browser-use-chrome-devtools-mcp` | 0.2.0-rc.2 | ✅ 已装，经 `cordis.patch.yml` 的 `insert` 挂载 |
| Chrome for Testing | 155.0.8059.79 | ✅ `/opt/chrome-for-testing/chrome-linux64/chrome` |

### 实测踩坑与处置

1. **npmjs 大包下载卡死**：`dsh plugin add ...chrome-devtools-mcp`（含 puppeteer）从 `registry.npmjs.org` 下载 6 分钟 0 字节卡死；`dl.google.com` 下 Chrome `.deb` 同样超时。→ 全部改走 **npmmirror**：插件 `--registry=https://registry.npmmirror.com/` 2.8s 装完；Chrome 走 `registry.npmmirror.com/-/binary/chrome-for-testing/...` 约 1 分钟下完 198MB。
2. **root 跑 Chrome 需要 `--no-sandbox`**：`Running as root without --no-sandbox is not supported`。→ 建包装脚本 `/opt/chrome-for-testing/chrome-no-sandbox`（`exec ... --no-sandbox "$@"`），并写入 `executablePath`。（bundled puppeteer 仅在 `PUPPETEER_DANGEROUS_NO_SANDBOX=true` 时才会自动加 `--no-sandbox`，DSH 该包配置不暴露 env，故用 wrapper 更省事。）
3. **`dsh-experimental-browser-use-*` 不是 bundle**：`dsh plugin add` 提示 "declares no dsh.bundle — installed as a plain dependency"。→ 必须手动在 `cordis.patch.yml` 用 `insert` 挂载两个插件（见 §2.1）。

### 实测验证证据

- `dsh --profile web --dump-config` → exit 0，`superpowers-dsh` / `browser-use` / `browser-use-chrome-devtools`（含 `executablePath`、`headless: true`）全部组合正确。
- superpowers 15 技能已出现在本会话 `available_skills` 目录（`using-superpowers`/`systematic-debugging`/`test-driven-development`/…）。
- 浏览器栈端到端实测（chrome-devtools-mcp CLI，脱离 DSH 独立跑）：headless 启动 Chrome → `navigate_page` 打开测试页 → `take_screenshot` 产出 1905×2053 PNG。证明 Chrome + `--no-sandbox` wrapper + CDP 驱动 + 截图整条链路可用。
- 运行中 DSH 进程（PID 540758）已确认带 HMR inotify 监听 profile 配置；`cordis.patch.yml` 改动会热重载。

### 还差一步（浏览器 provider 的 Session 语义）

官方浏览器 provider **只认"挂载后新建/恢复的 Session"**（"Loading or reloading this provider does not adopt Sessions that are already active"）。所以：**在 GUI 里开一个新对话**，浏览器工具即以 `mcp__chrome-devtools-mcp__<tool>` 出现并可调用；当前这个已存在的会话不会自动获得浏览器工具。若开新对话后仍看不到，重启一次 web profile 即可。
