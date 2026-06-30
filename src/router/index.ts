import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router'
import type { MenuItem } from '@/api/types'

export const constantRoutes: RouteRecordRaw[] = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/login/index.vue'),
    meta: { title: '登录', requiresAuth: false }
  }
]

export const layoutRoute: RouteRecordRaw = {
  path: '/',
  component: () => import('@/views/layout/index.vue'),
  redirect: '/dashboard',
  children: [
    {
      path: 'dashboard',
      name: 'Dashboard',
      component: () => import('@/views/dashboard/index.vue'),
      meta: { title: '驾驶舱', icon: 'Odometer', requiresAuth: true }
    }
  ]
}

const router = createRouter({
  history: createWebHistory(),
  routes: constantRoutes
})

export const whiteList = ['/login', '/auth/lark/callback']

export function generateRoutes(menus: MenuItem[]): RouteRecordRaw[] {
  const routes: RouteRecordRaw[] = []

  menus.forEach(menu => {
    if (menu.path && menu.component) {
      const route: RouteRecordRaw = {
        path: menu.path,
        name: menu.name,
        component: () => import(`@/views/${menu.component}.vue`),
        meta: {
          title: menu.name,
          icon: menu.icon,
          requiresAuth: true,
          menuId: menu.id
        }
      }
      routes.push(route)
    }
    if (menu.children && menu.children.length > 0) {
      routes.push(...generateRoutes(menu.children))
    }
  })

  return routes
}

export default router
