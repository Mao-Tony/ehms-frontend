<template>
  <div class="dept-management">
    <el-card>
      <div class="toolbar">
        <div class="left">
          <el-button type="primary" @click="handleAdd">
            <el-icon><Plus /></el-icon>新增部门
          </el-button>
        </div>
      </div>

      <el-row :gutter="20">
        <el-col :span="8">
          <div class="tree-wrapper">
            <el-tree
              ref="treeRef"
              :data="treeData"
              node-key="id"
              :props="{ children: 'children', label: 'name' }"
              :expand-on-click-node="false"
              default-expand-all
              highlight-current
              @node-click="handleNodeClick"
            >
              <template #default="{ node, data }">
                <span class="custom-tree-node">
                  <span>{{ data.name }}</span>
                  <span class="actions">
                    <el-button type="primary" link size="small" @click.stop="handleEdit(data)">编辑</el-button>
                    <el-button type="danger" link size="small" @click.stop="handleDelete(data)">删除</el-button>
                  </span>
                </span>
              </template>
            </el-tree>
          </div>
        </el-col>
        <el-col :span="16">
          <el-empty v-if="!selectedDept" description="请选择一个部门" />
          <div v-else class="dept-detail">
            <h4>部门详情</h4>
            <el-descriptions :column="2" border>
              <el-descriptions-item label="部门名称">{{ selectedDept.name }}</el-descriptions-item>
              <el-descriptions-item label="部门编码">{{ selectedDept.code }}</el-descriptions-item>
              <el-descriptions-item label="负责人">{{ selectedDept.leaderName || '-' }}</el-descriptions-item>
              <el-descriptions-item label="联系电话">{{ selectedDept.phone || '-' }}</el-descriptions-item>
              <el-descriptions-item label="排序号">{{ selectedDept.orderNum }}</el-descriptions-item>
              <el-descriptions-item label="状态">
                <el-tag :type="selectedDept.status === 1 ? 'success' : 'danger'">
                  {{ selectedDept.status === 1 ? '启用' : '停用' }}
                </el-tag>
              </el-descriptions-item>
            </el-descriptions>
          </div>
        </el-col>
      </el-row>
    </el-card>

    <el-dialog v-model="dialogVisible" :title="dialogTitle" width="500px" destroy-on-close>
      <el-form ref="formRef" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="上级部门">
          <el-tree-select
            v-model="form.parentId"
            :data="treeData"
            :props="{ label: 'name', value: 'id' }"
            placeholder="请选择上级部门"
            clearable
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="部门名称" prop="name">
          <el-input v-model="form.name" placeholder="请输入部门名称" />
        </el-form-item>
        <el-form-item label="部门编码" prop="code">
          <el-input v-model="form.code" placeholder="请输入部门编码" />
        </el-form-item>
        <el-form-item label="负责人">
          <el-input v-model="form.leaderName" placeholder="请输入负责人" />
        </el-form-item>
        <el-form-item label="联系电话">
          <el-input v-model="form.phone" placeholder="请输入联系电话" />
        </el-form-item>
        <el-form-item label="排序" prop="orderNum">
          <el-input-number v-model="form.orderNum" :min="0" :max="999" />
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
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'
import { systemApi, type Department } from '@/api/modules/system'

const loading = ref(false)
const dialogVisible = ref(false)
const submitLoading = ref(false)
const treeRef = ref()
const formRef = ref()

const treeData = ref<Department[]>([])
const selectedDept = ref<Department | null>(null)
const currentId = ref<number | undefined>()
const dialogTitle = computed(() => currentId.value ? '编辑部门' : '新增部门')

const form = reactive({
  parentId: undefined as number | undefined,
  name: '',
  code: '',
  leaderName: '',
  phone: '',
  orderNum: 0,
  status: 1 as 0 | 1
})

const rules = {
  name: [{ required: true, message: '请输入部门名称', trigger: 'blur' }],
  code: [{ required: true, message: '请输入部门编码', trigger: 'blur' }]
}

async function fetchData() {
  loading.value = true
  try {
    const res = await systemApi.getDepartments()
    treeData.value = res.data
  } catch (error) {
    console.error(error)
  } finally {
    loading.value = false
  }
}

function handleNodeClick(data: Department) {
  selectedDept.value = data
}

function handleAdd() {
  currentId.value = undefined
  Object.assign(form, { parentId: undefined, name: '', code: '', leaderName: '', phone: '', orderNum: 0, status: 1 })
  dialogVisible.value = true
}

function handleEdit(data: Department) {
  currentId.value = data.id
  Object.assign(form, {
    parentId: data.parentId,
    name: data.name,
    code: '',
    leaderName: data.leaderName,
    phone: data.phone,
    orderNum: data.orderNum,
    status: data.status
  })
  dialogVisible.value = true
}

async function handleDelete(data: Department) {
  await ElMessageBox.confirm(`确定要删除部门"${data.name}"吗？`, '提示', { type: 'warning' })
  await systemApi.deleteDepartment(data.id)
  ElMessage.success('删除成功')
  fetchData()
}

async function handleSubmit() {
  const valid = await formRef.value.validate().catch(() => false)
  if (!valid) return

  submitLoading.value = true
  try {
    if (currentId.value) {
      await systemApi.updateDepartment(currentId.value, form)
    } else {
      await systemApi.createDepartment(form)
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

onMounted(() => { fetchData() })
</script>

<style lang="scss" scoped>
.dept-management {
  .tree-wrapper {
    padding: 16px;
    border: 1px solid #E5E7EB;
    border-radius: 8px;
    min-height: 400px;

    .custom-tree-node {
      display: flex;
      justify-content: space-between;
      width: 100%;
      padding-right: 8px;

      .actions {
        display: none;
      }

      &:hover .actions {
        display: block;
      }
    }
  }

  .dept-detail {
    padding: 16px;

    h4 {
      margin: 0 0 16px;
      color: #1F2937;
    }
  }
}
</style>
