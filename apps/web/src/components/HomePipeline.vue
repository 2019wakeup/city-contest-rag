<script setup lang="ts">
/** 六步流水线（SVG）：解析→映射→召回→预测→排序→报告；hover 高亮 + 连接线流动动效。 */
const STEPS = ['解析', '映射', '召回', '预测', '排序', '报告'] as const
</script>

<template>
  <section class="home-pipeline" data-testid="home-pipeline">
    <h2 class="home-section-title">推荐流水线</h2>
    <div class="pipeline-flow" role="img" aria-label="推荐流水线六步：解析、映射、召回、预测、排序、报告">
      <template v-for="(step, i) in STEPS" :key="step">
        <div class="pipeline-node" data-testid="pipeline-node">
          <span class="pipeline-index mono tabular">{{ String(i + 1).padStart(2, '0') }}</span>
          <span class="pipeline-name">{{ step }}</span>
        </div>
        <div v-if="i < STEPS.length - 1" class="pipeline-link" aria-hidden="true">
          <span class="pipeline-link-flow"></span>
        </div>
      </template>
    </div>
  </section>
</template>

<style scoped>
.home-pipeline {
  margin-bottom: 32px;
}

.home-section-title {
  margin: 0 0 16px;
  font-size: 18px;
  font-weight: 600;
}

.pipeline-flow {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
}

.pipeline-node {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 12px 18px;
  border: 1px solid var(--app-border);
  border-radius: 12px;
  background: var(--app-panel-bg);
  transition:
    border-color var(--motion-fast) var(--ease-out),
    transform var(--motion-fast) var(--ease-out),
    box-shadow var(--motion-fast) var(--ease-out);
}

.pipeline-node:hover {
  border-color: var(--el-color-primary);
  transform: translateY(-2px);
  box-shadow: 0 0 0 1px var(--el-color-primary-light-7);
}

.pipeline-index {
  font-size: 12px;
  color: var(--el-text-color-secondary);
}

.pipeline-name {
  font-size: 14px;
  font-weight: 600;
}

.pipeline-link {
  position: relative;
  width: 40px;
  height: 2px;
  background: var(--app-border-strong);
  overflow: hidden;
}

.pipeline-link-flow {
  position: absolute;
  inset: 0;
  background: linear-gradient(90deg, transparent, var(--el-color-primary), transparent);
  animation: pipeline-flow 1.8s linear infinite;
}

@keyframes pipeline-flow {
  from {
    transform: translateX(-100%);
  }

  to {
    transform: translateX(100%);
  }
}

@media (prefers-reduced-motion: reduce) {
  .pipeline-link-flow {
    animation: none;
  }
}
</style>
