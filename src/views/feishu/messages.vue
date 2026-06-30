<template>
  <div class="page-container">
    <el-card class="search-card">
      <el-form :model="queryForm" inline>
        <el-form-item label="关键词">
          <el-input v-model="queryForm.keyword" placeholder="消息内容/发送人" clearable style="width: 200px" />
        </el-form-item>
        <el-form-item label="消息类型">
          <el-select v-model="queryForm.msgType" placeholder="请选择" clearable style="width: 140px">
            <el-option label="文本" value="text" />
            <el-option label="富文本" value="post" />
            <el-option label="卡片" value="interactive" />
            <el-option label="图片" value="image" />
          </el-select>
        </el-form-item>
        <el-form-item label="日期">
          <el-date-picker
            v-model="dateRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            value-format="YYYY-MM-DD"
            style="width: 240px"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">查询</el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-row :gutter="16" class="action-row">
      <el-col :span="12">
        <el-card class="send-card" shadow="never">
          <template #header>
            <span><el-icon><Promotion /></el-icon> 发送消息</span>
          </template>
          <el-form :model="sendForm" label-width="100px">
            <el-form-item label="收件人 ID">
              <el-input v-model="sendForm.openId" placeholder="飞书 OpenID（或填 userId）" clearable />
            </el-form-item>
            <el-form-item label="UserID">
              <el-input v-model="sendForm.userId" placeholder="飞书 UserID（二选一）" clearable />
            </el-form-item>
            <el-form-item label="消息类型">
              <el-select v-model="sendForm.msgType" style="width: 100%">
                <el-option label="文本" value="text" />
                <el-option label="富文本" value="post" />
                <el-option label="卡片" value="interactive" />
              </el-select>
            </el-form-item>
            <el-form-item label="消息内容">
              <el-input v-model="sendForm.content" type="textarea" :rows="4" placeholder="文本或 JSON 内容" />
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="handleSend">发送</el-button>
              <el-button @click="resetSendForm">清空</el-button>
            </el-form-item>
          </el-form>
        </el-card>
      </el-col>
      <el-col :span="12">
        <el-card class="bot-card" shadow="never">
          <template #header>
            <span><el-icon><Setting /></el-icon> 机器人命令</span>
          </template>
          <el-form :model="botForm" label-width="100px">
            <el-form-item label="命令">
              <el-select v-model="botForm.command" style="width: 100%">
                <el-option label="/help 查看帮助" value="help" />
                <el-option label="/status 查询状态" value="status" />
                <el-option label="/notify 发送通知" value="notify" />
                <el-option label="/sync 触发同步" value="sync" />
              </el-select>
            </el-form-item>
            <el-form-item label="参数">
              <el-input
                v-model="botParams"
                type="textarea"
                :rows="6"
                placeholder="一行一个 key=value，可留空"
              />
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="handleSendBot">执行命令</el-button>
              <el-button @click="botResultText = ''">清空结果</el-button>
            </el-form-item>
            <el-form-item label="执行结果" v-if="botResultText">
              <pre class="bot-result">{{ botResultText }}</pre>
            </el-form-item>
          </el-form>
        </el-card>
      </el-col>
    </el-row>

    <el-card class="table-card">
      <div class="toolbar">
        <span class="title">消息日志</span>
      </div>
      <el-table :data="tableData" v-loading="loading" stripe>
        <el-table-column prop="messageId" label="消息 ID" width="220" show-overflow-tooltip />
        <el-table-column prop="msgType" label="类型" width="100">
          <template #default="{ row }">
            <el-tag size="small" :type="msgTypeMap[row.msgType] || 'info'">
              {{ msgTypeLabel[row.msgType] || row.msgType }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="senderName" label="发送人" width="120" />
        <el-table-column prop="receiverName" label="接收人" width="120" />
        <el-table-column prop="content" label="内容" min-width="240" show-overflow-tooltip />
        <el-table-column prop="createTime" label="时间" width="180" />
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

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { Promotion, Setting } from '@element-plus/icons-vue'
import { feishuApi, type FeishuMessage } from '@/api/modules/feishu'

const loading = ref(false)
const tableData = ref<FeishuMessage[]>([])
const dateRange = ref<string[]>([])

const queryForm = reactive({
  keyword: '',
  msgType: '',
  startDate: '',
  endDate: ''
})

const pagination = reactive({
  pageNum: 1,
  pageSize: 10,
  total: 0
})

const sendForm = reactive({
  openId: '',
  userId: '',
  msgType: 'text',
  content: ''
})

const botForm = reactive({
  command: 'help'
})
const botParams = ref('')
const botResultText = ref('')

const msgTypeLabel: Record<string, string> = {
  text: '文本',
  post: '富文本',
  interactive: '卡片',
  image: '图片'
}
const msgTypeMap: Record<string, string> = {
  text: '',
  post: 'success',
  interactive: 'warning',
  image: 'info'
}

const loadData = async () => {
  loading.value = true
  try {
    queryForm.startDate = dateRange.value?.[0] || ''
    queryForm.endDate = dateRange.value?.[1] || ''
    const res: any = await feishuApi.listMessages({
      ...queryForm,
      pageNum: pagination.pageNum,
      pageSize: pagination.pageSize
    })
    tableData.value = res.data?.items || res.data?.list || []
    pagination.total = res.data?.total || 0
  } catch (e) {
    ElMessage.error('加载消息列表失败')
    tableData.value = []
  } finally {
    loading.value = false
  }
}

const handleSearch = () => {
  pagination.pageNum = 1
  loadData()
}

const handleReset = () => {
  Object.assign(queryForm, { keyword: '', msgType: '', startDate: '', endDate: '' })
  dateRange.value = []
  pagination.pageNum = 1
  loadData()
}

const handleSend = async () => {
  if (!sendForm.openId && !sendForm.userId) {
    ElMessage.warning('请填 OpenID 或 UserID')
    return
  }
  if (!sendForm.content) {
    ElMessage.warning('请填消息内容')
    return
  }
  try {
    await feishuApi.sendMessage({
      openId: sendForm.openId || undefined,
      userId: sendForm.userId || undefined,
      msgType: sendForm.msgType,
      content: sendForm.content
    })
    ElMessage.success('已发送')
    loadData()
  } catch (e) {
    ElMessage.error('发送失败')
  }
}

const resetSendForm = () => {
  Object.assign(sendForm, { openId: '', userId: '', msgType: 'text', content: '' })
}

const handleSendBot = async () => {
  const params: Record<string, string> = {}
  botParams.value.split('\n').forEach(line => {
    const [k, v] = line.split('=')
    if (k && v !== undefined) params[k.trim()] = v.trim()
  })
  try {
    const res: any = await feishuApi.sendBotCommand({ command: botForm.command, params })
    botResultText.value = res.data?.result || JSON.stringify(res.data || {}, null, 2)
    ElMessage.success('命令已执行')
  } catch (e) {
    ElMessage.error('命令执行失败')
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
.search-card,
.send-card,
.bot-card,
.table-card {
  margin-bottom: 0;
}
.send-card :deep(.el-card__header),
.bot-card :deep(.el-card__header),
.search-card :deep(.el-card__header) {
  font-weight: 600;
}
.toolbar {
  margin-bottom: 12px;
  font-weight: 600;
}
.toolbar .title {
  font-size: 15px;
}
.action-row {
  margin: 0;
}
.bot-result {
  background: #f5f7fa;
  border-radius: 4px;
  padding: 8px 12px;
  font-size: 12px;
  white-space: pre-wrap;
  word-break: break-all;
  margin: 0;
}
.pagination {
  margin-top: 16px;
  justify-content: flex-end;
  display: flex;
}
</style>
