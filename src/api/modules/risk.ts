import { request } from '../request'
import type { ApiResponse, PageResponse, PageInfo } from '../types'

export interface RiskPoint {
  id: number
  code: string
  name: string
  type: string
  level: 'RED' | 'ORANGE' | 'YELLOW' | 'BLUE'
  departmentId: number
  departmentName: string
  location: string
  description: string
  controlMeasures: string
  lValue: number
  eValue: number
  cValue: number
  dValue: number
  responsibleId: number
  responsibleName: string
  status: number
  aiAssessment?: string
  lastCheckDate?: string
  nextCheckDate?: string
  createTime: string
  updateTime: string
}

export interface RiskPointQuery {
  keyword?: string
  level?: string
  type?: string
  departmentId?: number
  status?: number
  pageNum?: number
  pageSize?: number
}

export interface RiskPointForm {
  id?: number
  code: string
  name: string
  type: string
  level: string
  departmentId: number
  location: string
  description: string
  controlMeasures: string
  lValue: number
  eValue: number
  cValue: number
  responsibleId: number
  status: number
}

export interface AiAssessDTO {
  description: string
  type?: string
  location?: string
}

export interface RiskStatistics {
  total: number
  redCount: number
  orangeCount: number
  yellowCount: number
  blueCount: number
  trendData: { date: string; count: number }[]
}

export const riskApi = {
  list: (params: RiskPointQuery) => {
    return request<ApiResponse<PageResponse<RiskPoint>>>({
      method: 'GET',
      url: '/risk/risks',
      params
    })
  },

  getById: (id: number) => {
    return request<ApiResponse<RiskPoint>>({
      method: 'GET',
      url: `/risk/risks/${id}`
    })
  },

  create: (data: RiskPointForm) => {
    return request<ApiResponse<RiskPoint>>({
      method: 'POST',
      url: '/risk/risks',
      data
    })
  },

  update: (id: number, data: RiskPointForm) => {
    return request<ApiResponse<RiskPoint>>({
      method: 'PUT',
      url: `/risk/risks/${id}`,
      data
    })
  },

  delete: (id: number) => {
    return request<ApiResponse<null>>({
      method: 'DELETE',
      url: `/risk/risks/${id}`
    })
  },

  evaluate: (id: number, data: { possibility_l: number; exposure_e: number; seriousness_c: number; assess_method?: string; accident_type?: string }) => {
    return request<ApiResponse<{ level: string; suggestions: string[] }>>({
      method: 'POST',
      url: `/risk/risks/${id}/evaluate`,
      data
    })
  },

  getStatistics: (params?: { startDate?: string; endDate?: string }) => {
    return request<ApiResponse<RiskStatistics>>({
      method: 'GET',
      url: '/risk/risks/statistics',
      params
    })
  },

  getColorMap: (deptId?: number) => {
    return request<ApiResponse<RiskPoint[]>>({
      method: 'GET',
      url: '/risk/risks/map',
      params: deptId ? { dept_id: deptId } : undefined
    })
  },

  getRiskMatrix: () => {
    return request<ApiResponse<{ matrix_data: number[][] }>>({
      method: 'GET',
      url: '/risk/risks/matrix'
    })
  },

  getMeasures: (id: number) => {
    return request<ApiResponse<RiskPoint[]>>({
      method: 'GET',
      url: `/risk/risks/${id}/measures`
    })
  }
}

// ========== 后端 DTO 真实字段（snake → camel） ==========
export interface RiskPointBE {
  riskPointId?: number
  riskPointCode?: string
  riskPointName?: string
  deptId?: number
  riskCategory?: string
  riskLocation?: string
  latitude?: number
  longitude?: number
  riskLevel?: 'red' | 'orange' | 'yellow' | 'blue'
  riskType?: string
  sourceType?: string
  status?: number
  assessDate?: string
  nextAssessDate?: string
  tenantId?: number
  createdAt?: string
}

export interface RiskStatisticsBE {
  totalCount: number
  redCount: number
  orangeCount: number
  yellowCount: number
  blueCount: number
  deptStats: { deptId: number; deptName?: string; count: number }[]
}

export interface RiskColorMap {
  mapId: number
  mapName: string
  mapType?: string
  deptId?: number
  mapImageUrl?: string
  riskSummary?: Record<string, any>
  version?: number
  status?: number
  createdAt?: string
}

// 批量更新等级（后端 /risks/batch-update-level）
export interface BatchUpdateLevelReq { riskPointIds: number[]; newLevel: 'red'|'orange'|'yellow'|'blue' }
export const batchUpdateLevel = (data: BatchUpdateLevelReq) =>
  request({ method: 'POST', url: '/risk/risks/batch-update-level', data })

// 风险转移（后端 /risks/transfer）
export interface RiskTransferReq { riskPointId: number; targetDeptId: number; targetResponsibleId: number }
export const transferRisk = (data: RiskTransferReq) =>
  request({ method: 'POST', url: '/risk/risks/transfer', data })

// 风险评审（后端 /risks/{id}/review）
export const reviewRisk = (id: number, data: { result: 'pass'|'reject'; remark?: string }) =>
  request({ method: 'POST', url: `/risk/risks/${id}/review`, data })

// 措施 CRUD
export const createMeasure = (riskId: number, data: any) =>
  request({ method: 'POST', url: `/risk/risks/${riskId}/measures`, data })
export const updateMeasure = (riskId: number, mid: number, data: any) =>
  request({ method: 'PUT', url: `/risk/risks/${riskId}/measures/${mid}`, data })
export const deleteMeasure = (riskId: number, mid: number) =>
  request({ method: 'DELETE', url: `/risk/risks/${riskId}/measures/${mid}` })

// 扩展 riskApi
Object.assign(riskApi, {
  batchUpdateLevel,
  transferRisk,
  reviewRisk,
  createMeasure,
  updateMeasure,
  deleteMeasure
})
