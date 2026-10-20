<script setup lang="ts">
import { computed, onMounted, shallowRef } from 'vue'
import { useRouter } from 'vue-router'

import { getCases } from '@/api/client'
import { useSpotlight } from '@/composables/useSpotlight'
import type { CaseSeed } from '@road-rec/contracts'

/** 案例画廊：5 张案例卡（图标+场景标签+hover 抬升/聚光），点击 → /recommend?case=xxx。 */
const router = useRouter()
const cases = shallowRef<CaseSeed[]>([])

const spotlight = useSpotlight()

const ICONS: Record<string, string> = {
  rutting: '辙',
  shoving: '拥',
  crack: '裂',
  water: '水',
  noise: '噪',
}

const iconOf = (seed: CaseSeed): string => {
  const first = seed.scene?.distresses?.[0]?.type ?? ''
  if (first.startsWith('transverse') || first.startsWith('longitudinal') || first.includes('crack')) return '裂'
  return ICONS[first] ?? '例'
}

const tagOf = (seed: CaseSeed): string[] => {
  const tags: string[] = []
  if (seed.scene?.climate?.zone) tags.push(seed.scene.climate.zone)
  const level = seed.scene?.traffic?.level
  if (level === 'heavy') tags.push('重交通')
  if (level === 'channelized') tags.push('渠化重载')
  return tags.slice(0, 2)
}

const gallery = computed(() => cases.value.slice(0, 5))

onMounted(async () => {
  try {
    cases.value = await getCases()
  } catch {
    cases.value = []
  }
})

function openCase(id: string): void {
  void router.push(`/recommend?case=${id}`)
}
</script>

<template>
  <section v-if="gallery.length > 0" class="home-gallery" data-testid="home-gallery">
    <h2 class="home-section-title">典型案例</h2>
    <div class="gallery-grid">
      <button
        v-for="c in gallery"
        :key="c.id"
        type="button"
        class="gallery-card spotlight-card hover-lift"
        data-testid="gallery-card"
        :aria-label="`载入案例：${c.title}`"
        @click="openCase(c.id)"
        @pointermove="spotlight.onPointerMove"
        @pointerleave="spotlight.onPointerLeave"
      >
        <span class="gallery-icon" aria-hidden="true">{{ iconOf(c) }}</span>
        <span class="gallery-body">
          <span class="gallery-title">{{ c.title }}</span>
          <span class="gallery-tags">
            <span v-for="tag in tagOf(c)" :key="tag" class="gallery-tag">{{ tag }}</span>
          </span>
        </span>
      </button>
    </div>
  </section>
</template>

<style scoped>
.home-gallery {
  margin-bottom: 32px;
}

.home-section-title {
  margin: 0 0 16px;
  font-size: 18px;
  font-weight: 600;
}

.gallery-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 12px;
}

.gallery-card {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px;
  border: 1px solid var(--app-border);
  border-radius: 12px;
  background: var(--app-panel-bg);
  color: inherit;
  font: inherit;
  text-align: left;
  cursor: pointer;
}

.gallery-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: 10px;
  background: var(--el-color-primary-light-9);
  color: var(--el-color-primary);
  font-size: 15px;
  font-weight: 700;
}

.gallery-body {
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 0;
}

.gallery-title {
  font-size: 14px;
  font-weight: 600;
}

.gallery-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

.gallery-tag {
  padding: 1px 6px;
  border-radius: 4px;
  background: var(--el-fill-color-light);
  color: var(--el-text-color-secondary);
  font-size: 11px;
}
</style>
