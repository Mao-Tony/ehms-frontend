<template>
  <div class="page-container">
    <el-card class="search-card">
      <el-form :model="queryForm" inline>
        <el-form-item label="作业单号">
          <el-input v-model="queryForm.keyword" placeholder="单号/作业名称" clearable style="width: 200px" />
        </el-form-item>
        <el-form-item label="作业类型">
          <el-select v-model="queryForm.type" placeholder="请选择" clearable style="width: 160px">
            <el-option label="动火作业" value="HOT_WORK" />
            <el-option label="受限空间" value="CONFINED_SPACE" />
            <el-option label="高处作业" value="HEIGHT_WORK" />
            <el-option label="临时用电" value="TEMPORARY_ELECTRICITY" />
            <el-option label="动土作业" value="EXCAVATION" />
            <el-option label="吊装作业" value="LIFTING" />
          </el-select>
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="queryForm.status" placeholder="请选择" clearable style="width: 140px">
            <el-option label="已批准" value="APPROVED" />
            <el-option label="已过期" value="EXPIRED" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">查询</el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-row :gutter="16">
      <el-col :span="9">
        <el-card class="list-card" shadow="never">
          <template #header>
            <span><el-icon><Tickets /></el-icon> 在执行作业票</span>
          </template>
          <el-table
            :data="tableData"
            v-loading="loading"
            stripe
            highlight-current-row
            @current-change="handleSelect"
            height="600"
          >
            <el-table-column prop="permitNo" label="单号" width="140" show-overflow-tooltip />
            <el-table-column prop="typeName" label="类型" width="100" />
            <el-table-column prop="title" label="作业名称" min-width="160" show-overflow-tooltip />
          </el-table>
          <el-pagination
            v-model:current-page="pagination.pageNum"
            v-model:page-size="pagination.pageSize"
            :total="pagination.total"
            :page-sizes="[10, 20]"
            layout="total, prev, pager, next"
            class="pagination"
            @size-change="loadData"
            @current-change="loadData"
            small
          />
        </el-card>
      </el-col>

      <el-col :span="15">
        <el-card v-if="!currentPermit" class="empty-card" shadow="never">
          <el-empty description="请从左侧选择一张作业票" />
        </el-card>
        <div v-else class="detail-wrap">
          <el-card class="header-card" shadow="never">
            <el-descriptions :column="2" border>
              <el-descriptions-item label="作业单号">{{ currentPermit.permitNo }}</el-descriptions-item>
              <el-descriptions-item label="作业类型">{{ currentPermit.typeName }}</el-descriptions-item>
              <el-descriptions-item label="作业地点">{{ currentPermit.location }}</el-descriptions-item>
              <el-descriptions-item label="主作业人">{{ currentPermit.mainWorker }}</el-descriptions-item>
              <el-descriptions-item label="开始时间">{{ currentPermit.startTime }}</el-descriptions-item>
              <el-descriptions-item label="结束时间">{{ currentPermit.endTime }}</el-descriptions-item>
            </el-descriptions>
          </el-card>

          <el-card class="tab-card" shadow="never">
            <el-tabs v-model="activeTab" @tab-change="onTabChange">
              <el-tab-pane label="安全措施" name="measures">
                <div class="tab-toolbar">
                  <el-button type="primary" size="small" @click="openMeasureDialog">
                    <el-icon><Plus /></el-icon> 新增措施
                  </el-button>
                </div>
                <el-table :data="measures" stripe v-loading="measureLoading">
                  <el-table-column prop="measure" label="措施描述" min-width="240" show-overflow-tooltip />
                  <el-table-column prop="responsible" label="责任人" width="100" />
                  <el-table-column prop="confirmStatus" label="确认状态" width="100">
                    <template #default="{ row }">
                      <el-tag :type="row.confirmed ? 'success' : 'info'" size="small">
                        {{ row.confirmed ? '已确认' : '待确认' }}
                      </el-tag>
                    </template>
                  </el-table-column>
                  <el-table-column prop="confirmTime" label="确认时间" width="160" />
                  <el-table-column label="操作" width="120" fixed="right">
                    <template #default="{ row }">
                      <el-button
                        type="primary"
                        link
                        size="small"
                        :disabled="row.confirmed"
                        @click="confirmMeasure(row)"
                      >
                        确认
                      </el-button>
                    </template>
                  </el-table-column>
                </el-table>
              </el-tab-pane>

              <el-tab-pane label="监护签到" name="signs">
                <div class="tab-toolbar">
                  <el-button type="primary" size="small" @click="openSignDialog">
                    <el-icon><Plus /></el-icon> 监护签到
                  </el-button>
                </div>
                <el-table :data="signs" stripe v-loading="signLoading">
                  <el-table-column prop="signerName" label="监护人" width="120" />
                  <el-table-column prop="signTime" label="签到时间" width="180" />
                  <el-table-column prop="location" label="签到位置" min-width="200" show-overflow-tooltip />
                  <el-table-column prop="remark" label="备注" min-width="160" show-overflow-tooltip />
                </el-table>
              </el-tab-pane>

              <el-tab-pane label="气体检测" name="gas">
                <div class="tab-toolbar">
                  <el-button type="primary" size="small" @click="openGasDialog">
                    <el-icon><Plus /></el-icon> 新增检测
                  </el-button>
                </div>
                <el-table :data="gasData" stripe v-loading="gasLoading">
                  <el-table-column prop="detectTime" label="检测时间" width="160" />
                  <el-table-column prop="o2" label="O₂ (%)" width="100" />
                  <el-table-column prop="co" label="CO (ppm)" width="100" />
                  <el-table-column prop="h2s" label="H₂S (ppm)" width="100" />
                  <el-table-column prop="lel" label="可燃气 (%LEL)" width="120" />
                  <el-table-column prop="qualified" label="是否合格" width="100">
                    <template #default="{ row }">
                      <el-tag :type="row.qualified ? 'success' : 'danger'" size="small">
                        {{ row.qualified ? '合格' : '超标' }}
                      </el-tag>
                    </template>
                  </el-table-column>
                  <el-table-column prop="detectorName" label="检测人" width="100" />
                </el-table>
              </el-tab-pane>
            </el-tabs>
          </el-card>
        </div>
      </el-col>
    </el-row>

    <el-dialog v-model="measureDialog.visible" title="新增安全措施" width="500px">
      <el-form :model="measureDialog.form" label-width="90px">
        <el-form-item label="措施描述">
          <el-input v-model="measureDialog.form.measure" type="textarea" :rows="3" />
        </el-form-item>
        <el-form-item label="责任人">
          <el-input v-model="measureDialog.form.responsible" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="measureDialog.visible = false">取消</el-button>
        <el-button type="primary" @click="submitMeasure">确定</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="signDialog.visible" title="监护签到" width="500px">
      <el-form :model="signDialog.form" label-width="90px">
        <el-form-item label="位置">
          <el-input v-model="signDialog.form.location" />
        </el-form-item>
        <el-form-item label="备注">
          <el-input v-model="signDialog.form.remark" type="textarea" :rows="2" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="signDialog.visible = false">取消</el-button>
        <el-button type="primary" @click="submitSign">签到</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="gasDialog.visible" title="新增气体检测" width="500px">
      <el-form :model="gasDialog.form" label-width="90px">
        <el-form-item label="O₂ (%)">
          <el-input-number v-model="gasDialog.form.o2" :precision="2" :step="0.1" />
        </el-form-item>
        <el-form-item label="CO (ppm)">
          <el-input-number v-model="gasDialog.form.co" :precision="1" :step="0.1" />
        </el-form-item>
        <el-form-item label="H₂S (ppm)">
          <el-input-number v-model="gasDialog.form.h2s" :precision="1" :step="0.1" />
        </el-form-item>
        <el-form-item label="可燃气 (%LEL)">
          <el-input-number v-model="gasDialog.form.lel" :precision="1" :step="0.1" />
        </el-form-item>
        <el-form-item label="是否合格">
          <el-switch v-model="gasDialog.form.qualified" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="gasDialog.visible = false">取消</el-button>
        <el-button type="primary" @click="submitGas">提交</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { Tickets, Plus } from '@element-plus/icons-vue'
import { permitApi, type WorkPermit } from '@/api/modules/permit'

const loading = ref(false)
const tableData = ref<WorkPermit[]>([])
const currentPermit = ref<WorkPermit | null>(null)
const activeTab = ref('measures')

const queryForm = reactive({
  keyword: '',
  type: '',
  status: 'APPROVED'
})

const pagination = reactive({
  pageNum: 1,
  pageSize: 10,
  total: 0
})

const measures = ref<any[]>([])
const measureLoading = ref(false)
const signs = ref<any[]>([])
const signLoading = ref(false)
const gasData = ref<any[]>([])
const gasLoading = ref(false)

const measureDialog = reactive({
  visible: false,
  form: { measure: '', responsible: '' }
})
const signDialog = reactive({
  visible: false,
  form: { location: '', remark: '' }
})
const gasDialog = reactive({
  visible: false,
  form: { o2: 21, co: 0, h2s: 0, lel: 0, qualified: true }
})

const loadData = async () => {
  loading.value = true
  try {
    const res: any = await permitApi.list({
      ...queryForm,
      pageNum: pagination.pageNum,
      pageSize: pagination.pageSize
    })
    tableData.value = res.data?.items || res.data?.list || []
    pagination.total = res.data?.total || 0
  } catch (e) {
    ElMessage.error('加载作业票列表失败')
  } finally {
    loading.value = false
  }
}

const handleSearch = () => {
  pagination.pageNum = 1
  loadData()
}
const handleReset = () => {
  Object.assign(queryForm, { keyword: '', type: '', status: 'APPROVED' })
  pagination.pageNum = 1
  loadData()
}

const handleSelect = (row: WorkPermit | null) => {
  if (!row) return
  currentPermit.value = row
  loadTabData()
}

const onTabChange = () => loadTabData()

const loadTabData = async () => {
  if (!currentPermit.value) return
  const id = currentPermit.value.id
  if (activeTab.value === 'measures') {
    measureLoading.value = true
    try {
      const res: any = await permitApi.getSafetyMeasures(id, { pageNum: 1, pageSize: 50 })
      measures.value = res.data?.items || res.data?.list || []
    } finally {
      measureLoading.value = false
    }
  } else if (activeTab.value === 'signs') {
    signLoading.value = true
    try {
      const res: any = await permitApi.getSigns(id, { pageNum: 1, pageSize: 50 })
      signs.value = res.data?.items || res.data?.list || []
    } finally {
      signLoading.value = false
    }
  } else if (activeTab.value === 'gas') {
    gasLoading.value = true
    try {
      const res: any = await permitApi.getGasDetections(id, { pageNum: 1, pageSize: 50 })
      gasData.value = res.data?.items || res.data?.list || []
    } finally {
      gasLoading.value = false
    }
  }
}

const openMeasureDialog = () => {
  measureDialog.form = { measure: '', responsible: '' }
  measureDialog.visible = true
}
const submitMeasure = async () => {
  if (!currentPermit.value) return
  try {
    await permitApi.addSafetyMeasure(currentPermit.value.id, { ...measureDialog.form })
    ElMessage.success('已新增')
    measureDialog.visible = false
    loadTabData()
  } catch (e) {
    ElMessage.error('新增失败')
  }
}
const confirmMeasure = async (row: any) => {
  if (!currentPermit.value) return
  try {
    await permitApi.confirmSafetyMeasure(currentPermit.value.id, row.id, { confirm_remark: '已确认' })
    ElMessage.success('已确认')
    loadTabData()
  } catch (e) {
    ElMessage.error('确认失败')
  }
}

const openSignDialog = () => {
  signDialog.form = { location: '', remark: '' }
  signDialog.visible = true
}
const submitSign = async () => {
  if (!currentPermit.value) return
  try {
    await permitApi.addSign(currentPermit.value.id, { ...signDialog.form })
    ElMessage.success('已签到')
    signDialog.visible = false
    loadTabData()
  } catch (e) {
    ElMessage.error('签到失败')
  }
}

const openGasDialog = () => {
  gasDialog.form = { o2: 21, co: 0, h2s: 0, lel: 0, qualified: true }
  gasDialog.visible = true
}
const submitGas = async () => {
  if (!currentPermit.value) return
  try {
    await permitApi.addGasDetection(currentPermit.value.id, { ...gasDialog.form })
    ElMessage.success('已记录')
    gasDialog.visible = false
    loadTabData()
  } catch (e) {
    ElMessage.error('提交失败')
  }
}

onMounted(() => {
  loadData()
})
</script>

<style scoped>
.page-container {
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.list-card :deep(.el-card__header),
.header-card :deep(.el-card__header),
.tab-card :deep(.el-card__header) {
  font-weight: 600;
}
.empty-card {
  min-height: 600px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.detail-wrap {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.tab-toolbar {
  margin-bottom: 12px;
}
.pagination {
  margin-top: 12px;
  justify-content: flex-end;
  display: flex;
}
</style>
