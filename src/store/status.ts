import { defineStore } from 'pinia'
import { markRaw, ref } from 'vue'
import type { ProofreadingContent } from '../components/init/utils'
import { readFile, writeFile } from '../utils'

interface Status {
  [s: string]: {
    statusFile: FileSystemFileHandle
    completed: Set<string>
  }
}

interface StatusContent {
  completed: string[]
}

const STATUS_FILE_NAME = '.status.json'

export const useStatusStore = defineStore('status', () => {
  const status = ref<Status>({})
  let _dirHandle: FileSystemDirectoryHandle
  let _proofreadingContent: ProofreadingContent

  const initStatus = async (
    dirHandle: FileSystemDirectoryHandle,
    proofreadingContent: ProofreadingContent,
  ) => {
    _dirHandle = dirHandle
    _proofreadingContent = proofreadingContent

    for await (const entry of dirHandle.values()) {
      if (entry.kind === 'directory') {
        const name = entry.name
        const statusFileHandle = await entry.getFileHandle(STATUS_FILE_NAME, {
          create: true,
        })
        const jsonContent: StatusContent = await (async () => {
          try {
            const raw = await readFile(statusFileHandle)
            const parsed: StatusContent = JSON.parse(raw)
            if (!Array.isArray(parsed.completed)) {
              throw 'invalid status content'
            }
            return parsed
          } catch {
            return { completed: [] }
          }
        })()
        const actualFiles = new Set(
          proofreadingContent[name].map((i) => i.text.name),
        )
        jsonContent.completed = jsonContent.completed.filter((i) =>
          actualFiles.has(i),
        )
        status.value[name] = {
          statusFile: markRaw(statusFileHandle),
          completed: new Set(jsonContent.completed),
        }
      }
    }
  }

  const setCompleted = async (
    book: string,
    txtName: string,
    completed: boolean,
  ) => {
    const bookDetail = status.value[book]
    if (!bookDetail) return
    const raw = await readFile(bookDetail.statusFile)
    let parsed: StatusContent
    try {
      parsed = JSON.parse(raw)
      if (!Array.isArray(parsed.completed)) {
        throw 'invalid status content'
      }
    } catch {
      parsed = { completed: [] }
    }
    const list = new Set(status.value[book].completed)
    if (completed) {
      list.add(txtName)
    } else {
      list.delete(txtName)
    }
    parsed.completed = Array.from(list).sort((a, b) => a.localeCompare(b))
    await writeFile(bookDetail.statusFile, JSON.stringify(parsed, null, 2))
    await initStatus(_dirHandle, _proofreadingContent)
  }

  return { status, initStatus, setCompleted }
})
