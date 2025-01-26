<template>
  <div v-if="pageDetail.layout" class="layout-boxes">
    <h3 class="file-name">
      {{ pageDetail.layout.jsonFileName }}
    </h3>
    <div ref="boxesContainer" class="boxes-area">
      <Draggable
        :model-value="reversedList"
        :item-key="genKey"
        direction="horizontal"
        handle=".text-number"
        :animation="150"
        @change="proofreadingStore.dragBox($event)"
      >
        <template #item="{ element }">
          <div
            class="single-box"
            :class="{
              selected: element.index === pageDetail.layout.selectedIndex,
            }"
            @click="proofreadingStore.selectBox(element.index)"
            :data-box-index="element.index"
            tabindex="0"
          >
            <p class="text-number">{{ element.index + 1 }}</p>
            <Input v-model:value="element.text" class="box-input" />
          </div>
        </template>
      </Draggable>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import Draggable from 'vuedraggable'
import { storeToRefs } from 'pinia'
import { Input } from 'ant-design-vue'
import { useProofreadingStore } from '../../store'
import { genKey } from '../../utils'

const proofreadingStore = useProofreadingStore()
const { pageDetail, currentBoxes } = storeToRefs(proofreadingStore)

const boxesContainer = ref<HTMLDivElement>()

watch(
  () => pageDetail.value.layout?.selectedIndex,
  (index) => {
    if (typeof index !== 'number') return
    const selected = boxesContainer.value?.querySelector(
      `.single-box[data-box-index="${index}"]`,
    )
    if (selected instanceof Element) {
      selected.scrollIntoView({ behavior: 'smooth' })
      selected.querySelector('input')?.focus()
    }
  },
)

const reversedList = computed(() => {
  return currentBoxes.value.map((i, index) => ({ ...i, index })).reverse()
})
</script>

<style lang="scss" scoped>
h3 {
  margin: 0;
}

.layout-boxes {
  padding: 0 12px;
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  grid-template-rows: auto minmax(0, 1fr);

  .boxes-area {
    /* this div is created by sortable */
    & > div {
      height: 100%;
      overflow: auto;
      scrollbar-width: thin;
      margin-bottom: 12px;
      padding-bottom: 8px;
      display: flex;
      gap: 8px;
      .single-box {
        background-color: #f0f0f0;
        border-radius: 6px;
        padding: 0 2px 1px 2px;
        display: grid;
        grid-template-columns: max-content;
        grid-template-rows: auto minmax(0, 1fr);
        .text-number {
          font-size: 12px;
          margin-bottom: 4px;
          padding-top: 4px;
          text-align: center;
          color: var(--text-secondary);
          cursor: pointer;
          user-select: none;
        }
        .box-input {
          flex: 1;
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
}
</style>
