import { request } from '../request'
import type { ApiResponse, PageResponse } from '../types'

// ========== 应急预案 ==========
export interface EmergencyPlan {
  id: number
  title: string
  planType: 'FIRE' | 'CHEMICAL_LEAK' | 'ELECTRICAL' | 'MACHINERY' | 'ENVIRONMENTAL' | 'OTHER'
  typeName: string
  content: string
  departmentId: number
  departmentName: string
  attachments?: string[]
  version: string
  effectiveDate: string
  status: 'DRAFT' | 'PUBLISHED' | 'EFFECTIVE' | 'EXPIRED'
  reviewerId?: number
  reviewerName?: string
  createTime: string
  updateTime: string
}

export interface EmergencyPlanQuery {
  keyword?: string
  planType?: string
  status?: string
  departmentId?: number
  pageNum?: number
  pageSize?: number
}

export interface EmergencyPlanForm {
  id?: number
  title: string
  planType: string
  content: string
  departmentId: number
  attachments?: string[]
  version: string
  effectiveDate: string
}

// ========== 应急资源 ==========
export interface EmergencyResource {
  id: number
  name: string
  category: string
  specification: string
  unit: string
  quantity: number
  availableQuantity: number
  location: string
  departmentId: number
  departmentName: string
  responsiblePerson?: string
  phone?: string
  lastCheckDate?: string
  nextCheckDate?: string
  status: 'NORMAL' | 'IN_USE' | 'MAINTENANCE' | 'BROKEN'
  attachments?: string[]
  createTime: string
  updateTime: string
}

export interface EmergencyResourceQuery {
  keyword?: string
  category?: string
  status?: string
  departmentId?: number
  pageNum?: number
  pageSize?: number
}

export interface EmergencyResourceForm {
  id?: number
  name: string
  category: string
  specification: string
  unit: string
  quantity: number
  location: string
  departmentId: number
  responsiblePerson?: string
  phone?: string
  attachments?: string[]
}

// ========== 事故/事件 ==========
export interface Incident {
  id: number
  incidentNo: string
  title: string
  incidentType: string
  severityLevel: 'MINOR' | 'GENERAL' | 'SERIOUS' | 'MAJOR'
  location: string
  occurrenceTime: string
  departmentId: number
  departmentName: string
  involvedPersons?: string
  injuryCondition?: string
  propertyLoss?: number
  causeAnalysis?: string
  treatment?: string
  attachments?: string[]
  status: 'REPORTED' | 'INVESTIGATING' | 'CLOSED'
  investigatorId?: number
  investigatorName?: string
  createTime: string
  updateTime: string
}

export interface IncidentQuery {
  keyword?: string
  incidentType?: string
  severityLevel?: string
  status?: string
  departmentId?: number
  startDate?: string
  endDate?: string
  pageNum?: number
  pageSize?: number
}

export interface IncidentForm {
  id?: number
  title: string
  incidentType: string
  severityLevel: string
  location: string
  occurrenceTime: string
  departmentId: number
  involvedPersons?: string
  injuryCondition?: string
  propertyLoss?: number
  causeAnalysis?: string
  treatment?: string
  attachments?: string[]
}

// ========== 应急演练 ==========
export interface EmergencyDrill {
  id: number
  drillName: string
  drillType: string
  scenario: string
  participantCount: number
  location: string
  planDate: string
  actualDate?: string
  duration: number
  evaluator?: string
  score?: number
  evaluation?: string
  attachments?: string[]
  status: 'PLANNED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED'
  departmentId: number
  departmentName: string
  createTime: string
  updateTime: string
}

export interface EmergencyDrillQuery {
  keyword?: string
  drillType?: string
  status?: string
  departmentId?: number
  pageNum?: number
  pageSize?: number
}

export interface EmergencyDrillForm {
  id?: number
  drillName: string
  drillType: string
  scenario: string
  participantCount: number
  location: string
  planDate: string
  actualDate?: string
  duration: number
  attachments?: string[]
  departmentId: number
}

export const emergencyApi = {
  // ========== 应急预案 ==========
  listPlans: (params: EmergencyPlanQuery) => {
    return request<ApiResponse<PageResponse<EmergencyPlan>>>({
      method: 'GET',
      url: '/emergency/emergency-plans',
      params
    })
  },

  getPlanById: (id: number) => {
    return request<ApiResponse<EmergencyPlan>>({
      method: 'GET',
      url: `/emergency/emergency-plans/${id}`
    })
  },

  createPlan: (data: EmergencyPlanForm) => {
    return request<ApiResponse<EmergencyPlan>>({
      method: 'POST',
      url: '/emergency/emergency-plans',
      data
    })
  },

  updatePlan: (id: number, data: EmergencyPlanForm) => {
    return request<ApiResponse<EmergencyPlan>>({
      method: 'PUT',
      url: `/emergency/emergency-plans/${id}`,
      data
    })
  },

  deletePlan: (id: number) => {
    return request<ApiResponse<null>>({
      method: 'DELETE',
      url: `/emergency/emergency-plans/${id}`
    })
  },

  publishPlan: (id: number) => {
    return request<ApiResponse<EmergencyPlan>>({
      method: 'POST',
      url: `/emergency/emergency-plans/${id}/publish`
    })
  },

  // ========== 应急资源 ==========
  listResources: (params: EmergencyResourceQuery) => {
    return request<ApiResponse<PageResponse<EmergencyResource>>>({
      method: 'GET',
      url: '/emergency/emergency-resources',
      params
    })
  },

  getResourceById: (id: number) => {
    return request<ApiResponse<EmergencyResource>>({
      method: 'GET',
      url: `/emergency/emergency-resources/${id}`
    })
  },

  createResource: (data: EmergencyResourceForm) => {
    return request<ApiResponse<EmergencyResource>>({
      method: 'POST',
      url: '/emergency/emergency-resources',
      data
    })
  },

  updateResource: (id: number, data: EmergencyResourceForm) => {
    return request<ApiResponse<EmergencyResource>>({
      method: 'PUT',
      url: `/emergency/emergency-resources/${id}`,
      data
    })
  },

  deleteResource: (id: number) => {
    return request<ApiResponse<null>>({
      method: 'DELETE',
      url: `/emergency/emergency-resources/${id}`
    })
  },

  getResourceInventory: () => {
    return request<ApiResponse<EmergencyResource[]>>({
      method: 'GET',
      url: '/emergency/emergency-resources/inventory'
    })
  },

  // ========== 事故/事件 ==========
  listIncidents: (params: IncidentQuery) => {
    return request<ApiResponse<PageResponse<Incident>>>({
      method: 'GET',
      url: '/emergency/incidents',
      params
    })
  },

  getIncidentById: (id: number) => {
    return request<ApiResponse<Incident>>({
      method: 'GET',
      url: `/emergency/incidents/${id}`
    })
  },

  createIncident: (data: IncidentForm) => {
    return request<ApiResponse<Incident>>({
      method: 'POST',
      url: '/emergency/incidents',
      data
    })
  },

  updateIncident: (id: number, data: Partial<IncidentForm>) => {
    return request<ApiResponse<Incident>>({
      method: 'PUT',
      url: `/emergency/incidents/${id}`,
      data
    })
  },

  getIncidentStatistics: () => {
    return request<ApiResponse<{
      totalIncidents: number
      pendingInvestigations: number
      closedIncidents: number
      totalPropertyLoss: number
      trendData: { month: string; count: number }[]
    }>>({
      method: 'GET',
      url: '/emergency/incidents/statistics'
    })
  },

  // ========== 应急演练 ==========
  listDrills: (params: EmergencyDrillQuery) => {
    return request<ApiResponse<PageResponse<EmergencyDrill>>>({
      method: 'GET',
      url: '/emergency/emergency-drills',
      params
    })
  },

  getDrillById: (id: number) => {
    return request<ApiResponse<EmergencyDrill>>({
      method: 'GET',
      url: `/emergency/emergency-drills/${id}`
    })
  },

  createDrill: (data: EmergencyDrillForm) => {
    return request<ApiResponse<EmergencyDrill>>({
      method: 'POST',
      url: '/emergency/emergency-drills',
      data
    })
  },

  updateDrill: (id: number, data: Partial<EmergencyDrillForm>) => {
    return request<ApiResponse<EmergencyDrill>>({
      method: 'PUT',
      url: `/emergency/emergency-drills/${id}`,
      data
    })
  },

  activateDrill: (id: number) => {
    return request<ApiResponse<EmergencyDrill>>({
      method: 'POST',
      url: `/emergency/emergency-drills/${id}/activate`
    })
  }
}// ========== 向后兼容别名 ==========
export const emergencyApiAliases = {
  // list.vue 中调用 listAccidents（别名）
  listAccidents: emergencyApi.listIncidents,
  // incidents.vue 中调用 deleteIncident
  deleteIncident: (id: number) => emergencyApi.updateIncident(id, { status: 'CLOSED' } as any),
  // drills.vue 中调用 deleteDrill（后端无 delete 接口，友好提示）
  deleteDrill: (id: number) => request<ApiResponse<any>>({ method: 'DELETE', url: `/emergency/emergency-drills/${id}` }),
}
Object.assign(emergencyApi, emergencyApiAliases)