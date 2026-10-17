<script setup lang="ts">
import { computed } from 'vue'

import { scoreDisplayText } from '@/utils/score'
import type { EvidenceRef } from '@road-rec/contracts'

const props = defineProps<{ evidence: EvidenceRef[]; ids: string[] }>()

const DOC_TYPE_LABELS: Record<string, string> = {
  knowledge: '知识条目',
  standard: '规范',
  literature: '文献',
  enterprise: '企业资料',
}

const matches = computed(() => {
  const byId = new Map((props.evidence ?? []).map((e) => [e.chunkId, e]))
  return (props.ids ?? []).map((id) => byId.get(id)).filter((e): e is EvidenceRef => e != null)
})

const scoreTextOf = (hit: EvidenceRef): string =>
  scoreDisplayText(
    matches.value.map((m) => m.score),
    hit.score,
  )

const docTypeLabel = (docType: string): string => DOC_TYPE_LABELS[docType] ?? docType
</script>

<template>
  <el-card shadow="never" data-testid="evidence-panel" class="evidence-panel">
    <template #header>证据链（点击展开原文与来源）</template>
    <el-empty
      v-if="(evidence ?? []).length === 0"
      description="知识库为空，请执行 pnpm build:index"
      :image-size="48"
    />
    <el-empty
      v-else-if="matches.length === 0"
      description="该方案暂无证据引用"
      :image-size="48"
    />
    <el-collapse v-else>
      <el-collapse-item
        v-for="hit in matches"
        :key="hit.chunkId"
        :title="`[${docTypeLabel(hit.docType ?? '')}] ${(hit.text ?? '').slice(0, 40)}`"
      >
        <p class="evidence-text">{{ hit.text }}</p>
        <p class="evidence-provenance">
          来源：{{ hit.provenance?.sourceDocId ?? '未知' }}
          · 模型 {{ hit.provenance?.embeddingModel ?? '-' }}
          v{{ hit.provenance?.modelVersion ?? '-' }}
        </p>
        <p data-testid="evidence-score" class="evidence-score">
          相关度（归一化）：{{ scoreTextOf(hit) }}
        </p>
      </el-collapse-item>
    </el-collapse>
  </el-card>
</template>

<style scoped>
.evidence-text {
  margin: 0 0 8px;
  line-height: 1.7;
  color: var(--el-text-color-primary);
}

.evidence-provenance {
  margin: 0;
  font-size: 12px;
  color: var(--el-text-color-secondary);
}
</style>
