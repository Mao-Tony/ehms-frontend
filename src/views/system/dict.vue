<template>
  <div class="page-container">
    <el-card class="search-card">
      <el-form :model="queryForm" inline>
        <el-form-item label="字典类型">
          <el-input v-model="queryForm.dictType" placeholder="请输入字典类型" clearable style="width: 180px" />
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
          <el-icon><Plus /></el-icon> 新增字典
        </el-button>
      </div>

      <el-table :data="tableData" v-loading="loading" stripe>
        <el-table-column prop="dictCode" label="字典编码" width="200" />
        <el-table-column prop="dictType" label="字典类型" width="180" />
        <el-table-column prop="dictLabel" label="字典标签" width="150" />
        <el-table-column prop="dictValue" label="字典键值" width="150" show-overflow-tooltip />
        <el-table-column prop="dictSort" label="排序" width="80" />
        <el-table-column prop="isDefault" label="默认值" width="90">
          <template #default="{ row }">
            <el-tag :type="row.isDefault === 'Y' ? 'success' : 'info'" size="small">
              {{ row.isDefault === 'Y' ? '是' : '否' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="90">
          <template #default="{ row }">
            <el-tag :type="row.status === 0 ? 'success' : 'danger'" size="small">
              {{ row.status === 0 ? '正常' : '停用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="remark" label="备注" min-width="150" show-overflow-tooltip />
        <el-table-column label="操作" width="140" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link size="small" @click="handleEdit(row)">编辑</el-button>
            <el-button type="danger" link size="small" @click="handleDelete(row)">删除</el-button>
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

    <el-dialog v-model="dialogVisible" :title="dialogTitle" width="500px" destroy-on-close>
      <el-form ref="formRef" :model="formData" :rules="formRules" label-width="100px">
        <el-form-item label="字典类型" prop="dictType">
          <el-input v-model="formData.dictType" placeholder="请输入字典类型" />
        </el-form-item>
        <el-form-item label="字典标签" prop="dictLabel">
          <el-input v-model="formData.dictLabel" placeholder="请输入字典标签" />
        </el-form-item>
        <el-form-item label="字典键值" prop="dictValue">
          <el-input v-model="formData.dictValue" placeholder="请输入字典键值" />
        </el-form-item>
        <el-form-item label="排序" prop="dictSort">
          <el-input-number v-model="formData.dictSort" :min="0" style="width: 100%" />
        </el-form-item>
        <el-form-item label="是否默认" prop="isDefault">
          <el-radio-group v-model="formData.isDefault">
            <el-radio label="Y">是</el-radio>
            <el-radio label="N">否</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-radio-group v-model="formData.status">
            <el-radio :label="0">正常</el-radio>
            <el-radio :label="1">停用</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="备注" prop="remark">
          <el-input v-model="formData.remark" type="textarea" :rows="2" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts" name="SystemDict">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'
import { request } from '@/api/request'

const loading = ref(false)
const tableData = ref<any[]>([])
const dialogVisible = ref(false)
const dialogTitle = ref('新增字典')
const formRef = ref()

const pagination = reactive({ pageNum: 1, pageSize: 20, total: 0 })
const queryForm = reactive({ dictType: '' })
const formData = reactive({ dictCode: null as number | null, dictType: '', dictLabel: '', dictValue: '', dictSort: 0, isDefault: 'N', status: 0, remark: '' })
const formRules = {
  dictType: [{ required: true, message: '请输入字典类型', trigger: 'blur' }],
  dictLabel: [{ required: true, message: '请输入字典标签', trigger: 'blur' }],
  dictValue: [{ required: true, message: '请输入字典键值', trigger: 'blur' }]
}

async function loadData() {
  loading.value = true
  try {
    const res: any = await request({ method: 'GET', url: '/system/dict-cache', params: { page: pagination.pageNum, page_size: pagination.pageSize, dict_type: queryForm.dictType } })
    tableData.value = res.data?.list || []
    pagination.total = res.data?.pageInfo?.total || 0
  } finally {
    loading.value = false
  }
}

function handleSearch() { pagination.pageNum = 1; loadData() }
function handleReset() { Object.assign(queryForm, { dictType: '' }); handleSearch() }

function handleAdd() {
  dialogTitle.value = '新增字典'
  Object.assign(formData, { dictCode: null, dictType: '', dictLabel: '', dictValue: '', dictSort: 0, isDefault: 'N', status: 0, remark: '' })
  dialogVisible.value = true
}
function handleEdit(row: any) {
  dialogTitle.value = '编辑字典'
  Object.assign(formData, row)
  dialogVisible.value = true
}
async function handleDelete(row: any) {
  await ElMessageBox.confirm(`确定删除字典「${row.dictLabel}」吗？`, '提示')
  await request({ method: 'DELETE', url: `/system/dict-cache/${row.dictCode}` })
  ElMessage.success('删除成功')
  loadData()
}

async function handleSubmit() {
  await (formRef.value as any).validate()
  if (formData.dictCode) {
    await request({ method: 'PUT', url: `/system/dict-cache/${formData.dictCode}`, data: formData })
    ElMessage.success('修改成功')
  } else {
    await request({ method: 'POST', url: '/system/dict-cache', data: formData })
    ElMessage.success('新增成功')
  }
  dialogVisible.value = false
  loadData()
}

onMounted(() => loadData())
</script>

<style lang="scss" scoped>
.toolbar { margin-bottom: 16px; }
.pagination { margin-top: 16px; justify-content: flex-end; }
</style>
