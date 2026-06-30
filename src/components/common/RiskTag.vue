<template>
  <span class="risk-tag" :class="`risk-${level?.toLowerCase()}`">
    {{ levelName }}
  </span>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  level?: 'RED' | 'ORANGE' | 'YELLOW' | 'BLUE' | string
}>()

const levelName = computed(() => {
  const map: Record<string, string> = {
    RED: '重大风险',
    ORANGE: '较大风险',
    YELLOW: '一般风险',
    BLUE: '低风险'
  }
  return map[props.level || ''] || props.level || '-'
})
</script>

<style lang="scss" scoped>
.risk-tag {
  display: inline-block;
  padding: 2px 12px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
  color: white;
}

.risk-red {
  background-color: #E63946;
}

.risk-orange {
  background-color: #F77F00;
}

.risk-yellow {
  background-color: #FCBF49;
  color: #1F2937;
}

.risk-blue {
  background-color: #2A9D8F;
}
</style>
