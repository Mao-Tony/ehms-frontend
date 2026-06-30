<template>
  <div class="ppe-container">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>劳保用品（PPE）</span>
          <el-button type="primary" @click="handleAdd">新增物品</el-button>
        </div>
      </template>

      <el-form :inline="true" :model="queryForm" class="search-form">
        <el-form-item label="物品类型">
          <el-select v-model="queryForm.ppeType" placeholder="请选择" clearable style="width: 160px">
            <el-option v-for="(label, k) in typeMap" :key="k" :label="label" :value="k" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">搜索</el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>

      <el-table v-loading="loading" :data="tableData" border>
        <el-table-column prop="ppeCode" label="物品编码" width="140" />
        <el-table-column prop="ppeName" label="物品名称" min-width="180" show-overflow-tooltip />
        <el-table-column label="类型" width="120">
          <template #default="{ row }">{{ typeMap[row.ppeType] || row.ppeType || '-' }}</template>
        </el-table-column>
        <el-table-column prop="specModel" label="规格型号" width="140" show-overflow-tooltip />
        <el-table-column prop="standard" label="执行标准" width="140" show-overflow-tooltip />
        <el-table-column prop="shelfLife" label="有效期(月)" width="100" />
        <el-table-column prop="defaultQuantity" label="标配数量" width="100" />
        <el-table-column prop="maxQuantity" label="最大数量" width="100" />
        <el-table-column prop="replaceCycle" label="更换周期" width="100" />
        <el-table-column label="操作" width="180" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link @click="handleEdit(row)">编辑</el-button>
            <el-button type="danger" link @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <div class="pagination">
        <el-pagination
          v-model:current-page="queryForm.page"
          v-model:page-size="queryForm.pageSize"
          :total="total"
          :page-sizes="[10, 20, 50]"
          layout="total, sizes, prev, pager, next"
          @current-change="handlePageChange"
          @size-change="handlePageChange"
        />
      </div>
    </el-card>

    <el-dialog v-model="dialogVisible" :title="formTitle" width="700px">
      <el-form ref="formRef" :model="formData" :rules="rules" label-width="120px">
        <el-row :gutter="16">
          <el-col :span="12">
            <el-form-item label="物品编码" prop="ppeCode">
              <el-input v-model="formData.ppeCode" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="物品名称" prop="ppeName">
              <el-input v-model="formData.ppeName" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="物品类型">
              <el-select v-model="formData.ppeType" placeholder="请选择" style="width: 100%">
                <el-option v-for="(label, k) in typeMap" :key="k" :label="label" :value="k" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="规格型号">
              <el-input v-model="formData.specModel" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="执行标准">
              <el-input v-model="formData.standard" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="有效期(月)">
              <el-input v-model="formData.shelfLife" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="标配数量">
              <el-input-number v-model="formData.defaultQuantity" :min="0" style="width: 100%" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="最大数量">
              <el-input-number v-model="formData.maxQuantity" :min="0" style="width: 100%" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="更换周期">
              <el-input v-model="formData.replaceCycle" placeholder="如：6/12/24" />
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="saving" @click="handleSubmit">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import { ElMessage, ElMessageBox, FormInstance, FormRules } from 'element-plus'
import { equipmentApi, type PpeItemForm } from '@/api/modules/equipment'

const loading = ref(false)
const saving = ref(false)
const tableData = ref<any[]>([])
const total = ref(0)
const dialogVisible = ref(false)
const formTitle = ref('新增物品')
const formRef = ref<FormInstance>()

const queryForm = reactive({ ppeType: '', page: 1, pageSize: 20 })

const formData = reactive<PpeItemForm>({
  ppeCode: '',
  ppeName: '',
  ppeType: '',
  specModel: '',
  standard: '',
  shelfLife: '',
  defaultQuantity: 0,
  maxQuantity: 0,
  replaceCycle: ''
})

const rules: FormRules = {
  ppeCode: [{ required: true, message: '请输入物品编码', trigger: 'blur' }],
  ppeName: [{ required: true, message: '请输入物品名称', trigger: 'blur' }]
}

const typeMap: Record<string, string> = {
  head: '头部防护',
  eye: '眼面部防护',
  hearing: '听力防护',
  respiratory: '呼吸防护',
  hand: '手部防护',
  foot: '足部防护',
  body: '身体防护',
  fall: '坠落防护'
}

async function fetchData() {
  loading.value = true
  try {
    const res: any = await equipmentApi.listPpeItems({
      ppeType: queryForm.ppeType || undefined,
      page: queryForm.page,
      pageSize: queryForm.pageSize
    })
    tableData.value = res.data?.items || res.data?.list || []
    total.value = res.data?.total || 0
  } catch (e) {
    console.error(e)
  } finally {
    loading.value = false
  }
}

function handleSearch() { queryForm.page = 1; fetchData() }
function handleReset() {
  Object.assign(queryForm, { ppeType: '', page: 1 })
  fetchData()
}
function handlePageChange() { fetchData() }

function resetForm() {
  Object.assign(formData, {
    ppeId: undefined,
    ppeCode: '',
    ppeName: '',
    ppeType: '',
    specModel: '',
    standard: '',
    shelfLife: '',
    defaultQuantity: 0,
    maxQuantity: 0,
    replaceCycle: ''
  })
}

function handleAdd() {
  resetForm()
  formTitle.value = '新增物品'
  dialogVisible.value = true
}

function handleEdit(row: any) {
  resetForm()
  Object.assign(formData, row)
  formTitle.value = '编辑物品'
  dialogVisible.value = true
}

async function handleSubmit() {
  if (!formRef.value) return
  const valid = await formRef.value.validate().catch(() => false)
  if (!valid) return
  saving.value = true
  try {
    if ((formData as any).ppeId) {
      await equipmentApi.updatePpeItem((formData as any).ppeId, formData)
      ElMessage.success('更新成功')
    } else {
      await equipmentApi.createPpeItem(formData)
      ElMessage.success('新增成功')
    }
    dialogVisible.value = false
    fetchData()
  } catch (e) {
    console.error(e)
  } finally {
    saving.value = false
  }
}

async function handleDelete(row: any) {
  try {
    await ElMessageBox.confirm(`确定删除物品「${row.ppeName}」吗？`, '提示', { type: 'warning' })
    await equipmentApi.deletePpeItem(row.ppeId)
    ElMessage.success('删除成功')
    fetchData()
  } catch (_) {}
}

onMounted(fetchData)
</script>

<style scoped>
.ppe-container { padding: 16px; }
.card-header { display: flex; justify-content: space-between; align-items: center; }
.search-form { margin-bottom: 16px; }
.pagination { margin-top: 16px; display: flex; justify-content: flex-end; }
</style>
