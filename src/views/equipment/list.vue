<template>
  <div class="equipment-list-container">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>设备台账</span>
          <el-button type="primary" @click="handleAdd">新增设备</el-button>
        </div>
      </template>

      <el-form :inline="true" :model="queryForm" class="search-form">
        <el-form-item label="设备类型">
          <el-select v-model="queryForm.equipmentType" placeholder="请选择" clearable style="width: 160px">
            <el-option v-for="(label, k) in typeMap" :key="k" :label="label" :value="k" />
          </el-select>
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="queryForm.status" placeholder="请选择" clearable style="width: 140px">
            <el-option v-for="(label, k) in statusMap" :key="k" :label="label" :value="k" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">搜索</el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>

      <el-table v-loading="loading" :data="tableData" border>
        <el-table-column prop="equipmentCode" label="编号" width="140" />
        <el-table-column prop="equipmentName" label="设备名称" min-width="160" show-overflow-tooltip />
        <el-table-column label="类型" width="120">
          <template #default="{ row }">{{ typeMap[row.equipmentType] || row.equipmentType || '-' }}</template>
        </el-table-column>
        <el-table-column prop="specModel" label="规格型号" width="140" show-overflow-tooltip />
        <el-table-column prop="manufacturer" label="制造厂商" width="140" show-overflow-tooltip />
        <el-table-column prop="installLocation" label="安装位置" min-width="160" show-overflow-tooltip />
        <el-table-column prop="installDate" label="安装日期" width="120" />
        <el-table-column label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="statusTagType(row.status)">{{ statusMap[row.status] || row.status || '-' }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="nextMaintainDate" label="下次保养" width="120" />
        <el-table-column label="操作" width="220" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link @click="handleEdit(row)">编辑</el-button>
            <el-button type="warning" link @click="handleChangeStatus(row)">改状态</el-button>
            <el-button type="danger" link @click="handleDelete(row)">删除</el-button>
          </template>
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

    <el-dialog v-model="dialogVisible" :title="formTitle" width="720px">
      <el-form ref="formRef" :model="formData" :rules="rules" label-width="120px">
        <el-row :gutter="16">
          <el-col :span="12">
            <el-form-item label="设备编号" prop="equipmentCode">
              <el-input v-model="formData.equipmentCode" placeholder="设备编号" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="设备名称" prop="equipmentName">
              <el-input v-model="formData.equipmentName" placeholder="设备名称" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="设备类型">
              <el-select v-model="formData.equipmentType" placeholder="请选择" style="width: 100%">
                <el-option v-for="(label, k) in typeMap" :key="k" :label="label" :value="k" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="规格型号">
              <el-input v-model="formData.specModel" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="制造厂商">
              <el-input v-model="formData.manufacturer" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="出厂编号">
              <el-input v-model="formData.serialNo" />
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
          <el-col :span="24">
            <el-form-item label="安装位置">
              <el-input v-model="formData.installLocation" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="资产编号">
              <el-input v-model="formData.assetNo" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="状态">
              <el-select v-model="formData.status" style="width: 100%">
                <el-option v-for="(label, k) in statusMap" :key="k" :label="label" :value="k" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="设计寿命(年)">
              <el-input-number v-model="formData.designLife" :min="0" style="width: 100%" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="下次保养">
              <el-date-picker v-model="formData.nextMaintainDate" type="date" value-format="YYYY-MM-DD" style="width: 100%" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="下次检验">
              <el-date-picker v-model="formData.nextInspectDate" type="date" value-format="YYYY-MM-DD" style="width: 100%" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="部门ID">
              <el-input-number v-model="formData.deptId" :min="0" style="width: 100%" />
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="技术参数">
              <el-input v-model="formData.technicalParams" type="textarea" :rows="2" />
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
import { onMounted, reactive, ref } from 'vue'
import { ElMessage, ElMessageBox, FormInstance, FormRules } from 'element-plus'
import { equipmentApi, type EquipmentForm } from '@/api/modules/equipment'

const loading = ref(false)
const saving = ref(false)
const tableData = ref<any[]>([])
const total = ref(0)
const dialogVisible = ref(false)
const formTitle = ref('新增设备')
const formRef = ref<FormInstance>()

const queryForm = reactive({ equipmentType: '', status: '', page: 1, pageSize: 20 })

const formData = reactive<EquipmentForm>({
  equipmentCode: '',
  equipmentName: '',
  equipmentType: '',
  specModel: '',
  manufacturer: '',
  serialNo: '',
  manufactureDate: '',
  installDate: '',
  installLocation: '',
  status: 'running',
  assetNo: '',
  technicalParams: '',
  designLife: undefined,
  nextMaintainDate: '',
  nextInspectDate: '',
  deptId: undefined
})

const rules: FormRules = {
  equipmentCode: [{ required: true, message: '请输入设备编号', trigger: 'blur' }],
  equipmentName: [{ required: true, message: '请输入设备名称', trigger: 'blur' }]
}

const typeMap: Record<string, string> = {
  production: '生产设备',
  safety: '安全设备',
  testing: '检测设备',
  transport: '运输设备',
  power: '动力设备',
  special: '特种设备'
}

const statusMap: Record<string, string> = {
  running: '运行中',
  idle: '闲置',
  maintenance: '维保中',
  abandoned: '报废'
}

function statusTagType(s?: string): any {
  return ({ running: 'success', maintenance: 'warning', idle: 'info', abandoned: 'danger' } as any)[s || ''] || 'info'
}

async function fetchData() {
  loading.value = true
  try {
    const res: any = await equipmentApi.list({
      equipmentType: queryForm.equipmentType || undefined,
      status: queryForm.status || undefined,
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
  Object.assign(queryForm, { equipmentType: '', status: '', page: 1 })
  fetchData()
}
function handlePageChange() { fetchData() }

function resetForm() {
  Object.assign(formData, {
    equipmentId: undefined,
    equipmentCode: '',
    equipmentName: '',
    equipmentType: '',
    specModel: '',
    manufacturer: '',
    serialNo: '',
    manufactureDate: '',
    installDate: '',
    installLocation: '',
    status: 'running',
    assetNo: '',
    technicalParams: '',
    designLife: undefined,
    nextMaintainDate: '',
    nextInspectDate: '',
    deptId: undefined
  })
}

function handleAdd() {
  resetForm()
  formTitle.value = '新增设备'
  dialogVisible.value = true
}

function handleEdit(row: any) {
  resetForm()
  Object.assign(formData, row)
  formTitle.value = '编辑设备'
  dialogVisible.value = true
}

async function handleSubmit() {
  if (!formRef.value) return
  const valid = await formRef.value.validate().catch(() => false)
  if (!valid) return
  saving.value = true
  try {
    if (formData.equipmentId) {
      await equipmentApi.update(formData.equipmentId, formData)
      ElMessage.success('更新成功')
    } else {
      await equipmentApi.create(formData)
      ElMessage.success('新增成功')
    }
    dialogVisible.value = false
    fetchData()
  } catch (e) {
    console.error(e)
  } finally {
    saving.value = false
  }
}

async function handleChangeStatus(row: any) {
  try {
    const { value } = await ElMessageBox.prompt('请输入新状态：running/idle/maintenance/abandoned', '修改状态', {
      inputValue: row.status,
      inputPattern: /^(running|idle|maintenance|abandoned)$/,
      inputErrorMessage: '只能是上述四种'
    })
    await equipmentApi.updateStatus(row.equipmentId, value)
    ElMessage.success('状态已更新')
    fetchData()
  } catch (_) {}
}

async function handleDelete(row: any) {
  try {
    await ElMessageBox.confirm(`确定删除设备「${row.equipmentName}」吗？`, '提示', { type: 'warning' })
    await equipmentApi.delete(row.equipmentId)
    ElMessage.success('删除成功')
    fetchData()
  } catch (_) {}
}

onMounted(fetchData)
</script>

<style scoped>
.equipment-list-container { padding: 16px; }
.card-header { display: flex; justify-content: space-between; align-items: center; }
.search-form { margin-bottom: 16px; }
.pagination { margin-top: 16px; display: flex; justify-content: flex-end; }
</style>
