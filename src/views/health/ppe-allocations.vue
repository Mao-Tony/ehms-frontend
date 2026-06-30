<template>
  <div class="ppe-allocations">
    <div class="page-header">
      <h2>劳保用品配发管理</h2>
      <div>
        <el-button type="primary" :icon="Plus" @click="openCreate">新增配发</el-button>
        <el-button :icon="Refresh" @click="loadData">刷新</el-button>
      </div>
    </div>

    <el-card class="search-card">
      <el-form :inline="true" :model="query" @submit.prevent>
        <el-form-item label="员工ID">
          <el-input v-model.number="query.user_id" placeholder="按员工ID筛选" clearable style="width: 180px;" />
        </el-form-item>
        <el-form-item label="PPE ID">
          <el-input v-model.number="query.ppe_id" placeholder="按PPE ID筛选" clearable style="width: 180px;" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" :icon="Search" @click="onSearch">查询</el-button>
          <el-button :icon="Refresh" @click="onReset">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-row :gutter="16" class="stats-row">
      <el-col :span="6">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-label">配发记录总数</div>
          <div class="stat-value" style="color:#409eff;">{{ pagination.total }}</div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-label">本页累计数量</div>
          <div class="stat-value" style="color:#67c23a;">{{ totalQuantity }}</div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-label">即将到期更换</div>
          <div class="stat-value" style="color:#e6a23c;">{{ expiringCount }}</div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-label">已超期未更换</div>
          <div class="stat-value" style="color:#f56c6c;">{{ overdueCount }}</div>
        </el-card>
      </el-col>
    </el-row>

    <el-card>
      <el-table :data="tableData" v-loading="loading" border stripe>
        <el-table-column prop="distribution_id" label="ID" width="80" />
        <el-table-column prop="user_id" label="员工ID" width="100" />
        <el-table-column prop="ppe_id" label="PPE ID" width="100" />
        <el-table-column prop="stock_id" label="库存ID" width="100" />
        <el-table-column prop="quantity" label="数量" width="80">
          <template #default="{ row }">
            <el-tag>{{ row.quantity || 0 }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="distribute_time" label="配发时间" width="180">
          <template #default="{ row }">{{ formatDateTime(row.distribute_time) }}</template>
        </el-table-column>
        <el-table-column prop="distributor_id" label="配发人ID" width="100" />
        <el-table-column prop="next_replace_date" label="下次更换日期" width="140">
          <template #default="{ row }">
            <el-tag :type="replaceDateTag(row.next_replace_date)">
              {{ row.next_replace_date || "-" }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="签名" min-width="160">
          <template #default="{ row }">
            <el-tooltip v-if="row.signature_hash" :content="row.signature_hash" placement="top">
              <span class="hash-text">{{ truncateHash(row.signature_hash) }}</span>
            </el-tooltip>
            <span v-else style="color:#c0c4cc;">未签</span>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="160" fixed="right">
          <template #default="{ row }">
            <el-button size="small" type="primary" link @click="openEdit(row)">编辑</el-button>
            <el-button size="small" type="success" link @click="quickRenew(row)">续发</el-button>
          </template>
        </el-table-column>
      </el-table>

      <el-pagination
        v-model:current-page="pagination.page"
        v-model:page-size="pagination.pageSize"
        :total="pagination.total"
        :page-sizes="[10, 20, 50, 100]"
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="loadData"
        @current-change="loadData"
        style="margin-top: 16px; justify-content: flex-end;"
      />
    </el-card>

    <el-dialog v-model="dialogVisible" :title="dialogTitle" width="600px" @close="onDialogClose">
      <el-form ref="formRef" :model="form" :rules="rules" label-width="120px">
        <el-form-item label="员工ID" prop="user_id">
          <el-input-number v-model="form.user_id" :min="1" style="width: 100%;" />
        </el-form-item>
        <el-form-item label="PPE ID" prop="ppe_id">
          <el-input-number v-model="form.ppe_id" :min="1" style="width: 100%;" />
        </el-form-item>
        <el-form-item label="库存ID">
          <el-input-number v-model="form.stock_id" :min="1" style="width: 100%;" />
        </el-form-item>
        <el-form-item label="配发数量" prop="quantity">
          <el-input-number v-model="form.quantity" :min="1" style="width: 100%;" />
        </el-form-item>
        <el-form-item label="配发时间">
          <el-date-picker
            v-model="form.distribute_time"
            type="datetime"
            value-format="YYYY-MM-DDTHH:mm:ss"
            placeholder="请选择配发时间"
            style="width: 100%;"
          />
        </el-form-item>
        <el-form-item label="配发人ID">
          <el-input-number v-model="form.distributor_id" :min="1" style="width: 100%;" />
        </el-form-item>
        <el-form-item label="下次更换日期">
          <el-date-picker
            v-model="form.next_replace_date"
            type="date"
            value-format="YYYY-MM-DD"
            placeholder="请选择下次更换日期"
            style="width: 100%;"
          />
        </el-form-item>
        <el-form-item label="签名哈希">
          <el-input v-model="form.signature_hash" placeholder="签名哈希（可选）" maxlength="64" show-word-limit />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="submitting" @click="onSubmit">提交</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, reactive, onMounted } from "vue"
import { Plus, Refresh, Search } from "@element-plus/icons-vue"
import { ElMessage, ElMessageBox, type FormInstance } from "element-plus"
import { healthApi } from "@/api/modules/health"

interface PpeAllocationRow {
  distribution_id?: number
  user_id?: number
  ppe_id?: number
  stock_id?: number
  quantity?: number
  distribute_time?: string
  distributor_id?: number
  signature_hash?: string
  next_replace_date?: string
}

const tableData = ref<PpeAllocationRow[]>([])
const loading = ref(false)
const submitting = ref(false)
const dialogVisible = ref(false)
const isEdit = ref(false)
const formRef = ref<FormInstance>()

const query = reactive<{ user_id?: number; ppe_id?: number }>({})
const pagination = reactive({ page: 1, pageSize: 20, total: 0 })

const form = reactive<PpeAllocationRow>({
  user_id: undefined,
  ppe_id: undefined,
  stock_id: undefined,
  quantity: 1,
  distribute_time: undefined,
  distributor_id: undefined,
  signature_hash: "",
  next_replace_date: undefined,
})

const rules = {
  user_id: [{ required: true, message: "请输入员工ID", trigger: "blur" }],
  ppe_id: [{ required: true, message: "请输入PPE ID", trigger: "blur" }],
  quantity: [{ required: true, message: "请输入配发数量", trigger: "blur" }],
}

const dialogTitle = computed(() => (isEdit.value ? "编辑配发记录" : "新增配发记录"))

const totalQuantity = computed(() =>
  tableData.value.reduce((sum, r) => sum + (r.quantity || 0), 0)
)

const expiringCount = computed(() => {
  const now = new Date()
  const after30 = new Date()
  after30.setDate(now.getDate() + 30)
  return tableData.value.filter(r => {
    if (!r.next_replace_date) return false
    const d = new Date(r.next_replace_date)
    return d >= now && d <= after30
  }).length
})

const overdueCount = computed(() => {
  const now = new Date()
  return tableData.value.filter(r => {
    if (!r.next_replace_date) return false
    return new Date(r.next_replace_date) < now
  }).length
})

const formatDateTime = (s?: string) => (s ? s.replace("T", " ").substring(0, 16) : "-")
const truncateHash = (h: string) => (h && h.length > 12 ? h.substring(0, 12) + "..." : h)

const replaceDateTag = (d?: string): any => {
  if (!d) return "info"
  const date = new Date(d)
  const now = new Date()
  if (date < now) return "danger"
  const diff = (date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
  if (diff <= 30) return "warning"
  return "success"
}

const loadData = async () => {
  loading.value = true
  try {
    const params: any = { page: pagination.page, page_size: pagination.pageSize }
    if (query.user_id) params.user_id = query.user_id
    if (query.ppe_id) params.ppe_id = query.ppe_id
    const res: any = await healthApi.listPpeAllocations(params)
    tableData.value = res.data?.items || res.data?.list || res.items || []
    pagination.total = res.data?.total || res.total || 0
  } catch (e: any) {
    ElMessage.error("加载失败: " + (e?.message || e))
    tableData.value = []
    pagination.total = 0
  } finally {
    loading.value = false
  }
}

const onSearch = () => {
  pagination.page = 1
  loadData()
}
const onReset = () => {
  query.user_id = undefined
  query.ppe_id = undefined
  pagination.page = 1
  loadData()
}

const resetForm = () => {
  form.user_id = undefined
  form.ppe_id = undefined
  form.stock_id = undefined
  form.quantity = 1
  form.distribute_time = undefined
  form.distributor_id = undefined
  form.signature_hash = ""
  form.next_replace_date = undefined
}

const openCreate = () => {
  isEdit.value = false
  resetForm()
  dialogVisible.value = true
}

const openEdit = (row: PpeAllocationRow) => {
  isEdit.value = true
  Object.assign(form, row)
  dialogVisible.value = true
}

const onDialogClose = () => {
  formRef.value?.resetFields()
}

const onSubmit = async () => {
  if (!formRef.value) return
  await formRef.value.validate(async valid => {
    if (!valid) return
    submitting.value = true
    try {
      if (isEdit.value && form.distribution_id) {
        await healthApi.updatePpeAllocation(form.distribution_id, {
          quantity: form.quantity,
          next_replace_date: form.next_replace_date,
        } as any)
        ElMessage.success("更新成功")
      } else {
        await healthApi.createPpeAllocation({
          user_id: form.user_id!,
          ppe_id: form.ppe_id!,
          quantity: form.quantity,
          distribute_time: form.distribute_time,
          signature_hash: form.signature_hash,
          next_replace_date: form.next_replace_date,
        } as any)
        ElMessage.success("创建成功")
      }
      dialogVisible.value = false
      loadData()
    } catch (e: any) {
      ElMessage.error("操作失败: " + (e?.message || e))
    } finally {
      submitting.value = false
    }
  })
}

const quickRenew = async (row: PpeAllocationRow) => {
  try {
    await ElMessageBox.confirm("确定要为该员工续发同款PPE吗？", "续发确认", { type: "warning" })
    await healthApi.createPpeAllocation({
      user_id: row.user_id!,
      ppe_id: row.ppe_id!,
      quantity: row.quantity || 1,
      distribute_time: new Date().toISOString().substring(0, 19),
    } as any)
    ElMessage.success("续发成功")
    loadData()
  } catch (e: any) {
    if (e !== "cancel") ElMessage.error("续发失败: " + (e?.message || e))
  }
}

onMounted(() => loadData())
</script>

<style scoped>
.ppe-allocations { padding: 16px; }
.page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
.page-header h2 { margin: 0; font-size: 20px; }
.search-card { margin-bottom: 16px; }
.stats-row { margin-bottom: 16px; }
.stat-card { text-align: center; padding: 8px; }
.stat-label { color: #909399; font-size: 13px; }
.stat-value { font-size: 28px; font-weight: 700; margin-top: 4px; }
.hash-text { font-family: Consolas, monospace; color: #67c23a; font-size: 12px; }
</style>
