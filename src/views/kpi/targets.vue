<template>
  <div class="page-container">
    <el-card class="search-card">
      <el-form :model="queryForm" inline>
        <el-form-item label="指标名称">
          <el-input v-model="queryForm.keyword" placeholder="请输入指标名称" clearable style="width: 200px" />
        </el-form-item>
        <el-form-item label="考核周期">
          <el-select v-model="queryForm.cycle" placeholder="请选择" clearable style="width: 140px">
            <el-option label="月度" value="MONTHLY" />
            <el-option label="季度" value="QUARTERLY" />
            <el-option label="年度" value="YEARLY" />
          </el-select>
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="queryForm.status" placeholder="请选择" clearable style="width: 120px">
            <el-option label="待发布" value="DRAFT" />
            <el-option label="进行中" value="PUBLISHED" />
            <el-option label="已结束" value="FINISHED" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">查询</el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card class="table-card">
      <div class="toolbar">
        <el-button type="primary" @click="handleAdd">
          <el-icon><Plus /></el-icon> 新增指标
        </el-button>
      </div>

      <el-table :data="tableData" v-loading="loading" stripe>
        <el-table-column prop="indicatorId" label="指标ID" width="90" />
        <el-table-column prop="indicatorName" label="指标名称" min-width="180" show-overflow-tooltip />
        <el-table-column prop="category" label="考核类别" width="120" />
        <el-table-column prop="cycle" label="考核周期" width="100">
          <template #default="{ row }">
            <el-tag size="small">{{ cycleLabel[row.cycle] || row.cycle }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="targetValue" label="目标值" width="100" />
        <el-table-column prop="unit" label="单位" width="80" />
        <el-table-column prop="weight" label="权重%" width="90" />
        <el-table-column prop="dataSource" label="数据来源" min-width="120" show-overflow-tooltip />
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="statusType[row.status] || 'info'" size="small">
              {{ statusLabel[row.status] || row.status }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="180" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link size="small" @click="handleEdit(row)">编辑</el-button>
            <el-button v-if="row.status === 'DRAFT'" type="success" link size="small" @click="handlePublish(row)">发布</el-button>
            <el-button type="danger" link size="small" @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <el-pagination
        v-model:current-page="pagination.pageNum"
        v-model:page-size="pagination.pageSize"
        :total="pagination.total"
        :page-sizes="[10, 20, 50]"
        layout="total, sizes, prev, pager, next"
        class="pagination"
        @size-change="loadData"
        @current-change="loadData"
      />
    </el-card>

    <el-dialog v-model="dialogVisible" :title="dialogTitle" width="600px" destroy-on-close>
      <el-form ref="formRef" :model="formData" :rules="formRules" label-width="100px">
        <el-form-item label="指标名称" prop="indicatorName">
          <el-input v-model="formData.indicatorName" placeholder="请输入指标名称" />
        </el-form-item>
        <el-form-item label="考核类别" prop="category">
          <el-input v-model="formData.category" placeholder="如：安全管理、设备管理" />
        </el-form-item>
        <el-form-item label="考核周期" prop="cycle">
          <el-select v-model="formData.cycle" placeholder="请选择" style="width: 100%">
            <el-option label="月度" value="MONTHLY" />
            <el-option label="季度" value="QUARTERLY" />
            <el-option label="年度" value="YEARLY" />
          </el-select>
        </el-form-item>
        <el-form-item label="目标值" prop="targetValue">
          <el-input-number v-model="formData.targetValue" :min="0" style="width: 100%" />
        </el-form-item>
        <el-form-item label="单位" prop="unit">
          <el-input v-model="formData.unit" placeholder="如：次、%、人" />
        </el-form-item>
        <el-form-item label="权重" prop="weight">
          <el-input-number v-model="formData.weight" :min="0" :max="100" style="width: 100%" /> %
        </el-form-item>
        <el-form-item label="数据来源" prop="dataSource">
          <el-input v-model="formData.dataSource" placeholder="如：隐患系统、巡检记录" />
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-radio-group v-model="formData.status">
            <el-radio label="DRAFT">待发布</el-radio>
            <el-radio label="PUBLISHED">进行中</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts" name="KpiTargets">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'
import { kpiApi } from '@/api/modules/kpi'

const loading = ref(false)
const tableData = ref<any[]>([])
const dialogVisible = ref(false)
const dialogTitle = ref('新增指标')
const formRef = ref()

const pagination = reactive({ pageNum: 1, pageSize: 20, total: 0 })
const queryForm = reactive({ keyword: '', cycle: '', status: '' })
const formData = reactive({ indicatorId: null as number | null, indicatorName: '', category: '', cycle: 'MONTHLY', targetValue: 0, unit: '', weight: 0, dataSource: '', status: 'DRAFT' })

const formRules = { indicatorName: [{ required: true, message: '请输入指标名称', trigger: 'blur' }] }
const cycleLabel: Record<string, string> = { MONTHLY: '月度', QUARTERLY: '季度', YEARLY: '年度' }
const statusLabel: Record<string, string> = { DRAFT: '待发布', PUBLISHED: '进行中', FINISHED: '已结束' }
const statusType: Record<string, string> = { DRAFT: 'info', PUBLISHED: 'success', FINISHED: 'warning' }

async function loadData() {
  loading.value = true
  try {
    const res: any = await kpiApi.listTargets({ page: pagination.pageNum, page_size: pagination.pageSize, keyword: queryForm.keyword, cycle: queryForm.cycle })
    tableData.value = res.data?.list || []
    pagination.total = res.data?.pageInfo?.total || 0
  } finally {
    loading.value = false
  }
}

function handleSearch() { pagination.pageNum = 1; loadData() }
function handleReset() { Object.assign(queryForm, { keyword: '', cycle: '', status: '' }); handleSearch() }

function handleAdd() {
  dialogTitle.value = '新增指标'
  Object.assign(formData, { indicatorId: null, indicatorName: '', category: '', cycle: 'MONTHLY', targetValue: 0, unit: '', weight: 0, dataSource: '', status: 'DRAFT' })
  dialogVisible.value = true
}
function handleEdit(row: any) {
  dialogTitle.value = '编辑指标'
  Object.assign(formData, row)
  dialogVisible.value = true
}
async function handleDelete(row: any) {
  await ElMessageBox.confirm(`确定删除指标「${row.indicatorName}」吗？`, '提示')
  await kpiApi.deleteTarget(row.indicatorId)
  ElMessage.success('删除成功')
  loadData()
}
async function handlePublish(row: any) {
  await ElMessageBox.confirm(`确定发布指标「${row.indicatorName}」吗？`, '提示')
  await kpiApi.publishTarget(row.indicatorId)
  ElMessage.success('发布成功')
  loadData()
}
async function handleSubmit() {
  await (formRef.value as any).validate()
  if (formData.indicatorId) {
    await kpiApi.updateTarget(formData.indicatorId, formData as any)
    ElMessage.success('修改成功')
  } else {
    await kpiApi.createTarget(formData as any)
    ElMessage.success('新增成功')
  }
  dialogVisible.value = false
  loadData()
}

onMounted(() => loadData())
</script>

<style lang="scss" scoped>
.toolbar { margin-bottom: 16px; }
.pagination { margin-top: 16px; justify-content: flex-end; }
</style>
