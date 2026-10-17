<script setup lang="ts">
import { onMounted, shallowRef } from 'vue'
import { useRouter } from 'vue-router'

import { getCases } from '@/api/client'
import type { CaseSeed } from '@road-rec/contracts'
import CaseCard from '@/components/CaseCard.vue'

// 典型案例页：5 案例卡片 → 一键载入推荐工作台（/recommend?case=<id>，工作台自动回填）。
const router = useRouter()
const cases = shallowRef<CaseSeed[]>([])
const loading = shallowRef(false)
const errorMessage = shallowRef('')

onMounted(async () => {
  loading.value = true
  try {
    cases.value = await getCases()
  } catch (err) {
    errorMessage.value = err instanceof Error ? err.message : String(err)
  } finally {
    loading.value = false
  }
})

function loadCase(id: string): void {
  void router.push({ path: '/recommend', query: { case: id } })
}
</script>

<template>
  <div class="cases-view">
    <h3 class="cases-title">典型案例</h3>
    <el-alert
      v-if="errorMessage"
      type="error"
      :closable="false"
      :title="`案例加载失败：${errorMessage}`"
      class="cases-alert"
    />
    <el-row :gutter="16">
      <el-col
        v-for="c in cases ?? []"
        :key="c.id"
        :xs="24"
        :sm="12"
        :md="8"
        class="cases-col"
      >
        <CaseCard :item="c" @load="loadCase" />
      </el-col>
    </el-row>
    <el-empty
      v-if="!loading && (cases ?? []).length === 0"
      description="暂无案例"
      class="cases-empty"
    />
  </div>
</template>

<style scoped>
.cases-title {
  margin: 0 0 16px;
}

.cases-alert {
  margin-bottom: 12px;
}

.cases-col {
  margin-bottom: 16px;
}

.cases-empty {
  margin-top: 48px;
}
</style>
