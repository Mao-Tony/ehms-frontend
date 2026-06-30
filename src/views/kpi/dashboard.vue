<template>
  <div class="kpi-dashboard-container">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>KPI 绩效驾驶舱</span>
          <div>
            <el-select v-model="year" placeholder="年度" style="width:110px;margin-right:8px" @change="fetchAll">
              <el-option v-for="y in [2024, 2025, 2026]" :key="y" :label="y + '年'" :value="y" />
            </el-select>
            <el-select v-model="month" placeholder="月度" style="width:110px" @change="fetchMonthly">
              <el-option v-for="m in 12" :key="m" :label="m + '月'" :value="m" />
            </el-select>
          </div>
        </div>
      </template>

      <!-- KPI 概览卡 -->
      <el-row :gutter="16" class="kpi-row">
        <el-col :span="6">
          <div class="stat-card stat-blue">
            <div class="t">指标总数</div>
            <div class="n">{{ dashboard.totalIndicators || 0 }}</div>
          </div>
        </el-col>
        <el-col :span="6">
          <div class="stat-card stat-green">
            <div class="t">已完成任务</div>
            <div class="n">{{ dashboard.completedTasks || 0 }} / {{ dashboard.totalTasks || 0 }}</div>
          </div>
        </el-col>
        <el-col :span="6">
          <div class="stat-card stat-orange">
            <div class="t">逾期任务</div>
            <div class="n">{{ dashboard.overdueTasks || 0 }}</div>
          </div>
        </el-col>
        <el-col :span="6">
          <div class="stat-card stat-purple">
            <div class="t">平均得分</div>
            <div class="n">{{ formatScore(dashboard.averageScore) }}</div>
          </div>
        </el-col>
      </el-row>

      <!-- 完成进度 -->
      <el-card shadow="never" class="sub-card">
        <template #header>任务完成进度</template>
        <el-progress
          :percentage="completionPercent"
          :status="completionPercent >= 80 ? 'success' : completionPercent >= 50 ? '' : 'exception'"
          :stroke-width="22"
          text-inside
        />
      </el-card>

      <!-- 部门排名 -->
      <el-card shadow="never" class="sub-card">
        <template #header>部门排名</template>
        <el-table :data="deptRankings" border max-height="360">
          <el-table-column type="index" label="排名" width="80" />
          <el-table-column prop="deptName" label="部门" min-width="180">
            <template #default="{ row }">{{ row.deptName || ('部门 #' + (row.deptId || '-')) }}</template>
          </el-table-column>
          <el-table-column prop="score" label="得分" width="120">
            <template #default="{ row }">
              <span :style="{ color: scoreColor(row.score) }">{{ formatScore(row.score) }}</span>
            </template>
          </el-table-column>
          <el-table-column label="评级" width="100">
            <template #default="{ row }">
              <el-tag :type="scoreTagType(row.score)">{{ scoreLevel(row.score) }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column label="进度">
            <template #default="{ row }">
              <el-progress :percentage="Math.min(Math.round((row.score || 0)), 100)" :stroke-width="14" />
            </template>
          </el-table-column>
        </el-table>
      </el-card>

      <!-- 月度报告 -->
      <el-card shadow="never" class="sub-card" v-if="monthlyReport">
        <template #header>{{ year }}年{{ month }}月 月度报告</template>
        <pre class="report-block">{{ JSON.stringify(monthlyReport, null, 2) }}</pre>
      </el-card>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { kpiApi } from '@/api/modules/kpi'

const year = ref(new Date().getFullYear())
const month = ref(new Date().getMonth() + 1)

const dashboard = ref<any>({})
const deptRankings = ref<any[]>([])
const monthlyReport = ref<any>(null)

const completionPercent = computed(() => {
  const total = dashboard.value.totalTasks || 0
  const done = dashboard.value.completedTasks || 0
  return total > 0 ? Math.round((done / total) * 100) : 0
})

function formatScore(s?: number): string {
  if (s === undefined || s === null) return '--'
  return Number(s).toFixed(1)
}

function scoreColor(s?: number): string {
  if (s === undefined || s === null) return '#909399'
  if (s >= 90) return '#67C23A'
  if (s >= 75) return '#409EFF'
  if (s >= 60) return '#E6A23C'
  return '#F56C6C'
}

function scoreLevel(s?: number): string {
  if (s === undefined || s === null) return '-'
  if (s >= 90) return 'A'
  if (s >= 75) return 'B'
  if (s >= 60) return 'C'
  return 'D'
}

function scoreTagType(s?: number): any {
  const lv = scoreLevel(s)
  return ({ A: 'success', B: '', C: 'warning', D: 'danger' } as any)[lv] || 'info'
}

async function fetchDashboard() {
  try {
    const res: any = await kpiApi.getDashboard()
    const d = res.data || {}
    dashboard.value = d
    deptRankings.value = d.deptRankings || d.dept_rankings || []
  } catch (e) {
    console.error(e)
  }
}

async function fetchMonthly() {
  try {
    const res: any = await kpiApi.getMonthlyReport({ year: year.value, month: month.value })
    monthlyReport.value = res.data || null
  } catch (e) {
    monthlyReport.value = null
  }
}

function fetchAll() {
  fetchDashboard()
  fetchMonthly()
}

onMounted(fetchAll)
</script>

<style scoped>
.kpi-dashboard-container { padding: 16px; }
.card-header { display: flex; justify-content: space-between; align-items: center; }
.kpi-row { margin-bottom: 16px; }
.stat-card { padding: 18px; border-radius: 6px; color: #fff; }
.stat-card .t { font-size: 13px; opacity: .9; }
.stat-card .n { font-size: 28px; font-weight: 700; margin-top: 8px; }
.stat-blue { background: linear-gradient(135deg, #409EFF, #5cadff); }
.stat-green { background: linear-gradient(135deg, #67C23A, #85ce61); }
.stat-orange { background: linear-gradient(135deg, #E6A23C, #ebb563); }
.stat-purple { background: linear-gradient(135deg, #9b59b6, #b07acc); }
.sub-card { margin-top: 16px; }
.report-block { background: #f5f7fa; padding: 12px; border-radius: 4px; max-height: 360px; overflow: auto; font-size: 12px; }
</style>
