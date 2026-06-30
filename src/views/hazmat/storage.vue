<template>
  <div class="page-container">
    <div class="filter-bar">
      <el-form :inline="true" :model="queryForm" class="filter-form">
        <el-form-item label="位置名称">
          <el-input v-model="queryForm.keyword" placeholder="请输入位置名称" clearable style="width: 180px" />
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="queryForm.status" placeholder="请选择" clearable style="width: 140px">
            <el-option label="正常" value="NORMAL" />
            <el-option label="已满" value="FULL" />
            <el-option label="维护中" value="MAINTENANCE" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleQuery">查询</el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
    </div>

    <div class="tool-bar">
      <el-button type="primary" @click="handleAdd">新增存储位置</el-button>
    </div>

    <el-table :data="tableData" v-loading="loading" stripe border>
      <el-table-column type="index" label="序号" width="60" />
      <el-table-column prop="locationCode" label="位置编码" width="140" />
      <el-table-column prop="locationName" label="位置名称" min-width="160" show-overflow-tooltip />
      <el-table-column prop="locationType" label="位置类型" width="120">
        <template #default="{ row }">
          {{ locationTypeName(row.locationType) }}
        </template>
      </el-table-column>
      <el-table-column prop="capacity" label="容量(kg)" width="100" align="right" />
      <el-table-column prop="currentLoad" label="当前负载(kg)" width="120" align="right">
        <template #default="{ row }">
          {{ row.currentLoad ?? 0 }}
        </template>
      </el-table-column>
      <el-table-column prop="status" label="状态" width="100" align="center">
        <template #default="{ row }">
          <el-tag :type="statusTag(row.status)" size="small">{{ statusName(row.status) }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="200" fixed="right">
        <template #default="{ row }">
          <el-button link type="primary" size="small" @click="handleEdit(row)">编辑</el-button>
          <el-button link type="danger" size="small" @click="handleDelete(row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-pagination
      v-model:current-page="pagination.page"
      v-model:page-size="pagination.pageSize"
      :total="pagination.total"
      :page-sizes="[10, 20, 50]"
      layout="total, sizes, prev, pager, next, jumper"
      @size-change="loadData"
      @current-change="loadData"
      style="margin-top: 16px; justify-content: flex-end"
    />

    <!-- 新增/编辑弹窗 -->
    <el-dialog v-model="dialogVisible" :title="dialogTitle" width="500px" destroy-on-close>
      <el-form ref="formRef" :model="formData" :rules="formRules" label-width="110px">
        <el-form-item label="位置编码" prop="locationCode">
          <el-input v-model="formData.locationCode" placeholder="唯一编码，如：A-01" />
        </el-form-item>
        <el-form-item label="位置名称" prop="locationName">
          <el-input v-model="formData.locationName" placeholder="如：一号仓库A区" />
        </el-form-item>
        <el-form-item label="位置类型" prop="locationType">
          <el-select v-model="formData.locationType" placeholder="请选择" style="width: 100%">
            <el-option label="普通" value="GENERAL" />
            <el-option label="低温" value="LOW_TEMP" />
            <el-option label="防爆" value="EXPLOSION_PROOF" />
            <el-option label="隔离" value="ISOLATION" />
          </el-select>
        </el-form-item>
        <el-form-item label="容量(kg)" prop="capacity">
          <el-input-number v-model="formData.capacity" :min="0" style="width: 100%" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="submitLoading" @click="handleSubmit">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { hazmatApi } from '@/api/modules/hazmat'

const loading = ref(false)
const dialogVisible = ref(false)
const submitLoading = ref(false)
const formRef = ref()
const tableData = ref<any[]>([])
const currentId = ref<number | undefined>()
const queryForm = reactive({ keyword: '', status: '' })
const pagination = reactive({ page: 1, pageSize: 20, total: 0 })

const formData = reactive({
  locationCode: '',
  locationName: '',
  locationType: '',
  capacity: 0
})

const formRules = {
  locationCode: [{ required: true, message: '请输入位置编码', trigger: 'blur' }],
  locationName: [{ required: true, message: '请输入位置名称', trigger: 'blur' }]
}

const locationTypeMap: Record<string, string> = {
  GENERAL: '普通', LOW_TEMP: '低温', EXPLOSION_PROOF: '防爆', ISOLATION: '隔离'
}
const statusMap: Record<string, string> = { NORMAL: '正常', FULL: '已满', MAINTENANCE: '维护中' }
const statusName = (v: string) => statusMap[v] || v
const statusTag = (v: string) => ({ NORMAL: 'success', FULL: 'warning', MAINTENANCE: 'info' }[v] || 'info')
const locationTypeName = (v: string) => locationTypeMap[v] || v

const dialogTitle = computed(() => currentId.value ? '编辑存储位置' : '新增存储位置')

const loadData = async () => {
  loading.value = true
  try {
    const params = { status: queryForm.status || undefined, page: pagination.page, pageSize: pagination.pageSize }
    if (queryForm.keyword) params.page = 1
    const res: any = await hazmatApi.listStorageLocations(params as any)
    tableData.value = res.data?.list || []
    pagination.total = res.data?.pageInfo?.total || 0
  } catch { ElMessage.error('加载失败') }
  finally { loading.value = false }
}

const handleQuery = () => { pagination.page = 1; loadData() }
const handleReset = () => { Object.assign(queryForm, { keyword: '', status: '' }); handleQuery() }
const handleAdd = () => { currentId.value = undefined; Object.assign(formData, { locationCode: '', locationName: '', locationType: '', capacity: 0 }); dialogVisible.value = true }
const handleEdit = (row: any) => {
  currentId.value = row.locationId
  Object.assign(formData, { locationCode: row.locationCode, locationName: row.locationName, locationType: row.locationType || '', capacity: row.capacity || 0 })
  dialogVisible.value = true
}
const handleDelete = (row: any) => {
  ElMessageBox.confirm(`确认删除「${row.locationName}」？`, '删除确认', { type: 'warning' })
    .then(async () => { await hazmatApi.deleteStorageLocation(row.locationId); ElMessage.success('删除成功'); loadData() }).catch(() => {})
}
const handleSubmit = async () => {
  const valid = await formRef.value.validate().catch(() => false)
  if (!valid) return
  submitLoading.value = true
  try {
    if (currentId.value) {
      await hazmatApi.updateStorageLocation(currentId.value, formData as any)
    } else {
      await hazmatApi.createStorageLocation(formData as any)
    }
    ElMessage.success('保存成功')
    dialogVisible.value = false
    loadData()
  } catch { ElMessage.error('保存失败') }
  finally { submitLoading.value = false }
}

onMounted(loadData)
</script>