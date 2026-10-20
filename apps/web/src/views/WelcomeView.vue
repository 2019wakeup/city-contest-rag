<script setup lang="ts">
import { onMounted, shallowRef } from 'vue'
import { useRouter } from 'vue-router'

import { ripple } from '@/composables/ripple'
import { useMagnetic } from '@/composables/useMagnetic'

import { kbStats } from '@/api/client'
import type { KbStats } from '@/api/client'
import HomeCaseGallery from '@/components/HomeCaseGallery.vue'
import HomeMiniCharts from '@/components/HomeMiniCharts.vue'
import HomePipeline from '@/components/HomePipeline.vue'
import HomeStats from '@/components/HomeStats.vue'
import HomeTechBar from '@/components/HomeTechBar.vue'

// 欢迎页：系统定位 + 三亮点 + 双 CTA + 数据规模徽章（kb/stats 实时取，失败静默隐藏）。
const router = useRouter()

// 灵动层：主 CTA 磁性 + 涟漪
const magnetic = useMagnetic({ max: 4 })

function onCtaClick(event: MouseEvent, path: string): void {
  ripple(event, event.currentTarget as HTMLElement)
  void router.push(path)
}
const stats = shallowRef<KbStats | null>(null)

const highlights = [
  {
    title: '场景→性能量化映射',
    desc: '从气候分区、交通荷载与病害出发，规则化推导目标性能与优先级权重。',
    icon: 'target',
  },
  {
    title: '配方反向设计推荐',
    desc: '材料-性能-场景关系硬过滤 + 混合检索，输出 Top-5 沥青材料方案与规范基线对比。',
    icon: 'flask',
  },
  {
    title: '可解释证据溯源',
    desc: '每个结论都标注规范条文与文献证据链，点击即可展开原文与来源。',
    icon: 'shield',
  },
] as const

onMounted(async () => {
  try {
    stats.value = await kbStats()
  } catch {
    stats.value = null
  }
})
</script>

<template>
  <div class="welcome">
    <section class="welcome-hero">
      <div class="welcome-mark" aria-hidden="true">材</div>
      <h1 class="welcome-title">数智选材</h1>
      <p class="welcome-tagline">AI 驱动的道路养护决策与沥青材料方案智能推荐</p>
      <div class="welcome-ctas">
        <el-button
          type="primary"
          size="large"
          class="pressable ripple-host magnetic"
          data-testid="cta-recommend"
          @click="onCtaClick($event, '/recommend')"
          @pointermove="magnetic.onPointerMove"
          @pointerleave="magnetic.onPointerLeave"
        >
          开始推荐
        </el-button>
        <el-button
          size="large"
          class="pressable ripple-host magnetic"
          data-testid="cta-cases"
          @click="onCtaClick($event, '/cases')"
          @pointermove="magnetic.onPointerMove"
          @pointerleave="magnetic.onPointerLeave"
        >
          查看典型案例
        </el-button>
      </div>
    </section>

    <section class="welcome-highlights">
      <el-card
        v-for="h in highlights"
        :key="h.title"
        shadow="hover"
        class="welcome-highlight"
      >
        <div class="welcome-highlight-icon" aria-hidden="true">
          <svg
            v-if="h.icon === 'target'"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="1.8"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <circle cx="12" cy="12" r="8" />
            <circle cx="12" cy="12" r="4" />
            <circle cx="12" cy="12" r="1" />
          </svg>
          <svg
            v-else-if="h.icon === 'flask'"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="1.8"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <path d="M9 3h6" />
            <path d="M10 3v6l-5.2 9a2 2 0 0 0 1.7 3h11a2 2 0 0 0 1.7-3L14 9V3" />
            <path d="M7.5 15h9" />
          </svg>
          <svg
            v-else
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="1.8"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <path d="M12 3l7 3v5c0 4.5-3 8.5-7 10-4-1.5-7-5.5-7-10V6z" />
            <path d="M9 12l2 2 4-4" />
          </svg>
        </div>
        <h3 class="welcome-highlight-title">{{ h.title }}</h3>
        <p class="welcome-highlight-desc">{{ h.desc }}</p>
      </el-card>
    </section>

    <HomePipeline />

    <div class="welcome-data-row">
      <HomeStats :stats="stats" />
      <HomeMiniCharts />
    </div>

    <HomeCaseGallery />

    <HomeTechBar />
  </div>
</template>

<style scoped>
.welcome {
  max-width: 960px;
  margin: 0 auto;
  padding: 24px 0 48px;
}

.welcome-data-row {
  display: flex;
  flex-wrap: wrap;
  gap: 24px;
}

.welcome-hero {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 48px 16px 32px;
  text-align: center;
}

.welcome-mark {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 56px;
  height: 56px;
  border-radius: 16px;
  background: var(--el-color-primary);
  color: #fff;
  font-size: 28px;
  font-weight: 600;
  margin-bottom: 20px;
}

.welcome-title {
  margin: 0 0 12px;
  font-size: 34px;
  font-weight: 700;
  letter-spacing: 2px;
  background: linear-gradient(180deg, #ffffff 20%, #94a3b8 90%);
  background-clip: text;
  -webkit-background-clip: text;
  color: transparent;
}

html:not(.dark) .welcome-title {
  background: linear-gradient(180deg, #0f172a 20%, #64748b 90%);
  background-clip: text;
  -webkit-background-clip: text;
  color: transparent;
}

.welcome-tagline {
  margin: 0 0 32px;
  font-size: 16px;
  color: var(--el-text-color-secondary);
}

.magnetic {
  transition: transform var(--motion-base) var(--ease-spring);
  will-change: transform;
}

.welcome-ctas {
  display: flex;
  gap: 12px;
}

.welcome-highlights {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 16px;
  margin-bottom: 32px;
}

.welcome-highlight {
  text-align: center;
}

.welcome-highlight-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  margin: 0 auto 12px;
  border-radius: 12px;
  background: var(--el-color-primary-light-9);
  color: var(--el-color-primary);
}

.welcome-highlight-icon svg {
  width: 24px;
  height: 24px;
}

.welcome-highlight-title {
  margin: 0 0 8px;
  font-size: 15px;
  font-weight: 600;
}

.welcome-highlight-desc {
  margin: 0;
  font-size: 13px;
  line-height: 1.7;
  color: var(--el-text-color-secondary);
}

.welcome-stat-badge {
  padding: 6px 14px;
  border: 1px solid var(--app-border);
  border-radius: 999px;
  font-size: 13px;
  color: var(--el-text-color-regular);
  background: var(--app-panel-bg);
}
</style>
