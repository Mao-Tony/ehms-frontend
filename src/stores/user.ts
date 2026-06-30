import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { UserInfo, MenuItem, LoginVO } from '@/api/types'
import { authApi } from '@/api/modules/auth'

export const useUserStore = defineStore('user', () => {
  const token = ref<string>(localStorage.getItem('ehms_token') || '')
  const userInfo = ref<UserInfo | null>(null)
  const menus = ref<MenuItem[]>([])

  const isLoggedIn = computed(() => !!token.value)

  const permissions = computed(() => userInfo.value?.permissions || [])
  const roles = computed(() => userInfo.value?.roles || [])

  function setToken(newToken: string) {
    token.value = newToken
    localStorage.setItem('ehms_token', newToken)
  }

  function setUserInfo(info: UserInfo) {
    userInfo.value = info
    localStorage.setItem('ehms_user', JSON.stringify(info))
  }

  function setMenus(newMenus: MenuItem[]) {
    menus.value = newMenus
  }

  function login(loginVO: LoginVO) {
    setToken(loginVO.accessToken)
    setUserInfo({
      userId: loginVO.userId,
      username: loginVO.username,
      realName: loginVO.realName,
      avatar: loginVO.avatar,
      roles: loginVO.roles,
      permissions: loginVO.permissions,
      deptId: loginVO.deptId,
      deptName: loginVO.deptName
    })
  }

  async function fetchUserInfo() {
    try {
      const res = await authApi.getCurrentUser()
      setUserInfo(res.data)
      return res.data
    } catch (error) {
      logout()
      throw error
    }
  }

  async function fetchMenus() {
    try {
      const res = await authApi.getMenus()
      setMenus(res.data)
      return res.data
    } catch (error) {
      throw error
    }
  }

  function logout() {
    token.value = ''
    userInfo.value = null
    menus.value = []
    localStorage.removeItem('ehms_token')
    localStorage.removeItem('ehms_user')
  }

  function hasPermission(permission: string | string[]): boolean {
    if (!permission) return true
    const permList = Array.isArray(permission) ? permission : [permission]
    return permList.some(p => permissions.value.includes(p))
  }

  function hasRole(role: string | string[]): boolean {
    if (!role) return true
    const roleList = Array.isArray(role) ? role : [role]
    return roleList.some(r => roles.value.includes(r))
  }

  return {
    token,
    userInfo,
    menus,
    isLoggedIn,
    permissions,
    roles,
    setToken,
    setUserInfo,
    setMenus,
    login,
    fetchUserInfo,
    fetchMenus,
    logout,
    hasPermission,
    hasRole
  }
}, {
  persist: {
    key: 'ehms_user',
    pick: ['token', 'userInfo', 'menus']
  }
})
