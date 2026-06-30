<template>
  <div class="permit-list">
    <el-card class="search-card">
      <el-form :model="queryForm" inline>
        <el-form-item label="关键字">
          <el-input v-model="queryForm.keyword" placeholder="作业票号/标题" clearable style="width: 200px" />
        </el-form-item>
        <el-form-item label="作业类型">
          <el-select v-model="queryForm.type" placeholder="请选择" clearable style="width: 160px">
            <el-option label="动火作业" value="HOT_WORK" />
            <el-option label="受限空间" value="CONFINED_SPACE" />
            <el-option label="高处作业" value="HEIGHT_WORK" />
            <el-option label="临时用电" value="TEMPORARY_ELECTRICITY" />
            <el-option label="挖掘作业" value="EXCAVATION" />
            <el-option label="吊装作业" value="LIFTING" />
          </el-select>
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="queryForm.status" placeholder="请选择" clearable style="width: 150px">
            <el-option label="待审批" value="PENDING" />
            <el-option label="已批准" value="APPROVED" />
            <el-option label="已拒绝" value="REJECTED" />
            <el-option label="已过期" value="EXPIRED" />
            <el-option label="已取消" value="CANCELLED" />
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
            <el-icon><Plus /></el-icon>新建作业票
          </el-button>
        </div>
      </div>

      <el-table v-loading="loading" :data="tableData" stripe border>
        <el-table-column prop="permitNo" label="作业票号" width="150" />
        <el-table-column prop="title" label="作业标题" min-width="180" show-overflow-tooltip />
        <el-table-column prop="typeName" label="作业类型" width="100" />
        <el-table-column prop="location" label="作业地点" width="150" show-overflow-tooltip />
        <el-table-column prop="departmentName" label="申请部门" width="120" />
        <el-table-column prop="applicantName" label="申请人" width="100" />
        <el-table-column prop="startTime" label="开始时间" width="160" />
        <el-table-column prop="endTime" label="结束时间" width="160" />
        <el-table-column prop="status" label="状态" width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)">{{ row.status }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link size="small" @click="handleView(row)">查看</el-button>
            <el-button type="success" link size="small" @click="handleApprove(row)" v-if="row.status === 'PENDING'">审批</el-button>
            <el-button type="warning" link size="small" @click="handleCancel(row)" v-if="['PENDING', 'APPROVED'].includes(row.status)">取消</el-button>
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
import { ElMessage } from '@element-plus/icons-vue'
import { permitApi, type WorkPermit, type PermitQuery } from '@/api/modules/permit'

const loading = ref(false)
const queryForm = reactive<PermitQuery>({
  keyword: '',
  type: '',
  status: '',
  pageNum: 1,
  pageSize: 10
})

const tableData = ref<WorkPermit[]>([])
const total = ref(0)

function getStatusType(status: string) {
  const map: Record<string, string> = {
    PENDING: 'warning',
    APPROVED: 'success',
    REJECTED: 'danger',
    EXPIRED: 'info',
    CANCELLED: 'info'
  }
  return map[status] || 'info'
}

async function fetchData() {
  loading.value = true
  try {
    const res = await permitApi.list(queryForm)
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
  Object.assign(queryForm, { keyword: '', type: '', status: '', pageNum: 1 })
  fetchData()
}

function handleAdd() {
  ElMessage.info('新建作业票')
}

function handleView(row: WorkPermit) {
  ElMessage.info('查看作业票')
}

function handleApprove(row: WorkPermit) {
  ElMessage.info('审批作业票')
}

function handleCancel(row: WorkPermit) {
  ElMessage.info('取消作业票')
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
.permit-list {
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
</style>
