<template>
  <div class="page-container">
    <el-page-header :icon="ArrowLeft" @back="goBack" content="隐患详情" />

    <el-card v-loading="loading" shadow="never" class="info-card">
      <template #header>
        <div class="card-header">
          <span class="title">{{ hazard?.title || hazard?.hazardCode || '隐患详情' }}</span>
          <el-tag :type="statusTag(hazard?.status)" size="default">{{ statusLabel(hazard?.status) }}</el-tag>
          <div class="actions">
            <el-button
              v-if="canDispatch"
              type="primary"
              size="small"
              :icon="Promotion"
              @click="dialogDispatch = true"
            >
              派单
            </el-button>
            <el-button
              v-if="canComplete"
              type="success"
              size="small"
              :icon="Check"
              @click="dialogComplete = true"
            >
              整改完成
            </el-button>
            <el-button
              v-if="canReject"
              type="warning"
              size="small"
              :icon="CircleClose"
              @click="dialogReject = true"
            >
              驳回
            </el-button>
            <el-button
              v-if="canUrge"
              type="danger"
              size="small"
              :icon="Bell"
              @click="dialogUrge = true"
            >
              催办
            </el-button>
          </div>
        </div>
      </template>

      <el-descriptions :column="3" border>
        <el-descriptions-item label="ID">{{ hazard?.id }}</el-descriptions-item>
        <el-descriptions-item label="等级">
          <el-tag :type="levelTag(hazard?.level)" size="small">{{ levelLabel(hazard?.level) }}</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="分类">{{ hazard?.category || '-' }}</el-descriptions-item>
        <el-descriptions-item label="所属部门">{{ hazard?.departmentName || '-' }}</el-descriptions-item>
        <el-descriptions-item label="位置">{{ hazard?.location || '-' }}</el-descriptions-item>
        <el-descriptions-item label="发现日期">{{ hazard?.discoverDate || '-' }}</el-descriptions-item>
        <el-descriptions-item label="整改期限">{{ hazard?.deadline || '-' }}</el-descriptions-item>
        <el-descriptions-item label="上报人">{{ hazard?.reporterName || '-' }}</el-descriptions-item>
        <el-descriptions-item label="处理人">{{ hazard?.handlerName || '-' }}</el-descriptions-item>
        <el-descriptions-item label="整改方案" :span="3">
          {{ hazard?.resolution || '尚未填写' }}
        </el-descriptions-item>
        <el-descriptions-item label="隐患描述" :span="3">
          {{ hazard?.content || '-' }}
        </el-descriptions-item>
        <el-descriptions-item label="创建时间">{{ hazard?.createTime || '-' }}</el-descriptions-item>
        <el-descriptions-item label="更新时间" :span="2">{{ hazard?.updateTime || '-' }}</el-descriptions-item>
      </el-descriptions>
    </el-card>

    <el-card class="image-card" shadow="never">
      <template #header>
        <div class="card-header">
          <span class="title">影像资料</span>
          <el-upload
            :show-file-list="false"
            :before-upload="beforeUpload"
            :http-request="uploadImage"
            accept="image/*"
          >
            <el-button type="primary" size="small" :icon="Upload">上传图片</el-button>
          </el-upload>
        </div>
      </template>
      <div v-if="(hazard?.attachments?.length || 0) === 0" class="empty">
        <el-empty description="暂无图片" :image-size="80" />
      </div>
      <div v-else class="image-grid">
        <div v-for="(url, idx) in hazard?.attachments" :key="idx" class="image-item">
          <el-image :src="url" :preview-src-list="hazard?.attachments || []" fit="cover" />
        </div>
      </div>
    </el-card>

    <!-- 派单对话框 -->
    <el-dialog v-model="dialogDispatch" title="派单" width="420px">
      <el-form :model="dispatchForm" label-width="80px">
        <el-form-item label="处理人ID" required>
          <el-input-number v-model="dispatchForm.handlerId" :min="1" controls-position="right" style="width: 100%" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogDispatch = false">取消</el-button>
        <el-button type="primary" :loading="submitting" @click="submitDispatch">确认派单</el-button>
      </template>
    </el-dialog>

    <!-- 整改完成 -->
    <el-dialog v-model="dialogComplete" title="整改完成" width="480px">
      <el-form :model="completeForm" label-width="80px">
        <el-form-item label="整改方案" required>
          <el-input v-model="completeForm.resolution" type="textarea" :rows="5" placeholder="请填写整改方案与结果" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogComplete = false">取消</el-button>
        <el-button type="success" :loading="submitting" @click="submitComplete">提交</el-button>
      </template>
    </el-dialog>

    <!-- 驳回 -->
    <el-dialog v-model="dialogReject" title="驳回" width="480px">
      <el-form :model="rejectForm" label-width="80px">
        <el-form-item label="驳回原因" required>
          <el-input v-model="rejectForm.reason" type="textarea" :rows="4" placeholder="请填写驳回原因" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogReject = false">取消</el-button>
        <el-button type="warning" :loading="submitting" @click="submitReject">提交</el-button>
      </template>
    </el-dialog>

    <!-- 催办 -->
    <el-dialog v-model="dialogUrge" title="催办" width="480px">
      <el-form :model="urgeForm" label-width="80px">
        <el-form-item label="催办备注">
          <el-input v-model="urgeForm.message" type="textarea" :rows="3" placeholder="可选：催办备注信息" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogUrge = false">取消</el-button>
        <el-button type="danger" :loading="submitting" @click="submitUrge">发送催办</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts" name="HazardDetail">
import { ref, reactive, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { ArrowLeft, Promotion, Check, CircleClose, Bell, Upload } from '@element-plus/icons-vue'
import { hazardApi, type Hazard } from '@/api/modules/hazard'

const route = useRoute()
const router = useRouter()

const loading = ref(false)
const submitting = ref(false)
const hazard = ref<Hazard | null>(null)

const dialogDispatch = ref(false)
const dialogComplete = ref(false)
const dialogReject = ref(false)
const dialogUrge = ref(false)

const dispatchForm = reactive({ handlerId: 0 })
const completeForm = reactive({ resolution: '' })
const rejectForm = reactive({ reason: '' })
const urgeForm = reactive({ message: '' })

const hazardId = computed(() => Number(route.params.id || route.query.id || 0))

const canDispatch = computed(() => hazard.value?.status === 'PENDING' || hazard.value?.status === 'pending')
const canComplete = computed(
  () => hazard.value?.status === 'DISPATCHED' || hazard.value?.status === 'PROCESSING' || hazard.value?.status === 'rectifying'
)
const canReject = computed(
  () => hazard.value?.status === 'RESOLVED' || hazard.value?.status === 'verifying'
)
const canUrge = computed(
  () =>
    hazard.value &&
    !['CLOSED', 'closed'].includes(hazard.value.status) &&
    !['RESOLVED'].includes(hazard.value.status)
)

function goBack() {
  router.back()
}

async function loadDetail() {
  if (!hazardId.value) {
    ElMessage.warning('缺少隐患ID')
    return
  }
  loading.value = true
  try {
    const res: any = await hazardApi.getById(hazardId.value)
    hazard.value = res.data as Hazard
  } catch (e) {
    console.error(e)
    ElMessage.error('加载详情失败')
  } finally {
    loading.value = false
  }
}

async function submitDispatch() {
  if (!dispatchForm.handlerId) {
    ElMessage.warning('请填写处理人ID')
    return
  }
  submitting.value = true
  try {
    await hazardApi.dispatch(hazardId.value, { handlerId: dispatchForm.handlerId })
    ElMessage.success('派单成功')
    dialogDispatch.value = false
    await loadDetail()
  } catch (e) {
    console.error(e)
    ElMessage.error('派单失败')
  } finally {
    submitting.value = false
  }
}

async function submitComplete() {
  if (!completeForm.resolution.trim()) {
    ElMessage.warning('请填写整改方案')
    return
  }
  submitting.value = true
  try {
    await hazardApi.complete(hazardId.value, { resolution: completeForm.resolution })
    ElMessage.success('整改提交成功')
    dialogComplete.value = false
    await loadDetail()
  } catch (e) {
    console.error(e)
    ElMessage.error('提交失败')
  } finally {
    submitting.value = false
  }
}

async function submitReject() {
  if (!rejectForm.reason.trim()) {
    ElMessage.warning('请填写驳回原因')
    return
  }
  submitting.value = true
  try {
    await hazardApi.reject(hazardId.value, { reason: rejectForm.reason })
    ElMessage.success('已驳回')
    dialogReject.value = false
    await loadDetail()
  } catch (e) {
    console.error(e)
    ElMessage.error('驳回失败')
  } finally {
    submitting.value = false
  }
}

async function submitUrge() {
  submitting.value = true
  try {
    await hazardApi.urge(hazardId.value, { message: urgeForm.message })
    ElMessage.success('催办已发送')
    dialogUrge.value = false
  } catch (e) {
    console.error(e)
    ElMessage.error('催办失败')
  } finally {
    submitting.value = false
  }
}

function beforeUpload(file: File): boolean {
  const ok = /image\//.test(file.type)
  if (!ok) ElMessage.warning('仅支持图片格式')
  return ok
}

async function uploadImage(options: any) {
  const fd = new FormData()
  fd.append('file', options.file)
  try {
    await hazardApi.uploadImage(hazardId.value, fd)
    ElMessage.success('上传成功')
    await loadDetail()
  } catch (e) {
    console.error(e)
    ElMessage.error('上传失败')
  }
}

function statusLabel(s?: string): string {
  if (!s) return '-'
  const map: Record<string, string> = {
    PENDING: '待派单',
    pending: '待派单',
    DISPATCHED: '已派单',
    PROCESSING: '整改中',
    rectifying: '整改中',
    RESOLVED: '待验收',
    verifying: '待验收',
    CLOSED: '已关闭',
    closed: '已关闭'
  }
  return map[s] || s
}

function statusTag(s?: string): 'primary' | 'success' | 'warning' | 'info' | 'danger' {
  if (!s) return 'info'
  const map: Record<string, 'primary' | 'success' | 'warning' | 'info' | 'danger'> = {
    PENDING: 'warning',
    pending: 'warning',
    DISPATCHED: 'primary',
    PROCESSING: 'primary',
    rectifying: 'primary',
    RESOLVED: 'success',
    verifying: 'success',
    CLOSED: 'info',
    closed: 'info'
  }
  return map[s] || 'info'
}

function levelLabel(l?: string): string {
  if (!l) return '-'
  const map: Record<string, string> = {
    RED: '重大',
    ORANGE: '较大',
    YELLOW: '一般',
    BLUE: '低风险',
    重大: '重大',
    较大: '较大',
    一般: '一般',
    低风险: '低风险'
  }
  return map[l] || l
}

function levelTag(l?: string): 'primary' | 'success' | 'warning' | 'info' | 'danger' {
  if (!l) return 'info'
  const map: Record<string, 'primary' | 'success' | 'warning' | 'info' | 'danger'> = {
    RED: 'danger',
    重大: 'danger',
    ORANGE: 'warning',
    较大: 'warning',
    YELLOW: 'primary',
    一般: 'primary',
    BLUE: 'info',
    低风险: 'info'
  }
  return map[l] || 'info'
}

onMounted(() => loadDetail())
</script>

<style lang="scss" scoped>
.page-container {
  padding: 16px;
}
.info-card,
.image-card {
  margin-top: 12px;
}
.card-header {
  display: flex;
  align-items: center;
  gap: 12px;
}
.card-header .title {
  font-size: 16px;
  font-weight: 600;
}
.card-header .actions {
  margin-left: auto;
  display: flex;
  gap: 8px;
}
.image-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
  gap: 10px;
}
.image-item .el-image {
  width: 100%;
  height: 120px;
  border-radius: 6px;
  border: 1px solid #ebeef5;
}
.empty {
  padding: 20px;
}
</style>
