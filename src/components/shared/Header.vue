<template>
  <Menu
    :selectedKeys="current"
    mode="horizontal"
    :items="items"
    :style="menuStyle"
    @select="onSelect"
  />
</template>

<script lang="ts" setup>
import { h, computed } from 'vue'
import type { CSSProperties } from 'vue'
import {
  SearchOutlined,
  FileImageOutlined,
  FolderOpenFilled,
} from '@ant-design/icons-vue'
import { storeToRefs } from 'pinia'
import { Menu } from 'ant-design-vue'
import type { MenuProps } from 'ant-design-vue'
import { CurrentPage, useGlobalStore, useProofreadingStore } from '../../store'

const globalStore = useGlobalStore()
const { currentPage, proofreadingContent } = storeToRefs(globalStore)
const { updateCurrentPage } = globalStore

const proofreadingStore = useProofreadingStore()
const { initialize } = proofreadingStore
const { notSavedWarning, hasUnsavedChanges } = storeToRefs(proofreadingStore)

const items = computed<MenuProps['items']>(() => {
  return [
    {
      key: CurrentPage.Search,
      icon: () => h(SearchOutlined),
      label: '检索',
    },
    {
      key: CurrentPage.Proofreading,
      icon: () => h(FileImageOutlined),
      label: '校对',
      children: Object.keys(proofreadingContent.value || {}).map((i) => ({
        key: i,
        label: i,
      })),
    },
    {
      key: CurrentPage.FileList,
      icon: () => h(FolderOpenFilled),
      label: '文件列表',
    },
  ]
})

const onSelect: MenuProps['onSelect'] = ({ key }) => {
  if (hasUnsavedChanges.value) {
    notSavedWarning.value = true
    return
  }
  if (key === CurrentPage.Search || key === CurrentPage.FileList) {
    updateCurrentPage(key)
  } else {
    updateCurrentPage(CurrentPage.Proofreading)
    initialize(key as string)
  }
}

const current = computed(() => {
  if (currentPage.value === CurrentPage.Proofreading)
    return [proofreadingStore.book as string]
  if (currentPage.value === CurrentPage.FileList) return [CurrentPage.FileList]
  if (currentPage.value === CurrentPage.Search) return [CurrentPage.Search]
  return []
})

const menuStyle: CSSProperties = {
  fontFamily: 'var(--font-chinese)',
}
</script>

<style lang="scss" scoped></style>
