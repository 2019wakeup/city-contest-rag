<script setup lang="ts">
import { computed } from 'vue'

import { parseRichText, TABLE_ROW_LIMIT } from '@/utils/richText'
import type { Block, TableCell } from '@/utils/richText'

const props = defineProps<{ text: string }>()

const blocks = computed(() => parseRichText(props.text ?? ''))

const headerRowsOf = (block: Block): TableCell[][] => block.table?.header ?? []
const bodyRowsOf = (block: Block): TableCell[][] => block.table?.rows ?? []
const visibleRows = (rows: TableCell[][]): TableCell[][] => rows.slice(0, TABLE_ROW_LIMIT)
const totalRowsOf = (block: Block): number => block.table?.totalRows ?? 0
const colCountOf = (block: Block): number =>
  Math.max(1, ...headerRowsOf(block).map((r) => r.length))
</script>

<template>
  <div class="evidence-content">
    <template v-for="(block, bi) in blocks" :key="bi">
      <h3 v-if="block.type === 'heading' && block.level === 3" class="ec-heading ec-h3">
        {{ block.text }}
      </h3>
      <h4 v-else-if="block.type === 'heading'" class="ec-heading ec-h4">
        {{ block.text }}
      </h4>
      <ul v-else-if="block.type === 'list'" class="ec-list">
        <li v-for="(item, li) in block.items ?? []" :key="li">{{ item }}</li>
      </ul>
      <div v-else-if="block.type === 'table' && block.table" class="evidence-table-wrap">
        <table class="evidence-table" data-testid="evidence-table">
          <thead v-if="headerRowsOf(block).length > 0">
            <tr v-for="(row, ri) in headerRowsOf(block)" :key="ri">
              <th
                v-for="(cell, ci) in row"
                :key="ci"
                :colspan="cell.colspan"
                :rowspan="cell.rowspan"
              >
                {{ cell.text }}
              </th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(row, ri) in visibleRows(bodyRowsOf(block))" :key="ri">
              <td
                v-for="(cell, ci) in row"
                :key="ci"
                :colspan="cell.colspan"
                :rowspan="cell.rowspan"
              >
                {{ cell.text }}
              </td>
            </tr>
            <tr v-if="totalRowsOf(block) > TABLE_ROW_LIMIT">
              <td :colspan="colCountOf(block)" class="evidence-table-more">
                …（共 {{ totalRowsOf(block) }} 行）
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <p v-else class="ec-para">{{ block.text }}</p>
    </template>
  </div>
</template>

<style scoped>
.evidence-content {
  margin: 10px 0 8px;
}

.ec-heading {
  margin: 8px 0 4px;
  font-size: 14px;
  font-weight: 600;
  color: var(--el-text-color-primary);
}

.ec-h3 {
  font-size: 15px;
}

.ec-list {
  margin: 4px 0 8px;
  padding-left: 20px;
  line-height: 1.7;
  color: var(--el-text-color-primary);
}

.ec-list li {
  margin: 4px 0;
}

.ec-para {
  margin: 0 0 8px;
  line-height: 1.7;
  color: var(--el-text-color-primary);
  white-space: pre-wrap;
}

/* 表格：el-table 风格原生样式（横向滚动/表头加深/斑马行/数字 tabular） */
.evidence-table-wrap {
  margin: 8px 0;
  overflow-x: auto;
  border: 1px solid var(--app-border);
  border-radius: var(--app-radius-inner);
}

.evidence-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;
  font-variant-numeric: tabular-nums;
}

.evidence-table th,
.evidence-table td {
  padding: 6px 10px;
  border-bottom: 1px solid var(--app-border);
  text-align: left;
  white-space: nowrap;
}

.evidence-table th {
  background: var(--el-fill-color-light);
  font-weight: 600;
}

.evidence-table tbody tr:nth-child(even) {
  background: var(--el-fill-color-lighter, rgba(255, 255, 255, 0.02));
}

.evidence-table-more {
  text-align: center;
  color: var(--el-text-color-secondary);
}
</style>
