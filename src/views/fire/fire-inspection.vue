<template>
  <div class="page-container">
    <el-card class="search-card" shadow="never">
      <el-form :inline="true" :model="searchForm">
        <el-form-item label="检查类型">
          <el-select v-model="searchForm.inspectionType" placeholder="请选择" clearable style="width: 160px">
            <el-option label="日常" value="routine" />
            <el-option label="综合" value="comprehensive" />
            <el-option label="季节性" value="seasonal" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">搜索</el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card shadow="never">
      <div class="toolbar">
        <el-button type="primary" :icon="Plus" @click="handleAdd">新增检查</el-button>
      </div>
      <el-table :data="tableData" v-loading="loading" border stripe>
        <el-table-column prop="inspectionCode" label="检查编号" width="140" />
        <el-table-column prop="inspectionType" label="类型" width="100">
          <template #default="{ row }">{{ typeLabel(row.inspectionType) }}</template>
        </el-table-column>
        <el-table-column prop="inspectionDate" label="检查日期" width="120" />
        <el-table-column prop="inspectorName" label="检查人" width="120" />
        <el-table-column prop="location" label="检查地点" min-width="160" show-overflow-tooltip />
        <el-table-column prop="result" label="结果" width="100">
          <template #default="{ row }">
            <el-tag :type="resultTag(row.result)" size="small">{{ resultLabel(row.result) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="hazardCount" label="隐患数" width="100" align="center">
          <template #default="{ row }">
            <el-tag v-if="row.hazardCount > 0" type="danger" size="small">{{ row.hazardCount }}</el-tag>
            <span v-else>0</span>
          </template>
        </el-table-column>
        <el-table-column prop="remark" label="备注" min-width="160" show-overflow-tooltip />
        <el-table-column label="操作" width="120" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" size="small" @click="handleEdit(row)">编辑</el-button>
          </template>
        </el-table-column>
      </el-table>
      <div class="pagination">
        <el-pagination
          v-model:current-page="pagination.page"
          v-model:page-size="pagination.pageSize"
          :total="pagination.total"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="fetchList"
          @current-change="fetchList"
        />
      </div>
    </el-card>

    <el-dialog v-model="dialogVisible" :title="dialogTitle" width="640px" @closed="resetForm">
      <el-form ref="formRef" :model="formData" :rules="formRules" label-width="110px">
        <el-row :gutter="12">
          <el-col :span="12">
            <el-form-item label="检查编号" prop="inspectionCode">
              <el-input v-model="formData.inspectionCode" placeholder="请输入" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="检查类型">
              <el-select v-model="formData.inspectionType" placeholder="请选择" style="width: 100%">
                <el-option label="日常" value="routine" />
                <el-option label="综合" value="comprehensive" />
                <el-option label="季节性" value="seasonal" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="检查日期">
              <el-date-picker v-model="formData.inspectionDate" type="date" value-format="YYYY-MM-DD" style="width: 100%" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="受检部门ID">
              <el-input-number v-model="formData.deptId" :min="0" controls-position="right" style="width: 100%" />
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="检查地点">
              <el-input v-model="formData.location" placeholder="请输入" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="检查结果">
              <el-select v-model="formData.result" placeholder="请选择" style="width: 100%">
                <el-option label="通过" value="pass" />
                <el-option label="不通过" value="fail" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="隐患数量">
              <el-input-number v-model="formData.hazardCount" :min="0" controls-position="right" style="width: 100%" />
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="备注">
              <el-input v-model="formData.remark" type="textarea" :rows="2" />
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="附件URL">
              <el-input v-model="formData.attachmentUrl" placeholder="附件链接" />
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="submitting" @click="handleSubmit">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts" name="FireInspection">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, type FormInstance, type FormRules } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'
import { fireApi, type FireInspection, type FireInspectionForm } from '@/api/modules/fire'

const loading = ref(false)
const submitting = ref(false)
const tableData = ref<FireInspection[]>([])
const dialogVisible = ref(false)
const dialogTitle = ref('')
const formRef = ref<FormInstance>()

const searchForm = reactive({ inspectionType: '' })
const pagination = reactive({ page: 1, pageSize: 10, total: 0 })

const formData = reactive<FireInspectionForm & { inspectionId?: number }>({
  inspectionId: undefined,
  inspectionCode: '',
  inspectionType: '',
  inspectionDate: '',
  deptId: undefined,
  location: '',
  result: '',
  hazardCount: 0,
  remark: '',
  attachmentUrl: ''
})

const formRules: FormRules = {
  inspectionCode: [{ required: true, message: '请输入检查编号', trigger: 'blur' }]
}

async function fetchList() {
  loading.value = true
  try {
    const res: any = await fireApi.listInspections({
      ...searchForm,
      page: pagination.page,
      pageSize: pagination.pageSize
    } as any)
    tableData.value = res.data?.items || res.data?.list || []
    pagination.total = res.data?.total || 0
  } catch (e) {
    console.error(e)
  } finally {
    loading.value = false
  }
}

function handleSearch() {
  pagination.page = 1
  fetchList()
}

function handleReset() {
  searchForm.inspectionType = ''
  handleSearch()
}

function handleAdd() {
  dialogTitle.value = '新增检查'
  dialogVisible.value = true
}

async function handleEdit(row: FireInspection) {
  try {
    const res: any = await fireApi.getInspection(row.inspectionId)
    const detail = res.data || row
    Object.assign(formData, detail)
    formData.inspectionId = row.inspectionId
    dialogTitle.value = '编辑检查'
    dialogVisible.value = true
  } catch (e) {
    ElMessage.error('获取详情失败')
  }
}

async function handleSubmit() {
  if (!formRef.value) return
  await formRef.value.validate(async (valid) => {
    if (!valid) return
    submitting.value = true
    try {
      const { inspectionId, ...body } = formData
      if (inspectionId) {
        await fireApi.updateInspection(inspectionId, body)
      } else {
        await fireApi.createInspection(body)
      }
      ElMessage.success('保存成功')
      dialogVisible.value = false
      fetchList()
    } catch (e) {
      ElMessage.error('保存失败')
    } finally {
      submitting.value = false
    }
  })
}

function resetForm() {
  formRef.value?.resetFields()
  Object.assign(formData, {
    inspectionId: undefined,
    inspectionCode: '',
    inspectionType: '',
    inspectionDate: '',
    deptId: undefined,
    location: '',
    result: '',
    hazardCount: 0,
    remark: '',
    attachmentUrl: ''
  })
}

function typeLabel(t?: string): string {
  const map: Record<string, string> = {
    routine: '日常',
    comprehensive: '综合',
    seasonal: '季节性'
  }
  return map[t || ''] || t || '-'
}

function resultLabel(r?: string): string {
  const map: Record<string, string> = { pass: '通过', fail: '不通过' }
  return map[r || ''] || r || '-'
}

function resultTag(r?: string): 'primary' | 'success' | 'warning' | 'info' | 'danger' {
  if (r === 'pass') return 'success'
  if (r === 'fail') return 'danger'
  return 'info'
}

onMounted(() => fetchList())
</script>

<style lang="scss" scoped>
.page-container {
  padding: 16px;
}
.search-card {
  margin-bottom: 12px;
}
.toolbar {
  margin-bottom: 12px;
}
.pagination {
  margin-top: 12px;
  display: flex;
  justify-content: flex-end;
}
</style>
