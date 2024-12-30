<template>
  <div v-if="!browserSupported" class="error">
    <a-alert message="需要Chrome或Edge浏览器" type="error" show-icon />
  </div>
  <div v-else-if="recoveredFromHistory === false" class="file-system">
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
  </div>
  <div v-if="browserSupported && recoveredFromHistory === null" class="spin">
    <a-spin size="large" />
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { message } from 'ant-design-vue'
import { InboxOutlined, InfoCircleOutlined } from '@ant-design/icons-vue'
import { getContentFromHistory, getContentFromUserAction } from './utils'

const browserSupported = typeof window.showDirectoryPicker === 'function'
const exampleDirectory = `
目标文件夹（←选这个）
├── 书1
│   ├── img
│   │   ├── xxx_ページ_001_xxxx.jpg
│   │   └── xxx_ページ_002_xxxx.jpg
│   └── txt
│       ├── 0001_main.txt
│       └── 0002_main.txt
└── 书2
    ├── img
    │   ├── xxx_ページ_001_xxxx.jpg
    │   ├── xxx_ページ_002_xxxx.jpg
    │   └── xxx_ページ_003_xxxx.jpg
    └── txt
        ├── 0001_main.txt
        ├── 0002_main.txt
        └── 0003_main.txt
`

const showHelp = ref(false)
const recoveredFromHistory = ref<boolean | null>(null)

const getDirectory = async () => {
  try {
    await getContentFromUserAction()
  } catch (e) {
    if ((e as any).name !== 'AbortError') {
      message.error(`${e}`)
    }
  }
}

onMounted(async () => {
  const recovered = await getContentFromHistory()
  recoveredFromHistory.value = recovered
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
