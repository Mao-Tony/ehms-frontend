import { request } from '../request'
import type { ApiResponse, PageResponse } from '../types'

// ========== 承包商 ==========
export interface Contractor {
  id: number
  contractorName: string
  contractorCode: string
  contractorType: string
  legalPerson: string
  contactPerson: string
  contactPhone: string
  address: string
  qualificationLevel: string
  businessScope?: string
  validUntil?: string
  status: 'ACTIVE' | 'SUSPENDED' | 'BLACKLISTED'
  rating?: number
  attachments?: string[]
  createTime: string
  updateTime: string
}

export interface ContractorQuery {
  keyword?: string
  contractorType?: string
  status?: string
  pageNum?: number
  pageSize?: number
}

export interface ContractorForm {
  id?: number
  contractorName: string
  contractorCode: string
  contractorType: string
  legalPerson: string
  contactPerson: string
  contactPhone: string
  address: string
  qualificationLevel: string
  businessScope?: string
  validUntil?: string
  attachments?: string[]
}

// ========== 承包商人员 ==========
export interface ContractorPerson {
  id: number
  contractorId: number
  contractorName: string
  personName: string
  idCard: string
  position: string
  phone: string
  safetyCertificateNo?: string
  safetyCertificateExpiry?: string
  emergencyContact?: string
  emergencyPhone?: string
  workStatus: 'IN_SERVICE' | 'LEAVE'
  inDate?: string
  outDate?: string
  createTime: string
}

export interface ContractorPersonQuery {
  contractorId?: number
  workStatus?: string
  keyword?: string
  pageNum?: number
  pageSize?: number
}

// ========== 资质 ==========
export interface ContractorQualification {
  id: number
  contractorId: number
  qualificationName: string
  qualificationNo: string
  qualificationType: string
  issueDate: string
  expiryDate: string
  issueOrg: string
  attachments?: string[]
  status: 'VALID' | 'EXPIRED' | 'REVOKED'
  createTime: string
}

// ========== 入场记录 ==========
export interface EntryRecord {
  id: number
  personnelId: number
  personName: string
  contractorName: string
  entryTime: string
  exitTime?: string
  workArea: string
  workContent: string
  healthStatus?: string
  createTime: string
}

export const contractorApi = {
  // ========== 承包商 ==========
  list: (params: ContractorQuery) => {
    return request<ApiResponse<PageResponse<Contractor>>>({
      method: 'GET',
      url: '/contractor/contractors',
      params
    })
  },

  getById: (id: number) => {
    return request<ApiResponse<Contractor>>({
      method: 'GET',
      url: `/contractor/contractors/${id}`
    })
  },

  create: (data: ContractorForm) => {
    return request<ApiResponse<Contractor>>({
      method: 'POST',
      url: '/contractor/contractors',
      data
    })
  },

  update: (id: number, data: ContractorForm) => {
    return request<ApiResponse<Contractor>>({
      method: 'PUT',
      url: `/contractor/contractors/${id}`,
      data
    })
  },

  delete: (id: number) => {
    return request<ApiResponse<null>>({
      method: 'DELETE',
      url: `/contractor/contractors/${id}`
    })
  },

  // 后端无独立统计端点，由 list 接口自行汇总


  // ========== 承包商人员 ==========
  getPersons: (contractorId: number, params?: { pageNum?: number; pageSize?: number }) => {
    return request<ApiResponse<PageResponse<ContractorPerson>>>({
      method: 'GET',
      url: `/contractor/contractors/${contractorId}/persons`,
      params
    })
  },

  addPerson: (contractorId: number, data: Partial<ContractorPerson>) => {
    return request<ApiResponse<ContractorPerson>>({
      method: 'POST',
      url: `/contractor/contractors/${contractorId}/persons`,
      data
    })
  },

  updatePerson: (contractorId: number, personId: number, data: Partial<ContractorPerson>) => {
    return request<ApiResponse<ContractorPerson>>({
      method: 'PUT',
      url: `/contractor/contractors/${contractorId}/persons/${personId}`,
      data
    })
  },

  deletePerson: (contractorId: number, personId: number) => {
    return request<ApiResponse<null>>({
      method: 'DELETE',
      url: `/contractor/contractors/${contractorId}/persons/${personId}`
    })
  },

  // ========== 资质 ==========
  getQualifications: (contractorId: number, params?: { pageNum?: number; pageSize?: number }) => {
    return request<ApiResponse<PageResponse<ContractorQualification>>>({
      method: 'GET',
      url: `/contractor/contractors/${contractorId}/qualifications`,
      params: { page: params?.pageNum, page_size: params?.pageSize }
    })
  },

  addQualification: (contractorId: number, data: Partial<ContractorQualification>) => {
    return request<ApiResponse<ContractorQualification>>({
      method: 'POST',
      url: `/contractor/contractors/${contractorId}/qualifications`,
      data
    })
  },

  // ========== 全局人员查询 & 入场记录 ==========
  listAllPersons: (params: ContractorPersonQuery) => {
    return request<ApiResponse<PageResponse<ContractorPerson>>>({
      method: 'GET',
      url: '/contractor/contractor-persons',
      params
    })
  },

  getPersonById: (personId: number) => {
    return request<ApiResponse<ContractorPerson>>({
      method: 'GET',
      url: `/contractor/contractor-persons/${personId}`
    })
  },

  updatePersonById: (personId: number, data: Partial<ContractorPerson>) => {
    return request<ApiResponse<ContractorPerson>>({
      method: 'PUT',
      url: `/contractor/contractor-persons/${personId}`,
      data
    })
  },

  createEntryRecord: (personId: number, data: Partial<EntryRecord>) => {
    return request<ApiResponse<EntryRecord>>({
      method: 'POST',
      url: `/contractor/contractor-persons/${personId}/entry-record`,
      data
    })
  }
}