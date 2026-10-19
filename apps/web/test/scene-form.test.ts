import { mount } from '@vue/test-utils'
import { ElCheckboxGroup, ElInput, ElInputNumber, ElSelect } from 'element-plus'
import { describe, expect, it } from 'vitest'

import { FIELD_REGISTRY, SCHEMA_VERSION, SceneInputSchema } from '@road-rec/contracts'
import type { SceneInput } from '@road-rec/contracts'
import SceneForm from '@/components/SceneForm.vue'

const registryEntries = Object.entries(FIELD_REGISTRY)

function submitPayload(wrapper: ReturnType<typeof mount>): SceneInput {
  const emitted = wrapper.emitted('submit')
  expect(emitted).toBeTruthy()
  return emitted?.[0]?.[0] as SceneInput
}

/** 填齐必填项：PG高/低温、ESAL（万次）、预算、工期 + 勾选一个病害。 */
async function fillRequired(wrapper: ReturnType<typeof mount>): Promise<void> {
  const setNumber = async (path: string, value: string) => {
    const input = wrapper.find(`[data-testid="field-${path}"] input`)
    expect(input.exists(), `缺少输入 ${path}`).toBe(true)
    await input.setValue(value)
  }
  await setNumber('climate.pgHigh', '76')
  await setNumber('climate.pgLow', '-22')
  await setNumber('traffic.esal', '3000')
  await setNumber('constraints.budget', '500')
  await setNumber('constraints.schedule', '30')
  const distress = wrapper.find('[data-testid="field-distresses"] input[type="checkbox"]')
  await distress.setValue(true)
}

/** 与 backend 新 registry 值域一致的案例场景（P1）。 */
const caseScene: SceneInput = {
  schemaVersion: '1',
  climate: { zone: '1-4 华南湿热区', pgHigh: 76, pgLow: -10 },
  traffic: { level: 'heavy', esal: 30000000 },
  pavement: { layer: 'surface', structure: '半刚性基层沥青路面' },
  distresses: [
    { type: 'rutting', severity: 'severe' },
    { type: 'shoving', severity: 'moderate' },
  ],
  constraints: { budget: 500, schedule: 30, env: 'normal', noise: 'none' },
  notes: '',
}

describe('SceneForm（schema 驱动）', () => {
  it('为 FIELD_REGISTRY 每个路径渲染一个带中文标签的控件', () => {
    const wrapper = mount(SceneForm)

    for (const [path, def] of registryEntries) {
      const item = wrapper.find(`[data-testid="field-${path}"]`)
      expect(item.exists(), `缺少注册表字段控件: ${path}`).toBe(true)
      expect(item.text(), `字段 ${path} 缺少中文标签`).toContain(def.label)
    }
  })

  it('按注册表 control 类型分派对应控件', () => {
    const wrapper = mount(SceneForm)

    for (const [path, def] of registryEntries) {
      const item = wrapper.find(`[data-testid="field-${path}"]`)
      switch (def.control) {
        case 'select':
          expect(item.findComponent(ElSelect).exists(), `字段 ${path} 应为 select`).toBe(true)
          break
        case 'number':
          expect(item.findComponent(ElInputNumber).exists(), `字段 ${path} 应为 number`).toBe(
            true,
          )
          break
        case 'text':
          expect(item.findComponent(ElInput).exists(), `字段 ${path} 应为 text`).toBe(true)
          break
        case 'textarea':
          expect(item.findComponent(ElInput).exists(), `字段 ${path} 应为 textarea`).toBe(true)
          break
        case 'checkbox':
          expect(
            item.findComponent(ElCheckboxGroup).exists(),
            `字段 ${path} 应为 checkbox`,
          ).toBe(true)
          break
      }
    }
  })

  it('P1 空表单拦截：未填必填项不提交并渲染 6 处内联错误', async () => {
    const wrapper = mount(SceneForm)

    await wrapper.find('[data-testid="scene-form-submit"]').trigger('click')

    expect(wrapper.emitted('submit')).toBeFalsy()
    const errors = wrapper.findAll('[data-testid="field-error"]')
    expect(errors.length).toBe(6)
    for (const e of errors) {
      expect(e.text()).toMatch(/必填|至少/)
    }
  })

  it('P1 填齐必填后提交：payload 解析通过且 ESAL 按万次换算', async () => {
    const wrapper = mount(SceneForm)
    await fillRequired(wrapper)

    await wrapper.find('[data-testid="scene-form-submit"]').trigger('click')

    const payload = submitPayload(wrapper)
    const parsed = SceneInputSchema.safeParse(payload)
    expect(parsed.success, parsed.success ? '' : JSON.stringify(parsed.error.issues)).toBe(true)
    expect(payload.schemaVersion).toBe(SCHEMA_VERSION)
    expect(payload.traffic.esal).toBe(3000 * 1e4) // 输入 3000（万次）→ 30000000
  })

  it('P1 案例回填：复选框实际勾选、zone/env/noise 显示中文 label、ESAL 反向换算', async () => {
    const wrapper = mount(SceneForm, { props: { initialScene: caseScene } })
    await wrapper.vm.$nextTick()

    // 复选框 DOM 勾选断言（rutting/shoving 为 checked）
    const rutting = wrapper.find(
      '[data-testid="field-distresses"] input[type="checkbox"][value="rutting"]',
    )
    const shoving = wrapper.find(
      '[data-testid="field-distresses"] input[type="checkbox"][value="shoving"]',
    )
    expect((rutting.element as HTMLInputElement).checked).toBe(true)
    expect((shoving.element as HTMLInputElement).checked).toBe(true)

    // zone/env/noise 显示中文 label
    expect(wrapper.find('[data-testid="field-climate.zone"]').text()).toContain('1-4 华南湿热区')
    expect(wrapper.find('[data-testid="field-constraints.env"]').text()).toContain('标准')
    expect(wrapper.find('[data-testid="field-constraints.noise"]').text()).toContain('无要求')

    // ESAL 反向换算：30000000 → 显示 3000
    const esalInput = wrapper
      .find('[data-testid="field-traffic.esal"] input')
      .element as HTMLInputElement
    expect(esalInput.value).toBe('3000')
  })

  it('案例回填：traffic.level 英文值渲染为注册表中文 label（R3-C5/F3）', async () => {
    const heavyOption = (FIELD_REGISTRY['traffic.level'].options ?? []).find(
      (o) => o.value === 'heavy',
    )
    const wrapper = mount(SceneForm, { props: { initialScene: caseScene } })
    await wrapper.vm.$nextTick()

    const trafficField = wrapper.find('[data-testid="field-traffic.level"]')
    expect(trafficField.text()).toContain(heavyOption?.label as string)
    expect(trafficField.text()).not.toContain('heavy')
  })

  it('案例回填：pavement.layer 英文值渲染为注册表中文 label（R25）', async () => {
    const surfaceOption = (FIELD_REGISTRY['pavement.layer'].options ?? []).find(
      (o) => o.value === 'surface',
    )
    const wrapper = mount(SceneForm, { props: { initialScene: caseScene } })
    await wrapper.vm.$nextTick()

    const layerField = wrapper.find('[data-testid="field-pavement.layer"]')
    expect(layerField.text()).toContain(surfaceOption?.label as string)
    expect(layerField.text()).not.toContain('surface')
  })

  it('勾选病害后 distresses 按 {type, severity} 数组提交', async () => {
    const wrapper = mount(SceneForm)
    await fillRequired(wrapper)

    await wrapper.find('[data-testid="scene-form-submit"]').trigger('click')

    const payload = submitPayload(wrapper)
    const parsed = SceneInputSchema.safeParse(payload)
    expect(parsed.success).toBe(true)
    expect(payload.distresses).toContainEqual({
      type: FIELD_REGISTRY.distresses.options?.[0]?.value,
      severity: '中',
    })
  })

  it('Ctrl/⌘+Enter 提交表单，普通 Enter 不提交（UI二轮键盘）', { timeout: 20000 }, async () => {
    const wrapper = mount(SceneForm)
    await fillRequired(wrapper)
    const form = wrapper.find('form')

    await form.trigger('keydown', { key: 'Enter', ctrlKey: true })
    expect(wrapper.emitted('submit')).toBeTruthy()

    const wrapper2 = mount(SceneForm)
    await wrapper2.find('form').trigger('keydown', { key: 'Enter' })
    expect(wrapper2.emitted('submit')).toBeFalsy()

    const wrapper3 = mount(SceneForm)
    await fillRequired(wrapper3)
    await wrapper3.find('form').trigger('keydown', { key: 'Enter', metaKey: true })
    expect(wrapper3.emitted('submit')).toBeTruthy()
  })

  it('灵动层：提交按钮 pressable/ripple-host + 点击涟漪插入与移除（微动效）', async () => {
    const wrapper = mount(SceneForm)
    const btn = wrapper.find('[data-testid="scene-form-submit"]')
    expect(btn.classes()).toContain('pressable')
    expect(btn.classes()).toContain('ripple-host')

    await btn.trigger('click')
    const span = btn.element.querySelector('.ripple') as HTMLElement | null
    expect(span).toBeTruthy()

    span?.dispatchEvent(new Event('animationend'))
    expect(btn.element.querySelector('.ripple')).toBeNull()
  })
})
