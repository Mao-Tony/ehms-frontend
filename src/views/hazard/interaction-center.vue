<template>
  <div class="interaction-center">
    <el-card class="hero" shadow="never">
      <div class="hero-inner">
        <div>
          <h2><el-icon><ChatLineRound /></el-icon> 全员安全互动中心</h2>
          <p>
            模块九「全员安全互动与随手拍」功能图谱。
            <b>随手拍 + AI 识别</b> 已可直接使用；其他互动能力按模块编码标准归 HAZARD 子能力，将随后端补齐分批上线。
          </p>
        </div>
        <el-button type="primary" size="large" :icon="Camera" @click="goShoot">立即随手拍 →</el-button>
      </div>
    </el-card>

    <el-row :gutter="16" class="kpi-row">
      <el-col :span="6">
        <el-card shadow="hover" class="kpi"><div class="kpi-num">{{ kpi.totalCount }}</div><div class="kpi-label">本月随手拍上报</div></el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover" class="kpi"><div class="kpi-num">{{ kpi.pendingCount }}</div><div class="kpi-label">待处理</div></el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover" class="kpi"><div class="kpi-num">{{ kpi.closedCount }}</div><div class="kpi-label">已关闭</div></el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover" class="kpi"><div class="kpi-num">{{ kpi.overdueCount }}</div><div class="kpi-label">逾期</div></el-card>
      </el-col>
    </el-row>

    <el-card class="features" shadow="never">
      <template #header>
        <span>互动能力清单（F-CONT 系列）</span>
      </template>
      <el-table :data="features" stripe>
        <el-table-column prop="code" label="F编号" width="120" />
        <el-table-column prop="name" label="功能" width="180" />
        <el-table-column prop="priority" label="优先级" width="80">
          <template #default="{ row }">
            <el-tag :type="row.priority === 'P0' ? 'danger' : row.priority === 'P1' ? 'warning' : 'info'" size="small">{{ row.priority }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="desc" label="说明" />
        <el-table-column prop="status" label="启用状态" width="140">
          <template #default="{ row }">
            <el-tag :type="row.status === '可用' ? 'success' : row.status === '占位' ? 'info' : 'warning'" effect="plain">
              {{ row.status }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="120" fixed="right">
          <template #default="{ row }">
            <el-button v-if="row.action" type="primary" link size="small" @click="goAction(row.action)">前往</el-button>
            <span v-else style="color: #909399; font-size: 12px;">待开通</span>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <el-card class="footer-tip" shadow="never">
      <el-alert type="info" :closable="false">
        <template #title>
          编码说明：模块九归并入 HAZARD 子能力（参见《02_模块编码标准》第 72 行）。
          后续合理化建议 / 违章举报 / 安全月活动 / 知识竞赛 / 问卷投票 / 班组排名 / 积分商城 等模块上线时，将在本页面新增对应入口。
        </template>
      </el-alert>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ChatLineRound, Camera } from '@element-plus/icons-vue'
import { hazardApi } from '@/api/modules/hazard'

const router = useRouter()

const kpi = ref({
  totalCount: 0,
  pendingCount: 0,
  closedCount: 0,
  overdueCount: 0
})

const features = ref([
  { code: 'F-CONT-001', name: '移动端随手拍', priority: 'P0', desc: '拍照 + 文字描述 + GPS', status: '可用', action: '/hazard/shoot' },
  { code: 'F-CONT-002', name: '飞书随手拍机器人', priority: 'P0', desc: '飞书图片转后端 hazard 接口', status: '规划中', action: '' },
  { code: 'F-CONT-003', name: 'AI 隐患识别', priority: 'P0', desc: '隐患类型 + 等级 + 处置建议', status: '可用', action: '/hazard/shoot' },
  { code: 'F-CONT-004', name: '离线上传', priority: 'P1', desc: 'PWA 缓存，恢复后批量上报', status: '规划中', action: '' },
  { code: 'F-CONT-005', name: '一键拨打应急电话', priority: 'P0', desc: '应急联络人快捷拨号', status: '占位', action: '/emergency/list' },
  { code: 'F-CONT-006', name: '二维码扫描', priority: 'P0', desc: '扫设备 / 风险点 / 隐患码', status: '规划中', action: '' },
  { code: 'F-CONT-007', name: '合理化建议', priority: 'P0', desc: '建议提交 + 处理反馈', status: '规划中', action: '' },
  { code: 'F-CONT-008', name: '违章举报', priority: 'P0', desc: '举报违章 + 处理流转', status: '规划中', action: '' },
  { code: 'F-CONT-009', name: '违规违纪举报', priority: 'P0', desc: '匿名 / 实名通道', status: '规划中', action: '' },
  { code: 'F-CONT-010', name: '安全积分', priority: 'P0', desc: '有效上报积分奖励', status: '规划中', action: '' },
  { code: 'F-CONT-011', name: '积分商城', priority: 'P2', desc: 'V1.1 上线', status: '规划中', action: '' },
  { code: 'F-CONT-012', name: '安全月活动', priority: 'P1', desc: '主题活动 + 任务', status: '规划中', action: '' },
  { code: 'F-CONT-013', name: '安全知识竞赛', priority: 'P1', desc: '答题 + 排名', status: '规划中', action: '' },
  { code: 'F-CONT-014', name: '安全调研问卷', priority: 'P1', desc: '匿名问卷', status: '规划中', action: '' },
  { code: 'F-CONT-015', name: '投票', priority: 'P2', desc: '投票活动', status: '规划中', action: '' },
  { code: 'F-CONT-016', name: '班组 KPI 排名', priority: 'P1', desc: '班组安全得分排名', status: '占位', action: '/kpi/dashboard' }
])

function goShoot() {
  router.push('/hazard/shoot')
}
function goAction(path: string) {
  router.push(path)
}

async function loadKpi() {
  try {
    const res: any = await hazardApi.getStatistics()
    const d = res.data || {}
    kpi.value.totalCount = d.totalCount || d.total_count || 0
    kpi.value.pendingCount = d.pendingCount || d.pending_count || 0
    kpi.value.closedCount = d.closedCount || d.closed_count || 0
    kpi.value.overdueCount = d.overdueCount || d.overdue_count || 0
  } catch (e) {
    // 容错
  }
}

onMounted(() => {
  loadKpi()
})
</script>

<style scoped>
.interaction-center { padding: 16px; }
.hero { margin-bottom: 16px; background: linear-gradient(120deg, #36b37e 0%, #409eff 100%); color: #fff; }
.hero :deep(.el-card__body) { padding: 18px 22px; }
.hero-inner { display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 12px; }
.hero h2 { margin: 0 0 4px; color: #fff; display: flex; align-items: center; gap: 6px; }
.hero p { margin: 0; color: rgba(255,255,255,0.88); max-width: 720px; font-size: 13px; }
.kpi-row { margin-bottom: 16px; }
.kpi { text-align: center; padding: 8px 0; }
.kpi-num { font-size: 26px; font-weight: 600; color: #303133; }
.kpi-label { color: #909399; font-size: 13px; margin-top: 4px; }
.features { margin-bottom: 16px; }
.footer-tip :deep(.el-card__body) { padding: 12px 16px; }
</style>
