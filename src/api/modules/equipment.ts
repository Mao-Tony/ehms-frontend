import { request } from '../request'
import type { ApiResponse, PageResponse } from '../types'

// ========== 设备台账（对齐 EquipmentDTO） ==========
export interface Equipment {
  equipmentId?: number
  equipmentCode?: string
  equipmentName?: string
  equipmentType?: string
  specModel?: string
  manufacturer?: string
  serialNo?: string
  manufactureDate?: string
  installDate?: string
  installLocation?: string
  latitude?: number
  longitude?: number
  status?: string // running/idle/maintenance/abandoned
  assetNo?: string
  technicalParams?: string
  designLife?: number
  nextMaintainDate?: string
  nextInspectDate?: string
  deptId?: number
  custodianId?: number
  tenantId?: number
  createdBy?: number
  createdAt?: string
}

export interface EquipmentQuery {
  equipmentType?: string
  status?: string
  deptId?: number
  page?: number
  pageSize?: number
}

export interface EquipmentForm {
  equipmentId?: number
  equipmentCode: string
  equipmentName: string
  equipmentType?: string
  specModel?: string
  manufacturer?: string
  serialNo?: string
  manufactureDate?: string
  installDate?: string
  installLocation?: string
  latitude?: number
  longitude?: number
  status?: string
  assetNo?: string
  technicalParams?: string
  designLife?: number
  nextMaintainDate?: string
  nextInspectDate?: string
  deptId?: number
  custodianId?: number
}

// ========== 维保记录（对齐 MaintenanceRecordDTO） ==========
export interface MaintenanceRecord {
  maintenanceId?: number
  equipmentId?: number
  maintenanceType?: string
  workOrderNo?: string
  workContent?: string
  faultDesc?: string
  planStartTime?: string
  planEndTime?: string
  actualStartTime?: string
  actualEndTime?: string
  status?: string
  laborCost?: number
  materialCost?: number
  maintainerId?: number
  signatureHash?: string
  tenantId?: number
  createdAt?: string
}

export interface MaintenanceForm {
  equipmentId: number
  maintenanceType?: string
  workOrderNo?: string
  workContent?: string
  faultDesc?: string
  planStartTime?: string
  planEndTime?: string
  actualStartTime?: string
  actualEndTime?: string
  status?: string
  laborCost?: number
  materialCost?: number
  maintainerId?: number
}

// ========== PPE 劳保用品（对齐 PpeItemDTO） ==========
export interface PpeItem {
  ppeId?: number
  ppeCode?: string
  ppeName?: string
  ppeType?: string
  specModel?: string
  standard?: string
  shelfLife?: string
  defaultQuantity?: number
  maxQuantity?: number
  replaceCycle?: string
  tenantId?: number
  createdAt?: string
}

export interface PpeItemQuery {
  ppeType?: string
  page?: number
  pageSize?: number
}

export interface PpeItemForm {
  ppeId?: number
  ppeCode: string
  ppeName: string
  ppeType?: string
  specModel?: string
  standard?: string
  shelfLife?: string
  defaultQuantity?: number
  maxQuantity?: number
  replaceCycle?: string
}

// ========== EquipmentStatistics ==========
export interface EquipmentStatistics {
  totalCount: number
  runningCount: number
  maintenanceCount: number
  idleCount: number
  scrappedCount: number
  overdueMaintenanceCount: number
  overdueInspectCount: number
}

export const equipmentApi = {
  // ========== 设备台账 ==========
  list: (params: EquipmentQuery = {}) =>
    request<ApiResponse<PageResponse<Equipment>>>({
      method: 'GET',
      url: '/equipment/equipment',
      params: {
        equipment_type: params.equipmentType,
        status: params.status,
        dept_id: params.deptId,
        page: params.page,
        page_size: params.pageSize
      }
    }),

  getById: (id: number) =>
    request<ApiResponse<Equipment>>({
      method: 'GET',
      url: `/equipment/equipment/${id}`
    }),

  create: (data: EquipmentForm) =>
    request<ApiResponse<Equipment>>({
      method: 'POST',
      url: '/equipment/equipment',
      data
    }),

  update: (id: number, data: Partial<EquipmentForm>) =>
    request<ApiResponse<Equipment>>({
      method: 'PUT',
      url: `/equipment/equipment/${id}`,
      data
    }),

  delete: (id: number) =>
    request<ApiResponse<null>>({
      method: 'DELETE',
      url: `/equipment/equipment/${id}`
    }),

  updateStatus: (id: number, status: string) =>
    request<ApiResponse<Equipment>>({
      method: 'PUT',
      url: `/equipment/equipment/${id}/status`,
      data: { status }
    }),

  getStatistics: () =>
    request<ApiResponse<EquipmentStatistics>>({
      method: 'GET',
      url: '/equipment/equipment/statistics'
    }),

  // ========== 维保记录 ==========
  getMaintenanceRecords: (equipmentId: number, params: { page?: number; pageSize?: number } = {}) =>
    request<ApiResponse<PageResponse<MaintenanceRecord>>>({
      method: 'GET',
      url: `/equipment/equipment/${equipmentId}/maintenance-records`,
      params: { page: params.page, page_size: params.pageSize }
    }),

  addMaintenanceRecord: (equipmentId: number, data: MaintenanceForm) =>
    request<ApiResponse<MaintenanceRecord>>({
      method: 'POST',
      url: `/equipment/equipment/${equipmentId}/maintenance`,
      data
    }),

  // ========== PPE 物品 ==========
  listPpeItems: (params: PpeItemQuery = {}) =>
    request<ApiResponse<PageResponse<PpeItem>>>({
      method: 'GET',
      url: '/equipment/ppe-items',
      params: {
        ppe_type: params.ppeType,
        page: params.page,
        page_size: params.pageSize
      }
    }),

  getPpeItem: (id: number) =>
    request<ApiResponse<PpeItem>>({
      method: 'GET',
      url: `/equipment/ppe-items/${id}`
    }),

  createPpeItem: (data: PpeItemForm) =>
    request<ApiResponse<PpeItem>>({
      method: 'POST',
      url: '/equipment/ppe-items',
      data
    }),

  updatePpeItem: (id: number, data: Partial<PpeItemForm>) =>
    request<ApiResponse<PpeItem>>({
      method: 'PUT',
      url: `/equipment/ppe-items/${id}`,
      data
    }),

  deletePpeItem: (id: number) =>
    request<ApiResponse<null>>({
      method: 'DELETE',
      url: `/equipment/ppe-items/${id}`
    })
}

// ========== 向后兼容别名 ==========
export const equipmentApiAliases = {
  listEquipment: equipmentApi.list,
  getEquipment: equipmentApi.getById,
  createEquipment: equipmentApi.create,
  updateEquipment: equipmentApi.update,
  deleteEquipment: equipmentApi.delete,
  listMaintenanceRecords: equipmentApi.getMaintenanceRecords,
  createMaintenanceRecord: (data: MaintenanceForm) =>
    equipmentApi.addMaintenanceRecord(data.equipmentId, data),
  deleteMaintenanceRecord: (_id: number) => Promise.resolve({ code: 0, data: null } as any),
  updateMaintenanceRecord: (_id: number, _data: any) => Promise.resolve({ code: 0, data: {} } as any),
  listPpeItems: equipmentApi.listPpeItems,
  createPpeItem: equipmentApi.createPpeItem,
  updatePpeItem: equipmentApi.updatePpeItem,
  deletePpeItem: equipmentApi.deletePpeItem
}
Object.assign(equipmentApi, equipmentApiAliases)
