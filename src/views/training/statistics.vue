<template>
  <div class="training-statistics">
    <div class="page-header">
      <h2>培训统计</h2>
      <el-button :icon="Refresh" @click="loadStats">刷新</el-button>
    </div>

    <el-row :gutter="16" class="kpi-row">
      <el-col :span="6">
        <el-card shadow="hover" class="kpi-card">
          <div class="kpi-label">课程总数</div>
          <div class="kpi-value" style="color:#409eff;">{{ stats.totalCourses || 0 }}</div>
          <div class="kpi-sub">活跃 {{ stats.activeCourses || 0 }}</div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover" class="kpi-card">
          <div class="kpi-label">报名总数</div>
          <div class="kpi-value" style="color:#67c23a;">{{ stats.totalEnrollments || 0 }}</div>
          <div class="kpi-sub">完成 {{ stats.completedEnrollments || 0 }}</div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover" class="kpi-card">
          <div class="kpi-label">考试总数</div>
          <div class="kpi-value" style="color:#e6a23c;">{{ stats.totalExams || 0 }}</div>
          <div class="kpi-sub">通过 {{ stats.passedExams || 0 }}</div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover" class="kpi-card">
          <div class="kpi-label">证书总数</div>
          <div class="kpi-value" style="color:#f56c6c;">{{ stats.totalCertificates || 0 }}</div>
          <div class="kpi-sub">
            有效 {{ stats.validCertificates || 0 }} / 超期 {{ stats.overdueCertificates || 0 }}
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="16">
      <el-col :span="12">
        <el-card>
          <template #header>课程类型分布</template>
          <el-table :data="stats.courseTypeStats || []" v-loading="loading" stripe>
            <el-table-column label="类型" prop="type" />
            <el-table-column label="数量" prop="count" width="120" />
          </el-table>
        </el-card>
      </el-col>
      <el-col :span="12">
        <el-card>
          <template #header>月度趋势</template>
          <el-table :data="stats.monthlyStats || []" v-loading="loading" stripe>
            <el-table-column label="月份" prop="month" />
            <el-table-column label="新增课程" prop="newCourses" width="100" />
            <el-table-column label="新增报名" prop="newEnrollments" width="100" />
            <el-table-column label="完成" prop="completed" width="100" />
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
import { trainingApi } from "@/api/modules/training"

interface TrainingStats {
  totalCourses: number; activeCourses: number
  totalEnrollments: number; completedEnrollments: number
  totalExams: number; passedExams: number
  totalCertificates: number; validCertificates: number; overdueCertificates: number
  courseTypeStats: { type: string; count: number }[]
  monthlyStats: { month: string; newCourses: number; newEnrollments: number; completed: number }[]
}

const loading = ref(false)
const stats = reactive<Partial<TrainingStats>>({})

const loadStats = async () => {
  loading.value = true
  try {
    const res: any = await trainingApi.getStatistics()
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
.training-statistics { padding: 16px; }
.page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
.page-header h2 { margin: 0; font-size: 20px; }
.kpi-row { margin-bottom: 16px; }
.kpi-card { text-align: center; padding: 8px; }
.kpi-label { color: #909399; font-size: 13px; }
.kpi-value { font-size: 26px; font-weight: 700; margin-top: 4px; }
.kpi-sub { color: #909399; font-size: 12px; margin-top: 4px; }
</style>
