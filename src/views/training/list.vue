<template>
  <div class="training-list">
    <el-card class="search-card">
      <el-form :model="queryForm" inline>
        <el-form-item label="关键字">
          <el-input v-model="queryForm.keyword" placeholder="培训标题" clearable style="width: 200px" />
        </el-form-item>
        <el-form-item label="培训类型">
          <el-select v-model="queryForm.type" placeholder="请选择" clearable style="width: 160px">
            <el-option label="安全入职培训" value="SAFETY_INDUCTION" />
            <el-option label="技能培训" value="SKILL_TRAINING" />
            <el-option label="应急演练" value="EMERGENCY_DRILL" />
            <el-option label="证书培训" value="CERTIFICATE_TRAINING" />
            <el-option label="专项培训" value="SPECIAL_TRAINING" />
          </el-select>
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="queryForm.status" placeholder="请选择" clearable style="width: 150px">
            <el-option label="已安排" value="SCHEDULED" />
            <el-option label="进行中" value="IN_PROGRESS" />
            <el-option label="已完成" value="COMPLETED" />
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
            <el-icon><Plus /></el-icon>新建培训
          </el-button>
        </div>
      </div>

      <el-table v-loading="loading" :data="tableData" stripe border>
        <el-table-column prop="title" label="培训标题" min-width="200" show-overflow-tooltip />
        <el-table-column prop="typeName" label="培训类型" width="120" />
        <el-table-column prop="teacher" label="讲师" width="100" />
        <el-table-column prop="duration" label="时长(小时)" width="100" align="center" />
        <el-table-column prop="location" label="培训地点" width="150" show-overflow-tooltip />
        <el-table-column prop="startTime" label="开始时间" width="160" />
        <el-table-column prop="endTime" label="结束时间" width="160" />
        <el-table-column prop="departmentName" label="负责部门" width="120" />
        <el-table-column prop="completionRate" label="完成率" width="100" align="center">
          <template #default="{ row }">
            <el-progress :percentage="row.completionRate || 0" :color="getProgressColor(row.completionRate)" />
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)">{{ row.statusName }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link size="small" @click="handleView(row)">查看</el-button>
            <el-button type="primary" link size="small" @click="handleEdit(row)">编辑</el-button>
            <el-button type="success" link size="small" @click="handleSignIn(row)">签到</el-button>
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
import { ElMessage } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'
import { trainingApi, type Training, type TrainingQuery } from '@/api/modules/training'

const loading = ref(false)
const queryForm = reactive<TrainingQuery>({
  keyword: '',
  type: '',
  status: '',
  pageNum: 1,
  pageSize: 10
})

const tableData = ref<Training[]>([])
const total = ref(0)

function getStatusType(status: string) {
  const map: Record<string, string> = {
    SCHEDULED: 'info',
    IN_PROGRESS: 'primary',
    COMPLETED: 'success',
    CANCELLED: 'danger'
  }
  return map[status] || 'info'
}

function getProgressColor(rate?: number) {
  if (!rate) return '#909399'
  if (rate < 60) return '#F56C6C'
  if (rate < 90) return '#E6A23C'
  return '#67C23A'
}

async function fetchData() {
  loading.value = true
  try {
    const res = await trainingApi.list(queryForm)
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
  ElMessage.info('新建培训')
}

function handleView(row: Training) {
  ElMessage.info('查看培训')
}

function handleEdit(row: Training) {
  ElMessage.info('编辑培训')
}

function handleSignIn(row: Training) {
  ElMessage.info('培训签到')
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
.training-list {
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
