<template>
  <div class="contractors-container">
    <!-- 搜索区域 -->
    <el-card class="search-card">
      <el-form :inline="true" :model="searchForm" class="search-form">
        <el-form-item label="承包商名称">
          <el-input v-model="searchForm.keyword" placeholder="请输入承包商名称" clearable />
        </el-form-item>
        <el-form-item label="资质等级">
          <el-select v-model="searchForm.qualification_level" placeholder="请选择资质等级" clearable>
            <el-option label="一级" value="一级" />
            <el-option label="二级" value="二级" />
            <el-option label="三级" value="三级" />
          </el-select>
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="searchForm.status" placeholder="请选择状态" clearable>
            <el-option label="准入" value="准入" />
            <el-option label="暂停" value="暂停" />
            <el-option label="退出" value="退出" />
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
        <el-button type="primary" @click="handleAdd">新增承包商</el-button>
      </div>
      <el-table :data="tableData" border stripe v-loading="loading">
        <el-table-column prop="contractor_name" label="承包商名称" min-width="180" show-overflow-tooltip />
        <el-table-column prop="credit_code" label="统一社会信用代码" width="180" />
        <el-table-column prop="contact_person" label="联系人" width="100" />
        <el-table-column prop="contact_phone" label="联系电话" width="130" />
        <el-table-column prop="qualification_level" label="资质等级" width="100">
          <template #default="{ row }">
            <el-tag :type="getLevelType(row.qualification_level)">
              {{ row.qualification_level }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="admission_end_date" label="准入有效期" width="120" />
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
    <el-dialog v-model="dialogVisible" title="承包商详情" width="700px">
      <el-descriptions :column="2" border>
        <el-descriptions-item label="承包商名称" :span="2">{{ currentRow?.contractor_name }}</el-descriptions-item>
        <el-descriptions-item label="统一社会信用代码">{{ currentRow?.credit_code }}</el-descriptions-item>
        <el-descriptions-item label="资质等级">
          <el-tag :type="getLevelType(currentRow?.qualification_level)">{{ currentRow?.qualification_level }}</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="联系人">{{ currentRow?.contact_person }}</el-descriptions-item>
        <el-descriptions-item label="联系电话">{{ currentRow?.contact_phone }}</el-descriptions-item>
        <el-descriptions-item label="准入有效期">{{ currentRow?.admission_start_date }} 至 {{ currentRow?.admission_end_date }}</el-descriptions-item>
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
  qualification_level: '',
  status: ''
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
      qualification_level: searchForm.qualification_level || undefined
    }
    const res: any = await contractorApi.listContractors(params)
    tableData.value = res.list || res.data || []
    pagination.total = res.total || 0
  } catch (error) {
    console.error('获取列表失败:', error)
  } finally {
    loading.value = false
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
    qualification_level: '',
    status: ''
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
  console.log('新增承包商')
}

// 查看
const handleView = (row: any) => {
  currentRow.value = row
  dialogVisible.value = true
}

// 资质等级标签类型
const getLevelType = (level: string) => {
  const map: Record<string, any> = {
    '一级': 'success',
    '二级': 'warning',
    '三级': 'info'
  }
  return map[level] || 'info'
}

// 状态标签类型
const getStatusType = (status: string) => {
  const map: Record<string, any> = {
    '准入': 'success',
    '暂停': 'warning',
    '退出': 'danger'
  }
  return map[status] || 'info'
}

onMounted(() => {
  fetchList()
})
</script>

<style scoped>
.contractors-container {
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
