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

  it('提交事件 payload 可通过 SceneInputSchema 解析且带 schemaVersion', async () => {
    const wrapper = mount(SceneForm)

    await wrapper.find('[data-testid="scene-form-submit"]').trigger('click')

    const payload = submitPayload(wrapper)
    const parsed = SceneInputSchema.safeParse(payload)
    expect(
      parsed.success,
      parsed.success ? '' : JSON.stringify(parsed.error.issues),
    ).toBe(true)
    expect(payload.schemaVersion).toBe(SCHEMA_VERSION)
  })

  it('案例回填：traffic.level 英文值渲染为注册表中文 label（R3-C5/F3）', async () => {
    const trafficOptions = FIELD_REGISTRY['traffic.level'].options ?? []
    const heavyOption = trafficOptions.find((o) => o.value === 'heavy')
    expect(heavyOption).toBeTruthy()

    const caseScene: SceneInput = {
      schemaVersion: '1',
      climate: { zone: '华南高温区', pgHigh: 76, pgLow: -22 },
      traffic: { level: 'heavy', esal: 30000000 },
      pavement: { layer: '上面层', structure: '半刚性基层沥青路面' },
      distresses: [{ type: '车辙', severity: '中' }],
      constraints: { budget: 500, schedule: 30, env: '环保要求高', noise: '低噪' },
      notes: '',
    }
    const wrapper = mount(SceneForm, { props: { initialScene: caseScene } })
    await wrapper.vm.$nextTick()

    const trafficField = wrapper.find('[data-testid="field-traffic.level"]')
    expect(trafficField.text()).toContain(heavyOption?.label as string)
    expect(trafficField.text()).not.toContain('heavy')
  })

  it('案例回填：pavement.layer 英文值渲染为注册表中文 label（R25）', async () => {
    const layerOptions = FIELD_REGISTRY['pavement.layer'].options ?? []
    const surfaceOption = layerOptions.find((o) => o.value === 'surface')
    const binderOption = layerOptions.find((o) => o.value === 'binder')
    expect(surfaceOption).toBeTruthy()
    expect(binderOption).toBeTruthy()

    const caseScene: SceneInput = {
      schemaVersion: '1',
      climate: { zone: '华南高温区', pgHigh: 76, pgLow: -22 },
      traffic: { level: 'heavy', esal: 20000000 },
      pavement: { layer: 'surface', structure: '半刚性基层沥青路面' },
      distresses: [{ type: '车辙', severity: '中' }],
      constraints: { budget: 500, schedule: 30, env: '环保要求高', noise: '低噪' },
      notes: '',
    }
    const wrapper = mount(SceneForm, { props: { initialScene: caseScene } })
    await wrapper.vm.$nextTick()

    const layerField = wrapper.find('[data-testid="field-pavement.layer"]')
    expect(layerField.text()).toContain(surfaceOption?.label as string)
    expect(layerField.text()).not.toContain('surface')
  })

  it('勾选病害后 distresses 按 {type, severity} 数组提交', async () => {
    const wrapper = mount(SceneForm)
    const distressOptions = FIELD_REGISTRY.distresses.options ?? []
    expect(distressOptions.length).toBeGreaterThan(0)

    const checkbox = wrapper.find(
      '[data-testid="field-distresses"] input[type="checkbox"]',
    )
    expect(checkbox.exists()).toBe(true)
    await checkbox.setValue(true)

    await wrapper.find('[data-testid="scene-form-submit"]').trigger('click')

    const payload = submitPayload(wrapper)
    const parsed = SceneInputSchema.safeParse(payload)
    expect(parsed.success).toBe(true)
    expect(payload.distresses).toContainEqual({
      type: distressOptions[0]?.value,
      severity: '中',
    })
  })

  it('Ctrl/⌘+Enter 提交表单，普通 Enter 不提交（UI二轮键盘）', async () => {
    const wrapper = mount(SceneForm)
    const form = wrapper.find('form')

    await form.trigger('keydown', { key: 'Enter', ctrlKey: true })
    expect(wrapper.emitted('submit')).toBeTruthy()

    const wrapper2 = mount(SceneForm)
    await wrapper2.find('form').trigger('keydown', { key: 'Enter' })
    expect(wrapper2.emitted('submit')).toBeFalsy()

    const wrapper3 = mount(SceneForm)
    await wrapper3.find('form').trigger('keydown', { key: 'Enter', metaKey: true })
    expect(wrapper3.emitted('submit')).toBeTruthy()
  })
})
