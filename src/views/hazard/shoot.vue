<template>
  <div class="hazard-shoot">
    <el-card class="hero-card" shadow="never">
      <div class="hero-inner">
        <div class="hero-left">
          <h2>隐患随手拍</h2>
          <p>拍一张照片，AI 自动识别隐患类型、等级与处置建议。提交后将进入隐患台账走整改流程。</p>
          <div class="hero-tags">
            <el-tag type="success" effect="dark">F-CONT-001</el-tag>
            <el-tag type="warning" effect="dark">F-CONT-003 AI 识别</el-tag>
            <el-tag type="info" effect="dark">来源标记 shoot</el-tag>
          </div>
        </div>
        <div class="hero-right">
          <el-button :icon="LocationFilled" plain @click="getGeoLocation" :loading="geoLoading">获取我的位置</el-button>
        </div>
      </div>
    </el-card>

    <el-row :gutter="16" class="main-row">
      <el-col :xs="24" :md="10">
        <el-card class="step-card">
          <template #header>
            <span><el-icon><Picture /></el-icon> 第 1 步 · 上传现场照片</span>
          </template>
          <el-upload
            v-model:file-list="fileList"
            list-type="picture-card"
            :limit="6"
            :auto-upload="false"
            :on-change="handleFileChange"
            :on-remove="handleFileRemove"
            multiple
          >
            <el-icon><Plus /></el-icon>
            <template #tip>
              <div class="upload-tip">支持 JPG/PNG，最多 6 张，单张不超过 5MB</div>
            </template>
          </el-upload>

          <el-button
            type="primary"
            :icon="MagicStick"
            :loading="aiLoading"
            :disabled="fileList.length === 0"
            style="margin-top: 12px; width: 100%"
            @click="runAIRecognize"
          >
            一键 AI 识别隐患
          </el-button>

          <el-alert
            v-if="aiResult"
            type="success"
            :closable="false"
            style="margin-top: 12px"
          >
            <template #title>
              AI 识别结果：<b>{{ aiResult.category }}</b>
              <span v-if="aiResult.confidence != null"> · 置信度 {{ (aiResult.confidence * 100).toFixed(0) }}%</span>
            </template>
            <div v-if="aiSuggestion" class="ai-suggest">建议措施：{{ aiSuggestion }}</div>
          </el-alert>
        </el-card>
      </el-col>

      <el-col :xs="24" :md="14">
        <el-card class="step-card">
          <template #header>
            <span><el-icon><EditPen /></el-icon> 第 2 步 · 完善上报信息</span>
          </template>
          <el-form ref="formRef" :model="form" :rules="rules" label-width="100px">
            <el-form-item label="隐患编码" prop="hazardCode">
              <el-input v-model="form.hazardCode" placeholder="留空将自动生成" />
            </el-form-item>
            <el-form-item label="隐患类型" prop="hazardType">
              <el-select v-model="form.hazardType" placeholder="请选择" style="width: 100%">
                <el-option label="人的不安全行为" value="PERSON" />
                <el-option label="物的不安全状态" value="EQUIPMENT" />
                <el-option label="环境的不安全因素" value="ENVIRONMENT" />
                <el-option label="管理缺陷" value="MANAGEMENT" />
                <el-option label="其他" value="OTHER" />
              </el-select>
            </el-form-item>
            <el-form-item label="隐患等级" prop="hazardLevel">
              <el-radio-group v-model="form.hazardLevel">
                <el-radio-button value="重大">重大</el-radio-button>
                <el-radio-button value="较大">较大</el-radio-button>
                <el-radio-button value="一般">一般</el-radio-button>
                <el-radio-button value="低">低</el-radio-button>
              </el-radio-group>
            </el-form-item>
            <el-form-item label="所属部门">
              <el-input v-model.number="form.deptId" placeholder="部门 ID" />
            </el-form-item>
            <el-form-item label="位置描述" prop="locationDesc">
              <el-input v-model="form.locationDesc" placeholder="车间 / 楼层 / 区域" />
            </el-form-item>
            <el-form-item label="GPS 经纬度">
              <el-input v-model="gpsDisplay" placeholder="点右上 获取我的位置" readonly>
                <template #append>
                  <el-button @click="clearGeo" :icon="Delete" />
                </template>
              </el-input>
            </el-form-item>
            <el-form-item label="整改期限">
              <el-date-picker v-model="form.deadline" type="datetime" style="width: 100%" />
            </el-form-item>
            <el-form-item label="情况描述" prop="description">
              <el-input
                v-model="form.description"
                type="textarea"
                :rows="4"
                placeholder="描述现场情况、风险源、可能后果"
              />
            </el-form-item>
            <el-form-item>
              <el-button type="primary" :loading="submitting" :icon="Promotion" @click="handleSubmit">提交上报</el-button>
              <el-button @click="handleReset">重置</el-button>
            </el-form-item>
          </el-form>
        </el-card>
      </el-col>
    </el-row>

    <el-card class="recent-card" v-if="recent.length > 0" shadow="never">
      <template #header>最近本人随手拍</template>
      <el-table :data="recent" size="small">
        <el-table-column prop="hazardCode" label="编码" width="160" />
        <el-table-column prop="hazardLevel" label="等级" width="100" />
        <el-table-column prop="locationDesc" label="位置" />
        <el-table-column prop="description" label="描述" show-overflow-tooltip />
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="statusTag(row.status)">{{ statusLabel(row.status) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="reportTime" label="上报时间" width="180" />
      </el-table>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import type { FormInstance, FormRules, UploadUserFile } from 'element-plus'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Picture, Plus, EditPen, MagicStick, Promotion, LocationFilled, Delete } from '@element-plus/icons-vue'
import { hazardApi } from '@/api/modules/hazard'
import { aiApi } from '@/api/modules/ai'

const formRef = ref<FormInstance>()
const fileList = ref<UploadUserFile[]>([])
const aiLoading = ref(false)
const submitting = ref(false)
const geoLoading = ref(false)
const aiResult = ref<any>(null)
const aiSuggestion = ref('')

const form = reactive({
  hazardCode: '',
  hazardType: '',
  hazardLevel: '一般',
  deptId: undefined as number | undefined,
  locationDesc: '',
  description: '',
  deadline: undefined as string | undefined,
  latitude: undefined as number | undefined,
  longitude: undefined as number | undefined,
  aiRecognition: undefined as Record<string, any> | undefined
})

const rules: FormRules = {
  hazardLevel: [{ required: true, message: '请选择隐患等级', trigger: 'change' }],
  description: [{ required: true, message: '请填写情况描述', trigger: 'blur' }],
  locationDesc: [{ required: true, message: '请填写位置描述', trigger: 'blur' }]
}

const gpsDisplay = computed(() => {
  if (form.latitude == null || form.longitude == null) return ''
  return `${form.latitude.toFixed(6)}, ${form.longitude.toFixed(6)}`
})

const recent = ref<any[]>([])

function statusTag(s: string): 'info' | 'warning' | 'primary' | 'success' | 'danger' {
  const key = String(s || '').toLowerCase()
  if (key === 'pending') return 'warning'
  if (key === 'rectifying' || key === 'processing' || key === 'dispatched') return 'primary'
  if (key === 'verifying') return 'info'
  if (key === 'closed' || key === 'resolved') return 'success'
  return 'info'
}
function statusLabel(s: string): string {
  const key = String(s || '').toLowerCase()
  const map: Record<string, string> = {
    pending: '待处理',
    dispatched: '已派单',
    rectifying: '整改中',
    processing: '整改中',
    verifying: '待验收',
    resolved: '已整改',
    closed: '已关闭'
  }
  return map[key] || s
}

function handleFileChange(uploadFile: any) {
  if (uploadFile.raw && uploadFile.raw.size > 5 * 1024 * 1024) {
    ElMessage.warning('单张图片不超过 5MB')
    fileList.value = fileList.value.filter(f => f.uid !== uploadFile.uid)
  }
}
function handleFileRemove() {
  aiResult.value = null
  aiSuggestion.value = ''
}

function getGeoLocation() {
  if (!navigator.geolocation) {
    ElMessage.warning('当前环境不支持地理定位')
    return
  }
  geoLoading.value = true
  navigator.geolocation.getCurrentPosition(
    pos => {
      form.latitude = pos.coords.latitude
      form.longitude = pos.coords.longitude
      geoLoading.value = false
      ElMessage.success('位置已获取')
    },
    err => {
      geoLoading.value = false
      ElMessage.warning('定位失败：' + err.message)
    },
    { timeout: 10000, enableHighAccuracy: false }
  )
}
function clearGeo() {
  form.latitude = undefined
  form.longitude = undefined
}

async function runAIRecognize() {
  if (fileList.value.length === 0) {
    ElMessage.warning('请先上传至少一张照片')
    return
  }
  const first = fileList.value[0]
  const imageUrl = (first as any).url || ''
  if (!imageUrl) {
    ElMessage.warning('未拿到图片 URL，请检查上传组件')
    return
  }
  aiLoading.value = true
  try {
    const res = await aiApi.imageUnderstanding({ imageUrl, question: '识别隐患类型、严重程度并给出处置建议' })
    const data: any = res.data || {}
    aiResult.value = {
      category: data.description || data.category || (data.result && data.result.category) || '未知',
      confidence: data.confidence ?? (data.result && data.result.confidence)
    }
    if (Array.isArray(data.hazards) && data.hazards.length > 0) {
      const top = data.hazards[0]
      aiSuggestion.value = top.suggestion || ''
      if (top.severity && !form.hazardLevel) {
        form.hazardLevel = top.severity
      }
    }
    form.aiRecognition = data
    if (!form.description && aiResult.value.category) {
      form.description = `AI 识别：${aiResult.value.category}`
    }
    ElMessage.success('AI 识别完成')
  } catch (e: any) {
    ElMessage.error('AI 识别失败：' + (e?.message || '未知错误'))
  } finally {
    aiLoading.value = false
  }
}

async function uploadImages(hazardId: number) {
  for (const file of fileList.value) {
    const raw = (file as any).raw
    if (!raw) continue
    const fd = new FormData()
    fd.append('file', raw)
    fd.append('image_type', 'evidence')
    if (form.latitude != null && form.longitude != null) {
      fd.append('gps_location', `${form.latitude},${form.longitude}`)
    }
    try {
      await hazardApi.uploadImage(hazardId, fd)
    } catch (e) {
      console.warn('图片上传失败', e)
    }
  }
}

async function handleSubmit() {
  if (!formRef.value) return
  await formRef.value.validate(async (valid) => {
    if (!valid) return
    submitting.value = true
    try {
      const code = form.hazardCode || ('HZ-SHOOT-' + Date.now())
      const payload: any = {
        hazardCode: code,
        hazardType: form.hazardType || undefined,
        hazardLevel: form.hazardLevel,
        hazardSource: 'shoot',
        deptId: form.deptId,
        locationDesc: form.locationDesc,
        description: form.description,
        deadline: form.deadline,
        latitude: form.latitude,
        longitude: form.longitude,
        aiRecognition: form.aiRecognition
      }
      const res: any = await hazardApi.create(payload)
      const created = res.data || {}
      const hazardId = created.hazardId || created.hazard_id || created.id
      if (hazardId && fileList.value.length > 0) {
        await uploadImages(hazardId)
      }
      ElMessage.success('随手拍上报成功，感谢您的安全贡献！')
      handleReset()
      loadRecent()
    } catch (e: any) {
      ElMessage.error('提交失败：' + (e?.message || '未知错误'))
    } finally {
      submitting.value = false
    }
  })
}

function handleReset() {
  formRef.value?.resetFields()
  fileList.value = []
  aiResult.value = null
  aiSuggestion.value = ''
  form.aiRecognition = undefined
}

async function loadRecent() {
  try {
    const res: any = await hazardApi.list({ pageNum: 1, pageSize: 5 } as any)
    const items = res.data?.items || res.data?.list || []
    recent.value = items.slice(0, 5)
  } catch (e) {
    recent.value = []
  }
}

onMounted(() => {
  loadRecent()
})
</script>

<style scoped>
.hazard-shoot { padding: 16px; }
.hero-card { margin-bottom: 16px; background: linear-gradient(135deg, #409eff 0%, #36b37e 100%); color: #fff; }
.hero-card :deep(.el-card__body) { padding: 16px 20px; }
.hero-inner { display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 12px; }
.hero-left h2 { margin: 0; color: #fff; }
.hero-left p { margin: 6px 0 10px; color: rgba(255,255,255,0.85); font-size: 13px; }
.hero-tags { display: flex; gap: 8px; flex-wrap: wrap; }
.step-card { margin-bottom: 16px; }
.upload-tip { font-size: 12px; color: #909399; margin-top: 6px; }
.ai-suggest { margin-top: 6px; font-size: 13px; }
.recent-card :deep(.el-card__body) { padding: 12px 16px; }
.main-row { margin-bottom: 16px; }
</style>
