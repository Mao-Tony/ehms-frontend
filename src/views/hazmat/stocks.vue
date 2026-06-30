<template>
  <div class="stocks-page">
    <el-card class="search-card">
      <el-form :model="queryForm" inline>
        <el-form-item label="化学品">
          <el-select v-model="queryForm.chemicalId" placeholder="全部化学品" clearable filterable style="width: 200px">
            <el-option v-for="item in chemicalList" :key="item.chemicalId" :label="item.chemicalName" :value="item.chemicalId" />
          </el-select>
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="queryForm.status" placeholder="全部" clearable style="width: 120px">
            <el-option label="正常" :value="1" />
            <el-option label="库存不足" :value="2" />
            <el-option label="已过期" :value="3" />
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
        <el-button type="primary" @click="handleAdd"><el-icon><Plus /></el-icon>新增入库</el-button>
        <el-button text @click="handleRefresh"><el-icon><Refresh /></el-icon></el-button>
      </div>

      <el-table v-loading="loading" :data="tableData" stripe border>
        <el-table-column label="化学品" min-width="160" show-overflow-tooltip>
          <template #default="{ row }">{{ chemicalNameOf(row.chemicalId) }}</template>
        </el-table-column>
        <el-table-column prop="batchNo" label="批次号" width="140" />
        <el-table-column prop="quantity" label="库存数量" width="100" align="right" />
        <el-table-column prop="unit" label="单位" width="70" align="center" />
        <el-table-column prop="warehouseLocation" label="存放位置" width="150" show-overflow-tooltip />
        <el-table-column prop="manufactureDate" label="生产日期" width="120" />
        <el-table-column prop="expireDate" label="到期日期" width="120" />
        <el-table-column prop="supplier" label="供应商" width="140" show-overflow-tooltip />
        <el-table-column prop="status" label="状态" width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="statusTag(row.status)">{{ statusName(row.status) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="140" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link size="small" @click="handleEdit(row)">编辑</el-button>
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

    <el-dialog v-model="dialogVisible" :title="isEdit ? '编辑库存' : '新增入库'" width="640px" destroy-on-close>
      <el-form ref="formRef" :model="formData" :rules="formRules" label-width="110px">
        <el-row :gutter="16">
          <el-col :span="24" v-if="!isEdit">
            <el-form-item label="化学品" prop="chemicalId">
              <el-select v-model="formData.chemicalId" placeholder="请选择化学品" filterable style="width: 100%">
                <el-option v-for="item in chemicalList" :key="item.chemicalId" :label="item.chemicalName" :value="item.chemicalId" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="批次号" prop="batchNo">
              <el-input v-model="formData.batchNo" placeholder="请输入批次号" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="数量" prop="quantity">
              <el-input-number v-model="formData.quantity" :min="0" :precision="2" style="width: 100%" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="单位">
              <el-input v-model="formData.unit" placeholder="如：kg、L" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="存放位置">
              <el-input v-model="formData.warehouseLocation" placeholder="请输入" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="生产日期">
              <el-date-picker v-model="formData.manufactureDate" type="date" value-format="YYYY-MM-DD" style="width: 100%" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="到期日期">
              <el-date-picker v-model="formData.expireDate" type="date" value-format="YYYY-MM-DD" style="width: 100%" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="最低库存">
              <el-input-number v-model="formData.minStock" :min="0" :precision="2" style="width: 100%" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="最大库存">
              <el-input-number v-model="formData.maxStock" :min="0" :precision="2" style="width: 100%" />
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="供应商">
              <el-input v-model="formData.supplier" placeholder="请输入" />
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
import { ElMessage } from 'element-plus'
import { Plus, Refresh } from '@element-plus/icons-vue'
import { hazmatApi } from '@/api/modules/hazmat'

const loading = ref(false)
const dialogVisible = ref(false)
const submitLoading = ref(false)
const isEdit = ref(false)
const formRef = ref()
const chemicalList = ref([])

const queryForm = reactive({ chemicalId: undefined, status: undefined })
const pagination = reactive({ page: 1, pageSize: 20, total: 0 })
const tableData = ref([])

const initForm = () => ({
  stockId: null,
  chemicalId: undefined,
  batchNo: '',
  quantity: 0,
  unit: '',
  warehouseLocation: '',
  manufactureDate: '',
  expireDate: '',
  supplier: '',
  minStock: 0,
  maxStock: 0
})
const formData = reactive(initForm())

const formRules = {
  chemicalId: [{ required: true, message: '请选择化学品', trigger: 'change' }],
  batchNo: [{ required: true, message: '请输入批次号', trigger: 'blur' }],
  quantity: [{ required: true, message: '请输入数量', trigger: 'blur' }]
}

const statusName = (v) => ({ 1: '正常', 2: '库存不足', 3: '已过期' }[v] || '-')
const statusTag = (v) => ({ 1: 'success', 2: 'warning', 3: 'danger' }[v] || 'info')

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
      chemicalId: queryForm.chemicalId,
      status: queryForm.status
    }
    Object.keys(params).forEach(k => (params[k] === '' || params[k] === undefined) && delete params[k])
    const res = await hazmatApi.listStocks(params)
    tableData.value = res.items || res.list || res.data || []
    pagination.total = res.total || 0
  } catch {
    ElMessage.error('加载库存列表失败')
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
const handleReset = () => { Object.assign(queryForm, { chemicalId: undefined, status: undefined }); handleSearch() }
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

const handleSubmit = async () => {
  if (!formRef.value) return
  await formRef.value.validate(async (valid) => {
    if (!valid) return
    submitLoading.value = true
    try {
      if (isEdit.value) {
        await hazmatApi.updateStock(formData.stockId, formData)
        ElMessage.success('更新成功')
      } else {
        await hazmatApi.createStock(formData.chemicalId, formData)
        ElMessage.success('入库成功')
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
.stocks-page { padding: 16px; }
.search-card, .table-card { margin-bottom: 16px; }
.toolbar { display: flex; justify-content: space-between; margin-bottom: 12px; }
.pagination-wrapper { margin-top: 16px; display: flex; justify-content: flex-end; }
</style>
