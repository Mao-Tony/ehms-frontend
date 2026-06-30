<template>
  <div class="permit-calendar">
    <div class="page-header">
      <h2>作业票日历</h2>
      <div class="header-actions">
        <el-select v-model="filterType" placeholder="作业类型" clearable style="width: 180px;" @change="loadCalendar">
          <el-option label="动火作业" value="hot_work" />
          <el-option label="受限空间" value="confined_space" />
          <el-option label="高处作业" value="height_work" />
          <el-option label="临时用电" value="temporary_electricity" />
          <el-option label="挖掘作业" value="excavation" />
          <el-option label="吊装作业" value="lifting" />
        </el-select>
        <el-select v-model="filterStatus" placeholder="状态" clearable style="width: 140px;" @change="loadCalendar">
          <el-option label="待审批" value="pending" />
          <el-option label="已批准" value="approved" />
          <el-option label="已拒绝" value="rejected" />
          <el-option label="已过期" value="expired" />
        </el-select>
        <el-button :icon="Refresh" @click="loadCalendar">刷新</el-button>
      </div>
    </div>

    <el-row :gutter="16" class="stats-row">
      <el-col :span="6">
        <el-card shadow="hover" class="stat-card stat-total">
          <div class="stat-label">本月作业票总数</div>
          <div class="stat-value">{{ stats.total }}</div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover" class="stat-card stat-pending">
          <div class="stat-label">待审批</div>
          <div class="stat-value">{{ stats.pending }}</div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover" class="stat-card stat-approved">
          <div class="stat-label">已批准</div>
          <div class="stat-value">{{ stats.approved }}</div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover" class="stat-card stat-expired">
          <div class="stat-label">已过期</div>
          <div class="stat-value">{{ stats.expired }}</div>
        </el-card>
      </el-col>
    </el-row>

    <el-card class="calendar-card">
      <el-calendar v-model="currentDate">
        <template #header="{ date }">
          <div class="calendar-header">
            <span class="calendar-title">{{ date }}</span>
            <div>
              <el-button-group>
                <el-button size="small" @click="selectDate(prevMonth)">上月</el-button>
                <el-button size="small" @click="selectDate(today)">今天</el-button>
                <el-button size="small" @click="selectDate(nextMonth)">下月</el-button>
              </el-button-group>
            </div>
          </div>
        </template>

        <template #date-cell="{ data }">
          <div class="cell-content" @click="showDayDetail(data.day)">
            <div class="cell-date">{{ data.day.split("-").slice(2).join("") }}</div>
            <div class="cell-permits" v-if="getDayPermits(data.day).length">
              <el-tag
                v-for="(p, idx) in getDayPermits(data.day).slice(0, 3)"
                :key="idx"
                :type="statusTagType(p.status)"
                size="small"
                effect="light"
                class="cell-tag"
              >
                {{ workTypeLabel(p.workType) }}
              </el-tag>
              <div v-if="getDayPermits(data.day).length > 3" class="more-count">
                +{{ getDayPermits(data.day).length - 3 }}
              </div>
            </div>
          </div>
        </template>
      </el-calendar>
    </el-card>

    <el-dialog v-model="dialogVisible" :title="`${selectedDay} 作业票详情`" width="800px">
      <el-table :data="dayPermitList" v-loading="dialogLoading" border>
        <el-table-column prop="permitCode" label="作业票编号" width="180" />
        <el-table-column prop="workType" label="作业类型" width="120">
          <template #default="{ row }">
            <el-tag>{{ workTypeLabel(row.workType) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="workLocation" label="作业地点" min-width="150" />
        <el-table-column label="计划时间" min-width="220">
          <template #default="{ row }">
            <div>{{ formatDateTime(row.planStartTime) }}</div>
            <div style="color:#909399;">至 {{ formatDateTime(row.planEndTime) }}</div>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="statusTagType(row.status)">{{ statusLabel(row.status) }}</el-tag>
          </template>
        </el-table-column>
      </el-table>
      <template #footer>
        <el-button @click="dialogVisible = false">关闭</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from "vue"
import { Refresh } from "@element-plus/icons-vue"
import { ElMessage } from "element-plus"
import { permitApi } from "@/api/modules/permit"

interface CalendarPermit {
  permitId: number
  permitCode: string
  workType: string
  workLocation?: string
  planStartTime?: string
  planEndTime?: string
  status: string
}

const currentDate = ref(new Date())
const permits = ref<CalendarPermit[]>([])
const filterType = ref("")
const filterStatus = ref("")
const dialogVisible = ref(false)
const dialogLoading = ref(false)
const selectedDay = ref("")
const dayPermitList = ref<CalendarPermit[]>([])

const today = computed(() => new Date())
const prevMonth = computed(() => {
  const d = new Date(currentDate.value)
  d.setMonth(d.getMonth() - 1)
  return d
})
const nextMonth = computed(() => {
  const d = new Date(currentDate.value)
  d.setMonth(d.getMonth() + 1)
  return d
})

const selectDate = (d: any) => {
  currentDate.value = d.value || d
}

const formatDate = (d: Date) => {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, "0")
  const day = String(d.getDate()).padStart(2, "0")
  return `${y}-${m}-${day}`
}

const monthRange = computed(() => {
  const d = new Date(currentDate.value)
  const start = new Date(d.getFullYear(), d.getMonth(), 1)
  const end = new Date(d.getFullYear(), d.getMonth() + 1, 0)
  return { startDate: formatDate(start), endDate: formatDate(end) }
})

const getDayPermits = (day: string) => {
  return permits.value.filter(p => {
    if (!p.planStartTime) return false
    const start = p.planStartTime.substring(0, 10)
    const end = p.planEndTime ? p.planEndTime.substring(0, 10) : start
    if (filterType.value && p.workType !== filterType.value) return false
    if (filterStatus.value && p.status !== filterStatus.value) return false
    return day >= start && day <= end
  })
}

const showDayDetail = (day: string) => {
  selectedDay.value = day
  dayPermitList.value = getDayPermits(day)
  dialogVisible.value = true
}

const workTypeLabel = (t: string) => {
  const map: Record<string, string> = {
    hot_work: "动火",
    confined_space: "受限",
    height_work: "高处",
    temporary_electricity: "临电",
    excavation: "挖掘",
    lifting: "吊装",
  }
  return map[t] || t
}

const statusLabel = (s: string) => {
  const map: Record<string, string> = {
    draft: "草稿",
    pending: "待审批",
    approved: "已批准",
    rejected: "已拒绝",
    expired: "已过期",
    cancelled: "已取消",
  }
  return map[s] || s
}

const statusTagType = (s: string): any => {
  const map: Record<string, string> = {
    pending: "warning",
    approved: "success",
    rejected: "danger",
    expired: "info",
    draft: "",
    cancelled: "info",
  }
  return map[s] || ""
}

const formatDateTime = (s?: string) => (s ? s.replace("T", " ").substring(0, 16) : "-")

const stats = computed(() => {
  const data = permits.value
  return {
    total: data.length,
    pending: data.filter(p => p.status === "pending").length,
    approved: data.filter(p => p.status === "approved").length,
    expired: data.filter(p => p.status === "expired").length,
  }
})

const loadCalendar = async () => {
  try {
    const { startDate, endDate } = monthRange.value
    const res: any = await permitApi.getCalendar({ startDate, endDate, pageNum: 1, pageSize: 200 })
    const list = res.data?.items || res.data?.list || res.items || res.data || []
    permits.value = list as CalendarPermit[]
  } catch (e: any) {
    ElMessage.error("加载作业票日历失败: " + (e?.message || e))
    permits.value = []
  }
}

watch(currentDate, () => loadCalendar())
onMounted(() => loadCalendar())
</script>

<style scoped>
.permit-calendar { padding: 16px; }
.page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
.page-header h2 { margin: 0; font-size: 20px; }
.header-actions { display: flex; gap: 12px; }
.stats-row { margin-bottom: 16px; }
.stat-card { text-align: center; padding: 8px; }
.stat-label { color: #909399; font-size: 13px; }
.stat-value { font-size: 28px; font-weight: 700; margin-top: 4px; }
.stat-total .stat-value { color: #409eff; }
.stat-pending .stat-value { color: #e6a23c; }
.stat-approved .stat-value { color: #67c23a; }
.stat-expired .stat-value { color: #f56c6c; }
.calendar-card { margin-bottom: 16px; }
.calendar-header { display: flex; justify-content: space-between; align-items: center; padding: 8px 0; }
.calendar-title { font-size: 16px; font-weight: 600; }
.cell-content { height: 100%; padding: 4px; cursor: pointer; min-height: 80px; }
.cell-date { font-weight: 500; margin-bottom: 4px; }
.cell-permits { display: flex; flex-direction: column; gap: 2px; }
.cell-tag { width: 100%; text-align: center; }
.more-count { color: #909399; font-size: 12px; margin-top: 2px; }
</style>
