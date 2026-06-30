<template>
  <div class="permit-detail">
    <div class="page-header">
      <h2>
        <el-button :icon="ArrowLeft" link @click="goBack">返回</el-button>
        作业票详情
      </h2>
      <el-button :icon="Refresh" @click="loadAll">刷新</el-button>
    </div>

    <el-card v-loading="loading" class="info-card">
      <template #header><span>作业票信息</span></template>
      <el-descriptions v-if="permit" :column="3" border>
        <el-descriptions-item label="作业票编号">{{ permit.permitCode }}</el-descriptions-item>
        <el-descriptions-item label="作业类型">{{ workTypeLabel(permit.workType) }}</el-descriptions-item>
        <el-descriptions-item label="状态">
          <el-tag :type="statusTagType(permit.status)">{{ statusLabel(permit.status) }}</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="作业地点">{{ permit.workLocation || "-" }}</el-descriptions-item>
        <el-descriptions-item label="申请人">{{ permit.applicantId || "-" }}</el-descriptions-item>
        <el-descriptions-item label="部门">{{ permit.deptId || "-" }}</el-descriptions-item>
        <el-descriptions-item label="计划开始" :span="1.5">{{ formatDateTime(permit.planStartTime) }}</el-descriptions-item>
        <el-descriptions-item label="计划结束" :span="1.5">{{ formatDateTime(permit.planEndTime) }}</el-descriptions-item>
        <el-descriptions-item label="作业内容" :span="3">{{ permit.workContent || "-" }}</el-descriptions-item>
      </el-descriptions>
      <el-empty v-else description="未找到作业票数据" />
    </el-card>

    <el-tabs v-model="activeTab" class="tabs-card">
      <el-tab-pane label="作业人员" name="personnel">
        <div class="toolbar">
          <el-button type="primary" :icon="Plus" @click="openAddPersonnel">新增人员</el-button>
        </div>
        <el-table :data="personnel" v-loading="personnelLoading" border stripe>
          <el-table-column prop="personnelName" label="姓名" width="120" />
          <el-table-column prop="personnelIdCard" label="身份证号" width="200" />
          <el-table-column prop="position" label="职务" width="120" />
          <el-table-column prop="phone" label="电话" width="150" />
          <el-table-column label="操作" width="100" fixed="right">
            <template #default="{ row }">
              <el-button size="small" type="danger" link @click="removePersonnelRow(row)">删除</el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-tab-pane>

      <el-tab-pane label="气体检测" name="gas">
        <div class="toolbar">
          <el-button type="primary" :icon="Plus" @click="openAddGas">新增检测记录</el-button>
        </div>
        <el-table :data="gasDetections" v-loading="gasLoading" border stripe>
          <el-table-column prop="gasType" label="气体类型" width="120" />
          <el-table-column prop="concentration" label="浓度值" width="120" />
          <el-table-column prop="unit" label="单位" width="80" />
          <el-table-column prop="threshold" label="阈值" width="120" />
          <el-table-column label="结果" width="100">
            <template #default="{ row }">
              <el-tag :type="row.passed ? 'success' : 'danger'">
                {{ row.passed ? "合格" : "超标" }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column label="检测时间" width="180">
            <template #default="{ row }">{{ formatDateTime(row.detectTime) }}</template>
          </el-table-column>
        </el-table>
      </el-tab-pane>

      <el-tab-pane label="安全措施" name="measures">
        <div class="toolbar">
          <el-button type="primary" :icon="Plus" @click="openAddMeasure">新增措施</el-button>
        </div>
        <el-table :data="measures" v-loading="measuresLoading" border stripe>
          <el-table-column prop="measureContent" label="措施内容" min-width="220" />
          <el-table-column prop="responsiblePerson" label="负责人" width="120" />
          <el-table-column label="确认状态" width="120">
            <template #default="{ row }">
              <el-tag :type="row.confirmed ? 'success' : 'warning'">
                {{ row.confirmed ? "已确认" : "未确认" }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="120" fixed="right">
            <template #default="{ row }">
              <el-button v-if="!row.confirmed" size="small" type="primary" link @click="confirmMeasureRow(row)">确认</el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-tab-pane>

      <el-tab-pane label="审批签字" name="signs">
        <el-table :data="signs" v-loading="signsLoading" border stripe>
          <el-table-column prop="signRole" label="签字角色" width="120" />
          <el-table-column prop="signerName" label="签字人" width="120" />
          <el-table-column label="签字时间" width="180">
            <template #default="{ row }">{{ formatDateTime(row.signTime) }}</template>
          </el-table-column>
          <el-table-column prop="signOpinion" label="意见" min-width="200" />
          <el-table-column prop="signatureHash" label="签名Hash" width="180" show-overflow-tooltip />
        </el-table>
      </el-tab-pane>
    </el-tabs>

    <!-- 新增人员对话框 -->
    <el-dialog v-model="personnelDialog" title="新增作业人员" width="500px">
      <el-form :model="personnelForm" label-width="100px">
        <el-form-item label="姓名"><el-input v-model="personnelForm.personnel_name" /></el-form-item>
        <el-form-item label="身份证号"><el-input v-model="personnelForm.personnel_id_card" /></el-form-item>
        <el-form-item label="职务"><el-input v-model="personnelForm.position" /></el-form-item>
        <el-form-item label="电话"><el-input v-model="personnelForm.phone" /></el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="personnelDialog = false">取消</el-button>
        <el-button type="primary" @click="submitPersonnel">提交</el-button>
      </template>
    </el-dialog>

    <!-- 新增气体检测 -->
    <el-dialog v-model="gasDialog" title="新增气体检测" width="500px">
      <el-form :model="gasForm" label-width="100px">
        <el-form-item label="气体类型"><el-input v-model="gasForm.gas_type" placeholder="如 O2/CO/H2S" /></el-form-item>
        <el-form-item label="浓度值"><el-input-number v-model="gasForm.concentration" :precision="3" /></el-form-item>
        <el-form-item label="单位"><el-input v-model="gasForm.unit" placeholder="如 %vol / ppm" /></el-form-item>
        <el-form-item label="阈值"><el-input-number v-model="gasForm.threshold" :precision="3" /></el-form-item>
        <el-form-item label="是否合格">
          <el-switch v-model="gasForm.passed" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="gasDialog = false">取消</el-button>
        <el-button type="primary" @click="submitGas">提交</el-button>
      </template>
    </el-dialog>

    <!-- 新增措施 -->
    <el-dialog v-model="measureDialog" title="新增安全措施" width="500px">
      <el-form :model="measureForm" label-width="100px">
        <el-form-item label="措施内容">
          <el-input v-model="measureForm.measure_content" type="textarea" :rows="3" />
        </el-form-item>
        <el-form-item label="负责人">
          <el-input v-model="measureForm.responsible_person" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="measureDialog = false">取消</el-button>
        <el-button type="primary" @click="submitMeasure">提交</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from "vue"
import { useRoute, useRouter } from "vue-router"
import { ArrowLeft, Refresh, Plus } from "@element-plus/icons-vue"
import { ElMessage, ElMessageBox } from "element-plus"
import { permitApi } from "@/api/modules/permit"

const route = useRoute()
const router = useRouter()

const permitId = computed(() => Number(route.query.id || route.params.id || 0))

const activeTab = ref("personnel")
const loading = ref(false)
const personnelLoading = ref(false)
const gasLoading = ref(false)
const measuresLoading = ref(false)
const signsLoading = ref(false)

const permit = ref<any>(null)
const personnel = ref<any[]>([])
const gasDetections = ref<any[]>([])
const measures = ref<any[]>([])
const signs = ref<any[]>([])

const personnelDialog = ref(false)
const gasDialog = ref(false)
const measureDialog = ref(false)
const personnelForm = reactive({ personnel_name: "", personnel_id_card: "", position: "", phone: "" })
const gasForm = reactive<any>({ gas_type: "", concentration: 0, unit: "", threshold: 0, passed: true })
const measureForm = reactive({ measure_content: "", responsible_person: "" })

const formatDateTime = (s?: string) => (s ? s.replace("T", " ").substring(0, 16) : "-")

const workTypeLabel = (t: string) => {
  const map: Record<string, string> = {
    hot_work: "动火作业", confined_space: "受限空间", height_work: "高处作业",
    temporary_electricity: "临时用电", excavation: "挖掘作业", lifting: "吊装作业",
  }
  return map[t] || t
}

const statusLabel = (s: string) => {
  const map: Record<string, string> = {
    draft: "草稿", pending: "待审批", approved: "已批准",
    rejected: "已拒绝", expired: "已过期", cancelled: "已取消",
  }
  return map[s] || s
}
const statusTagType = (s: string): any => {
  const map: Record<string, string> = {
    pending: "warning", approved: "success", rejected: "danger",
    expired: "info", draft: "", cancelled: "info",
  }
  return map[s] || ""
}

const goBack = () => router.back()

const loadPermit = async () => {
  if (!permitId.value) return
  loading.value = true
  try {
    const res: any = await permitApi.getById(permitId.value)
    permit.value = res.data || res
  } catch (e: any) {
    ElMessage.error("加载作业票失败: " + (e?.message || e))
  } finally {
    loading.value = false
  }
}

const loadPersonnel = async () => {
  if (!permitId.value) return
  personnelLoading.value = true
  try {
    const res: any = await permitApi.getPersonnel(permitId.value, { pageNum: 1, pageSize: 100 } as any)
    personnel.value = res.data?.items || res.data?.list || []
  } catch (e: any) {
    ElMessage.error("加载人员失败")
  } finally {
    personnelLoading.value = false
  }
}

const loadGas = async () => {
  if (!permitId.value) return
  gasLoading.value = true
  try {
    const res: any = await permitApi.getGasDetections(permitId.value, { pageNum: 1, pageSize: 100 } as any)
    gasDetections.value = res.data?.items || res.data?.list || []
  } catch (e: any) {
    ElMessage.error("加载气体检测失败")
  } finally {
    gasLoading.value = false
  }
}

const loadMeasures = async () => {
  if (!permitId.value) return
  measuresLoading.value = true
  try {
    const res: any = await permitApi.getSafetyMeasures(permitId.value, { pageNum: 1, pageSize: 100 } as any)
    measures.value = res.data?.items || res.data?.list || []
  } catch (e: any) {
    ElMessage.error("加载安全措施失败")
  } finally {
    measuresLoading.value = false
  }
}

const loadSigns = async () => {
  if (!permitId.value) return
  signsLoading.value = true
  try {
    const res: any = await permitApi.getSigns(permitId.value, { pageNum: 1, pageSize: 100 } as any)
    signs.value = res.data?.items || res.data?.list || []
  } catch (e: any) {
    ElMessage.error("加载签字记录失败")
  } finally {
    signsLoading.value = false
  }
}

const loadAll = () => {
  loadPermit()
  loadPersonnel()
  loadGas()
  loadMeasures()
  loadSigns()
}

const openAddPersonnel = () => {
  Object.assign(personnelForm, { personnel_name: "", personnel_id_card: "", position: "", phone: "" })
  personnelDialog.value = true
}
const submitPersonnel = async () => {
  try {
    await permitApi.addPersonnel(permitId.value, { ...personnelForm } as any)
    ElMessage.success("新增成功")
    personnelDialog.value = false
    loadPersonnel()
  } catch (e: any) {
    ElMessage.error("新增失败: " + (e?.message || e))
  }
}
const removePersonnelRow = async (row: any) => {
  try {
    await ElMessageBox.confirm("确定移除该人员吗？", "确认", { type: "warning" })
    await permitApi.removePersonnel(permitId.value, row.personnelId || row.id)
    ElMessage.success("移除成功")
    loadPersonnel()
  } catch (e: any) {
    if (e === "cancel") return
    ElMessage.error("移除失败")
  }
}

const openAddGas = () => {
  Object.assign(gasForm, { gas_type: "", concentration: 0, unit: "", threshold: 0, passed: true })
  gasDialog.value = true
}
const submitGas = async () => {
  try {
    await permitApi.addGasDetection(permitId.value, { ...gasForm })
    ElMessage.success("新增成功")
    gasDialog.value = false
    loadGas()
  } catch (e: any) {
    ElMessage.error("新增失败: " + (e?.message || e))
  }
}

const openAddMeasure = () => {
  Object.assign(measureForm, { measure_content: "", responsible_person: "" })
  measureDialog.value = true
}
const submitMeasure = async () => {
  try {
    await permitApi.addSafetyMeasure(permitId.value, { ...measureForm } as any)
    ElMessage.success("新增成功")
    measureDialog.value = false
    loadMeasures()
  } catch (e: any) {
    ElMessage.error("新增失败: " + (e?.message || e))
  }
}
const confirmMeasureRow = async (row: any) => {
  try {
    const { value } = await ElMessageBox.prompt("请输入确认说明", "确认措施", { inputType: "textarea" })
    await permitApi.confirmSafetyMeasure(permitId.value, row.measureId || row.id, { confirm_remark: value || "" })
    ElMessage.success("确认成功")
    loadMeasures()
  } catch (e: any) {
    if (e === "cancel") return
    ElMessage.error("确认失败: " + (e?.message || e))
  }
}

onMounted(() => loadAll())
</script>

<style scoped>
.permit-detail { padding: 16px; }
.page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
.page-header h2 { margin: 0; font-size: 20px; display: flex; align-items: center; gap: 8px; }
.info-card { margin-bottom: 16px; }
.tabs-card { background: #fff; border-radius: 6px; padding: 0 16px 16px; }
.toolbar { padding: 12px 0; }
</style>
