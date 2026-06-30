import { request } from '../request'
import type { ApiResponse, PageResponse } from '../types'

// ========== 健康档案 (对应后端 /api/v1/health/health-records) ==========
export interface HealthRecord {
  record_id?: number
  user_id?: number
  record_status?: string
  create_date?: string
  medical_history?: string
  family_history?: any
  tenant_id?: number
  created_by?: number
  created_at?: string
  updated_by?: number
  updated_at?: string
}

export interface HealthRecordQuery {
  keyword?: string
  department_id?: number
  check_result?: string
  start_date?: string
  end_date?: string
  page?: number
  page_size?: number
}

export interface HealthRecordForm {
  user_id: number
  record_status?: string
  create_date?: string
  medical_history?: string
  family_history?: any
}

// ========== 体检记录 (对应后端 /api/v1/health/health-examinations) ==========
export interface HealthExamination {
  exam_id?: number
  user_id?: number
  exam_type?: string
  exam_institution?: string
  exam_date?: string
  exam_status?: string
  health_record_id?: number
  report_url?: string
  tenant_id?: number
  created_by?: number
  created_at?: string
  updated_by?: number
  updated_at?: string
}

export interface HealthExaminationQuery {
  record_id?: number
  exam_type?: string
  exam_status?: string
  page?: number
  page_size?: number
}

export interface HealthExaminationForm {
  user_id: number
  exam_type?: string
  exam_institution?: string
  exam_date?: string
  exam_status?: string
  health_record_id?: number
  report_url?: string
}

// ========== PPE 配发记录 (对应后端 /api/v1/health/ppe-allocations) ==========
export interface PpeAllocation {
  distribution_id?: number
  user_id?: number
  ppe_id?: number
  stock_id?: number
  quantity?: number
  distribute_time?: string
  distributor_id?: number
  signature_hash?: string
  next_replace_date?: string
  tenant_id?: number
  created_by?: number
  created_at?: string
}

export const healthApi = {
  // ========== 健康档案 ==========
  listRecords: (params: HealthRecordQuery) => {
    return request<ApiResponse<PageResponse<HealthRecord>>>({
      method: 'GET',
      url: '/health/health-records',
      params: {
        keyword: params?.keyword,
        department_id: params?.department_id,
        check_result: params?.check_result,
        start_date: params?.start_date,
        end_date: params?.end_date,
        page: params?.page,
        page_size: params?.page_size
      }
    })
  },

  getRecord: (recordId: number) => {
    return request<ApiResponse<HealthRecord>>({
      method: 'GET',
      url: `/health/health-records/${recordId}`
    })
  },

  createRecord: (data: HealthRecordForm) => {
    return request<ApiResponse<HealthRecord>>({
      method: 'POST',
      url: '/health/health-records',
      data
    })
  },

  updateRecord: (recordId: number, data: Partial<HealthRecordForm>) => {
    return request<ApiResponse<HealthRecord>>({
      method: 'PUT',
      url: `/health/health-records/${recordId}`,
      data
    })
  },

  deleteRecord: (recordId: number) => {
    return request<ApiResponse<null>>({
      method: 'DELETE',
      url: `/health/health-records/${recordId}`
    })
  },

  // ========== 体检记录 ==========
  listExaminations: (params: HealthExaminationQuery) => {
    return request<ApiResponse<PageResponse<HealthExamination>>>({
      method: 'GET',
      url: '/health/health-examinations',
      params: {
        record_id: params?.record_id,
        exam_type: params?.exam_type,
        exam_status: params?.exam_status,
        page: params?.page,
        page_size: params?.page_size
      }
    })
  },

  getExamination: (examId: number) => {
    return request<ApiResponse<HealthExamination>>({
      method: 'GET',
      url: `/health/health-examinations/${examId}`
    })
  },

  createExamination: (data: HealthExaminationForm) => {
    return request<ApiResponse<HealthExamination>>({
      method: 'POST',
      url: '/health/health-examinations',
      data
    })
  },

  updateExamination: (examId: number, data: Partial<HealthExaminationForm>) => {
    return request<ApiResponse<HealthExamination>>({
      method: 'PUT',
      url: `/health/health-examinations/${examId}`,
      data
    })
  },

  deleteExamination: (examId: number) => {
    return request<ApiResponse<null>>({
      method: 'DELETE',
      url: `/health/health-examinations/${examId}`
    })
  },

  // ========== PPE 配发记录 ==========
  listPpeAllocations: (params: { user_id?: number; page?: number; page_size?: number }) => {
    return request<ApiResponse<PageResponse<PpeAllocation>>>({
      method: 'GET',
      url: '/health/ppe-allocations',
      params: {
        user_id: params?.user_id,
        page: params?.page,
        page_size: params?.page_size
      }
    })
  },

  createPpeAllocation: (data: { user_id: number; ppe_id: number; quantity?: number; distribute_time?: string; signature_hash?: string; next_replace_date?: string }) => {
    return request<ApiResponse<PpeAllocation>>({
      method: 'POST',
      url: '/health/ppe-allocations',
      data
    })
  },

  updatePpeAllocation: (distributionId: number, data: { quantity?: number; next_replace_date?: string }) => {
    return request<ApiResponse<PpeAllocation>>({
      method: 'PUT',
      url: `/health/ppe-allocations/${distributionId}`,
      data
    })
  }
}