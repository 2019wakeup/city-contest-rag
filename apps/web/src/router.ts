import { createRouter, createWebHistory } from 'vue-router'

// 三视图路由；视图组件按需加载。占位视图将在 T12/T13 填充真实内容。
export const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', redirect: '/recommend' },
    {
      path: '/recommend',
      name: 'recommend',
      component: () => import('./views/RecommendView.vue'),
    },
    {
      path: '/cases',
      name: 'cases',
      component: () => import('./views/CasesView.vue'),
    },
    {
      path: '/knowledge',
      name: 'knowledge',
      component: () => import('./views/KnowledgeView.vue'),
    },
  ],
})
