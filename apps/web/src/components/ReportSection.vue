<script setup lang="ts">
import type { ReportSection as ReportSectionItem } from '@road-rec/contracts'

defineProps<{
  sections: ReportSectionItem[]
  llmStatus: 'ok' | 'degraded'
}>()
const emit = defineEmits<{ cite: [evidenceId: string] }>()

// chunkId 形态（如 k-modifier-002:0、std-9:1、lit-012:0:bge-m3@1）。
const ID_PATTERN = /[a-z][a-z0-9-]*(?::\d+)+(?::[a-z0-9._-]+)?/gi

interface Segment {
  text: string
  id?: string
}

/** UI二轮：段落中裸证据 id → 可点击角标（点击滚动定位到证据链对应 chunk）。 */
function parseSegments(paragraph: string): Segment[] {
  const segments: Segment[] = []
  let last = 0
  for (const m of paragraph.matchAll(ID_PATTERN)) {
    const index = m.index ?? 0
    if (index > last) segments.push({ text: paragraph.slice(last, index) })
    segments.push({ text: m[0], id: m[0] })
    last = index + m[0].length
  }
  if (last < paragraph.length) segments.push({ text: paragraph.slice(last) })
  return segments
}

function onCite(id: string): void {
  emit('cite', id)
}
</script>

<template>
  <el-card shadow="hover" data-testid="report-section" class="report-section">
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
    <section
      v-for="(s, i) in sections ?? []"
      :key="`${s.title}-${i}`"
      class="report-block report-stagger"
      :style="{ '--i': i }"
    >
      <h4 class="report-title">{{ s.title }}</h4>
      <p v-for="(p, j) in s.paragraphs ?? []" :key="j" class="report-paragraph">
        <template v-for="(seg, k) in parseSegments(p)" :key="k">
          <button
            v-if="seg.id"
            type="button"
            class="report-cite"
            data-testid="evidence-cite"
            :title="`定位证据 ${seg.id}`"
            @click="onCite(seg.id)"
          >
            {{ seg.text }}
          </button>
          <template v-else>{{ seg.text }}</template>
        </template>
      </p>
      <div v-if="(s.evidenceIds ?? []).length > 0" class="report-refs">
        <el-tag
          v-for="eid in s.evidenceIds ?? []"
          :key="eid"
          size="small"
          type="info"
          class="report-ref-tag"
          data-testid="evidence-cite"
          @click="onCite(eid)"
        >
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

.report-cite {
  display: inline-block;
  margin: 0 2px;
  padding: 0 6px;
  border: none;
  border-radius: 4px;
  background: var(--el-color-primary-light-9);
  color: var(--el-color-primary);
  font-size: 12px;
  line-height: 20px;
  font-variant-numeric: tabular-nums;
  cursor: pointer;
}

.report-cite:hover {
  background: var(--el-color-primary-light-8);
}

.report-refs {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-bottom: 12px;
}

.report-ref-tag {
  cursor: pointer;
}

/* 错峰淡入（stagger 100ms；遵守 reduced-motion） */
.report-block.report-stagger {
  animation: report-fade-in 0.4s ease both;
  animation-delay: calc(var(--i, 0) * 100ms);
}

@keyframes report-fade-in {
  from {
    opacity: 0;
    transform: translateY(8px);
  }

  to {
    opacity: 1;
    transform: none;
  }
}

@media (prefers-reduced-motion: reduce) {
  .report-block.report-stagger {
    animation: none;
  }
}
</style>
