<template>
  <div class="page-container">
    <el-card class="search-card">
      <el-form :model="queryForm" inline>
        <el-form-item label="关键词">
          <el-input v-model="queryForm.keyword" placeholder="参数名/键" clearable style="width: 200px" />
        </el-form-item>
        <el-form-item label="参数类型">
          <el-select v-model="queryForm.configType" placeholder="请选择" clearable style="width: 140px">
            <el-option label="系统参数" value="SYSTEM" />
            <el-option label="业务参数" value="BUSINESS" />
            <el-option label="第三方接入" value="THIRD_PARTY" />
            <el-option label="其它" value="OTHER" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">查询</el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card class="table-card">
      <div class="toolbar">
        <el-button type="primary" @click="handleAdd">
          <el-icon><Plus /></el-icon> 新增配置
        </el-button>
      </div>

      <el-table :data="tableData" v-loading="loading" stripe>
        <el-table-column prop="configId" label="ID" width="80" />
        <el-table-column prop="configName" label="参数名" min-width="160" show-overflow-tooltip />
        <el-table-column prop="configKey" label="键" min-width="180" show-overflow-tooltip>
          <template #default="{ row }">
            <el-tag type="info" size="small">{{ row.configKey }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="configValue" label="值" min-width="200" show-overflow-tooltip />
        <el-table-column prop="configType" label="类型" width="120">
          <template #default="{ row }">
            <el-tag :type="typeMap[row.configType] || 'info'" size="small">
              {{ typeLabel[row.configType] || row.configType }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="isSystem" label="系统内置" width="100">
          <template #default="{ row }">
            <el-tag :type="row.isSystem ? 'danger' : 'success'" size="small">
              {{ row.isSystem ? '是' : '否' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="updateTime" label="更新时间" width="180" />
        <el-table-column label="操作" width="180" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link size="small" @click="handleEdit(row)">编辑</el-button>
            <el-button
              type="danger"
              link
              size="small"
              :disabled="row.isSystem"
              @click="handleDelete(row)"
            >
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <el-pagination
        v-model:current-page="pagination.pageNum"
        v-model:page-size="pagination.pageSize"
        :total="pagination.total"
        :page-sizes="[10, 20, 50]"
        layout="total, sizes, prev, pager, next"
        class="pagination"
        @size-change="loadData"
        @current-change="loadData"
      />
    </el-card>

    <el-dialog v-model="dialog.visible" :title="dialog.title" width="560px" @close="resetDialog">
      <el-form :model="dialog.form" :rules="rules" ref="formRef" label-width="100px">
        <el-form-item label="参数名" prop="configName">
          <el-input v-model="dialog.form.configName" placeholder="如：登录失败次数限制" />
        </el-form-item>
        <el-form-item label="参数键" prop="configKey">
          <el-input
            v-model="dialog.form.configKey"
            placeholder="如：security.login.max-fail"
            :disabled="dialog.isEdit"
          />
        </el-form-item>
        <el-form-item label="参数值" prop="configValue">
          <el-input v-model="dialog.form.configValue" type="textarea" :rows="3" />
        </el-form-item>
        <el-form-item label="参数类型" prop="configType">
          <el-select v-model="dialog.form.configType" style="width: 100%">
            <el-option label="系统参数" value="SYSTEM" />
            <el-option label="业务参数" value="BUSINESS" />
            <el-option label="第三方接入" value="THIRD_PARTY" />
            <el-option label="其它" value="OTHER" />
          </el-select>
        </el-form-item>
        <el-form-item label="系统内置">
          <el-switch v-model="dialog.form.isSystem" :disabled="dialog.isEdit" />
        </el-form-item>
        <el-form-item label="备注">
          <el-input v-model="dialog.form.remark" type="textarea" :rows="2" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialog.visible = false">取消</el-button>
        <el-button type="primary" @click="submitForm">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'
import type { FormInstance, FormRules } from 'element-plus'
import { systemApi, type SysConfig } from '@/api/modules/system'

const loading = ref(false)
const tableData = ref<SysConfig[]>([])

const queryForm = reactive({
  keyword: '',
  configType: ''
})

const pagination = reactive({
  pageNum: 1,
  pageSize: 10,
  total: 0
})

const typeLabel: Record<string, string> = {
  SYSTEM: '系统参数',
  BUSINESS: '业务参数',
  THIRD_PARTY: '第三方接入',
  OTHER: '其它'
}
const typeMap: Record<string, string> = {
  SYSTEM: 'danger',
  BUSINESS: 'success',
  THIRD_PARTY: 'warning',
  OTHER: 'info'
}

const formRef = ref<FormInstance>()
const dialog = reactive({
  visible: false,
  title: '新增配置',
  isEdit: false,
  form: {
    configId: undefined as number | undefined,
    configName: '',
    configKey: '',
    configValue: '',
    configType: 'BUSINESS',
    isSystem: false,
    remark: ''
  }
})

const rules: FormRules = {
  configName: [{ required: true, message: '请输入参数名', trigger: 'blur' }],
  configKey: [{ required: true, message: '请输入参数键', trigger: 'blur' }],
  configValue: [{ required: true, message: '请输入参数值', trigger: 'blur' }],
  configType: [{ required: true, message: '请选择参数类型', trigger: 'change' }]
}

const loadData = async () => {
  loading.value = true
  try {
    const res: any = await systemApi.listConfigs({
      ...queryForm,
      pageNum: pagination.pageNum,
      pageSize: pagination.pageSize
    })
    tableData.value = res.data?.items || res.data?.list || []
    pagination.total = res.data?.total || 0
  } catch (e) {
    ElMessage.error('加载配置列表失败')
  } finally {
    loading.value = false
  }
}

const handleSearch = () => {
  pagination.pageNum = 1
  loadData()
}
const handleReset = () => {
  Object.assign(queryForm, { keyword: '', configType: '' })
  pagination.pageNum = 1
  loadData()
}

const resetDialog = () => {
  dialog.form = {
    configId: undefined,
    configName: '',
    configKey: '',
    configValue: '',
    configType: 'BUSINESS',
    isSystem: false,
    remark: ''
  }
  formRef.value?.clearValidate()
}

const handleAdd = () => {
  dialog.isEdit = false
  dialog.title = '新增配置'
  resetDialog()
  dialog.visible = true
}

const handleEdit = (row: SysConfig) => {
  dialog.isEdit = true
  dialog.title = '编辑配置'
  dialog.form = {
    configId: row.configId,
    configName: row.configName,
    configKey: row.configKey,
    configValue: row.configValue,
    configType: row.configType,
    isSystem: row.isSystem,
    remark: row.remark || ''
  }
  dialog.visible = true
}

const submitForm = async () => {
  if (!formRef.value) return
  await formRef.value.validate(async (valid) => {
    if (!valid) return
    try {
      if (dialog.isEdit && dialog.form.configId) {
        await systemApi.updateConfig(dialog.form.configId, dialog.form)
        ElMessage.success('已更新')
      } else {
        await systemApi.createConfig(dialog.form)
        ElMessage.success('已新增')
      }
      dialog.visible = false
      loadData()
    } catch (e) {
      ElMessage.error('保存失败')
    }
  })
}

const handleDelete = async (row: SysConfig) => {
  try {
    await ElMessageBox.confirm(`确定删除配置「${row.configName}」吗？`, '提示', { type: 'warning' })
    await systemApi.deleteConfig(row.configId)
    ElMessage.success('已删除')
    loadData()
  } catch (e) {
    // cancel
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
.toolbar {
  margin-bottom: 12px;
}
.pagination {
  margin-top: 16px;
  justify-content: flex-end;
  display: flex;
}
</style>
