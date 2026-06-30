import { request } from '../request'
import type { ApiResponse, LoginVO, MenuItem, UserInfo, PageResponse, PageInfo } from '../types'

export interface LoginDTO {
  username: string
  password: string
  captchaId?: string
  captchaCode?: string
}

export interface MenuQuery {
  type?: number
}

export const authApi = {
  login: (data: LoginDTO) => {
    return request<ApiResponse<LoginVO>>({
      method: 'POST',
      url: '/auth/login',
      data
    })
  },

  logout: () => {
    return request<ApiResponse<null>>({
      method: 'POST',
      url: '/auth/logout'
    })
  },

  getCurrentUser: () => {
    return request<ApiResponse<UserInfo>>({
      method: 'GET',
      url: '/auth/me'
    })
  },

  getMenus: (params?: MenuQuery) => {
    return request<ApiResponse<MenuItem[]>>({
      method: 'GET',
      url: '/auth/menus',
      params
    })
  },

  refreshToken: (data: { refreshToken: string }) => {
    return request<ApiResponse<LoginVO>>({
      method: 'POST',
      url: '/auth/refresh',
      data
    })
  },

  larkCallback: (params: { code: string; state?: string }) => {
    return request<ApiResponse<LoginVO>>({
      method: 'GET',
      url: '/auth/feishu/callback',
      params
    })
  },

  bindFeishu: (data: { code: string }) => {
    return request<ApiResponse<null>>({
      method: 'POST',
      url: '/auth/feishu/bind',
      data
    })
  },

  unbindFeishu: () => {
    return request<ApiResponse<null>>({
      method: 'POST',
      url: '/auth/feishu/unbind'
    })
  },

  changePassword: (data: { oldPassword: string; newPassword: string }) => {
    return request<ApiResponse<null>>({
      method: 'PUT',
      url: '/auth/password',
      data
    })
  },

  getCaptcha: () => {
    return request<ApiResponse<{ captchaKey: string; imageBase64: string }>>({
      method: 'GET',
      url: '/auth/captcha'
    })
  },

  sendSmsCode: (data: { mobile: string }) => {
    return request<ApiResponse<{ message: string }>>({
      method: 'POST',
      url: '/auth/sms-code',
      data
    })
  },

  smsLogin: (data: { mobile: string; smsCode: string }) => {
    return request<ApiResponse<LoginVO>>({
      method: 'POST',
      url: '/auth/sms-login',
      data: { mobile: data.mobile, sms_code: data.smsCode }
    })
  }
}
