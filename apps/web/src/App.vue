<script setup lang="ts">
import { onMounted, shallowRef } from 'vue'
import { useRouter } from 'vue-router'

// 应用壳：品牌区 + 可折叠导航 + 主题切换 + 路由出口。保持薄壳（组合面）。
const router = useRouter()
const navItems = [
  { path: '/', label: '首页' },
  { path: '/recommend', label: '推荐工作台' },
  { path: '/cases', label: '典型案例' },
  { path: '/knowledge', label: '知识库管理' },
]

const collapsed = shallowRef(false)
const isDark = shallowRef(true)

function applyTheme(dark: boolean): void {
  isDark.value = dark
  document.documentElement.classList.toggle('dark', dark)
  localStorage.setItem('theme', dark ? 'dark' : 'light')
}

function toggleTheme(): void {
  applyTheme(!isDark.value)
}

function toggleCollapse(): void {
  collapsed.value = !collapsed.value
}

function goHome(): void {
  void router.push('/')
}

onMounted(() => {
  // 默认 dark；用户上次选择 light 则切亮色（index.html 已预置 class="dark" 防闪烁）。
  const saved = localStorage.getItem('theme')
  applyTheme(saved ? saved === 'dark' : true)
})
</script>

<template>
  <el-container class="app-shell">
    <el-aside :width="collapsed ? '64px' : '200px'" data-testid="app-aside" class="app-aside">
      <div class="app-brand" :class="{ 'app-brand-collapsed': collapsed }">
        <button
          type="button"
          data-testid="app-logo-mark"
          class="app-logo-mark"
          aria-label="回到首页"
          @click="goHome"
        >材</button>
        <div v-if="!collapsed" class="app-brand-text">
          <div class="app-logo">数智选材</div>
          <div class="app-subtitle">沥青材料智能推荐</div>
        </div>
      </div>

      <el-menu :default-active="$route.path" router :collapse="collapsed" class="app-menu">
        <el-menu-item v-for="item in navItems" :key="item.path" :index="item.path">
          <svg
            v-if="item.path === '/'"
            class="app-menu-icon"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <path d="M3 11l9-8 9 8" />
            <path d="M5 9.5V21h14V9.5" />
          </svg>
          <svg
            v-else-if="item.path === '/recommend'"
            class="app-menu-icon"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <rect x="3" y="3" width="7" height="7" rx="1" />
            <rect x="14" y="3" width="7" height="7" rx="1" />
            <rect x="3" y="14" width="7" height="7" rx="1" />
            <rect x="14" y="14" width="7" height="7" rx="1" />
          </svg>
          <svg
            v-else-if="item.path === '/cases'"
            class="app-menu-icon"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <path d="M4 5h16v14H4z" />
            <path d="M4 9h16" />
            <path d="M9 9v10" />
          </svg>
          <svg
            v-else
            class="app-menu-icon"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <ellipse cx="12" cy="5" rx="8" ry="3" />
            <path d="M4 5v14c0 1.66 3.58 3 8 3s8-1.34 8-3V5" />
            <path d="M4 12c0 1.66 3.58 3 8 3s8-1.34 8-3" />
          </svg>
          <template #title>{{ item.label }}</template>
        </el-menu-item>
      </el-menu>

      <div class="app-footer">
        <el-tooltip
          :content="collapsed ? '展开侧栏' : '收起侧栏'"
          placement="right"
          :disabled="!collapsed"
        >
          <button
            type="button"
            class="app-icon-btn"
            data-testid="collapse-toggle"
            :aria-label="collapsed ? '展开侧栏' : '收起侧栏'"
            @click="toggleCollapse"
          >
            <svg
              v-if="!collapsed"
              class="app-menu-icon"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <path d="M11 19l-7-7 7-7" />
              <path d="M18 19l-7-7 7-7" />
            </svg>
            <svg
              v-else
              class="app-menu-icon"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <path d="M13 19l7-7-7-7" />
              <path d="M6 19l7-7-7-7" />
            </svg>
          </button>
        </el-tooltip>

        <button
          type="button"
          class="app-icon-btn"
          data-testid="theme-toggle"
          :aria-label="isDark ? '切换到亮色模式' : '切换到暗色模式'"
          @click="toggleTheme"
        >
          <svg
            v-if="isDark"
            class="app-menu-icon"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <circle cx="12" cy="12" r="4" />
            <path
              d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"
            />
          </svg>
          <svg
            v-else
            class="app-menu-icon"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
          </svg>
        </button>

        <div v-if="!collapsed" class="app-version">数智选材 v0.2</div>
      </div>
    </el-aside>
    <el-main class="app-main">
      <router-view />
    </el-main>
  </el-container>
</template>

<style scoped>
.app-shell {
  height: 100vh;
}

.app-aside {
  display: flex;
  flex-direction: column;
  border-right: 1px solid var(--app-border);
  background: var(--app-panel-bg);
  transition: width 0.2s ease;
}

.app-brand {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
}

.app-brand-collapsed {
  justify-content: center;
  padding: 16px 8px;
}

.app-logo-mark {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  flex: none;
  border-radius: 8px;
  background: var(--el-color-primary);
  color: #fff;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.15s ease;
}

.app-logo-mark:active {
  transform: scale(0.94);
}

.app-logo {
  font-size: 16px;
  font-weight: 600;
  color: var(--el-color-primary);
  line-height: 1.3;
}

.app-subtitle {
  font-size: 12px;
  color: var(--el-text-color-secondary);
  line-height: 1.4;
}

.app-menu {
  flex: 1;
  border-right: none;
  background: transparent;
}

.app-menu-icon {
  width: 18px;
  height: 18px;
}

.app-footer {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 8px;
  border-top: 1px solid var(--app-border);
}

.app-icon-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  padding: 0;
  border: none;
  border-radius: 6px;
  background: transparent;
  color: var(--el-text-color-secondary);
  cursor: pointer;
  transition:
    background 0.15s ease,
    color 0.15s ease;
}

.app-icon-btn:hover {
  background: var(--el-fill-color-light);
  color: var(--el-text-color-primary);
}

.app-version {
  margin-left: auto;
  font-size: 12px;
  color: var(--el-text-color-placeholder);
}

.app-main {
  padding: 16px;
  background: var(--app-page-bg);
  overflow: auto;
}
</style>
