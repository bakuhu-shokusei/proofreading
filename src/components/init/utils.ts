import { get, set } from 'idb-keyval'
import { useGlobalStore, useStatusStore } from '../../store'

function getDirectoryHandle() {
  return showDirectoryPicker({
    id: 'proofreading-directory',
    mode: 'readwrite',
  })
}

interface ImageTextPair {
  key: number
  image: FileSystemFileHandle
  text: FileSystemFileHandle
  json?: FileSystemFileHandle
}

export interface ProofreadingContent {
  [s: string]: ImageTextPair[]
}

interface Buf {
  [s: string]: {
    img: FileSystemFileHandle[]
    txt: FileSystemFileHandle[]
    json?: FileSystemFileHandle[]
  }
}

enum SubFolder {
  Text = 'txt',
  Image = 'img',
  Json = 'json',
}

const PROOFREADING_DIRECTORY = 'proofreading-directory'

export async function getContentFromUserAction() {
  const dirHandle = await getDirectoryHandle()
  await set(PROOFREADING_DIRECTORY, dirHandle)
  await getContent(dirHandle)
}

export async function getDirectoryHistory() {
  const dirHandle = await get<FileSystemDirectoryHandle>(PROOFREADING_DIRECTORY)
  if (dirHandle instanceof FileSystemDirectoryHandle) {
    return {
      name: dirHandle.name,
      handle: dirHandle,
    }
  } else {
    return null
  }
}

async function checkHistory(
  dirHandle: FileSystemDirectoryHandle,
): Promise<boolean> {
  try {
    const options: FileSystemHandlePermissionDescriptor = { mode: 'readwrite' }
    if ((await dirHandle.queryPermission(options)) === 'granted') {
      return true
    }
    if ((await dirHandle.requestPermission(options)) === 'granted') {
      return true
    }
    return false
  } catch {
    return false
  }
}

export async function getContentFromHistory(
  dirHandle: FileSystemDirectoryHandle,
) {
  const ok = await checkHistory(dirHandle)
  if (ok) {
    await getContent(dirHandle)
  }
}

async function getContent(dirHandle: FileSystemDirectoryHandle) {
  const content: ProofreadingContent = {}

  const buf: Buf = {}
  for await (const entry of dirHandle.values()) {
    if (entry.kind === 'directory') {
      const name = entry.name
      for await (const subFolder of entry.values()) {
        const subName = subFolder.name
        if (
          subFolder.kind === 'directory' &&
          (subName === SubFolder.Text ||
            subName === SubFolder.Image ||
            subName === SubFolder.Json)
        ) {
          const files: FileSystemFileHandle[] = []
          for await (const file of subFolder.values()) {
            if (file.kind === 'file') {
              files.push(file)
            }
          }
          files.sort((a, b) => a.name.localeCompare(b.name))
          files.forEach((file) => {
            buf[name] = buf[name] || {}
            buf[name][subName] = buf[name][subName] || []
            buf[name][subName].push(file)
          })
        }
      }
    }
  }
  if (Object.keys(buf).length === 0) throw '有効な入力内容ではありません'

  for (const [book, buffer] of Object.entries(buf)) {
    const [image, text, json] = [buffer.img, buffer.txt, buffer.json]
    if (image.length !== text.length || (json && image.length !== json.length))
      throw [
        'ページ数が合わない',
        `画像：${image.length}`,
        `txt：${text.length}`,
        ...(json ? [`json：${json.length}`] : []),
      ].join('\n')
    Array.from({ length: image.length }).forEach((_, idx) => {
      const img = image[idx]
      const txt = text[idx]
      content[book] = content[book] || []
      content[book].push({
        key: idx + 1,
        image: img,
        text: txt,
        ...(json ? { json: json[idx] } : {}),
      })
    })
  }

  await useStatusStore().initStatus(dirHandle, content)
  useGlobalStore().setProofReadingContent(content)
}
