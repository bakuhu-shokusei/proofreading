<template>
  <div class="text-container">
    <h3 class="file-name">{{ pageDetail.textFileName }}</h3>
    <Textarea
      class="text-content"
      :class="{ 'is-vertical': isVertical }"
      v-model:value="pageDetail.textContentCopy"
    />
    <div class="controls">
      <div class="controls-text">縦書き</div>
      <Switch v-model:checked="isVertical" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { useStorage } from '@vueuse/core'
import { storeToRefs } from 'pinia'
import { Textarea, Switch } from 'ant-design-vue'
import { useProofreadingStore } from '../../store'

const proofreadingStore = useProofreadingStore()
const { pageDetail } = storeToRefs(proofreadingStore)
const isVertical = useStorage('text-area-is-vertical', true)
</script>

<style lang="scss" scoped>
h3 {
  margin: 0;
}

.text-container {
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

  .text-content {
    flex: 1;
    resize: none;
    margin-bottom: 12px;
    &.is-vertical {
      writing-mode: vertical-rl;
    }
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
      margin-right: 8px;
    }
  }
}
</style>
