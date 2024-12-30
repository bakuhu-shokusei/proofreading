<template>
  <Init v-if="currentPage === CurrentPage.Init" />
</template>

<script setup lang="ts">
import Init from './components/init/Index.vue'
import { CurrentPage, useGlobalStore } from './store/global'

const { currentPage } = useGlobalStore()
</script>

<style>
:root {
  --font-chinese: 'Arial', 'Microsoft YaHei', '黑体', '宋体', sans-serif;
  --text-main: rgba(0, 0, 0, 0.88);
  --text-secondary: rgba(0, 0, 0, 0.65);
}
</style>
