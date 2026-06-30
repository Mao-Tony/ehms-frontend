<template>
  <el-container class="layout-container">
    <el-aside :width="isCollapsed ? '64px' : '220px'" class="aside">
      <div class="logo">
        <img src="@/assets/logo.svg" alt="logo" class="logo-img" />
        <span v-show="!isCollapsed" class="logo-text">EHMS</span>
      </div>

      <!-- 动态菜单 -->
      <el-scrollbar class="menu-scrollbar">
        <el-menu
          :default-active="activeMenu"
          :collapse="isCollapsed"
          :collapse-transition="false"
          background-color="#0F2A4A"
          text-color="rgba(255,255,255,0.7)"
          active-text-color="#1890FF"
          router
          class="sidebar-menu"
        >
          <template v-for="menu in menuTree" :key="menu.id">
            <!-- 目录节点（M） -->
            <el-sub-menu v-if="menu.menuType === 'M' && menu.children?.length" :index="menu.path || `/dir-${menu.id}`">
              <template #title>
                <el-icon><component :is="getIcon(menu.icon)" /></el-icon>
                <span>{{ menu.name }}</span>
              </template>
              <el-menu-item
                v-for="child in menu.children"
                :key="child.id"
                :index="child.path"
              >
                <el-icon><component :is="getIcon(child.icon)" /></el-icon>
                <span>{{ child.name }}</span>
              </el-menu-item>
            </el-sub-menu>
            <!-- 叶子菜单节点（C） -->
            <el-menu-item v-else-if="menu.menuType === 'C' && menu.parentId === 0" :index="menu.path">
              <el-icon><component :is="getIcon(menu.icon)" /></el-icon>
              <span>{{ menu.name }}</span>
            </el-menu-item>
          </template>
        </el-menu>
      </el-scrollbar>
    </el-aside>

    <el-container>
      <el-header class="header">
        <div class="header-left">
          <el-button text @click="toggleSidebar">
            <el-icon size="20"><Fold v-if="!isCollapsed" /><Expand v-else /></el-icon>
          </el-button>
          <el-breadcrumb separator="/">
            <el-breadcrumb-item :to="{ path: '/dashboard' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item v-if="currentRoute.meta?.title">
              {{ currentRoute.meta.title }}
            </el-breadcrumb-item>
          </el-breadcrumb>
        </div>
        <div class="header-right">
          <el-dropdown @command="handleCommand">
            <span class="user-info">
              <el-avatar :size="32" :src="userInfo?.avatar || ''">
                {{ userInfo?.realName?.charAt(0) || 'U' }}
              </el-avatar>
              <span class="user-name">{{ userInfo?.realName || '用户' }}</span>
              <span class="dept-name">{{ userInfo?.deptName || '' }}</span>
            </span>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="profile">个人中心</el-dropdown-item>
                <el-dropdown-item command="password">修改密码</el-dropdown-item>
                <el-dropdown-item divided command="logout">退出登录</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </el-header>

      <el-main class="main">
        <router-view />
      </el-main>
    </el-container>
  </el-container>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessageBox, ElMessage } from 'element-plus'
import {
  Fold, Expand, Odometer, Warning, WarnTriangleFilled, Ticket,
  Reading, Tools, Bell, Document, TrendCharts, User, Flask,
  FirstAidKit, Setting, DataLine, Guide, DataAnalysis, Box,
  Crop, Aim, MagicStick, Menu, Collection, Key, OfficeBuilding,
  Notebook, Medal, Edit, CollectionTag, Sunny, Sunset, Tickets,
  DocumentChecked, Shield
} from '@element-plus/icons-vue'
import { useUserStore } from '@/stores/user'
import { useAppStore } from '@/stores/app'
import { authApi } from '@/api/modules/auth'
import type { MenuItem } from '@/api/types'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()
const appStore = useAppStore()

const isCollapsed = computed(() => appStore.sidebarCollapsed)
const userInfo = computed(() => userStore.userInfo)
const activeMenu = computed(() => route.path)
const currentRoute = computed(() => route)

const menuTree = ref<MenuItem[]>([])

// Element Plus 图标映射
const iconMap: Record<string, any> = {
  Odometer, Warning, WarnTriangleFilled, Ticket, Reading, Tools,
  Bell, Document, TrendCharts, User, Flask, FirstAidKit, Setting,
  Fold, Expand, DataLine, Guide, DataAnalysis, Box, Crop, Aim,
  MagicStick, Menu, Collection, Key, OfficeBuilding, Notebook,
  Medal, Edit, CollectionTag, Sunny, Sunset, Tickets, DocumentChecked,
  Shield
}

function getIcon(name?: string) {
  return iconMap[name || 'Document'] || Document
}

async function loadMenus() {
  try {
    const res = await authApi.getMenus()
    menuTree.value = res.data || []
    // 缓存到 store 供 generateRoutes 使用
    userStore.setMenus(menuTree.value)
  } catch (err) {
    console.error('加载菜单失败', err)
    // fallback: 空菜单，用户可通过硬编码导航
  }
}

function toggleSidebar() {
  appStore.toggleSidebar()
}

function handleCommand(command: string) {
  switch (command) {
    case 'profile':
      router.push('/profile')
      break
    case 'password':
      router.push('/password')
      break
    case 'logout':
      ElMessageBox.confirm('确定要退出登录吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        userStore.logout()
        router.push('/login')
        ElMessage.success('已退出登录')
      }).catch(() => {})
      break
  }
}

onMounted(() => {
  loadMenus()
})
</script>

<style lang="scss" scoped>
.layout-container {
  height: 100vh;
}

.aside {
  background-color: #0F2A4A;
  transition: width 0.3s;
  overflow: hidden;
  display: flex;
  flex-direction: column;

  .logo {
    height: 60px;
    display: flex;
    align-items: center;
    padding: 0 16px;
    background: rgba(0, 0, 0, 0.2);

    .logo-img {
      width: 32px;
      height: 32px;
    }

    .logo-text {
      margin-left: 12px;
      font-size: 20px;
      font-weight: bold;
      color: #1890FF;
      white-space: nowrap;
    }
  }

  .menu-scrollbar {
    flex: 1;
    overflow-y: auto;
  }

  .sidebar-menu {
    border-right: none;
    background-color: #0F2A4A;

    :deep(.el-menu-item),
    :deep(.el-sub-menu__title) {
      &:hover {
        background-color: rgba(24, 144, 255, 0.1) !important;
      }
    }

    :deep(.el-menu-item.is-active) {
      background-color: rgba(24, 144, 255, 0.15) !important;
    }
  }
}

.header {
  background: white;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.08);

  .header-left {
    display: flex;
    align-items: center;
    gap: 16px;
  }

  .header-right {
    .user-info {
      display: flex;
      align-items: center;
      gap: 12px;
      cursor: pointer;

      .user-name {
        font-weight: 500;
        color: #1F2937;
      }

      .dept-name {
        color: #6B7280;
        font-size: 12px;
        padding: 2px 8px;
        background: #F5F7FA;
        border-radius: 4px;
      }
    }
  }
}

.main {
  background-color: #F5F7FA;
  padding: 20px;
  overflow-y: auto;
}
</style>
