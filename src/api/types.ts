export interface ApiResponse<T = any> {
  code: number
  message: string
  data: T
  timestamp: number
  traceId: string
}

export interface PageInfo {
  pageNum: number
  pageSize: number
  total: number
  pages: number
}

export interface PageResponse<T> {
  list: T[]
  pageInfo: PageInfo
}

export interface LoginVO {
  accessToken: string
  refreshToken: string
  expiresIn: number
  userId: number
  username: string
  realName: string
  roles: string[]
  permissions: string[]
  deptId: number
  deptName: string
  avatar: string
}

export interface MenuItem {
  id: number
  name: string
  path: string
  component: string
  icon: string
  parentId: number
  orderNum: number
  children?: MenuItem[]
}

export interface UserInfo {
  userId: number
  username: string
  realName: string
  avatar: string
  roles: string[]
  permissions: string[]
  deptId: number
  deptName: string
}
