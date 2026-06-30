<template>
  <div class="risk-form">
    <el-form ref="formRef" :model="form" :rules="rules" label-width="120px">
      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="风险点编号" prop="code">
            <el-input v-model="form.code" placeholder="请输入风险点编号" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="风险点名称" prop="name">
            <el-input v-model="form.name" placeholder="请输入风险点名称" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="风险类型" prop="type">
            <el-select v-model="form.type" placeholder="请选择" style="width: 100%">
              <el-option label="设备设施" value="EQUIPMENT" />
              <el-option label="作业活动" value="OPERATION" />
              <el-option label="环境因素" value="ENVIRONMENT" />
              <el-option label="管理缺陷" value="MANAGEMENT" />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="所属部门" prop="departmentId">
            <el-select v-model="form.departmentId" placeholder="请选择" style="width: 100%">
              <el-option label="生产部" :value="1" />
              <el-option label="维修部" :value="2" />
              <el-option label="仓储部" :value="3" />
              <el-option label="安全部" :value="4" />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="24">
          <el-form-item label="所在位置" prop="location">
            <el-input v-model="form.location" placeholder="请输入详细位置" />
          </el-form-item>
        </el-col>
      </el-row>

      <el-divider content-position="left">LEC风险评估</el-divider>

      <el-row :gutter="20">
        <el-col :span="8">
          <el-form-item label="L值(可能性)">
            <el-slider v-model="form.lValue" :min="0" :max="10" :step="1" show-input />
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="E值(暴露频率)">
            <el-slider v-model="form.eValue" :min="0" :max="10" :step="1" show-input />
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="C值(后果严重性)">
            <el-slider v-model="form.cValue" :min="0" :max="10" :step="1" show-input />
          </el-form-item>
        </el-col>
        <el-col :span="24">
          <div class="lec-result">
            <div class="result-item">
              <span class="label">D值(风险值)：</span>
              <span class="value">{{ dValue }}</span>
            </div>
            <div class="result-item">
              <span class="label">风险等级：</span>
              <risk-tag :level="riskLevel" />
            </div>
            <el-button type="primary" link @click="handleAiAssess" :loading="aiLoading">
              <el-icon><MagicStick /></el-icon>
              AI智能评估
            </el-button>
          </div>
        </el-col>
      </el-row>

      <el-form-item label="风险等级" prop="level">
        <el-radio-group v-model="form.level">
          <el-radio label="RED">重大风险</el-radio>
          <el-radio label="ORANGE">较大风险</el-radio>
          <el-radio label="YELLOW">一般风险</el-radio>
          <el-radio label="BLUE">低风险</el-radio>
        </el-radio-group>
      </el-form-item>

      <el-form-item label="危险描述" prop="description">
        <el-input v-model="form.description" type="textarea" :rows="3" placeholder="请描述危险因素和潜在后果" />
      </el-form-item>

      <el-form-item label="管控措施" prop="controlMeasures">
        <el-input v-model="form.controlMeasures" type="textarea" :rows="3" placeholder="请输入风险管控措施" />
      </el-form-item>

      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="责任人">
            <el-select v-model="form.responsibleId" placeholder="请选择" style="width: 100%">
              <el-option label="张三" :value="1" />
              <el-option label="李四" :value="2" />
              <el-option label="王五" :value="3" />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="状态">
            <el-radio-group v-model="form.status">
              <el-radio :label="1">启用</el-radio>
              <el-radio :label="0">停用</el-radio>
            </el-radio-group>
          </el-form-item>
        </el-col>
      </el-row>

      <el-form-item label="附件">
        <file-upload v-model="form.attachments" multiple />
      </el-form-item>
    </el-form>

    <div class="dialog-footer">
      <el-button @click="handleCancel">取消</el-button>
      <el-button type="primary" :loading="submitLoading" @click="handleSubmit">保存</el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { MagicStick } from '@element-plus/icons-vue'
import { riskApi, type RiskPointForm } from '@/api/modules/risk'
import RiskTag from '@/components/common/RiskTag.vue'
import FileUpload from '@/components/common/FileUpload.vue'

const props = defineProps<{
  id?: number
}>()

const emit = defineEmits<{
  (e: 'submit'): void
  (e: 'cancel'): void
}>()

const formRef = ref()
const submitLoading = ref(false)
const aiLoading = ref(false)

const form = reactive<RiskPointForm>({
  code: '',
  name: '',
  type: '',
  level: 'YELLOW',
  departmentId: 0,
  location: '',
  description: '',
  controlMeasures: '',
  lValue: 1,
  eValue: 1,
  cValue: 1,
  responsibleId: 0,
  status: 1,
  attachments: []
})

const rules = {
  code: [{ required: true, message: '请输入风险点编号', trigger: 'blur' }],
  name: [{ required: true, message: '请输入风险点名称', trigger: 'blur' }],
  type: [{ required: true, message: '请选择风险类型', trigger: 'change' }],
  departmentId: [{ required: true, message: '请选择所属部门', trigger: 'change' }],
  level: [{ required: true, message: '请选择风险等级', trigger: 'change' }]
}

const dValue = computed(() => {
  return form.lValue * form.eValue * form.cValue
})

const riskLevel = computed(() => {
  const d = dValue.value
  if (d >= 320) return 'RED'
  if (d >= 160) return 'ORANGE'
  if (d >= 70) return 'YELLOW'
  return 'BLUE'
})

watch([() => form.lValue, () => form.eValue, () => form.cValue], () => {
  if (dValue.value >= 320) form.level = 'RED'
  else if (dValue.value >= 160) form.level = 'ORANGE'
  else if (dValue.value >= 70) form.level = 'YELLOW'
  else form.level = 'BLUE'
})

async function handleAiAssess() {
  if (!form.description) {
    ElMessage.warning('请先填写危险描述')
    return
  }
  aiLoading.value = true
  try {
    const res = await riskApi.aiAssess({
      description: form.description,
      type: form.type,
      location: form.location
    })
    ElMessage.success('AI评估完成')
    if (res.data.level) {
      form.level = res.data.level
    }
  } catch (error) {
    console.error(error)
  } finally {
    aiLoading.value = false
  }
}

async function handleSubmit() {
  const valid = await formRef.value.validate().catch(() => false)
  if (!valid) return

  submitLoading.value = true
  try {
    if (props.id) {
      await riskApi.update(props.id, form)
    } else {
      await riskApi.create(form)
    }
    emit('submit')
  } catch (error) {
    console.error(error)
  } finally {
    submitLoading.value = false
  }
}

function handleCancel() {
  emit('cancel')
}

async function fetchData() {
  if (!props.id) return
  try {
    const res = await riskApi.getById(props.id)
    Object.assign(form, res.data)
  } catch (error) {
    console.error(error)
  }
}

onMounted(() => {
  fetchData()
})
</script>

<style lang="scss" scoped>
.risk-form {
  .lec-result {
    display: flex;
    align-items: center;
    gap: 32px;
    padding: 16px;
    background: #F5F7FA;
    border-radius: 8px;
    margin-bottom: 16px;

    .result-item {
      display: flex;
      align-items: center;

      .label {
        color: #6B7280;
      }

      .value {
        font-size: 24px;
        font-weight: bold;
        font-family: 'DIN Pro', 'DIN', Arial, monospace;
        color: #1890FF;
      }
    }
  }

  .dialog-footer {
    text-align: right;
    margin-top: 24px;
    padding-top: 16px;
    border-top: 1px solid #E5E7EB;
  }
}
</style>
