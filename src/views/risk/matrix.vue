<template>
  <div class="risk-matrix-container">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>LEC 风险矩阵</span>
          <el-button @click="fetchData">刷新</el-button>
        </div>
      </template>

      <p class="desc">
        基于 LEC 评价法：D = L × E × C；其中 L=事故发生可能性、E=暴露频次、C=后果严重性。
        矩阵横轴 L（1~5）、纵轴 C（1~5），格子颜色对应风险等级；点击格子可查看该等级风险点。
      </p>

      <div class="matrix-wrap" v-loading="loading">
        <table class="matrix-table">
          <thead>
            <tr>
              <th></th>
              <th v-for="l in 5" :key="'l'+l">L={{ l }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="c in [5, 4, 3, 2, 1]" :key="c">
              <th>C={{ c }}</th>
              <td
                v-for="l in 5"
                :key="`${c}-${l}`"
                :style="{ background: levelColor(cellLevel(l, c)) }"
                class="matrix-cell"
                @click="showLevelPoints(cellLevel(l, c))"
              >
                <div class="cell-level">{{ cellLevelLabel(l, c) }}</div>
                <div class="cell-count">{{ cellCount(l, c) }}</div>
              </td>
            </tr>
          </tbody>
        </table>

        <div class="legend-bar">
          <span class="legend-block" :style="{ background: '#F56C6C' }">红：D >= 320</span>
          <span class="legend-block" :style="{ background: '#E6A23C' }">橙：160 <= D < 320</span>
          <span class="legend-block" :style="{ background: '#F0CE45' }">黄：70 <= D < 160</span>
          <span class="legend-block" :style="{ background: '#409EFF' }">蓝：D < 70</span>
        </div>
      </div>
    </el-card>

    <el-dialog v-model="dialogVisible" :title="`等级：${levelLabel(currentLevel)}`" width="720px">
      <el-table :data="dialogList" border max-height="420">
        <el-table-column prop="riskPointCode" label="编号" width="140" />
        <el-table-column prop="riskPointName" label="名称" min-width="180" show-overflow-tooltip />
        <el-table-column prop="riskCategory" label="类别" width="120" />
        <el-table-column prop="riskLocation" label="位置" min-width="180" show-overflow-tooltip />
        <el-table-column prop="assessDate" label="评估日期" width="120" />
      </el-table>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { riskApi } from '@/api/modules/risk'

const loading = ref(false)
const riskPoints = ref<any[]>([])
const dialogVisible = ref(false)
const currentLevel = ref<string>('')

const levelColorMap: Record<string, string> = {
  red: '#F56C6C',
  orange: '#E6A23C',
  yellow: '#F0CE45',
  blue: '#409EFF'
}

const levelLabelMap: Record<string, string> = {
  red: '红色（重大）',
  orange: '橙色（较大）',
  yellow: '黄色（一般）',
  blue: '蓝色（低）'
}

function levelColor(k: string) { return levelColorMap[k] || '#909399' }
function levelLabel(k: string) { return levelLabelMap[k] || k }

// LEC 矩阵：D = L * E * C，E 默认取 6（每日工作中暴露）
// 分级：>=320 红；160~320 橙；70~160 黄；<70 蓝
function cellLevel(l: number, c: number): string {
  const d = l * 6 * c
  if (d >= 320) return 'red'
  if (d >= 160) return 'orange'
  if (d >= 70) return 'yellow'
  return 'blue'
}

function cellLevelLabel(l: number, c: number): string {
  return ({ red: '红', orange: '橙', yellow: '黄', blue: '蓝' } as any)[cellLevel(l, c)]
}

function cellCount(l: number, c: number): number {
  const lv = cellLevel(l, c)
  const count = riskPoints.value.filter(p => (p.riskLevel || p.level) === lv).length
  return Math.round(count / levelCellNum(lv))
}

function levelCellNum(lv: string): number {
  let n = 0
  for (let l = 1; l <= 5; l++) for (let c = 1; c <= 5; c++) if (cellLevel(l, c) === lv) n++
  return n || 1
}

const dialogList = computed(() =>
  riskPoints.value.filter(p => (p.riskLevel || p.level) === currentLevel.value)
)

function showLevelPoints(lv: string) {
  currentLevel.value = lv
  dialogVisible.value = true
}

async function fetchData() {
  loading.value = true
  try {
    const res: any = await riskApi.list({ pageNum: 1, pageSize: 500 } as any)
    riskPoints.value = res.data?.items || res.data?.list || []
  } catch (e) {
    console.error(e)
  } finally {
    loading.value = false
  }
}

onMounted(fetchData)
</script>

<style scoped>
.risk-matrix-container { padding: 16px; }
.card-header { display: flex; justify-content: space-between; align-items: center; }
.desc { color: #606266; font-size: 13px; margin: 0 0 14px; }
.matrix-wrap { display: flex; flex-direction: column; gap: 18px; align-items: flex-start; }
.matrix-table { border-collapse: collapse; }
.matrix-table th, .matrix-table td { border: 1px solid #fff; text-align: center; }
.matrix-table th { background: #f5f7fa; color: #303133; width: 80px; height: 36px; font-weight: 600; }
.matrix-cell {
  width: 110px; height: 80px;
  color: #fff;
  cursor: pointer;
  text-shadow: 0 1px 2px rgba(0,0,0,.25);
  transition: transform .15s;
}
.matrix-cell:hover { transform: scale(1.04); position: relative; z-index: 1; }
.cell-level { font-size: 16px; font-weight: 600; }
.cell-count { font-size: 14px; opacity: .9; margin-top: 4px; }
.legend-bar { display: flex; gap: 12px; flex-wrap: wrap; }
.legend-block { padding: 4px 10px; color: #fff; border-radius: 3px; font-size: 12px; }
</style>
