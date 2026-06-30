import { request } from '../request'
import type { ApiResponse, PageResponse } from '../types'

export interface WorkPermit {
  id: number
  permitNo: string
  type: 'HOT_WORK' | 'CONFINED_SPACE' | 'HEIGHT_WORK' | 'TEMPORARY_ELECTRICITY' | 'EXCAVATION' | 'LIFTING'
  typeName: string
  title: string
  location: string
  applicantId: number
  applicantName: string
  departmentId: number
  departmentName: string
  startTime: string
  endTime: string
  mainWorker: string
  safetyMeasures: string
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'EXPIRED' | 'CANCELLED'
  approverId?: number
  approverName?: string
  approveTime?: string
  approveRemark?: string
  attachments?: string[]
  createTime: string
  updateTime: string
}

export interface PermitQuery {
  keyword?: string
  type?: string
  status?: string
  departmentId?: number
  startDate?: string
  endDate?: string
  pageNum?: number
  pageSize?: number
}

export interface PermitForm {
  id?: number
  type: string
  title: string
  location: string
  departmentId: number
  startTime: string
  endTime: string
  mainWorker: string
  safetyMeasures: string
  attachments?: string[]
}

export const permitApi = {
  list: (params: PermitQuery) => {
    return request<ApiResponse<PageResponse<WorkPermit>>>({
      method: 'GET',
      url: '/permit/permits',
      params
    })
  },

  getById: (id: number) => {
    return request<ApiResponse<WorkPermit>>({
      method: 'GET',
      url: `/permit/permits/${id}`
    })
  },

  create: (data: PermitForm) => {
    return request<ApiResponse<WorkPermit>>({
      method: 'POST',
      url: '/permit/permits',
      data
    })
  },

  update: (id: number, data: PermitForm) => {
    return request<ApiResponse<WorkPermit>>({
      method: 'PUT',
      url: `/permit/permits/${id}`,
      data
    })
  },

  delete: (id: number) => {
    return request<ApiResponse<null>>({
      method: 'DELETE',
      url: `/permit/permits/${id}`
    })
  },

  approve: (id: number, data: { approval_status: string; remark?: string }) => {
    return request<ApiResponse<WorkPermit>>({
      method: 'POST',
      url: `/permit/permits/${id}/approve`,
      data
    })
  },

  reject: (id: number, data: { reject_reason: string }) => {
    return request<ApiResponse<WorkPermit>>({
      method: 'POST',
      url: `/permit/permits/${id}/reject`,
      data
    })
  },

  addPersonnel: (id: number, data: { personnel_name: string; personnel_id_card: string; position: string; phone?: string }) => {
    return request<ApiResponse<any>>({
      method: 'POST',
      url: `/permit/permits/${id}/personnel`,
      data
    })
  },

  getPersonnel: (id: number, params?: { pageNum?: number; pageSize?: number }) => {
    return request<ApiResponse<PageResponse<any>>>({
      method: 'GET',
      url: `/permit/permits/${id}/personnel`,
      params
    })
  },

  removePersonnel: (id: number, pid: number) => {
    return request<ApiResponse<null>>({
      method: 'DELETE',
      url: `/permit/permits/${id}/personnel/${pid}`
    })
  },

  getGasDetections: (id: number, params?: { pageNum?: number; pageSize?: number }) => {
    return request<ApiResponse<PageResponse<any>>>({
      method: 'GET',
      url: `/permit/permits/${id}/gas-detections`,
      params
    })
  },

  addGasDetection: (id: number, data: any) => {
    return request<ApiResponse<any>>({
      method: 'POST',
      url: `/permit/permits/${id}/gas-detections`,
      data
    })
  },

  getSafetyMeasures: (id: number, params?: { pageNum?: number; pageSize?: number }) => {
    return request<ApiResponse<PageResponse<any>>>({
      method: 'GET',
      url: `/permit/permits/${id}/safety-measures`,
      params
    })
  },

  addSafetyMeasure: (id: number, data: any) => {
    return request<ApiResponse<any>>({
      method: 'POST',
      url: `/permit/permits/${id}/safety-measures`,
      data
    })
  },

  confirmSafetyMeasure: (id: number, mid: number, data: { confirm_remark?: string }) => {
    return request<ApiResponse<null>>({
      method: 'PUT',
      url: `/permit/permits/${id}/safety-measures/${mid}/confirm`,
      data
    })
  },

  getSigns: (id: number, params?: { pageNum?: number; pageSize?: number }) => {
    return request<ApiResponse<PageResponse<any>>>({
      method: 'GET',
      url: `/permit/permits/${id}/signs`,
      params
    })
  },

  addSign: (id: number, data: any) => {
    return request<ApiResponse<any>>({
      method: 'POST',
      url: `/permit/permits/${id}/signs`,
      data
    })
  },

  getCalendar: (params: { startDate: string; endDate: string; pageNum?: number; pageSize?: number }) => {
    return request<ApiResponse<PageResponse<any>>>({
      method: 'GET',
      url: '/permit/permits/calendar',
      params
    })
  },

  getStatistics: () => {
    return request<ApiResponse<{
      total: number
      pendingCount: number
      approvedCount: number
      expiredCount: number
      byType: { type: string; count: number }[]
    }>>({
      method: 'GET',
      url: '/permit/permits/statistics'
    })
  }
}
