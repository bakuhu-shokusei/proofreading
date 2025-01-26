<template>
  <div v-if="pageDetail.layout" class="layout-boxes">
    <h3 class="file-name">
      {{ pageDetail.layout.jsonFileName }}
    </h3>
    <div ref="boxesContainer" class="boxes-area">
      <div
        v-for="(box, idx) in pageDetail.layout.boxesCopy"
        :key="genKey(box)"
        class="single-box"
        :class="{ selected: idx === pageDetail.layout.selectedIndex }"
        @click="proofreadingStore.selectBox(idx)"
        tabindex="0"
      >
        <p class="text-number">{{ idx + 1 }}</p>
        <Input v-model:value="box.text" class="box-input" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { Input } from 'ant-design-vue'
import { useProofreadingStore } from '../../store'
import { genKey } from '../../utils'

const proofreadingStore = useProofreadingStore()
const { pageDetail } = storeToRefs(proofreadingStore)

const boxesContainer = ref<HTMLDivElement>()

watch(
  () => pageDetail.value.layout?.selectedIndex,
  (index) => {
    if (typeof index !== 'number') return
    const selected =
      boxesContainer.value?.querySelectorAll('.single-box')[index]
    if (selected instanceof Element) {
      console.log(selected)
      selected.scrollIntoView({ behavior: 'smooth' })
      selected.querySelector('input')?.focus()
    }
  },
)
</script>

<style lang="scss" scoped>
h3 {
  margin: 0;
}

.layout-boxes {
  padding: 0 12px;
  display: flex;
  flex-direction: column;

  .boxes-area {
    flex: 1;
    overflow: auto;
    scrollbar-width: thin;
    margin-bottom: 12px;
    padding-bottom: 8px;
    display: flex;
    flex-direction: row-reverse;
    gap: 4px;
    .single-box {
      display: flex;
      flex-direction: column;
      background-color: #f0f0f0;
      border-radius: 6px;
      padding: 0 2px 1px 2px;
      .text-number {
        font-size: 12px;
        margin-bottom: 4px;
        padding-top: 4px;
        text-align: center;
        color: var(--text-secondary);
        cursor: pointer;
      }
      .box-input {
        height: 100%;
        padding: 4px 8px;
        writing-mode: vertical-rl;
      }
      &.selected {
        background-color: rgba(var(--primary-blue-rgb), 0.5);
        .text-number {
          font-weight: bold;
          color: var(--text-main);
        }
        .box-input {
          font-weight: bold;
        }
      }
    }
  }
}
</style>
