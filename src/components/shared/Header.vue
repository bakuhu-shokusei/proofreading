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
import { SearchOutlined, FileImageOutlined } from '@ant-design/icons-vue'
import { storeToRefs } from 'pinia'
import { Menu } from 'ant-design-vue'
import type { MenuProps } from 'ant-design-vue'
import { CurrentPage, useGlobalStore } from '../../store'

const globalStore = useGlobalStore()
const { currentPage, proofreadingContent } = storeToRefs(globalStore)
const { updateCurrentPage } = useGlobalStore()

const items = computed<MenuProps['items']>(() => {
  return [
    {
      key: CurrentPage.Search,
      icon: () => h(SearchOutlined),
      label: '检索',
      title: '检索',
    },
    {
      key: CurrentPage.Proofreading,
      icon: () => h(FileImageOutlined),
      label: '校对',
      title: '校对',
      children: Object.keys(proofreadingContent.value || {}).map((i) => ({
        label: i,
        title: i,
      })),
    },
  ]
})

const onSelect: MenuProps['onSelect'] = ({ key }) => {
  if (key === CurrentPage.Search) {
    updateCurrentPage(key)
  }
  console.log(key)
}

const current = computed(() => {
  if (currentPage.value === CurrentPage.Proofreading)
    return [CurrentPage.Proofreading]
  if (currentPage.value === CurrentPage.Search) return [CurrentPage.Search]
  return []
})

const menuStyle: CSSProperties = {
  fontFamily: 'var(--font-chinese)',
}
</script>

<style lang="scss" scoped></style>
