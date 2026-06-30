import dayjs from 'dayjs'
import 'dayjs/locale/zh-cn'

dayjs.locale('zh-cn')

export function formatDate(date: string | Date | number, format: string = 'YYYY-MM-DD'): string {
  if (!date) return '-'
  return dayjs(date).format(format)
}

export function formatDateTime(date: string | Date | number, format: string = 'YYYY-MM-DD HH:mm:ss'): string {
  if (!date) return '-'
  return dayjs(date).format(format)
}

export function formatTime(date: string | Date | number, format: string = 'HH:mm:ss'): string {
  if (!date) return '-'
  return dayjs(date).format(format)
}

export function formatRelativeTime(date: string | Date | number): string {
  if (!date) return '-'
  const now = dayjs()
  const target = dayjs(date)
  const diffMinutes = now.diff(target, 'minute')
  const diffHours = now.diff(target, 'hour')
  const diffDays = now.diff(target, 'day')

  if (diffMinutes < 1) return '刚刚'
  if (diffMinutes < 60) return `${diffMinutes}分钟前`
  if (diffHours < 24) return `${diffHours}小时前`
  if (diffDays < 7) return `${diffDays}天前`
  return target.format('YYYY-MM-DD')
}

export function formatNumber(num: number | string | undefined, decimals: number = 0): string {
  if (num === undefined || num === null || num === '') return '-'
  const n = Number(num)
  if (isNaN(n)) return '-'
  return n.toFixed(decimals).replace(/\B(?=(\d{3})+(?!\d))/g, ',')
}

export function formatPercentage(value: number | string | undefined, decimals: number = 1): string {
  if (value === undefined || value === null || value === '') return '-'
  const n = Number(value)
  if (isNaN(n)) return '-'
  return `${(n * 100).toFixed(decimals)}%`
}

export function formatFileSize(bytes: number | string | undefined): string {
  if (bytes === undefined || bytes === null || bytes === '') return '-'
  const size = Number(bytes)
  if (isNaN(size)) return '-'
  if (size < 1024) return `${size} B`
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(2)} KB`
  if (size < 1024 * 1024 * 1024) return `${(size / 1024 / 1024).toFixed(2)} MB`
  return `${(size / 1024 / 1024 / 1024).toFixed(2)} GB`
}

export function formatCurrency(amount: number | string | undefined, decimals: number = 2): string {
  if (amount === undefined || amount === null || amount === '') return '-'
  const n = Number(amount)
  if (isNaN(n)) return '-'
  return `¥ ${n.toFixed(decimals).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`
}

export function formatDuration(seconds: number | undefined, format: string = 'HH:mm:ss'): string {
  if (seconds === undefined || seconds === null) return '-'
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const secs = seconds % 60
  if (format === 'HH:mm:ss') {
    return [hours, minutes, secs].map(v => v.toString().padStart(2, '0')).join(':')
  }
  if (hours > 0) return `${hours}小时${minutes}分钟`
  if (minutes > 0) return `${minutes}分钟`
  return `${secs}秒`
}

export function truncate(str: string | undefined, length: number = 50, suffix: string = '...'): string {
  if (!str) return ''
  if (str.length <= length) return str
  return str.substring(0, length) + suffix
}

export { dayjs }
