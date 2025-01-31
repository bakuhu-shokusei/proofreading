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
      :disabled="!hasUnsavedChanges"
      @click="resetChanges"
    >
      リセット
    </Button>
    <Button
      :icon="h(SaveOutlined)"
      type="primary"
      :disabled="!hasUnsavedChanges"
      @click="saveChanges"
    >
      保存
    </Button>

    <Modal
      v-model:open="notSavedWarning"
      title="確認"
      :footer="null"
      :style="{ fontFamily: 'var(--font-japanese)' }"
    >
      <div>
        {{
          [jsonChanged ? 'jsonファイル' : '', draftChanged ? 'txtファイル' : '']
            .filter(Boolean)
            .join('、')
        }}は変更されました。<b>保存</b>または<b>リセット</b>してください（右下のボタン）
      </div>
    </Modal>
  </div>
</template>

<script setup lang="ts">
import { h } from 'vue'
import { Pagination, Button, Modal } from 'ant-design-vue'
import { SaveOutlined } from '@ant-design/icons-vue'
import { useProofreadingStore } from '../../store'
import { storeToRefs } from 'pinia'

const proofreadingStore = useProofreadingStore()
const { updatePage, saveChanges, resetChanges } = proofreadingStore
const {
  totalPages,
  page,
  hasUnsavedChanges,
  jsonChanged,
  draftChanged,
  notSavedWarning,
} = storeToRefs(proofreadingStore)

const onPageChange = (page: number) => {
  if (!hasUnsavedChanges.value) {
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
