import { config } from '@vue/test-utils'
import ElementPlus from 'element-plus'
import zhCn from 'element-plus/es/locale/lang/zh-cn'

// 全局注册 Element Plus（与应用 main.ts 行为一致），测试内组件可直接使用 EP 组件。
config.global.plugins.push([ElementPlus, { locale: zhCn }])

// happy-dom 缺失的浏览器 API 兜底（Element Plus 内部依赖）
const g = globalThis as Record<string, unknown>

if (!g.ResizeObserver) {
  g.ResizeObserver = class ResizeObserverMock {
    observe() {}
    unobserve() {}
    disconnect() {}
  }
}

if (typeof window !== 'undefined' && typeof window.matchMedia !== 'function') {
  window.matchMedia = ((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  })) as unknown as typeof window.matchMedia
}
