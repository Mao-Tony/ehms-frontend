<template>
  <div class="examination-page">
    <el-card class="search-card">
      <el-form :model="queryForm" inline>
        <el-form-item label="员工ID">
          <el-input v-model="queryForm.userId" placeholder="员工ID" clearable style="width: 130px" />
        </el-form-item>
        <el-form-item label="体检类型">
          <el-select v-model="queryForm.examType" placeholder="请选择" clearable style="width: 150px">
            <el-option v-for="(label, value) in typeMap" :key="value" :label="label" :value="value" />
          </el-select>
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="queryForm.examStatus" placeholder="请选择" clearable style="width: 130px">
            <el-option v-for="(label, value) in statusMap" :key="value" :label="label" :value="value" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch" :loading="loading">查询</el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card class="table-card">
      <div class="toolbar">
        <el-button type="primary" @click="handleAdd"><el-icon><Plus /></el-icon>新增体检</el-button>
        <el-button text @click="handleRefresh"><el-icon><Refresh /></el-icon></el-button>
      </div>

      <el-table v-loading="loading" :data="tableData" stripe border>
        <el-table-column prop="examId" label="ID" width="80" align="center" />
        <el-table-column prop="userId" label="员工ID" width="100" align="center" />
        <el-table-column prop="examType" label="体检类型" width="130" align="center">
          <template #default="{ row }">
            <el-tag>{{ typeName(row.examType) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="examInstitution" label="体检机构" min-width="160" show-overflow-tooltip />
        <el-table-column prop="examDate" label="体检日期" width="120" />
        <el-table-column prop="examStatus" label="状态" width="110" align="center">
          <template #default="{ row }">
            <el-tag :type="statusTag(row.examStatus)">{{ statusName(row.examStatus) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="healthRecordId" label="健康档案ID" width="120" align="center" />
        <el-table-column prop="reportUrl" label="体检报告" min-width="180" show-overflow-tooltip>
          <template #default="{ row }">
            <a v-if="row.reportUrl" :href="row.reportUrl" target="_blank" class="link">查看报告</a>
            <span v-else>-</span>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="180" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link size="small" @click="handleEdit(row)">编辑</el-button>
            <el-button type="danger" link size="small" @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <div class="pagination-wrapper">
        <el-pagination
          v-model:current-page="pagination.page"
          v-model:page-size="pagination.pageSize"
          :total="pagination.total" :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="loadData" @current-change="loadData"
        />
      </div>
    </el-card>

    <el-dialog v-model="dialogVisible" :title="isEdit ? '编辑体检记录' : '新增体检记录'" width="640px" destroy-on-close>
      <el-form ref="formRef" :model="formData" :rules="formRules" label-width="120px">
        <el-row :gutter="16">
          <el-col :span="12">
            <el-form-item label="员工ID" prop="userId">
              <el-input v-model="formData.userId" placeholder="请输入员工ID" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="健康档案ID">
              <el-input v-model="formData.healthRecordId" placeholder="关联档案ID" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="体检类型" prop="examType">
              <el-select v-model="formData.examType" placeholder="请选择" style="width: 100%">
                <el-option v-for="(label, value) in typeMap" :key="value" :label="label" :value="value" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="体检状态">
              <el-select v-model="formData.examStatus" placeholder="请选择" style="width: 100%">
                <el-option v-for="(label, value) in statusMap" :key="value" :label="label" :value="value" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="体检日期" prop="examDate">
              <el-date-picker v-model="formData.examDate" type="date" value-format="YYYY-MM-DD" style="width: 100%" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="体检机构">
              <el-input v-model="formData.examInstitution" placeholder="请输入" />
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="体检报告URL">
              <el-input v-model="formData.reportUrl" placeholder="请输入报告文件URL" />
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="submitLoading" @click="handleSubmit">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Refresh } from '@element-plus/icons-vue'
import { healthApi } from '@/api/modules/health'

const loading = ref(false)
const dialogVisible = ref(false)
const submitLoading = ref(false)
const isEdit = ref(false)
const formRef = ref()

const queryForm = reactive({ userId: '', examType: '', examStatus: '' })
const pagination = reactive({ page: 1, pageSize: 20, total: 0 })
const tableData = ref([])

const initForm = () => ({
  examId: null,
  userId: '',
  healthRecordId: '',
  examType: '',
  examInstitution: '',
  examDate: '',
  examStatus: 'pending',
  reportUrl: ''
})
const formData = reactive(initForm())

const formRules = {
  userId: [{ required: true, message: '请输入员工ID', trigger: 'blur' }],
  examType: [{ required: true, message: '请选择体检类型', trigger: 'change' }],
  examDate: [{ required: true, message: '请选择体检日期', trigger: 'change' }]
}

const typeMap = {
  pre_employment: '上岗前体检',
  on_duty: '在岗体检',
  exit: '离岗体检',
  emergency: '应急体检',
  regular: '定期体检'
}
const statusMap = { pending: '待体检', completed: '已完成', cancelled: '已取消', abnormal: '结果异常' }

const typeName = (v) => typeMap[v] || v
const statusName = (v) => statusMap[v] || v
const statusTag = (v) => ({ pending: 'warning', completed: 'success', cancelled: 'info', abnormal: 'danger' }[v] || 'info')

const loadData = async () => {
  loading.value = true
  try {
    const params = { page: pagination.page, pageSize: pagination.pageSize, ...queryForm }
    Object.keys(params).forEach(k => params[k] === '' && delete params[k])
    const res = await healthApi.listExaminations(params)
    tableData.value = res.items || res.list || res.data || []
    pagination.total = res.total || 0
  } catch {
    ElMessage.error('加载体检记录失败')
  } finally {
    loading.value = false
  }
}

const handleSearch = () => { pagination.page = 1; loadData() }
const handleReset = () => { Object.assign(queryForm, { userId: '', examType: '', examStatus: '' }); handleSearch() }
const handleRefresh = () => loadData()

const handleAdd = () => {
  isEdit.value = false
  Object.assign(formData, initForm())
  dialogVisible.value = true
}

const handleEdit = (row) => {
  isEdit.value = true
  Object.assign(formData, initForm(), row)
  dialogVisible.value = true
}

const handleDelete = (row) => {
  ElMessageBox.confirm(`确认删除该体检记录？`, '删除确认', { type: 'warning' })
    .then(async () => {
      try {
        await healthApi.deleteExamination(row.examId)
        ElMessage.success('删除成功')
        loadData()
      } catch {
        ElMessage.error('删除失败')
      }
    }).catch(() => {})
}

const handleSubmit = async () => {
  if (!formRef.value) return
  await formRef.value.validate(async (valid) => {
    if (!valid) return
    submitLoading.value = true
    try {
      if (isEdit.value) {
        await healthApi.updateExamination(formData.examId, formData)
        ElMessage.success('更新成功')
      } else {
        await healthApi.createExamination(formData)
        ElMessage.success('创建成功')
      }
      dialogVisible.value = false
      loadData()
    } catch {
      ElMessage.error('保存失败')
    } finally {
      submitLoading.value = false
    }
  })
}

onMounted(loadData)
</script>

<style scoped>
.examination-page { padding: 16px; }
.search-card, .table-card { margin-bottom: 16px; }
.toolbar { display: flex; justify-content: space-between; margin-bottom: 12px; }
.pagination-wrapper { margin-top: 16px; display: flex; justify-content: flex-end; }
.link { color: #409eff; text-decoration: none; }
.link:hover { text-decoration: underline; }
</style>
