<template>
  <div class="page-container">
    <el-card class="info-card" shadow="never">
      <template #header>
        <div class="card-header">
          <span><el-icon><ChatLineRound /></el-icon> 飞书集成</span>
          <el-tag type="success" v-if="bindStatus.bound">已绑定</el-tag>
          <el-tag type="info" v-else>未绑定</el-tag>
        </div>
      </template>
      <el-descriptions :column="2" border>
        <el-descriptions-item label="绑定状态">
          {{ bindStatus.bound ? '已绑定' : '未绑定' }}
        </el-descriptions-item>
        <el-descriptions-item label="飞书 OpenID">
          {{ bindStatus.openId || '-' }}
        </el-descriptions-item>
        <el-descriptions-item label="飞书 UnionID">
          {{ bindStatus.unionId || '-' }}
        </el-descriptions-item>
        <el-descriptions-item label="绑定时间">
          {{ bindStatus.bindTime || '-' }}
        </el-descriptions-item>
      </el-descriptions>
      <div class="action-row">
        <el-button type="primary" v-if="!bindStatus.bound" @click="handleBind">
          <el-icon><Link /></el-icon> 绑定飞书账号
        </el-button>
        <el-button type="danger" v-else @click="handleUnbind">
          <el-icon><Close /></el-icon> 解除绑定
        </el-button>
      </div>
    </el-card>

    <el-card class="sync-card" shadow="never">
      <template #header>
        <span><el-icon><Refresh /></el-icon> 通讯录同步</span>
      </template>
      <el-row :gutter="16">
        <el-col :span="6">
          <el-statistic title="累计同步用户" :value="syncResult.totalCount" />
        </el-col>
        <el-col :span="6">
          <el-statistic title="本次成功" :value="syncResult.syncedCount" />
        </el-col>
        <el-col :span="6">
          <el-statistic title="本次失败" :value="syncResult.failedCount" />
        </el-col>
        <el-col :span="6">
          <div class="sync-action">
            <el-button type="primary" :loading="syncing" @click="handleSyncUsers">
              <el-icon><Refresh /></el-icon> 立即同步
            </el-button>
          </div>
        </el-col>
      </el-row>
      <div class="hint">
        从飞书拉取最新组织架构与用户信息，更新本地用户表与部门表
      </div>
    </el-card>

    <el-card class="push-card" shadow="never">
      <template #header>
        <span><el-icon><Bell /></el-icon> 推送测试</span>
      </template>
      <el-tabs v-model="activeTab">
        <el-tab-pane label="日历推送" name="calendar">
          <el-form :model="calendarForm" label-width="100px">
            <el-form-item label="日程标题">
              <el-input v-model="calendarForm.title" placeholder="如：作业票审批会议" />
            </el-form-item>
            <el-form-item label="开始时间">
              <el-date-picker
                v-model="calendarForm.startTime"
                type="datetime"
                placeholder="选择开始时间"
                value-format="YYYY-MM-DDTHH:mm:ss"
              />
            </el-form-item>
            <el-form-item label="结束时间">
              <el-date-picker
                v-model="calendarForm.endTime"
                type="datetime"
                placeholder="选择结束时间"
                value-format="YYYY-MM-DDTHH:mm:ss"
              />
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="handlePushCalendar">推送到飞书日历</el-button>
            </el-form-item>
          </el-form>
        </el-tab-pane>
        <el-tab-pane label="审批推送" name="approval">
          <el-form :model="approvalForm" label-width="100px">
            <el-form-item label="审批名称">
              <el-input v-model="approvalForm.approvalName" placeholder="如：作业票审批" />
            </el-form-item>
            <el-form-item label="审批内容">
              <el-input
                v-model="approvalContent"
                type="textarea"
                :rows="3"
                placeholder="一行一个 key=value，如：work_no=W001"
              />
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="handlePushApproval">推送到飞书审批</el-button>
            </el-form-item>
          </el-form>
        </el-tab-pane>
      </el-tabs>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { ChatLineRound, Link, Close, Refresh, Bell } from '@element-plus/icons-vue'
import { feishuApi } from '@/api/modules/feishu'
import { authApi } from '@/api/modules/auth'

const bindStatus = reactive({
  bound: false,
  openId: '',
  unionId: '',
  bindTime: ''
})

const syncing = ref(false)
const syncResult = reactive({
  totalCount: 0,
  syncedCount: 0,
  failedCount: 0
})

const activeTab = ref('calendar')

const calendarForm = reactive({
  title: '',
  startTime: '',
  endTime: ''
})

const approvalForm = reactive({
  approvalName: ''
})
const approvalContent = ref('')

const loadBindStatus = async () => {
  try {
    const res: any = await authApi.getCurrentUser()
    const user = res.data || {}
    bindStatus.bound = !!(user.feishuOpenId || user.openId)
    bindStatus.openId = user.feishuOpenId || user.openId || ''
    bindStatus.unionId = user.feishuUnionId || user.unionId || ''
    bindStatus.bindTime = user.feishuBindTime || ''
  } catch (e) {
    // 接口可能未实现 user 字段，安静忽略
  }
}

const handleBind = async () => {
  try {
    const { value: code } = await ElMessageBox.prompt(
      '请输入飞书授权 code（从飞书 OAuth 回调获取）',
      '绑定飞书',
      { confirmButtonText: '确认绑定', cancelButtonText: '取消' }
    )
    if (!code) return
    await authApi.bindFeishu({ code })
    ElMessage.success('绑定成功')
    loadBindStatus()
  } catch (e: any) {
    if (e !== 'cancel') ElMessage.error('绑定失败')
  }
}

const handleUnbind = async () => {
  try {
    await ElMessageBox.confirm('确定解除当前账号与飞书的绑定吗？', '提示', { type: 'warning' })
    await authApi.unbindFeishu()
    ElMessage.success('已解绑')
    loadBindStatus()
  } catch (e) {
    // cancel
  }
}

const handleSyncUsers = async () => {
  syncing.value = true
  try {
    const res: any = await feishuApi.syncUsers()
    const data = res.data || {}
    syncResult.syncedCount = data.syncedCount || 0
    syncResult.failedCount = data.failedCount || 0
    syncResult.totalCount = data.totalCount || 0
    ElMessage.success(`同步完成：成功 ${syncResult.syncedCount} 条，失败 ${syncResult.failedCount} 条`)
  } catch (e) {
    ElMessage.error('同步失败')
  } finally {
    syncing.value = false
  }
}

const handlePushCalendar = async () => {
  if (!calendarForm.title || !calendarForm.startTime || !calendarForm.endTime) {
    ElMessage.warning('请填完整日程信息')
    return
  }
  try {
    await feishuApi.pushCalendar({
      title: calendarForm.title,
      startTime: calendarForm.startTime,
      endTime: calendarForm.endTime
    })
    ElMessage.success('已推送到飞书日历')
  } catch (e) {
    ElMessage.error('推送失败')
  }
}

const handlePushApproval = async () => {
  if (!approvalForm.approvalName) {
    ElMessage.warning('请填审批名称')
    return
  }
  const fields: Record<string, string> = {}
  approvalContent.value.split('\n').forEach(line => {
    const [k, v] = line.split('=')
    if (k && v !== undefined) fields[k.trim()] = v.trim()
  })
  try {
    await feishuApi.pushApproval({
      approvalName: approvalForm.approvalName,
      formFields: fields
    })
    ElMessage.success('已推送到飞书审批')
  } catch (e) {
    ElMessage.error('推送失败')
  }
}

onMounted(() => {
  loadBindStatus()
})
</script>

<style scoped>
.page-container {
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.info-card :deep(.el-card__header),
.sync-card :deep(.el-card__header),
.push-card :deep(.el-card__header) {
  font-weight: 600;
}
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.action-row {
  margin-top: 16px;
}
.sync-action {
  display: flex;
  align-items: center;
  height: 100%;
}
.hint {
  margin-top: 12px;
  color: #909399;
  font-size: 13px;
}
</style>
