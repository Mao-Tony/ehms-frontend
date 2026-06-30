import { request } from '../request'
import type { ApiResponse, PageResponse } from '../types'

// ========== 合规文档 ==========
export interface ComplianceDocument {
  id: number
  title: string
  docNo: string
  docType: 'POLICY' | 'PROCEDURE' | 'INSTRUCTION' | 'RECORD' | 'OTHER'
  typeName: string
  version: string
  content: string
  departmentId: number
  departmentName: string
  effectiveDate: string
  expiryDate?: string
  attachments?: string[]
  status: 'DRAFT' | 'EFFECTIVE' | 'EXPIRED' | 'SUPERSEDED'
  createTime: string
  updateTime: string
}

export interface ComplianceDocumentQuery {
  keyword?: string
  docType?: string
  status?: string
  departmentId?: number
  pageNum?: number
  pageSize?: number
}

export interface ComplianceDocumentForm {
  id?: number
  title: string
  docNo: string
  docType: string
  version: string
  content: string
  departmentId: number
  effectiveDate: string
  expiryDate?: string
  attachments?: string[]
}

// ========== 法规标准 ==========
export interface Regulation {
  id: number
  title: string
  regulationNo: string
  type: 'NATIONAL' | 'INDUSTRIAL' | 'LOCAL' | 'ENTERPRISE'
  typeName: string
  content: string
  departmentId: number
  departmentName: string
  effectiveDate: string
  expiryDate?: string
  attachments?: string[]
  status: 'EFFECTIVE' | 'EXPIRED' | 'DRAFT'
  createTime: string
  updateTime: string
}

export interface RegulationQuery {
  keyword?: string
  type?: string
  status?: string
  departmentId?: number
  pageNum?: number
  pageSize?: number
}

export interface RegulationForm {
  id?: number
  title: string
  regulationNo: string
  type: string
  content: string
  departmentId: number
  effectiveDate: string
  expiryDate?: string
  attachments?: string[]
}

// ========== 知识库 ==========
export interface KnowledgeBase {
  id: number
  title: string
  category: string
  content: string
  tags?: string[]
  attachments?: string[]
  viewCount?: number
  createTime: string
  updateTime: string
}

export interface KnowledgeBaseQuery {
  keyword?: string
  category?: string
  pageNum?: number
  pageSize?: number
}

export const complianceApi = {
  // ========== 合规文档 ==========
  listDocuments: (params: ComplianceDocumentQuery) => {
    return request<ApiResponse<PageResponse<ComplianceDocument>>>({
      method: 'GET',
      url: '/compliance/documents',
      params
    })
  },

  getDocumentById: (id: number) => {
    return request<ApiResponse<ComplianceDocument>>({
      method: 'GET',
      url: `/compliance/documents/${id}`
    })
  },

  createDocument: (data: ComplianceDocumentForm) => {
    return request<ApiResponse<ComplianceDocument>>({
      method: 'POST',
      url: '/compliance/documents',
      data
    })
  },

  updateDocument: (id: number, data: ComplianceDocumentForm) => {
    return request<ApiResponse<ComplianceDocument>>({
      method: 'PUT',
      url: `/compliance/documents/${id}`,
      data
    })
  },

  deleteDocument: (id: number) => {
    return request<ApiResponse<null>>({
      method: 'DELETE',
      url: `/compliance/documents/${id}`
    })
  },

  getDocumentVersions: (id: number) => {
    return request<ApiResponse<ComplianceDocument[]>>({
      method: 'GET',
      url: `/compliance/documents/${id}/versions`
    })
  },

  createDocumentVersion: (id: number, data: ComplianceDocumentForm) => {
    return request<ApiResponse<ComplianceDocument>>({
      method: 'POST',
      url: `/compliance/documents/${id}/versions`,
      data
    })
  },

  // ========== 法规标准 ==========
  listRegulations: (params: RegulationQuery) => {
    return request<ApiResponse<PageResponse<Regulation>>>({
      method: 'GET',
      url: '/compliance/regulations',
      params
    })
  },

  getRegulationById: (id: number) => {
    return request<ApiResponse<Regulation>>({
      method: 'GET',
      url: `/compliance/regulations/${id}`
    })
  },

  createRegulation: (data: RegulationForm) => {
    return request<ApiResponse<Regulation>>({
      method: 'POST',
      url: '/compliance/regulations',
      data
    })
  },

  updateRegulation: (id: number, data: RegulationForm) => {
    return request<ApiResponse<Regulation>>({
      method: 'PUT',
      url: `/compliance/regulations/${id}`,
      data
    })
  },

  deleteRegulation: (id: number) => {
    return request<ApiResponse<null>>({
      method: 'DELETE',
      url: `/compliance/regulations/${id}`
    })
  },

  // ========== 知识库 ==========
  listKnowledgeBases: (params: KnowledgeBaseQuery) => {
    return request<ApiResponse<PageResponse<KnowledgeBase>>>({
      method: 'GET',
      url: '/compliance/knowledge-bases',
      params
    })
  },

  getKnowledgeBaseById: (id: number) => {
    return request<ApiResponse<KnowledgeBase>>({
      method: 'GET',
      url: `/compliance/knowledge-bases/${id}`
    })
  },

  createKnowledgeBase: (data: Partial<KnowledgeBase>) => {
    return request<ApiResponse<KnowledgeBase>>({
      method: 'POST',
      url: '/compliance/knowledge-bases',
      data
    })
  },

  updateKnowledgeBase: (id: number, data: Partial<KnowledgeBase>) => {
    return request<ApiResponse<KnowledgeBase>>({
      method: 'PUT',
      url: `/compliance/knowledge-bases/${id}`,
      data
    })
  },

  deleteKnowledgeBase: (id: number) => {
    return request<ApiResponse<null>>({
      method: 'DELETE',
      url: `/compliance/knowledge-bases/${id}`
    })
  },

  queryKnowledgeBase: (knowledgeId: number, data: { query: string; top_k?: number }) => {
    return request<ApiResponse<{ results: KnowledgeBase[] }>>({
      method: 'POST',
      url: `/compliance/knowledge-bases/${knowledgeId}/query`,
      data
    })
  }
}