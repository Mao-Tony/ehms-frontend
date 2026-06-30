import { request } from '../request'
import type { ApiResponse, PageResponse } from '../types'

// ========== 通知公告 ==========
export interface SysNotice {
  noticeId: number
  noticeTitle: string
  noticeType: string
  noticeContent: string
  noticeLevel: string
  publishDeptId: number
  publishDeptName: string
  publisherId: number
  publisherName: string
  publishTime: string
  expiryTime?: string
  viewCount: number
  status: 'DRAFT' | 'PUBLISHED' | 'EXPIRED'
  createTime: string
}

export interface SysNoticeQuery {
  keyword?: string
  noticeType?: string
  status?: string
  pageNum?: number
  pageSize?: number
}

// ========== 文件管理 ==========
export interface SysFile {
  fileId: number
  fileName: string
  filePath: string
  fileSize: number
  fileType: string
  storageType: string
  uploaderId: number
  uploaderName: string
  downloadCount: number
  createTime: string
}

export interface SysFileQuery {
  keyword?: string
  fileType?: string
  pageNum?: number
  pageSize?: number
}

// ========== 系统配置 ==========
export interface SysConfig {
  configId: number
  configName: string
  configKey: string
  configValue: string
  configType: string
  isSystem: boolean
  remark?: string
  createTime: string
  updateTime: string
}

export interface SysConfigQuery {
  keyword?: string
  configType?: string
  pageNum?: number
  pageSize?: number
}

// ========== 字典缓存 ==========
export interface SysDictCache {
  cacheId: number
  dictType: string
  dictLabel: string
  dictValue: string
  dictSort: number
  isDefault: boolean
  status: '0' | '1'
  remark?: string
}

export interface SysDictCacheQuery {
  dictType?: string
  keyword?: string
  pageNum?: number
  pageSize?: number
}

// ========== 审计日志 ==========
export interface AuditLog {
  logId: number
  logType: 'LOGIN' | 'OPERATION' | 'ERROR'
  userId: number
  userName: string
  module: string
  action: string
  requestMethod: string
  requestUrl: string
  requestParams?: string
  responseBody?: string
  ip: string
  location?: string
  userAgent?: string
  duration?: number
  status: 'SUCCESS' | 'FAIL'
  errorMsg?: string
  createTime: string
}

export interface AuditLogQuery {
  logType?: string
  keyword?: string
  startDate?: string
  endDate?: string
  pageNum?: number
  pageSize?: number
}

export const systemApi = {
  // ========== 通知公告 ==========
  listNotices: (params: SysNoticeQuery) => {
    return request<ApiResponse<PageResponse<SysNotice>>>({
      method: 'GET',
      url: '/system/notices',
      params
    })
  },

  getNoticeById: (id: number) => {
    return request<ApiResponse<SysNotice>>({
      method: 'GET',
      url: `/system/notices/${id}`
    })
  },

  createNotice: (data: Partial<SysNotice>) => {
    return request<ApiResponse<SysNotice>>({
      method: 'POST',
      url: '/system/notices',
      data
    })
  },

  updateNotice: (id: number, data: Partial<SysNotice>) => {
    return request<ApiResponse<SysNotice>>({
      method: 'PUT',
      url: `/system/notices/${id}`,
      data
    })
  },

  deleteNotice: (id: number) => {
    return request<ApiResponse<null>>({
      method: 'DELETE',
      url: `/system/notices/${id}`
    })
  },

  // ========== 文件管理 ==========
  listFiles: (params: SysFileQuery) => {
    return request<ApiResponse<PageResponse<SysFile>>>({
      method: 'GET',
      url: '/system/files',
      params
    })
  },

  getFileById: (id: number) => {
    return request<ApiResponse<SysFile>>({
      method: 'GET',
      url: `/system/files/${id}`
    })
  },

  uploadFile: (data: FormData) => {
    return request<ApiResponse<SysFile>>({
      method: 'POST',
      url: '/system/files/upload',
      data,
      headers: { 'Content-Type': 'multipart/form-data' }
    })
  },

  deleteFile: (id: number) => {
    return request<ApiResponse<null>>({
      method: 'DELETE',
      url: `/system/files/${id}`
    })
  },

  // ========== 系统配置 ==========
  listConfigs: (params: SysConfigQuery) => {
    return request<ApiResponse<PageResponse<SysConfig>>>({
      method: 'GET',
      url: '/system/configs',
      params
    })
  },

  getConfigById: (id: number) => {
    return request<ApiResponse<SysConfig>>({
      method: 'GET',
      url: `/system/configs/${id}`
    })
  },

  createConfig: (data: Partial<SysConfig>) => {
    return request<ApiResponse<SysConfig>>({
      method: 'POST',
      url: '/system/configs',
      data
    })
  },

  updateConfig: (id: number, data: Partial<SysConfig>) => {
    return request<ApiResponse<SysConfig>>({
      method: 'PUT',
      url: `/system/configs/${id}`,
      data
    })
  },

  deleteConfig: (id: number) => {
    return request<ApiResponse<null>>({
      method: 'DELETE',
      url: `/system/configs/${id}`
    })
  },

  // ========== 字典缓存 ==========
  listDictCache: (params: SysDictCacheQuery) => {
    return request<ApiResponse<PageResponse<SysDictCache>>>({
      method: 'GET',
      url: '/system/dict-cache',
      params
    })
  },

  createDictCache: (data: Partial<SysDictCache>) => {
    return request<ApiResponse<SysDictCache>>({
      method: 'POST',
      url: '/system/dict-cache',
      data
    })
  },

  deleteDictCache: (id: number) => {
    return request<ApiResponse<null>>({
      method: 'DELETE',
      url: `/system/dict-cache/${id}`
    })
  },

  // ========== 审计日志 ==========
  listAuditLogs: (params: AuditLogQuery) => {
    return request<ApiResponse<PageResponse<AuditLog>>>({
      method: 'GET',
      url: '/system/audit-logs',
      params
    })
  },

  getAuditLogById: (id: number) => {
    return request<ApiResponse<AuditLog>>({
      method: 'GET',
      url: `/system/audit-logs/${id}`
    })
  }
}