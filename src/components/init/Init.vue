<template>
  <div class="init-page">
    <div v-if="!browserSupported" class="error">
      <a-alert
        message="最新のChromeやEdgeを使ってください"
        type="error"
        show-icon
      />
    </div>
    <div class="file-system">
      <div class="upload-drag" @click="getDirectory">
        <p class="icon">
          <inbox-outlined />
        </p>
        <p class="info-text">フォルダを選択する</p>
      </div>
      <div class="info">
        <p @click="showHelp = true">
          必要なフォルダ構造
          <InfoCircleOutlined />
        </p>
        <Modal
          :open="showHelp"
          :footer="null"
          title="フォルダ構造"
          wrapClassName="directory-info-wrapper"
          @cancel="showHelp = false"
        >
          <div class="directory-example">{{ exampleDirectory.trim() }}</div>
        </Modal>
      </div>

      <template v-if="directoryHistory">
        <Divider :style="{ fontSize: '12px' }">OR</Divider>
        <div
          class="directory-history"
          @click="getFromHistory(directoryHistory.handle)"
        >
          前に選択したフォルダ
          <div class="previous-directory">
            <FolderOutlined class="icon" />
            {{ directoryHistory.name }}
          </div>
        </div>
      </template>
    </div>

    <div class="github-link">
      <a href="https://github.com/bakuhu-shokusei/proofreading" target="_blank">
        Github
        <img src="/github-mark.svg" />
      </a>
    </div>

    <div v-if="browserSupported && directoryHistory === undefined" class="spin">
      <a-spin size="large" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, shallowRef } from 'vue'
import { message, Divider, Modal } from 'ant-design-vue'
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
input_dir
  ├── book1
  │   ├── img
  │   │   ├── 001.jpg
  │   │   └── 002.jpg
  │   ├── txt
  │   │   ├── 001.txt
  │   │   └── 002.txt
  │   └── json (任意)
  │       ├── 001.json
  │       └── 002.json
  └── book2
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

.init-page {
  min-height: 100dvh;
  display: flex;
  flex-direction: column;
}

.file-system {
  flex: 1;
  padding: 16px 0;
  display: flex;
  flex-direction: column;
  gap: 16px;
  align-items: center;
  justify-content: center;
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
      color: var(--primary-blue);
      font-size: 48px;
      margin-bottom: 8px;
    }
    .info-text {
      margin-bottom: 8px;
      margin: 0 0 4px;
      color: rgba(0, 0, 0, 0.88);
      font-size: 16px;
      font-family: var(--font-japanese);
    }
  }
  .info {
    font-family: var(--font-japanese);
    margin: 16px auto;
    text-align: center;
    font-size: 14px;
    color: var(--text-main);
    cursor: pointer;
  }
  .directory-history {
    font-family: var(--font-japanese);
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
        color: var(--primary-blue);
      }
    }
  }
}

.github-link {
  height: 32px;
  & > a {
    font-size: 14px;
    text-decoration: none;
    color: #666f78;
    display: flex;
    align-items: center;
    justify-content: center;
    & > img {
      width: 20px;
      height: 20px;
      margin-left: 8px;
    }
  }
}

.directory-example {
  padding: 16px;
  background-color: #eeeeee;
  border-radius: 8px;
  font-family: 'Fira code', 'Fira Mono', source-code-pro, Menlo, Monaco,
    Consolas, 'Courier New', monospace;
  font-size: 16px;
  white-space: pre;
  color: var(--text-secondary);
}

.spin {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100dvh;
}
</style>

<style lang="scss">
.directory-info-wrapper {
  .ant-modal-title {
    font-family: var(--font-japanese);
  }
}
</style>
