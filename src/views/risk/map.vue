<template>
  <div class="risk-map-container">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>风险四色分布图</span>
          <el-button-group>
            <el-button :type="viewMode === 'spatial' ? 'primary' : ''" @click="viewMode = 'spatial'">空间分布</el-button>
            <el-button :type="viewMode === 'chart' ? 'primary' : ''" @click="viewMode = 'chart'">统计视图</el-button>
          </el-button-group>
        </div>
      </template>

      <!-- 顶部 KPI 卡片 -->
      <el-row :gutter="16" class="kpi-row">
        <el-col :span="6" v-for="lv in levels" :key="lv.key">
          <div class="kpi-card" :style="{ background: lv.color, color: '#fff' }">
            <div class="kpi-title">{{ lv.label }}风险</div>
            <div class="kpi-num">{{ statsByLevel[lv.key] || 0 }}</div>
            <div class="kpi-foot">点</div>
          </div>
        </el-col>
      </el-row>

      <!-- 部门筛选 -->
      <el-form :inline="true" class="filter-form">
        <el-form-item label="部门ID">
          <el-input-number v-model="filterDeptId" :min="0" placeholder="0=全部" style="width: 160px" @change="fetchData" />
        </el-form-item>
        <el-form-item label="风险等级">
          <el-select v-model="filterLevel" placeholder="全部" clearable style="width: 140px" @change="fetchData">
            <el-option v-for="lv in levels" :key="lv.key" :label="lv.label" :value="lv.key" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button @click="fetchData">刷新</el-button>
        </el-form-item>
      </el-form>

      <!-- 空间分布视图：按 latitude/longitude 模拟，没有真实地图时改用部门分组色块 -->
      <div v-if="viewMode === 'spatial'" class="spatial-view">
        <div class="map-canvas" v-loading="loading">
          <div v-if="riskPoints.length === 0" class="empty-tip">暂无风险点数据</div>
          <div
            v-for="p in riskPoints"
            :key="p.riskPointId"
            class="risk-dot"
            :style="dotStyle(p)"
            :title="`${p.riskPointCode} ${p.riskPointName}`"
            @click="showDetail(p)"
          ></div>
        </div>
        <div class="legend">
          <span v-for="lv in levels" :key="lv.key" class="legend-item">
            <i class="dot" :style="{ background: lv.color }"></i>{{ lv.label }}
          </span>
        </div>
      </div>

      <!-- 统计视图：表格按等级分组 -->
      <div v-else class="chart-view">
        <el-table v-loading="loading" :data="groupedRows" border>
          <el-table-column prop="levelLabel" label="风险等级" width="120">
            <template #default="{ row }">
              <el-tag :color="row.color" effect="dark" style="color:#fff;border:none">{{ row.levelLabel }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="count" label="风险点数量" width="120" />
          <el-table-column label="占比" width="180">
            <template #default="{ row }">
              <el-progress :percentage="row.percent" :color="row.color" />
            </template>
          </el-table-column>
          <el-table-column label="代表风险点" min-width="320">
            <template #default="{ row }">
              <el-tag
                v-for="p in row.samples"
                :key="p.riskPointId"
                style="margin: 2px"
                @click="showDetail(p)"
              >{{ p.riskPointCode }} {{ p.riskPointName }}</el-tag>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </el-card>

    <el-dialog v-model="detailVisible" title="风险点详情" width="560px">
      <el-descriptions v-if="currentRisk" :column="2" border>
        <el-descriptions-item label="编号">{{ currentRisk.riskPointCode }}</el-descriptions-item>
        <el-descriptions-item label="名称">{{ currentRisk.riskPointName }}</el-descriptions-item>
        <el-descriptions-item label="等级">
          <el-tag :color="levelColor(currentRisk.riskLevel)" effect="dark" style="color:#fff;border:none">{{ levelLabel(currentRisk.riskLevel) }}</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="类型">{{ currentRisk.riskType || '-' }}</el-descriptions-item>
        <el-descriptions-item label="位置" :span="2">{{ currentRisk.riskLocation || '-' }}</el-descriptions-item>
        <el-descriptions-item label="部门ID">{{ currentRisk.deptId || '-' }}</el-descriptions-item>
        <el-descriptions-item label="评估日期">{{ currentRisk.assessDate || '-' }}</el-descriptions-item>
        <el-descriptions-item label="下次评估">{{ currentRisk.nextAssessDate || '-' }}</el-descriptions-item>
      </el-descriptions>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { riskApi } from '@/api/modules/risk'

const loading = ref(false)
const viewMode = ref<'spatial' | 'chart'>('spatial')
const riskPoints = ref<any[]>([])
const filterDeptId = ref<number | undefined>()
const filterLevel = ref<string>('')
const detailVisible = ref(false)
const currentRisk = ref<any>(null)

const levels = [
  { key: 'red', label: '红色（重大）', color: '#F56C6C' },
  { key: 'orange', label: '橙色（较大）', color: '#E6A23C' },
  { key: 'yellow', label: '黄色（一般）', color: '#F0CE45' },
  { key: 'blue', label: '蓝色（低）', color: '#409EFF' }
]

function levelColor(k?: string): string {
  return levels.find(l => l.key === k)?.color || '#909399'
}

function levelLabel(k?: string): string {
  return levels.find(l => l.key === k)?.label || k || '-'
}

const statsByLevel = computed(() => {
  const m: Record<string, number> = { red: 0, orange: 0, yellow: 0, blue: 0 }
  riskPoints.value.forEach(p => {
    const k = p.riskLevel || p.level
    if (m[k] !== undefined) m[k]++
  })
  return m
})

const groupedRows = computed(() => {
  const total = riskPoints.value.length || 1
  return levels.map(lv => {
    const list = riskPoints.value.filter(p => (p.riskLevel || p.level) === lv.key)
    return {
      levelLabel: lv.label,
      color: lv.color,
      count: list.length,
      percent: Math.round((list.length / total) * 100),
      samples: list.slice(0, 8)
    }
  })
})

function dotStyle(p: any) {
  // 用 latitude/longitude 模拟坐标；没坐标则按 hash 散布
  const id = p.riskPointId || 0
  const lat = Number(p.latitude || 0)
  const lng = Number(p.longitude || 0)
  let xPct = 50, yPct = 50
  if (lat && lng) {
    // 归一化（这里只是演示，真实使用应基于地图边界做坐标投影）
    xPct = ((Number(lng) % 100) + 100) % 100
    yPct = ((Number(lat) % 100) + 100) % 100
  } else {
    xPct = ((id * 37) % 90) + 5
    yPct = ((id * 23) % 90) + 5
  }
  return {
    left: `${xPct}%`,
    top: `${yPct}%`,
    background: levelColor(p.riskLevel)
  }
}

function showDetail(p: any) {
  currentRisk.value = p
  detailVisible.value = true
}

async function fetchData() {
  loading.value = true
  try {
    // 拉所有风险点（最多 200 个），用于地图与统计
    const res: any = await riskApi.list({
      level: filterLevel.value || undefined,
      departmentId: filterDeptId.value || undefined,
      pageNum: 1,
      pageSize: 200
    } as any)
    riskPoints.value = res.data?.items || res.data?.list || []
  } catch (e) {
    console.error(e)
  } finally {
    loading.value = false
  }
}

onMounted(fetchData)
</script>

<style scoped>
.risk-map-container { padding: 16px; }
.card-header { display: flex; justify-content: space-between; align-items: center; }
.kpi-row { margin-bottom: 16px; }
.kpi-card { padding: 14px 18px; border-radius: 6px; text-align: center; }
.kpi-title { font-size: 13px; opacity: .9; }
.kpi-num { font-size: 32px; font-weight: 700; margin: 6px 0; }
.kpi-foot { font-size: 12px; opacity: .8; }
.filter-form { margin-bottom: 12px; }
.spatial-view { display: flex; flex-direction: column; gap: 12px; }
.map-canvas {
  position: relative;
  width: 100%;
  height: 480px;
  background: linear-gradient(135deg, #f0f5fa 0%, #d9e4f0 100%);
  border: 1px solid #dcdfe6;
  border-radius: 6px;
  overflow: hidden;
}
.risk-dot {
  position: absolute;
  width: 16px; height: 16px;
  border-radius: 50%;
  transform: translate(-50%, -50%);
  cursor: pointer;
  box-shadow: 0 0 0 2px rgba(255,255,255,.6), 0 2px 6px rgba(0,0,0,.2);
  transition: transform .2s;
}
.risk-dot:hover { transform: translate(-50%, -50%) scale(1.4); }
.empty-tip { position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; color: #909399; font-size: 14px; }
.legend { display: flex; gap: 20px; font-size: 13px; }
.legend-item { display: inline-flex; align-items: center; gap: 6px; }
.legend .dot { display: inline-block; width: 12px; height: 12px; border-radius: 50%; }
.chart-view { margin-top: 8px; }
</style>
