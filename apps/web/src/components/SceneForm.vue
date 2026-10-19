<script setup lang="ts">
import { reactive, watch } from 'vue'

import { ripple } from '@/composables/ripple'
import { useMagnetic } from '@/composables/useMagnetic'
import { FIELD_REGISTRY, SCHEMA_VERSION } from '@road-rec/contracts'
import type { FieldDef, SceneInput } from '@road-rec/contracts'

/**
 * Schema 驱动场景表单：控件清单、标签、单位、选项全部来自 contracts 的
 * FIELD_REGISTRY——改 contracts 一处，表单自动跟随，不写死任何字段。
 * 可选 initialScene 用于案例一键填入（改值即回填表单）。
 */
const props = defineProps<{ initialScene?: SceneInput | null }>()
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
      // P1：数值字段初值 null（显示 placeholder 示例），必填校验拦截空值。
      return null
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

/** P1：ESAL 显示单位为「万次」——用户输 3000 提交 esal=3000×10⁴；回填时反向 ÷10⁴。 */
const ESAL_PATH = 'traffic.esal'

function getByPath(source: unknown, path: string): unknown {
  let node = source as Record<string, unknown>
  for (const part of path.split('.')) {
    if (typeof node !== 'object' || node === null) return undefined
    node = node[part] as Record<string, unknown>
  }
  return node
}

/** 案例一键填入：外部场景按注册表路径反填控件值（distresses 取类型数组）。 */
function applyScene(scene: SceneInput | null | undefined): void {
  if (!scene) return
  for (const { path, def } of fields) {
    if (path === 'distresses') continue
    let v = getByPath(scene, path)
    if (v === undefined) {
      v = defaultValue(def)
    } else if (path === ESAL_PATH && typeof v === 'number') {
      v = v / 1e4
    }
    values[path] = v
  }
  values.distresses = (scene.distresses ?? []).map((d) => d.type)
}

watch(() => props.initialScene, applyScene, { immediate: true })

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
    let value = values[path]
    if (path === ESAL_PATH && typeof value === 'number') {
      value = value * 1e4
    }
    setByPath(root, path, value)
  }
  // 唯一特例：checkbox 控件的目标字段是对象数组（distresses）；
  // 严重程度默认「中」，与 FIELD_REGISTRY.distresses.placeholder 的约定一致。
  root.distresses = (values.distresses as string[]).map((type) => ({
    type,
    severity: '中',
  }))
  return root as unknown as SceneInput
}

// ---- P1：必填校验（内联字段错误，不通过不提交）----
const REQUIRED_NUMERIC = [
  'climate.pgHigh',
  'climate.pgLow',
  'traffic.esal',
  'constraints.budget',
  'constraints.schedule',
]
const errors = reactive<Record<string, string>>({})

function validate(): boolean {
  for (const key of Object.keys(errors)) delete errors[key]
  let ok = true
  for (const path of REQUIRED_NUMERIC) {
    if (values[path] == null || values[path] === '') {
      errors[path] = '必填'
      ok = false
    }
  }
  if ((values.distresses as string[]).length === 0) {
    errors.distresses = '至少选择 1 个病害'
    ok = false
  }
  return ok
}

function onSubmit(): void {
  if (!validate()) return
  emit('submit', buildScene())
}

// 灵动层：主 CTA 磁性 + 涟漪
const magnetic = useMagnetic({ max: 4 })

function onClickSubmit(event: MouseEvent): void {
  ripple(event, event.currentTarget as HTMLElement)
  onSubmit()
}

/** UI二轮键盘：Ctrl/⌘+Enter 提交表单；普通 Enter 不触发（避免输入框误提交）。 */
function onFormKeydown(event: KeyboardEvent): void {
  if (event.key !== 'Enter') return
  if (!event.ctrlKey && !event.metaKey) return
  event.preventDefault()
  onSubmit()
}
</script>

<template>
  <el-form label-position="top" class="scene-form" @keydown="onFormKeydown">
    <el-form-item
      v-for="{ path, def } in fields"
      :key="path"
      :data-testid="`field-${path}`"
      :label="
        path === 'traffic.esal'
          ? '累计当量轴次（万次）'
          : def.unit
            ? `${def.label}（${def.unit}）`
            : def.label
      "
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

      <!-- P1：内联必填错误（自实现，不依赖组件库校验状态） -->
      <div v-if="errors[path]" data-testid="field-error" class="scene-field-error">
        {{ errors[path] }}
      </div>
    </el-form-item>

    <el-button
      type="primary"
      data-testid="scene-form-submit"
      class="pressable ripple-host magnetic"
      @click="onClickSubmit"
      @pointermove="magnetic.onPointerMove"
      @pointerleave="magnetic.onPointerLeave"
    >
      生成推荐方案
    </el-button>
  </el-form>
</template>

<style scoped>
.scene-field-control {
  width: 100%;
}

.scene-field-error {
  margin-top: 4px;
  font-size: 12px;
  color: var(--el-color-danger);
}
</style>
