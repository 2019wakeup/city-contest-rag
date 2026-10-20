<script setup lang="ts">
import { nextTick, onBeforeUnmount, onMounted, shallowRef } from 'vue'

import type { RecommendationReport } from '@road-rec/contracts'
import ChatPanel from '@/components/ChatPanel.vue'

/**
 * 追问侧板（D）：三态 closed/open/docked + 拖拽改宽 + 右缘竖条。
 * open 一律走同一入场动画（挂载即播放：translateX(12px)+opacity 0→1，180ms cubic-bezier）。
 */
const props = defineProps<{ report: RecommendationReport | null }>()

type DockState = 'closed' | 'open' | 'docked'
const DOCK_MIN_WIDTH = 480
const DOCK_MAX_WIDTH = 960
const DOCK_DEFAULT_WIDTH = 680
const DOCK_STORAGE_KEY = 'chat-dock-width'

const dockState = shallowRef<DockState>('closed')
const dockWidth = shallowRef(readDockWidth())

function readDockWidth(): number {
  const saved = Number(localStorage.getItem(DOCK_STORAGE_KEY))
  return Number.isFinite(saved) && saved >= DOCK_MIN_WIDTH && saved <= DOCK_MAX_WIDTH
    ? saved
    : DOCK_DEFAULT_WIDTH
}

function persistDockWidth(width: number): void {
  localStorage.setItem(DOCK_STORAGE_KEY, String(width))
}

// P6：焦点归还——关闭/收起后回到触发按钮（FAB/竖条；按 testid 重新查询，
// 因为关闭后面板重渲染出新的触发元素，缓存旧元素会脱离文档无法聚焦）
let lastTriggerKind: 'fab' | 'rail' | null = null

function restoreFocus(): void {
  if (!lastTriggerKind) return
  document
    .querySelector<HTMLElement>(`[data-testid="chat-${lastTriggerKind}"]`)
    ?.focus()
}

function openDock(event: MouseEvent): void {
  const testid = (event.currentTarget as HTMLElement).dataset.testid
  lastTriggerKind = testid === 'chat-rail' ? 'rail' : 'fab'
  dockState.value = 'open'
}

function dockToRail(): void {
  dockState.value = 'docked'
  void nextTick().then(restoreFocus)
}

function closeDock(): void {
  dockState.value = 'closed'
  void nextTick().then(restoreFocus)
}

// 拖拽改宽（mousedown→mousemove clamp→mouseup 持久化；拖拽中 body 禁选中）
const dragging = shallowRef(false)
let dragStartX = 0
let dragStartWidth = DOCK_DEFAULT_WIDTH

function onDragStart(event: MouseEvent): void {
  dragging.value = true
  dragStartX = event.clientX
  dragStartWidth = dockWidth.value
  document.body.style.userSelect = 'none'
  window.addEventListener('mousemove', onDragMove)
  window.addEventListener('mouseup', onDragEnd)
}

function onDragMove(event: MouseEvent): void {
  if (!dragging.value) return
  const delta = dragStartX - event.clientX
  dockWidth.value = Math.min(DOCK_MAX_WIDTH, Math.max(DOCK_MIN_WIDTH, dragStartWidth + delta))
}

function onDragEnd(): void {
  dragging.value = false
  document.body.style.userSelect = ''
  persistDockWidth(dockWidth.value)
  window.removeEventListener('mousemove', onDragMove)
  window.removeEventListener('mouseup', onDragEnd)
}

// Esc：open → docked（阻止默认，父组件据此跳过候选卡收起）
function onKeydown(event: KeyboardEvent): void {
  if (event.key !== 'Escape') return
  if (dockState.value === 'open') {
    event.preventDefault()
    dockToRail()
  }
}

onMounted(() => window.addEventListener('keydown', onKeydown))
onBeforeUnmount(() => {
  window.removeEventListener('keydown', onKeydown)
  window.removeEventListener('mousemove', onDragMove)
  window.removeEventListener('mouseup', onDragEnd)
  document.body.style.userSelect = ''
})
</script>

<template>
  <!-- open：固定右侧面板 + 左缘拖拽柄 -->
  <div
    v-if="props.report && dockState === 'open'"
    class="chat-dock dock-enter"
    data-testid="chat-dock"
    role="dialog"
    aria-label="追问面板：基于当前报告的智能问答"
    :style="{ width: `${dockWidth}px` }"
  >
    <div
      class="chat-dock-handle"
      data-testid="chat-dock-handle"
      aria-label="拖拽调整宽度"
      @mousedown.prevent="onDragStart"
    ></div>
    <div class="chat-dock-head">
      <div>
        <div class="chat-dock-title">追问</div>
        <div class="chat-dock-subtitle">基于当前报告</div>
      </div>
      <div class="chat-dock-actions">
        <el-button text size="small" data-testid="chat-dock-dock" @click="dockToRail">
          收起
        </el-button>
        <el-button text size="small" data-testid="chat-dock-close" @click="closeDock">
          关闭
        </el-button>
      </div>
    </div>
    <ChatPanel :report="props.report" />
  </div>

  <!-- docked：右缘竖条，点击恢复 open（记忆宽度） -->
  <button
    v-else-if="props.report && dockState === 'docked'"
    type="button"
    class="chat-rail"
    data-testid="chat-rail"
    aria-label="展开追问面板"
    @click="openDock"
  >
    <svg
      class="chat-icon"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
    >
      <path
        d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"
      />
    </svg>
    <span class="chat-rail-text">追问</span>
  </button>

  <!-- closed：右下角悬浮胶囊 -->
  <button
    v-else-if="props.report"
    type="button"
    class="chat-fab"
    data-testid="chat-fab"
    aria-label="追问"
    @click="openDock"
  >
    <svg
      class="chat-icon"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
    >
      <path
        d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"
      />
    </svg>
    追问
  </button>
</template>

<style scoped>
.chat-dock {
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  z-index: 2000;
  height: fit-content;
  max-height: 78vh;
  margin: auto 0;
  border-radius: 16px 0 0 16px;
  display: flex;
  flex-direction: column;
  padding: 16px;
  background: color-mix(in srgb, var(--color-elevated) 72%, transparent);
  backdrop-filter: blur(14px) saturate(140%);
  -webkit-backdrop-filter: blur(14px) saturate(140%);
  border-left: 1px solid var(--app-hairline);
  box-shadow: -8px 0 24px rgba(0, 0, 0, 0.25);
}

/* D：统一入场动画（胶囊→open 与 竖条→open 同一动画，挂载即播放） */
.dock-enter {
  animation: dock-enter 0.18s cubic-bezier(0.2, 0, 0, 1) both;
}

@keyframes dock-enter {
  from {
    transform: translateX(12px);
    opacity: 0;
  }

  to {
    transform: translateX(0);
    opacity: 1;
  }
}

.chat-dock-handle {
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 6px;
  cursor: ew-resize;
  transition: background 0.15s ease;
}

.chat-dock-handle:hover {
  background: var(--el-color-primary);
}

.chat-dock-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-bottom: 12px;
  margin-bottom: 12px;
  border-bottom: 1px solid var(--app-border);
}

.chat-dock-title {
  font-size: 15px;
  font-weight: 600;
}

.chat-dock-subtitle {
  font-size: 12px;
  color: var(--el-text-color-secondary);
}

.chat-dock-actions {
  display: flex;
  gap: 4px;
}

.chat-rail {
  position: fixed;
  right: 0;
  top: 40%;
  transform: translateY(-50%);
  z-index: 2000;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  width: 44px;
  padding: 12px 0;
  border: 1px solid var(--app-border-strong);
  border-right: none;
  border-radius: 10px 0 0 10px;
  background: var(--el-bg-color-overlay, #161b24);
  color: var(--el-text-color-primary);
  cursor: pointer;
  box-shadow: -4px 0 16px rgba(0, 0, 0, 0.25);
  transition:
    width var(--motion-base) var(--ease-spring),
    transform var(--motion-base) var(--ease-spring),
    box-shadow var(--motion-base) var(--ease-out);
}

/* 灵动层：竖条 hover 宽度 44→52 + translateX(-2px) + 主色微光 */
.chat-rail:hover {
  width: 52px;
  transform: translateY(-50%) translateX(-2px);
  box-shadow:
    -8px 0 24px rgba(0, 0, 0, 0.35),
    0 0 16px var(--el-color-primary-light-7);
}

.chat-rail:active {
  transform: translateY(-50%) scale(0.96);
}

.chat-rail-text {
  font-size: 12px;
  writing-mode: vertical-rl;
  letter-spacing: 2px;
}

.chat-fab {
  position: fixed;
  right: 24px;
  bottom: 24px;
  z-index: 2000;
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 10px 18px;
  border: 1px solid var(--app-border-strong);
  border-radius: 999px;
  background: var(--el-bg-color-overlay, #161b24);
  color: var(--el-text-color-primary);
  font-size: 14px;
  cursor: pointer;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.35);
  transition:
    transform 0.15s ease,
    box-shadow 0.15s ease;
}

.chat-fab:hover {
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.45);
}

.chat-fab:active {
  transform: scale(0.96);
}

.chat-icon {
  width: 16px;
  height: 16px;
}
</style>
