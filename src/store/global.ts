import { defineStore } from 'pinia'
import { ref } from 'vue'

export enum CurrentPage {
  Init,
  Search,
  Proofreading,
}

export const useGlobalStore = defineStore('global', () => {
  const currentPage = ref(CurrentPage.Init)
  const updateCurrentPage = (page: CurrentPage) => {
    currentPage.value = page
  }

  return { currentPage, updateCurrentPage }
})
