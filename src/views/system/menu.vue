<template>
  <div class="page-container">
    <el-alert type="info" :closable="false" show-icon style="margin-bottom: 16px">
      当前显示登录用户的菜单权限（只读），菜单配置请在后台数据库 sys_menu 表中维护。
    </el-alert>

    <el-card>
      <el-table :data="menuTree" row-key="id" :tree-props="{ children: 'children', hasChildren: 'hasChildren' }" default-expand-all>
        <el-table-column prop="name" label="菜单名称" min-width="180">
          <template #default="{ row }">
            <span style="margin-right: 8px">{{ row.name }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="path" label="路由路径" min-width="200" />
        <el-table-column prop="component" label="组件路径" min-width="180" show-overflow-tooltip />
        <el-table-column prop="icon" label="图标" width="140">
          <template #default="{ row }">
            <el-tag v-if="row.icon" size="small" type="info">{{ row.icon }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="menuType" label="类型" width="90">
          <template #default="{ row }">
            <el-tag v-if="row.menuType === 'M'" type="warning" size="small">目录</el-tag>
            <el-tag v-else-if="row.menuType === 'C'" size="small">菜单</el-tag>
            <el-tag v-else size="small">{{ row.menuType }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="permission" label="权限标识" min-width="160" show-overflow-tooltip />
        <el-table-column prop="orderNum" label="排序" width="80" />
        <el-table-column prop="isVisible" label="显示" width="80">
          <template #default="{ row }">
            <el-tag :type="row.isVisible === 0 ? 'success' : 'danger'" size="small">
              {{ row.isVisible === 0 ? '是' : '否' }}
            </el-tag>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script setup lang="ts" name="SystemMenu">
import { ref, onMounted } from 'vue'
import { authApi } from '@/api/modules/auth'
import type { MenuItem } from '@/api/types'

const menuTree = ref<MenuItem[]>([])

async function loadMenus() {
  try {
    const res = await authApi.getMenus()
    menuTree.value = res.data || []
  } catch (err) {
    console.error('加载菜单失败', err)
  }
}

onMounted(() => loadMenus())
</script>

<style lang="scss" scoped>
</style>
