<template>
  <div class="permit-statistics">
    <div class="page-header">
      <h2>作业票统计</h2>
      <el-button :icon="Refresh" @click="loadStats">刷新</el-button>
    </div>

    <el-row :gutter="16" class="kpi-row">
      <el-col :span="4">
        <el-card shadow="hover" class="kpi-card">
          <div class="kpi-label">总数</div>
          <div class="kpi-value" style="color:#409eff;">{{ stats.totalCount || 0 }}</div>
        </el-card>
      </el-col>
      <el-col :span="4">
        <el-card shadow="hover" class="kpi-card">
          <div class="kpi-label">草稿</div>
          <div class="kpi-value" style="color:#909399;">{{ stats.draftCount || 0 }}</div>
        </el-card>
      </el-col>
      <el-col :span="4">
        <el-card shadow="hover" class="kpi-card">
          <div class="kpi-label">待审批</div>
          <div class="kpi-value" style="color:#e6a23c;">{{ stats.pendingCount || 0 }}</div>
        </el-card>
      </el-col>
      <el-col :span="4">
        <el-card shadow="hover" class="kpi-card">
          <div class="kpi-label">已批准</div>
          <div class="kpi-value" style="color:#67c23a;">{{ stats.approvedCount || 0 }}</div>
        </el-card>
      </el-col>
      <el-col :span="4">
        <el-card shadow="hover" class="kpi-card">
          <div class="kpi-label">已拒绝</div>
          <div class="kpi-value" style="color:#f56c6c;">{{ stats.rejectedCount || 0 }}</div>
        </el-card>
      </el-col>
      <el-col :span="4">
        <el-card shadow="hover" class="kpi-card">
          <div class="kpi-label">已过期</div>
          <div class="kpi-value" style="color:#c45656;">{{ stats.expiredCount || 0 }}</div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="16">
      <el-col :span="12">
        <el-card>
          <template #header>按作业类型</template>
          <el-table :data="stats.typeStats || []" v-loading="loading" stripe>
            <el-table-column label="类型" prop="type">
              <template #default="{ row }">{{ typeLabel(row.type) }}</template>
            </el-table-column>
            <el-table-column label="数量" prop="count" width="120" />
            <el-table-column label="占比" width="120">
              <template #default="{ row }">{{ percent(row.count, stats.totalCount) }}</template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-col>
      <el-col :span="12">
        <el-card>
          <template #header>按风险等级</template>
          <el-table :data="stats.levelStats || []" v-loading="loading" stripe>
            <el-table-column label="等级" prop="level">
              <template #default="{ row }">
                <el-tag :type="levelTagType(row.level)">{{ row.level }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column label="数量" prop="count" width="120" />
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
import { permitApi } from "@/api/modules/permit"

interface PermitStats {
  totalCount: number; draftCount: number; pendingCount: number
  approvedCount: number; rejectedCount: number; expiredCount: number
  typeStats: { type: string; count: number }[]
  levelStats: { level: string; count: number }[]
}

const loading = ref(false)
const stats = reactive<Partial<PermitStats>>({
  totalCount: 0, draftCount: 0, pendingCount: 0,
  approvedCount: 0, rejectedCount: 0, expiredCount: 0,
  typeStats: [], levelStats: [],
})

const typeLabel = (t: string) => {
  const map: Record<string, string> = {
    hot_work: "动火作业", confined_space: "受限空间",
    height_work: "高处作业", temporary_electricity: "临时用电",
    excavation: "挖掘作业", lifting: "吊装作业",
  }
  return map[t] || t
}
const levelTagType = (lvl: string): any => {
  const map: Record<string, string> = { high: "danger", medium: "warning", low: "info" }
  return map[lvl] || ""
}
const percent = (n: number, total?: number) => total ? ((n / total) * 100).toFixed(1) + "%" : "-"

const loadStats = async () => {
  loading.value = true
  try {
    const res: any = await permitApi.getStatistics()
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
.permit-statistics { padding: 16px; }
.page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
.page-header h2 { margin: 0; font-size: 20px; }
.kpi-row { margin-bottom: 16px; }
.kpi-card { text-align: center; padding: 8px; }
.kpi-label { color: #909399; font-size: 13px; }
.kpi-value { font-size: 26px; font-weight: 700; margin-top: 4px; }
</style>
