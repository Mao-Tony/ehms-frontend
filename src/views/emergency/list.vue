<template>
  <div class="emergency-overview">
    <div class="page-header">
      <h2>应急管理总览</h2>
      <el-button :icon="Refresh" @click="loadOverview">刷新</el-button>
    </div>

    <el-row :gutter="16" class="kpi-row">
      <el-col :span="6">
        <el-card shadow="hover" class="kpi-card kpi-plan" @click="goTo(\'/emergency/plans\')">
          <div class="kpi-icon"><el-icon size="36"><Document /></el-icon></div>
          <div class="kpi-content">
            <div class="kpi-label">应急预案</div>
            <div class="kpi-value">{{ stats.plans }}</div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover" class="kpi-card kpi-incident" @click="goTo(\'/emergency/incidents\')">
          <div class="kpi-icon"><el-icon size="36"><Warning /></el-icon></div>
          <div class="kpi-content">
            <div class="kpi-label">应急事件</div>
            <div class="kpi-value">{{ stats.incidents }}</div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover" class="kpi-card kpi-resource" @click="goTo(\'/emergency/resources\')">
          <div class="kpi-icon"><el-icon size="36"><Box /></el-icon></div>
          <div class="kpi-content">
            <div class="kpi-label">应急资源</div>
            <div class="kpi-value">{{ stats.resources }}</div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover" class="kpi-card kpi-drill" @click="goTo(\'/emergency/drills\')">
          <div class="kpi-icon"><el-icon size="36"><DataLine /></el-icon></div>
          <div class="kpi-content">
            <div class="kpi-label">应急演练</div>
            <div class="kpi-value">{{ stats.drills }}</div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="16">
      <el-col :span="12">
        <el-card>
          <template #header>
            <div class="card-header">
              <span>最近事件</span>
              <el-button text size="small" @click="goTo(\'/emergency/incidents\')">查看全部</el-button>
            </div>
          </template>
          <el-table :data="recentIncidents" v-loading="loading" size="small">
            <el-table-column label="事件编号" prop="incidentCode" width="140" />
            <el-table-column label="事件标题" prop="incidentTitle" min-width="160" show-overflow-tooltip />
            <el-table-column label="级别" prop="incidentLevel" width="80">
              <template #default="{ row }">
                <el-tag :type="levelTagType(row.incidentLevel)">{{ row.incidentLevel || "-" }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column label="发生时间" prop="occurTime" width="160">
              <template #default="{ row }">{{ formatDateTime(row.occurTime) }}</template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-col>
      <el-col :span="12">
        <el-card>
          <template #header>
            <div class="card-header">
              <span>最新预案</span>
              <el-button text size="small" @click="goTo(\'/emergency/plans\')">查看全部</el-button>
            </div>
          </template>
          <el-table :data="recentPlans" v-loading="loading" size="small">
            <el-table-column label="预案编号" prop="planCode" width="140" />
            <el-table-column label="预案名称" prop="planName" min-width="180" show-overflow-tooltip />
            <el-table-column label="状态" prop="planStatus" width="100">
              <template #default="{ row }">
                <el-tag :type="planStatusTag(row.planStatus)">{{ row.planStatus || "-" }}</el-tag>
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-col>
    </el-row>

    <el-card class="quick-nav">
      <template #header><span>快速入口</span></template>
      <el-space wrap :size="12">
        <el-button type="primary" :icon="Document" @click="goTo(\'/emergency/plans\')">预案管理</el-button>
        <el-button type="danger" :icon="Warning" @click="goTo(\'/emergency/incidents\')">事件处置</el-button>
        <el-button type="success" :icon="Box" @click="goTo(\'/emergency/resources\')">资源管理</el-button>
        <el-button type="warning" :icon="DataLine" @click="goTo(\'/emergency/drills\')">演练计划</el-button>
      </el-space>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from "vue"
import { useRouter } from "vue-router"
import { Refresh, Document, Warning, Box, DataLine } from "@element-plus/icons-vue"
import { ElMessage } from "element-plus"
import { emergencyApi } from "@/api/modules/emergency"

const router = useRouter()
const loading = ref(false)
const recentIncidents = ref<any[]>([])
const recentPlans = ref<any[]>([])

const stats = reactive({ plans: 0, incidents: 0, resources: 0, drills: 0 })

const goTo = (path: string) => router.push(path)

const formatDateTime = (s?: string) => (s ? s.replace("T", " ").substring(0, 16) : "-")

const levelTagType = (lvl: string): any => {
  const map: Record<string, string> = {
    "I": "danger", "II": "danger",
    "III": "warning", "IV": "info",
    "minor": "info", "general": "warning",
    "major": "danger", "fatal": "danger",
  }
  return map[lvl] || ""
}
const planStatusTag = (s: string): any => {
  const map: Record<string, string> = {
    active: "success", draft: "info", expired: "danger", under_review: "warning",
  }
  return map[s] || ""
}

const loadOverview = async () => {
  loading.value = true
  try {
    const [plansRes, incidentsRes, resourcesRes, drillsRes] = await Promise.all([
      emergencyApi.listPlans({ page: 1, pageSize: 5 } as any).catch(() => ({} as any)),
      emergencyApi.listIncidents({ page: 1, pageSize: 5 } as any).catch(() => ({} as any)),
      emergencyApi.listResources({ page: 1, pageSize: 1 } as any).catch(() => ({} as any)),
      emergencyApi.listDrills({ page: 1, pageSize: 1 } as any).catch(() => ({} as any)),
    ])
    const getList = (r: any) => r?.data?.items || r?.data?.list || r?.items || []
    const getTotal = (r: any) => r?.data?.total ?? r?.total ?? 0
    recentPlans.value = getList(plansRes)
    recentIncidents.value = getList(incidentsRes)
    stats.plans = getTotal(plansRes)
    stats.incidents = getTotal(incidentsRes)
    stats.resources = getTotal(resourcesRes)
    stats.drills = getTotal(drillsRes)
  } catch (e: any) {
    ElMessage.error("加载总览失败: " + (e?.message || e))
  } finally {
    loading.value = false
  }
}

onMounted(() => loadOverview())
</script>

<style scoped>
.emergency-overview { padding: 16px; }
.page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
.page-header h2 { margin: 0; font-size: 20px; }
.kpi-row { margin-bottom: 16px; }
.kpi-card { cursor: pointer; transition: transform 0.2s; display: flex; align-items: center; padding: 8px; }
.kpi-card:hover { transform: translateY(-2px); }
.kpi-card :deep(.el-card__body) { display: flex; align-items: center; gap: 16px; width: 100%; }
.kpi-icon { width: 56px; height: 56px; border-radius: 12px; display: flex; align-items: center; justify-content: center; color: #fff; }
.kpi-plan .kpi-icon { background: #409eff; }
.kpi-incident .kpi-icon { background: #f56c6c; }
.kpi-resource .kpi-icon { background: #67c23a; }
.kpi-drill .kpi-icon { background: #e6a23c; }
.kpi-content { flex: 1; }
.kpi-label { color: #909399; font-size: 13px; }
.kpi-value { font-size: 28px; font-weight: 700; margin-top: 2px; }
.card-header { display: flex; justify-content: space-between; align-items: center; }
.quick-nav { margin-top: 16px; }
</style>
