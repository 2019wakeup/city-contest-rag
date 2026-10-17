/// <reference types="vitest/config" />
import { fileURLToPath, URL } from 'node:url'

import vue from '@vitejs/plugin-vue'
import { defineConfig } from 'vite'

// 前端 dev 服务器：/api 代理目标可用 API_PROXY_TARGET 覆盖（默认 3000，R4 预案：
// 本机 3000 被其他进程占用时，演示用 API_PROXY_TARGET=http://localhost:3010）。
const apiProxyTarget = process.env.API_PROXY_TARGET ?? 'http://localhost:3000'

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  server: {
    proxy: {
      '/api': {
        target: apiProxyTarget,
        changeOrigin: true,
      },
    },
  },
  test: {
    environment: 'happy-dom',
    setupFiles: ['test/setup.ts'],
  },
})
