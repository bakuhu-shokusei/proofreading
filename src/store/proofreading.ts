import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useGlobalStore } from './global'
import {
  createFileURL,
  getFileName,
  readFile,
  writeFile,
  convertFormat,
} from '../utils'
import type { Box } from '../utils'

interface Detail {
  ready: boolean
  imageFileName: string
  imageUrl: string
  textFileName: string
  textContent: string
  textContentCopy: string
  layout?: {
    jsonFileName: string
    boxes: Box[]
    boxesCopy: Box[]
    selectedIndex: number
  }
}

export const useProofreadingStore = defineStore('proofreading', () => {
  const { proofreadingContent } = useGlobalStore()

  const book = ref<string>()
  const page = ref<number>() // start from 1
  const pageDetail = ref<Detail>({
    ready: false,
    imageFileName: '',
    imageUrl: '',
    textFileName: '',
    textContent: '',
    textContentCopy: '',
  })
  const notSavedWarning = ref(false)

  const totalPages = computed(() => {
    if (!proofreadingContent || !book.value) return 0
    return proofreadingContent[book.value].length ?? 0
  })
  const draftChanged = computed(() => {
    return pageDetail.value.textContent !== pageDetail.value.textContentCopy
  })

  const initialize = (_book: string, _page?: number) => {
    book.value = _book
    page.value = _page ?? 1
    update()
  }

  const update = async () => {
    if (!proofreadingContent || !book.value || !page.value) return
    pageDetail.value.ready = false
    const detail = proofreadingContent[book.value]?.[page.value - 1]
    if (!detail) return
    const imageUrl = await createFileURL(detail.image)
    const textContent = await readFile(detail.text)
    pageDetail.value = {
      ready: true,
      imageFileName: getFileName(detail.image),
      imageUrl,
      textFileName: getFileName(detail.text),
      textContent,
      textContentCopy: textContent,
    }

    if (detail.json) {
      const boxes = convertFormat(JSON.parse(await readFile(detail.json)))
      pageDetail.value.layout = {
        jsonFileName: getFileName(detail.json),
        boxes: boxes,
        boxesCopy: structuredClone(boxes),
        selectedIndex: -1,
      }
    }
  }

  const updatePage = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages.value) {
      page.value = newPage
      update()
    }
  }

  const saveChanges = async () => {
    if (!proofreadingContent || !book.value || !page.value) return
    const detail = proofreadingContent[book.value]?.[page.value - 1]
    if (!detail) return
    await writeFile(detail.text, pageDetail.value.textContentCopy)
    await update()
  }
  const resetDraft = () => {
    pageDetail.value.textContentCopy = pageDetail.value.textContent
  }

  // layout
  const selectBox = (index: number /* start at 0 */) => {
    if (!pageDetail.value.layout) return
    const boxes = pageDetail.value.layout.boxesCopy
    if (index < 0 || index >= boxes.length) return
    pageDetail.value.layout.selectedIndex = index
  }

  return {
    book,
    page,
    initialize,
    pageDetail,
    totalPages,
    updatePage,
    draftChanged,
    resetDraft,
    saveChanges,
    notSavedWarning,
    selectBox,
  }
})
