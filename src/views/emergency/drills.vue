<template>
  <div class="page-container">
    <div class="filter-bar">
      <el-form :inline="true" :model="queryForm" class="filter-form">
        <el-form-item label="演练名称">
          <el-input v-model="queryForm.keyword" placeholder="请输入演练名称" clearable style="width: 200px" />
        </el-form-item>
        <el-form-item label="演练类型">
          <el-select v-model="queryForm.drillType" placeholder="请选择" clearable style="width: 160px">
            <el-option label="桌面演练" value="DESKTOP" />
            <el-option label="实战演练" value="PRACTICAL" />
            <el-option label="综合演练" value="COMPREHENSIVE" />
            <el-option label="专项演练" value="SPECIAL" />
          </el-select>
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="queryForm.status" placeholder="请选择" clearable style="width: 140px">
            <el-option label="计划中" value="PLANNED" />
            <el-option label="进行中" value="IN_PROGRESS" />
            <el-option label="已完成" value="COMPLETED" />
            <el-option label="已取消" value="CANCELLED" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleQuery">查询</el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
    </div>

    <div class="tool-bar">
      <el-button type="primary" @click="handleAdd">新增演练计划</el-button>
    </div>

    <el-table :data="tableData" v-loading="loading" stripe border>
      <el-table-column type="index" label="序号" width="60" />
      <el-table-column prop="drillName" label="演练名称" min-width="180" show-overflow-tooltip />
      <el-table-column prop="drillType" label="演练类型" width="100">
        <template #default="{ row }">
          <el-tag size="small">{{ typeName(row.drillType) }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="planStartTime" label="计划开始" width="120" />
      <el-table-column prop="planEndTime" label="计划结束" width="120" />
      <el-table-column prop="location" label="演练地点" min-width="140" show-overflow-tooltip />
      <el-table-column prop="participantCount" label="参与人数" width="90" align="center" />
      <el-table-column prop="status" label="状态" width="90">
        <template #default="{ row }">
          <el-tag :type="statusTag(row.status)" size="small">{{ statusName(row.status) }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="evaluation" label="评估结论" min-width="200" show-overflow-tooltip />
      <el-table-column label="操作" width="220" fixed="right">
        <template #default="{ row }">
          <el-button link type="primary" size="small" @click="handleView(row)">查看</el-button>
          <el-button link type="primary" size="small" @click="handleEdit(row)">编辑</el-button>
          <el-button link type="success" size="small" v-if="row.status === 'PLANNED'" @click="handleStart(row)">开始</el-button>
          <el-button link type="danger" size="small" @click="handleDelete(row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-pagination
      v-model:current-page="pagination.page"
      v-model:page-size="pagination.pageSize"
      :total="pagination.total"
      :page-sizes="[10, 20, 50, 100]"
      layout="total, sizes, prev, pager, next, jumper"
      @size-change="loadData"
      @current-change="loadData"
      style="margin-top: 16px; justify-content: flex-end"
    />
  </div>
</template>

<script setup lang="ts">
import { reactive, ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { emergencyApi } from '@/api/modules/emergency'

const loading = ref(false)
const tableData = ref<any[]>([])
const queryForm = reactive({ keyword: '', drillType: '', status: '' })
const pagination = reactive({ page: 1, pageSize: 20, total: 0 })

const typeMap: Record<string, string> = { DESKTOP: '桌面演练', PRACTICAL: '实战演练', COMPREHENSIVE: '综合演练', SPECIAL: '专项演练' }
const statusMap: Record<string, string> = { PLANNED: '计划中', IN_PROGRESS: '进行中', COMPLETED: '已完成', CANCELLED: '已取消' }
const statusTag = (v: string) => ({ PLANNED: 'info', IN_PROGRESS: 'warning', COMPLETED: 'success', CANCELLED: '' }[v] || 'info')

const typeName = (v: string) => typeMap[v] || v
const statusName = (v: string) => statusMap[v] || v

const loadData = async () => {
  loading.value = true
  try {
    const params: any = { drillType: queryForm.drillType || undefined, status: queryForm.status || undefined, page: pagination.page, pageSize: pagination.pageSize }
    const res: any = await emergencyApi.listDrills(params)
    tableData.value = res.data?.list || res.items || []
    pagination.total = res.data?.pageInfo?.total || res.total || 0
  } catch { ElMessage.error('加载演练列表失败') }
  finally { loading.value = false }
}

const handleQuery = () => { pagination.page = 1; loadData() }
const handleReset = () => { Object.assign(queryForm, { keyword: '', drillType: '', status: '' }); handleQuery() }
const handleAdd = () => ElMessage.info('新增演练计划（需配置路由）')
const handleView = (row: any) => ElMessage.info(`查看演练: ${row.drillName}`)
const handleEdit = (row: any) => ElMessage.info(`编辑演练: ${row.drillName}`)
const handleStart = (row: any) => ElMessage.info(`开始演练: ${row.drillName}`)
const handleDelete = (row: any) => {
  ElMessageBox.confirm(`确认删除演练「${row.drillName}」？`, '删除确认', { type: 'warning' })
    .then(async () => {
      await (emergencyApi as any).deleteDrill(row.drillId)
      ElMessage.success('删除成功'); loadData()
    }).catch(() => {})
}

onMounted(loadData)
</script>