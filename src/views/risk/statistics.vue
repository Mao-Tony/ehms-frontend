<template>
  <div class="page-container">
    <el-card class="filter-card">
      <el-form :model="queryForm" inline>
        <el-form-item label="统计区间">
          <el-date-picker
            v-model="dateRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            value-format="YYYY-MM-DD"
            style="width: 280px"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="loadAll">查询</el-button>
          <el-button @click="handleReset">重置</el-button>
          <el-button type="success" @click="handleExport">导出报表</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-row :gutter="16" class="kpi-row">
      <el-col :span="6">
        <el-card shadow="never" class="kpi-card kpi-total">
          <div class="kpi-label">风险点总数</div>
          <div class="kpi-value">{{ stats.total }}</div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="never" class="kpi-card kpi-red">
          <div class="kpi-label">重大风险（红）</div>
          <div class="kpi-value">{{ stats.redCount }}</div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="never" class="kpi-card kpi-orange">
          <div class="kpi-label">较大风险（橙）</div>
          <div class="kpi-value">{{ stats.orangeCount }}</div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="never" class="kpi-card kpi-yellow">
          <div class="kpi-label">一般风险（黄）</div>
          <div class="kpi-value">{{ stats.yellowCount }}</div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="16">
      <el-col :span="12">
        <el-card shadow="never">
          <template #header>
            <span><el-icon><PieChart /></el-icon> 风险等级分布</span>
          </template>
          <div class="distribution">
            <el-progress
              :percentage="getPercent(stats.redCount)"
              :color="'#f56c6c'"
              :stroke-width="22"
              text-inside
            >
              <span>红色 {{ stats.redCount }}</span>
            </el-progress>
            <el-progress
              :percentage="getPercent(stats.orangeCount)"
              :color="'#e6a23c'"
              :stroke-width="22"
              text-inside
            >
              <span>橙色 {{ stats.orangeCount }}</span>
            </el-progress>
            <el-progress
              :percentage="getPercent(stats.yellowCount)"
              :color="'#f7ba2a'"
              :stroke-width="22"
              text-inside
            >
              <span>黄色 {{ stats.yellowCount }}</span>
            </el-progress>
            <el-progress
              :percentage="getPercent(stats.blueCount)"
              :color="'#409eff'"
              :stroke-width="22"
              text-inside
            >
              <span>蓝色 {{ stats.blueCount }}</span>
            </el-progress>
          </div>
        </el-card>
      </el-col>
      <el-col :span="12">
        <el-card shadow="never">
          <template #header>
            <span><el-icon><Grid /></el-icon> 风险矩阵 5×5（L × C）</span>
          </template>
          <table class="matrix-table">
            <thead>
              <tr>
                <th class="corner">L \ C</th>
                <th v-for="c in 5" :key="c">{{ c }}</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="l in 5" :key="l">
                <th>{{ l }}</th>
                <td
                  v-for="c in 5"
                  :key="c"
                  :class="cellLevel(l, c)"
                >
                  {{ matrix?.[l - 1]?.[c - 1] ?? 0 }}
                </td>
              </tr>
            </tbody>
          </table>
          <div class="matrix-legend">
            <span class="legend lv-red">重大</span>
            <span class="legend lv-orange">较大</span>
            <span class="legend lv-yellow">一般</span>
            <span class="legend lv-blue">低</span>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-card shadow="never">
      <template #header>
        <span><el-icon><TrendCharts /></el-icon> 风险趋势（按日）</span>
      </template>
      <el-table :data="stats.trendData || []" stripe height="320">
        <el-table-column prop="date" label="日期" width="160" />
        <el-table-column prop="count" label="新增风险点数" />
      </el-table>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { PieChart, Grid, TrendCharts } from '@element-plus/icons-vue'
import { riskApi, type RiskStatistics } from '@/api/modules/risk'

const dateRange = ref<string[]>([])
const queryForm = reactive({
  startDate: '',
  endDate: ''
})

const stats = reactive<RiskStatistics>({
  total: 0,
  redCount: 0,
  orangeCount: 0,
  yellowCount: 0,
  blueCount: 0,
  trendData: []
})

const matrix = ref<number[][]>([])

const loadStats = async () => {
  try {
    queryForm.startDate = dateRange.value?.[0] || ''
    queryForm.endDate = dateRange.value?.[1] || ''
    const res: any = await riskApi.getStatistics({
      startDate: queryForm.startDate || undefined,
      endDate: queryForm.endDate || undefined
    })
    const data = res.data || {}
    stats.total = data.total || 0
    stats.redCount = data.redCount || 0
    stats.orangeCount = data.orangeCount || 0
    stats.yellowCount = data.yellowCount || 0
    stats.blueCount = data.blueCount || 0
    stats.trendData = data.trendData || []
  } catch (e) {
    ElMessage.error('加载统计数据失败')
  }
}

const loadMatrix = async () => {
  try {
    const res: any = await riskApi.getRiskMatrix()
    matrix.value = res.data?.matrix_data || res.data?.matrixData || []
  } catch (e) {
    matrix.value = []
  }
}

const loadAll = () => {
  loadStats()
  loadMatrix()
}

const handleReset = () => {
  dateRange.value = []
  queryForm.startDate = ''
  queryForm.endDate = ''
  loadAll()
}

const handleExport = () => {
  const headers = ['日期', '新增风险点数']
  const rows = (stats.trendData || []).map(t => `${t.date},${t.count}`)
  const summary = [
    '指标,数值',
    `总数,${stats.total}`,
    `重大风险（红）,${stats.redCount}`,
    `较大风险（橙）,${stats.orangeCount}`,
    `一般风险（黄）,${stats.yellowCount}`,
    `低风险（蓝）,${stats.blueCount}`,
    '',
    headers.join(',')
  ]
  const csv = [...summary, ...rows].join('\n')
  const blob = new Blob([`\uFEFF${csv}`], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `双重预防报表_${new Date().toISOString().slice(0, 10)}.csv`
  a.click()
  URL.revokeObjectURL(url)
  ElMessage.success('已导出')
}

const getPercent = (v: number) => {
  if (!stats.total) return 0
  return Math.round((v / stats.total) * 100)
}

// 5x5 矩阵中颜色等级判断（按 L×C 乘积近似）
const cellLevel = (l: number, c: number) => {
  const score = l * c
  if (score >= 20) return 'lv-red'
  if (score >= 12) return 'lv-orange'
  if (score >= 6) return 'lv-yellow'
  return 'lv-blue'
}

onMounted(() => {
  loadAll()
})
</script>

<style scoped>
.page-container {
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.kpi-row {
  margin-bottom: 0;
}
.kpi-card {
  text-align: center;
  padding: 12px 0;
}
.kpi-card .kpi-label {
  color: #909399;
  font-size: 13px;
  margin-bottom: 8px;
}
.kpi-card .kpi-value {
  font-size: 28px;
  font-weight: 700;
}
.kpi-total .kpi-value { color: #303133; }
.kpi-red .kpi-value { color: #f56c6c; }
.kpi-orange .kpi-value { color: #e6a23c; }
.kpi-yellow .kpi-value { color: #f7ba2a; }

.distribution {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.matrix-table {
  width: 100%;
  border-collapse: collapse;
  text-align: center;
  font-size: 14px;
}
.matrix-table th,
.matrix-table td {
  border: 1px solid #ebeef5;
  padding: 12px 0;
  width: 16.66%;
}
.matrix-table th.corner {
  background: #f5f7fa;
  color: #909399;
}
.matrix-table th {
  background: #fafbfc;
  font-weight: 600;
  color: #606266;
}
.matrix-table td.lv-red    { background: #fde2e2; color: #c45656; font-weight: 600; }
.matrix-table td.lv-orange { background: #faecd8; color: #b88230; font-weight: 600; }
.matrix-table td.lv-yellow { background: #fdf6ec; color: #9a7a14; }
.matrix-table td.lv-blue   { background: #ecf5ff; color: #409eff; }

.matrix-legend {
  margin-top: 12px;
  display: flex;
  gap: 8px;
  justify-content: center;
}
.legend {
  padding: 4px 12px;
  border-radius: 4px;
  font-size: 12px;
}
.legend.lv-red    { background: #fde2e2; color: #c45656; }
.legend.lv-orange { background: #faecd8; color: #b88230; }
.legend.lv-yellow { background: #fdf6ec; color: #9a7a14; }
.legend.lv-blue   { background: #ecf5ff; color: #409eff; }
</style>
