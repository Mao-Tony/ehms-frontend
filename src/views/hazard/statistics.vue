<template>
  <div class="hazard-statistics">
    <div class="page-header">
      <h2>隐患统计</h2>
      <div class="header-actions">
        <el-date-picker
          v-model="dateRange"
          type="daterange"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          value-format="YYYY-MM-DD"
          @change="loadStats"
        />
        <el-button :icon="Refresh" @click="loadStats">刷新</el-button>
      </div>
    </div>

    <el-row :gutter="16" class="kpi-row">
      <el-col :span="4">
        <el-card shadow="hover" class="kpi-card">
          <div class="kpi-label">总隐患</div>
          <div class="kpi-value" style="color:#409eff;">{{ stats.totalCount || 0 }}</div>
        </el-card>
      </el-col>
      <el-col :span="4">
        <el-card shadow="hover" class="kpi-card">
          <div class="kpi-label">待处理</div>
          <div class="kpi-value" style="color:#e6a23c;">{{ stats.pendingCount || 0 }}</div>
        </el-card>
      </el-col>
      <el-col :span="4">
        <el-card shadow="hover" class="kpi-card">
          <div class="kpi-label">整改中</div>
          <div class="kpi-value" style="color:#f56c6c;">{{ stats.rectifyingCount || 0 }}</div>
        </el-card>
      </el-col>
      <el-col :span="4">
        <el-card shadow="hover" class="kpi-card">
          <div class="kpi-label">复核中</div>
          <div class="kpi-value" style="color:#909399;">{{ stats.verifyingCount || 0 }}</div>
        </el-card>
      </el-col>
      <el-col :span="4">
        <el-card shadow="hover" class="kpi-card">
          <div class="kpi-label">已关闭</div>
          <div class="kpi-value" style="color:#67c23a;">{{ stats.closedCount || 0 }}</div>
        </el-card>
      </el-col>
      <el-col :span="4">
        <el-card shadow="hover" class="kpi-card">
          <div class="kpi-label">已逾期</div>
          <div class="kpi-value" style="color:#c45656;">{{ stats.overdueCount || 0 }}</div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="16">
      <el-col :span="8">
        <el-card>
          <template #header>按级别统计</template>
          <el-table :data="stats.levelStats || []" v-loading="loading" stripe>
            <el-table-column label="级别" prop="level">
              <template #default="{ row }">
                <el-tag :type="levelTagType(row.level)">{{ levelLabel(row.level) }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column label="数量" prop="count" width="100" />
            <el-table-column label="占比" width="120">
              <template #default="{ row }">{{ percent(row.count, stats.totalCount) }}</template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-col>
      <el-col :span="8">
        <el-card>
          <template #header>按类型统计</template>
          <el-table :data="stats.typeStats || []" v-loading="loading" stripe>
            <el-table-column label="类型" prop="type" />
            <el-table-column label="数量" prop="count" width="100" />
            <el-table-column label="占比" width="120">
              <template #default="{ row }">{{ percent(row.count, stats.totalCount) }}</template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-col>
      <el-col :span="8">
        <el-card>
          <template #header>按部门统计</template>
          <el-table :data="stats.deptStats || []" v-loading="loading" stripe>
            <el-table-column label="部门" prop="deptName">
              <template #default="{ row }">{{ row.deptName || `部门${row.deptId}` }}</template>
            </el-table-column>
            <el-table-column label="数量" prop="count" width="100" />
            <el-table-column label="占比" width="120">
              <template #default="{ row }">{{ percent(row.count, stats.totalCount) }}</template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from "vue"
import { Refresh } from "@element-plus/icons-vue"
import { ElMessage } from "element-plus"
import { hazardApi, type HazardStatistics } from "@/api/modules/hazard"

const dateRange = ref<[string, string] | null>(null)
const loading = ref(false)
const stats = reactive<Partial<HazardStatistics>>({
  totalCount: 0, pendingCount: 0, rectifyingCount: 0,
  verifyingCount: 0, closedCount: 0, overdueCount: 0,
  levelStats: [], typeStats: [], deptStats: [],
})

const levelLabel = (lvl: string) => {
  const map: Record<string, string> = {
    major: "重大", general: "一般", minor: "轻微",
    A: "A级", B: "B级", C: "C级",
  }
  return map[lvl] || lvl
}

const levelTagType = (lvl: string): any => {
  const map: Record<string, string> = {
    major: "danger", A: "danger",
    general: "warning", B: "warning",
    minor: "info", C: "info",
  }
  return map[lvl] || ""
}

const percent = (n: number, total?: number) => {
  if (!total) return "-"
  return ((n / total) * 100).toFixed(1) + "%"
}

const loadStats = async () => {
  loading.value = true
  try {
    const params: any = {}
    if (dateRange.value && dateRange.value.length === 2) {
      params.startDate = dateRange.value[0]
      params.endDate = dateRange.value[1]
    }
    const res: any = await hazardApi.getStatistics(params)
    Object.assign(stats, res.data || {})
  } catch (e: any) {
    ElMessage.error("加载统计失败: " + (e?.message || e))
  } finally {
    loading.value = false
  }
}

onMounted(() => loadStats())
</script>

<style scoped>
.hazard-statistics { padding: 16px; }
.page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
.page-header h2 { margin: 0; font-size: 20px; }
.header-actions { display: flex; gap: 12px; }
.kpi-row { margin-bottom: 16px; }
.kpi-card { text-align: center; padding: 8px; }
.kpi-label { color: #909399; font-size: 13px; }
.kpi-value { font-size: 26px; font-weight: 700; margin-top: 4px; }
</style>
