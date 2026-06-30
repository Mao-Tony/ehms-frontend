import { request } from '../request'
import type { ApiResponse, PageResponse } from '../types'

// ========== AI 对话 ==========
export interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
  createTime?: string
}

export interface ChatRequest {
  message: string
  scene?: string
  conversation_id?: string
}

export interface ChatResponse {
  message: string
  conversation_id: string
  scene?: string
  tokens?: number
}

// ========== 图片理解 ==========
export interface ImageUnderstandingRequest {
  imageUrl?: string
  imageBase64?: string
  question: string
}

export interface ImageUnderstandingResponse {
  description: string
  hazards?: { type: string; severity: string; location: string; suggestion: string }[]
  confidence: number
}

// ========== 向量搜索 ==========
export interface VectorSearchRequest {
  query: string
  topK?: number
  filter?: Record<string, any>
}

export interface VectorItem {
  id: number
  content: string
  metadata?: Record<string, any>
  score: number
}

export interface VectorSearchResponse {
  results: VectorItem[]
  query: string
  total: number
}

// ========== 对话会话 ==========
export interface Conversation {
  id: number
  title: string
  messageCount: number
  lastMessage?: string
  lastMessageTime?: string
  createTime: string
  updateTime: string
}

export const aiApi = {
  // ========== AI 对话 ==========
  chat: (data: ChatRequest) => {
    return request<ApiResponse<ChatResponse>>({
      method: 'POST',
      url: '/ai/chat',
      data
    })
  },

  // ========== 图片理解（隐患识别） ==========
  imageUnderstanding: (data: ImageUnderstandingRequest) => {
    return request<ApiResponse<ImageUnderstandingResponse>>({
      method: 'POST',
      url: '/ai/image-understanding',
      data
    })
  },

  // ========== 向量搜索（知识库检索） ==========
  searchVectors: (params: { query: string; biz_type?: string; topK?: number }) => {
    return request<ApiResponse<VectorSearchResponse>>({
      method: 'GET',
      url: '/ai/vectors/search',
      params: { query: params.query, biz_type: params.biz_type, limit: params.topK }
    })
  },

  searchVectorsPost: (data: VectorSearchRequest) => {
    return request<ApiResponse<VectorSearchResponse>>({
      method: 'POST',
      url: '/ai/vectors/search',
      data
    })
  },

  getVectorById: (id: number) => {
    return request<ApiResponse<VectorItem>>({
      method: 'GET',
      url: `/ai/vectors/${id}`
    })
  },

  createVector: (data: { biz_type: string; biz_id: number; content: string; metadata?: Record<string, any> }) => {
    return request<ApiResponse<VectorItem>>({
      method: 'POST',
      url: '/ai/vectors',
      data
    })
  },

  deleteVector: (id: number) => {
    return request<ApiResponse<null>>({
      method: 'DELETE',
      url: `/ai/vectors/${id}`
    })
  },

  // ========== 对话会话 ==========
  listConversations: (params?: { scene?: string; pageNum?: number; pageSize?: number }) => {
    return request<ApiResponse<PageResponse<Conversation>>>({
      method: 'GET',
      url: '/ai/conversations',
      params: { scene: params?.scene, page: params?.pageNum, page_size: params?.pageSize }
    })
  },

  getConversationById: (id: number) => {
    return request<ApiResponse<Conversation>>({
      method: 'GET',
      url: `/ai/conversations/${id}`
    })
  },

  deleteConversation: (id: number) => {
    return request<ApiResponse<null>>({
      method: 'DELETE',
      url: `/ai/conversations/${id}`
    })
  }
}