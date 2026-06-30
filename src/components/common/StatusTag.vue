<template>
  <el-tag :type="type" :size="size" :effect="effect" :hit="hit" :closable="closable" :disable-transitions="disableTransitions" :tabindex="tabindex" @close="handleClose">
    <slot />
  </el-tag>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(defineProps<{
  status?: string | number
  size?: 'large' | 'default' | 'small'
  effect?: 'light' | 'dark' | 'plain'
  hit?: boolean
  closable?: boolean
  disableTransitions?: boolean
  tabindex?: string | number
}>(), {
  size: 'default',
  effect: 'light',
  hit: false,
  closable: false,
  disableTransitions: false
})

const emit = defineEmits<{
  (e: 'close', event: Event): void
}>()

const type = computed(() => {
  const statusMap: Record<string, string> = {
    PENDING: 'warning',
    PROCESSING: 'primary',
    RESOLVED: 'success',
    CLOSED: 'info',
    APPROVED: 'success',
    REJECTED: 'danger',
    EXPIRED: 'info',
    CANCELLED: 'info',
    NORMAL: 'success',
    MAINTENANCE: 'warning',
    BREAKDOWN: 'danger',
    SCRAPPED: 'info',
    DRAFT: 'info',
    EFFECTIVE: 'success',
    ACTIVE: 'success',
    SUSPENDED: 'warning',
    BLACKLISTED: 'danger'
  }
  return statusMap[String(props.status)] || 'info'
})

function handleClose(event: Event) {
  emit('close', event)
}
</script>
