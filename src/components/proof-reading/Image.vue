<template>
  <div class="image-container">
    <h3 class="file-name">{{ pageDetail.imageFileName }}</h3>
    <div ref="imgContainer" class="img-container" @mousedown="mouseDown">
      <img ref="imgRef" :src="pageDetail.imageUrl" :style="imgStyle" />
      <div
        v-for="({ box, style }, idx) in boxesStyle"
        :key="genKey(box)"
        :style="style"
        class="layout-box"
        :class="{ selected: idx === currentEditStatus?.selectedIndex }"
        @click="proofreadingStore.selectBox(idx)"
      >
        <p class="box-number">{{ idx + 1 }}</p>
      </div>
    </div>
    <div class="controls">
      <div class="controls-text">放大</div>
      <Slider
        v-model:value="zoomLevel"
        :min="1"
        :max="5"
        :step="0.5"
        :style="{ maxWidth: '220px', flex: 1, margin: '0 16px' }"
        :tooltip-open="false"
      />
      <div class="controls-text">{{ zoomLevel }}倍</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { CSSProperties } from 'vue'
import { ref, computed, watch } from 'vue'
import { useStorage, useResizeObserver, useElementSize } from '@vueuse/core'
import { Slider } from 'ant-design-vue'
import { storeToRefs } from 'pinia'
import { useProofreadingStore } from '../../store'
import { genKey, type Box } from '../../utils'

const proofreadingStore = useProofreadingStore()
const { pageDetail, currentEditStatus } = storeToRefs(proofreadingStore)

const fitWidthOrHeight = ref<'width' | 'height'>()
const imgContainer = ref<HTMLDivElement>()
useResizeObserver(imgContainer, (entries) => {
  const entry = entries[0]
  const { width: w0, height: h0 } = entry.contentRect
  const ratioContainer = h0 / w0

  const img = imgContainer.value?.querySelector('img')
  if (!img) return
  const ratioImg = img.height / img.width

  fitWidthOrHeight.value = ratioContainer > ratioImg ? 'width' : 'height'
})
const imgRef = ref<HTMLImageElement>()
const imgSize = useElementSize(imgRef)

const zoomLevel = useStorage('image-zoom-level', 1)
const imgStyle = computed<CSSProperties>(() => {
  const length = `${Math.round(100 * zoomLevel.value)}%`
  if (fitWidthOrHeight.value === 'width') {
    return { width: length }
  }
  if (fitWidthOrHeight.value === 'height') {
    return { height: length }
  }
  return {}
})
const boxesStyle = computed<{ box: Box; style: CSSProperties }[]>(() => {
  const width = imgSize.width.value
  const height = imgSize.height.value
  return (currentEditStatus.value?.boxes || []).map((box) => {
    return {
      box,
      style: {
        left: Math.round(width * box.xmin) + 'px',
        top: Math.round(height * box.ymin) + 'px',
        width: Math.round(width * (box.xmax - box.xmin)) + 'px',
        height: Math.round(height * (box.ymax - box.ymin)) + 'px',
      },
    }
  })
})

const mouseDown = (e: MouseEvent) => {
  e.preventDefault()
  const container = e.currentTarget as HTMLElement
  if (!container) return
  const [scrollLeft, scrollTop] = [container.scrollLeft, container.scrollTop]
  const [prevX, prevY] = [e.clientX, e.clientY]
  function onMove(e: MouseEvent) {
    const [clientX, clientY] = [e.clientX, e.clientY]
    const deltaX = clientX - prevX
    const deltaY = clientY - prevY
    container.scrollLeft = scrollLeft - deltaX
    container.scrollTop = scrollTop - deltaY
  }
  function onEnd() {
    document.removeEventListener('mousemove', onMove)
    document.removeEventListener('mouseup', onEnd)
  }
  document.addEventListener('mousemove', onMove)
  document.addEventListener('mouseup', onEnd)
}

watch(
  () => currentEditStatus.value?.selectedIndex,
  (index) => {
    if (typeof index !== 'number') return
    const selected = imgContainer.value?.querySelectorAll('.layout-box')[index]
    if (selected instanceof Element) {
      selected.scrollIntoView({ behavior: 'smooth' })
    }
  },
)
</script>

<style lang="scss" scoped>
h3,
p {
  margin: 0;
}

.image-container {
  padding: 0 12px;
  display: flex;
  flex-direction: column;

  .controls {
    display: flex;
    align-items: center;
    padding: 8px 0;
    .controls-text {
      color: var(--text-main);
      font-family: var(--font-chinese);
      font-size: 12px;
      line-height: 16px;
    }
  }
  .img-container {
    flex: 1;
    overflow: auto;
    cursor: grab;
    scrollbar-width: thin;
    position: relative;
    & > img {
      position: absolute;
      top: 0;
      left: 0;
    }
    .layout-box {
      position: absolute;
      border: 2px solid rgba(var(--primary-blue-rgb), 0.3);
      &.selected {
        border-color: rgba(var(--primary-blue-rgb), 1);
        background-color: rgba(var(--primary-blue-rgb), 0.1);
      }
      .box-number {
        position: absolute;
        width: 100%;
        bottom: 100%;
        text-align: center;
        color: rgba(var(--primary-blue-rgb), 0.6);
        font-size: 12px;
      }
    }
  }
}
</style>
