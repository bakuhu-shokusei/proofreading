<template>
  <div class="image-container">
    <h3 class="file-name">{{ pageDetail.imageFileName }}</h3>
    <div ref="imgContainer" class="img-container" @mousedown="mouseDown">
      <img :src="pageDetail.imageUrl" :style="imgStyle" />
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
import { ref, computed } from 'vue'
import { useStorage, useResizeObserver } from '@vueuse/core'
import { Slider } from 'ant-design-vue'
import { storeToRefs } from 'pinia'
import { useProofreadingStore } from '../../store'

const proofreadingStore = useProofreadingStore()
const { pageDetail } = storeToRefs(proofreadingStore)

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
</script>

<style lang="scss" scoped>
h3 {
  margin: 0;
}

.image-container {
  margin: 0 12px;
  display: flex;
  flex-direction: column;

  .file-name {
    font-size: 12px;
    line-height: 16px;
    color: var(--text-secondary);
    margin: 12px 0;
    text-overflow: ellipsis;
    overflow: hidden;
    white-space: nowrap;
  }
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
  }
}
</style>
