<template>
  <div class="chemicals-page">
    <el-card class="search-card">
      <el-form :model="queryForm" inline>
        <el-form-item label="化学品名称">
          <el-input v-model="queryForm.chemicalName" placeholder="请输入化学品名称" clearable style="width: 200px" />
        </el-form-item>
        <el-form-item label="危险类别">
          <el-select v-model="queryForm.hazardClass" placeholder="请选择" clearable style="width: 150px">
            <el-option v-for="(label, value) in hazardMap" :key="value" :label="label" :value="value" />
          </el-select>
        </el-form-item>
        <el-form-item label="存放位置">
          <el-input v-model="queryForm.storageLocation" placeholder="存放位置" clearable style="width: 150px" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch" :loading="loading">查询</el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card class="table-card">
      <div class="toolbar">
        <el-button type="primary" @click="handleAdd"><el-icon><Plus /></el-icon>新增化学品</el-button>
        <el-button text @click="handleRefresh"><el-icon><Refresh /></el-icon></el-button>
      </div>

      <el-table v-loading="loading" :data="tableData" stripe border>
        <el-table-column prop="chemicalCode" label="化学品编码" width="130" />
        <el-table-column prop="chemicalName" label="化学品名称" min-width="150" show-overflow-tooltip />
        <el-table-column prop="casNo" label="CAS号" width="130" />
        <el-table-column prop="unNo" label="UN编号" width="100" />
        <el-table-column prop="hazardClass" label="危险类别" width="110" align="center">
          <template #default="{ row }">
            <el-tag :type="hazardTag(row.hazardClass)">{{ hazardName(row.hazardClass) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="dangerLevel" label="危险等级" width="90" align="center" />
        <el-table-column prop="storageLocation" label="存放位置" min-width="140" show-overflow-tooltip />
        <el-table-column prop="maxStorage" label="最大存储" width="100" align="right" />
        <el-table-column prop="unit" label="单位" width="70" align="center" />
        <el-table-column prop="status" label="状态" width="90" align="center">
          <template #default="{ row }">
            <el-tag :type="statusTag(row.status)">{{ statusName(row.status) }}</el-tag>
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

    <el-dialog v-model="dialogVisible" :title="isEdit ? '编辑化学品' : '新增化学品'" width="720px" destroy-on-close>
      <el-form ref="formRef" :model="formData" :rules="formRules" label-width="120px">
        <el-row :gutter="16">
          <el-col :span="12">
            <el-form-item label="化学品编码" prop="chemicalCode">
              <el-input v-model="formData.chemicalCode" placeholder="请输入" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="化学品名称" prop="chemicalName">
              <el-input v-model="formData.chemicalName" placeholder="请输入" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="CAS号" prop="casNo">
              <el-input v-model="formData.casNo" placeholder="请输入" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="UN编号">
              <el-input v-model="formData.unNo" placeholder="请输入" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="危险类别" prop="hazardClass">
              <el-select v-model="formData.hazardClass" placeholder="请选择" style="width: 100%">
                <el-option v-for="(label, value) in hazardMap" :key="value" :label="label" :value="value" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="危险等级">
              <el-select v-model="formData.dangerLevel" placeholder="请选择" style="width: 100%">
                <el-option label="1级（特别重大）" value="1" />
                <el-option label="2级（重大）" value="2" />
                <el-option label="3级（较大）" value="3" />
                <el-option label="4级（一般）" value="4" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="规格型号">
              <el-input v-model="formData.specModel" placeholder="请输入" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="单位">
              <el-input v-model="formData.unit" placeholder="如：kg、L" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="存放位置">
              <el-input v-model="formData.storageLocation" placeholder="请输入" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="最大存储量">
              <el-input-number v-model="formData.maxStorage" :min="0" :precision="2" style="width: 100%" />
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="SDS文件URL">
              <el-input v-model="formData.sdsUrl" placeholder="请输入SDS文件链接" />
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
import { hazmatApi } from '@/api/modules/hazmat'

const loading = ref(false)
const dialogVisible = ref(false)
const submitLoading = ref(false)
const isEdit = ref(false)
const formRef = ref()

const queryForm = reactive({ chemicalName: '', hazardClass: '', storageLocation: '' })
const pagination = reactive({ page: 1, pageSize: 20, total: 0 })
const tableData = ref([])

const initForm = () => ({
  chemicalId: null,
  chemicalCode: '',
  chemicalName: '',
  casNo: '',
  unNo: '',
  hazardClass: '',
  dangerLevel: '',
  specModel: '',
  unit: '',
  storageLocation: '',
  maxStorage: 0,
  sdsUrl: ''
})
const formData = reactive(initForm())

const formRules = {
  chemicalCode: [{ required: true, message: '请输入化学品编码', trigger: 'blur' }],
  chemicalName: [{ required: true, message: '请输入化学品名称', trigger: 'blur' }],
  hazardClass: [{ required: true, message: '请选择危险类别', trigger: 'change' }]
}

const hazardMap = {
  flammable: '易燃物',
  oxidizing: '氧化剂',
  toxic: '有毒物质',
  corrosive: '腐蚀品',
  radioactive: '放射性物质',
  explosive: '爆炸品',
  other: '其他'
}
const hazardName = (v) => hazardMap[v] || v
const hazardTag = (v) => ({ flammable: 'danger', oxidizing: 'warning', toxic: 'danger', corrosive: 'warning', radioactive: 'danger', explosive: 'danger', other: 'info' }[v] || 'info')
const statusName = (v) => ({ 1: '正常', 2: '已停用', 0: '草稿' }[v] || '-')
const statusTag = (v) => ({ 1: 'success', 2: 'info', 0: 'warning' }[v] || 'info')

const loadData = async () => {
  loading.value = true
  try {
    const params = { page: pagination.page, pageSize: pagination.pageSize, ...queryForm }
    Object.keys(params).forEach(k => params[k] === '' && delete params[k])
    const res = await hazmatApi.list(params)
    tableData.value = res.items || res.list || res.data || []
    pagination.total = res.total || 0
  } catch {
    ElMessage.error('加载化学品列表失败')
  } finally {
    loading.value = false
  }
}

const handleSearch = () => { pagination.page = 1; loadData() }
const handleReset = () => { Object.assign(queryForm, { chemicalName: '', hazardClass: '', storageLocation: '' }); handleSearch() }
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
  ElMessageBox.confirm(`确认删除化学品「${row.chemicalName}」？`, '删除确认', { type: 'warning' })
    .then(async () => {
      try {
        await hazmatApi.delete(row.chemicalId)
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
        await hazmatApi.update(formData.chemicalId, formData)
        ElMessage.success('更新成功')
      } else {
        await hazmatApi.create(formData)
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
.chemicals-page { padding: 16px; }
.search-card, .table-card { margin-bottom: 16px; }
.toolbar { display: flex; justify-content: space-between; margin-bottom: 12px; }
.pagination-wrapper { margin-top: 16px; display: flex; justify-content: flex-end; }
</style>
