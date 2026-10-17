<script setup lang="ts">
import { computed, onMounted, shallowRef } from 'vue'

import { postChat } from '@/api/client'
import { useRecommendStore } from '@/stores/recommend'
import type { RecommendationReport } from '@road-rec/contracts'

const props = defineProps<{ report: RecommendationReport | null }>()

const store = useRecommendStore()
const question = shallowRef('')
const sending = shallowRef(false)
const streaming = shallowRef('')

// LLM 配置状态（UI#12）：健康检查失败时未知，不显示提示。
const llmConfigured = shallowRef<boolean | null>(null)

onMounted(async () => {
  try {
    const res = await fetch('/api/v1/health')
    const data = (await res.json()) as { llm?: { configured?: boolean } }
    llmConfigured.value = data.llm?.configured ?? null
  } catch {
    llmConfigured.value = null
  }
})

const hint = computed(() => {
  if (sending.value) return '回复中…'
  if (!question.value.trim()) return '请输入问题'
  if (llmConfigured.value === false) {
    return 'LLM 未配置：配置 DEEPSEEK_API_KEY 后可用（当前为降级模式）'
  }
  return ''
})

async function send(): Promise<void> {
  const q = question.value.trim()
  if (!q || sending.value) return
  sending.value = true
  streaming.value = ''
  store.chat.push({ role: 'user', content: q })
  question.value = ''
  try {
    // SSE 流式：delta 逐段回填；后端降级为普通 JSON {reply} 时 client 内部兜底。
    const reply = await postChat(
      {
        schemaVersion: '1',
        question: q,
        history: [...store.chat],
        reportContext: props.report ?? undefined,
      },
      (delta) => {
        streaming.value += delta
      },
    )
    store.chat.push({ role: 'assistant', content: reply || streaming.value })
    streaming.value = ''
  } catch (err) {
    store.chat.push({
      role: 'assistant',
      content: `对话失败：${err instanceof Error ? err.message : String(err)}`,
    })
  } finally {
    sending.value = false
  }
}

/** 回车发送；中文输入法组词回车（isComposing/Process 键）不误发（F4）。 */
function onEnterKey(event: KeyboardEvent): void {
  if (event.isComposing || event.key === 'Process') return
  event.preventDefault()
  void send()
}
</script>

<template>
  <el-card shadow="never" class="chat-panel">
    <template #header>对话面板</template>
    <div class="chat-messages">
      <el-empty
        v-if="store.chat.length === 0 && !streaming"
        description="基于当前报告与证据提问，例如：为什么推荐这个方案？"
        :image-size="48"
      />
      <div
        v-for="(msg, i) in store.chat"
        :key="i"
        class="chat-row"
        :class="msg.role === 'user' ? 'chat-user' : 'chat-assistant'"
      >
        <div class="chat-bubble">{{ msg.content }}</div>
      </div>
      <div v-if="streaming" class="chat-row chat-assistant">
        <div class="chat-bubble">{{ streaming }}…</div>
      </div>
    </div>
    <div v-if="hint" data-testid="chat-hint" class="chat-hint">{{ hint }}</div>
    <div class="chat-input-row">
      <el-input
        v-model="question"
        type="textarea"
        :rows="2"
        data-testid="chat-input"
        placeholder="输入追问…"
        @keydown.enter.exact="onEnterKey"
      />
      <el-button
        type="primary"
        data-testid="chat-send"
        :disabled="sending || !question.trim()"
        @click="send"
      >
        {{ sending ? '回复中…' : '发送' }}
      </el-button>
    </div>
  </el-card>
</template>

<style scoped>
.chat-messages {
  max-height: 320px;
  overflow: auto;
  margin-bottom: 12px;
}

.chat-row {
  display: flex;
  margin-bottom: 8px;
}

.chat-user {
  justify-content: flex-end;
}

.chat-assistant {
  justify-content: flex-start;
}

.chat-bubble {
  max-width: 80%;
  padding: 8px 12px;
  border-radius: 8px;
  line-height: 1.6;
}

.chat-user .chat-bubble {
  background: var(--el-color-primary-light-9);
  color: var(--el-text-color-primary);
}

.chat-assistant .chat-bubble {
  background: var(--el-fill-color);
  color: var(--el-text-color-primary);
}

.chat-input-row {
  display: flex;
  gap: 8px;
  align-items: flex-end;
}

.chat-hint {
  margin-bottom: 8px;
  font-size: 13px;
  color: var(--el-text-color-secondary);
}
</style>
