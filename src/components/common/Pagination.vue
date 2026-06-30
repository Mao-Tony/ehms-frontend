<template>
  <el-pagination
    v-model:current-page="currentPage"
    v-model:page-size="pageSize"
    :total="total"
    :page-sizes="pageSizes"
    :layout="layout"
    :small="small"
    :disabled="disabled"
    :background="background"
    @size-change="handleSizeChange"
    @current-change="handleCurrentChange"
  />
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(defineProps<{
  modelValue: {
    pageNum: number
    pageSize: number
  }
  total?: number
  pageSizes?: number[]
  layout?: string
  small?: boolean
  disabled?: boolean
  background?: boolean
}>(), {
  total: 0,
  pageSizes: () => [10, 20, 50, 100],
  layout: 'total, sizes, prev, pager, next, jumper',
  small: false,
  disabled: false,
  background: true
})

const emit = defineEmits<{
  (e: 'update:modelValue', value: { pageNum: number; pageSize: number }): void
  (e: 'change', value: { pageNum: number; pageSize: number }): void
}>()

const currentPage = computed({
  get: () => props.modelValue.pageNum,
  set: (val) => {
    emit('update:modelValue', { ...props.modelValue, pageNum: val })
  }
})

const pageSize = computed({
  get: () => props.modelValue.pageSize,
  set: (val) => {
    emit('update:modelValue', { ...props.modelValue, pageSize: val })
  }
})

function handleSizeChange(val: number) {
  emit('change', { pageNum: 1, pageSize: val })
}

function handleCurrentChange(val: number) {
  emit('change', { ...props.modelValue, pageNum: val })
}
</script>
