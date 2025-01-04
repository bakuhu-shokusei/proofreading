<template>
  <CheckCircleOutlined
    class="icon"
    :class="{ 'is-completed': isCompleted }"
    @click="toggleCompleted"
  />
</template>

<script lang="ts" setup>
import { computed } from 'vue'
import { storeToRefs } from 'pinia'
import { CheckCircleOutlined } from '@ant-design/icons-vue'
import { useStatusStore } from '../../store'

const statusStore = useStatusStore()
const { status } = storeToRefs(statusStore)
const { setCompleted } = statusStore

const props = defineProps<{
  book: string
  textFileName: string
}>()

const isCompleted = computed(() => {
  const bookDetail = status.value[props.book]
  if (!bookDetail) return false
  return bookDetail.completed.has(props.textFileName)
})

const toggleCompleted = () => {
  setCompleted(props.book, props.textFileName, !isCompleted.value)
}
</script>

<style lang="scss" scoped>
.icon {
  color: rgba(0, 0, 0, 0.25);
  &.is-completed {
    color: #52c41a;
  }
  cursor: pointer;
}
</style>
