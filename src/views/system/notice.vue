<template>
  <div class="page-container">
    <el-card class="search-card">
      <el-form :model="queryForm" inline>
        <el-form-item label="关键词">
          <el-input v-model="queryForm.keyword" placeholder="通知标题" clearable style="width: 200px" />
        </el-form-item>
        <el-form-item label="通知类型">
          <el-select v-model="queryForm.noticeType" placeholder="请选择" clearable style="width: 150px">
            <el-option label="系统通知" value="SYSTEM" />
            <el-option label="安全公告" value="SAFETY" />
            <el-option label="培训通知" value="TRAINING" />
            <el-option label="活动通知" value="ACTIVITY" />
          </el-select>
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="queryForm.status" placeholder="请选择" clearable style="width: 120px">
            <el-option label="草稿" value="0" />
            <el-option label="已发布" value="1" />
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
          <el-icon><Plus /></el-icon> 发布通知
        </el-button>
      </div>

      <el-table :data="tableData" v-loading="loading" stripe>
        <el-table-column prop="noticeId" label="ID" width="80" />
        <el-table-column prop="noticeTitle" label="通知标题" min-width="200" show-overflow-tooltip />
        <el-table-column prop="noticeType" label="类型" width="120">
          <template #default="{ row }">
            <el-tag :type="typeMap[row.noticeType] || 'info'" size="small">
              {{ typeLabel[row.noticeType] || row.noticeType }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="targetType" label="范围" width="100">
          <template #default="{ row }">
            {{ targetLabel[row.targetType] || row.targetType }}
          </template>
        </el-table-column>
        <el-table-column prop="createBy" label="发布人" width="100" />
        <el-table-column prop="createTime" label="发布时间" width="180" />
        <el-table-column prop="status" label="状态" width="90">
          <template #default="{ row }">
            <el-tag :type="row.status === 1 ? 'success' : 'info'" size="small">
              {{ row.status === 1 ? '已发布' : '草稿' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="160" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link size="small" @click="handleView(row)">查看</el-button>
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

    <!-- 新增/编辑弹窗 -->
    <el-dialog v-model="dialogVisible" :title="dialogTitle" width="600px" destroy-on-close>
      <el-form ref="formRef" :model="formData" :rules="formRules" label-width="100px">
        <el-form-item label="通知标题" prop="noticeTitle">
          <el-input v-model="formData.noticeTitle" placeholder="请输入通知标题" maxlength="200" />
        </el-form-item>
        <el-form-item label="通知类型" prop="noticeType">
          <el-select v-model="formData.noticeType" placeholder="请选择" style="width: 100%">
            <el-option label="系统通知" value="SYSTEM" />
            <el-option label="安全公告" value="SAFETY" />
            <el-option label="培训通知" value="TRAINING" />
            <el-option label="活动通知" value="ACTIVITY" />
          </el-select>
        </el-form-item>
        <el-form-item label="通知范围" prop="targetType">
          <el-select v-model="formData.targetType" placeholder="请选择" style="width: 100%">
            <el-option label="全部" value="ALL" />
            <el-option label="指定部门" value="DEPT" />
            <el-option label="指定角色" value="ROLE" />
          </el-select>
        </el-form-item>
        <el-form-item label="通知内容" prop="content">
          <el-input v-model="formData.content" type="textarea" :rows="5" placeholder="请输入通知内容" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit">确定</el-button>
      </template>
    </el-dialog>

    <!-- 查看详情 -->
    <el-dialog v-model="viewVisible" title="通知详情" width="600px">
      <el-descriptions :column="1" border>
        <el-descriptions-item label="通知标题">{{ viewData.noticeTitle }}</el-descriptions-item>
        <el-descriptions-item label="通知类型">{{ typeLabel[viewData.noticeType] }}</el-descriptions-item>
        <el-descriptions-item label="发布范围">{{ targetLabel[viewData.targetType] }}</el-descriptions-item>
        <el-descriptions-item label="发布人">{{ viewData.createBy }}</el-descriptions-item>
        <el-descriptions-item label="发布时间">{{ viewData.createTime }}</el-descriptions-item>
        <el-descriptions-item label="通知内容">{{ viewData.content }}</el-descriptions-item>
      </el-descriptions>
      <template #footer>
        <el-button @click="viewVisible = false">关闭</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts" name="SystemNotice">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'
import { request } from '@/api/request'

const loading = ref(false)
const tableData = ref<any[]>([])
const dialogVisible = ref(false)
const viewVisible = ref(false)
const dialogTitle = ref('发布通知')
const formRef = ref()

const pagination = reactive({ pageNum: 1, pageSize: 20, total: 0 })
const queryForm = reactive({ keyword: '', noticeType: '', status: '' })
const formData = reactive({ noticeId: null as number | null, noticeTitle: '', noticeType: '', targetType: 'ALL', content: '' })
const viewData = ref<any>({})

const typeMap: Record<string, string> = { SYSTEM: 'default', SAFETY: 'danger', TRAINING: 'success', ACTIVITY: 'warning' }
const typeLabel: Record<string, string> = { SYSTEM: '系统通知', SAFETY: '安全公告', TRAINING: '培训通知', ACTIVITY: '活动通知' }
const targetLabel: Record<string, string> = { ALL: '全部', DEPT: '指定部门', ROLE: '指定角色' }

const formRules = {
  noticeTitle: [{ required: true, message: '请输入通知标题', trigger: 'blur' }],
  noticeType: [{ required: true, message: '请选择通知类型', trigger: 'change' }]
}

async function loadData() {
  loading.value = true
  try {
    const res: any = await request({ method: 'GET', url: '/system/notices', params: { page: pagination.pageNum, page_size: pagination.pageSize, keyword: queryForm.keyword, notice_type: queryForm.noticeType } })
    tableData.value = res.data?.list || []
    pagination.total = res.data?.pageInfo?.total || 0
  } finally {
    loading.value = false
  }
}

function handleSearch() { pagination.pageNum = 1; loadData() }
function handleReset() { Object.assign(queryForm, { keyword: '', noticeType: '', status: '' }); handleSearch() }

function handleAdd() {
  dialogTitle.value = '发布通知'
  Object.assign(formData, { noticeId: null, noticeTitle: '', noticeType: 'SYSTEM', targetType: 'ALL', content: '' })
  dialogVisible.value = true
}
function handleEdit(row: any) {
  dialogTitle.value = '编辑通知'
  Object.assign(formData, { noticeId: row.noticeId, noticeTitle: row.noticeTitle, noticeType: row.noticeType, targetType: row.targetType, content: row.content })
  dialogVisible.value = true
}
function handleView(row: any) { viewData.value = row; viewVisible.value = true }

async function handleDelete(row: any) {
  await ElMessageBox.confirm(`确定删除通知「${row.noticeTitle}」吗？`, '提示')
  await request({ method: 'DELETE', url: `/system/notices/${row.noticeId}` })
  ElMessage.success('删除成功')
  loadData()
}

async function handleSubmit() {
  await (formRef.value as any).validate()
  if (formData.noticeId) {
    await request({ method: 'PUT', url: `/system/notices/${formData.noticeId}`, data: formData })
    ElMessage.success('修改成功')
  } else {
    await request({ method: 'POST', url: '/system/notices', data: formData })
    ElMessage.success('发布成功')
  }
  dialogVisible.value = false
  loadData()
}

onMounted(() => loadData())
</script>

<style lang="scss" scoped>
.page-container { }
.toolbar { margin-bottom: 16px; }
.pagination { margin-top: 16px; justify-content: flex-end; }
</style>
