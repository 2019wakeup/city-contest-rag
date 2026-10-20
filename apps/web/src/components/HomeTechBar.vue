<script setup lang="ts">
/** 技术底座条：4 个技术 chip 横排。 */
const CHIPS = [
  '向量库 LanceDB',
  '混合检索 + LLM 重排',
  'DeepSeek',
  '38 条金标准 + 引用支撑率',
] as const
</script>

<template>
  <section class="home-techbar" data-testid="home-techbar">
    <h2 class="home-section-title">技术底座</h2>
    <div class="techbar-row">
      <span v-for="chip in CHIPS" :key="chip" class="techbar-chip" data-testid="techbar-chip">
        {{ chip }}
      </span>
    </div>
  </section>
</template>

<style scoped>
.home-techbar {
  margin-bottom: 32px;
}

.home-section-title {
  margin: 0 0 12px;
  font-size: 18px;
  font-weight: 600;
}

.techbar-row {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.techbar-chip {
  padding: 6px 14px;
  border: 1px solid var(--app-border-strong);
  border-radius: 999px;
  background: var(--app-panel-bg);
  color: var(--el-text-color-secondary);
  font-size: 13px;
}
</style>
