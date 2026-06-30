import { request } from '../request'
import type { ApiResponse, PageResponse } from '../types'

// ========== KPI 指标 ==========
export interface KpiIndicator {
  id: number
  indicatorName: string
  indicatorCode: string
  category: string
  deptId: number
  deptName: string
  targetValue: number
  unit: string
  weight: number
  dataSource?: string
  description?: string
  status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED'
  createTime: string
  updateTime: string
}

export interface KpiIndicatorQuery {
  keyword?: string
  category?: string
  deptId?: number
  status?: string
  pageNum?: number
  pageSize?: number
}

export interface KpiIndicatorForm {
  id?: number
  indicatorName: string
  indicatorCode: string
  category: string
  deptId: number
  targetValue: number
  unit: string
  weight: number
  dataSource?: string
  description?: string
}

// ========== KPI 评估任务 ==========
export interface KpiTask {
  id: number
  taskName: string
  assessmentPeriod: 'MONTHLY' | 'QUARTERLY' | 'YEARLY'
  periodValue: string
  deptId: number
  deptName: string
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED'
  startDate: string
  endDate: string
  createTime: string
  updateTime: string
}

export interface KpiTaskForm {
  id?: number
  taskName: string
  assessmentPeriod: string
  periodValue: string
  deptId: number
  startDate: string
  endDate: string
}

// ========== KPI 评分 ==========
export interface KpiScore {
  id: number
  taskId: number
  taskName: string
  indicatorId: number
  indicatorName: string
  deptId: number
  deptName: string
  targetValue: number
  actualValue?: number
  score: number
  assessmentDate: string
  assessor?: string
  remark?: string
  createTime: string
}

export interface KpiScoreQuery {
  taskId?: number
  indicatorId?: number
  deptId?: number
  keyword?: string
  pageNum?: number
  pageSize?: number
}

export interface KpiScoreForm {
  taskId: number
  indicatorId: number
  deptId: number
  actualValue: number
  score: number
  remark?: string
}

// ========== KPI 仪表盘 ==========
export interface KpiDashboard {
  overallAchievementRate: number
  targetCount: number
  achievedCount: number
  inProgressCount: number
  pendingCount: number
  departmentRankings: { deptName: string; rate: number }[]
  monthlyTrend: { month: string; rate: number }[]
}

export const kpiApi = {
  // ========== KPI 指标 ==========
  listTargets: (params: KpiIndicatorQuery) => {
    return request<ApiResponse<PageResponse<KpiIndicator>>>({
      method: 'GET',
      url: '/kpi/targets',
      params
    })
  },

  getTargetById: (id: number) => {
    return request<ApiResponse<KpiIndicator>>({
      method: 'GET',
      url: `/kpi/targets/${id}`
    })
  },

  createTarget: (data: KpiIndicatorForm) => {
    return request<ApiResponse<KpiIndicator>>({
      method: 'POST',
      url: '/kpi/targets',
      data
    })
  },

  updateTarget: (id: number, data: KpiIndicatorForm) => {
    return request<ApiResponse<KpiIndicator>>({
      method: 'PUT',
      url: `/kpi/targets/${id}`,
      data
    })
  },

  deleteTarget: (id: number) => {
    return request<ApiResponse<null>>({
      method: 'DELETE',
      url: `/kpi/targets/${id}`
    })
  },

  publishTarget: (id: number) => {
    return request<ApiResponse<KpiIndicator>>({
      method: 'POST',
      url: `/kpi/targets/${id}/publish`
    })
  },

  // ========== KPI 评估任务 ==========
  listAssessments: (params?: { pageNum?: number; pageSize?: number }) => {
    return request<ApiResponse<PageResponse<KpiTask>>>({
      method: 'GET',
      url: '/kpi/assessments',
      params
    })
  },

  getAssessmentById: (id: number) => {
    return request<ApiResponse<KpiTask>>({
      method: 'GET',
      url: `/kpi/assessments/${id}`
    })
  },

  createAssessment: (data: KpiTaskForm) => {
    return request<ApiResponse<KpiTask>>({
      method: 'POST',
      url: '/kpi/assessments',
      data
    })
  },

  updateAssessment: (id: number, data: Partial<KpiTaskForm>) => {
    return request<ApiResponse<KpiTask>>({
      method: 'PUT',
      url: `/kpi/assessments/${id}`,
      data
    })
  },

  getAssessmentScores: (id: number) => {
    return request<ApiResponse<{ code: number; msg: string; data: KpiScore[] }>>({
      method: 'GET',
      url: `/kpi/assessments/${id}/scores`
    })
  },

  // 注意：后端无独立 /scores 列表端口，评分通过 /assessments/{id}/scores 获取
  // createScore / updateScore 同理，由后端 assessments 内部处理，此处留空


  // ========== 仪表盘 & 报表 ==========
  getDashboard: () => {
    return request<ApiResponse<KpiDashboard>>({
      method: 'GET',
      url: '/kpi/kpi-dashboard'
    })
  },

  getMonthlyReport: (params: { year: number; month: number }) => {
    return request<ApiResponse<any>>({
      method: 'GET',
      url: '/kpi/reports/monthly',
      params
    })
  }
}