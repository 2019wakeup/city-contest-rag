<script setup lang="ts">
import { computed, onMounted, shallowRef } from 'vue'
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

// 02 能力旅程：纵向流程式三步
const JOURNEY = [
  { step: '场景输入', desc: '气候分区、交通荷载、结构层位与病害一键填入，或从典型案例载入。' },
  { step: '智能推荐', desc: '规则硬过滤 + 混合检索 + LLM 重排，输出 Top-5 配方方案与规范基线对比。' },
  { step: '证据溯源', desc: '每个结论标注规范条文/文献/企业实测证据链，点击即可定位原文。' },
] as const

// 04 数据底座：企业实测指标 chip
const LAB_CHIPS = ['空隙率 VV', 'VMA', 'VFA', '稳定度 MS', '流值 FL', '劲度模量', 'TSR', '残留稳定度', '动稳定度 DS', '弯拉应变'] as const

// hero 关键数字：kb/stats 实时取，失败静态兜底
const heroNumbers = computed(() => {
  const count = stats.value?.count ?? 11143
  return [
    { value: `${count.toLocaleString()}`, label: '知识块' },
    { value: '38/38', label: '金标准' },
    { value: '85%', label: '引用支撑率' },
  ]
})

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
    <!-- 01 Hero -->
    <section class="narrative-sec" data-testid="narrative-section">
      <div class="welcome-hero">
        <div class="welcome-mark" aria-hidden="true">方</div>
        <h1 class="welcome-title">路有良方</h1>
        <p class="welcome-tagline">面向道路养护的智能决策与沥青材料推荐平台</p>
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
        <div class="hero-numbers" data-testid="hero-numbers">
          <div v-for="n in heroNumbers" :key="n.label" class="hero-number">
            <span class="hero-number-value tabular">{{ n.value }}</span>
            <span class="hero-number-label">{{ n.label }}</span>
          </div>
        </div>
      </div>
    </section>

    <!-- 02 能力旅程（纵向流程式） -->
    <section class="narrative-sec" data-testid="narrative-section">
      <div class="sec-eyebrow mono tabular" data-testid="eyebrow">02</div>
      <h2 class="sec-title">能力旅程</h2>
      <p class="sec-subtitle">从场景到方案到证据，三步闭环</p>
      <div class="journey" data-testid="journey">
        <template v-for="(item, i) in JOURNEY" :key="item.step">
          <div class="journey-row">
            <div class="journey-rail">
              <span class="journey-dot" :data-step="i + 1">{{ i + 1 }}</span>
              <span v-if="i < JOURNEY.length - 1" class="journey-connector" data-testid="journey-connector"></span>
            </div>
            <div class="journey-card elevated-card">
              <h3 class="journey-title">{{ item.step }}</h3>
              <p class="journey-desc">{{ item.desc }}</p>
            </div>
          </div>
        </template>
      </div>
    </section>

    <!-- 03 如何工作（六步流水线） -->
    <section class="narrative-sec" data-testid="narrative-section">
      <div class="sec-eyebrow mono tabular" data-testid="eyebrow">03</div>
      <h2 class="sec-title">如何工作</h2>
      <p class="sec-subtitle">六步流水线：从场景解析到报告生成</p>
      <HomePipeline />
    </section>

    <!-- 04 数据底座 -->
    <section class="narrative-sec" data-testid="narrative-section">
      <div class="sec-eyebrow mono tabular" data-testid="eyebrow">04</div>
      <h2 class="sec-title">数据底座</h2>
      <p class="sec-subtitle">知识库构成与关键指标</p>
      <div class="data-base" data-testid="data-base">
        <div class="data-base-card elevated-card">
          <HomeStats :stats="stats" />
        </div>
        <div class="data-base-card elevated-card">
          <HomeMiniCharts />
        </div>
      </div>
      <div class="lab-chips" data-testid="lab-chips">
        <span v-for="chip in LAB_CHIPS" :key="chip" class="lab-chip" data-testid="lab-chip">{{ chip }}</span>
      </div>
    </section>

    <!-- 05 案例与行动 -->
    <section class="narrative-sec" data-testid="narrative-section">
      <div class="sec-eyebrow mono tabular" data-testid="eyebrow">05</div>
      <h2 class="sec-title">案例与行动</h2>
      <p class="sec-subtitle">从典型案例出发，或直接开始一次推荐</p>
      <HomeCaseGallery />
      <div class="closing-cta" data-testid="closing-cta">
        <el-button
          type="primary"
          size="large"
          class="pressable"
          data-testid="cta-recommend-bottom"
          @click="onCtaClick($event, '/recommend')"
        >
          开始推荐
        </el-button>
        <el-button size="large" class="pressable" data-testid="cta-cases-bottom" @click="onCtaClick($event, '/cases')">
          查看典型案例
        </el-button>
      </div>
    </section>

    <footer class="welcome-footer">
      <span>LanceDB</span> · <span>混合检索 + LLM 重排</span> · <span>DeepSeek</span> · <span>38 条金标准</span>
    </footer>
  </div>
</template>

<style scoped>
.welcome {
  max-width: 960px;
  margin: 0 auto;
  padding: 24px 0 48px;
}

/* 叙事段：统一间距 96px */
.narrative-sec {
  margin-bottom: 96px;
}

.sec-eyebrow {
  font-size: 12px;
  color: var(--el-color-primary);
  letter-spacing: 2px;
  margin-bottom: 6px;
}

.sec-title {
  margin: 0 0 8px;
  font-size: 22px;
  font-weight: 700;
}

.sec-subtitle {
  margin: 0 0 24px;
  font-size: 14px;
  color: var(--el-text-color-secondary);
}

/* 统一卡片体系：elevated + hairline + 12px */
.elevated-card {
  background: var(--color-elevated);
  border: 1px solid var(--app-hairline);
  border-radius: 12px;
  padding: 20px;
}

/* 01 Hero */
.welcome-hero {
  display: flex;
  flex-direction: column;
  align-items: center;
  max-width: 720px;
  margin: 0 auto;
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
  background: linear-gradient(135deg, var(--app-primary-from), var(--app-primary-to));
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
  line-height: 1.7;
  color: var(--el-text-color-secondary);
}

@media (max-width: 480px) {
  .welcome-tagline {
    font-size: 14px;
  }
}

.magnetic {
  transition: transform var(--motion-base) var(--ease-spring);
  will-change: transform;
}

.welcome-ctas {
  display: flex;
  gap: 12px;
  margin-bottom: 32px;
}

.hero-numbers {
  display: flex;
  gap: 40px;
}

.hero-number {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.hero-number-value {
  font-size: 20px;
  font-weight: 700;
  color: var(--el-color-primary);
}

.hero-number-label {
  font-size: 12px;
  color: var(--el-text-color-secondary);
}

/* 02 纵向流程：左 rail 连接线 */
.journey {
  display: flex;
  flex-direction: column;
}

.journey-row {
  display: flex;
  gap: 16px;
}

.journey-rail {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 32px;
  flex-shrink: 0;
}

.journey-dot {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--app-primary-from), var(--app-primary-to));
  color: #fff;
  font-size: 13px;
  font-weight: 600;
}

.journey-connector {
  width: 2px;
  height: 72px;
  background: linear-gradient(180deg, var(--el-color-primary), transparent);
}

.journey-card {
  flex: 1;
  margin-bottom: 16px;
}

.journey-title {
  margin: 0 0 6px;
  font-size: 16px;
  font-weight: 600;
}

.journey-desc {
  margin: 0;
  font-size: 14px;
  line-height: 1.7;
  color: var(--el-text-color-regular);
}

/* 04 数据底座：同高双卡 + lab chips */
.data-base {
  display: grid;
  grid-template-columns: 3fr 2fr;
  gap: 16px;
  align-items: stretch;
  margin-bottom: 20px;
}

@media (max-width: 900px) {
  .data-base {
    grid-template-columns: 1fr;
  }
}

.data-base-card :deep(.home-stats),
.data-base-card :deep(.home-mini) {
  margin-bottom: 0;
}

.lab-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.lab-chip {
  padding: 4px 12px;
  border-radius: 999px;
  background: var(--el-fill-color-light);
  color: var(--el-text-color-secondary);
  font-size: 12px;
}

/* 05 收尾 CTA */
.closing-cta {
  display: flex;
  gap: 12px;
  justify-content: center;
  margin-top: 8px;
}

/* 页脚技术小字 */
.welcome-footer {
  padding-top: 16px;
  border-top: 1px solid var(--app-hairline);
  text-align: center;
  font-size: 12px;
  color: var(--el-text-color-placeholder);
}
</style>
