<template>
  <div class="page-container">
    <el-card class="filter-card" shadow="never">
      <div class="filter-row">
        <span class="label">选择课程：</span>
        <el-select
          v-model="selectedCourseId"
          placeholder="请选择培训课程"
          filterable
          remote
          :remote-method="searchCourses"
          :loading="courseLoading"
          style="width: 360px"
          clearable
          @change="onCourseChange"
        >
          <el-option
            v-for="c in courseOptions"
            :key="c.id"
            :label="c.title"
            :value="c.id"
          />
        </el-select>
        <el-button type="primary" :icon="Refresh" @click="loadSchedules" :disabled="!selectedCourseId">刷新</el-button>
        <el-button type="success" :icon="Plus" @click="openCreateDialog" :disabled="!selectedCourseId">新增排课</el-button>
      </div>
    </el-card>

    <el-card v-if="selectedCourseId" class="kpi-card" shadow="never">
      <el-row :gutter="12">
        <el-col :span="6">
          <div class="kpi-item">
            <div class="kpi-label">排课总数</div>
            <div class="kpi-value">{{ scheduleList.length }}</div>
          </div>
        </el-col>
        <el-col :span="6">
          <div class="kpi-item">
            <div class="kpi-label">已排定</div>
            <div class="kpi-value text-warning">{{ statusCount('scheduled') }}</div>
          </div>
        </el-col>
        <el-col :span="6">
          <div class="kpi-item">
            <div class="kpi-label">进行中</div>
            <div class="kpi-value text-primary">{{ statusCount('in_progress') }}</div>
          </div>
        </el-col>
        <el-col :span="6">
          <div class="kpi-item">
            <div class="kpi-label">已完成</div>
            <div class="kpi-value text-success">{{ statusCount('completed') }}</div>
          </div>
        </el-col>
      </el-row>
    </el-card>

    <el-card v-if="selectedCourseId" shadow="never">
      <el-table :data="scheduleList" v-loading="loading" border stripe>
        <el-table-column prop="scheduleId" label="ID" width="80" />
        <el-table-column prop="scheduleType" label="类型" width="100">
          <template #default="{ row }">
            <el-tag :type="scheduleTypeTag(row.scheduleType)" size="small">
              {{ scheduleTypeLabel(row.scheduleType) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="trainDate" label="培训日期" width="120" />
        <el-table-column label="时段" width="160">
          <template #default="{ row }">
            <span>{{ row.startTime || '-' }} ~ {{ row.endTime || '-' }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="location" label="地点" min-width="160" show-overflow-tooltip />
        <el-table-column prop="instructorName" label="讲师" width="120" />
        <el-table-column label="人数" width="140">
          <template #default="{ row }">
            <el-progress
              :percentage="attendanceRate(row)"
              :stroke-width="14"
              :format="() => `${row.currentAttendees}/${row.maxAttendees}`"
            />
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="statusTag(row.status)" size="small">{{ statusLabel(row.status) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createdAt" label="创建时间" width="170" />
      </el-table>
    </el-card>

    <el-card v-else class="empty-card" shadow="never">
      <el-empty description="请先选择培训课程以查看排课" />
    </el-card>

    <!-- 新增排课对话框 -->
    <el-dialog v-model="dialogVisible" title="新增排课" width="560px" @closed="resetForm">
      <el-form ref="formRef" :model="form" :rules="formRules" label-width="100px">
        <el-form-item label="排课类型" prop="scheduleType">
          <el-select v-model="form.scheduleType" placeholder="请选择" style="width: 100%">
            <el-option label="集中培训" value="onsite" />
            <el-option label="在线培训" value="online" />
            <el-option label="自学" value="self_study" />
            <el-option label="实操" value="practice" />
          </el-select>
        </el-form-item>
        <el-form-item label="培训日期" prop="trainDate">
          <el-date-picker v-model="form.trainDate" type="date" value-format="YYYY-MM-DD" style="width: 100%" />
        </el-form-item>
        <el-form-item label="开始时间">
          <el-time-picker v-model="form.startTime" value-format="HH:mm" format="HH:mm" style="width: 100%" />
        </el-form-item>
        <el-form-item label="结束时间">
          <el-time-picker v-model="form.endTime" value-format="HH:mm" format="HH:mm" style="width: 100%" />
        </el-form-item>
        <el-form-item label="地点">
          <el-input v-model="form.location" placeholder="请输入培训地点" />
        </el-form-item>
        <el-form-item label="讲师">
          <el-input v-model="form.instructorName" placeholder="讲师姓名" />
        </el-form-item>
        <el-form-item label="讲师ID">
          <el-input-number v-model="form.instructorId" :min="0" controls-position="right" style="width: 100%" />
        </el-form-item>
        <el-form-item label="最大人数">
          <el-input-number v-model="form.maxAttendees" :min="0" controls-position="right" style="width: 100%" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="submitting" @click="submitCreate">提交</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts" name="TrainingSchedule">
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage, type FormInstance, type FormRules } from 'element-plus'
import { Refresh, Plus } from '@element-plus/icons-vue'
import { trainingApi, type TrainingSchedule, type Training } from '@/api/modules/training'

const loading = ref(false)
const courseLoading = ref(false)
const submitting = ref(false)
const dialogVisible = ref(false)
const formRef = ref<FormInstance>()

const selectedCourseId = ref<number | null>(null)
const courseOptions = ref<Training[]>([])
const scheduleList = ref<TrainingSchedule[]>([])

const form = reactive<Partial<TrainingSchedule>>({
  scheduleType: '',
  trainDate: '',
  startTime: '',
  endTime: '',
  location: '',
  instructorId: undefined,
  instructorName: '',
  maxAttendees: 0
})

const formRules: FormRules = {
  scheduleType: [{ required: true, message: '请选择排课类型', trigger: 'change' }],
  trainDate: [{ required: true, message: '请选择培训日期', trigger: 'change' }]
}

async function searchCourses(keyword: string) {
  courseLoading.value = true
  try {
    const res: any = await trainingApi.list({ keyword, pageNum: 1, pageSize: 50 })
    courseOptions.value = res.data?.items || res.data?.list || []
  } catch (e) {
    console.error(e)
  } finally {
    courseLoading.value = false
  }
}

async function loadCourses() {
  await searchCourses('')
}

function onCourseChange() {
  scheduleList.value = []
  if (selectedCourseId.value) loadSchedules()
}

async function loadSchedules() {
  if (!selectedCourseId.value) return
  loading.value = true
  try {
    const res: any = await trainingApi.getSchedules(selectedCourseId.value)
    scheduleList.value = (res.data?.items || res.data || []) as TrainingSchedule[]
  } catch (e) {
    console.error(e)
    ElMessage.error('加载排课失败')
  } finally {
    loading.value = false
  }
}

function openCreateDialog() {
  dialogVisible.value = true
}

function resetForm() {
  form.scheduleType = ''
  form.trainDate = ''
  form.startTime = ''
  form.endTime = ''
  form.location = ''
  form.instructorId = undefined
  form.instructorName = ''
  form.maxAttendees = 0
  formRef.value?.resetFields()
}

async function submitCreate() {
  if (!formRef.value || !selectedCourseId.value) return
  await formRef.value.validate(async (valid) => {
    if (!valid) return
    submitting.value = true
    try {
      await trainingApi.createSchedule(selectedCourseId.value!, { ...form })
      ElMessage.success('排课创建成功')
      dialogVisible.value = false
      await loadSchedules()
    } catch (e) {
      console.error(e)
      ElMessage.error('排课创建失败')
    } finally {
      submitting.value = false
    }
  })
}

function attendanceRate(row: TrainingSchedule): number {
  if (!row.maxAttendees) return 0
  return Math.round((row.currentAttendees / row.maxAttendees) * 100)
}

function statusCount(s: string): number {
  return scheduleList.value.filter((it) => it.status === s).length
}

function scheduleTypeLabel(t?: string): string {
  const map: Record<string, string> = {
    onsite: '集中',
    online: '在线',
    self_study: '自学',
    practice: '实操'
  }
  return map[t || ''] || t || '-'
}

function scheduleTypeTag(t?: string): 'primary' | 'success' | 'warning' | 'info' | 'danger' {
  const map: Record<string, 'primary' | 'success' | 'warning' | 'info' | 'danger'> = {
    onsite: 'primary',
    online: 'success',
    self_study: 'info',
    practice: 'warning'
  }
  return map[t || ''] || 'info'
}

function statusLabel(s: string): string {
  const map: Record<string, string> = {
    scheduled: '已排定',
    in_progress: '进行中',
    completed: '已完成',
    cancelled: '已取消'
  }
  return map[s] || s
}

function statusTag(s: string): 'primary' | 'success' | 'warning' | 'info' | 'danger' {
  const map: Record<string, 'primary' | 'success' | 'warning' | 'info' | 'danger'> = {
    scheduled: 'warning',
    in_progress: 'primary',
    completed: 'success',
    cancelled: 'info'
  }
  return map[s] || 'info'
}

onMounted(() => {
  loadCourses()
})
</script>

<style lang="scss" scoped>
.page-container {
  padding: 16px;
}
.filter-card,
.kpi-card,
.empty-card {
  margin-bottom: 12px;
}
.filter-row {
  display: flex;
  align-items: center;
  gap: 12px;
}
.label {
  font-weight: 600;
  color: #303133;
}
.kpi-item {
  text-align: center;
  padding: 8px 0;
}
.kpi-label {
  font-size: 13px;
  color: #909399;
}
.kpi-value {
  font-size: 24px;
  font-weight: 600;
  margin-top: 4px;
}
.text-primary {
  color: #409eff;
}
.text-success {
  color: #67c23a;
}
.text-warning {
  color: #e6a23c;
}
</style>
