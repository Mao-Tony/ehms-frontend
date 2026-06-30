<template>
  <div class="maintenance-container">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>设备维保记录</span>
          <el-button type="primary" @click="handleAdd">新增维保</el-button>
        </div>
      </template>

      <el-form :inline="true" :model="queryForm" class="search-form">
        <el-form-item label="设备">
          <el-select v-model="queryForm.equipmentId" placeholder="选择设备" clearable filterable style="width: 220px" @change="handleSearch">
            <el-option v-for="e in equipmentList" :key="e.equipmentId" :label="`${e.equipmentCode} - ${e.equipmentName}`" :value="e.equipmentId" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>

      <el-table v-loading="loading" :data="tableData" border>
        <el-table-column prop="workOrderNo" label="工单号" width="160" show-overflow-tooltip />
        <el-table-column label="设备" width="200" show-overflow-tooltip>
          <template #default="{ row }">{{ equipmentNameOf(row.equipmentId) }}</template>
        </el-table-column>
        <el-table-column label="维保类型" width="110">
          <template #default="{ row }">{{ typeMap[row.maintenanceType] || row.maintenanceType || '-' }}</template>
        </el-table-column>
        <el-table-column prop="workContent" label="维保内容" min-width="200" show-overflow-tooltip />
        <el-table-column prop="actualStartTime" label="实际开始" width="160" />
        <el-table-column prop="actualEndTime" label="实际结束" width="160" />
        <el-table-column label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="statusTagType(row.status)">{{ statusMap[row.status] || row.status || '-' }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="成本" width="120">
          <template #default="{ row }">{{ totalCost(row) }}</template>
        </el-table-column>
      </el-table>

      <div class="pagination">
        <el-pagination
          v-model:current-page="queryForm.page"
          v-model:page-size="queryForm.pageSize"
          :total="total"
          :page-sizes="[10, 20, 50]"
          layout="total, sizes, prev, pager, next"
          @current-change="handlePageChange"
          @size-change="handlePageChange"
        />
      </div>
    </el-card>

    <el-dialog v-model="dialogVisible" title="新增维保记录" width="720px">
      <el-form ref="formRef" :model="formData" :rules="rules" label-width="120px">
        <el-row :gutter="16">
          <el-col :span="12">
            <el-form-item label="设备" prop="equipmentId">
              <el-select v-model="formData.equipmentId" placeholder="选择设备" filterable style="width: 100%">
                <el-option v-for="e in equipmentList" :key="e.equipmentId" :label="`${e.equipmentCode} - ${e.equipmentName}`" :value="e.equipmentId" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="维保类型">
              <el-select v-model="formData.maintenanceType" style="width: 100%">
                <el-option v-for="(label, k) in typeMap" :key="k" :label="label" :value="k" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="工单号">
              <el-input v-model="formData.workOrderNo" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="状态">
              <el-select v-model="formData.status" style="width: 100%">
                <el-option v-for="(label, k) in statusMap" :key="k" :label="label" :value="k" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="维保内容">
              <el-input v-model="formData.workContent" type="textarea" :rows="2" />
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="故障描述">
              <el-input v-model="formData.faultDesc" type="textarea" :rows="2" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="计划开始">
              <el-date-picker v-model="formData.planStartTime" type="datetime" value-format="YYYY-MM-DD HH:mm:ss" style="width: 100%" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="计划结束">
              <el-date-picker v-model="formData.planEndTime" type="datetime" value-format="YYYY-MM-DD HH:mm:ss" style="width: 100%" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="实际开始">
              <el-date-picker v-model="formData.actualStartTime" type="datetime" value-format="YYYY-MM-DD HH:mm:ss" style="width: 100%" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="实际结束">
              <el-date-picker v-model="formData.actualEndTime" type="datetime" value-format="YYYY-MM-DD HH:mm:ss" style="width: 100%" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="人工成本">
              <el-input-number v-model="formData.laborCost" :min="0" style="width: 100%" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="材料成本">
              <el-input-number v-model="formData.materialCost" :min="0" style="width: 100%" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="维保人员ID">
              <el-input-number v-model="formData.maintainerId" :min="0" style="width: 100%" />
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="saving" @click="handleSubmit">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref, watch } from 'vue'
import { ElMessage, FormInstance, FormRules } from 'element-plus'
import { equipmentApi, type MaintenanceForm } from '@/api/modules/equipment'

const loading = ref(false)
const saving = ref(false)
const tableData = ref<any[]>([])
const total = ref(0)
const dialogVisible = ref(false)
const formRef = ref<FormInstance>()
const equipmentList = ref<any[]>([])

const queryForm = reactive({ equipmentId: undefined as number | undefined, page: 1, pageSize: 20 })

const formData = reactive<MaintenanceForm>({
  equipmentId: 0,
  maintenanceType: '',
  workOrderNo: '',
  workContent: '',
  faultDesc: '',
  planStartTime: '',
  planEndTime: '',
  actualStartTime: '',
  actualEndTime: '',
  status: 'pending',
  laborCost: 0,
  materialCost: 0,
  maintainerId: undefined
})

const rules: FormRules = {
  equipmentId: [{ required: true, message: '请选择设备', trigger: 'change' }]
}

const typeMap: Record<string, string> = {
  routine: '日常维护',
  inspection: '定期检查',
  repair: '故障维修',
  overhaul: '大修'
}

const statusMap: Record<string, string> = {
  pending: '待处理',
  in_progress: '处理中',
  completed: '已完成',
  cancelled: '已取消'
}

function statusTagType(s?: string): any {
  return ({ pending: 'info', in_progress: 'warning', completed: 'success', cancelled: 'danger' } as any)[s || ''] || 'info'
}

function equipmentNameOf(eid?: number) {
  const e = equipmentList.value.find(x => x.equipmentId === eid)
  return e ? `${e.equipmentCode} - ${e.equipmentName}` : `#${eid || '-'}`
}

function totalCost(row: any): string {
  const a = Number(row.laborCost || 0)
  const b = Number(row.materialCost || 0)
  return (a + b).toFixed(2)
}

async function fetchEquipmentList() {
  try {
    const res: any = await equipmentApi.list({ page: 1, pageSize: 100 })
    equipmentList.value = res.data?.items || res.data?.list || []
  } catch (e) { console.error(e) }
}

async function fetchData() {
  if (!queryForm.equipmentId) {
    tableData.value = []
    total.value = 0
    return
  }
  loading.value = true
  try {
    const res: any = await equipmentApi.getMaintenanceRecords(queryForm.equipmentId, {
      page: queryForm.page,
      pageSize: queryForm.pageSize
    })
    tableData.value = res.data?.items || res.data?.list || []
    total.value = res.data?.total || 0
  } catch (e) {
    console.error(e)
  } finally {
    loading.value = false
  }
}

function handleSearch() { queryForm.page = 1; fetchData() }
function handleReset() {
  queryForm.equipmentId = undefined
  queryForm.page = 1
  tableData.value = []
  total.value = 0
}
function handlePageChange() { fetchData() }

function handleAdd() {
  Object.assign(formData, {
    equipmentId: queryForm.equipmentId || 0,
    maintenanceType: 'routine',
    workOrderNo: '',
    workContent: '',
    faultDesc: '',
    planStartTime: '',
    planEndTime: '',
    actualStartTime: '',
    actualEndTime: '',
    status: 'pending',
    laborCost: 0,
    materialCost: 0,
    maintainerId: undefined
  })
  dialogVisible.value = true
}

async function handleSubmit() {
  if (!formRef.value) return
  const valid = await formRef.value.validate().catch(() => false)
  if (!valid) return
  saving.value = true
  try {
    await equipmentApi.addMaintenanceRecord(formData.equipmentId, formData)
    ElMessage.success('新增成功')
    dialogVisible.value = false
    fetchData()
  } catch (e) {
    console.error(e)
  } finally {
    saving.value = false
  }
}

watch(() => queryForm.equipmentId, () => { queryForm.page = 1; fetchData() })

onMounted(async () => {
  await fetchEquipmentList()
})
</script>

<style scoped>
.maintenance-container { padding: 16px; }
.card-header { display: flex; justify-content: space-between; align-items: center; }
.search-form { margin-bottom: 16px; }
.pagination { margin-top: 16px; display: flex; justify-content: flex-end; }
</style>
