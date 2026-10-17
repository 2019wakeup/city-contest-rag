<script setup lang="ts">
import { shallowRef } from 'vue'

import { kbUpload } from '@/api/client'
import type { KbUploadResult } from '@/api/client'
import type { DocType } from '@road-rec/contracts'

const emit = defineEmits<{ uploaded: [] }>()

const DOC_TYPE_LABELS: Array<{ value: DocType; label: string }> = [
  { value: 'enterprise', label: '企业资料' },
  { value: 'standard', label: '规范' },
  { value: 'knowledge', label: '知识条目' },
  { value: 'literature', label: '文献' },
]

const title = shallowRef('')
const text = shallowRef('')
const docType = shallowRef<DocType>('enterprise')
const uploading = shallowRef(false)
const errorMessage = shallowRef('')
const result = shallowRef<KbUploadResult | null>(null)

/** 文本类文件（.md/.txt）读取后填入文本域，走 JSON 上传通道（PDF 走后端 multipart 通道）。 */
async function onFileChange(event: Event): Promise<void> {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) return
  try {
    text.value = await file.text()
    if (!title.value) title.value = file.name
  } catch (err) {
    errorMessage.value = err instanceof Error ? err.message : String(err)
  } finally {
    input.value = ''
  }
}

async function upload(): Promise<void> {
  if (!text.value.trim() || uploading.value) return
  uploading.value = true
  errorMessage.value = ''
  result.value = null
  try {
    result.value = await kbUpload({
      title: title.value.trim(),
      docType: docType.value,
      text: text.value,
    })
    title.value = ''
    text.value = ''
    emit('uploaded')
  } catch (err) {
    errorMessage.value = err instanceof Error ? err.message : String(err)
  } finally {
    uploading.value = false
  }
}
</script>

<template>
  <el-card shadow="never" class="kb-upload">
    <template #header>上传资料</template>
    <el-form label-position="top">
      <el-form-item label="标题（可选）">
        <el-input
          v-model="title"
          data-testid="kb-upload-title"
          placeholder="如 某项目技术要求"
        />
      </el-form-item>
      <el-form-item label="资料类型">
        <el-select v-model="docType" class="kb-upload-type">
          <el-option
            v-for="opt in DOC_TYPE_LABELS"
            :key="opt.value"
            :label="opt.label"
            :value="opt.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="粘贴文本">
        <el-input
          v-model="text"
          type="textarea"
          :rows="5"
          data-testid="kb-upload-text"
          placeholder="粘贴企业资料 / 规范条文等文本"
        />
      </el-form-item>
      <el-form-item label="或选择文本文件（.md / .txt）">
        <input
          type="file"
          accept=".md,.txt,.markdown"
          data-testid="kb-upload-file"
          @change="onFileChange"
        />
      </el-form-item>
    </el-form>
    <el-alert
      v-if="errorMessage"
      type="error"
      :closable="false"
      :title="`上传失败：${errorMessage}`"
      class="kb-upload-alert"
    />
    <div v-if="result" class="kb-upload-result">
      已入库 {{ result.added }} 篇 · 切块 {{ result.chunks }} 块
    </div>
    <el-button
      type="primary"
      data-testid="kb-upload-btn"
      :disabled="uploading || !text.trim()"
      @click="upload"
    >
      {{ uploading ? '上传中…' : '上传入库' }}
    </el-button>
  </el-card>
</template>

<style scoped>
.kb-upload-type {
  width: 100%;
}

.kb-upload-alert {
  margin-bottom: 12px;
}

.kb-upload-result {
  margin-bottom: 12px;
  color: var(--el-color-success);
}
</style>
