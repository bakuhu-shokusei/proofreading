<template>
  <div v-if="!browserSupported" class="error">
    <a-alert message="需要Chrome或Edge浏览器" type="error" show-icon />
  </div>
  <div class="file-system">
    <div class="upload-drag" @click="getDirectory">
      <p class="icon">
        <inbox-outlined />
      </p>
      <p class="info-text">点击此处选择本地文件夹</p>
    </div>
    <div class="info">
      <p @click="showHelp = true">
        文件夹结构示例
        <InfoCircleOutlined />
      </p>
      <a-modal
        :open="showHelp"
        :footer="null"
        title="文件夹结构示例"
        wrapClassName="directory-info-wrapper"
        @cancel="showHelp = false"
      >
        <div class="directory-example">{{ exampleDirectory.trim() }}</div>
      </a-modal>
    </div>

    <template v-if="directoryHistory">
      <Divider :style="{ fontSize: '12px' }">OR</Divider>
      <div
        class="directory-history"
        @click="getFromHistory(directoryHistory.handle)"
      >
        之前选择的文件夹
        <div class="previous-directory">
          <FolderOutlined class="icon" />
          {{ directoryHistory.name }}
        </div>
      </div>
    </template>
  </div>
  <div v-if="browserSupported && directoryHistory === undefined" class="spin">
    <a-spin size="large" />
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, shallowRef } from 'vue'
import { message, Divider } from 'ant-design-vue'
import {
  InboxOutlined,
  InfoCircleOutlined,
  FolderOutlined,
} from '@ant-design/icons-vue'
import {
  getContentFromHistory,
  getContentFromUserAction,
  getDirectoryHistory,
} from './utils'

const browserSupported = typeof window.showDirectoryPicker === 'function'
const exampleDirectory = `
目标文件夹（←选这个）
├── 书1
│   ├── img
│   │   ├── 001.jpg
│   │   └── 002.jpg
│   └── txt
│       ├── 001.txt
│       └── 002.txt
└── 书2
    ├── img
    │   ├── 001.jpg
    │   ├── 002.jpg
    │   └── 003.jpg
    └── txt
        ├── 001.txt
        ├── 002.txt
        └── 003.txt
`

const showHelp = ref(false)
type DirectoryHistory = Awaited<ReturnType<typeof getDirectoryHistory>>
const directoryHistory = shallowRef<DirectoryHistory | undefined>(undefined)

const getDirectory = async () => {
  try {
    await getContentFromUserAction()
  } catch (e) {
    if ((e as any).name !== 'AbortError') {
      message.error(`${e}`)
    }
  }
}

const getFromHistory = async (dirHandle: FileSystemDirectoryHandle) => {
  try {
    await getContentFromHistory(dirHandle)
  } catch (e) {
    message.error(`${e}`)
  }
}

onMounted(async () => {
  directoryHistory.value = await getDirectoryHistory()
})
</script>

<style lang="scss" scoped>
p {
  margin: 0;
}
.error {
  padding: 16px;
}
.file-system {
  display: flex;
  flex-direction: column;
  gap: 16px;
  align-items: center;
  justify-content: center;
  height: 100dvh;
  max-width: 800px;
  margin: 0 auto;
  .upload-drag {
    background: rgba(0, 0, 0, 0.02);
    border: 1px dashed #d9d9d9;
    border-radius: 8px;
    cursor: pointer;
    padding: 16px;
    text-align: center;
    .icon {
      color: #1677ff;
      font-size: 48px;
      margin-bottom: 8px;
    }
    .info-text {
      margin-bottom: 8px;
      margin: 0 0 4px;
      color: rgba(0, 0, 0, 0.88);
      font-size: 16px;
      font-family: var(--font-chinese);
    }
  }
  .info {
    font-family: var(--font-chinese);
    margin: 16px auto;
    text-align: center;
    font-size: 14px;
    color: var(--text-main);
    cursor: pointer;
  }
  .directory-history {
    font-family: var(--font-chinese);
    text-align: center;
    font-size: 14px;
    color: var(--text-main);
    .previous-directory {
      cursor: pointer;
      color: rgba(0, 0, 0, 0.88);
      font-size: 16px;
      display: flex;
      justify-content: center;
      align-items: center;
      margin-top: 32px;
      background: rgba(0, 0, 0, 0.02);
      border: 1px dashed #d9d9d9;
      border-radius: 8px;
      padding: 16px;
      .icon {
        font-size: 20px;
        margin-right: 8px;
        color: #1677ff;
      }
    }
  }
}

:global(.directory-info-wrapper) {
  .directory-example {
    font-family: 'Fira code', 'Fira Mono', source-code-pro, Menlo, Monaco,
      Consolas, 'Courier New', monospace;
    font-size: 12px;
    white-space: pre;
    color: var(--text-secondary);
  }
}

.spin {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100dvh;
}
</style>
