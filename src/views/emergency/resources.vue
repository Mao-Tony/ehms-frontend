<template>
  <div class="resources-page">
    <el-card class="search-card">
      <el-form :model="queryForm" inline>
        <el-form-item label="资源名称">
          <el-input v-model="queryForm.resourceName" placeholder="请输入资源名称" clearable style="width:200px" />
        </el-form-item>
        <el-form-item label="资源类型">
          <el-select v-model="queryForm.resourceType" placeholder="请选择" clearable style="width:150px">
            <el-option v-for="(label, value) in typeMap" :key="value" :label="label" :value="value" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch" :loading="loading">查询</el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card class="table-card">
      <div class="toolbar">
        <el-button type="primary" @click="handleAdd"><el-icon><Plus /></el-icon>新增资源</el-button>
        <el-button text @click="handleRefresh"><el-icon><Refresh /></el-icon></el-button>
      </div>
      <el-table v-loading="loading" :data="tableData" stripe border>
        <el-table-column prop="resourceCode" label="资源编码" width="140" />
        <el-table-column prop="resourceName" label="资源名称" min-width="150" show-overflow-tooltip />
        <el-table-column prop="resourceType" label="资源类型" width="110" align="center">
          <template #default="{ row }"><el-tag>{{ typeName(row.resourceType) }}</el-tag></template>
        </el-table-column>
        <el-table-column prop="quantity" label="数量" width="80" align="right" />
        <el-table-column prop="location" label="存放位置" min-width="150" show-overflow-tooltip />
        <el-table-column prop="contactPerson" label="联系人" width="100" align="center" />
        <el-table-column prop="contactPhone" label="联系电话" width="120" align="center" />
        <el-table-column prop="status" label="状态" width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="statusTag(row.status)">{{ statusName(row.status) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="180" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link size="small" @click="handleView(row)">查看</el-button>
            <el-button type="primary" link size="small" @click="handleEdit(row)">编辑</el-button>
            <el-button type="danger" link size="small" @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
      <div class="pagination-wrapper">
        <el-pagination
          v-model:current-page="pagination.page"
          v-model:page-size="pagination.pageSize"
          :total="pagination.total" :page-sizes="[10,20,50,100]"
          layout="total,sizes,prev,pager,next,jumper"
          @size-change="loadData" @current-change="loadData"
        />
      </div>
    </el-card>

    <el-dialog v-model="dialogVisible" :title="isEdit ? '编辑资源' : '新增资源'" width="640px" destroy-on-close>
      <el-form ref="formRef" :model="formData" :rules="formRules" label-width="110px">
        <el-row :gutter="16">
          <el-col :span="12">
            <el-form-item label="资源编码" prop="resourceCode">
              <el-input v-model="formData.resourceCode" placeholder="请输入" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="资源名称" prop="resourceName">
              <el-input v-model="formData.resourceName" placeholder="请输入" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="资源类型" prop="resourceType">
              <el-select v-model="formData.resourceType" placeholder="请选择" style="width:100%">
                <el-option v-for="(label, value) in typeMap" :key="value" :label="label" :value="value" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="数量" prop="quantity">
              <el-input-number v-model="formData.quantity" :min="0" style="width:100%" />
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="存放位置" prop="location">
              <el-input v-model="formData.location" placeholder="请输入存放位置" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="联系人">
              <el-input v-model="formData.contactPerson" placeholder="请输入" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="联系电话">
              <el-input v-model="formData.contactPhone" placeholder="请输入" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="状态">
              <el-select v-model="formData.status" placeholder="请选择" style="width:100%">
                <el-option label="正常" :value="1" />
                <el-option label="维护中" :value="2" />
                <el-option label="损坏" :value="3" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible=false">取消</el-button>
        <el-button type="primary" :loading="submitLoading" @click="handleSubmit">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Refresh } from '@element-plus/icons-vue'
import { emergencyApi } from '@/api/modules/emergency'

const loading = ref(false)
const submitLoading = ref(false)
const dialogVisible = ref(false)
const isEdit = ref(false)
const formRef = ref()
const tableData = ref([])

const queryForm = reactive({ resourceName: '', resourceType: '' })
const pagination = reactive({ page: 1, pageSize: 20, total: 0 })

const initForm = () => ({
  resourceId: null,
  resourceCode: '',
  resourceName: '',
  resourceType: '',
  quantity: 0,
  location: '',
  contactPerson: '',
  contactPhone: '',
  status: 1
})
const formData = reactive(initForm())

const formRules = {
  resourceCode: [{ required: true, message: '请输入资源编码', trigger: 'blur' }],
  resourceName: [{ required: true, message: '请输入资源名称', trigger: 'blur' }],
  resourceType: [{ required: true, message: '请选择类型', trigger: 'change' }],
  location: [{ required: true, message: '请输入存放位置', trigger: 'blur' }]
}

const typeMap = { firefighting: '消防器材', medical: '医疗急救', ppe: '个人防护', vehicle: '应急车辆', communication: '通讯设备', other: '其他' }
const typeName = (v) => typeMap[v] || v
const statusName = (v) => ({ 1: '正常', 2: '维护中', 3: '损坏' }[v] || '-')
const statusTag = (v) => ({ 1: 'success', 2: 'warning', 3: 'danger' }[v] || 'info')

const loadData = async () => {
  loading.value = true
  try {
    const params = { page: pagination.page, pageSize: pagination.pageSize, ...queryForm }
    Object.keys(params).forEach(k => params[k] === '' && delete params[k])
    const res = await emergencyApi.listResources(params)
    tableData.value = res.items || res.list || res.data || []
    pagination.total = res.total || 0
  } catch {
    ElMessage.error('加载资源列表失败')
  } finally {
    loading.value = false
  }
}

const handleSearch = () => { pagination.page = 1; loadData() }
const handleReset = () => { Object.assign(queryForm, { resourceName: '', resourceType: '' }); handleSearch() }
const handleRefresh = () => loadData()

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
    `<p><b>资源编码：</b>${row.resourceCode || '-'}</p>
     <p><b>资源名称：</b>${row.resourceName || '-'}</p>
     <p><b>资源类型：</b>${typeName(row.resourceType)}</p>
     <p><b>数量：</b>${row.quantity ?? 0}</p>
     <p><b>存放位置：</b>${row.location || '-'}</p>
     <p><b>联系人：</b>${row.contactPerson || '-'} ${row.contactPhone || ''}</p>
     <p><b>状态：</b>${statusName(row.status)}</p>`,
    '资源详情',
    { dangerouslyUseHTMLString: true, confirmButtonText: '关闭' }
  ).catch(() => {})
}

const handleDelete = (row) => {
  ElMessageBox.confirm(`确认删除「${row.resourceName}」？`, '删除确认', { type: 'warning' })
    .then(async () => {
      try {
        await emergencyApi.deleteResource(row.resourceId)
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
        await emergencyApi.updateResource(formData.resourceId, formData)
        ElMessage.success('更新成功')
      } else {
        await emergencyApi.createResource(formData)
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
.resources-page { padding: 16px; }
.search-card, .table-card { margin-bottom: 16px; }
.toolbar { display: flex; justify-content: space-between; margin-bottom: 12px; }
.pagination-wrapper { margin-top: 16px; display: flex; justify-content: flex-end; }
</style>
