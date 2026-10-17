# Vue 前端 Skill 与最佳实践调研（2026-10）

> 项目是 Vue。本调研聚焦：可在 DSH（本机 0.2.0-rc.2）使用的 Vue 技能 + 社区/产业最认可的最佳实践。
> 结论日期 2026-10-15，以当日 GitHub API / npm 数据为准。

---

## 0. 一分钟结论

| 目标 | 首选 | 说明 |
|---|---|---|
| Vue 3 开发技能 | **`vuejs-ai/skills`**（8 个技能） | 社区主力（原 serkodev/vue-skills 已并入），`npx skills add vuejs-ai/skills`，SKILL.md 原生兼容 DSH |
| Nuxt 项目技能 | **`nuxt-skill-hub`**（npm 0.1.1） | 「Teach your AI agent the Nuxt way」 |
| 设计/UI 质量（框架无关） | **Vercel `web-design-guidelines`**（100+ 条）+ `building-components` | Vercel 官方，覆盖 a11y/性能/UX，Vue 同样适用 |
| DSH 内可视化审查 | **`dsh-web-review`**（npm 1.0.3） | DSH 插件：页面预览 + 元素标注 + 视觉调整 + 源码联动 |
| 最佳实践「圣经」 | **Vue 官方 Style Guide**（vuejs.org/style-guide）+ `eslint-plugin-vue` | 权威规范 + 自动 lint 强制 |

---

## 1. Vue 技能清单（可装进 DSH）

### 1.1 `vuejs-ai/skills`（社区主力，⭐ 首选）

- 仓库：[vuejs-ai/skills](https://github.com/vuejs-ai/skills)（org「Vue AI」，标注 *(Unofficial) Building AI tools for Vue*；原 [serkodev/vue-skills](https://github.com/serkodev/vue-skills) 已迁移并入）。
- 安装：`npx skills add vuejs-ai/skills`（或 Claude Code 市场 `/plugin install vue-best-practices@vue-skills`）。
- **8 个技能**：

| 技能 | 用途 |
|---|---|
| `vue-best-practices` | Vue 3 + Composition API + `<script setup lang="ts">`，SSR/Volar/vue-tsc 指引，性能 |
| `vue-options-api-best-practices` | Options API（`data()`/`methods`）、`this` 上下文、生命周期 |
| `vue-router-best-practices` | Vue Router 4：导航守卫、路由参数、路由组件生命周期 |
| `vue-pinia-best-practices` | Pinia 状态管理：store 结构、响应式、状态模式 |
| `vue-testing-best-practices` | Vitest + Vue Test Utils + Playwright（组件/E2E 测试） |
| `vue-jsx-best-practices` | Vue 里写 JSX（与 React JSX 的差异） |
| `vue-debug-guides` | 运行时错误、警告、异步错误处理、hydration 问题 |
| `create-adaptable-composable` | 写可复用 composable（`MaybeRef`/`MaybeRefOrGetter` 输入模式） |

- **SKILL.md 兼容 DSH**：frontmatter 为 `name` + `description`（另带 `license`/`metadata`，DSH 忽略多余键，直接加载）。每个技能带 `references/`（reactivity.md、sfc.md、component-data-flow.md、composables.md 等）。
- 作者方法论：每条规则都用 **eval 对比**（无技能 Fail → 有技能 Pass 才保留），质量有基准。

### 1.2 其他 Vue 技能

| 仓库/包 | 形态 | 说明 |
|---|---|---|
| [Pythoughts-labs/vue3-best-practices](https://github.com/Pythoughts-labs/vue3-best-practices) | GitHub（未发 npm） | 8 个技能，与 vuejs-ai 高度同源，`vue-ai-apps` 替换 `create-adaptable-composable` |
| `nuxt-skill-hub` | npm 0.1.1 | Nuxt 最佳实践 + 模块指引 |
| [sonvee/ai-skills](https://github.com/NeverSight/skills_feed)/… | GitHub | 零散 Vue 单技能（skills 生态聚合站） |
| [mindrally/vuejs-typescript-best-practices](https://skillsmp.com/creators/mindrally/skills/vuejs-typescript-best-practices) | skillsmp | Vue + TypeScript 最佳实践（单技能） |

### 1.3 DSH 专用 / 可直装

| 包 | 版本 | 兼容 0.2.0-rc.2 | 说明 |
|---|---|---|---|
| `dsh-web-review` | 1.0.3 | ✅ | DSH 插件：页面预览、元素标注、视觉调整、AI 改源码 |
| `@hilariouhiss/dsh-taste-skill` | 1.0.0 | ⚠️ peer `^0.1.5-rc.2` | 13 个「anti-slop」设计技能（品味/图片方向/图生码/品牌 kit），**版本闸会拦**，需豁免或等作者升级 |

---

## 2. DSH 安装方法（Vue 技能）

`vuejs-ai/skills` 是 GitHub-only 的 SKILL.md 集合（非 npm bundle），装进 DSH 走「技能根」路线：

```bash
# 1) 拉取（GitHub 已通；raw 大文件可能慢，用 codeload 更稳）
curl -L https://codeload.github.com/vuejs-ai/skills/tar.gz/refs/heads/main | tar -xz

# 2) 拷进技能根（rank 400 全局，或项目 .dsh/skills rank 100）
mkdir -p /bigdisk/lhg/dsh/home/skills
cp -R vuejs-ai-skills-main/skills/* /bigdisk/lhg/dsh/home/skills/
# 每个技能目录 = <name>/SKILL.md + references/，顶层平铺，frontmatter name+description 齐全即可被热加载

# 3) DSH 直装插件（npm 形态）
DSH_BIN=/bigdisk/lhg/dsh/app/node_modules/.bin/dsh
"$DSH_BIN" plugin --profile web add dsh-web-review          # 可视化审查
"$DSH_BIN" plugin --profile web add nuxt-skill-hub          # Nuxt（若项目用 Nuxt）
```

> 提示：`npx skills add vuejs-ai/skills` 装的是 Claude Code 的 `~/.claude/skills`；DSH 用上面的「拷贝到 `$DSH_HOME/skills/`」等价路线。

---

## 3. 框架无关的设计/UI 技能（Vue 也适用，产业认可）

Vercel 官方 Agent Skills 目录（`npx skills add <repo>`，[文档](https://vercel.com/docs/agent-resources/skills)）：

| 技能 | 内容 |
|---|---|
| `web-design-guidelines` | **Web Interface Guidelines**，100+ 条：可访问性、性能、UX |
| `building-components` | 组件开发：可访问性、可组合 API、主题化 |
| `agent-browser` | 浏览器自动化 CLI（导航/填表/截图/抽取） |
| `before-and-after` | 网页前后截图对比 |

Anthropic 官方：[anthropics/skills](https://github.com/anthropics/skills) 的 `frontend-design`（主动维护，前端设计质量）。

> 这些都是 SKILL.md 形态，同样可落到 DSH 技能根。

---

## 4. Vue 最佳实践核心（社区/产业共识）

### 4.1 权威规范

- **Vue 官方 Style Guide**（[vuejs.org/style-guide](https://vuejs.org/style-guide/)）：A（必要）/B（强烈推荐）/C（推荐）/D（谨慎使用）四级规则。核心：组合式 API 优先、`<script setup>`、Props 单向数据流、命名规范、避免在模板里写复杂表达式等。
- **`eslint-plugin-vue`**（官方）：把 style guide 落成可自动 lint 的规则（`plugin:vue/vue3-recommended`）。
- **[vuejs/awesome-vue](https://github.com/vuejs/awesome-vue)**：官方精选生态索引。

### 4.2 2026 生态共识栈

| 层 | 首选 | 备注 |
|---|---|---|
| 框架 | Vue 3.5+ / Nuxt 3 | 组合式 API + `<script setup>` |
| 语言 | TypeScript | `vue-tsc` 类型检查 |
| 构建 | Vite | 原生 ESM，`@vitejs/plugin-vue` |
| 状态 | Pinia | 官方推荐 |
| 路由 | Vue Router 4 | 导航守卫、懒加载 |
| 组合式函数 | VueUse | 官方生态标准库 |
| 组件/样式 | Tailwind CSS + `@nuxt/ui` / shadcn-vue | 现代 UI 首选 |
| 测试 | Vitest + Vue Test Utils + Playwright | 组件单测 + E2E |
| 可访问性 | WCAG 2.2 + web-design-guidelines | 100+ 条规则 |

### 4.3 高频「最佳实践」要点（来自 vue-best-practices + 官方 style guide）

- **状态可预测**：单一数据源，其余靠 `computed` 派生；`shallowRef` 用于原始响应式数据。
- **数据流显式**：Props down / Events up；大项目再考虑 provide/inject 或 Pinia。
- **组件小而聚焦**：易测试、复用、维护。
- **组合式函数输入**：用 `MaybeRef` / `MaybeRefOrGetter` 让 composable 既接 ref 又接 getter（VueUse 范式）。
- **避免不必要重渲染**：合理用 `computed` 和 `watch`。

---

## 5. 推荐组合（本机 Vue 项目，一条龙）

```bash
DSH_BIN=/bigdisk/lhg/dsh/app/node_modules/.bin/dsh

# 1) Vue 技能：克隆并落技能根
curl -L https://codeload.github.com/vuejs-ai/skills/tar.gz/refs/heads/main | tar -xz
mkdir -p /bigdisk/lhg/dsh/home/skills
cp -R vuejs-ai-skills-main/skills/* /bigdisk/lhg/dsh/home/skills/

# 2) DSH 可视化审查插件（页面预览/标注/视觉调整，配合上一轮装好的 chrome-devtools 浏览器）
"$DSH_BIN" plugin --profile web add dsh-web-review

# 3) 代码规范自动强制（进项目）
npm i -D eslint eslint-plugin-vue @vue/eslint-config-typescript
```

装完后对新会话说：`use vue skill, <需求>` 触发技能（作者建议加 `use vue skill` 前缀以稳定命中）。

---

## 6. 附：关键来源

- [vuejs-ai/skills](https://github.com/vuejs-ai/skills)（Vue 3 技能，8 个）
- [serkodev/vue-skills](https://github.com/serkodev/vue-skills)（已并入 vuejs-ai）
- [Pythoughts-labs/vue3-best-practices](https://github.com/Pythoughts-labs/vue3-best-practices)
- [Vercel Agent Skills](https://vercel.com/docs/agent-resources/skills)（web-design-guidelines / building-components / agent-browser）
- [anthropics/skills](https://github.com/anthropics/skills)（frontend-design）
- [Vue 官方 Style Guide](https://vuejs.org/style-guide/) · [awesome-vue](https://github.com/vuejs/awesome-vue) · [eslint-plugin-vue](https://eslint.vuejs.org/)
- npm：`nuxt-skill-hub`、`dsh-web-review`、`@hilariouhiss/dsh-taste-skill`
