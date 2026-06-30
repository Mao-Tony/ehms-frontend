import { request } from '../request'
import type { ApiResponse, PageResponse } from '../types'

// ========== 化学品台账 (对应后端 /api/v1/hazmat/chemicals) ==========
export interface HazmatChemical {
  chemical_id: number
  chemical_code: string
  chemical_name: string
  cas_no?: string
  un_no?: string
  hazard_class?: string
  danger_level?: string
  spec_model?: string
  unit?: string
  storage_location?: string
  max_storage?: number
  sds_url?: string
  status?: number
  tenant_id?: number
  created_by?: number
  created_at?: string
  updated_by?: number
  updated_at?: string
}

export interface HazmatChemicalQuery {
  hazard_class?: string
  status?: number
  keyword?: string
  page?: number
  page_size?: number
}

export interface HazmatChemicalForm {
  chemical_code: string
  chemical_name: string
  cas_no?: string
  un_no?: string
  hazard_class?: string
  danger_level?: string
  spec_model?: string
  unit?: string
  storage_location?: string
  max_storage?: number
  sds_url?: string
}

// ========== 库存 (对应后端 /api/v1/hazmat/stocks) ==========
export interface HazmatStock {
  stock_id: number
  chemical_id: number
  batch_no?: string
  quantity?: number
  unit?: string
  warehouse_location?: string
  manufacture_date?: string
  expire_date?: string
  supplier?: string
  min_stock?: number
  max_stock?: number
  status?: number
}

export interface HazmatStockForm {
  batch_no?: string
  quantity?: number
  unit?: string
  warehouse_location?: string
  manufacture_date?: string
  expire_date?: string
  supplier?: string
  min_stock?: number
  max_stock?: number
}

// ========== 转移记录 (对应后端 /api/v1/hazmat/transfer-records) ==========
export interface HazmatTransferRecord {
  record_id: number
  stock_id: number
  chemical_id: number
  record_type: string
  quantity: number
  batch_no?: string
  operator_id?: number
  operate_time?: string
  purpose?: string
  receiver_id?: number
  approval_status?: string
  remark?: string
}

export interface HazmatTransferRecordForm {
  record_type: string
  quantity: number
  batch_no?: string
  purpose?: string
  remark?: string
}

// ========== 存储位置 (对应后端 /api/v1/hazmat/storage-locations) ==========
export interface StorageLocation {
  location_id: number
  location_code: string
  location_name: string
  location_type?: string
  capacity?: number
  current_load?: number
  status?: string
}

export interface StorageLocationForm {
  location_code: string
  location_name: string
  location_type?: string
  capacity?: number
  current_load?: number
}

// ========== MSDS (对应后端 /api/v1/hazmat/msds) ==========
export interface Msds {
  msds_id?: number
  chemical_id?: number
  version?: string
  hazard_overview?: string
  first_aid_measures?: string
  fire_fighting_measures?: string
  leakage_emergency?: string
  handling_storage?: string
  exposure_control?: string
  toxicological_info?: string
  ecological_info?: string
  disposal_considerations?: string
  transport_info?: string
  regulatory_info?: string
  attachments?: string[]
  create_time?: string
  update_time?: string
}

export interface MsdsForm {
  version?: string
  hazard_overview?: string
  first_aid_measures?: string
  fire_fighting_measures?: string
  leakage_emergency?: string
  handling_storage?: string
  exposure_control?: string
  toxicological_info?: string
  ecological_info?: string
  disposal_considerations?: string
  transport_info?: string
  regulatory_info?: string
  attachments?: string[]
}

// ========== 库存汇总 (对应后端 /api/v1/hazmat/inventory - InventoryDTO) ==========
export interface InventoryRecord {
  chemical_id: number
  chemical_name: string
  cas_no?: string
  total_quantity: number
  unit?: string
  min_stock?: number
  max_stock?: number
  expire_alert?: boolean
}

export const hazmatApi = {
  // ========== 化学品台账 ==========
  list: (params: HazmatChemicalQuery) => {
    return request<ApiResponse<PageResponse<HazmatChemical>>>({
      method: 'GET',
      url: '/hazmat/chemicals',
      params: {
        hazard_class: params?.hazard_class,
        status: params?.status,
        keyword: params?.keyword,
        page: params?.page,
        page_size: params?.page_size
      }
    })
  },

  getById: (chemicalId: number) => {
    return request<ApiResponse<HazmatChemical>>({
      method: 'GET',
      url: `/hazmat/chemicals/${chemicalId}`
    })
  },

  create: (data: HazmatChemicalForm) => {
    return request<ApiResponse<HazmatChemical>>({
      method: 'POST',
      url: '/hazmat/chemicals',
      data
    })
  },

  update: (chemicalId: number, data: Partial<HazmatChemicalForm>) => {
    return request<ApiResponse<HazmatChemical>>({
      method: 'PUT',
      url: `/hazmat/chemicals/${chemicalId}`,
      data
    })
  },

  delete: (chemicalId: number) => {
    return request<ApiResponse<null>>({
      method: 'DELETE',
      url: `/hazmat/chemicals/${chemicalId}`
    })
  },

  // ========== 库存 ==========
  listStocks: (params: { chemical_id?: number; status?: number; page?: number; page_size?: number }) => {
    return request<ApiResponse<PageResponse<HazmatStock>>>({
      method: 'GET',
      url: '/hazmat/stocks',
      params: {
        chemical_id: params?.chemical_id,
        status: params?.status,
        page: params?.page,
        page_size: params?.page_size
      }
    })
  },

  createStock: (chemicalId: number, data: HazmatStockForm) => {
    return request<ApiResponse<HazmatStock>>({
      method: 'POST',
      url: '/hazmat/stocks',
      params: { chemical_id: chemicalId },
      data
    })
  },

  updateStock: (stockId: number, data: Partial<HazmatStockForm>) => {
    return request<ApiResponse<HazmatStock>>({
      method: 'PUT',
      url: `/hazmat/stocks/${stockId}`,
      data
    })
  },

  // ========== 转移记录 ==========
  listTransferRecords: (params: { record_type?: string; approval_status?: string; page?: number; page_size?: number }) => {
    return request<ApiResponse<PageResponse<HazmatTransferRecord>>>({
      method: 'GET',
      url: '/hazmat/transfer-records',
      params: {
        record_type: params?.record_type,
        approval_status: params?.approval_status,
        page: params?.page,
        page_size: params?.page_size
      }
    })
  },

  createTransferRecord: (stockId: number, data: HazmatTransferRecordForm) => {
    return request<ApiResponse<HazmatTransferRecord>>({
      method: 'POST',
      url: '/hazmat/transfer-records',
      params: { stock_id: stockId },
      data
    })
  },

  approveTransferRecord: (recordId: number) => {
    return request<ApiResponse<HazmatTransferRecord>>({
      method: 'POST',
      url: `/hazmat/transfer-records/${recordId}/approve`
    })
  },

  // ========== 存储位置 ==========
  listStorageLocations: (params: { status?: string; page?: number; page_size?: number }) => {
    return request<ApiResponse<PageResponse<StorageLocation>>>({
      method: 'GET',
      url: '/hazmat/storage-locations',
      params: { status: params?.status, page: params?.page, page_size: params?.page_size }
    })
  },

  createStorageLocation: (data: StorageLocationForm) => {
    return request<ApiResponse<StorageLocation>>({
      method: 'POST',
      url: '/hazmat/storage-locations',
      data
    })
  },

  updateStorageLocation: (locationId: number, data: Partial<StorageLocationForm>) => {
    return request<ApiResponse<StorageLocation>>({
      method: 'PUT',
      url: `/hazmat/storage-locations/${locationId}`,
      data
    })
  },

  deleteStorageLocation: (locationId: number) => {
    return request<ApiResponse<null>>({
      method: 'DELETE',
      url: `/hazmat/storage-locations/${locationId}`
    })
  },

  // ========== MSDS ==========
  listMsds: (params: { chemical_id?: number; page?: number; page_size?: number }) => {
    return request<ApiResponse<PageResponse<Msds>>>({
      method: 'GET',
      url: '/hazmat/msds',
      params: {
        chemical_id: params?.chemical_id,
        page: params?.page,
        page_size: params?.page_size
      }
    })
  },

  getMsds: (msdsId: number) => {
    return request<ApiResponse<Msds>>({
      method: 'GET',
      url: `/hazmat/msds/${msdsId}`
    })
  },

  createMsds: (chemicalId: number, data: MsdsForm) => {
    return request<ApiResponse<Msds>>({
      method: 'POST',
      url: '/hazmat/msds',
      params: { chemical_id: chemicalId },
      data
    })
  },

  updateMsds: (msdsId: number, data: Partial<MsdsForm>) => {
    return request<ApiResponse<Msds>>({
      method: 'PUT',
      url: `/hazmat/msds/${msdsId}`,
      data
    })
  },

  // ========== 库存汇总 ==========
  listInventory: (params?: { page?: number; page_size?: number }) => {
    return request<ApiResponse<PageResponse<InventoryRecord>>>({
      method: 'GET',
      url: '/hazmat/inventory',
      params: { page: params?.page, page_size: params?.page_size }
    })
  },

  getStatistics: () => {
    return request<ApiResponse<any>({
      method: 'GET',
      url: '/hazmat/statistics'
    })
  }
}