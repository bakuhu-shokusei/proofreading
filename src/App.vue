<template>
  <Init v-if="currentPage === CurrentPage.Init" />
  <div v-else class="basic-layout">
    <Header />
    <Search v-if="currentPage === CurrentPage.Search" />
    <Proofreading v-if="currentPage === CurrentPage.Proofreading" />
  </div>
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia'
import Init from './components/init/Init.vue'
import Search from './components/search/Search.vue'
import Proofreading from './components/proof-reading/Proofreading.vue'
import Header from './components/shared/Header.vue'
import { CurrentPage, useGlobalStore } from './store/global'

const { currentPage } = storeToRefs(useGlobalStore())
</script>

<style lang="scss" scoped>
.basic-layout {
  height: 100dvh;
  display: flex;
  flex-direction: column;
  :deep(.full-height-content) {
    flex: 1;
  }
}
</style>

<style>
:root {
  --font-chinese: 'Arial', 'Microsoft YaHei', '黑体', '宋体', sans-serif;
  --text-main: rgba(0, 0, 0, 0.88);
  --text-secondary: rgba(0, 0, 0, 0.65);
}
</style>
