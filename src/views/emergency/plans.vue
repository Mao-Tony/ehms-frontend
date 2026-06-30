<template>
  <div class="plans-page">
    <el-card class="search-card">
      <el-form :model="queryForm" inline>
        <el-form-item label="预案名称">
          <el-input v-model="queryForm.planName" placeholder="请输入预案名称" clearable style="width:200px" />
        </el-form-item>
        <el-form-item label="预案级别">
          <el-select v-model="queryForm.planLevel" placeholder="请选择" clearable style="width:150px">
            <el-option v-for="(label, value) in levelMap" :key="value" :label="label" :value="value" />
          </el-select>
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="queryForm.status" placeholder="请选择" clearable style="width:120px">
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
        <el-button type="primary" @click="handleAdd">
          <el-icon><Plus /></el-icon>新增预案
        </el-button>
        <el-button text @click="handleRefresh"><el-icon><Refresh /></el-icon></el-button>
      </div>
      <el-table v-loading="loading" :data="tableData" stripe border>
        <el-table-column prop="planCode" label="预案编号" width="160" />
        <el-table-column prop="planName" label="预案名称" min-width="180" show-overflow-tooltip />
        <el-table-column prop="planLevel" label="预案级别" width="120" align="center">
          <template #default="{ row }"><el-tag>{{ levelName(row.planLevel) }}</el-tag></template>
        </el-table-column>
        <el-table-column prop="applicableScenario" label="适用场景" min-width="150" show-overflow-tooltip />
        <el-table-column prop="version" label="版本号" width="90" align="center" />
        <el-table-column prop="effectiveDate" label="生效日期" width="120" />
        <el-table-column prop="nextReviewDate" label="下次评审" width="120" />
        <el-table-column prop="status" label="状态" width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="statusTag(row.status)">{{ statusName(row.status) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="180" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link size="small" @click="handleView(row)">查看</el-button>
            <el-button type="primary" link size="small" @click="handleEdit(row)">编辑</el-button>
            <el-button type="danger" link size="small" @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
      <div class="pagination-wrapper">
        <el-pagination
          v-model:current-page="pagination.page"
          v-model:page-size="pagination.pageSize"
          :total="pagination.total" :page-sizes="[10,20,50,100]"
          layout="total,sizes,prev,pager,next,jumper"
          @size-change="loadData" @current-change="loadData"
        />
      </div>
    </el-card>

    <el-dialog v-model="dialogVisible" :title="isEdit ? '编辑预案' : '新增预案'" width="720px" destroy-on-close>
      <el-form ref="formRef" :model="formData" :rules="formRules" label-width="110px">
        <el-row :gutter="16">
          <el-col :span="12">
            <el-form-item label="预案编号" prop="planCode">
              <el-input v-model="formData.planCode" placeholder="请输入预案编号" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="预案名称" prop="planName">
              <el-input v-model="formData.planName" placeholder="请输入预案名称" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="预案级别" prop="planLevel">
              <el-select v-model="formData.planLevel" placeholder="请选择" style="width:100%">
                <el-option v-for="(label, value) in levelMap" :key="value" :label="label" :value="value" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="状态" prop="status">
              <el-select v-model="formData.status" placeholder="请选择" style="width:100%">
                <el-option v-for="(label, value) in statusMap" :key="value" :label="label" :value="value" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="版本号">
              <el-input-number v-model="formData.version" :min="1" style="width:100%" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="生效日期">
              <el-date-picker v-model="formData.effectiveDate" type="date" value-format="YYYY-MM-DD" style="width:100%" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="下次评审">
              <el-date-picker v-model="formData.nextReviewDate" type="date" value-format="YYYY-MM-DD" style="width:100%" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="预案文件">
              <el-input v-model="formData.fileUrl" placeholder="请输入文件URL" />
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="适用场景" prop="applicableScenario">
              <el-input v-model="formData.applicableScenario" type="textarea" :rows="2" placeholder="请输入" />
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible=false">取消</el-button>
        <el-button type="primary" :loading="submitLoading" @click="handleSubmit">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { reactive, ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Refresh } from '@element-plus/icons-vue'
import { emergencyApi } from '@/api/modules/emergency'

const loading = ref(false)
const submitLoading = ref(false)
const tableData = ref([])
const dialogVisible = ref(false)
const isEdit = ref(false)
const formRef = ref()

const queryForm = reactive({ planName: '', planLevel: '', status: '' })
const pagination = reactive({ page: 1, pageSize: 20, total: 0 })

const initForm = () => ({
  planId: null,
  planCode: '',
  planName: '',
  planLevel: '',
  applicableScenario: '',
  version: 1,
  effectiveDate: '',
  nextReviewDate: '',
  status: 'draft',
  fileUrl: ''
})
const formData = reactive(initForm())

const formRules = {
  planCode: [{ required: true, message: '请输入预案编号', trigger: 'blur' }],
  planName: [{ required: true, message: '请输入预案名称', trigger: 'blur' }],
  planLevel: [{ required: true, message: '请选择预案级别', trigger: 'change' }]
}

const levelMap = { company: '公司级', workshop: '车间级', site: '现场级', special: '专项级' }
const statusMap = { draft: '编制中', reviewing: '审核中', published: '已发布', obsolete: '已废止' }

const levelName = (v) => levelMap[v] || v
const statusName = (v) => statusMap[v] || v
const statusTag = (v) => ({ draft: 'info', reviewing: 'warning', published: 'success', obsolete: 'danger' }[v] || 'info')

const loadData = async () => {
  loading.value = true
  try {
    const params = { page: pagination.page, pageSize: pagination.pageSize, ...queryForm }
    Object.keys(params).forEach(k => params[k] === '' && delete params[k])
    const res = await emergencyApi.listPlans(params)
    tableData.value = res.items || res.list || res.data || []
    pagination.total = res.total || 0
  } catch {
    ElMessage.error('加载预案列表失败')
  } finally {
    loading.value = false
  }
}

const handleSearch = () => { pagination.page = 1; loadData() }
const handleReset = () => { Object.assign(queryForm, { planName: '', planLevel: '', status: '' }); handleSearch() }
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

const handleView = (row) => {
  ElMessageBox.alert(
    `<p><b>预案编号：</b>${row.planCode || '-'}</p>
     <p><b>预案名称：</b>${row.planName || '-'}</p>
     <p><b>预案级别：</b>${levelName(row.planLevel)}</p>
     <p><b>适用场景：</b>${row.applicableScenario || '-'}</p>
     <p><b>版本号：</b>V${row.version || 1}</p>
     <p><b>生效日期：</b>${row.effectiveDate || '-'}</p>
     <p><b>状态：</b>${statusName(row.status)}</p>`,
    '预案详情',
    { dangerouslyUseHTMLString: true, confirmButtonText: '关闭' }
  ).catch(() => {})
}

const handleDelete = (row) => {
  ElMessageBox.confirm(`确认删除预案「${row.planName}」？`, '删除确认', { type: 'warning' })
    .then(async () => {
      try {
        await emergencyApi.deletePlan(row.planId)
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
        await emergencyApi.updatePlan(formData.planId, formData)
        ElMessage.success('更新成功')
      } else {
        await emergencyApi.createPlan(formData)
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
.plans-page { padding: 16px; }
.search-card, .table-card { margin-bottom: 16px; }
.toolbar { display: flex; justify-content: space-between; margin-bottom: 12px; }
.pagination-wrapper { margin-top: 16px; display: flex; justify-content: flex-end; }
</style>
