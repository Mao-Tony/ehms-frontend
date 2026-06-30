<template>
  <div class="regulations-container">
    <!-- 搜索区域 -->
    <el-card class="search-card">
      <el-form :inline="true" :model="searchForm" class="search-form">
        <el-form-item label="法规名称">
          <el-input v-model="searchForm.keyword" placeholder="请输入法规名称" clearable />
        </el-form-item>
        <el-form-item label="法规类型">
          <el-select v-model="searchForm.regulation_type" placeholder="请选择法规类型" clearable>
            <el-option label="法律" value="法律" />
            <el-option label="行政法规" value="行政法规" />
            <el-option label="部门规章" value="部门规章" />
            <el-option label="国家标准" value="国家标准" />
            <el-option label="行业标准" value="行业标准" />
            <el-option label="地方性法规" value="地方性法规" />
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
        <el-button type="primary" @click="handleAdd">新增法规</el-button>
      </div>
      <el-table :data="tableData" border stripe v-loading="loading">
        <el-table-column prop="regulation_name" label="法规名称" min-width="200" show-overflow-tooltip />
        <el-table-column prop="regulation_type" label="法规类型" width="120" />
        <el-table-column prop="scope" label="适用范围" min-width="150" show-overflow-tooltip />
        <el-table-column prop="publish_org" label="发布机构" min-width="150" />
        <el-table-column prop="publish_date" label="发布日期" width="120" />
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
    <el-dialog v-model="dialogVisible" title="法规详情" width="700px">
      <el-descriptions :column="2" border>
        <el-descriptions-item label="法规名称" :span="2">{{ currentRow?.regulation_name }}</el-descriptions-item>
        <el-descriptions-item label="法规类型">{{ currentRow?.regulation_type }}</el-descriptions-item>
        <el-descriptions-item label="适用范围">{{ currentRow?.scope }}</el-descriptions-item>
        <el-descriptions-item label="发布机构">{{ currentRow?.publish_org }}</el-descriptions-item>
        <el-descriptions-item label="发布日期">{{ currentRow?.publish_date }}</el-descriptions-item>
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
  regulation_type: ''
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
      regulation_type: searchForm.regulation_type || undefined
    }
    const res: any = await complianceApi.listRegulations(params)
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
    regulation_type: ''
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
  console.log('新增法规')
}

// 查看
const handleView = (row: any) => {
  currentRow.value = row
  dialogVisible.value = true
}

// 状态标签类型
const getStatusType = (status: string) => {
  const map: Record<string, any> = {
    '现行': 'success',
    '废止': 'danger',
    '修订中': 'warning'
  }
  return map[status] || 'info'
}

onMounted(() => {
  fetchList()
})
</script>

<style scoped>
.regulations-container {
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
