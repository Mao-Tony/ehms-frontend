import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, InternalAxiosRequestConfig } from 'axios'
import { ElMessage } from 'element-plus'
import router from '@/router'

const BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api/v1'

// ========== 字段名转换 ==========
// 后端全用 snake_case，前端全用 camelCase，拦截器自动双向转换
// 但 page / page_size 是后端 Query 参数的标准名，前端发送时不再转换它们
const PRESERVE_KEYS = new Set(['page', 'page_size', 'pageSize'])

function toSnakeCase(str: string): string {
  return str.replace(/[A-Z]/g, c => '_' + c.toLowerCase())
}

function toCamelCase(str: string): string {
  return str.replace(/_([a-z])/g, (_, c) => c.toUpperCase())
}

function convertKeys<T>(obj: T, converter: (k: string) => string): T {
  if (obj === null || obj === undefined) return obj
  if (Array.isArray(obj)) {
    return obj.map(item => convertKeys(item, converter)) as unknown as T
  }
  if (typeof obj === 'object') {
    const result: any = {}
    for (const key of Object.keys(obj as any)) {
      const newKey = PRESERVE_KEYS.has(key) ? key : converter(key)
      result[newKey] = convertKeys((obj as any)[key], converter)
    }
    return result
  }
  return obj
}

// 判断响应是否为裸数据（无 {code, data} 包装）
function isWrappedResponse(res: any): boolean {
  return res && typeof res === 'object' && 'code' in res && ('data' in res || 'msg' in res || 'message' in res)
}

// 把裸响应包装成统一的 {code, data} 结构
function wrapBare(res: any): any {
  return { code: 0, message: 'success', data: res }
}

// ==================================================

const instance: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json'
  }
})

instance.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('ehms_token')
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`
    }
    // pageNum -> page 别名（兼容老代码）
    if (config.params && typeof config.params === 'object') {
      const p: any = { ...config.params }
      if (p.pageNum !== undefined && p.page === undefined) {
        p.page = p.pageNum
        delete p.pageNum
      }
      if (p.pageSize !== undefined && p.page_size === undefined) {
        p.page_size = p.pageSize
        delete p.pageSize
      }
      config.params = p
    }
    // 请求参数 camelCase → snake_case（后端期望）
    if (config.params) {
      config.params = convertKeys(config.params, toSnakeCase)
    }
    if (config.data && typeof config.data === 'object' && !Array.isArray(config.data)) {
      config.data = convertKeys(config.data, toSnakeCase)
    }
    return config
  },
  (error) => Promise.reject(error)
)

instance.interceptors.response.use(
  (response: AxiosResponse) => {
    let res = response.data

    // 后端可能返回裸 DTO/PageResponse，没有 {code, data} 包装，统一包一层
    if (!isWrappedResponse(res)) {
      res = wrapBare(res)
    }

    if (res.code !== 0 && res.code !== 200) {
      ElMessage.error(res.message || res.msg || '请求失败')
      if (res.code === 401 || res.code === 2001 || res.code === 2002) {
        localStorage.removeItem('ehms_token')
        localStorage.removeItem('ehms_user')
        router.push('/login')
      }
      return Promise.reject(new Error(res.message || res.msg || '请求失败'))
    }

    // 分页数据转换 + 全局 snake_case → camelCase
    if (res.data && res.data.items !== undefined) {
      const converted: any = convertKeys(res.data, toCamelCase)
      res.data = {
        ...converted,
        list: converted.items,
        pageInfo: {
          pageNum: converted.page,
          pageSize: converted.pageSize || converted.page_size,
          total: converted.total,
          pages: Math.ceil((converted.total || 0) / (converted.pageSize || converted.page_size || 20))
        }
      }
    } else if (res.data && typeof res.data === 'object') {
      res.data = convertKeys(res.data, toCamelCase)
    }
    return res
  },
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('ehms_token')
      localStorage.removeItem('ehms_user')
      router.push('/login')
    } else {
      // 处理后端裸异常（{code, msg}）
      const errData = error.response?.data
      ElMessage.error(errData?.message || errData?.msg || error.message || '网络错误')
    }
    return Promise.reject(error)
  }
)

export interface EhmsRequestConfig extends AxiosRequestConfig {
  hideError?: boolean
}

export function request<T = any>(config: EhmsRequestConfig): Promise<T> {
  return instance.request<any, T>(config)
}

export default instance
