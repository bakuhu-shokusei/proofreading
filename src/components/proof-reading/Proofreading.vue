<template>
  <div class="full-height-content">
    <div v-if="!pageDetail.ready" class="loading">
      <Spin size="large" />
    </div>
    <div v-else class="content">
      <div class="left-right">
        <Image />
        <div class="divider" @mousedown="mouseDown"><div class="inner" /></div>
        <Text />
      </div>
      <Controls />
    </div>
  </div>
</template>

<script setup lang="ts">
import { useStorage } from '@vueuse/core'
import { storeToRefs } from 'pinia'
import { Spin } from 'ant-design-vue'
import { useProofreadingStore } from '../../store'
import Image from './Image.vue'
import Text from './Text.vue'
import Controls from './Controls.vue'

const proofreadingStore = useProofreadingStore()
const { pageDetail } = storeToRefs(proofreadingStore)

const imageWidthPercentage = useStorage('proofreading-image-width', '50%')

const mouseDown = (e: MouseEvent) => {
  const prev = e.clientX
  const imageWidth = document.querySelector('.image-container')?.clientWidth
  const containerWidth = document.querySelector('.left-right')?.clientWidth
  if (!imageWidth || !containerWidth) return
  function onMove(e: MouseEvent) {
    const clientX = e.clientX
    const delta = clientX - prev
    imageWidthPercentage.value =
      (((imageWidth! + delta) / containerWidth!) * 100).toFixed(2) + '%'
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
.loading {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
}

.content {
  height: 100%;
  display: grid;
  grid-template-columns: 1fr;
  grid-template-rows: minmax(0, 1fr) auto;
  .left-right {
    flex: 1;
    display: flex;
    :deep(.image-container) {
      width: v-bind(imageWidthPercentage);
    }
    :deep(.text-container) {
      flex: 1;
    }
    .divider {
      cursor: col-resize;
      padding: 0 2px;
      .inner {
        border-left: 1px solid rgba(5, 5, 5, 0.06);
        height: 100%;
      }
    }
  }
}
</style>
