import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'

import EvidenceContent from '@/components/EvidenceContent.vue'
import { parseRichText } from '@/utils/richText'

describe('parseRichText 富文本块解析（UI7）', () => {
  it('HTML 表格：colspan 解析（含表头）', () => {
    const html =
      '<p>说明文字</p><table><tr><th colspan="2">合并表头</th></tr><tr><td>A</td><td>B</td></tr></table>'
    const blocks = parseRichText(html)
    const table = blocks.find((b) => b.type === 'table')
    expect(table).toBeTruthy()
    expect(table?.table?.header[0]?.[0]).toMatchObject({ text: '合并表头', colspan: 2 })
    expect(table?.table?.rows[0]).toMatchObject([{ text: 'A' }, { text: 'B' }])
  })

  it('markdown 表格：表头与单元格 trim', () => {
    const blocks = parseRichText('| 指标 | 值 |\n| --- | --- |\n| 高温 | 82 |')
    const table = blocks.find((b) => b.type === 'table')
    expect(table?.table?.header[0]).toMatchObject([{ text: '指标' }, { text: '值' }])
    expect(table?.table?.rows[0]).toMatchObject([{ text: '高温' }, { text: '82' }])
  })

  it('## 标题 → heading 块（级别 h3），### → h4', () => {
    const blocks = parseRichText('## 4.2 配方对比\n正文。')
    expect(blocks[0]).toMatchObject({ type: 'heading', level: 3, text: '4.2 配方对比' })
    expect(parseRichText('### 小节')[0]).toMatchObject({ type: 'heading', level: 4 })
  })

  it('- / · / 1. 列表 → list 块且去前缀', () => {
    const blocks = parseRichText('- 第一项\n· 第二项\n1. 第三项')
    expect(blocks[0]).toMatchObject({ type: 'list', items: ['第一项', '第二项', '第三项'] })
  })

  it('HTML 实体解码（&lt; &gt; &amp; &nbsp;）', () => {
    const blocks = parseRichText('掺量 4.5 &lt; 6 &amp;&amp; &nbsp;达标')
    expect(blocks[0].text).toBe('掺量 4.5 < 6 &&  达标')
  })

  it('script 被剥离、on* 属性去除', () => {
    const blocks = parseRichText('<p onclick="x()">安全<script>alert(1)</script>文本</p>')
    const text = blocks.map((b) => b.text).join(' ')
    expect(text).not.toContain('alert')
    expect(text).not.toContain('script')
    expect(text).toContain('安全')
  })
})

describe('EvidenceContent 块渲染（UI7）', () => {
  it('markdown 表格渲染出 table.evidence-table 标签', () => {
    const wrapper = mount(EvidenceContent, {
      props: { text: '| 指标 | 值 |\n| --- | --- |\n| 高温 | 82 |' },
    })
    const table = wrapper.find('table.evidence-table')
    expect(table.exists()).toBe(true)
    expect(table.find('thead').text()).toContain('指标')
  })

  it('HTML colspan 表格渲染 th[colspan] 属性', () => {
    const wrapper = mount(EvidenceContent, {
      props: {
        text: '<table><tr><th colspan="2">合并</th></tr><tr><td>A</td><td>B</td></tr></table>',
      },
    })
    const th = wrapper.find('table.evidence-table thead th')
    expect(th.attributes('colspan')).toBe('2')
  })
})
