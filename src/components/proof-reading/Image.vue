<template>
  <div class="image-container">
    <h3 class="file-name">{{ pageDetail.imageFileName }}</h3>
    <div class="img-container" @mousedown="mouseDown">
      <img
        :src="pageDetail.imageUrl"
        :style="{ width: `${Math.round(100 * zoomLevel)}%` }"
      />
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
import { useStorage } from '@vueuse/core'
import { Slider } from 'ant-design-vue'
import { storeToRefs } from 'pinia'
import { useProofreadingStore } from '../../store'

const proofreadingStore = useProofreadingStore()
const { pageDetail } = storeToRefs(proofreadingStore)

const zoomLevel = useStorage('image-zoom-level', 1)

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
  }
}
</style>
