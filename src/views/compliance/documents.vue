<template>
  <div class="documents-container">
    <!-- 搜索区域 -->
    <el-card class="search-card">
      <el-form :inline="true" :model="searchForm" class="search-form">
        <el-form-item label="文档名称">
          <el-input v-model="searchForm.keyword" placeholder="请输入文档名称" clearable />
        </el-form-item>
        <el-form-item label="文档类型">
          <el-select v-model="searchForm.document_type" placeholder="请选择文档类型" clearable>
            <el-option label="操作规程" value="操作规程" />
            <el-option label="管理制度" value="管理制度" />
            <el-option label="应急预案" value="应急预案" />
            <el-option label="作业指导书" value="作业指导书" />
            <el-option label="培训记录" value="培训记录" />
          </el-select>
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="searchForm.status" placeholder="请选择状态" clearable>
            <el-option label="有效" value="有效" />
            <el-option label="失效" value="失效" />
            <el-option label="修订中" value="修订中" />
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
        <el-button type="primary" @click="handleAdd">新增文档</el-button>
      </div>
      <el-table :data="tableData" border stripe v-loading="loading">
        <el-table-column prop="document_name" label="文档名称" min-width="180" show-overflow-tooltip />
        <el-table-column prop="document_type" label="文档类型" width="120" />
        <el-table-column prop="regulation_standard" label="法规标准" min-width="120" show-overflow-tooltip />
        <el-table-column prop="version_number" label="版本号" width="100" />
        <el-table-column prop="publish_department" label="发布部门" width="120" />
        <el-table-column prop="effective_date" label="生效日期" width="120" />
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
    <el-dialog v-model="dialogVisible" title="文档详情" width="700px">
      <el-descriptions :column="2" border>
        <el-descriptions-item label="文档名称">{{ currentRow?.document_name }}</el-descriptions-item>
        <el-descriptions-item label="文档类型">{{ currentRow?.document_type }}</el-descriptions-item>
        <el-descriptions-item label="法规标准">{{ currentRow?.regulation_standard }}</el-descriptions-item>
        <el-descriptions-item label="版本号">{{ currentRow?.version_number }}</el-descriptions-item>
        <el-descriptions-item label="发布部门">{{ currentRow?.publish_department }}</el-descriptions-item>
        <el-descriptions-item label="生效日期">{{ currentRow?.effective_date }}</el-descriptions-item>
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
import { complianceApi } from '@/api/modules/compliance'

// 搜索表单
const searchForm = reactive({
  keyword: '',
  document_type: '',
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
      document_type: searchForm.document_type || undefined
    }
    const res: any = await complianceApi.listDocuments(params)
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
    document_type: '',
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

// 新增（跳转或弹窗）
const handleAdd = () => {
  // 实际项目中可能跳转到新增页面
  console.log('新增文档')
}

// 查看
const handleView = (row: any) => {
  currentRow.value = row
  dialogVisible.value = true
}

// 状态标签类型
const getStatusType = (status: string) => {
  const map: Record<string, any> = {
    '有效': 'success',
    '失效': 'danger',
    '修订中': 'warning'
  }
  return map[status] || 'info'
}

onMounted(() => {
  fetchList()
})
</script>

<style scoped>
.documents-container {
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
