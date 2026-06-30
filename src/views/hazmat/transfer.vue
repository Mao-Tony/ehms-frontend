<template>
  <div class="transfer-page">
    <el-card class="search-card">
      <el-form :model="queryForm" inline>
        <el-form-item label="记录类型">
          <el-select v-model="queryForm.recordType" placeholder="全部" clearable style="width: 130px">
            <el-option label="入库" value="in" />
            <el-option label="出库" value="out" />
          </el-select>
        </el-form-item>
        <el-form-item label="审批状态">
          <el-select v-model="queryForm.approvalStatus" placeholder="请选择" clearable style="width: 150px">
            <el-option label="待审批" value="pending" />
            <el-option label="已审批" value="approved" />
            <el-option label="已拒绝" value="rejected" />
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
        <el-button type="primary" @click="handleAdd"><el-icon><Plus /></el-icon>新增转移记录</el-button>
        <el-button text @click="handleRefresh"><el-icon><Refresh /></el-icon></el-button>
      </div>

      <el-table v-loading="loading" :data="tableData" stripe border>
        <el-table-column label="化学品" min-width="150" show-overflow-tooltip>
          <template #default="{ row }">{{ chemicalNameOf(row.chemicalId) }}</template>
        </el-table-column>
        <el-table-column prop="recordType" label="类型" width="80" align="center">
          <template #default="{ row }">
            <el-tag :type="row.recordType === 'in' ? 'success' : 'warning'">
              {{ row.recordType === 'in' ? '入库' : '出库' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="batchNo" label="批次号" width="140" />
        <el-table-column prop="quantity" label="数量" width="100" align="right" />
        <el-table-column prop="purpose" label="用途" min-width="160" show-overflow-tooltip />
        <el-table-column prop="operatorId" label="操作人" width="100" align="center" />
        <el-table-column prop="operateTime" label="操作时间" width="160" />
        <el-table-column prop="approvalStatus" label="审批状态" width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="approvalTag(row.approvalStatus)">{{ approvalName(row.approvalStatus) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="remark" label="备注" min-width="120" show-overflow-tooltip />
        <el-table-column label="操作" width="160" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link size="small" @click="handleView(row)">查看</el-button>
            <el-button v-if="row.approvalStatus === 'pending'" type="success" link size="small" @click="handleApprove(row)">审批</el-button>
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

    <el-dialog v-model="dialogVisible" title="新增转移记录" width="640px" destroy-on-close>
      <el-form ref="formRef" :model="formData" :rules="formRules" label-width="110px">
        <el-form-item label="库存批次" prop="stockId">
          <el-select v-model="formData.stockId" placeholder="请选择库存批次" filterable style="width: 100%">
            <el-option v-for="item in stockList" :key="item.stockId"
              :label="`${chemicalNameOf(item.chemicalId)} - 批次${item.batchNo || ''} (剩余${item.quantity})`"
              :value="item.stockId" />
          </el-select>
        </el-form-item>
        <el-row :gutter="16">
          <el-col :span="12">
            <el-form-item label="记录类型" prop="recordType">
              <el-select v-model="formData.recordType" style="width: 100%">
                <el-option label="入库" value="in" />
                <el-option label="出库" value="out" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="数量" prop="quantity">
              <el-input-number v-model="formData.quantity" :min="0" :precision="2" style="width: 100%" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="批次号">
              <el-input v-model="formData.batchNo" placeholder="请输入" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="用途">
              <el-input v-model="formData.purpose" placeholder="请输入" />
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="备注">
              <el-input v-model="formData.remark" type="textarea" :rows="3" />
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="submitLoading" @click="handleSubmit">确定</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="viewDialogVisible" title="转移记录详情" width="600px" destroy-on-close>
      <el-descriptions :column="2" border v-if="currentRow">
        <el-descriptions-item label="化学品">{{ chemicalNameOf(currentRow.chemicalId) }}</el-descriptions-item>
        <el-descriptions-item label="类型">{{ currentRow.recordType === 'in' ? '入库' : '出库' }}</el-descriptions-item>
        <el-descriptions-item label="批次号">{{ currentRow.batchNo || '-' }}</el-descriptions-item>
        <el-descriptions-item label="数量">{{ currentRow.quantity }}</el-descriptions-item>
        <el-descriptions-item label="操作人">{{ currentRow.operatorId || '-' }}</el-descriptions-item>
        <el-descriptions-item label="操作时间">{{ currentRow.operateTime || '-' }}</el-descriptions-item>
        <el-descriptions-item label="用途" :span="2">{{ currentRow.purpose || '-' }}</el-descriptions-item>
        <el-descriptions-item label="审批状态">
          <el-tag :type="approvalTag(currentRow.approvalStatus)">{{ approvalName(currentRow.approvalStatus) }}</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="备注" :span="2">{{ currentRow.remark || '-' }}</el-descriptions-item>
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
const formRef = ref()
const stockList = ref([])
const chemicalList = ref([])
const currentRow = ref(null)

const queryForm = reactive({ recordType: '', approvalStatus: '' })
const pagination = reactive({ page: 1, pageSize: 20, total: 0 })
const tableData = ref([])

const initForm = () => ({
  stockId: undefined,
  recordType: 'out',
  quantity: 0,
  batchNo: '',
  purpose: '',
  remark: ''
})
const formData = reactive(initForm())

const formRules = {
  stockId: [{ required: true, message: '请选择库存批次', trigger: 'change' }],
  recordType: [{ required: true, message: '请选择记录类型', trigger: 'change' }],
  quantity: [{ required: true, message: '请输入数量', trigger: 'blur' }]
}

const approvalName = (v) => ({ pending: '待审批', approved: '已审批', rejected: '已拒绝' }[v] || v || '-')
const approvalTag = (v) => ({ pending: 'warning', approved: 'success', rejected: 'danger' }[v] || 'info')

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
      recordType: queryForm.recordType,
      approvalStatus: queryForm.approvalStatus
    }
    Object.keys(params).forEach(k => params[k] === '' && delete params[k])
    const res = await hazmatApi.listTransferRecords(params)
    tableData.value = res.items || res.list || res.data || []
    pagination.total = res.total || 0
  } catch {
    ElMessage.error('加载转移记录失败')
  } finally {
    loading.value = false
  }
}

const loadStocksAndChemicals = async () => {
  try {
    const [r1, r2] = await Promise.all([
      hazmatApi.listStocks({ page: 1, pageSize: 200 }),
      hazmatApi.list({ page: 1, pageSize: 200 })
    ])
    stockList.value = r1.items || r1.list || []
    chemicalList.value = r2.items || r2.list || []
  } catch { /* ignore */ }
}

const handleSearch = () => { pagination.page = 1; loadData() }
const handleReset = () => { Object.assign(queryForm, { recordType: '', approvalStatus: '' }); handleSearch() }
const handleRefresh = () => loadData()

const handleAdd = () => {
  Object.assign(formData, initForm())
  dialogVisible.value = true
}

const handleView = (row) => {
  currentRow.value = row
  viewDialogVisible.value = true
}

const handleApprove = async (row) => {
  try {
    await hazmatApi.approveTransferRecord(row.recordId)
    ElMessage.success('审批成功')
    loadData()
  } catch {
    ElMessage.error('审批失败')
  }
}

const handleSubmit = async () => {
  if (!formRef.value) return
  await formRef.value.validate(async (valid) => {
    if (!valid) return
    submitLoading.value = true
    try {
      await hazmatApi.createTransferRecord(formData.stockId, {
        recordType: formData.recordType,
        quantity: formData.quantity,
        batchNo: formData.batchNo,
        purpose: formData.purpose,
        remark: formData.remark
      })
      ElMessage.success('保存成功')
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
  loadStocksAndChemicals()
  loadData()
})
</script>

<style scoped>
.transfer-page { padding: 16px; }
.search-card, .table-card { margin-bottom: 16px; }
.toolbar { display: flex; justify-content: space-between; margin-bottom: 12px; }
.pagination-wrapper { margin-top: 16px; display: flex; justify-content: flex-end; }
</style>
