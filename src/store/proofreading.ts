import { defineStore } from 'pinia'
import { ref, computed, toRaw } from 'vue'
import { useGlobalStore } from './global'
import {
  createFileURL,
  getFileName,
  readFile,
  writeFile,
  convertFormat,
  saveBack,
} from '../utils'
import type { Box } from '../utils'

interface EditStatus {
  boxes: Box[]
  selectedIndex: number // selected box
}
interface Detail {
  ready: boolean
  imageFileName: string
  imageUrl: string
  textFileName: string
  textContent: string
  textContentCopy: string
  layout?: {
    jsonFileName: string
    boxes: Box[] // original
    editHistory: EditStatus[]
    editIndex: number // pointer to the current history
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
        editHistory: [{ boxes: structuredClone(boxes), selectedIndex: -1 }],
        editIndex: 0,
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
    await saveJson(false)
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
    if (!pageDetail.value.layout || !currentEditStatus.value) return
    const boxes = currentEditStatus.value.boxes
    if (index < 0 || index >= boxes.length) return
    currentEditStatus.value.selectedIndex = index
  }
  const currentEditStatus = computed<EditStatus | null>(() => {
    if (!pageDetail.value.layout) return null
    return pageDetail.value.layout.editHistory[
      pageDetail.value.layout.editIndex
    ]
  })
  const dragBox = (e: { moved?: { newIndex: number; oldIndex: number } }) => {
    if (!e.moved || !pageDetail.value.layout || !currentEditStatus.value) return
    const newEditStatus = structuredClone(toRaw(currentEditStatus.value))
    const newBoxes = newEditStatus.boxes
    const toIndex = newBoxes.length - 1 - e.moved.newIndex
    const fromIndex = newBoxes.length - 1 - e.moved.oldIndex
    const element = newBoxes[fromIndex]
    newBoxes.splice(fromIndex, 1)
    newBoxes.splice(toIndex, 0, element)
    newEditStatus.selectedIndex = toIndex
    pushHistory(newEditStatus)
  }

  const MAX_RECORD = 10
  const pushHistory = (editStatus: EditStatus) => {
    const layout = pageDetail.value.layout
    if (!layout) return
    layout.editHistory = [
      ...layout.editHistory.slice(0, layout.editIndex + 1),
      editStatus,
    ]
    layout.editIndex++
    while (layout.editHistory.length > MAX_RECORD) {
      layout.editHistory.shift()
      layout.editIndex--
    }
  }

  const undoHistory = () => {
    if (!pageDetail.value.layout) return
    if (pageDetail.value.layout.editIndex > 0) {
      pageDetail.value.layout.editIndex--
    }
  }
  const canUndo = computed(() => {
    if (!pageDetail.value.layout) return false
    return pageDetail.value.layout.editIndex > 0
  })
  const redoHistory = () => {
    if (!pageDetail.value.layout) return
    if (
      pageDetail.value.layout.editIndex <
      pageDetail.value.layout.editHistory.length - 1
    ) {
      pageDetail.value.layout.editIndex++
    }
  }
  const canRedo = computed(() => {
    if (!pageDetail.value.layout) return false
    return (
      pageDetail.value.layout.editIndex <
      pageDetail.value.layout.editHistory.length - 1
    )
  })

  const saveBox = (index: number, content: string) => {
    if (!currentEditStatus.value) return
    const { boxes } = currentEditStatus.value
    if (boxes[index]) {
      boxes[index].text = content
    }
  }
  const deleteBox = () => {
    if (!currentEditStatus.value) return
    const { boxes, selectedIndex } = currentEditStatus.value
    if (boxes[selectedIndex]) {
      const newEditStatus = structuredClone(toRaw(currentEditStatus.value))
      newEditStatus.boxes.splice(selectedIndex, 1)
      if (!newEditStatus.boxes[newEditStatus.selectedIndex]) {
        newEditStatus.selectedIndex = -1
      }
      pushHistory(newEditStatus)
    }
  }
  const canDeleteBox = computed(() => {
    if (!currentEditStatus.value) return false
    const { boxes, selectedIndex } = currentEditStatus.value
    return !!boxes[selectedIndex]
  })
  const replaceTxt = () => {
    if (!currentEditStatus.value) return false
    const newContent = currentEditStatus.value.boxes
      .map((i) => i.text)
      .join('\n')
    const textArea = document.querySelector<HTMLTextAreaElement>(
      '#txt-content-textarea',
    )
    if (textArea) {
      textArea.focus()
      textArea.select()
      document.execCommand('insertText', false, newContent)
    }
  }

  const saveJson = async (needUpdate: boolean) => {
    if (!proofreadingContent || !book.value || !page.value) return
    const detail = proofreadingContent[book.value]?.[page.value - 1]
    if (!detail || !detail.json || !currentEditStatus.value) return
    const original = JSON.parse(await readFile(detail.json))
    const newContent = saveBack(currentEditStatus.value.boxes, original)
    await writeFile(detail.json, JSON.stringify(newContent, null, 2))
    if (needUpdate) {
      await update()
    }
  }
  const jsonChanged = computed(() => {
    if (!pageDetail.value.layout || !currentEditStatus.value) return
    const newBoxes = currentEditStatus.value.boxes
    const { boxes } = pageDetail.value.layout
    return (
      boxes.map((i) => i.text).join('|') !==
      newBoxes.map((i) => i.text).join('|')
    )
  })

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
    currentEditStatus,
    dragBox,
    undoHistory,
    canUndo,
    redoHistory,
    canRedo,
    saveBox,
    deleteBox,
    canDeleteBox,
    replaceTxt,
    saveJson,
    jsonChanged,
  }
})
