<template>
  <div class="hazmat-inventory">
    <div class="page-header">
      <h2>化学品库存汇总</h2>
      <div class="header-actions">
        <el-input
          v-model="keyword"
          placeholder="按化学品名筛选"
          clearable
          style="width: 200px;"
        />
        <el-select v-model="filterAlert" placeholder="预警筛选" clearable style="width: 160px;">
          <el-option label="临期/超期预警" value="alert" />
          <el-option label="低于最小库存" value="below_min" />
          <el-option label="高于最大库存" value="above_max" />
        </el-select>
        <el-button :icon="Refresh" @click="loadData">刷新</el-button>
      </div>
    </div>

    <el-row :gutter="16" class="kpi-row">
      <el-col :span="6">
        <el-card shadow="hover" class="kpi-card">
          <div class="kpi-label">化学品种类</div>
          <div class="kpi-value" style="color:#409eff;">{{ pagination.total }}</div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover" class="kpi-card">
          <div class="kpi-label">本页总量</div>
          <div class="kpi-value" style="color:#67c23a;">{{ totalQuantitySum.toFixed(2) }}</div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover" class="kpi-card">
          <div class="kpi-label">低于最小库存</div>
          <div class="kpi-value" style="color:#e6a23c;">{{ belowMinCount }}</div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover" class="kpi-card">
          <div class="kpi-label">临期预警</div>
          <div class="kpi-value" style="color:#f56c6c;">{{ alertCount }}</div>
        </el-card>
      </el-col>
    </el-row>

    <el-card>
      <el-table :data="filteredData" v-loading="loading" border stripe>
        <el-table-column prop="chemical_id" label="ID" width="80" />
        <el-table-column prop="chemical_name" label="化学品名称" min-width="200" show-overflow-tooltip />
        <el-table-column prop="cas_no" label="CAS号" width="140" />
        <el-table-column prop="total_quantity" label="当前库存" width="120">
          <template #default="{ row }">
            <span :style="quantityStyle(row)">{{ row.total_quantity?.toFixed(2) || 0 }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="unit" label="单位" width="80" />
        <el-table-column prop="min_stock" label="最小库存" width="100">
          <template #default="{ row }">{{ row.min_stock?.toFixed(2) || "-" }}</template>
        </el-table-column>
        <el-table-column prop="max_stock" label="最大库存" width="100">
          <template #default="{ row }">{{ row.max_stock?.toFixed(2) || "-" }}</template>
        </el-table-column>
        <el-table-column label="库存比例" width="180">
          <template #default="{ row }">
            <el-progress
              :percentage="stockPercentage(row)"
              :status="stockStatus(row)"
              :stroke-width="14"
            />
          </template>
        </el-table-column>
        <el-table-column label="预警" width="120">
          <template #default="{ row }">
            <el-tag v-if="row.expire_alert" type="danger">临期</el-tag>
            <el-tag v-else-if="isBelowMin(row)" type="warning">低于最小</el-tag>
            <el-tag v-else-if="isAboveMax(row)" type="warning">高于最大</el-tag>
            <el-tag v-else type="success">正常</el-tag>
          </template>
        </el-table-column>
      </el-table>

      <el-pagination
        v-model:current-page="pagination.page"
        v-model:page-size="pagination.pageSize"
        :total="pagination.total"
        :page-sizes="[10, 20, 50, 100]"
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
import { Refresh } from "@element-plus/icons-vue"
import { ElMessage } from "element-plus"
import { hazmatApi, type InventoryRecord } from "@/api/modules/hazmat"

const tableData = ref<InventoryRecord[]>([])
const loading = ref(false)
const keyword = ref("")
const filterAlert = ref("")
const pagination = reactive({ page: 1, pageSize: 20, total: 0 })

const isBelowMin = (r: InventoryRecord) =>
  r.min_stock != null && r.total_quantity < r.min_stock
const isAboveMax = (r: InventoryRecord) =>
  r.max_stock != null && r.total_quantity > r.max_stock

const stockPercentage = (r: InventoryRecord): number => {
  const max = r.max_stock || r.total_quantity * 2 || 100
  return Math.min(Math.round((r.total_quantity / max) * 100), 100)
}
const stockStatus = (r: InventoryRecord): any => {
  if (r.expire_alert) return "exception"
  if (isBelowMin(r)) return "warning"
  if (isAboveMax(r)) return "warning"
  return "success"
}

const quantityStyle = (r: InventoryRecord) => {
  if (r.expire_alert || isBelowMin(r)) return { color: "#f56c6c", fontWeight: 600 }
  if (isAboveMax(r)) return { color: "#e6a23c", fontWeight: 600 }
  return {}
}

const filteredData = computed(() => {
  return tableData.value.filter(r => {
    if (keyword.value && !r.chemical_name?.includes(keyword.value)) return false
    if (filterAlert.value === "alert" && !r.expire_alert) return false
    if (filterAlert.value === "below_min" && !isBelowMin(r)) return false
    if (filterAlert.value === "above_max" && !isAboveMax(r)) return false
    return true
  })
})

const totalQuantitySum = computed(() =>
  filteredData.value.reduce((s, r) => s + (r.total_quantity || 0), 0)
)
const belowMinCount = computed(() => tableData.value.filter(isBelowMin).length)
const alertCount = computed(() => tableData.value.filter(r => r.expire_alert).length)

const loadData = async () => {
  loading.value = true
  try {
    const res: any = await hazmatApi.listInventory({
      page: pagination.page,
      page_size: pagination.pageSize,
    })
    tableData.value = res.data?.items || res.data?.list || res.items || []
    pagination.total = res.data?.total || res.total || 0
  } catch (e: any) {
    ElMessage.error("加载库存失败: " + (e?.message || e))
    tableData.value = []
    pagination.total = 0
  } finally {
    loading.value = false
  }
}

onMounted(() => loadData())
</script>

<style scoped>
.hazmat-inventory { padding: 16px; }
.page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; flex-wrap: wrap; gap: 12px; }
.page-header h2 { margin: 0; font-size: 20px; }
.header-actions { display: flex; gap: 12px; flex-wrap: wrap; }
.kpi-row { margin-bottom: 16px; }
.kpi-card { text-align: center; padding: 8px; }
.kpi-label { color: #909399; font-size: 13px; }
.kpi-value { font-size: 26px; font-weight: 700; margin-top: 4px; }
</style>
