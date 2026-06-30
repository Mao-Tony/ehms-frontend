<template>
  <div class="equipment-statistics">
    <div class="page-header">
      <h2>设备统计</h2>
      <el-button :icon="Refresh" @click="loadStats">刷新</el-button>
    </div>

    <el-row :gutter="16" class="kpi-row">
      <el-col :span="4">
        <el-card shadow="hover" class="kpi-card">
          <div class="kpi-label">设备总数</div>
          <div class="kpi-value" style="color:#409eff;">{{ stats.totalCount || 0 }}</div>
        </el-card>
      </el-col>
      <el-col :span="4">
        <el-card shadow="hover" class="kpi-card">
          <div class="kpi-label">运行中</div>
          <div class="kpi-value" style="color:#67c23a;">{{ stats.runningCount || 0 }}</div>
        </el-card>
      </el-col>
      <el-col :span="4">
        <el-card shadow="hover" class="kpi-card">
          <div class="kpi-label">维保中</div>
          <div class="kpi-value" style="color:#e6a23c;">{{ stats.maintenanceCount || 0 }}</div>
        </el-card>
      </el-col>
      <el-col :span="4">
        <el-card shadow="hover" class="kpi-card">
          <div class="kpi-label">闲置</div>
          <div class="kpi-value" style="color:#909399;">{{ stats.idleCount || 0 }}</div>
        </el-card>
      </el-col>
      <el-col :span="4">
        <el-card shadow="hover" class="kpi-card">
          <div class="kpi-label">报废</div>
          <div class="kpi-value" style="color:#c45656;">{{ stats.scrappedCount || 0 }}</div>
        </el-card>
      </el-col>
      <el-col :span="4">
        <el-card shadow="hover" class="kpi-card kpi-warning">
          <div class="kpi-label">维保超期</div>
          <div class="kpi-value" style="color:#f56c6c;">{{ stats.overdueMaintenanceCount || 0 }}</div>
        </el-card>
      </el-col>
    </el-row>

    <el-card>
      <template #header>设备状态分布</template>
      <el-row :gutter="20">
        <el-col :span="12">
          <div class="distribution-block">
            <div class="block-title">设备状态</div>
            <div class="dist-row">
              <span class="dist-label">运行中</span>
              <el-progress
                :percentage="percent(stats.runningCount, stats.totalCount)"
                status="success"
                :stroke-width="14"
              />
            </div>
            <div class="dist-row">
              <span class="dist-label">维保中</span>
              <el-progress
                :percentage="percent(stats.maintenanceCount, stats.totalCount)"
                status="warning"
                :stroke-width="14"
              />
            </div>
            <div class="dist-row">
              <span class="dist-label">闲置</span>
              <el-progress
                :percentage="percent(stats.idleCount, stats.totalCount)"
                :stroke-width="14"
              />
            </div>
            <div class="dist-row">
              <span class="dist-label">报废</span>
              <el-progress
                :percentage="percent(stats.scrappedCount, stats.totalCount)"
                status="exception"
                :stroke-width="14"
              />
            </div>
          </div>
        </el-col>
        <el-col :span="12">
          <div class="distribution-block">
            <div class="block-title">超期警示</div>
            <el-alert
              :title="`维保超期: ${stats.overdueMaintenanceCount || 0} 台`"
              type="error"
              :closable="false"
              style="margin-bottom: 12px;"
            />
            <el-alert
              :title="`检验超期: ${stats.overdueInspectCount || 0} 台`"
              type="warning"
              :closable="false"
            />
          </div>
        </el-col>
      </el-row>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from "vue"
import { Refresh } from "@element-plus/icons-vue"
import { ElMessage } from "element-plus"
import { equipmentApi } from "@/api/modules/equipment"

interface EquipmentStats {
  totalCount: number; runningCount: number; maintenanceCount: number
  idleCount: number; scrappedCount: number
  overdueMaintenanceCount: number; overdueInspectCount: number
}

const loading = ref(false)
const stats = reactive<Partial<EquipmentStats>>({})

const percent = (n?: number, total?: number) => {
  if (!total || !n) return 0
  return Math.round((n / total) * 100)
}

const loadStats = async () => {
  loading.value = true
  try {
    const res: any = await equipmentApi.getStatistics()
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
.equipment-statistics { padding: 16px; }
.page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
.page-header h2 { margin: 0; font-size: 20px; }
.kpi-row { margin-bottom: 16px; }
.kpi-card { text-align: center; padding: 8px; }
.kpi-label { color: #909399; font-size: 13px; }
.kpi-value { font-size: 26px; font-weight: 700; margin-top: 4px; }
.distribution-block { padding: 8px; }
.block-title { font-weight: 600; margin-bottom: 12px; color: #303133; }
.dist-row { display: flex; align-items: center; margin-bottom: 12px; gap: 12px; }
.dist-label { min-width: 60px; color: #606266; font-size: 13px; }
.dist-row :deep(.el-progress) { flex: 1; }
</style>
