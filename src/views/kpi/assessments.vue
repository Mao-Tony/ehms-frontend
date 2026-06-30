<template>
  <div class="kpi-assessments-container">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>考核任务</span>
          <el-button type="primary" @click="handleAdd">新增任务</el-button>
        </div>
      </template>

      <el-form :inline="true" :model="queryForm" class="search-form">
        <el-form-item label="考核周期">
          <el-select v-model="queryForm.assessPeriod" placeholder="全部" clearable style="width: 140px">
            <el-option label="月度" value="monthly" />
            <el-option label="季度" value="quarterly" />
            <el-option label="年度" value="yearly" />
          </el-select>
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="queryForm.status" placeholder="全部" clearable style="width: 140px">
            <el-option v-for="(label, k) in statusMap" :key="k" :label="label" :value="k" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">搜索</el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>

      <el-table v-loading="loading" :data="tableData" border>
        <el-table-column prop="taskCode" label="任务编号" width="160" />
        <el-table-column prop="taskName" label="任务名称" min-width="180" show-overflow-tooltip />
        <el-table-column prop="assessPeriod" label="周期" width="100">
          <template #default="{ row }">{{ periodMap[row.assessPeriod] || row.assessPeriod || '-' }}</template>
        </el-table-column>
        <el-table-column label="期间" width="140">
          <template #default="{ row }">
            {{ row.periodYear || '-' }}{{ row.periodMonth ? '-' + row.periodMonth + '月' : (row.periodQuarter ? '-Q' + row.periodQuarter : '') }}
          </template>
        </el-table-column>
        <el-table-column prop="deptId" label="部门ID" width="100" />
        <el-table-column prop="targetValue" label="目标值" width="100" />
        <el-table-column prop="actualValue" label="实际值" width="100" />
        <el-table-column prop="score" label="得分" width="100">
          <template #default="{ row }">
            <span v-if="row.score != null" :style="{ color: scoreColor(row.score) }">{{ Number(row.score).toFixed(1) }}</span>
            <span v-else>-</span>
          </template>
        </el-table-column>
        <el-table-column label="状态" width="110">
          <template #default="{ row }">
            <el-tag :type="statusTag(row.status)">{{ statusMap[row.status] || row.status || '-' }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link @click="handleScore(row)">评分</el-button>
            <el-button type="primary" link @click="handleEdit(row)">编辑</el-button>
            <el-button type="info" link @click="handleViewScores(row)">得分明细</el-button>
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
          @current-change="fetchData"
          @size-change="fetchData"
        />
      </div>
    </el-card>

    <!-- 新增/编辑对话框 -->
    <el-dialog v-model="dialogVisible" :title="formTitle" width="640px">
      <el-form ref="formRef" :model="formData" :rules="rules" label-width="110px">
        <el-row :gutter="16">
          <el-col :span="12">
            <el-form-item label="任务编号" prop="taskCode">
              <el-input v-model="formData.taskCode" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="任务名称" prop="taskName">
              <el-input v-model="formData.taskName" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="关联指标ID">
              <el-input-number v-model="formData.indicatorId" :min="0" style="width:100%" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="部门ID">
              <el-input-number v-model="formData.deptId" :min="0" style="width:100%" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="考核周期">
              <el-select v-model="formData.assessPeriod" style="width:100%">
                <el-option v-for="(label, k) in periodMap" :key="k" :label="label" :value="k" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="年度">
              <el-input-number v-model="formData.periodYear" :min="2020" :max="2100" style="width:100%" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="月份">
              <el-input-number v-model="formData.periodMonth" :min="1" :max="12" style="width:100%" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="季度">
              <el-input-number v-model="formData.periodQuarter" :min="1" :max="4" style="width:100%" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="目标值">
              <el-input-number v-model="formData.targetValue" style="width:100%" />
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="saving" @click="handleSubmit">保存</el-button>
      </template>
    </el-dialog>

    <!-- 评分对话框 -->
    <el-dialog v-model="scoreDialogVisible" title="录入实际值与得分" width="500px">
      <el-form label-width="100px">
        <el-form-item label="实际值">
          <el-input-number v-model="scoreForm.actualValue" style="width:100%" />
        </el-form-item>
        <el-form-item label="得分">
          <el-input-number v-model="scoreForm.score" :min="0" :max="100" style="width:100%" />
        </el-form-item>
        <el-form-item label="评语">
          <el-input v-model="scoreForm.comment" type="textarea" :rows="3" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="scoreDialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="saving" @click="handleScoreSubmit">提交</el-button>
      </template>
    </el-dialog>

    <!-- 得分明细对话框 -->
    <el-dialog v-model="scoresVisible" title="得分明细" width="640px">
      <el-table :data="scoreList" border max-height="400">
        <el-table-column prop="deptId" label="部门ID" width="100" />
        <el-table-column prop="score" label="得分" width="100" />
        <el-table-column prop="scoreLevel" label="评级" width="100" />
        <el-table-column prop="rankInDept" label="部门内排名" width="120" />
        <el-table-column prop="rankInCompany" label="公司内排名" width="120" />
        <el-table-column prop="comment" label="评语" show-overflow-tooltip />
      </el-table>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import { ElMessage, FormInstance, FormRules } from 'element-plus'
import { kpiApi } from '@/api/modules/kpi'

const loading = ref(false)
const saving = ref(false)
const tableData = ref<any[]>([])
const total = ref(0)
const dialogVisible = ref(false)
const formTitle = ref('新增考核任务')
const formRef = ref<FormInstance>()
const scoreDialogVisible = ref(false)
const scoresVisible = ref(false)
const scoreList = ref<any[]>([])
const currentTask = ref<any>(null)

const queryForm = reactive({ assessPeriod: '', status: '', page: 1, pageSize: 20 })

const formData = reactive<any>({
  taskCode: '',
  taskName: '',
  indicatorId: undefined,
  deptId: undefined,
  assessPeriod: 'monthly',
  periodYear: new Date().getFullYear(),
  periodMonth: new Date().getMonth() + 1,
  periodQuarter: undefined,
  targetValue: undefined
})

const scoreForm = reactive({ actualValue: undefined as any, score: undefined as any, comment: '' })

const rules: FormRules = {
  taskCode: [{ required: true, message: '请输入任务编号', trigger: 'blur' }],
  taskName: [{ required: true, message: '请输入任务名称', trigger: 'blur' }]
}

const periodMap: Record<string, string> = { monthly: '月度', quarterly: '季度', yearly: '年度' }
const statusMap: Record<string, string> = {
  pending: '待考核',
  in_progress: '考核中',
  completed: '已完成',
  archived: '已归档'
}

function statusTag(s?: string): any {
  return ({ pending: 'info', in_progress: 'warning', completed: 'success', archived: '' } as any)[s || ''] || 'info'
}

function scoreColor(s?: number): string {
  if (s == null) return '#909399'
  if (s >= 90) return '#67C23A'
  if (s >= 75) return '#409EFF'
  if (s >= 60) return '#E6A23C'
  return '#F56C6C'
}

async function fetchData() {
  loading.value = true
  try {
    const res: any = await kpiApi.listAssessments({ page: queryForm.page, pageSize: queryForm.pageSize } as any)
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
  Object.assign(queryForm, { assessPeriod: '', status: '', page: 1 })
  fetchData()
}

function resetForm() {
  Object.assign(formData, {
    taskId: undefined,
    taskCode: '',
    taskName: '',
    indicatorId: undefined,
    deptId: undefined,
    assessPeriod: 'monthly',
    periodYear: new Date().getFullYear(),
    periodMonth: new Date().getMonth() + 1,
    periodQuarter: undefined,
    targetValue: undefined
  })
}

function handleAdd() {
  resetForm()
  formTitle.value = '新增考核任务'
  dialogVisible.value = true
}

function handleEdit(row: any) {
  resetForm()
  Object.assign(formData, row)
  formTitle.value = '编辑考核任务'
  dialogVisible.value = true
}

async function handleSubmit() {
  if (!formRef.value) return
  const valid = await formRef.value.validate().catch(() => false)
  if (!valid) return
  saving.value = true
  try {
    if (formData.taskId) {
      await kpiApi.updateAssessment(formData.taskId, formData)
      ElMessage.success('更新成功')
    } else {
      await kpiApi.createAssessment(formData)
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

function handleScore(row: any) {
  currentTask.value = row
  scoreForm.actualValue = row.actualValue
  scoreForm.score = row.score
  scoreForm.comment = ''
  scoreDialogVisible.value = true
}

async function handleScoreSubmit() {
  if (!currentTask.value) return
  saving.value = true
  try {
    await kpiApi.updateAssessment(currentTask.value.taskId, {
      actualValue: scoreForm.actualValue,
      score: scoreForm.score,
      status: 'completed'
    } as any)
    ElMessage.success('评分已提交')
    scoreDialogVisible.value = false
    fetchData()
  } catch (e) {
    console.error(e)
  } finally {
    saving.value = false
  }
}

async function handleViewScores(row: any) {
  try {
    const res: any = await kpiApi.getAssessmentScores(row.taskId)
    scoreList.value = res.data?.items || res.data || []
    scoresVisible.value = true
  } catch (e) {
    console.error(e)
  }
}

onMounted(fetchData)
</script>

<style scoped>
.kpi-assessments-container { padding: 16px; }
.card-header { display: flex; justify-content: space-between; align-items: center; }
.search-form { margin-bottom: 16px; }
.pagination { margin-top: 16px; display: flex; justify-content: flex-end; }
</style>
