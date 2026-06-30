<template>
  <div class="user-management">
    <el-card class="search-card">
      <el-form :model="queryForm" inline>
        <el-form-item label="关键字">
          <el-input v-model="queryForm.keyword" placeholder="用户名/姓名" clearable style="width: 200px" />
        </el-form-item>
        <el-form-item label="部门">
          <el-select v-model="queryForm.deptId" placeholder="请选择" clearable style="width: 150px">
            <el-option label="生产部" :value="1" />
            <el-option label="安全部" :value="2" />
            <el-option label="维修部" :value="3" />
          </el-select>
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="queryForm.status" placeholder="请选择" clearable style="width: 120px">
            <el-option label="启用" :value="1" />
            <el-option label="停用" :value="0" />
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
        <div class="left">
          <el-button type="primary" @click="handleAdd">
            <el-icon><Plus /></el-icon>新增用户
          </el-button>
        </div>
      </div>

      <el-table v-loading="loading" :data="tableData" stripe border>
        <el-table-column prop="username" label="用户名" width="120" />
        <el-table-column prop="realName" label="姓名" width="120" />
        <el-table-column prop="deptName" label="部门" width="120" />
        <el-table-column prop="roles" label="角色" min-width="180">
          <template #default="{ row }">
            <el-tag v-for="role in row.roles" :key="role" size="small" style="margin-right: 4px">{{ role }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="email" label="邮箱" min-width="180" show-overflow-tooltip />
        <el-table-column prop="phone" label="手机号" width="130" />
        <el-table-column prop="status" label="状态" width="80" align="center">
          <template #default="{ row }">
            <el-switch v-model="row.status" :active-value="1" :inactive-value="0" @change="handleStatusChange(row)" />
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="创建时间" width="160" />
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link size="small" @click="handleEdit(row)">编辑</el-button>
            <el-button type="primary" link size="small" @click="handleResetPwd(row)">重置密码</el-button>
            <el-button type="danger" link size="small" @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <div class="pagination-wrapper">
        <el-pagination
          v-model:current-page="queryForm.pageNum"
          v-model:page-size="queryForm.pageSize"
          :total="total"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handlePageChange"
        />
      </div>
    </el-card>

    <el-dialog v-model="dialogVisible" :title="dialogTitle" width="600px" destroy-on-close>
      <el-form ref="formRef" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="用户名" prop="username">
          <el-input v-model="form.username" placeholder="请输入用户名" :disabled="!!form.id" />
        </el-form-item>
        <el-form-item label="姓名" prop="realName">
          <el-input v-model="form.realName" placeholder="请输入姓名" />
        </el-form-item>
        <el-form-item label="部门" prop="deptId">
          <el-select v-model="form.deptId" placeholder="请选择" style="width: 100%">
            <el-option label="生产部" :value="1" />
            <el-option label="安全部" :value="2" />
            <el-option label="维修部" :value="3" />
            <el-option label="仓储部" :value="4" />
          </el-select>
        </el-form-item>
        <el-form-item label="角色" prop="roleIds">
          <el-select v-model="form.roleIds" multiple placeholder="请选择" style="width: 100%">
            <el-option label="系统管理员" :value="1" />
            <el-option label="安全管理员" :value="2" />
            <el-option label="部门主管" :value="3" />
            <el-option label="普通用户" :value="4" />
          </el-select>
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="form.email" placeholder="请输入邮箱" />
        </el-form-item>
        <el-form-item label="手机号" prop="phone">
          <el-input v-model="form.phone" placeholder="请输入手机号" />
        </el-form-item>
        <el-form-item label="状态" prop="status">
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
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'
import { systemApi, type User, type UserQuery, type UserForm } from '@/api/modules/system'

const loading = ref(false)
const dialogVisible = ref(false)
const submitLoading = ref(false)
const formRef = ref()

const queryForm = reactive<UserQuery>({
  keyword: '',
  deptId: undefined,
  status: undefined,
  pageNum: 1,
  pageSize: 10
})

const tableData = ref<User[]>([])
const total = ref(0)
const currentId = ref<number | undefined>()
const dialogTitle = computed(() => currentId.value ? '编辑用户' : '新增用户')

const form = reactive<UserForm>({
  username: '',
  realName: '',
  email: '',
  phone: '',
  deptId: 0,
  roleIds: [],
  status: 1
})

const rules = {
  username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
  realName: [{ required: true, message: '请输入姓名', trigger: 'blur' }],
  deptId: [{ required: true, message: '请选择部门', trigger: 'change' }],
  roleIds: [{ required: true, message: '请选择角色', trigger: 'change' }]
}

async function fetchData() {
  loading.value = true
  try {
    const res = await systemApi.listUsers(queryForm)
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
  Object.assign(queryForm, { keyword: '', deptId: undefined, status: undefined, pageNum: 1 })
  fetchData()
}

function handleAdd() {
  currentId.value = undefined
  Object.assign(form, { username: '', realName: '', email: '', phone: '', deptId: 0, roleIds: [], status: 1 })
  dialogVisible.value = true
}

function handleEdit(row: User) {
  currentId.value = row.id
  Object.assign(form, {
    username: row.username,
    realName: row.realName,
    email: row.email,
    phone: row.phone,
    deptId: row.deptId,
    roleIds: [],
    status: row.status
  })
  dialogVisible.value = true
}

async function handleDelete(row: User) {
  await ElMessageBox.confirm(`确定要删除用户"${row.realName}"吗？`, '提示', { type: 'warning' })
  await systemApi.deleteUser(row.id)
  ElMessage.success('删除成功')
  fetchData()
}

async function handleStatusChange(row: User) {
  ElMessage.success(`${row.realName}已${row.status ? '启用' : '停用'}`)
}

async function handleResetPwd(row: User) {
  await ElMessageBox.confirm(`确定要重置用户"${row.realName}"的密码吗？`, '提示', { type: 'warning' })
  await systemApi.resetPassword(row.id, { newPassword: '123456' })
  ElMessage.success('密码已重置为123456')
}

async function handleSubmit() {
  const valid = await formRef.value.validate().catch(() => false)
  if (!valid) return

  submitLoading.value = true
  try {
    if (currentId.value) {
      await systemApi.updateUser(currentId.value, form)
    } else {
      await systemApi.createUser({ ...form, password: '123456' } as any)
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

function handleSizeChange() { fetchData() }
function handlePageChange() { fetchData() }

onMounted(() => { fetchData() })
</script>

<style lang="scss" scoped>
.user-management {
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
