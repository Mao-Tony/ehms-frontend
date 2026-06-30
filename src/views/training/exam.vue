<template>
  <div class="exam-container">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>在线考试管理</span>
          <el-button type="primary" @click="handleAdd">新增考试</el-button>
        </div>
      </template>

      <!-- 搜索表单 -->
      <el-form :inline="true" :model="searchForm" class="search-form">
        <el-form-item label="考试名称">
          <el-input v-model="searchForm.keyword" placeholder="请输入考试名称" clearable />
        </el-form-item>
        <el-form-item label="考试类型">
          <el-select v-model="searchForm.exam_type" placeholder="请选择考试类型" clearable>
            <el-option label="理论考试" value="theory" />
            <el-option label="实操考试" value="practical" />
            <el-option label="综合考试" value="comprehensive" />
            <el-option label="模拟考试" value="simulation" />
          </el-select>
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="searchForm.status" placeholder="请选择状态" clearable>
            <el-option label="未开始" value="not_started" />
            <el-option label="进行中" value="ongoing" />
            <el-option label="已结束" value="ended" />
            <el-option label="已取消" value="cancelled" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">搜索</el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>

      <!-- 表格 -->
      <el-table :data="tableData" v-loading="loading" stripe>
        <el-table-column prop="examName" label="考试名称" min-width="150" />
        <el-table-column prop="examType" label="考试类型" width="100">
          <template #default="{ row }">
            <el-tag>{{ formatType(row.examType) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="relatedCourse" label="关联课程" min-width="120" />
        <el-table-column prop="totalScore" label="总分" width="80" />
        <el-table-column prop="passScore" label="及格分" width="80" />
        <el-table-column prop="duration" label="考试时长(分钟)" width="120" />
        <el-table-column prop="examinedCount" label="参考人数" width="100" />
        <el-table-column prop="passedCount" label="通过人数" width="100">
          <template #default="{ row }">
            <span :class="{ 'pass-rate': row.examinedCount > 0 }">
              {{ row.passedCount }}
              <span v-if="row.examinedCount > 0" class="rate">
                ({{ ((row.passedCount / row.examinedCount) * 100).toFixed(1) }}%)
              </span>
            </span>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)">{{ formatStatus(row.status) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="180" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" size="small" @click="handleView(row)">查看</el-button>
            <el-button link type="primary" size="small" @click="handleEdit(row)">编辑</el-button>
            <el-button link type="danger" size="small" @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="pagination">
        <el-pagination
          v-model:current-page="pagination.page"
          v-model:page-size="pagination.page_size"
          :page-sizes="[10, 20, 50, 100]"
          :total="pagination.total"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>

    <!-- 新增/编辑弹窗 -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogTitle"
      width="600px"
      @close="handleDialogClose"
    >
      <el-form ref="formRef" :model="formData" :rules="formRules" label-width="110px">
        <el-form-item label="考试名称" prop="examName">
          <el-input v-model="formData.examName" placeholder="请输入考试名称" />
        </el-form-item>
        <el-form-item label="考试类型" prop="examType">
          <el-select v-model="formData.examType" placeholder="请选择考试类型">
            <el-option label="理论考试" value="theory" />
            <el-option label="实操考试" value="practical" />
            <el-option label="综合考试" value="comprehensive" />
            <el-option label="模拟考试" value="simulation" />
          </el-select>
        </el-form-item>
        <el-form-item label="关联课程" prop="relatedCourse">
          <el-input v-model="formData.relatedCourse" placeholder="请输入关联课程" />
        </el-form-item>
        <el-form-item label="总分" prop="totalScore">
          <el-input-number v-model="formData.totalScore" :min="0" :precision="0" />
        </el-form-item>
        <el-form-item label="及格分" prop="passScore">
          <el-input-number v-model="formData.passScore" :min="0" :precision="0" />
        </el-form-item>
        <el-form-item label="考试时长(分钟)" prop="duration">
          <el-input-number v-model="formData.duration" :min="1" :precision="0" />
        </el-form-item>
        <el-form-item label="考试说明" prop="description">
          <el-input v-model="formData.description" type="textarea" :rows="3" placeholder="请输入考试说明" />
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-select v-model="formData.status" placeholder="请选择状态">
            <el-option label="未开始" value="not_started" />
            <el-option label="进行中" value="ongoing" />
            <el-option label="已结束" value="ended" />
            <el-option label="已取消" value="cancelled" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { trainingApi } from '@/api/modules/training'

// 搜索表单
const searchForm = reactive({
  keyword: '',
  exam_type: '',
  status: ''
})

// 表格数据
const tableData = ref([])
const loading = ref(false)

// 分页
const pagination = reactive({
  page: 1,
  page_size: 10,
  total: 0
})

// 弹窗
const dialogVisible = ref(false)
const dialogTitle = ref('')
const formRef = ref()
const isEdit = ref(false)

// 表单数据
const formData = reactive({
  id: '',
  examName: '',
  examType: '',
  relatedCourse: '',
  totalScore: 100,
  passScore: 60,
  duration: 60,
  description: '',
  examinedCount: 0,
  passedCount: 0,
  status: ''
})

// 表单校验
const formRules = {
  examName: [{ required: true, message: '请输入考试名称', trigger: 'blur' }],
  examType: [{ required: true, message: '请选择考试类型', trigger: 'change' }],
  totalScore: [{ required: true, message: '请输入总分', trigger: 'blur' }],
  passScore: [{ required: true, message: '请输入及格分', trigger: 'blur' }],
  duration: [{ required: true, message: '请输入考试时长', trigger: 'blur' }]
}

// 格式化考试类型
const formatType = (type: string) => {
  const typeMap: Record<string, string> = {
    theory: '理论考试',
    practical: '实操考试',
    comprehensive: '综合考试',
    simulation: '模拟考试'
  }
  return typeMap[type] || type
}

// 格式化状态
const formatStatus = (status: string) => {
  const statusMap: Record<string, string> = {
    not_started: '未开始',
    ongoing: '进行中',
    ended: '已结束',
    cancelled: '已取消'
  }
  return statusMap[status] || status
}

// 获取状态标签类型
const getStatusType = (status: string) => {
  const typeMap: Record<string, string> = {
    not_started: 'info',
    ongoing: 'primary',
    ended: 'success',
    cancelled: 'danger'
  }
  return typeMap[status] || 'info'
}

// 获取列表数据
const fetchData = async () => {
  loading.value = true
  try {
    const params: any = {
      page: pagination.page,
      page_size: pagination.page_size,
      ...(searchForm.keyword && { keyword: searchForm.keyword }),
      ...(searchForm.exam_type && { exam_type: searchForm.exam_type }),
      ...(searchForm.status && { status: searchForm.status })
    }
    const res = await trainingApi.listExams(params)
    tableData.value = res.data?.list || res.data || []
    pagination.total = res.data?.total || res.total || 0
  } catch (error) {
    ElMessage.error('获取数据失败')
  } finally {
    loading.value = false
  }
}

// 搜索
const handleSearch = () => {
  pagination.page = 1
  fetchData()
}

// 重置
const handleReset = () => {
  searchForm.keyword = ''
  searchForm.exam_type = ''
  searchForm.status = ''
  handleSearch()
}

// 分页
const handleSizeChange = () => {
  fetchData()
}

const handleCurrentChange = () => {
  fetchData()
}

// 新增
const handleAdd = () => {
  dialogTitle.value = '新增考试'
  isEdit.value = false
  Object.keys(formData).forEach(key => {
    if (key !== 'id') {
      if (key === 'totalScore') {
        (formData as any)[key] = 100
      } else if (key === 'passScore') {
        (formData as any)[key] = 60
      } else if (key === 'duration') {
        (formData as any)[key] = 60
      } else if (key === 'examinedCount' || key === 'passedCount') {
        (formData as any)[key] = 0
      } else {
        (formData as any)[key] = ''
      }
    }
  })
  dialogVisible.value = true
}

// 查看
const handleView = (row: any) => {
  dialogTitle.value = '查看考试'
  isEdit.value = false
  Object.assign(formData, row)
  dialogVisible.value = true
}

// 编辑
const handleEdit = (row: any) => {
  dialogTitle.value = '编辑考试'
  isEdit.value = true
  Object.assign(formData, row)
  dialogVisible.value = true
}

// 删除
const handleDelete = async (row: any) => {
  try {
    await ElMessageBox.confirm('确定要删除该考试吗？', '提示', {
      type: 'warning'
    })
    await trainingApi.deleteExam({ id: row.id })
    ElMessage.success('删除成功')
    fetchData()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('删除失败')
    }
  }
}

// 提交
const handleSubmit = async () => {
  if (!formRef.value) return
  await formRef.value.validate(async (valid) => {
    if (valid) {
      try {
        if (isEdit.value) {
          await trainingApi.updateExam(formData)
          ElMessage.success('更新成功')
        } else {
          await trainingApi.createExam(formData)
          ElMessage.success('创建成功')
        }
        dialogVisible.value = false
        fetchData()
      } catch (error) {
        ElMessage.error(isEdit.value ? '更新失败' : '创建失败')
      }
    }
  })
}

// 弹窗关闭
const handleDialogClose = () => {
  formRef.value?.resetFields()
}

onMounted(() => {
  fetchData()
})
</script>

<style scoped>
.exam-container {
  padding: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.search-form {
  margin-bottom: 20px;
}

.pagination {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}

.pass-rate {
  color: #67c23a;
}

.rate {
  font-size: 12px;
  margin-left: 4px;
}
</style>
