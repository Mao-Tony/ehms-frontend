<template>
  <div class="page-container">
    <el-card class="search-card" shadow="never">
      <el-form :inline="true" :model="searchForm">
        <el-form-item label="分区类型">
          <el-select v-model="searchForm.zoneType" placeholder="请选择" clearable style="width: 160px">
            <el-option label="生产区" value="production" />
            <el-option label="仓储区" value="storage" />
            <el-option label="办公区" value="office" />
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
        <el-button type="primary" :icon="Plus" @click="handleAdd">新增分区</el-button>
      </div>
      <el-table :data="tableData" v-loading="loading" border stripe>
        <el-table-column prop="zoneCode" label="分区编码" width="140" />
        <el-table-column prop="zoneName" label="分区名称" min-width="160" />
        <el-table-column prop="zoneType" label="类型" width="100">
          <template #default="{ row }">{{ typeLabel(row.zoneType) }}</template>
        </el-table-column>
        <el-table-column prop="areaRange" label="区域范围" min-width="160" show-overflow-tooltip />
        <el-table-column prop="fireRating" label="耐火等级" width="100" />
        <el-table-column prop="exitCount" label="安全出口" width="100" align="center" />
        <el-table-column prop="fireEqCount" label="消防设施数" width="120" align="center" />
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="statusTag(row.status)" size="small">{{ statusLabel(row.status) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="160" fixed="right">
          <template #default="{ row }">
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

    <el-dialog v-model="dialogVisible" :title="dialogTitle" width="640px" @closed="resetForm">
      <el-form ref="formRef" :model="formData" :rules="formRules" label-width="110px">
        <el-row :gutter="12">
          <el-col :span="12">
            <el-form-item label="分区编码" prop="zoneCode">
              <el-input v-model="formData.zoneCode" placeholder="请输入" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="分区名称" prop="zoneName">
              <el-input v-model="formData.zoneName" placeholder="请输入" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="分区类型">
              <el-select v-model="formData.zoneType" placeholder="请选择" style="width: 100%">
                <el-option label="生产区" value="production" />
                <el-option label="仓储区" value="storage" />
                <el-option label="办公区" value="office" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="耐火等级">
              <el-select v-model="formData.fireRating" placeholder="请选择" style="width: 100%">
                <el-option label="一级" value="一级" />
                <el-option label="二级" value="二级" />
                <el-option label="三级" value="三级" />
                <el-option label="四级" value="四级" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="区域范围">
              <el-input v-model="formData.areaRange" placeholder="请输入" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="安全出口数">
              <el-input-number v-model="formData.exitCount" :min="0" controls-position="right" style="width: 100%" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="消防设施数">
              <el-input-number v-model="formData.fireEqCount" :min="0" controls-position="right" style="width: 100%" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="状态">
              <el-select v-model="formData.status" placeholder="请选择" style="width: 100%">
                <el-option label="正常" value="normal" />
                <el-option label="停用" value="disabled" />
              </el-select>
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

<script setup lang="ts" name="FireZone">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox, type FormInstance, type FormRules } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'
import { fireApi, type FireZone, type FireZoneForm } from '@/api/modules/fire'

const loading = ref(false)
const submitting = ref(false)
const tableData = ref<FireZone[]>([])
const dialogVisible = ref(false)
const dialogTitle = ref('')
const formRef = ref<FormInstance>()

const searchForm = reactive({ zoneType: '' })
const pagination = reactive({ page: 1, pageSize: 10, total: 0 })

const formData = reactive<FireZoneForm & { zoneId?: number }>({
  zoneId: undefined,
  zoneCode: '',
  zoneName: '',
  zoneType: '',
  areaRange: '',
  fireRating: '',
  exitCount: 0,
  fireEqCount: 0,
  status: ''
})

const formRules: FormRules = {
  zoneCode: [{ required: true, message: '请输入分区编码', trigger: 'blur' }],
  zoneName: [{ required: true, message: '请输入分区名称', trigger: 'blur' }]
}

async function fetchList() {
  loading.value = true
  try {
    const res: any = await fireApi.listZones({
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
  searchForm.zoneType = ''
  handleSearch()
}

function handleAdd() {
  dialogTitle.value = '新增分区'
  dialogVisible.value = true
}

async function handleEdit(row: FireZone) {
  try {
    const res: any = await fireApi.getZone(row.zoneId)
    const detail = res.data || row
    Object.assign(formData, detail)
    formData.zoneId = row.zoneId
    dialogTitle.value = '编辑分区'
    dialogVisible.value = true
  } catch (e) {
    ElMessage.error('获取详情失败')
  }
}

function handleDelete(row: FireZone) {
  ElMessageBox.confirm(`确定删除分区「${row.zoneName}」吗？`, '提示', { type: 'warning' })
    .then(async () => {
      try {
        await fireApi.deleteZone(row.zoneId)
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
      const { zoneId, ...body } = formData
      if (zoneId) {
        await fireApi.updateZone(zoneId, body)
      } else {
        await fireApi.createZone(body)
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
    zoneId: undefined,
    zoneCode: '',
    zoneName: '',
    zoneType: '',
    areaRange: '',
    fireRating: '',
    exitCount: 0,
    fireEqCount: 0,
    status: ''
  })
}

function typeLabel(t?: string): string {
  const map: Record<string, string> = {
    production: '生产区',
    storage: '仓储区',
    office: '办公区'
  }
  return map[t || ''] || t || '-'
}

function statusLabel(s?: string): string {
  const map: Record<string, string> = { normal: '正常', disabled: '停用' }
  return map[s || ''] || s || '-'
}

function statusTag(s?: string): 'primary' | 'success' | 'warning' | 'info' | 'danger' {
  if (s === 'normal') return 'success'
  if (s === 'disabled') return 'info'
  return 'warning'
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
