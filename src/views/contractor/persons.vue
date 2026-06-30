<template>
  <div class="persons-container">
    <!-- 搜索区域 -->
    <el-card class="search-card">
      <el-form :inline="true" :model="searchForm" class="search-form">
        <el-form-item label="姓名">
          <el-input v-model="searchForm.keyword" placeholder="请输入姓名" clearable />
        </el-form-item>
        <el-form-item label="所属承包商">
          <el-select v-model="searchForm.contractor_id" placeholder="请选择承包商" clearable filterable>
            <el-option
              v-for="item in contractorList"
              :key="item.contractor_id"
              :label="item.contractor_name"
              :value="item.contractor_id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="工种">
          <el-select v-model="searchForm.work_type" placeholder="请选择工种" clearable>
            <el-option label="电工作业" value="电工作业" />
            <el-option label="焊接与热切割" value="焊接与热切割" />
            <el-option label="高处作业" value="高处作业" />
            <el-option label="危险化学品" value="危险化学品" />
            <el-option label="普通作业" value="普通作业" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">搜索</el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 表格区域 -->
    <el-card class="table-card">
      <div class="table-toolbar">
        <el-button type="primary" @click="handleAdd">新增人员</el-button>
      </div>
      <el-table :data="tableData" border stripe v-loading="loading">
        <el-table-column prop="person_name" label="姓名" width="100" />
        <el-table-column prop="id_card" label="身份证号" width="170" />
        <el-table-column prop="contractor_name" label="所属承包商" min-width="150" show-overflow-tooltip />
        <el-table-column prop="work_type" label="工种" width="120" />
        <el-table-column prop="certificate_no" label="证书编号" width="150" />
        <el-table-column prop="entry_date" label="入场日期" width="120" />
        <el-table-column prop="exit_date" label="离场日期" width="120" />
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)">
              {{ row.status }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="120" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" size="small" @click="handleView(row)">查看</el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="pagination-container">
        <el-pagination
          v-model:current-page="pagination.page"
          v-model:page-size="pagination.page_size"
          :total="pagination.total"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handlePageChange"
        />
      </div>
    </el-card>

    <!-- 查看弹窗 -->
    <el-dialog v-model="dialogVisible" title="人员详情" width="700px">
      <el-descriptions :column="2" border>
        <el-descriptions-item label="姓名">{{ currentRow?.person_name }}</el-descriptions-item>
        <el-descriptions-item label="身份证号">{{ currentRow?.id_card }}</el-descriptions-item>
        <el-descriptions-item label="所属承包商" :span="2">{{ currentRow?.contractor_name }}</el-descriptions-item>
        <el-descriptions-item label="工种">{{ currentRow?.work_type }}</el-descriptions-item>
        <el-descriptions-item label="证书编号">{{ currentRow?.certificate_no }}</el-descriptions-item>
        <el-descriptions-item label="入场日期">{{ currentRow?.entry_date }}</el-descriptions-item>
        <el-descriptions-item label="离场日期">{{ currentRow?.exit_date || '-' }}</el-descriptions-item>
        <el-descriptions-item label="状态">
          <el-tag :type="getStatusType(currentRow?.status)">{{ currentRow?.status }}</el-tag>
        </el-descriptions-item>
      </el-descriptions>
      <template #footer>
        <el-button @click="dialogVisible = false">关闭</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { contractorApi } from '@/api/modules/contractor'

// 搜索表单
const searchForm = reactive({
  keyword: '',
  contractor_id: '',
  work_type: ''
})

// 分页
const pagination = reactive({
  page: 1,
  page_size: 10,
  total: 0
})

// 表格数据
const tableData = ref([])
const loading = ref(false)

// 承包商列表
const contractorList = ref<any[]>([])

// 弹窗
const dialogVisible = ref(false)
const currentRow = ref<any>(null)

// 获取列表
const fetchList = async () => {
  loading.value = true
  try {
    const params = {
      page: pagination.page,
      page_size: pagination.page_size,
      keyword: searchForm.keyword || undefined,
      contractor_id: searchForm.contractor_id || undefined
    }
    const res: any = await contractorApi.listContractorPersons(params)
    tableData.value = res.list || res.data || []
    pagination.total = res.total || 0
  } catch (error) {
    console.error('获取列表失败:', error)
  } finally {
    loading.value = false
  }
}

// 获取承包商列表
const fetchContractorList = async () => {
  try {
    const res: any = await contractorApi.listContractors({ page: 1, page_size: 1000 })
    contractorList.value = res.list || res.data || []
  } catch (error) {
    console.error('获取承包商列表失败:', error)
  }
}

// 搜索
const handleSearch = () => {
  pagination.page = 1
  fetchList()
}

// 重置
const handleReset = () => {
  Object.assign(searchForm, {
    keyword: '',
    contractor_id: '',
    work_type: ''
  })
  handleSearch()
}

// 分页
const handleSizeChange = () => {
  fetchList()
}

const handlePageChange = () => {
  fetchList()
}

// 新增
const handleAdd = () => {
  console.log('新增人员')
}

// 查看
const handleView = (row: any) => {
  currentRow.value = row
  dialogVisible.value = true
}

// 状态标签类型
const getStatusType = (status: string) => {
  const map: Record<string, any> = {
    '在场': 'success',
    '离场': 'info',
    '入场审核中': 'warning'
  }
  return map[status] || 'info'
}

onMounted(() => {
  fetchList()
  fetchContractorList()
})
</script>

<style scoped>
.persons-container {
  padding: 20px;
}

.search-card {
  margin-bottom: 20px;
}

.search-form {
  display: flex;
  flex-wrap: wrap;
}

.table-card {
  margin-bottom: 20px;
}

.table-toolbar {
  margin-bottom: 15px;
}

.pagination-container {
  display: flex;
  justify-content: flex-end;
  margin-top: 20px;
}
</style>
