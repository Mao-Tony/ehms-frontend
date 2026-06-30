import { request } from '../request'
import type { ApiResponse, PageResponse } from '../types'

// ========== 飞书消息 ==========
export interface FeishuMessage {
  messageId: string
  msgType: string
  content: string
  senderId: string
  senderName: string
  receiverId?: string
  receiverName?: string
  createTime: string
}

export interface FeishuMessageQuery {
  keyword?: string
  msgType?: string
  startDate?: string
  endDate?: string
  pageNum?: number
  pageSize?: number
}

export const feishuApi = {
  // ========== 消息 ==========
  listMessages: (params: FeishuMessageQuery) => {
    return request<ApiResponse<PageResponse<FeishuMessage>>>({
      method: 'GET',
      url: '/feishu/messages',
      params
    })
  },

  sendMessage: (data: {
    openId?: string
    userId?: string
    departmentId?: string
    msgType: string
    content: string
  }) => {
    return request<ApiResponse<{ messageId: string }>>({
      method: 'POST',
      url: '/feishu/messages',
      data
    })
  },

  // ========== 同步 ==========
  syncUsers: () => {
    return request<ApiResponse<{
      syncedCount: number
      failedCount: number
      totalCount: number
    }>>({
      method: 'POST',
      url: '/feishu/users/sync'
    })
  },

  pushCalendar: (data: { title: string; startTime: string; endTime: string; attendees?: string[] }) => {
    return request<ApiResponse<{ calendarId: string }>>({
      method: 'POST',
      url: '/feishu/calendars/push',
      data
    })
  },

  pushApproval: (data: { approvalName: string; formFields: Record<string, string>; approvers?: string[] }) => {
    return request<ApiResponse<{ approvalNo: string }>>({
      method: 'POST',
      url: '/feishu/approvals/push',
      data
    })
  },

  syncBitable: (data: { tableName: string; records: Record<string, any>[] }) => {
    return request<ApiResponse<{ syncedCount: number }>>({
      method: 'POST',
      url: '/feishu/bitable/sync',
      data
    })
  },

  sendBotCommand: (data: { command: string; params?: Record<string, string> }) => {
    return request<ApiResponse<{ result: string }>>({
      method: 'POST',
      url: '/feishu/bot/commands',
      data
    })
  }
}