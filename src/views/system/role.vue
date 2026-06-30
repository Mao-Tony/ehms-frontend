<template>
  <div class="role-management">
    <el-card class="search-card">
      <el-form :model="queryForm" inline>
        <el-form-item label="关键字">
          <el-input v-model="queryForm.keyword" placeholder="角色名称/编码" clearable style="width: 200px" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">查询</el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card class="table-card">
      <div class="toolbar">
        <div class="left">
          <el-button type="primary" @click="handleAdd">
            <el-icon><Plus /></el-icon>新增角色
          </el-button>
        </div>
      </div>

      <el-table v-loading="loading" :data="tableData" stripe border>
        <el-table-column prop="name" label="角色名称" width="150" />
        <el-table-column prop="code" label="角色编码" width="150" />
        <el-table-column prop="description" label="描述" min-width="200" show-overflow-tooltip />
        <el-table-column prop="status" label="状态" width="80" align="center">
          <template #default="{ row }">
            <el-tag :type="row.status === 1 ? 'success' : 'danger'">{{ row.status === 1 ? '启用' : '停用' }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="创建时间" width="160" />
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link size="small" @click="handleEdit(row)">编辑</el-button>
            <el-button type="primary" link size="small" @click="handlePermission(row)">权限</el-button>
            <el-button type="danger" link size="small" @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <div class="pagination-wrapper">
        <el-pagination
          v-model:current-page="queryForm.pageNum"
          v-model:page-size="queryForm.pageSize"
          :total="total"
          :page-sizes="[10, 20, 50]"
          layout="total, sizes, prev, pager, next"
          @size-change="handleSizeChange"
          @current-change="handlePageChange"
        />
      </div>
    </el-card>

    <el-dialog v-model="dialogVisible" :title="dialogTitle" width="600px" destroy-on-close>
      <el-form ref="formRef" :model="form" :rules="rules" label-width="100px">
        <el-form-item label="角色名称" prop="name">
          <el-input v-model="form.name" placeholder="请输入角色名称" />
        </el-form-item>
        <el-form-item label="角色编码" prop="code">
          <el-input v-model="form.code" placeholder="请输入角色编码" :disabled="!!form.id" />
        </el-form-item>
        <el-form-item label="描述">
          <el-input v-model="form.description" type="textarea" :rows="3" placeholder="请输入描述" />
        </el-form-item>
        <el-form-item label="状态">
          <el-radio-group v-model="form.status">
            <el-radio :label="1">启用</el-radio>
            <el-radio :label="0">停用</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="submitLoading" @click="handleSubmit">保存</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="permDialogVisible" title="分配权限" width="400px" destroy-on-close>
      <el-tree
        ref="permTreeRef"
        :data="permissionTree"
        :props="{ label: 'name', children: 'children' }"
        node-key="id"
        show-checkbox
        default-expand-all
      />
      <template #footer>
        <el-button @click="permDialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="permLoading" @click="handlePermSubmit">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'
import { systemApi, type Role, type RoleForm } from '@/api/modules/system'

const loading = ref(false)
const dialogVisible = ref(false)
const permDialogVisible = ref(false)
const submitLoading = ref(false)
const permLoading = ref(false)
const formRef = ref()
const permTreeRef = ref()

const queryForm = reactive({
  keyword: '',
  pageNum: 1,
  pageSize: 10
})

const tableData = ref<Role[]>([])
const total = ref(0)
const currentId = ref<number | undefined>()
const dialogTitle = computed(() => currentId.value ? '编辑角色' : '新增角色')

const form = reactive<RoleForm>({
  name: '',
  code: '',
  description: '',
  status: 1,
  permissionIds: []
})

const permissionTree = ref([
  {
    id: 1,
    name: '系统管理',
    children: [
      { id: 11, name: '用户管理' },
      { id: 12, name: '部门管理' },
      { id: 13, name: '角色管理' },
      { id: 14, name: '字典管理' }
    ]
  },
  {
    id: 2,
    name: '安全管理',
    children: [
      { id: 21, name: '风险点管理' },
      { id: 22, name: '隐患管理' },
      { id: 23, name: '作业票管理' }
    ]
  }
])

const rules = {
  name: [{ required: true, message: '请输入角色名称', trigger: 'blur' }],
  code: [{ required: true, message: '请输入角色编码', trigger: 'blur' }]
}

async function fetchData() {
  loading.value = true
  try {
    const res = await systemApi.listRoles(queryForm)
    tableData.value = res.data.list
    total.value = res.data.pageInfo.total
  } catch (error) {
    console.error(error)
  } finally {
    loading.value = false
  }
}

function handleSearch() {
  queryForm.pageNum = 1
  fetchData()
}

function handleReset() {
  Object.assign(queryForm, { keyword: '', pageNum: 1 })
  fetchData()
}

function handleAdd() {
  currentId.value = undefined
  Object.assign(form, { name: '', code: '', description: '', status: 1, permissionIds: [] })
  dialogVisible.value = true
}

function handleEdit(row: Role) {
  currentId.value = row.id
  Object.assign(form, {
    name: row.name,
    code: row.code,
    description: row.description,
    status: row.status,
    permissionIds: row.permissions || []
  })
  dialogVisible.value = true
}

function handlePermission(row: Role) {
  currentId.value = row.id
  permDialogVisible.value = true
}

async function handleDelete(row: Role) {
  await ElMessageBox.confirm(`确定要删除角色"${row.name}"吗？`, '提示', { type: 'warning' })
  await systemApi.deleteRole(row.id)
  ElMessage.success('删除成功')
  fetchData()
}

async function handleSubmit() {
  const valid = await formRef.value.validate().catch(() => false)
  if (!valid) return

  submitLoading.value = true
  try {
    if (currentId.value) {
      await systemApi.updateRole(currentId.value, form)
    } else {
      await systemApi.createRole(form)
    }
    ElMessage.success('保存成功')
    dialogVisible.value = false
    fetchData()
  } catch (error) {
    console.error(error)
  } finally {
    submitLoading.value = false
  }
}

async function handlePermSubmit() {
  permLoading.value = true
  try {
    ElMessage.success('权限分配成功')
    permDialogVisible.value = false
  } catch (error) {
    console.error(error)
  } finally {
    permLoading.value = false
  }
}

function handleSizeChange() { fetchData() }
function handlePageChange() { fetchData() }

onMounted(() => { fetchData() })
</script>

<style lang="scss" scoped>
.role-management {
  .search-card { margin-bottom: 16px; }
  .table-card {
    .toolbar {
      display: flex;
      justify-content: space-between;
      margin-bottom: 16px;
    }
    .pagination-wrapper {
      margin-top: 16px;
      display: flex;
      justify-content: flex-end;
    }
  }
}
</style>
