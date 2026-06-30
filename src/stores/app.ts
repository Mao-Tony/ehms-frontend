import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useAppStore = defineStore('app', () => {
  const sidebarCollapsed = ref(false)
  const loading = ref(false)
  const cachedViews = ref<string[]>([])

  function toggleSidebar() {
    sidebarCollapsed.value = !sidebarCollapsed.value
  }

  function setLoading(isLoading: boolean) {
    loading.value = isLoading
  }

  function addCachedView(view: string) {
    if (!cachedViews.value.includes(view)) {
      cachedViews.value.push(view)
    }
  }

  function removeCachedView(view: string) {
    const index = cachedViews.value.indexOf(view)
    if (index > -1) {
      cachedViews.value.splice(index, 1)
    }
  }

  return {
    sidebarCollapsed,
    loading,
    cachedViews,
    toggleSidebar,
    setLoading,
    addCachedView,
    removeCachedView
  }
})
