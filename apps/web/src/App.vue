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
      <div class="app-logo">数智选材</div>
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

.app-logo {
  padding: 16px;
  font-size: 18px;
  font-weight: 600;
  color: var(--el-color-primary);
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
