<template>
  <div class="knowledge-container">
    <!-- 搜索区域 -->
    <el-card class="search-card">
      <el-form :inline="true" :model="searchForm" class="search-form">
        <el-form-item label="知识标题">
          <el-input v-model="searchForm.keyword" placeholder="请输入知识标题" clearable />
        </el-form-item>
        <el-form-item label="知识分类">
          <el-select v-model="searchForm.category" placeholder="请选择知识分类" clearable>
            <el-option label="安全技术" value="安全技术" />
            <el-option label="安全管理" value="安全管理" />
            <el-option label="法规解读" value="法规解读" />
            <el-option label="事故案例" value="事故案例" />
            <el-option label="风险评估" value="风险评估" />
            <el-option label="应急处置" value="应急处置" />
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
        <el-button type="primary" @click="handleAdd">新增知识</el-button>
      </div>
      <el-table :data="tableData" border stripe v-loading="loading">
        <el-table-column prop="title" label="知识标题" min-width="200" show-overflow-tooltip />
        <el-table-column prop="category" label="知识分类" width="120" />
        <el-table-column prop="tags" label="标签" width="180">
          <template #default="{ row }">
            <el-tag v-for="tag in (row.tags || '').split(',')" :key="tag" size="small" style="margin-right: 4px;">
              {{ tag }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="creator" label="创建人" width="100" />
        <el-table-column prop="create_time" label="创建时间" width="160" />
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
    <el-dialog v-model="dialogVisible" title="知识详情" width="700px">
      <el-descriptions :column="2" border>
        <el-descriptions-item label="知识标题" :span="2">{{ currentRow?.title }}</el-descriptions-item>
        <el-descriptions-item label="知识分类">{{ currentRow?.category }}</el-descriptions-item>
        <el-descriptions-item label="创建人">{{ currentRow?.creator }}</el-descriptions-item>
        <el-descriptions-item label="创建时间">{{ currentRow?.create_time }}</el-descriptions-item>
        <el-descriptions-item label="标签">
          <el-tag v-for="tag in (currentRow?.tags || '').split(',')" :key="tag" size="small" style="margin-right: 4px;">
            {{ tag }}
          </el-tag>
        </el-descriptions-item>
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
  category: ''
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
      category: searchForm.category || undefined
    }
    const res: any = await complianceApi.listKnowledgeBases(params)
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
    category: ''
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
  console.log('新增知识')
}

// 查看
const handleView = (row: any) => {
  currentRow.value = row
  dialogVisible.value = true
}

// 状态标签类型
const getStatusType = (status: string) => {
  const map: Record<string, any> = {
    '已发布': 'success',
    '草稿': 'info',
    '待审核': 'warning'
  }
  return map[status] || 'info'
}

onMounted(() => {
  fetchList()
})
</script>

<style scoped>
.knowledge-container {
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
