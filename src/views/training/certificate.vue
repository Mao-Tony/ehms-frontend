<template>
  <div class="certificate-container">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>证书管理</span>
          <el-button type="primary" @click="handleAdd">新增证书</el-button>
        </div>
      </template>

      <!-- 搜索表单 -->
      <el-form :inline="true" :model="searchForm" class="search-form">
        <el-form-item label="证书名称">
          <el-input v-model="searchForm.keyword" placeholder="请输入证书名称" clearable />
        </el-form-item>
        <el-form-item label="持证人">
          <el-input v-model="searchForm.holder" placeholder="请输入持证人" clearable />
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="searchForm.status" placeholder="请选择状态" clearable>
            <el-option label="有效" value="valid" />
            <el-option label="即将过期" value="expiring" />
            <el-option label="已过期" value="expired" />
            <el-option label="已吊销" value="revoked" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">搜索</el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>

      <!-- 表格 -->
      <el-table :data="tableData" v-loading="loading" stripe>
        <el-table-column prop="certificateNo" label="证书编号" width="150" />
        <el-table-column prop="certificateName" label="证书名称" min-width="150" />
        <el-table-column prop="holderName" label="持证人" width="100" />
        <el-table-column prop="department" label="部门" width="120" />
        <el-table-column prop="issueDate" label="颁发日期" width="120" />
        <el-table-column prop="expiryDate" label="有效期" width="120">
          <template #default="{ row }">
            <span :class="getExpiryClass(row.expiryDate)">
              {{ row.expiryDate }}
            </span>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="证书状态" width="100">
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
        <el-form-item label="证书编号" prop="certificateNo">
          <el-input v-model="formData.certificateNo" placeholder="请输入证书编号" />
        </el-form-item>
        <el-form-item label="证书名称" prop="certificateName">
          <el-input v-model="formData.certificateName" placeholder="请输入证书名称" />
        </el-form-item>
        <el-form-item label="持证人" prop="holderName">
          <el-input v-model="formData.holderName" placeholder="请输入持证人" />
        </el-form-item>
        <el-form-item label="部门" prop="department">
          <el-input v-model="formData.department" placeholder="请输入部门" />
        </el-form-item>
        <el-form-item label="颁发日期" prop="issueDate">
          <el-date-picker
            v-model="formData.issueDate"
            type="date"
            placeholder="请选择颁发日期"
            value-format="YYYY-MM-DD"
          />
        </el-form-item>
        <el-form-item label="有效期" prop="expiryDate">
          <el-date-picker
            v-model="formData.expiryDate"
            type="date"
            placeholder="请选择有效期"
            value-format="YYYY-MM-DD"
          />
        </el-form-item>
        <el-form-item label="证书类型" prop="certificateType">
          <el-select v-model="formData.certificateType" placeholder="请选择证书类型">
            <el-option label="安全员证" value="safety" />
            <el-option label="操作证" value="operation" />
            <el-option label="资格证" value="qualification" />
            <el-option label="培训证" value="training" />
          </el-select>
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-select v-model="formData.status" placeholder="请选择状态">
            <el-option label="有效" value="valid" />
            <el-option label="即将过期" value="expiring" />
            <el-option label="已过期" value="expired" />
            <el-option label="已吊销" value="revoked" />
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
  holder: '',
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
  certificateNo: '',
  certificateName: '',
  holderName: '',
  department: '',
  issueDate: '',
  expiryDate: '',
  certificateType: '',
  status: ''
})

// 表单校验
const formRules = {
  certificateNo: [{ required: true, message: '请输入证书编号', trigger: 'blur' }],
  certificateName: [{ required: true, message: '请输入证书名称', trigger: 'blur' }],
  holderName: [{ required: true, message: '请输入持证人', trigger: 'blur' }],
  issueDate: [{ required: true, message: '请选择颁发日期', trigger: 'change' }],
  expiryDate: [{ required: true, message: '请选择有效期', trigger: 'change' }]
}

// 格式化状态
const formatStatus = (status: string) => {
  const statusMap: Record<string, string> = {
    valid: '有效',
    expiring: '即将过期',
    expired: '已过期',
    revoked: '已吊销'
  }
  return statusMap[status] || status
}

// 获取状态标签类型
const getStatusType = (status: string) => {
  const typeMap: Record<string, string> = {
    valid: 'success',
    expiring: 'warning',
    expired: 'danger',
    revoked: 'info'
  }
  return typeMap[status] || 'info'
}

// 获取过期样式
const getExpiryClass = (expiryDate: string) => {
  if (!expiryDate) return ''
  const now = new Date()
  const expiry = new Date(expiryDate)
  const thirtyDays = 30 * 24 * 60 * 60 * 1000

  if (expiry < now) return 'expired-text'
  if (expiry.getTime() - now.getTime() < thirtyDays) return 'expiring-text'
  return ''
}

// 获取列表数据
const fetchData = async () => {
  loading.value = true
  try {
    const params: any = {
      page: pagination.page,
      page_size: pagination.page_size,
      ...(searchForm.keyword && { keyword: searchForm.keyword }),
      ...(searchForm.holder && { holder: searchForm.holder }),
      ...(searchForm.status && { status: searchForm.status })
    }
    const res = await trainingApi.listCertificates(params)
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
  searchForm.holder = ''
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
  dialogTitle.value = '新增证书'
  isEdit.value = false
  Object.keys(formData).forEach(key => {
    if (key !== 'id') {
      (formData as any)[key] = ''
    }
  })
  dialogVisible.value = true
}

// 查看
const handleView = (row: any) => {
  dialogTitle.value = '查看证书'
  isEdit.value = false
  Object.assign(formData, row)
  dialogVisible.value = true
}

// 编辑
const handleEdit = (row: any) => {
  dialogTitle.value = '编辑证书'
  isEdit.value = true
  Object.assign(formData, row)
  dialogVisible.value = true
}

// 删除
const handleDelete = async (row: any) => {
  try {
    await ElMessageBox.confirm('确定要删除该证书吗？', '提示', {
      type: 'warning'
    })
    await trainingApi.deleteCertificate({ id: row.id })
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
          await trainingApi.updateCertificate(formData)
          ElMessage.success('更新成功')
        } else {
          await trainingApi.createCertificate(formData)
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
.certificate-container {
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

.expired-text {
  color: #f56c6c;
}

.expiring-text {
  color: #e6a23c;
}
</style>
