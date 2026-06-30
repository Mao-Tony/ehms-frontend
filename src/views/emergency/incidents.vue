<template>
  <div class="page-container">
    <div class="filter-bar">
      <el-form :inline="true" :model="queryForm" class="filter-form">
        <el-form-item label="事故编号">
          <el-input v-model="queryForm.accidentCode" placeholder="请输入事故编号" clearable style="width: 180px" />
        </el-form-item>
        <el-form-item label="事故类型">
          <el-select v-model="queryForm.accidentType" placeholder="请选择" clearable style="width: 160px">
            <el-option label="坍塌事故" value="collapse" />
            <el-option label="机械伤害" value="mechanical" />
            <el-option label="触电事故" value="electric" />
            <el-option label="火灾事故" value="fire" />
            <el-option label="中毒窒息" value="poisoning" />
            <el-option label="高处坠落" value="fall" />
            <el-option label="物体打击" value="object" />
            <el-option label="其他事故" value="other" />
          </el-select>
        </el-form-item>
        <el-form-item label="事故等级">
          <el-select v-model="queryForm.accidentLevel" placeholder="请选择" clearable style="width: 140px">
            <el-option label="特别重大" value="especial_major" />
            <el-option label="重大" value="major" />
            <el-option label="较大" value="large" />
            <el-option label="一般" value="general" />
          </el-select>
        </el-form-item>
        <el-form-item label="处理状态">
          <el-select v-model="queryForm.status" placeholder="请选择" clearable style="width: 140px">
            <el-option label="已上报" value="reported" />
            <el-option label="调查中" value="investigating" />
            <el-option label="已结案" value="closed" />
            <el-option label="已归档" value="archived" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleQuery">查询</el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
    </div>

    <div class="tool-bar">
      <el-button type="primary" @click="handleAdd">新增事故</el-button>
    </div>

    <el-table :data="tableData" v-loading="loading" stripe border>
      <el-table-column type="index" label="序号" width="60" />
      <el-table-column prop="accidentCode" label="事故编号" width="160" />
      <el-table-column prop="accidentDesc" label="事故描述" min-width="200" show-overflow-tooltip />
      <el-table-column prop="accidentType" label="事故类型" width="110">
        <template #default="{ row }">
          <el-tag :type="typeTag(row.accidentType)" size="small">{{ typeName(row.accidentType) }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="accidentLevel" label="事故等级" width="100">
        <template #default="{ row }">
          <el-tag :type="levelTag(row.accidentLevel)" size="small">{{ levelName(row.accidentLevel) }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="accidentTime" label="发生时间" width="170" />
      <el-table-column prop="location" label="发生地点" min-width="140" show-overflow-tooltip />
      <el-table-column label="损失（万元）" width="160" align="center">
        <template #default="{ row }">
          直接 {{ row.directLoss ?? 0 }} / 间接 {{ row.indirectLoss ?? 0 }}
        </template>
      </el-table-column>
      <el-table-column prop="status" label="处理状态" width="100">
        <template #default="{ row }">
          <el-tag :type="statusTag(row.status)" size="small">{{ statusName(row.status) }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="reportTime" label="上报时间" width="170" />
      <el-table-column label="操作" width="240" fixed="right">
        <template #default="{ row }">
          <el-button link type="primary" size="small" @click="handleView(row)">查看</el-button>
          <el-button link type="primary" size="small" @click="handleEdit(row)">编辑</el-button>
          <el-button link type="success" size="small" @click="handleAnalysis(row)">原因分析</el-button>
          <el-button link type="danger" size="small" @click="handleDelete(row)">删除</el-button>
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
      style="margin-top: 16px; justify-content: flex-end"
    />

    <!-- 新增/编辑 事故对话框 -->
    <el-dialog v-model="dialogVisible" :title="isEdit ? '编辑事故' : '新增事故'" width="720px">
      <el-form ref="formRef" :model="formData" :rules="formRules" label-width="110px">
        <el-row :gutter="16">
          <el-col :span="12">
            <el-form-item label="事故编号" prop="accidentCode">
              <el-input v-model="formData.accidentCode" placeholder="留空自动生成" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="事故类型" prop="accidentType">
              <el-select v-model="formData.accidentType" placeholder="请选择" style="width: 100%">
                <el-option v-for="(label, value) in typeMap" :key="value" :label="label" :value="value" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="事故等级" prop="accidentLevel">
              <el-select v-model="formData.accidentLevel" placeholder="请选择" style="width: 100%">
                <el-option v-for="(label, value) in levelMap" :key="value" :label="label" :value="value" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="处理状态" prop="status">
              <el-select v-model="formData.status" placeholder="请选择" style="width: 100%">
                <el-option v-for="(label, value) in statusMap" :key="value" :label="label" :value="value" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="发生时间" prop="accidentTime">
              <el-date-picker v-model="formData.accidentTime" type="datetime" value-format="YYYY-MM-DD HH:mm:ss" style="width: 100%" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="发生地点" prop="location">
              <el-input v-model="formData.location" placeholder="请输入" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="直接损失(万)" prop="directLoss">
              <el-input-number v-model="formData.directLoss" :min="0" :precision="2" style="width: 100%" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="间接损失(万)" prop="indirectLoss">
              <el-input-number v-model="formData.indirectLoss" :min="0" :precision="2" style="width: 100%" />
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="事故描述" prop="accidentDesc">
              <el-input v-model="formData.accidentDesc" type="textarea" :rows="3" placeholder="请输入" />
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="原因分析" prop="causalAnalysis">
              <el-input v-model="formData.causalAnalysis" type="textarea" :rows="3" placeholder="请输入" />
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="submitLoading" @click="handleSubmit">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { reactive, ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { emergencyApi } from '@/api/modules/emergency'

const loading = ref(false)
const submitLoading = ref(false)
const tableData = ref([])
const dialogVisible = ref(false)
const isEdit = ref(false)
const formRef = ref()

const queryForm = reactive({
  accidentCode: '',
  accidentType: '',
  accidentLevel: '',
  status: ''
})
const pagination = reactive({ page: 1, pageSize: 20, total: 0 })

const initForm = () => ({
  accidentId: null,
  accidentCode: '',
  accidentType: '',
  accidentLevel: '',
  accidentTime: '',
  location: '',
  accidentDesc: '',
  causalAnalysis: '',
  directLoss: 0,
  indirectLoss: 0,
  status: 'reported'
})
const formData = reactive(initForm())

const formRules = {
  accidentType: [{ required: true, message: '请选择事故类型', trigger: 'change' }],
  accidentLevel: [{ required: true, message: '请选择事故等级', trigger: 'change' }],
  accidentTime: [{ required: true, message: '请选择发生时间', trigger: 'change' }],
  accidentDesc: [{ required: true, message: '请输入事故描述', trigger: 'blur' }]
}

const typeMap = { collapse: '坍塌事故', mechanical: '机械伤害', electric: '触电事故', fire: '火灾事故', poisoning: '中毒窒息', fall: '高处坠落', object: '物体打击', other: '其他事故' }
const levelMap = { especial_major: '特别重大', major: '重大', large: '较大', general: '一般' }
const statusMap = { reported: '已上报', investigating: '调查中', closed: '已结案', archived: '已归档' }

const typeName = (v) => typeMap[v] || v
const levelName = (v) => levelMap[v] || v
const statusName = (v) => statusMap[v] || v
const typeTag = (v) => ({ fire: 'danger', electric: 'warning', poisoning: 'danger', collapse: 'danger', fall: 'warning', mechanical: '', object: '', other: 'info' }[v] || 'info')
const levelTag = (v) => ({ especial_major: 'danger', major: 'danger', large: 'warning', general: 'info' }[v] || 'info')
const statusTag = (v) => ({ reported: 'warning', investigating: 'warning', closed: 'success', archived: 'info' }[v] || 'info')

const loadData = async () => {
  loading.value = true
  try {
    const params = { page: pagination.page, pageSize: pagination.pageSize, ...queryForm }
    Object.keys(params).forEach(k => params[k] === '' && delete params[k])
    const res = await emergencyApi.listIncidents(params)
    tableData.value = res.items || res.list || res.data || []
    pagination.total = res.total || 0
  } catch {
    ElMessage.error('加载事故列表失败')
  } finally {
    loading.value = false
  }
}

const handleQuery = () => { pagination.page = 1; loadData() }
const handleReset = () => {
  Object.assign(queryForm, { accidentCode: '', accidentType: '', accidentLevel: '', status: '' })
  handleQuery()
}

const handleAdd = () => {
  isEdit.value = false
  Object.assign(formData, initForm())
  dialogVisible.value = true
}

const handleEdit = (row) => {
  isEdit.value = true
  Object.assign(formData, initForm(), row)
  dialogVisible.value = true
}

const handleView = (row) => {
  ElMessageBox.alert(
    `<p><b>事故编号：</b>${row.accidentCode || '-'}</p>
     <p><b>事故描述：</b>${row.accidentDesc || '-'}</p>
     <p><b>发生时间：</b>${row.accidentTime || '-'}</p>
     <p><b>发生地点：</b>${row.location || '-'}</p>
     <p><b>原因分析：</b>${row.causalAnalysis || '-'}</p>
     <p><b>直接损失：</b>${row.directLoss ?? 0} 万元</p>
     <p><b>间接损失：</b>${row.indirectLoss ?? 0} 万元</p>`,
    '事故详情',
    { dangerouslyUseHTMLString: true, confirmButtonText: '关闭' }
  ).catch(() => {})
}

const handleAnalysis = (row) => {
  ElMessageBox.prompt('请输入原因分析内容', '原因分析', {
    inputType: 'textarea',
    inputValue: row.causalAnalysis || '',
    confirmButtonText: '保存',
    cancelButtonText: '取消'
  }).then(async ({ value }) => {
    try {
      await emergencyApi.updateIncident(row.accidentId, { causalAnalysis: value })
      ElMessage.success('原因分析已更新')
      loadData()
    } catch {
      ElMessage.error('更新失败')
    }
  }).catch(() => {})
}

const handleDelete = (row) => {
  ElMessageBox.confirm(`确认删除事故「${row.accidentCode || row.accidentDesc}」？`, '删除确认', { type: 'warning' })
    .then(async () => {
      try {
        await emergencyApi.deleteIncident(row.accidentId)
        ElMessage.success('删除成功')
        loadData()
      } catch {
        ElMessage.error('删除失败')
      }
    }).catch(() => {})
}

const handleSubmit = async () => {
  if (!formRef.value) return
  await formRef.value.validate(async (valid) => {
    if (!valid) return
    submitLoading.value = true
    try {
      if (isEdit.value) {
        await emergencyApi.updateIncident(formData.accidentId, formData)
        ElMessage.success('更新成功')
      } else {
        await emergencyApi.createIncident(formData)
        ElMessage.success('创建成功')
      }
      dialogVisible.value = false
      loadData()
    } catch {
      ElMessage.error('保存失败')
    } finally {
      submitLoading.value = false
    }
  })
}

onMounted(loadData)
</script>

<style scoped>
.page-container { padding: 16px; }
.filter-bar { background: #fff; padding: 16px; border-radius: 4px; margin-bottom: 16px; }
.tool-bar { margin-bottom: 16px; }
</style>
