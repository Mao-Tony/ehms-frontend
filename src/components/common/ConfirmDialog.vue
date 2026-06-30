<template>
  <el-popconfirm
    :title="title"
    :description="description"
    :confirm-button-text="confirmButtonText"
    :cancel-button-text="cancelButtonText"
    :confirm-button-type="danger ? 'danger' : 'primary'"
    :icon="danger ? 'WarnTriangleFilled' : 'QuestionFilled'"
    :icon-color="danger ? '#E63946' : '#1890FF'"
    :hide-after="0"
    @confirm="handleConfirm"
    @cancel="handleCancel"
  >
    <template #reference>
      <slot />
    </template>
  </el-popconfirm>
</template>

<script setup lang="ts">
withDefaults(defineProps<{
  title?: string
  description?: string
  confirmButtonText?: string
  cancelButtonText?: string
  danger?: boolean
}>(), {
  title: '确定执行此操作吗？',
  description: '',
  confirmButtonText: '确定',
  cancelButtonText: '取消',
  danger: false
})

const emit = defineEmits<{
  (e: 'confirm'): void
  (e: 'cancel'): void
}>()

function handleConfirm() {
  emit('confirm')
}

function handleCancel() {
  emit('cancel')
}
</script>
