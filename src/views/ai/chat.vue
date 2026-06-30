<template>
  <div class="ai-chat-page">
    <el-card class="chat-container">
      <template #header>
        <div class="chat-header">
          <span>🤖 AI 安全助手</span>
          <el-button text size="small" @click="clearHistory">清空对话</el-button>
        </div>
      </template>

      <div class="messages" ref="messagesRef">
        <div v-for="(msg, i) in messages" :key="i" :class="['message', msg.role]">
          <div class="avatar">
            {{ msg.role === 'user' ? '👤' : '🤖' }}
          </div>
          <div class="content">
            <div class="bubble" v-if="msg.role === 'assistant'">{{ msg.content }}</div>
            <div class="bubble user" v-else>{{ msg.content }}</div>
          </div>
        </div>
        <div v-if="loading" class="message assistant">
          <div class="avatar">🤖</div>
          <div class="content"><div class="bubble loading">思考中...</div></div>
        </div>
      </div>

      <div class="input-area">
        <el-input
          v-model="inputText"
          type="textarea"
          :rows="2"
          placeholder="请输入问题，如：如何编制高处作业安全措施？"
          resize="none"
          @keydown.enter.ctrl="handleSend"
        />
        <div class="actions">
          <span class="hint">Ctrl+Enter 发送</span>
          <el-button type="primary" :loading="loading" @click="handleSend">发送</el-button>
        </div>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts" name="AiChat">
import { ref, nextTick, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { aiApi } from '@/api/modules/ai'

interface Message { role: 'user' | 'assistant'; content: string }

const messages = ref<Message[]>([
  { role: 'assistant', content: '您好！我是 EHMS AI 安全助手，可以帮您解答安全管理、隐患排查、应急处置等问题。请问有什么可以帮您？' }
])
const inputText = ref('')
const loading = ref(false)
const messagesRef = ref<HTMLElement>()

function scrollToBottom() {
  nextTick(() => {
    if (messagesRef.value) {
      messagesRef.value.scrollTop = messagesRef.value.scrollHeight
    }
  })
}

async function handleSend() {
  const text = inputText.value.trim()
  if (!text) return
  if (loading.value) return

  messages.value.push({ role: 'user', content: text })
  inputText.value = ''
  scrollToBottom()

  loading.value = true
  try {
    const res: any = await aiApi.chat({ message: text, scene: 'safety_assistant' })
    const reply = res.data?.reply || res.data?.content || '抱歉，暂时无法回答该问题。'
    messages.value.push({ role: 'assistant', content: reply })
  } catch (err: any) {
    messages.value.push({ role: 'assistant', content: `请求失败：${err.message || '未知错误'}` })
  } finally {
    loading.value = false
    scrollToBottom()
  }
}

function clearHistory() {
  messages.value = [
    { role: 'assistant', content: '您好！我是 EHMS AI 安全助手，可以帮您解答安全管理、隐患排查、应急处置等问题。请问有什么可以帮您？' }
  ]
}
</script>

<style lang="scss" scoped>
.ai-chat-page {
  height: calc(100vh - 120px);
}

.chat-container {
  display: flex;
  flex-direction: column;
  height: 100%;

  :deep(.el-card__body) {
    display: flex;
    flex-direction: column;
    padding: 0;
    flex: 1;
    overflow: hidden;
  }
}

.chat-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-weight: 600;
  font-size: 16px;
}

.messages {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.message {
  display: flex;
  gap: 12px;
  align-items: flex-start;

  &.user { flex-direction: row-reverse; }

  .avatar { font-size: 24px; flex-shrink: 0; }

  .content { max-width: 70%; }

  .bubble {
    padding: 12px 16px;
    border-radius: 12px;
    line-height: 1.6;
    background: #f0f2f5;
    color: #1f2937;
    white-space: pre-wrap;

    &.user {
      background: #1890FF;
      color: white;
    }
  }
}

.input-area {
  padding: 16px 20px;
  border-top: 1px solid #eee;
  background: white;

  .actions {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    gap: 12px;
    margin-top: 8px;

    .hint { font-size: 12px; color: #999; }
  }
}
</style>
