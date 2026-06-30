<template>
  <div class="hazard-pending">
    <div class="page-header">
      <h2>待处理隐患</h2>
      <div class="header-actions">
        <el-button :icon="Refresh" @click="loadData">刷新</el-button>
      </div>
    </div>

    <el-row :gutter="16" class="kpi-row">
      <el-col :span="6">
        <el-card shadow="hover" class="kpi-card">
          <div class="kpi-label">待处理总数</div>
          <div class="kpi-value" style="color:#e6a23c;">{{ pagination.total }}</div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover" class="kpi-card">
          <div class="kpi-label">即将逾期</div>
          <div class="kpi-value" style="color:#f56c6c;">{{ nearOverdueCount }}</div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover" class="kpi-card">
          <div class="kpi-label">已逾期</div>
          <div class="kpi-value" style="color:#c45656;">{{ overdueCount }}</div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover" class="kpi-card">
          <div class="kpi-label">重大隐患</div>
          <div class="kpi-value" style="color:#f56c6c;">{{ majorCount }}</div>
        </el-card>
      </el-col>
    </el-row>

    <el-card>
      <el-table :data="tableData" v-loading="loading" border stripe>
        <el-table-column prop="hazardCode" label="隐患编号" width="160" />
        <el-table-column prop="hazardLevel" label="级别" width="100">
          <template #default="{ row }">
            <el-tag :type="levelTagType(row.hazardLevel)">{{ levelLabel(row.hazardLevel) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="120">
          <template #default="{ row }">
            <el-tag :type="statusTagType(row.status)">{{ statusLabel(row.status) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="报告时间" width="180">
          <template #default="{ row }">{{ formatDateTime(row.reportTime) }}</template>
        </el-table-column>
        <el-table-column label="整改期限" width="180">
          <template #default="{ row }">
            <span :style="deadlineStyle(row.deadline)">{{ formatDateTime(row.deadline) }}</span>
          </template>
        </el-table-column>
        <el-table-column label="逾期状态" width="120">
          <template #default="{ row }">
            <el-tag :type="overdueTagType(row.deadline)">{{ overdueLabel(row.deadline) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button size="small" type="primary" link @click="goDetail(row)">查看</el-button>
            <el-button size="small" type="warning" link @click="urgeHazard(row)">催办</el-button>
          </template>
        </el-table-column>
      </el-table>

      <el-pagination
        v-model:current-page="pagination.page"
        v-model:page-size="pagination.pageSize"
        :total="pagination.total"
        :page-sizes="[10, 20, 50]"
        layout="total, sizes, prev, pager, next"
        @size-change="loadData"
        @current-change="loadData"
        style="margin-top: 16px; justify-content: flex-end;"
      />
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, reactive, onMounted } from "vue"
import { useRouter } from "vue-router"
import { Refresh } from "@element-plus/icons-vue"
import { ElMessage, ElMessageBox } from "element-plus"
import { hazardApi, type HazardPending } from "@/api/modules/hazard"

const router = useRouter()
const tableData = ref<HazardPending[]>([])
const loading = ref(false)
const pagination = reactive({ page: 1, pageSize: 20, total: 0 })

const formatDateTime = (s?: string) => (s ? s.replace("T", " ").substring(0, 16) : "-")

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

const statusLabel = (s: string) => {
  const map: Record<string, string> = {
    pending: "待派发", dispatched: "已派发",
    rectifying: "整改中", verifying: "复核中",
    closed: "已关闭", rejected: "已拒绝",
  }
  return map[s] || s
}
const statusTagType = (s: string): any => {
  const map: Record<string, string> = {
    pending: "warning", dispatched: "info",
    rectifying: "danger", verifying: "warning",
    closed: "success", rejected: "info",
  }
  return map[s] || ""
}

const isOverdue = (d?: string) => d && new Date(d) < new Date()
const isNearOverdue = (d?: string) => {
  if (!d) return false
  const date = new Date(d)
  const now = new Date()
  const after3 = new Date(); after3.setDate(now.getDate() + 3)
  return date >= now && date <= after3
}

const overdueLabel = (d?: string) => {
  if (!d) return "无期限"
  if (isOverdue(d)) return "已逾期"
  if (isNearOverdue(d)) return "即将逾期"
  return "正常"
}
const overdueTagType = (d?: string): any => {
  if (!d) return "info"
  if (isOverdue(d)) return "danger"
  if (isNearOverdue(d)) return "warning"
  return "success"
}
const deadlineStyle = (d?: string) => ({
  color: isOverdue(d) ? "#f56c6c" : (isNearOverdue(d) ? "#e6a23c" : "")
})

const nearOverdueCount = computed(() => tableData.value.filter(r => isNearOverdue(r.deadline)).length)
const overdueCount = computed(() => tableData.value.filter(r => isOverdue(r.deadline)).length)
const majorCount = computed(() => tableData.value.filter(r => r.hazardLevel === "major" || r.hazardLevel === "A").length)

const loadData = async () => {
  loading.value = true
  try {
    const res: any = await hazardApi.getPending({ pageNum: pagination.page, pageSize: pagination.pageSize } as any)
    tableData.value = res.data?.items || res.data?.list || res.items || []
    pagination.total = res.data?.total || res.total || 0
  } catch (e: any) {
    ElMessage.error("加载待办失败: " + (e?.message || e))
    tableData.value = []
    pagination.total = 0
  } finally {
    loading.value = false
  }
}

const goDetail = (row: HazardPending) => {
  router.push(`/hazard/list?id=${row.hazardId}`)
}

const urgeHazard = async (row: HazardPending) => {
  try {
    const { value } = await ElMessageBox.prompt("请输入催办说明", "催办", {
      inputType: "textarea",
      inputPlaceholder: "如：请尽快处理...",
    })
    await hazardApi.urge(row.hazardId, { message: value || "" } as any)
    ElMessage.success("催办已发出")
    loadData()
  } catch (e: any) {
    if (e === "cancel" || e?.message === "cancel") return
    ElMessage.error("催办失败: " + (e?.message || e))
  }
}

onMounted(() => loadData())
</script>

<style scoped>
.hazard-pending { padding: 16px; }
.page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
.page-header h2 { margin: 0; font-size: 20px; }
.kpi-row { margin-bottom: 16px; }
.kpi-card { text-align: center; padding: 8px; }
.kpi-label { color: #909399; font-size: 13px; }
.kpi-value { font-size: 26px; font-weight: 700; margin-top: 4px; }
</style>
