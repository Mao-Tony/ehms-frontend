import type { Directive, DirectiveBinding } from 'vue'
import { useUserStore } from '@/stores/user'

function checkPermission(el: HTMLElement, binding: DirectiveBinding) {
  const userStore = useUserStore()
  const { value } = binding

  if (!value) {
    return
  }

  const permissions = userStore.permissions

  if (Array.isArray(value)) {
    const hasPermission = value.some(p => permissions.includes(p))
    if (!hasPermission) {
      el.style.display = 'none'
    }
  } else {
    if (!permissions.includes(value)) {
      el.style.display = 'none'
    }
  }
}

export const permissionDirective: Directive = {
  mounted(el: HTMLElement, binding: DirectiveBinding) {
    checkPermission(el, binding)
  },
  updated(el: HTMLElement, binding: DirectiveBinding) {
    checkPermission(el, binding)
  }
}

export default permissionDirective
