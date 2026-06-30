import { request } from '../request'
import type { ApiResponse, PageResponse } from '../types'

// ========== 消防设备 (对齐后端 FireEquipmentDTO) ==========
export interface FireEquipment {
  equipmentId: number
  equipmentCode: string
  equipmentName: string
  equipmentType?: string
  factoryArea?: string
  location?: string
  brand?: string
  manufactureDate?: string
  installDate?: string
  nextInspectDate?: string
  status?: string
  responsibleDept?: number
  responsiblePerson?: number
  remark?: string
  tenantId?: number
  createdAt?: string
  updatedAt?: string
}

export interface FireEquipmentQuery {
  factoryArea?: string
  equipmentType?: string
  status?: string
  page?: number
  pageSize?: number
}

export interface FireEquipmentForm {
  equipmentCode: string
  equipmentName: string
  equipmentType?: string
  factoryArea?: string
  location?: string
  brand?: string
  manufactureDate?: string
  installDate?: string
  nextInspectDate?: string
  status?: string
  responsibleDept?: number
  responsiblePerson?: number
  remark?: string
}

// ========== 消防检查 (对齐后端 FireInspectionDTO) ==========
export interface FireInspection {
  inspectionId: number
  inspectionCode: string
  inspectionType?: string
  inspectionDate?: string
  inspectorId?: number
  inspectorName?: string
  deptId?: number
  location?: string
  result?: string
  hazardCount?: number
  remark?: string
  attachmentUrl?: string
  tenantId?: number
  createdAt?: string
  updatedAt?: string
}

export interface FireInspectionQuery {
  inspectionType?: string
  page?: number
  pageSize?: number
}

export interface FireInspectionForm {
  inspectionCode: string
  inspectionType?: string
  inspectionDate?: string
  deptId?: number
  location?: string
  result?: string
  hazardCount?: number
  remark?: string
  attachmentUrl?: string
}

// ========== 消防分区 (对齐后端 FireZoneDTO) ==========
export interface FireZone {
  zoneId: number
  zoneCode: string
  zoneName: string
  zoneType?: string
  areaRange?: string
  fireRating?: string
  exitCount?: number
  fireEqCount?: number
  status?: string
  tenantId?: number
  createdAt?: string
  updatedAt?: string
}

export interface FireZoneQuery {
  zoneType?: string
  page?: number
  pageSize?: number
}

export interface FireZoneForm {
  zoneCode: string
  zoneName: string
  zoneType?: string
  areaRange?: string
  fireRating?: string
  exitCount?: number
  fireEqCount?: number
  status?: string
}

// ========== 安全活动记录 (对齐后端 FireSafetyRecordDTO) ==========
export interface FireSafetyRecord {
  recordId: number
  recordType?: string
  recordDate?: string
  title: string
  content?: string
  participantCount?: number
  trainer?: string
  durationHours?: number
  attachmentUrl?: string
  organizerId?: number
  deptId?: number
  tenantId?: number
  createdAt?: string
  updatedAt?: string
}

export interface FireSafetyRecordQuery {
  recordType?: string
  page?: number
  pageSize?: number
}

export interface FireSafetyRecordForm {
  recordType?: string
  recordDate?: string
  title: string
  content?: string
  participantCount?: number
  trainer?: string
  durationHours?: number
  attachmentUrl?: string
  deptId?: number
}

export const fireApi = {
  // ========== 消防设备 ==========
  listEquipment: (params?: FireEquipmentQuery) => {
    return request<ApiResponse<PageResponse<FireEquipment>>>({
      method: 'GET',
      url: '/fire/fire-equipment',
      params
    })
  },

  getEquipment: (id: number) => {
    return request<ApiResponse<FireEquipment>>({
      method: 'GET',
      url: `/fire/fire-equipment/${id}`
    })
  },

  createEquipment: (data: FireEquipmentForm) => {
    return request<ApiResponse<FireEquipment>>({
      method: 'POST',
      url: '/fire/fire-equipment',
      data
    })
  },

  updateEquipment: (id: number, data: Partial<FireEquipmentForm>) => {
    return request<ApiResponse<FireEquipment>>({
      method: 'PUT',
      url: `/fire/fire-equipment/${id}`,
      data
    })
  },

  deleteEquipment: (id: number) => {
    return request<ApiResponse<null>>({
      method: 'DELETE',
      url: `/fire/fire-equipment/${id}`
    })
  },

  inspectEquipment: (id: number) => {
    return request<ApiResponse<any>>({
      method: 'POST',
      url: `/fire/fire-equipment/${id}/inspect`
    })
  },

  // ========== 消防检查 ==========
  listInspections: (params?: FireInspectionQuery) => {
    return request<ApiResponse<PageResponse<FireInspection>>>({
      method: 'GET',
      url: '/fire/fire-inspections',
      params
    })
  },

  getInspection: (id: number) => {
    return request<ApiResponse<FireInspection>>({
      method: 'GET',
      url: `/fire/fire-inspections/${id}`
    })
  },

  createInspection: (data: FireInspectionForm) => {
    return request<ApiResponse<FireInspection>>({
      method: 'POST',
      url: '/fire/fire-inspections',
      data
    })
  },

  updateInspection: (id: number, data: Partial<FireInspectionForm>) => {
    return request<ApiResponse<FireInspection>>({
      method: 'PUT',
      url: `/fire/fire-inspections/${id}`,
      data
    })
  },

  // ========== 消防分区 ==========
  listZones: (params?: FireZoneQuery) => {
    return request<ApiResponse<PageResponse<FireZone>>>({
      method: 'GET',
      url: '/fire/fire-zones',
      params
    })
  },

  getZone: (id: number) => {
    return request<ApiResponse<FireZone>>({
      method: 'GET',
      url: `/fire/fire-zones/${id}`
    })
  },

  createZone: (data: FireZoneForm) => {
    return request<ApiResponse<FireZone>>({
      method: 'POST',
      url: '/fire/fire-zones',
      data
    })
  },

  updateZone: (id: number, data: Partial<FireZoneForm>) => {
    return request<ApiResponse<FireZone>>({
      method: 'PUT',
      url: `/fire/fire-zones/${id}`,
      data
    })
  },

  deleteZone: (id: number) => {
    return request<ApiResponse<null>>({
      method: 'DELETE',
      url: `/fire/fire-zones/${id}`
    })
  },

  // ========== 安全活动记录 ==========
  listSafetyRecords: (params?: FireSafetyRecordQuery) => {
    return request<ApiResponse<PageResponse<FireSafetyRecord>>>({
      method: 'GET',
      url: '/fire/fire-safety-records',
      params
    })
  },

  createSafetyRecord: (data: FireSafetyRecordForm) => {
    return request<ApiResponse<FireSafetyRecord>>({
      method: 'POST',
      url: '/fire/fire-safety-records',
      data
    })
  }
}
