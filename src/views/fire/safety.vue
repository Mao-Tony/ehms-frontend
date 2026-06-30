<template>
  <div class="page-container">
    <div class="filter-bar">
      <el-form :inline="true" :model="queryForm" class="filter-form">
        <el-form-item label="记录类型">
          <el-select v-model="queryForm.recordType" placeholder="请选择" clearable style="width: 140px">
            <el-option label="安全培训" value="training" />
            <el-option label="应急演练" value="drill" />
            <el-option label="灭火器补充" value="extinguisher_refill" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleQuery">查询</el-button>
          <el-button @click="handleReset">重置</el-button>
          <el-button type="primary" @click="handleAdd">新增记录</el-button>
        </el-form-item>
      </el-form>
    </div>

    <el-table :data="tableData" v-loading="loading" stripe border>
      <el-table-column type="index" label="序号" width="60" />
      <el-table-column prop="recordType" label="记录类型" width="100">
        <template #default="{ row }">
          <el-tag size="small">{{ typeName(row.recordType) }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="title" label="标题" min-width="200" show-overflow-tooltip />
      <el-table-column prop="content" label="内容摘要" min-width="240" show-overflow-tooltip />
      <el-table-column prop="recordDate" label="记录日期" width="120" />
      <el-table-column prop="trainer" label="组织人" width="100" />
      <el-table-column prop="participantCount" label="参与人数" width="90" align="center" />
      <el-table-column prop="attachmentUrl" label="附件" width="100" align="center">
        <template #default="{ row }">
          <el-link v-if="row.attachmentUrl" type="primary" :href="row.attachmentUrl" target="_blank">查看</el-link>
          <span v-else>—</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="160" fixed="right">
        <template #default="{ row }">
          <el-button link type="primary" size="small" @click="handleView(row)">查看</el-button>
          <el-button link type="primary" size="small" @click="handleEdit(row)">编辑</el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-pagination
      v-model:current-page="pagination.page"
      v-model:page-size="pagination.pageSize"
      :total="pagination.total"
      :page-sizes="[10, 20, 50]"
      layout="total, sizes, prev, pager, next, jumper"
      @size-change="loadData"
      @current-change="loadData"
      style="margin-top: 16px; justify-content: flex-end"
    />

    <!-- 新增/编辑弹窗 -->
    <el-dialog v-model="dialogVisible" :title="dialogTitle" width="600px" destroy-on-close>
      <el-form ref="formRef" :model="formData" :rules="formRules" label-width="100px">
        <el-form-item label="记录类型" prop="recordType">
          <el-select v-model="formData.recordType" placeholder="请选择" style="width: 100%">
            <el-option label="安全培训" value="training" />
            <el-option label="应急演练" value="drill" />
            <el-option label="灭火器补充" value="extinguisher_refill" />
          </el-select>
        </el-form-item>
        <el-form-item label="标题" prop="title">
          <el-input v-model="formData.title" placeholder="请输入标题" maxlength="100" show-word-limit />
        </el-form-item>
        <el-form-item label="内容" prop="content">
          <el-input v-model="formData.content" type="textarea" :rows="4" placeholder="请输入内容" maxlength="500" show-word-limit />
        </el-form-item>
        <el-form-item label="记录日期" prop="recordDate">
          <el-date-picker v-model="formData.recordDate" type="date" value-format="YYYY-MM-DD" style="width: 100%" placeholder="请选择日期" />
        </el-form-item>
        <el-form-item label="组织人" prop="trainer">
          <el-input v-model="formData.trainer" placeholder="请输入组织人姓名" />
        </el-form-item>
        <el-form-item label="参与人数" prop="participantCount">
          <el-input-number v-model="formData.participantCount" :min="0" :max="10000" style="width: 100%" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="submitLoading" @click="handleSubmit">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref, computed, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { fireApi } from '@/api/modules/fire'

const loading = ref(false)
const dialogVisible = ref(false)
const submitLoading = ref(false)
const formRef = ref()
const tableData = ref<any[]>([])
const currentId = ref<number | undefined>()
const queryForm = reactive({ recordType: '' })
const pagination = reactive({ page: 1, pageSize: 20, total: 0 })

const formData = reactive({
  recordType: '',
  title: '',
  content: '',
  recordDate: '',
  trainer: '',
  participantCount: 0,
  durationHours: 0,
  attachmentUrl: '',
  deptId: undefined as number | undefined
})

const formRules = {
  recordType: [{ required: true, message: '请选择记录类型', trigger: 'change' }],
  title: [{ required: true, message: '请输入标题', trigger: 'blur' }],
  content: [{ required: true, message: '请输入内容', trigger: 'blur' }]
}

const typeMap: Record<string, string> = { training: '安全培训', drill: '应急演练', extinguisher_refill: '灭火器补充' }
const typeName = (v: string) => typeMap[v] || v
const dialogTitle = computed(() => currentId.value ? '编辑记录' : '新增记录')

const loadData = async () => {
  loading.value = true
  try {
    const res: any = await fireApi.listSafetyRecords({
      recordType: queryForm.recordType || undefined,
      page: pagination.page,
      pageSize: pagination.pageSize
    })
    tableData.value = res.data?.items || res.data?.list || []
    pagination.total = res.data?.total || 0
  } catch { ElMessage.error('加载失败') }
  finally { loading.value = false }
}

const handleQuery = () => { pagination.page = 1; loadData() }
const handleReset = () => { queryForm.recordType = ''; handleQuery() }
const handleAdd = () => {
  currentId.value = undefined
  Object.assign(formData, { recordType: '', title: '', content: '', recordDate: '', trainer: '', participantCount: 0, durationHours: 0, attachmentUrl: '', deptId: undefined })
  dialogVisible.value = true
}
const handleView = (row: any) => ElMessage.info(`查看: ${row.title}`)
const handleEdit = (row: any) => {
  currentId.value = row.id
  Object.assign(formData, { recordType: row.recordType, title: row.title, content: row.content, recordDate: row.recordDate, trainer: row.trainer || '', participantCount: row.participantCount || 0, durationHours: row.durationHours || 0, attachmentUrl: row.attachmentUrl || '', deptId: row.deptId })
  dialogVisible.value = true
}
const handleSubmit = async () => {
  const valid = await formRef.value.validate().catch(() => false)
  if (!valid) return
  submitLoading.value = true
  try {
    const data = { ...formData }
    if (currentId.value) {
      ElMessage.info('编辑功能（需配置路由）')
    } else {
      await fireApi.createSafetyRecord(data as any)
    }
    ElMessage.success('保存成功')
    dialogVisible.value = false
    loadData()
  } catch { ElMessage.error('保存失败') }
  finally { submitLoading.value = false }
}

onMounted(loadData)
</script>