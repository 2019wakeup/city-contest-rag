<script setup lang="ts">
import { reactive } from 'vue'

import { FIELD_REGISTRY, SCHEMA_VERSION } from '@road-rec/contracts'
import type { FieldDef, SceneInput } from '@road-rec/contracts'

/**
 * Schema 驱动场景表单：控件清单、标签、单位、选项全部来自 contracts 的
 * FIELD_REGISTRY——改 contracts 一处，表单自动跟随，不写死任何字段。
 */
const emit = defineEmits<{ submit: [scene: SceneInput] }>()

interface FieldEntry {
  path: string
  def: FieldDef
}

const fields: FieldEntry[] = Object.entries(FIELD_REGISTRY).map(([path, def]) => ({ path, def }))

function defaultValue(def: FieldDef): unknown {
  switch (def.control) {
    case 'select':
      return def.options?.[0]?.value ?? ''
    case 'number':
      return 0
    case 'checkbox':
      return [] as string[]
    default:
      return ''
  }
}

// 表单值以注册表点路径为 key 存储。
const values = reactive<Record<string, unknown>>({})
for (const { path, def } of fields) {
  values[path] = defaultValue(def)
}

function setByPath(target: Record<string, unknown>, path: string, value: unknown): void {
  const parts = path.split('.')
  let node = target
  for (let i = 0; i < parts.length - 1; i++) {
    const key = parts[i]
    if (typeof node[key] !== 'object' || node[key] === null) node[key] = {}
    node = node[key] as Record<string, unknown>
  }
  node[parts[parts.length - 1]] = value
}

function buildScene(): SceneInput {
  const root: Record<string, unknown> = { schemaVersion: SCHEMA_VERSION }
  for (const { path } of fields) {
    if (path === 'distresses') continue
    setByPath(root, path, values[path])
  }
  // 唯一特例：checkbox 控件的目标字段是对象数组（distresses）；
  // 严重程度默认「中」，与 FIELD_REGISTRY.distresses.placeholder 的约定一致。
  root.distresses = (values.distresses as string[]).map((type) => ({
    type,
    severity: '中',
  }))
  return root as unknown as SceneInput
}

function onSubmit(): void {
  emit('submit', buildScene())
}
</script>

<template>
  <el-form label-position="top" class="scene-form">
    <el-form-item
      v-for="{ path, def } in fields"
      :key="path"
      :data-testid="`field-${path}`"
      :label="def.unit ? `${def.label}（${def.unit}）` : def.label"
    >
      <el-select
        v-if="def.control === 'select'"
        v-model="(values[path] as string)"
        :placeholder="def.placeholder"
        class="scene-field-control"
      >
        <el-option
          v-for="opt in def.options ?? []"
          :key="opt.value"
          :label="opt.label"
          :value="opt.value"
        />
      </el-select>

      <el-input-number
        v-else-if="def.control === 'number'"
        v-model="(values[path] as number)"
        :placeholder="def.placeholder"
        class="scene-field-control"
      />

      <el-input
        v-else-if="def.control === 'text'"
        v-model="(values[path] as string)"
        :placeholder="def.placeholder"
        class="scene-field-control"
      />

      <el-checkbox-group
        v-else-if="def.control === 'checkbox'"
        v-model="(values[path] as string[])"
        class="scene-field-control"
      >
        <el-checkbox
          v-for="opt in def.options ?? []"
          :key="opt.value"
          :value="opt.value"
          :label="opt.label"
        />
      </el-checkbox-group>

      <el-input
        v-else
        v-model="(values[path] as string)"
        type="textarea"
        :rows="3"
        :placeholder="def.placeholder"
        class="scene-field-control"
      />
    </el-form-item>

    <el-button type="primary" data-testid="scene-form-submit" @click="onSubmit">
      生成推荐方案
    </el-button>
  </el-form>
</template>

<style scoped>
.scene-field-control {
  width: 100%;
}
</style>
