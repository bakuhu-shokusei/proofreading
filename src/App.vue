<template>
  <Init v-if="currentPage === CurrentPage.Init" />
  <div v-else class="basic-layout">
    <Header />
    <Search v-show="currentPage === CurrentPage.Search" />
    <Proofreading v-if="currentPage === CurrentPage.Proofreading" />
    <FileList v-if="currentPage === CurrentPage.FileList" />
  </div>
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia'
import Init from './components/init/Init.vue'
import Search from './components/search/Search.vue'
import Proofreading from './components/proof-reading/Proofreading.vue'
import Header from './components/shared/Header.vue'
import { CurrentPage, useGlobalStore } from './store/global'
import FileList from './components/file-list/FileList.vue'

const { currentPage } = storeToRefs(useGlobalStore())
</script>

<style lang="scss" scoped>
.basic-layout {
  height: 100dvh;
  display: grid;
  grid-template-columns: 1fr;
  grid-template-rows: auto minmax(0, 1fr);
}
</style>

<style>
:root {
  --font-chinese: 'Arial', 'Microsoft YaHei', '黑体', '宋体', sans-serif;
  --font-japanese: 'Helvetica Neue', Arial, 'Hiragino Kaku Gothic ProN',
    'Hiragino Sans', Meiryo, sans-serif;
  --text-main: rgba(0, 0, 0, 0.88);
  --text-secondary: rgba(0, 0, 0, 0.65);
  --primary-blue-rgb: 22, 119, 255;
  --primary-blue: rgb(22, 119, 255);
}

html {
  font-family: var(--font-japanese);
}
</style>
