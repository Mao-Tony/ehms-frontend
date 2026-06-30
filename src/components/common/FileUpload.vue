<template>
  <div class="file-upload">
    <el-upload
      ref="uploadRef"
      :action="uploadUrl"
      :headers="headers"
      :multiple="multiple"
      :limit="limit"
      :accept="accept"
      :file-list="fileList"
      :before-upload="handleBeforeUpload"
      :on-success="handleSuccess"
      :on-error="handleError"
      :on-remove="handleRemove"
      :on-preview="handlePreview"
      :on-exceed="handleExceed"
      :drag="drag"
      :disabled="disabled"
      :list-type="listType"
    >
      <slot>
        <div v-if="drag" class="el-upload-dragger">
          <el-icon class="el-icon--upload"><UploadFilled /></el-icon>
          <div class="el-upload__text">将文件拖到此处，或<em>点击上传</em></div>
        </div>
        <el-button v-else type="primary" :disabled="disabled">
          <el-icon><Upload /></el-icon>
          {{ buttonText }}
        </el-button>
      </slot>
      <template #tip>
        <div v-if="tip" class="el-upload__tip">{{ tip }}</div>
      </template>
    </el-upload>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { ElMessage } from 'element-plus'
import { UploadFilled, Upload } from '@element-plus/icons-vue'
import type { UploadInstance, UploadRawFile, UploadProps } from 'element-plus'

const props = withDefaults(defineProps<{
  modelValue?: string | string[]
  multiple?: boolean
  limit?: number
  accept?: string
  drag?: boolean
  disabled?: boolean
  listType?: 'text' | 'picture' | 'picture-card'
  buttonText?: string
  tip?: string
  sizeLimit?: number
}>(), {
  multiple: false,
  limit: 10,
  drag: false,
  disabled: false,
  listType: 'text',
  buttonText: '上传文件',
  sizeLimit: 10 * 1024 * 1024
})

const emit = defineEmits<{
  (e: 'update:modelValue', value: string | string[]): void
  (e: 'change', value: string | string[]): void
}>()

const uploadRef = ref<UploadInstance>()
const uploadUrl = import.meta.env.VITE_API_BASE_URL + '/upload'
const headers = computed(() => ({
  Authorization: 'Bearer ' + localStorage.getItem('ehms_token')
}))

const fileList = ref<any[]>([])

const modelValue = computed(() => props.modelValue)

function getFileList(value: string | string[] | undefined) {
  if (!value) return []
  return Array.isArray(value) ? value.map(url => ({ url, name: url.split('/').pop() || '' })) : [{ url: value, name: value.split('/').pop() || '' }]
}

function handleBeforeUpload(file: UploadRawFile) {
  if (file.size > props.sizeLimit) {
    ElMessage.error(`文件大小不能超过 ${props.sizeLimit / 1024 / 1024}MB`)
    return false
  }
  return true
}

function handleSuccess(response: any, file: any) {
  const url = response.data?.url || response.url
  updateModelValue(url)
  ElMessage.success('上传成功')
}

function handleError() {
  ElMessage.error('上传失败')
}

function handleRemove(file: any) {
  const urls = Array.isArray(modelValue.value) ? modelValue.value : modelValue.value ? [modelValue.value] : []
  const newUrls = urls.filter(u => u !== file.url)
  updateModelValue(props.multiple ? newUrls : (newUrls[0] || ''))
}

function handlePreview(file: any) {
  window.open(file.url)
}

function handleExceed() {
  ElMessage.warning(`最多只能上传 ${props.limit} 个文件`)
}

function updateModelValue(url: string) {
  const urls = Array.isArray(modelValue.value) ? [...modelValue.value, url] : url
  emit('update:modelValue', urls)
  emit('change', urls)
}
</script>

<style lang="scss" scoped>
.file-upload {
  :deep(.el-upload-dragger) {
    padding: 40px 20px;
  }

  :deep(.el-upload__tip) {
    margin-top: 8px;
    color: #909399;
  }
}
</style>
