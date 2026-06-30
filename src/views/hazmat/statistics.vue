<template>
  <div class="hazmat-statistics">
    <div class="page-header">
      <h2>化学品统计</h2>
      <el-button :icon="Refresh" @click="loadStats">刷新</el-button>
    </div>

    <el-row :gutter="16" class="kpi-row">
      <el-col :span="6">
        <el-card shadow="hover" class="kpi-card">
          <div class="kpi-label">化学品种类</div>
          <div class="kpi-value" style="color:#409eff;">{{ stats.total_chemicals || stats.totalChemicals || 0 }}</div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover" class="kpi-card">
          <div class="kpi-label">库存总量</div>
          <div class="kpi-value" style="color:#67c23a;">{{ stats.total_stock || stats.totalStock || 0 }}</div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover" class="kpi-card">
          <div class="kpi-label">库存预警</div>
          <div class="kpi-value" style="color:#e6a23c;">{{ stats.alert_count || stats.alertCount || 0 }}</div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover" class="kpi-card">
          <div class="kpi-label">转移记录</div>
          <div class="kpi-value" style="color:#909399;">{{ stats.transfer_count || stats.transferCount || 0 }}</div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="16">
      <el-col :span="12">
        <el-card>
          <template #header>按危险类别</template>
          <el-table :data="hazardClassStats" v-loading="loading" stripe>
            <el-table-column label="危险类别" prop="hazard_class">
              <template #default="{ row }">
                <el-tag :type="classTagType(row.hazard_class || row.hazardClass)">
                  {{ classLabel(row.hazard_class || row.hazardClass) }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column label="数量" prop="count" width="120" />
          </el-table>
        </el-card>
      </el-col>
      <el-col :span="12">
        <el-card>
          <template #header>按存储位置</template>
          <el-table :data="locationStats" v-loading="loading" stripe>
            <el-table-column label="存储位置" prop="location_name">
              <template #default="{ row }">{{ row.location_name || row.locationName || "-" }}</template>
            </el-table-column>
            <el-table-column label="数量" prop="count" width="120" />
          </el-table>
        </el-card>
      </el-col>
    </el-row>

    <el-card style="margin-top: 16px;">
      <template #header>原始数据</template>
      <pre class="raw-json">{{ JSON.stringify(stats, null, 2) }}</pre>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue"
import { Refresh } from "@element-plus/icons-vue"
import { ElMessage } from "element-plus"
import { hazmatApi } from "@/api/modules/hazmat"

const stats = ref<any>({})
const loading = ref(false)

const hazardClassStats = computed(() => stats.value?.hazard_class_stats || stats.value?.hazardClassStats || [])
const locationStats = computed(() => stats.value?.location_stats || stats.value?.locationStats || [])

const classLabel = (c: string) => {
  const map: Record<string, string> = {
    explosive: "爆炸品", flammable: "易燃", oxidizing: "氧化剂",
    toxic: "毒害", corrosive: "腐蚀", radioactive: "放射性",
  }
  return map[c] || c || "-"
}
const classTagType = (c: string): any => {
  const map: Record<string, string> = {
    explosive: "danger", flammable: "danger",
    oxidizing: "warning", toxic: "danger",
    corrosive: "warning", radioactive: "danger",
  }
  return map[c] || ""
}

const loadStats = async () => {
  loading.value = true
  try {
    const res: any = await hazmatApi.getStatistics()
    stats.value = res.data || res || {}
  } catch (e: any) {
    ElMessage.error("加载统计失败: " + (e?.message || e))
  } finally {
    loading.value = false
  }
}

onMounted(() => loadStats())
</script>

<style scoped>
.hazmat-statistics { padding: 16px; }
.page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
.page-header h2 { margin: 0; font-size: 20px; }
.kpi-row { margin-bottom: 16px; }
.kpi-card { text-align: center; padding: 8px; }
.kpi-label { color: #909399; font-size: 13px; }
.kpi-value { font-size: 26px; font-weight: 700; margin-top: 4px; }
.raw-json { background: #f5f7fa; padding: 12px; border-radius: 4px; max-height: 300px; overflow: auto; font-size: 12px; }
</style>
