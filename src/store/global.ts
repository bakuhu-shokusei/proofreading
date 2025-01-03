import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { ProofreadingContent } from '../components/init/utils'

export enum CurrentPage {
  Init,
  Search,
  Proofreading,
  FileList,
}

export const useGlobalStore = defineStore('global', () => {
  const currentPage = ref(CurrentPage.Init)
  const updateCurrentPage = (page: CurrentPage) => {
    currentPage.value = page
  }

  const proofreadingContent = ref<ProofreadingContent>()
  const setProofReadingContent = (content: ProofreadingContent) => {
    proofreadingContent.value = content

    updateCurrentPage(CurrentPage.Search)
  }

  return {
    currentPage,
    updateCurrentPage,
    proofreadingContent,
    setProofReadingContent,
  }
})
