import { get, set } from 'idb-keyval'
import { useGlobalStore } from '../../store/global'

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
}

export interface ProofreadingContent {
  [s: string]: ImageTextPair[]
}

interface Buf {
  [s: string]: {
    image: {
      key: number
      handle: FileSystemFileHandle
    }[]
    text: {
      key: number
      handle: FileSystemFileHandle
    }[]
  }
}

enum SubFolder {
  Text = 'txt',
  Image = 'img',
}

const PROOFREADING_DIRECTORY = 'proofreading-directory'

export async function getContentFromUserAction() {
  const dirHandle = await getDirectoryHandle()
  await set(PROOFREADING_DIRECTORY, dirHandle)
  return getContent(dirHandle)
}

async function checkHistory(): Promise<FileSystemDirectoryHandle | null> {
  try {
    const dirHandle = await get<FileSystemDirectoryHandle>(
      PROOFREADING_DIRECTORY,
    )
    const options: FileSystemHandlePermissionDescriptor = { mode: 'readwrite' }
    if (dirHandle) {
      if ((await dirHandle.queryPermission(options)) === 'granted') {
        return dirHandle
      }
      if ((await dirHandle.requestPermission(options)) === 'granted') {
        return dirHandle
      }
    }
    return null
  } catch {
    return null
  }
}

export async function getContentFromHistory() {
  const dirHandle = await checkHistory()
  if (dirHandle !== null) {
    await getContent(dirHandle)
    return true
  }
  return false
}

async function getContent(
  dirHandle: FileSystemDirectoryHandle,
): Promise<ProofreadingContent> {
  const content: ProofreadingContent = {}

  const buf: Buf = {}
  for await (const entry of dirHandle.values()) {
    if (entry.kind === 'directory') {
      const name = entry.name
      for await (const subFolder of entry.values()) {
        const subName = subFolder.name
        if (
          subFolder.kind === 'directory' &&
          (subName === SubFolder.Text || subName === SubFolder.Image)
        ) {
          for await (const file of subFolder.values()) {
            if (file.kind === 'file') {
              const key = getFileKey(file.name, subName)
              buf[name] = buf[name] || {}
              if (subName === SubFolder.Text) {
                buf[name].text = buf[name].text || []
                buf[name].text.push({
                  key,
                  handle: file,
                })
              } else {
                buf[name].image = buf[name].image || []
                buf[name].image.push({
                  key,
                  handle: file,
                })
              }
            }
          }
        }
      }
    }
  }
  if (Object.keys(buf).length === 0) throw `未找到有效内容`

  for (const [book, { image, text }] of Object.entries(buf)) {
    const pages = Array.from(
      new Set([...image.map((i) => i.key), ...text.map((i) => i.key)]),
    ).sort((a, b) => a - b)
    pages.forEach((page) => {
      const img = image.find((i) => i.key === page)
      const txt = text.find((i) => i.key === page)
      if (!img) throw `找不到${page}页的图片`
      if (!txt) throw `找不到${page}页的文字(txt文件)`
      content[book] = content[book] || []
      content[book].push({
        key: page,
        image: img.handle,
        text: txt.handle,
      })
    })
  }

  useGlobalStore().setProofReadingContent(content)

  return content
}

function getFileKey(fileName: string, type: SubFolder): number {
  const error = ['无法提取页数', `实际文件名：${fileName}`]
  if (type === SubFolder.Image) {
    // a01-3_ページ_37_画像_0001.jpg
    const matched = fileName.match(/_ページ_(\d+)_/)
    if (matched) {
      const page = parseInt(matched[1])
      if (page > 0) return page
    }
    error.push('预期格式：xxx_ページ_001_xxxx')
  }
  if (type === SubFolder.Text) {
    // 0040_main.txt
    const matched = fileName.match(/(\d+)_main/)
    if (matched) {
      const page = parseInt(matched[1])
      if (page > 0) return page
    }
    error.push('预期格式：0001_main')
  }
  throw error.join('\n')
}
