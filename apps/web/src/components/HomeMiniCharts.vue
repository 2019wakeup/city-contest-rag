<script setup lang="ts">
/** 三张 mini 指标图（纯 CSS bar/环）：演示示意数据。 */
const METRICS = [
  { label: '检索 recall', value: 38, max: 38, unit: '/38', note: 'top38 全命中' },
  { label: '证据多样性', value: 13, max: 15, unit: '/15', note: '13-15 类覆盖' },
  { label: '引用支撑率', value: 85, max: 100, unit: '%', note: '85-100%' },
] as const
</script>

<template>
  <section class="home-mini" data-testid="home-mini-charts">
    <h2 class="home-section-title">关键指标</h2>
    <div class="mini-list">
      <div v-for="m in METRICS" :key="m.label" class="mini-item" data-testid="mini-chart">
        <div class="mini-head">
          <span class="mini-label">{{ m.label }}</span>
          <span class="mini-value tabular">{{ m.value }}{{ m.unit }}</span>
        </div>
        <div class="mini-bar">
          <div
            class="mini-bar-fill"
            :style="{ width: `${Math.round((m.value / m.max) * 100)}%` }"
          ></div>
        </div>
        <div class="mini-note">{{ m.note }}</div>
      </div>
    </div>
    <p class="mini-disclaimer">演示示意 · 本地评测集统计</p>
  </section>
</template>

<style scoped>
.home-mini {
  flex: 1;
  min-width: 260px;
  margin-bottom: 32px;
}

.home-section-title {
  margin: 0 0 16px;
  font-size: 18px;
  font-weight: 600;
}

.mini-list {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.mini-head {
  display: flex;
  justify-content: space-between;
  margin-bottom: 6px;
}

.mini-label {
  font-size: 14px;
  color: var(--el-text-color-regular);
}

.mini-value {
  font-size: 14px;
  font-weight: 600;
  color: var(--el-color-primary);
}

.mini-bar {
  height: 8px;
  border-radius: 4px;
  background: var(--el-fill-color-light);
  overflow: hidden;
}

.mini-bar-fill {
  height: 100%;
  border-radius: 4px;
  background: linear-gradient(90deg, var(--el-color-primary), #8b5cf6);
  transition: width var(--motion-base) var(--ease-out);
}

.mini-note {
  margin-top: 4px;
  font-size: 12px;
  color: var(--el-text-color-secondary);
}

.mini-disclaimer {
  margin: 12px 0 0;
  font-size: 12px;
  color: var(--el-text-color-placeholder);
}
</style>
