<script setup lang="ts">
// 应用壳：导航 + 路由出口。保持薄壳（组合面），业务全部在视图/组件内。
const navItems = [
  { path: '/recommend', label: '推荐工作台' },
  { path: '/cases', label: '典型案例' },
  { path: '/knowledge', label: '知识库管理' },
]
</script>

<template>
  <el-container class="app-shell">
    <el-aside width="200px" class="app-aside">
      <div class="app-brand">
        <span data-testid="app-logo-mark" class="app-logo-mark">材</span>
        <div class="app-brand-text">
          <div class="app-logo">数智选材</div>
          <div class="app-subtitle">沥青材料智能推荐</div>
        </div>
      </div>
      <el-menu :default-active="$route.path" router class="app-menu">
        <el-menu-item v-for="item in navItems" :key="item.path" :index="item.path">
          {{ item.label }}
        </el-menu-item>
      </el-menu>
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
  border-right: 1px solid var(--el-border-color-light);
}

.app-brand {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
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
  border-right: none;
}

.app-main {
  padding: 16px;
  background: var(--el-fill-color-lighter);
  overflow: auto;
}
</style>
