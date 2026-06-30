<template>
  <div class="ai-conversations">
    <div class="page-header">
      <h2>AI 会话历史</h2>
      <el-button :icon="Refresh" @click="loadConversations">刷新</el-button>
    </div>

    <el-row :gutter="16">
      <el-col :span="8">
        <el-card class="left-panel">
          <template #header><span>会话列表 ({{ pagination.total }})</span></template>
          <div v-loading="loading">
            <div
              v-for="c in conversations"
              :key="c.conversationId"
              class="conv-item"
              :class="{ active: selected?.conversationId === c.conversationId }"
              @click="selectConversation(c)"
            >
              <div class="conv-title">{{ c.title || "未命名会话" }}</div>
              <div class="conv-meta">
                <span>{{ formatDateTime(c.createdAt) }}</span>
                <el-tag size="small" type="info">{{ c.messageCount || 0 }}条</el-tag>
              </div>
            </div>
            <el-empty v-if="!loading && !conversations.length" description="暂无会话" />
          </div>
          <el-pagination
            v-if="pagination.total > pagination.pageSize"
            v-model:current-page="pagination.page"
            :page-size="pagination.pageSize"
            :total="pagination.total"
            small
            layout="prev, pager, next"
            @current-change="loadConversations"
            style="margin-top: 12px; justify-content: center;"
          />
        </el-card>
      </el-col>
      <el-col :span="16">
        <el-card class="right-panel">
          <template #header>
            <div class="panel-header">
              <span>{{ selected?.title || "请选择会话" }}</span>
              <el-button v-if="selected" size="small" type="danger" :icon="Delete" @click="deleteConversation(selected)">删除会话</el-button>
            </div>
          </template>
          <div v-if="selected" class="msg-list" v-loading="detailLoading">
            <div v-for="(m, idx) in messages" :key="idx" class="msg-item" :class="m.role">
              <div class="msg-role">{{ m.role === "user" ? "用户" : "AI" }}</div>
              <div class="msg-content">{{ m.content }}</div>
              <div class="msg-time">{{ formatDateTime(m.createdAt) }}</div>
            </div>
            <el-empty v-if="!detailLoading && !messages.length" description="该会话暂无消息" />
          </div>
          <el-empty v-else description="请从左侧选择会话" />
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from "vue"
import { Refresh, Delete } from "@element-plus/icons-vue"
import { ElMessage, ElMessageBox } from "element-plus"
import { aiApi } from "@/api/modules/ai"

const conversations = ref<any[]>([])
const messages = ref<any[]>([])
const selected = ref<any>(null)
const loading = ref(false)
const detailLoading = ref(false)
const pagination = reactive({ page: 1, pageSize: 20, total: 0 })

const formatDateTime = (s?: string) => (s ? s.replace("T", " ").substring(0, 16) : "-")

const loadConversations = async () => {
  loading.value = true
  try {
    const res: any = await aiApi.listConversations({ pageNum: pagination.page, pageSize: pagination.pageSize } as any)
    conversations.value = res.data?.items || res.data?.list || []
    pagination.total = res.data?.total || 0
  } catch (e: any) {
    ElMessage.error("加载会话失败: " + (e?.message || e))
    conversations.value = []
  } finally {
    loading.value = false
  }
}

const selectConversation = async (c: any) => {
  selected.value = c
  detailLoading.value = true
  try {
    const res: any = await aiApi.getConversation(c.conversationId)
    messages.value = res.data?.messages || res.data || []
  } catch (e: any) {
    ElMessage.error("加载消息失败: " + (e?.message || e))
    messages.value = []
  } finally {
    detailLoading.value = false
  }
}

const deleteConversation = async (c: any) => {
  try {
    await ElMessageBox.confirm("确定删除该会话吗？", "删除确认", { type: "warning" })
    await aiApi.deleteConversation(c.conversationId)
    ElMessage.success("删除成功")
    selected.value = null
    messages.value = []
    loadConversations()
  } catch (e: any) {
    if (e === "cancel") return
    ElMessage.error("删除失败: " + (e?.message || e))
  }
}

onMounted(() => loadConversations())
</script>

<style scoped>
.ai-conversations { padding: 16px; }
.page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
.page-header h2 { margin: 0; font-size: 20px; }
.left-panel :deep(.el-card__body) { max-height: 600px; overflow-y: auto; }
.right-panel :deep(.el-card__body) { max-height: 600px; overflow-y: auto; }
.conv-item { padding: 12px; border-radius: 6px; cursor: pointer; margin-bottom: 8px; border: 1px solid #ebeef5; transition: all 0.2s; }
.conv-item:hover { background: #f5f7fa; }
.conv-item.active { background: #ecf5ff; border-color: #409eff; }
.conv-title { font-weight: 500; margin-bottom: 4px; }
.conv-meta { display: flex; justify-content: space-between; align-items: center; color: #909399; font-size: 12px; }
.panel-header { display: flex; justify-content: space-between; align-items: center; }
.msg-list { display: flex; flex-direction: column; gap: 12px; }
.msg-item { padding: 12px 16px; border-radius: 8px; }
.msg-item.user { background: #f5f7fa; align-self: flex-end; max-width: 80%; }
.msg-item.assistant { background: #ecf5ff; align-self: flex-start; max-width: 80%; }
.msg-role { font-weight: 600; font-size: 12px; color: #909399; margin-bottom: 4px; }
.msg-content { color: #303133; white-space: pre-wrap; word-break: break-word; }
.msg-time { color: #909399; font-size: 11px; margin-top: 6px; text-align: right; }
</style>
