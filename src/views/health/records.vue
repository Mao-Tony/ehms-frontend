<template>
  <div class="records-page">
    <el-card class="search-card">
      <el-form :model="queryForm" inline>
        <el-form-item label="姓名">
          <el-input v-model="queryForm.userName" placeholder="请输入姓名" clearable style="width: 150px" />
        </el-form-item>
        <el-form-item label="身份证号">
          <el-input v-model="queryForm.idCard" placeholder="请输入身份证号" clearable style="width: 180px" />
        </el-form-item>
        <el-form-item label="部门">
          <el-select v-model="queryForm.departmentId" placeholder="请选择" clearable style="width: 150px">
            <el-option label="生产部" :value="1" />
            <el-option label="维修部" :value="2" />
            <el-option label="仓储部" :value="3" />
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
        <div class="left">
          <el-button type="primary" @click="handleAdd">
            <el-icon><Plus /></el-icon>新增档案
          </el-button>
        </div>
        <div class="right">
          <el-button text @click="handleRefresh">
            <el-icon><Refresh /></el-icon>
          </el-button>
        </div>
      </div>

      <el-table v-loading="loading" :data="tableData" stripe border>
        <el-table-column prop="userName" label="姓名" width="100" align="center" />
        <el-table-column prop="departmentName" label="部门" width="120" />
        <el-table-column prop="position" label="岗位" width="120" show-overflow-tooltip />
        <el-table-column prop="lastCheckDate" label="体检年份" width="100" align="center">
          <template #default="{ row }">
            {{ row.lastCheckDate ? row.lastCheckDate.substring(0, 4) : '-' }}
          </template>
        </el-table-column>
        <el-table-column prop="checkInstitution" label="体检机构" min-width="150" show-overflow-tooltip />
        <el-table-column prop="health档案status" label="档案状态" width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.health档案status)">{{ getStatusName(row.health档案status) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="checkResult" label="体检结果" width="100" align="center">
          <template #default="{ row }">
            <el-tag v-if="row.checkResult" :type="getResultType(row.checkResult)">{{ row.checkResult }}</el-tag>
            <span v-else>-</span>
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

    <el-dialog v-model="dialogVisible" :title="dialogTitle" width="700px" destroy-on-close>
      <el-form ref="formRef" :model="formData" :rules="formRules" label-width="100px">
        <el-form-item label="姓名" prop="userName">
          <el-input v-model="formData.userName" placeholder="请输入姓名" />
        </el-form-item>
        <el-form-item label="身份证号" prop="idCard">
          <el-input v-model="formData.idCard" placeholder="请输入身份证号" />
        </el-form-item>
        <el-form-item label="部门" prop="departmentId">
          <el-select v-model="formData.departmentId" placeholder="请选择" style="width: 100%">
            <el-option label="生产部" :value="1" />
            <el-option label="维修部" :value="2" />
            <el-option label="仓储部" :value="3" />
          </el-select>
        </el-form-item>
        <el-form-item label="岗位" prop="position">
          <el-input v-model="formData.position" placeholder="请输入岗位" />
        </el-form-item>
        <el-form-item label="年龄" prop="age">
          <el-input-number v-model="formData.age" :min="18" :max="65" />
        </el-form-item>
        <el-form-item label="性别" prop="gender">
          <el-radio-group v-model="formData.gender">
            <el-radio label="MALE">男</el-radio>
            <el-radio label="FEMALE">女</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="联系电话" prop="phone">
          <el-input v-model="formData.phone" placeholder="请输入联系电话" />
        </el-form-item>
        <el-form-item label="工龄" prop="workYears">
          <el-input-number v-model="formData.workYears" :min="0" :max="50" />
        </el-form-item>
        <el-form-item label="危害因素">
          <el-select v-model="formData.exposureFactors" multiple placeholder="请选择" style="width: 100%">
            <el-option label="粉尘" value="DUST" />
            <el-option label="噪声" value="NOISE" />
            <el-option label="高温" value="HIGH_TEMP" />
            <el-option label="化学毒物" value="CHEMICAL" />
            <el-option label="放射性物质" value="RADIATION" />
          </el-select>
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
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Refresh } from '@element-plus/icons-vue'
import { healthApi, type HealthRecord } from '@/api/modules/health'

const loading = ref(false)
const dialogVisible = ref(false)
const submitLoading = ref(false)
const formRef = ref()

const queryForm = reactive({
  userName: '',
  idCard: '',
  departmentId: undefined as number | undefined,
  pageNum: 1,
  pageSize: 20
})

const tableData = ref<HealthRecord[]>([])
const total = ref(0)
const currentId = ref<number | undefined>()
const dialogTitle = computed(() => currentId.value ? '编辑健康档案' : '新增健康档案')

const formData = reactive({
  userId: undefined as number | undefined,
  userName: '',
  idCard: '',
  departmentId: undefined as number | undefined,
  phone: '',
  age: 30,
  gender: 'MALE',
  position: '',
  workYears: 0,
  exposureFactors: [] as string[]
})

const formRules = {
  userName: [{ required: true, message: '请输入姓名', trigger: 'blur' }],
  idCard: [{ required: true, message: '请输入身份证号', trigger: 'blur' }],
  departmentId: [{ required: true, message: '请选择部门', trigger: 'change' }],
  position: [{ required: true, message: '请输入岗位', trigger: 'blur' }]
}

function getStatusName(status: string) {
  const map: Record<string, string> = {
    ACTIVE: '在档',
    CLOSED: '已关闭'
  }
  return map[status] || status
}

function getStatusType(status: string) {
  const map: Record<string, string> = {
    ACTIVE: 'success',
    CLOSED: 'info'
  }
  return map[status] || 'info'
}

function getResultType(result: string) {
  const map: Record<string, string> = {
    NORMAL: 'success',
    ABNORMAL: 'warning',
    '疑似职业病': 'danger'
  }
  return map[result] || 'info'
}

async function fetchData() {
  loading.value = true
  try {
    const res = await healthApi.listRecords({
      page: queryForm.pageNum,
      page_size: queryForm.pageSize,
      keyword: queryForm.userName || undefined
    })
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
  Object.assign(queryForm, { userName: '', idCard: '', departmentId: undefined, pageNum: 1 })
  fetchData()
}

function handleRefresh() {
  fetchData()
}

function handleAdd() {
  currentId.value = undefined
  Object.assign(formData, {
    userId: undefined,
    userName: '',
    idCard: '',
    departmentId: undefined,
    phone: '',
    age: 30,
    gender: 'MALE',
    position: '',
    workYears: 0,
    exposureFactors: []
  })
  dialogVisible.value = true
}

function handleView(row: HealthRecord) {
  currentId.value = row.id
  dialogVisible.value = true
}

function handleEdit(row: HealthRecord) {
  currentId.value = row.id
  Object.assign(formData, {
    userId: row.userId,
    userName: row.userName,
    idCard: row.idCard,
    departmentId: row.departmentId,
    phone: row.phone,
    age: row.age,
    gender: row.gender,
    position: row.position,
    workYears: row.workYears,
    exposureFactors: row.exposureFactors || []
  })
  dialogVisible.value = true
}

async function handleDelete(row: HealthRecord) {
  await ElMessageBox.confirm(`确定要删除健康档案"${row.userName}"吗？`, '提示', { type: 'warning' })
  await healthApi.deleteRecord(row.id)
  ElMessage.success('删除成功')
  fetchData()
}

async function handleSubmit() {
  if (!formRef.value) return
  await formRef.value.validate(async (valid) => {
    if (valid) {
      submitLoading.value = true
      try {
        if (currentId.value) {
          await healthApi.updateRecord(currentId.value, formData)
        } else {
          await healthApi.createRecord(formData)
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
  })
}

function handleSizeChange() {
  fetchData()
}

function handlePageChange() {
  fetchData()
}

onMounted(() => {
  fetchData()
})
</script>

<style lang="scss" scoped>
.records-page {
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