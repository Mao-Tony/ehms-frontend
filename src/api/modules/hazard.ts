import { request } from '../request'
import type { ApiResponse, PageResponse } from '../types'

// ========== 隐患上报 ==========
export interface Hazard {
  id: number
  title: string
  content: string
  level: 'RED' | 'ORANGE' | 'YELLOW' | 'BLUE'
  category: string
  departmentId: number
  departmentName: string
  location: string
  discoverDate: string
  deadline: string
  status: 'PENDING' | 'DISPATCHED' | 'PROCESSING' | 'RESOLVED' | 'CLOSED'
  reporterId: number
  reporterName: string
  handlerId?: number
  handlerName?: string
  resolution?: string
  resolveDate?: string
  attachments?: string[]
  createTime: string
  updateTime: string
}

export interface HazardQuery {
  keyword?: string
  level?: string
  category?: string
  departmentId?: number
  status?: string
  startDate?: string
  endDate?: string
  pageNum?: number
  pageSize?: number
}

export interface HazardForm {
  id?: number
  title: string
  content: string
  level: string
  category: string
  departmentId: number
  location: string
  deadline: string
  attachments?: string[]
}

// ========== 隐患统计 (对齐后端 HazardStatisticsDTO) ==========
export interface HazardStatistics {
  totalCount: number
  pendingCount: number
  rectifyingCount: number
  verifyingCount: number
  closedCount: number
  overdueCount: number
  levelStats: { level: string; count: number }[]
  typeStats: { type: string; count: number }[]
  deptStats: { deptId: number; deptName?: string; count: number }[]
}

// ========== 待处理隐患 (对齐后端 HazardPendingDTO) ==========
export interface HazardPending {
  hazardId: number
  hazardCode: string
  hazardLevel: string
  status: string
  deadline?: string
  reportTime?: string
}

export const hazardApi = {
  list: (params: HazardQuery) => {
    return request<ApiResponse<PageResponse<Hazard>>>({
      method: 'GET',
      url: '/hazard/hazard-reports',
      params
    })
  },

  getById: (id: number) => {
    return request<ApiResponse<Hazard>>({
      method: 'GET',
      url: `/hazard/hazard-reports/${id}`
    })
  },

  create: (data: HazardForm) => {
    return request<ApiResponse<Hazard>>({
      method: 'POST',
      url: '/hazard/hazard-reports',
      data
    })
  },

  update: (id: number, data: HazardForm) => {
    return request<ApiResponse<Hazard>>({
      method: 'PUT',
      url: `/hazard/hazard-reports/${id}`,
      data
    })
  },

  delete: (id: number) => {
    return request<ApiResponse<null>>({
      method: 'DELETE',
      url: `/hazard/hazard-reports/${id}`
    })
  },

  // 分派（后端 dispatch = assign）
  dispatch: (id: number, data: { handlerId: number }) => {
    return request<ApiResponse<Hazard>>({
      method: 'POST',
      url: `/hazard/hazard-reports/${id}/dispatch`,
      data
    })
  },

  // 整改完成（后端 complete = resolve）
  complete: (id: number, data: { resolution: string }) => {
    return request<ApiResponse<Hazard>>({
      method: 'POST',
      url: `/hazard/hazard-reports/${id}/complete`,
      data
    })
  },

  // 驳回
  reject: (id: number, data: { reason: string }) => {
    return request<ApiResponse<null>>({
      method: 'POST',
      url: `/hazard/hazard-reports/${id}/reject`,
      data
    })
  },

  // 催办
  urge: (id: number, data: { message?: string }) => {
    return request<ApiResponse<null>>({
      method: 'POST',
      url: `/hazard/hazard-reports/${id}/urge`,
      data
    })
  },

  // 上传图片
  uploadImage: (id: number, data: FormData) => {
    return request<ApiResponse<{ imageId: number; imageUrl: string }>>({
      method: 'POST',
      url: `/hazard/hazard-reports/${id}/images`,
      data,
      headers: { 'Content-Type': 'multipart/form-data' }
    })
  },

  deleteImage: (id: number, imageId: number) => {
    return request<ApiResponse<null>>({
      method: 'DELETE',
      url: `/hazard/hazard-reports/${id}/images/${imageId}`
    })
  },

  getStatistics: (params?: { startDate?: string; endDate?: string }) => {
    return request<ApiResponse<HazardStatistics>>({
      method: 'GET',
      url: '/hazard/hazard-reports/statistics',
      params
    })
  },

  getPending: (params?: { pageNum?: number; pageSize?: number }) => {
    return request<ApiResponse<PageResponse<Hazard>>>({
      method: 'GET',
      url: '/hazard/hazard-reports/pending',
      params
    })
  }
}