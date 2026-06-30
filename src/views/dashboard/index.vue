<template>
  <div class="dashboard">
    <el-row :gutter="20" class="kpi-row">
      <el-col :span="6">
        <el-card shadow="hover" class="kpi-card">
          <div class="kpi-content">
            <div class="kpi-info">
              <div class="kpi-label">隐患总数</div>
              <div class="kpi-value">{{ statistics.hazardTotal || 0 }}</div>
              <div class="kpi-sub">
                <span class="trend up">较上月 +12%</span>
              </div>
            </div>
            <div class="kpi-icon hazard-icon">
              <el-icon><WarnTriangleFilled /></el-icon>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover" class="kpi-card">
          <div class="kpi-content">
            <div class="kpi-info">
              <div class="kpi-label">有效作业票</div>
              <div class="kpi-value">{{ statistics.permitTotal || 0 }}</div>
              <div class="kpi-sub">
                <span class="trend">待审批 {{ statistics.permitPending || 0 }}</span>
              </div>
            </div>
            <div class="kpi-icon permit-icon">
              <el-icon><Ticket /></el-icon>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover" class="kpi-card">
          <div class="kpi-content">
            <div class="kpi-info">
              <div class="kpi-label">培训完成率</div>
              <div class="kpi-value">{{ statistics.trainingRate || 0 }}%</div>
              <div class="kpi-sub">
                <span class="trend up">较上月 +5%</span>
              </div>
            </div>
            <div class="kpi-icon training-icon">
              <el-icon><Reading /></el-icon>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover" class="kpi-card">
          <div class="kpi-content">
            <div class="kpi-info">
              <div class="kpi-label">风险告警</div>
              <div class="kpi-value risk-red">{{ statistics.riskAlert || 0 }}</div>
              <div class="kpi-sub">
                <span class="risk-badge">重大 {{ statistics.riskRed || 0 }}</span>
              </div>
            </div>
            <div class="kpi-icon alert-icon">
              <el-icon><Bell /></el-icon>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover" class="kpi-card">
          <div class="kpi-content">
            <div class="kpi-info">
              <div class="kpi-label">事故数</div>
              <div class="kpi-value">{{ statistics.accidentTotal || 0 }}</div>
              <div class="kpi-sub">
                <span class="trend down">较同期 -8%</span>
              </div>
            </div>
            <div class="kpi-icon accident-icon">
              <el-icon><Warning /></el-icon>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover" class="kpi-card">
          <div class="kpi-content">
            <div class="kpi-info">
              <div class="kpi-label">合规率</div>
              <div class="kpi-value success">{{ statistics.complianceRate || 0 }}%</div>
              <div class="kpi-sub">
                <span class="trend">目标 95%</span>
              </div>
            </div>
            <div class="kpi-icon compliance-icon">
              <el-icon><CircleCheck /></el-icon>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20" class="chart-row">
      <el-col :span="12">
        <el-card class="chart-card">
          <template #header>
            <div class="card-header">
              <span>风险等级分布</span>
            </div>
          </template>
          <div ref="riskPieRef" class="chart-container"></div>
        </el-card>
      </el-col>
      <el-col :span="12">
        <el-card class="chart-card">
          <template #header>
            <div class="card-header">
              <span>近30天隐患趋势</span>
            </div>
          </template>
          <div ref="hazardTrendRef" class="chart-container"></div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20" class="list-row">
      <el-col :span="12">
        <el-card class="list-card">
          <template #header>
            <div class="card-header">
              <span>待办任务</span>
              <el-button type="primary" link @click="$router.push('/todo')">查看更多</el-button>
            </div>
          </template>
          <el-table :data="todoList" stripe>
            <el-table-column prop="title" label="任务名称" show-overflow-tooltip />
            <el-table-column prop="type" label="类型" width="100">
              <template #default="{ row }">
                <el-tag :type="getTodoTypeColor(row.type)" size="small">{{ row.typeName }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="deadline" label="截止日期" width="120" />
            <el-table-column label="操作" width="80">
              <template #default="{ row }">
                <el-button type="primary" link size="small" @click="handleTodo(row)">处理</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-col>
      <el-col :span="12">
        <el-card class="list-card">
          <template #header>
            <div class="card-header">
              <span>实时告警</span>
              <el-button type="primary" link @click="$router.push('/alarm')">查看更多</el-button>
            </div>
          </template>
          <div class="alarm-list">
            <div v-for="alarm in alarmList" :key="alarm.id" class="alarm-item" :class="alarm.level">
              <div class="alarm-info">
                <span class="alarm-title">{{ alarm.title }}</span>
                <span class="alarm-time">{{ alarm.time }}</span>
              </div>
              <el-tag :type="getAlarmTypeColor(alarm.level)" size="small">{{ alarm.levelName }}</el-tag>
            </div>
            <el-empty v-if="alarmList.length === 0" description="暂无告警" />
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue'
import { ElMessage } from 'element-plus'
import { WarnTriangleFilled, Ticket, Reading, Bell, Warning, CircleCheck } from '@element-plus/icons-vue'
import { useUserStore } from '@/stores/user'
import * as echarts from 'echarts'

const userStore = useUserStore()

const riskPieRef = ref()
const hazardTrendRef = ref()

const statistics = reactive({
  hazardTotal: 156,
  permitTotal: 42,
  permitPending: 5,
  trainingRate: 87,
  riskAlert: 23,
  riskRed: 3,
  accidentTotal: 2,
  complianceRate: 94
})

const riskData = ref([
  { name: '重大风险', value: 12, itemStyle: { color: '#E63946' } },
  { name: '较大风险', value: 28, itemStyle: { color: '#F77F00' } },
  { name: '一般风险', value: 65, itemStyle: { color: '#FCBF49' } },
  { name: '低风险', value: 89, itemStyle: { color: '#2A9D8F' } }
])

const trendData = ref([
  { date: '2024-01-01', count: 5 },
  { date: '2024-01-02', count: 8 },
  { date: '2024-01-03', count: 3 },
  { date: '2024-01-04', count: 12 },
  { date: '2024-01-05', count: 7 },
  { date: '2024-01-06', count: 4 },
  { date: '2024-01-07', count: 9 }
])

const todoList = ref([
  { id: 1, title: '审批动火作业票 #202401001', type: 'PERMIT', typeName: '作业票', deadline: '2024-01-08' },
  { id: 2, title: '处理隐患 #HZ202401023', type: 'HAZARD', typeName: '隐患', deadline: '2024-01-09' },
  { id: 3, title: '完成安全培训记录', type: 'TRAINING', typeName: '培训', deadline: '2024-01-10' },
  { id: 4, title: '设备维护保养', type: 'EQUIPMENT', typeName: '设备', deadline: '2024-01-12' }
])

const alarmList = ref([
  { id: 1, title: '1号罐区可燃气体浓度超限', level: 'RED', levelName: '重大', time: '10:23:45' },
  { id: 2, title: '2号生产线温度异常', level: 'ORANGE', levelName: '较大', time: '09:15:32' },
  { id: 3, title: '3号储罐压力波动', level: 'YELLOW', levelName: '一般', time: '08:45:18' },
  { id: 4, title: '视频监控离线告警', level: 'BLUE', levelName: '提示', time: '08:12:05' }
])

function getTodoTypeColor(type: string) {
  const map: Record<string, string> = {
    PERMIT: 'warning',
    HAZARD: 'danger',
    TRAINING: 'success',
    EQUIPMENT: 'primary'
  }
  return map[type] || 'info'
}

function getAlarmTypeColor(level: string) {
  const map: Record<string, string> = {
    RED: 'danger',
    ORANGE: 'warning',
    YELLOW: '',
    BLUE: 'info'
  }
  return map[level] || 'info'
}

function handleTodo(row: any) {
  ElMessage.info(`处理任务: ${row.title}`)
}

function initRiskPieChart() {
  if (!riskPieRef.value) return
  const chart = echarts.init(riskPieRef.value)
  chart.setOption({
    tooltip: { trigger: 'item', formatter: '{b}: {c} ({d}%)' },
    legend: { bottom: 10, left: 'center' },
    series: [{
      type: 'pie',
      radius: ['40%', '70%'],
      avoidLabelOverlap: false,
      itemStyle: { borderRadius: 8, borderColor: '#fff', borderWidth: 2 },
      label: { show: false },
      emphasis: { label: { show: true, fontSize: 14, fontWeight: 'bold' } },
      data: riskData.value
    }]
  })
}

function initHazardTrendChart() {
  if (!hazardTrendRef.value) return
  const chart = echarts.init(hazardTrendRef.value)
  chart.setOption({
    tooltip: { trigger: 'axis' },
    grid: { left: 50, right: 20, top: 20, bottom: 30 },
    xAxis: {
      type: 'category',
      data: trendData.value.map(d => d.date),
      axisLabel: { rotate: 45 }
    },
    yAxis: { type: 'value', name: '隐患数' },
    series: [{
      type: 'line',
      smooth: true,
      data: trendData.value.map(d => d.count),
      areaStyle: { color: 'rgba(24, 144, 255, 0.2)' },
      lineStyle: { color: '#1890FF', width: 2 },
      itemStyle: { color: '#1890FF' }
    }]
  })
}

onMounted(() => {
  initRiskPieChart()
  initHazardTrendChart()
  window.addEventListener('resize', () => {
    echarts.getInstanceByDom(riskPieRef.value)?.resize()
    echarts.getInstanceByDom(hazardTrendRef.value)?.resize()
  })
})
</script>

<style lang="scss" scoped>
.dashboard {
  .kpi-row {
    margin-bottom: 20px;
  }

  .kpi-card {
    .kpi-content {
      display: flex;
      justify-content: space-between;
      align-items: center;

      .kpi-info {
        .kpi-label {
          font-size: 14px;
          color: #6B7280;
          margin-bottom: 8px;
        }

        .kpi-value {
          font-size: 28px;
          font-weight: bold;
          font-family: 'DIN Pro', 'DIN', Arial, monospace;
          color: #1F2937;

          &.risk-red { color: #E63946; }
          &.success { color: #52C41A; }
        }

        .kpi-sub {
          font-size: 12px;
          color: #6B7280;
          margin-top: 4px;

          .trend {
            &.up { color: #E63946; }
            &.down { color: #52C41A; }
          }

          .risk-badge {
            background: rgba(230, 57, 70, 0.1);
            color: #E63946;
            padding: 2px 8px;
            border-radius: 4px;
          }
        }
      }

      .kpi-icon {
        width: 56px;
        height: 56px;
        border-radius: 12px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 28px;
        color: white;

        &.hazard-icon { background: linear-gradient(135deg, #E63946, #ff6b6b); }
        &.permit-icon { background: linear-gradient(135deg, #1890FF, #69c0ff); }
        &.training-icon { background: linear-gradient(135deg, #52C41A, #73d13d); }
        &.alert-icon { background: linear-gradient(135deg, #F77F00, #ffa940); }
        &.accident-icon { background: linear-gradient(135deg, #FF4D4F, #ff7875); }
        &.compliance-icon { background: linear-gradient(135deg, #2A9D8F, #40a9af); }
      }
    }
  }

  .chart-row, .list-row {
    margin-bottom: 20px;
  }

  .chart-card {
    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-weight: 600;
    }

    .chart-container {
      height: 280px;
    }
  }

  .list-card {
    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-weight: 600;
    }

    .alarm-list {
      max-height: 300px;
      overflow-y: auto;

      .alarm-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 12px;
        border-radius: 8px;
        margin-bottom: 8px;
        background: #F5F7FA;

        &.RED { background: rgba(230, 57, 70, 0.1); border-left: 3px solid #E63946; }
        &.ORANGE { background: rgba(247, 127, 0, 0.1); border-left: 3px solid #F77F00; }
        &.YELLOW { background: rgba(252, 191, 73, 0.2); border-left: 3px solid #FCBF49; }
        &.BLUE { background: rgba(42, 157, 143, 0.1); border-left: 3px solid #2A9D8F; }

        .alarm-info {
          display: flex;
          flex-direction: column;
          gap: 4px;

          .alarm-title {
            font-weight: 500;
            color: #1F2937;
          }

          .alarm-time {
            font-size: 12px;
            color: #6B7280;
          }
        }
      }
    }
  }
}
</style>
