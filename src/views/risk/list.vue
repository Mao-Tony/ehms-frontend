<template>
  <div class="risk-list">
    <el-card class="search-card">
      <el-form :model="queryForm" inline>
        <el-form-item label="关键字">
          <el-input v-model="queryForm.keyword" placeholder="风险点名称/编号" clearable style="width: 200px" />
        </el-form-item>
        <el-form-item label="风险等级">
          <el-select v-model="queryForm.level" placeholder="请选择" clearable style="width: 150px">
            <el-option label="重大风险(红)" value="RED" />
            <el-option label="较大风险(橙)" value="ORANGE" />
            <el-option label="一般风险(黄)" value="YELLOW" />
            <el-option label="低风险(蓝)" value="BLUE" />
          </el-select>
        </el-form-item>
        <el-form-item label="类型">
          <el-select v-model="queryForm.type" placeholder="请选择" clearable style="width: 150px">
            <el-option label="设备设施" value="EQUIPMENT" />
            <el-option label="作业活动" value="OPERATION" />
            <el-option label="环境因素" value="ENVIRONMENT" />
            <el-option label="管理缺陷" value="MANAGEMENT" />
          </el-select>
        </el-form-item>
        <el-form-item label="部门">
          <el-select v-model="queryForm.departmentId" placeholder="请选择" clearable style="width: 150px">
            <el-option label="生产部" :value="1" />
            <el-option label="维修部" :value="2" />
            <el-option label="仓储部" :value="3" />
          </el-select>
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="queryForm.status" placeholder="请选择" clearable style="width: 150px">
            <el-option label="启用" :value="1" />
            <el-option label="停用" :value="0" />
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
        <div class="left">
          <el-button type="primary" @click="handleAdd">
            <el-icon><Plus /></el-icon>新增风险点
          </el-button>
          <el-button @click="handleImport">
            <el-icon><Upload /></el-icon>批量导入
          </el-button>
          <el-button @click="handleExport">
            <el-icon><Download /></el-icon>导出
          </el-button>
        </div>
        <div class="right">
          <el-button text @click="handleRefresh">
            <el-icon><Refresh /></el-icon>
          </el-button>
        </div>
      </div>

      <el-table
        v-loading="loading"
        :data="tableData"
        stripe
        border
        :row-class-name="getRowClassName"
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="50" />
        <el-table-column prop="code" label="风险点编号" width="140" />
        <el-table-column prop="name" label="风险点名称" min-width="180" show-overflow-tooltip />
        <el-table-column prop="type" label="类型" width="120">
          <template #default="{ row }">
            {{ getTypeName(row.type) }}
          </template>
        </el-table-column>
        <el-table-column prop="level" label="风险等级" width="120" align="center">
          <template #default="{ row }">
            <risk-tag :level="row.level" />
          </template>
        </el-table-column>
        <el-table-column prop="dValue" label="D值" width="80" align="center" />
        <el-table-column prop="departmentName" label="所属部门" width="120" />
        <el-table-column prop="location" label="位置" min-width="150" show-overflow-tooltip />
        <el-table-column prop="responsibleName" label="责任人" width="100" />
        <el-table-column prop="status" label="状态" width="80" align="center">
          <template #default="{ row }">
            <el-switch v-model="row.status" :active-value="1" :inactive-value="0" @change="handleStatusChange(row)" />
          </template>
        </el-table-column>
        <el-table-column label="操作" width="180" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link size="small" @click="handleView(row)">查看</el-button>
            <el-button type="primary" link size="small" @click="handleEdit(row)">编辑</el-button>
            <el-button type="danger" link size="small" @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <div class="pagination-wrapper">
        <el-pagination
          v-model:current-page="queryForm.pageNum"
          v-model:page-size="queryForm.pageSize"
          :total="total"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handlePageChange"
        />
      </div>
    </el-card>

    <el-dialog v-model="dialogVisible" :title="dialogTitle" width="900px" destroy-on-close>
      <risk-form ref="riskFormRef" :id="currentId" @submit="handleSubmit" @cancel="dialogVisible = false" />
    </el-dialog>

    <el-dialog v-model="importDialogVisible" title="批量导入" width="500px">
      <el-upload
        drag
        :auto-upload="false"
        :limit="1"
        accept=".xlsx,.xls"
        :on-change="handleFileChange"
        ref="uploadRef"
      >
        <el-icon class="el-icon--upload"><UploadFilled /></el-icon>
        <div class="el-upload__text">将文件拖到此处，或<em>点击上传</em></div>
        <template #tip>
          <div class="el-upload__tip">只能上传xlsx/xls文件，建议使用模板</div>
          <el-button type="primary" link @click="handleDownloadTemplate">下载模板</el-button>
        </template>
      </el-upload>
      <template #footer>
        <el-button @click="importDialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="importLoading" @click="handleImportConfirm">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Upload, Download, Refresh, UploadFilled } from '@element-plus/icons-vue'
import { riskApi, type RiskPoint, type RiskPointQuery } from '@/api/modules/risk'
import RiskTag from '@/components/common/RiskTag.vue'
import RiskForm from './form.vue'

const loading = ref(false)
const dialogVisible = ref(false)
const importDialogVisible = ref(false)
const importLoading = ref(false)
const uploadRef = ref()
const riskFormRef = ref()

const queryForm = reactive<RiskPointQuery>({
  keyword: '',
  level: '',
  type: '',
  departmentId: undefined,
  status: undefined,
  pageNum: 1,
  pageSize: 10
})

const tableData = ref<RiskPoint[]>([])
const total = ref(0)
const selectedRows = ref<RiskPoint[]>([])
const currentId = ref<number | undefined>()
const dialogTitle = computed(() => currentId.value ? '编辑风险点' : '新增风险点')

const typeMap: Record<string, string> = {
  EQUIPMENT: '设备设施',
  OPERATION: '作业活动',
  ENVIRONMENT: '环境因素',
  MANAGEMENT: '管理缺陷'
}

function getTypeName(type: string) {
  return typeMap[type] || type
}

function getRowClassName({ row }: { row: RiskPoint }) {
  if (row.level === 'RED') return 'risk-red-row'
  if (row.level === 'ORANGE') return 'risk-orange-row'
  return ''
}

async function fetchData() {
  loading.value = true
  try {
    const res = await riskApi.list(queryForm)
    tableData.value = res.data.list
    total.value = res.data.pageInfo.total
  } catch (error) {
    console.error(error)
  } finally {
    loading.value = false
  }
}

function handleSearch() {
  queryForm.pageNum = 1
  fetchData()
}

function handleReset() {
  Object.assign(queryForm, {
    keyword: '',
    level: '',
    type: '',
    departmentId: undefined,
    status: undefined,
    pageNum: 1
  })
  fetchData()
}

function handleRefresh() {
  fetchData()
}

function handleAdd() {
  currentId.value = undefined
  dialogVisible.value = true
}

function handleEdit(row: RiskPoint) {
  currentId.value = row.id
  dialogVisible.value = true
}

function handleView(row: RiskPoint) {
  currentId.value = row.id
  dialogVisible.value = true
}

async function handleDelete(row: RiskPoint) {
  await ElMessageBox.confirm(`确定要删除风险点"${row.name}"吗？`, '提示', { type: 'warning' })
  await riskApi.delete(row.id)
  ElMessage.success('删除成功')
  fetchData()
}

async function handleStatusChange(row: RiskPoint) {
  ElMessage.success(`${row.name}已${row.status ? '启用' : '停用'}`)
}

function handleSelectionChange(rows: RiskPoint[]) {
  selectedRows.value = rows
}

function handleSizeChange() {
  fetchData()
}

function handlePageChange() {
  fetchData()
}

function handleImport() {
  importDialogVisible.value = true
}

function handleFileChange() {}

function handleDownloadTemplate() {
  ElMessage.info('下载模板')
}

async function handleImportConfirm() {
  importLoading.value = true
  try {
    ElMessage.success('导入成功')
    importDialogVisible.value = false
    fetchData()
  } catch (error) {
    ElMessage.error('导入失败')
  } finally {
    importLoading.value = false
  }
}

async function handleExport() {
  ElMessage.info('正在导出...')
}

async function handleSubmit() {
  dialogVisible.value = false
  ElMessage.success('保存成功')
  fetchData()
}

onMounted(() => {
  fetchData()
})
</script>

<style lang="scss" scoped>
.risk-list {
  .search-card {
    margin-bottom: 16px;
  }

  .table-card {
    .toolbar {
      display: flex;
      justify-content: space-between;
      margin-bottom: 16px;

      .left {
        display: flex;
        gap: 8px;
      }
    }

    .pagination-wrapper {
      margin-top: 16px;
      display: flex;
      justify-content: flex-end;
    }
  }
}

:deep(.el-table) {
  .risk-red-row {
    background-color: rgba(230, 57, 70, 0.08) !important;
  }
  .risk-orange-row {
    background-color: rgba(247, 127, 0, 0.08) !important;
  }
}
</style>
