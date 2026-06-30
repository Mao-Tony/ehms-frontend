<template>
  <div class="page-container">
    <el-card class="search-card">
      <el-form :model="queryForm" inline>
        <el-form-item label="操作模块">
          <el-input v-model="queryForm.module" placeholder="请输入模块" clearable style="width: 160px" />
        </el-form-item>
        <el-form-item label="操作类型">
          <el-select v-model="queryForm.businessType" placeholder="请选择" clearable style="width: 140px">
            <el-option label="新增" value="INSERT" />
            <el-option label="修改" value="UPDATE" />
            <el-option label="删除" value="DELETE" />
            <el-option label="查询" value="SELECT" />
            <el-option label="导出" value="EXPORT" />
          </el-select>
        </el-form-item>
        <el-form-item label="请求方式">
          <el-select v-model="queryForm.requestMethod" placeholder="请选择" clearable style="width: 110px">
            <el-option label="GET" value="GET" />
            <el-option label="POST" value="POST" />
            <el-option label="PUT" value="PUT" />
            <el-option label="DELETE" value="DELETE" />
          </el-select>
        </el-form-item>
        <el-form-item label="操作状态">
          <el-select v-model="queryForm.status" placeholder="请选择" clearable style="width: 110px">
            <el-option label="成功" :value="1" />
            <el-option label="失败" :value="0" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">查询</el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card class="table-card">
      <el-table :data="tableData" v-loading="loading" stripe size="small">
        <el-table-column prop="logId" label="日志ID" width="90" />
        <el-table-column prop="userName" label="操作人" width="100" />
        <el-table-column prop="module" label="模块" width="120" />
        <el-table-column prop="businessType" label="操作类型" width="100">
          <template #default="{ row }">
            <el-tag size="small" :type="opTypeMap[row.businessType]">{{ row.businessType }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="requestMethod" label="方法" width="80">
          <template #default="{ row }">
            <el-tag size="small">{{ row.requestMethod }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="operationUrl" label="请求路径" min-width="180" show-overflow-tooltip />
        <el-table-column prop="operationDesc" label="操作描述" min-width="150" show-overflow-tooltip />
        <el-table-column prop="status" label="状态" width="80">
          <template #default="{ row }">
            <el-tag :type="row.status === 1 ? 'success' : 'danger'" size="small">
              {{ row.status === 1 ? '成功' : '失败' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="operationTime" label="操作时间" width="170" />
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
  </div>
</template>

<script setup lang="ts" name="SystemLog">
import { ref, reactive, onMounted } from 'vue'
import { request } from '@/api/request'

const loading = ref(false)
const tableData = ref<any[]>([])

const pagination = reactive({ pageNum: 1, pageSize: 20, total: 0 })
const queryForm = reactive({ module: '', businessType: '', requestMethod: '', status: undefined as number | undefined })

const opTypeMap: Record<string, string> = {
  INSERT: 'success', UPDATE: 'warning', DELETE: 'danger', SELECT: 'info', EXPORT: 'warning'
}

async function loadData() {
  loading.value = true
  try {
    const res: any = await request({
      method: 'GET', url: '/system/audit-logs',
      params: { page: pagination.pageNum, page_size: pagination.pageSize, ...queryForm }
    })
    tableData.value = res.data?.list || []
    pagination.total = res.data?.pageInfo?.total || 0
  } finally {
    loading.value = false
  }
}

function handleSearch() { pagination.pageNum = 1; loadData() }
function handleReset() {
  Object.assign(queryForm, { module: '', businessType: '', requestMethod: '', status: undefined })
  handleSearch()
}

onMounted(() => loadData())
</script>

<style lang="scss" scoped>
.pagination { margin-top: 16px; justify-content: flex-end; }
</style>
