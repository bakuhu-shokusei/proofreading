<template>
  <div class="controls">
    <Pagination
      :current="page"
      :total="totalPages"
      :default-page-size="1"
      :show-size-changer="false"
      show-quick-jumper
      @change="onPageChange($event)"
    />
    <Button
      :style="{ marginLeft: 'auto', marginRight: '8px' }"
      :disabled="!draftChanged"
      @click="resetDraft"
    >
      重置
    </Button>
    <Button type="primary" :disabled="!draftChanged" @click="saveChanges">
      保存修改
    </Button>

    <Modal
      v-model:open="notSavedWarning"
      title="请确认"
      :footer="null"
      :style="{ fontFamily: 'var(--font-chinese)' }"
    >
      <div>
        txt文件内容已修改，请<b>保存修改</b>或者<b>重置</b>（右下方的按钮）
      </div>
    </Modal>
  </div>
</template>

<script setup lang="ts">
import { Pagination, Button, Modal } from 'ant-design-vue'
import { useProofreadingStore } from '../../store'
import { storeToRefs } from 'pinia'

const proofreadingStore = useProofreadingStore()
const { updatePage, saveChanges, resetDraft } = proofreadingStore
const { totalPages, page, draftChanged, notSavedWarning } =
  storeToRefs(proofreadingStore)

const onPageChange = (page: number) => {
  if (!draftChanged.value) {
    updatePage(page)
    return
  } else {
    notSavedWarning.value = true
  }
}
</script>

<style lang="scss" scoped>
.controls {
  padding: 12px;
  border-top: 1px solid rgba(5, 5, 5, 0.06);
  display: flex;
  align-items: center;
}
</style>
