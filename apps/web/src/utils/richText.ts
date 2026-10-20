/**
 * 富文本解析（UI7）：HTML 片段（<table 等，DOMParser + 白名单净化）与
 * markdown 子集（## 标题、- / · / 1. 列表、| --- | 表格）→ 块级结构。
 * 不引入新依赖；仅输出结构化数据，渲染交给 EvidenceContent。
 */

export interface TableCell {
  text: string
  colspan?: number
  rowspan?: number
}

export interface TableBlockData {
  header: TableCell[][]
  rows: TableCell[][]
  totalRows: number
}

export type BlockType = 'heading' | 'list' | 'table' | 'paragraph'

export interface Block {
  type: BlockType
  level?: number
  text?: string
  items?: string[]
  table?: TableBlockData
}

const TABLE_ROW_LIMIT = 8

/** 解码常用 HTML 实体（markdown 路径；HTML 路径由 DOMParser 解码）。 */
export function decodeEntities(text: string): string {
  return text
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&')
    .replace(/&nbsp;/g, ' ')
}

const ALLOWED_TAGS = new Set([
  'table', 'thead', 'tbody', 'tr', 'td', 'th', 'caption', 'p', 'ul', 'ol', 'li',
  'strong', 'em', 'b', 'i', 'u', 'br', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
  'sup', 'sub', 'code', 'span', 'div', 'blockquote',
])

const FORBIDDEN_TAGS = new Set(['script', 'style', 'iframe', 'object', 'embed', 'link', 'meta'])

/** 递归净化：剥掉禁用标签与其内容、非白名单标签（保留文本）、on* 属性与 href。 */
function sanitizeNode(node: Element): void {
  for (const child of Array.from(node.children)) {
    const tag = child.tagName.toLowerCase()
    if (FORBIDDEN_TAGS.has(tag)) {
      child.remove()
      continue
    }
    if (!ALLOWED_TAGS.has(tag)) {
      // 未知标签：解包保留文本节点
      const parent = child.parentNode
      while (child.firstChild) parent?.insertBefore(child.firstChild, child)
      child.remove()
      continue
    }
    for (const attr of Array.from(child.attributes)) {
      const name = attr.name.toLowerCase()
      if (name.startsWith('on') || name === 'href') child.removeAttribute(attr.name)
    }
    sanitizeNode(child)
  }
}

function cellText(cell: Element): string {
  return (cell.textContent ?? '').replace(/\s+/g, ' ').trim()
}

function rowOf(tr: Element): TableCell[] {
  return Array.from(tr.children)
    .filter((c) => c.tagName.toLowerCase() === 'td' || c.tagName.toLowerCase() === 'th')
    .map((c) => {
      const cell: TableCell = { text: cellText(c) }
      const colspan = Number(c.getAttribute('colspan'))
      const rowspan = Number(c.getAttribute('rowspan'))
      if (Number.isFinite(colspan) && colspan > 1) cell.colspan = colspan
      if (Number.isFinite(rowspan) && rowspan > 1) cell.rowspan = rowspan
      return cell
    })
}

/** HTML 片段（含 <table）→ 表格块（DOMParser + 白名单，支持 colspan/rowspan）。 */
function parseHtmlTable(html: string): TableBlockData | null {
  const doc = new DOMParser().parseFromString(html, 'text/html')
  const table = doc.querySelector('table')
  if (!table) return null
  sanitizeNode(table)
  const trs = Array.from(table.querySelectorAll('tr'))
  const rows = trs.map(rowOf)
  const firstRowHasTh = rows[0]?.some((_, i) =>
    Array.from(table.querySelectorAll('tr')[0]?.children ?? []).some(
      (c) => c.tagName.toLowerCase() === 'th',
    ),
  )
  const header = firstRowHasTh ? [rows.shift() as TableCell[]] : []
  return { header, rows, totalRows: rows.length }
}

const MARKDOWN_SEP = /^\s*\|[\s:|-]+\|\s*$/

export function hasTableSyntax(text: string): boolean {
  const t = text ?? ''
  if (/<table[\s>]/i.test(t)) return true
  return t.split('\n').some((l) => MARKDOWN_SEP.test(l) && l.includes('-'))
}

function splitMdCells(line: string): string[] {
  return line
    .replace(/^\s*\|/, '')
    .replace(/\|\s*$/, '')
    .split('|')
    .map((c) => c.trim())
}

function parseMarkdownTable(lines: string[], sepIndex: number): TableBlockData {
  const header = sepIndex > 0 ? [splitMdCells(lines[sepIndex - 1]).map((text) => ({ text }))] : []
  const rows: TableCell[][] = []
  for (let i = sepIndex + 1; i < lines.length; i++) {
    const line = lines[i].trim()
    if (!line.startsWith('|')) break
    rows.push(splitMdCells(line).map((text) => ({ text })))
  }
  return { header, rows, totalRows: rows.length }
}

/** markdown 子集行（非表格部分）→ 块。 */
function parseTextLines(lines: string[]): Block[] {
  const blocks: Block[] = []
  let listItems: string[] | null = null
  let paragraphLines: string[] = []

  const flushList = (): void => {
    if (listItems && listItems.length > 0) {
      blocks.push({ type: 'list', items: listItems })
      listItems = null
    }
  }
  const flushParagraph = (): void => {
    if (paragraphLines.length > 0) {
      blocks.push({ type: 'paragraph', text: paragraphLines.join(' ') })
      paragraphLines = []
    }
  }

  for (const raw of lines) {
    const line = decodeEntities(raw).trim()
    if (!line) {
      flushList()
      flushParagraph()
      continue
    }
    const heading = line.match(/^(#{2,3})\s+(.*)$/)
    if (heading) {
      flushList()
      flushParagraph()
      blocks.push({
        type: 'heading',
        level: heading[1].length === 2 ? 3 : 4,
        text: heading[2].trim(),
      })
      continue
    }
    const list = line.match(/^(?:[-·•]|\d+\.)\s+(.*)$/)
    if (list) {
      flushParagraph()
      if (!listItems) listItems = []
      listItems.push(list[1].trim())
      continue
    }
    flushList()
    paragraphLines.push(line)
  }
  flushList()
  flushParagraph()
  return blocks
}

/** 无表格的 HTML 片段 → 净化后纯文本（剥离 script、on- 属性与未知标签）。 */
function sanitizeToText(fragment: string): string {
  const doc = new DOMParser().parseFromString(fragment, 'text/html')
  sanitizeNode(doc.body)
  return (doc.body.textContent ?? '').replace(/\s+/g, ' ').trim()
}

/** 主入口：富文本 → 块列表。 */
export function parseRichText(text: string): Block[] {
  const source = text ?? ''
  const blocks: Block[] = []
  const htmlTables = /<table[\s\S]*?<\/table>/gi
  let last = 0
  let hasTableBlock = false
  for (const m of source.matchAll(htmlTables)) {
    const index = m.index ?? 0
    if (index > last) {
      const part = sanitizeToText(source.slice(last, index))
      blocks.push(...parseTextLines(part.split('\n')))
    }
    const table = parseHtmlTable(m[0])
    if (table) {
      blocks.push({ type: 'table', table })
      hasTableBlock = true
    }
    last = index + m[0].length
  }
  if (hasTableBlock) {
    if (last < source.length) {
      blocks.push(...parseTextLines(sanitizeToText(source.slice(last)).split('\n')))
    }
    return blocks.filter(
      (b) => b.type === 'table' || (b.text ?? '').trim() !== '' || (b.items?.length ?? 0) > 0,
    )
  }

  // 无 HTML 表格：含其他 HTML 标签时先净化，再走 markdown 子集
  const textToParse = /<[a-z][\s\S]*>/i.test(source) ? sanitizeToText(source) : source

  // 纯 markdown 子集路径
  const lines = textToParse.split('\n')
  const sepIndex = lines.findIndex((l) => MARKDOWN_SEP.test(l) && l.includes('-'))
  if (sepIndex >= 0) {
    if (sepIndex > 0) blocks.push(...parseTextLines(lines.slice(0, sepIndex)))
    blocks.push({ type: 'table', table: parseMarkdownTable(lines, sepIndex) })
    return blocks
  }
  return parseTextLines(lines)
}

export { TABLE_ROW_LIMIT }
