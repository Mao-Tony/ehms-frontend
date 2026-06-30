<template>
  <div class="page-container">
    <el-card class="search-card" shadow="never">
      <el-form :inline="true" :model="searchForm">
        <el-form-item label="设备编码">
          <el-input v-model="searchForm.equipmentCode" placeholder="请输入" clearable />
        </el-form-item>
        <el-form-item label="设备类型">
          <el-select v-model="searchForm.equipmentType" placeholder="请选择" clearable style="width: 160px">
            <el-option label="消防栓" value="hydrant" />
            <el-option label="灭火器" value="extinguisher" />
            <el-option label="报警器" value="alarm" />
            <el-option label="喷淋系统" value="sprinkler" />
            <el-option label="疏散设施" value="evacuation" />
          </el-select>
        </el-form-item>
        <el-form-item label="厂区">
          <el-input v-model="searchForm.factoryArea" placeholder="请输入" clearable />
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="searchForm.status" placeholder="请选择" clearable style="width: 140px">
            <el-option label="正常" value="normal" />
            <el-option label="待维保" value="pending_maintenance" />
            <el-option label="维保中" value="maintaining" />
            <el-option label="异常" value="abnormal" />
            <el-option label="停用" value="disabled" />
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
        <el-button type="primary" :icon="Plus" @click="handleAdd">新增设备</el-button>
      </div>
      <el-table :data="tableData" v-loading="loading" border stripe>
        <el-table-column prop="equipmentCode" label="设备编码" width="140" />
        <el-table-column prop="equipmentName" label="设备名称" min-width="160" />
        <el-table-column prop="equipmentType" label="类型" width="110">
          <template #default="{ row }">{{ typeLabel(row.equipmentType) }}</template>
        </el-table-column>
        <el-table-column prop="factoryArea" label="厂区" width="120" />
        <el-table-column prop="location" label="安装位置" min-width="160" show-overflow-tooltip />
        <el-table-column prop="brand" label="品牌" width="120" />
        <el-table-column prop="installDate" label="安装日期" width="110" />
        <el-table-column prop="nextInspectDate" label="下次检验" width="110">
          <template #default="{ row }">
            <span :class="overdueClass(row.nextInspectDate)">{{ row.nextInspectDate || '-' }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="statusTag(row.status)" size="small">{{ statusLabel(row.status) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" size="small" @click="handleInspect(row)">巡检</el-button>
            <el-button link type="primary" size="small" @click="handleEdit(row)">编辑</el-button>
            <el-button link type="danger" size="small" @click="handleDelete(row)">删除</el-button>
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

    <!-- 新增/编辑 -->
    <el-dialog v-model="dialogVisible" :title="dialogTitle" width="640px" @closed="resetForm">
      <el-form ref="formRef" :model="formData" :rules="formRules" label-width="110px">
        <el-row :gutter="12">
          <el-col :span="12">
            <el-form-item label="设备编码" prop="equipmentCode">
              <el-input v-model="formData.equipmentCode" placeholder="请输入" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="设备名称" prop="equipmentName">
              <el-input v-model="formData.equipmentName" placeholder="请输入" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="设备类型" prop="equipmentType">
              <el-select v-model="formData.equipmentType" placeholder="请选择" style="width: 100%">
                <el-option label="消防栓" value="hydrant" />
                <el-option label="灭火器" value="extinguisher" />
                <el-option label="报警器" value="alarm" />
                <el-option label="喷淋系统" value="sprinkler" />
                <el-option label="疏散设施" value="evacuation" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="厂区">
              <el-input v-model="formData.factoryArea" placeholder="如：东厂区" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="安装位置">
              <el-input v-model="formData.location" placeholder="请输入" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="品牌型号">
              <el-input v-model="formData.brand" placeholder="请输入" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="生产日期">
              <el-date-picker v-model="formData.manufactureDate" type="date" value-format="YYYY-MM-DD" style="width: 100%" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="安装日期">
              <el-date-picker v-model="formData.installDate" type="date" value-format="YYYY-MM-DD" style="width: 100%" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="下次检验日期">
              <el-date-picker v-model="formData.nextInspectDate" type="date" value-format="YYYY-MM-DD" style="width: 100%" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="状态">
              <el-select v-model="formData.status" placeholder="请选择" style="width: 100%">
                <el-option label="正常" value="normal" />
                <el-option label="待维保" value="pending_maintenance" />
                <el-option label="维保中" value="maintaining" />
                <el-option label="异常" value="abnormal" />
                <el-option label="停用" value="disabled" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="责任部门ID">
              <el-input-number v-model="formData.responsibleDept" :min="0" controls-position="right" style="width: 100%" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="责任人ID">
              <el-input-number v-model="formData.responsiblePerson" :min="0" controls-position="right" style="width: 100%" />
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="备注">
              <el-input v-model="formData.remark" type="textarea" :rows="2" />
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="submitting" @click="handleSubmit">确定</el-button>
      </template>
    </el-dialog>

    <!-- 巡检 -->
    <el-dialog v-model="inspectDialogVisible" title="设备巡检" width="500px">
      <el-alert type="info" :closable="false" show-icon style="margin-bottom: 12px">
        提交巡检将自动记录设备最近一次检查时间。
      </el-alert>
      <p>设备编码：<b>{{ currentEquipment?.equipmentCode }}</b></p>
      <p>设备名称：<b>{{ currentEquipment?.equipmentName }}</b></p>
      <template #footer>
        <el-button @click="inspectDialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="submitting" @click="handleInspectSubmit">提交巡检</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts" name="FireEquipment">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox, type FormInstance, type FormRules } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'
import { fireApi, type FireEquipment, type FireEquipmentForm } from '@/api/modules/fire'

const loading = ref(false)
const submitting = ref(false)
const tableData = ref<FireEquipment[]>([])
const dialogVisible = ref(false)
const inspectDialogVisible = ref(false)
const dialogTitle = ref('')
const formRef = ref<FormInstance>()
const currentEquipment = ref<FireEquipment | null>(null)

const searchForm = reactive({
  equipmentCode: '',
  equipmentType: '',
  factoryArea: '',
  status: ''
})

const pagination = reactive({ page: 1, pageSize: 10, total: 0 })

const formData = reactive<FireEquipmentForm & { equipmentId?: number }>({
  equipmentId: undefined,
  equipmentCode: '',
  equipmentName: '',
  equipmentType: '',
  factoryArea: '',
  location: '',
  brand: '',
  manufactureDate: '',
  installDate: '',
  nextInspectDate: '',
  status: '',
  responsibleDept: undefined,
  responsiblePerson: undefined,
  remark: ''
})

const formRules: FormRules = {
  equipmentCode: [{ required: true, message: '请输入设备编码', trigger: 'blur' }],
  equipmentName: [{ required: true, message: '请输入设备名称', trigger: 'blur' }],
  equipmentType: [{ required: true, message: '请选择设备类型', trigger: 'change' }]
}

async function fetchList() {
  loading.value = true
  try {
    const res: any = await fireApi.listEquipment({
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
  Object.assign(searchForm, { equipmentCode: '', equipmentType: '', factoryArea: '', status: '' })
  handleSearch()
}

function handleAdd() {
  dialogTitle.value = '新增设备'
  dialogVisible.value = true
}

async function handleEdit(row: FireEquipment) {
  try {
    const res: any = await fireApi.getEquipment(row.equipmentId)
    const detail = res.data || row
    Object.assign(formData, detail)
    formData.equipmentId = row.equipmentId
    dialogTitle.value = '编辑设备'
    dialogVisible.value = true
  } catch (e) {
    ElMessage.error('获取详情失败')
  }
}

function handleDelete(row: FireEquipment) {
  ElMessageBox.confirm(`确定删除设备「${row.equipmentName}」吗？`, '提示', { type: 'warning' })
    .then(async () => {
      try {
        await fireApi.deleteEquipment(row.equipmentId)
        ElMessage.success('删除成功')
        fetchList()
      } catch (e) {
        ElMessage.error('删除失败')
      }
    })
    .catch(() => {})
}

async function handleSubmit() {
  if (!formRef.value) return
  await formRef.value.validate(async (valid) => {
    if (!valid) return
    submitting.value = true
    try {
      const { equipmentId, ...body } = formData
      if (equipmentId) {
        await fireApi.updateEquipment(equipmentId, body)
      } else {
        await fireApi.createEquipment(body)
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
    equipmentId: undefined,
    equipmentCode: '',
    equipmentName: '',
    equipmentType: '',
    factoryArea: '',
    location: '',
    brand: '',
    manufactureDate: '',
    installDate: '',
    nextInspectDate: '',
    status: '',
    responsibleDept: undefined,
    responsiblePerson: undefined,
    remark: ''
  })
}

function handleInspect(row: FireEquipment) {
  currentEquipment.value = row
  inspectDialogVisible.value = true
}

async function handleInspectSubmit() {
  if (!currentEquipment.value) return
  submitting.value = true
  try {
    await fireApi.inspectEquipment(currentEquipment.value.equipmentId)
    ElMessage.success('巡检提交成功')
    inspectDialogVisible.value = false
    fetchList()
  } catch (e) {
    ElMessage.error('巡检提交失败')
  } finally {
    submitting.value = false
  }
}

function typeLabel(t?: string): string {
  const map: Record<string, string> = {
    hydrant: '消防栓',
    extinguisher: '灭火器',
    alarm: '报警器',
    sprinkler: '喷淋系统',
    evacuation: '疏散设施'
  }
  return map[t || ''] || t || '-'
}

function statusLabel(s?: string): string {
  const map: Record<string, string> = {
    normal: '正常',
    pending_maintenance: '待维保',
    maintaining: '维保中',
    abnormal: '异常',
    disabled: '停用'
  }
  return map[s || ''] || s || '-'
}

function statusTag(s?: string): 'primary' | 'success' | 'warning' | 'info' | 'danger' {
  const map: Record<string, 'primary' | 'success' | 'warning' | 'info' | 'danger'> = {
    normal: 'success',
    pending_maintenance: 'warning',
    maintaining: 'primary',
    abnormal: 'danger',
    disabled: 'info'
  }
  return map[s || ''] || 'info'
}

function overdueClass(date?: string): string {
  if (!date) return ''
  const target = new Date(date).getTime()
  if (Number.isNaN(target)) return ''
  const now = Date.now()
  if (target < now) return 'text-danger'
  if (target - now < 30 * 24 * 60 * 60 * 1000) return 'text-warning'
  return ''
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
.text-danger {
  color: #f56c6c;
  font-weight: 600;
}
.text-warning {
  color: #e6a23c;
  font-weight: 600;
}
</style>
