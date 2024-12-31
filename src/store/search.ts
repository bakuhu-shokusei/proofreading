import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useGlobalStore } from './global'
import { readFile } from '../utils'

interface SearchResult {
  [s: string]: {
    index: number // index of array
    textContent: string
    textFileName: string
  }[]
}

export const useSearchStore = defineStore('Search', () => {
  const { proofreadingContent } = useGlobalStore()

  const keyword = ref('')
  const searchIn = ref(
    (() => {
      const keys = Object.keys(proofreadingContent || {})
      const map: Record<string, boolean> = {}
      keys.forEach((key) => {
        map[key] = true
      })
      return map
    })(),
  )
  const loading = ref(false)
  const searchResult = ref<SearchResult>({})

  const search = async () => {
    loading.value = true
    const books = Object.keys(searchIn.value).filter(
      (book) => searchIn.value[book],
    )
    const result: SearchResult = {}
    for (const book of books) {
      result[book] = []

      const candidates = (proofreadingContent || {})[book] || []
      for (const candidate of candidates) {
        const textContent = await readFile(candidate.text)
        if (textContent.includes(keyword.value)) {
          result[book].push({
            index: candidates.indexOf(candidate),
            textContent,
            textFileName: candidate.text.name,
          })
        }
      }
    }

    loading.value = false
    searchResult.value = result
  }

  return { keyword, searchIn, search, loading, searchResult }
})
