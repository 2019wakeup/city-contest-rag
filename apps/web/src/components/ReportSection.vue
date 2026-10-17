<script setup lang="ts">
import type { ReportSection as ReportSectionItem } from '@road-rec/contracts'

defineProps<{
  sections: ReportSectionItem[]
  llmStatus: 'ok' | 'degraded'
}>()
</script>

<template>
  <el-card shadow="never" class="report-section">
    <template #header>推荐报告</template>
    <el-alert
      v-if="llmStatus === 'degraded'"
      type="info"
      :closable="false"
      show-icon
      title="文案模板降级：LLM 不可用，以下文案由确定性模板生成，数据结果不受影响"
      class="report-degraded"
    />
    <el-empty
      v-if="(sections ?? []).length === 0"
      description="暂无报告文案"
      :image-size="48"
    />
    <section v-for="(s, i) in sections ?? []" :key="`${s.title}-${i}`" class="report-block">
      <h4 class="report-title">{{ s.title }}</h4>
      <p v-for="(p, j) in s.paragraphs ?? []" :key="j" class="report-paragraph">
        {{ p }}
      </p>
      <div v-if="(s.evidenceIds ?? []).length > 0" class="report-refs">
        <el-tag v-for="eid in s.evidenceIds ?? []" :key="eid" size="small" type="info">
          {{ eid }}
        </el-tag>
      </div>
    </section>
  </el-card>
</template>

<style scoped>
.report-degraded {
  margin-bottom: 12px;
}

.report-title {
  margin: 0 0 8px;
}

.report-paragraph {
  margin: 0 0 8px;
  line-height: 1.7;
  color: var(--el-text-color-regular);
}

.report-refs {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-bottom: 12px;
}
</style>
