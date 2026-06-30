<template>
  <div class="hazard-list">
    <el-card class="search-card">
      <el-form :model="queryForm" inline>
        <el-form-item label="关键字">
          <el-input v-model="queryForm.keyword" placeholder="隐患标题/内容" clearable style="width: 200px" />
        </el-form-item>
        <el-form-item label="风险等级">
          <el-select v-model="queryForm.level" placeholder="请选择" clearable style="width: 150px">
            <el-option label="重大隐患" value="RED" />
            <el-option label="较大隐患" value="ORANGE" />
            <el-option label="一般隐患" value="YELLOW" />
            <el-option label="低隐患" value="BLUE" />
          </el-select>
        </el-form-item>
        <el-form-item label="隐患类别">
          <el-select v-model="queryForm.category" placeholder="请选择" clearable style="width: 150px">
            <el-option label="人的不安全行为" value="PERSON" />
            <el-option label="物的不安全状态" value="EQUIPMENT" />
            <el-option label="环境的不安全因素" value="ENVIRONMENT" />
            <el-option label="管理缺陷" value="MANAGEMENT" />
          </el-select>
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="queryForm.status" placeholder="请选择" clearable style="width: 150px">
            <el-option label="待处理" value="PENDING" />
            <el-option label="处理中" value="PROCESSING" />
            <el-option label="已整改" value="RESOLVED" />
            <el-option label="已关闭" value="CLOSED" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">查询</el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card class="table-card">
      <div class="toolbar">
        <div class="left">
          <el-button type="primary" @click="handleAdd">
            <el-icon><Plus /></el-icon>新增隐患
          </el-button>
        </div>
      </div>

      <el-table v-loading="loading" :data="tableData" stripe border :row-class-name="getRowClassName">
        <el-table-column prop="title" label="隐患标题" min-width="200" show-overflow-tooltip />
        <el-table-column prop="level" label="等级" width="100" align="center">
          <template #default="{ row }">
            <risk-tag :level="row.level" />
          </template>
        </el-table-column>
        <el-table-column prop="category" label="类别" width="140">
          <template #default="{ row }">
            {{ getCategoryName(row.category) }}
          </template>
        </el-table-column>
        <el-table-column prop="departmentName" label="所属部门" width="120" />
        <el-table-column prop="location" label="位置" width="150" show-overflow-tooltip />
        <el-table-column prop="status" label="状态" width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)">{{ getStatusName(row.status) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="deadline" label="截止日期" width="120" />
        <el-table-column prop="reporterName" label="上报人" width="100" />
        <el-table-column label="操作" width="220" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link size="small" @click="handleView(row)">查看</el-button>
            <el-button type="primary" link size="small" @click="handleAssign(row)" v-if="row.status === 'PENDING'">分派</el-button>
            <el-button type="success" link size="small" @click="handleResolve(row)" v-if="row.status === 'PROCESSING'">整改</el-button>
            <el-button type="danger" link size="small" @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <div class="pagination-wrapper">
        <el-pagination
          v-model:current-page="queryForm.pageNum"
          v-model:page-size="queryForm.pageSize"
          :total="total"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handlePageChange"
        />
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'
import { hazardApi, type Hazard, type HazardQuery } from '@/api/modules/hazard'
import RiskTag from '@/components/common/RiskTag.vue'

const loading = ref(false)
const dialogVisible = ref(false)

const queryForm = reactive<HazardQuery>({
  keyword: '',
  level: '',
  category: '',
  status: '',
  pageNum: 1,
  pageSize: 10
})

const tableData = ref<Hazard[]>([])
const total = ref(0)

const categoryMap: Record<string, string> = {
  PERSON: '人的不安全行为',
  EQUIPMENT: '物的不安全状态',
  ENVIRONMENT: '环境的不安全因素',
  MANAGEMENT: '管理缺陷'
}

const statusMap: Record<string, string> = {
  PENDING: '待处理',
  PROCESSING: '处理中',
  RESOLVED: '已整改',
  CLOSED: '已关闭'
}

function getCategoryName(category: string) {
  return categoryMap[category] || category
}

function getStatusName(status: string) {
  return statusMap[status] || status
}

function getStatusType(status: string) {
  const map: Record<string, string> = {
    PENDING: 'warning',
    PROCESSING: 'primary',
    RESOLVED: 'success',
    CLOSED: 'info'
  }
  return map[status] || 'info'
}

function getRowClassName({ row }: { row: Hazard }) {
  if (row.level === 'RED') return 'hazard-red-row'
  return ''
}

async function fetchData() {
  loading.value = true
  try {
    const res = await hazardApi.list(queryForm)
    tableData.value = res.data.list
    total.value = res.data.pageInfo.total
  } catch (error) {
    console.error(error)
  } finally {
    loading.value = false
  }
}

function handleSearch() {
  queryForm.pageNum = 1
  fetchData()
}

function handleReset() {
  Object.assign(queryForm, { keyword: '', level: '', category: '', status: '', pageNum: 1 })
  fetchData()
}

function handleAdd() {
  ElMessage.info('新增隐患')
}

function handleView(row: Hazard) {
  ElMessage.info('查看隐患')
}

function handleAssign(row: Hazard) {
  ElMessage.info('分派隐患')
}

function handleResolve(row: Hazard) {
  ElMessage.info('整改隐患')
}

async function handleDelete(row: Hazard) {
  await ElMessageBox.confirm(`确定要删除隐患"${row.title}"吗？`, '提示', { type: 'warning' })
  await hazardApi.delete(row.id)
  ElMessage.success('删除成功')
  fetchData()
}

function handleSizeChange() {
  fetchData()
}

function handlePageChange() {
  fetchData()
}

onMounted(() => {
  fetchData()
})
</script>

<style lang="scss" scoped>
.hazard-list {
  .search-card { margin-bottom: 16px; }
  .table-card {
    .toolbar {
      display: flex;
      justify-content: space-between;
      margin-bottom: 16px;
    }
    .pagination-wrapper {
      margin-top: 16px;
      display: flex;
      justify-content: flex-end;
    }
  }
}
:deep(.el-table) {
  .hazard-red-row {
    background-color: rgba(230, 57, 70, 0.1) !important;
  }
}
</style>
