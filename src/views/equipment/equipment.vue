<template>
  <ListView />
</template>

<script setup lang="ts">
// 此页面与 list.vue 功能一致，作为路由别名复用同一实现，避免双份代码维护
import ListView from './list.vue'
</script>
