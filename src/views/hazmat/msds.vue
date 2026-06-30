<template>
  <div class="msds-page">
    <el-card class="search-card">
      <el-form :model="queryForm" inline>
        <el-form-item label="化学品">
          <el-select v-model="queryForm.chemicalId" placeholder="全部化学品" clearable filterable style="width: 200px">
            <el-option v-for="item in chemicalList" :key="item.chemicalId" :label="item.chemicalName" :value="item.chemicalId" />
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
        <el-button type="primary" @click="handleAdd"><el-icon><Plus /></el-icon>新增MSDS</el-button>
        <el-button text @click="handleRefresh"><el-icon><Refresh /></el-icon></el-button>
      </div>

      <el-table v-loading="loading" :data="tableData" stripe border>
        <el-table-column label="化学品" min-width="180" show-overflow-tooltip>
          <template #default="{ row }">{{ chemicalNameOf(row.chemicalId) }}</template>
        </el-table-column>
        <el-table-column prop="version" label="版本号" width="120" align="center" />
        <el-table-column prop="issueDate" label="发布日期" width="140" />
        <el-table-column prop="sdsUrl" label="SDS文件" min-width="200" show-overflow-tooltip>
          <template #default="{ row }">
            <a v-if="row.sdsUrl" :href="row.sdsUrl" target="_blank" class="link">{{ row.sdsUrl }}</a>
            <span v-else>-</span>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="220" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link size="small" @click="handleView(row)">查看</el-button>
            <el-button type="primary" link size="small" @click="handleEdit(row)">编辑</el-button>
            <el-button v-if="row.sdsUrl" type="success" link size="small" @click="handleDownload(row)">下载</el-button>
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

    <el-dialog v-model="dialogVisible" :title="isEdit ? '编辑MSDS' : '新增MSDS'" width="640px" destroy-on-close>
      <el-form ref="formRef" :model="formData" :rules="formRules" label-width="120px">
        <el-form-item label="化学品" prop="chemicalId" v-if="!isEdit">
          <el-select v-model="formData.chemicalId" placeholder="请选择化学品" filterable style="width: 100%">
            <el-option v-for="item in chemicalList" :key="item.chemicalId" :label="item.chemicalName" :value="item.chemicalId" />
          </el-select>
        </el-form-item>
        <el-form-item label="版本号" prop="version">
          <el-input v-model="formData.version" placeholder="如：V1.0" />
        </el-form-item>
        <el-form-item label="发布日期">
          <el-date-picker v-model="formData.issueDate" type="date" value-format="YYYY-MM-DD" style="width: 100%" />
        </el-form-item>
        <el-form-item label="SDS文件URL">
          <el-input v-model="formData.sdsUrl" placeholder="请输入SDS文件URL" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="submitLoading" @click="handleSubmit">确定</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="viewDialogVisible" title="MSDS详情" width="700px" destroy-on-close>
      <el-descriptions :column="2" border v-if="currentRow">
        <el-descriptions-item label="化学品" :span="2">{{ chemicalNameOf(currentRow.chemicalId) }}</el-descriptions-item>
        <el-descriptions-item label="版本号">{{ currentRow.version || '-' }}</el-descriptions-item>
        <el-descriptions-item label="发布日期">{{ currentRow.issueDate || '-' }}</el-descriptions-item>
        <el-descriptions-item label="SDS文件" :span="2">
          <a v-if="currentRow.sdsUrl" :href="currentRow.sdsUrl" target="_blank" class="link">{{ currentRow.sdsUrl }}</a>
          <span v-else>-</span>
        </el-descriptions-item>
      </el-descriptions>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { Plus, Refresh } from '@element-plus/icons-vue'
import { hazmatApi } from '@/api/modules/hazmat'

const loading = ref(false)
const dialogVisible = ref(false)
const viewDialogVisible = ref(false)
const submitLoading = ref(false)
const isEdit = ref(false)
const formRef = ref()
const chemicalList = ref([])
const currentRow = ref(null)

const queryForm = reactive({ chemicalId: undefined })
const pagination = reactive({ page: 1, pageSize: 20, total: 0 })
const tableData = ref([])

const initForm = () => ({
  msdsId: null,
  chemicalId: undefined,
  version: '',
  issueDate: '',
  sdsUrl: ''
})
const formData = reactive(initForm())

const formRules = {
  chemicalId: [{ required: true, message: '请选择化学品', trigger: 'change' }],
  version: [{ required: true, message: '请输入版本号', trigger: 'blur' }]
}

const chemicalNameOf = (chemicalId) => {
  const c = chemicalList.value.find(x => x.chemicalId === chemicalId)
  return c ? c.chemicalName : `#${chemicalId}`
}

const loadData = async () => {
  loading.value = true
  try {
    const params = {
      page: pagination.page,
      pageSize: pagination.pageSize,
      chemicalId: queryForm.chemicalId
    }
    Object.keys(params).forEach(k => (params[k] === '' || params[k] === undefined) && delete params[k])
    const res = await hazmatApi.listMsds(params)
    tableData.value = res.items || res.list || res.data || []
    pagination.total = res.total || 0
  } catch {
    ElMessage.error('加载MSDS列表失败')
  } finally {
    loading.value = false
  }
}

const loadChemicals = async () => {
  try {
    const res = await hazmatApi.list({ page: 1, pageSize: 200 })
    chemicalList.value = res.items || res.list || res.data || []
  } catch { /* ignore */ }
}

const handleSearch = () => { pagination.page = 1; loadData() }
const handleReset = () => { Object.assign(queryForm, { chemicalId: undefined }); handleSearch() }
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
  currentRow.value = row
  viewDialogVisible.value = true
}

const handleDownload = (row) => {
  if (row.sdsUrl) window.open(row.sdsUrl, '_blank')
}

const handleSubmit = async () => {
  if (!formRef.value) return
  await formRef.value.validate(async (valid) => {
    if (!valid) return
    submitLoading.value = true
    try {
      if (isEdit.value) {
        await hazmatApi.updateMsds(formData.msdsId, formData)
        ElMessage.success('更新成功')
      } else {
        await hazmatApi.createMsds(formData.chemicalId, formData)
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

onMounted(() => {
  loadChemicals()
  loadData()
})
</script>

<style scoped>
.msds-page { padding: 16px; }
.search-card, .table-card { margin-bottom: 16px; }
.toolbar { display: flex; justify-content: space-between; margin-bottom: 12px; }
.pagination-wrapper { margin-top: 16px; display: flex; justify-content: flex-end; }
.link { color: #409eff; text-decoration: none; }
.link:hover { text-decoration: underline; }
</style>
