<template>
  <div class="courses-container">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>培训课程管理</span>
          <el-button type="primary" @click="handleAdd">新增课程</el-button>
        </div>
      </template>

      <!-- 搜索表单 -->
      <el-form :inline="true" :model="searchForm" class="search-form">
        <el-form-item label="课程名称">
          <el-input v-model="searchForm.keyword" placeholder="请输入课程名称" clearable />
        </el-form-item>
        <el-form-item label="课程类型">
          <el-select v-model="searchForm.course_type" placeholder="请选择课程类型" clearable>
            <el-option label="安全培训" value="safety" />
            <el-option label="技能培训" value="skill" />
            <el-option label="岗前培训" value="pre_job" />
            <el-option label="在岗培训" value="on_job" />
            <el-option label="应急培训" value="emergency" />
          </el-select>
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="searchForm.status" placeholder="请选择状态" clearable>
            <el-option label="报名中" value="enrolling" />
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
        <el-table-column prop="courseName" label="课程名称" min-width="150" />
        <el-table-column prop="courseType" label="课程类型" width="100">
          <template #default="{ row }">
            <el-tag>{{ formatType(row.courseType) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="instructor" label="授课人" width="100" />
        <el-table-column prop="courseHours" label="学时" width="80" />
        <el-table-column prop="plannedCount" label="计划人数" width="100" />
        <el-table-column prop="enrolledCount" label="报名人数" width="100">
          <template #default="{ row }">
            <span :class="{ 'low-stock': row.enrolledCount < row.plannedCount * 0.5 }">
              {{ row.enrolledCount }}
            </span>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="课程状态" width="100">
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
      <el-form ref="formRef" :model="formData" :rules="formRules" label-width="100px">
        <el-form-item label="课程名称" prop="courseName">
          <el-input v-model="formData.courseName" placeholder="请输入课程名称" />
        </el-form-item>
        <el-form-item label="课程类型" prop="courseType">
          <el-select v-model="formData.courseType" placeholder="请选择课程类型">
            <el-option label="安全培训" value="safety" />
            <el-option label="技能培训" value="skill" />
            <el-option label="岗前培训" value="pre_job" />
            <el-option label="在岗培训" value="on_job" />
            <el-option label="应急培训" value="emergency" />
          </el-select>
        </el-form-item>
        <el-form-item label="授课人" prop="instructor">
          <el-input v-model="formData.instructor" placeholder="请输入授课人" />
        </el-form-item>
        <el-form-item label="学时" prop="courseHours">
          <el-input-number v-model="formData.courseHours" :min="1" :precision="0" />
        </el-form-item>
        <el-form-item label="计划人数" prop="plannedCount">
          <el-input-number v-model="formData.plannedCount" :min="1" :precision="0" />
        </el-form-item>
        <el-form-item label="课程描述" prop="description">
          <el-input v-model="formData.description" type="textarea" :rows="3" placeholder="请输入课程描述" />
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-select v-model="formData.status" placeholder="请选择状态">
            <el-option label="报名中" value="enrolling" />
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
  course_type: '',
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
  courseName: '',
  courseType: '',
  instructor: '',
  courseHours: 1,
  plannedCount: 1,
  enrolledCount: 0,
  description: '',
  status: ''
})

// 表单校验
const formRules = {
  courseName: [{ required: true, message: '请输入课程名称', trigger: 'blur' }],
  courseType: [{ required: true, message: '请选择课程类型', trigger: 'change' }],
  instructor: [{ required: true, message: '请输入授课人', trigger: 'blur' }],
  courseHours: [{ required: true, message: '请输入学时', trigger: 'blur' }],
  plannedCount: [{ required: true, message: '请输入计划人数', trigger: 'blur' }]
}

// 格式化课程类型
const formatType = (type: string) => {
  const typeMap: Record<string, string> = {
    safety: '安全培训',
    skill: '技能培训',
    pre_job: '岗前培训',
    on_job: '在岗培训',
    emergency: '应急培训'
  }
  return typeMap[type] || type
}

// 格式化状态
const formatStatus = (status: string) => {
  const statusMap: Record<string, string> = {
    enrolling: '报名中',
    ongoing: '进行中',
    ended: '已结束',
    cancelled: '已取消'
  }
  return statusMap[status] || status
}

// 获取状态标签类型
const getStatusType = (status: string) => {
  const typeMap: Record<string, string> = {
    enrolling: 'success',
    ongoing: 'primary',
    ended: 'info',
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
      ...(searchForm.course_type && { course_type: searchForm.course_type }),
      ...(searchForm.status && { status: searchForm.status })
    }
    const res = await trainingApi.listCourses(params)
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
  searchForm.course_type = ''
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
  dialogTitle.value = '新增课程'
  isEdit.value = false
  Object.keys(formData).forEach(key => {
    if (key !== 'id') {
      if (key === 'courseHours' || key === 'plannedCount') {
        (formData as any)[key] = 1
      } else if (key === 'enrolledCount') {
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
  dialogTitle.value = '查看课程'
  isEdit.value = false
  Object.assign(formData, row)
  dialogVisible.value = true
}

// 编辑
const handleEdit = (row: any) => {
  dialogTitle.value = '编辑课程'
  isEdit.value = true
  Object.assign(formData, row)
  dialogVisible.value = true
}

// 删除
const handleDelete = async (row: any) => {
  try {
    await ElMessageBox.confirm('确定要删除该课程吗？', '提示', {
      type: 'warning'
    })
    await trainingApi.deleteCourse({ id: row.id })
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
          await trainingApi.updateCourse(formData)
          ElMessage.success('更新成功')
        } else {
          await trainingApi.createCourse(formData)
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
.courses-container {
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

.low-stock {
  color: #e6a23c;
  font-weight: bold;
}
</style>
