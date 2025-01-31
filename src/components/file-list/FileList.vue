<template>
  <div class="file-list">
    <div class="file-list-inner">
      <div v-for="item in list" :key="item.book" class="book">
        <div class="book-name">{{ item.book }}</div>
        <Table
          :columns="item.columns"
          :data-source="item.data"
          size="small"
          :pagination="false"
        >
          <template #headerCell="{ column }">
            <span class="table-header-cell"> {{ column.title }} </span>
          </template>
          <template #bodyCell="{ column, record }">
            <span
              v-if="column.key !== 'completed'"
              class="table-body-cell"
              @click="record.onClick"
            >
              {{ record[column.key!] }}
            </span>
            <CompletedStatus
              v-else
              :book="record.completed.book"
              :text-file-name="record.completed.textFileName"
            />
          </template>
        </Table>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { Table } from 'ant-design-vue'
import type { TableProps } from 'ant-design-vue'
import { CompletedStatus } from '../shared'
import { CurrentPage, useGlobalStore, useProofreadingStore } from '../../store'

const globalStore = useGlobalStore()
const { updateCurrentPage } = globalStore

const proofreadingStore = useProofreadingStore()
const { initialize } = proofreadingStore

const list = computed(() => {
  const content = globalStore.proofreadingContent || {}
  const books = Object.keys(content)
  return books.map((book) => {
    const columns: TableProps['columns'] = [
      {
        title: '校正状態',
        dataIndex: 'completed',
        key: 'completed',
      },
      {
        title: '画像ファイル',
        dataIndex: 'image',
        key: 'image',
      },
      {
        title: 'txtファイル',
        dataIndex: 'text',
        key: 'text',
      },
    ]
    const data: TableProps['dataSource'] = content[book].map(
      ({ image, text }, idx) => {
        return {
          image: image.name,
          text: text.name,
          completed: { book, textFileName: text.name },
          onClick: () => {
            goToDetail(book, idx)
          },
        }
      },
    )
    return {
      book,
      columns,
      data,
    }
  })
})

const goToDetail = (book: string, index: number) => {
  updateCurrentPage(CurrentPage.Proofreading)
  initialize(book, index + 1)
}
</script>

<style lang="scss" scoped>
.file-list {
  height: 100%;
  overflow: auto;
  .file-list-inner {
    height: 100%;
    padding: 16px 12px;
    width: 100%;
    max-width: 800px;
    margin: 0 auto;
    .book {
      margin-top: 16px;
      margin-bottom: 48px;
      &:last-of-type {
        padding-bottom: 16px;
      }
      .book-name {
        color: var(--text-main);
        font-size: 24px;
        font-weight: 600;
        margin: 12px 0;
      }
      .table-header-cell {
        font-family: var(--font-japanese);
      }
      .table-body-cell {
        cursor: pointer;
      }
    }
  }
}
</style>
