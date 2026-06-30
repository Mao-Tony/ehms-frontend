import { request } from '../request'
import type { ApiResponse, PageResponse } from '../types'

// ========== 培训课程 ==========
export interface Training {
  id: number
  courseCode: string
  title: string
  courseType: 'SAFETY_INDUCTION' | 'SKILL_TRAINING' | 'EMERGENCY_DRILL' | 'CERTIFICATE_TRAINING' | 'SPECIAL_TRAINING'
  typeName: string
  hazardType?: string
  content: string
  teacher: string
  duration: number
  location: string
  startTime: string
  endTime: string
  targetUsers: string
  departmentId: number
  departmentName: string
  attachments?: string[]
  status: 'DRAFT' | 'PUBLISHED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED'
  enrollmentCount?: number
  completionRate?: number
  createTime: string
  updateTime: string
}

export interface TrainingQuery {
  keyword?: string
  courseType?: string
  hazardType?: string
  status?: string
  departmentId?: number
  pageNum?: number
  pageSize?: number
}

export interface TrainingForm {
  id?: number
  courseCode?: string
  title: string
  courseType: string
  hazardType?: string
  content: string
  teacher: string
  duration: number
  location: string
  startTime: string
  endTime: string
  targetUsers: string
  departmentId: number
  attachments?: string[]
}

// ========== 培训报名 ==========
export interface TrainingEnrollment {
  id: number
  courseId: number
  courseTitle: string
  userId: number
  userName: string
  departmentId: number
  departmentName: string
  enrollTime: string
  completionStatus: 'ENROLLED' | 'IN_PROGRESS' | 'COMPLETED' | 'FAILED'
  score?: number
  certificateNo?: string
  createTime: string
}

// ========== 培训安排 ==========
// 对齐后端 TrainingScheduleDTO
export interface TrainingSchedule {
  scheduleId: number
  courseId: number
  scheduleType?: string
  trainDate?: string
  startTime?: string
  endTime?: string
  location?: string
  instructorId?: number
  instructorName?: string
  maxAttendees: number
  currentAttendees: number
  status: string
  tenantId?: number
  createdAt?: string
}

// ========== 考试 ==========
export interface TrainingExam {
  id: number
  examCode: string
  title: string
  courseId: number
  courseTitle: string
  examType: 'WRITTEN' | 'ONLINE' | 'PRACTICAL'
  totalScore: number
  passingScore: number
  duration: number
  examDate: string
  examLocation: string
  status: 'DRAFT' | 'PUBLISHED' | 'IN_PROGRESS' | 'COMPLETED'
  participantCount?: number
  createTime: string
}

export interface TrainingExamQuery {
  courseId?: number
  examType?: string
  status?: string
  pageNum?: number
  pageSize?: number
}

// ========== 考试记录 ==========
export interface ExamRecord {
  id: number
  examId: number
  examTitle: string
  userId: number
  userName: string
  score?: number
  passed?: boolean
  submitTime?: string
  answerSheet?: string
}

// ========== 证书 ==========
export interface TrainingCertificate {
  id: number
  certificateNo: string
  userId: number
  userName: string
  courseId: number
  courseTitle: string
  issueDate: string
  expiryDate?: string
  status: 'VALID' | 'EXPIRED' | 'REVOKED'
  verifyUrl?: string
  createTime: string
}

// ========== 培训统计 ==========
export interface TrainingStatistics {
  totalCourses: number
  activeCourses: number
  totalEnrollments: number
  completedEnrollments: number
  totalExams: number
  passedExams: number
  totalCertificates: number
  validCertificates: number
  overdueCertificates: number
  courseTypeStats: { courseType: string; count: number }[]
  monthlyStats: { month: string; count: number }[]
}

export const trainingApi = {
  // ========== 培训课程 ==========
  list: (params: TrainingQuery) => {
    return request<ApiResponse<PageResponse<Training>>>({
      method: 'GET',
      url: '/training/courses',
      params
    })
  },

  getById: (id: number) => {
    return request<ApiResponse<Training>>({
      method: 'GET',
      url: `/training/courses/${id}`
    })
  },

  create: (data: TrainingForm) => {
    return request<ApiResponse<Training>>({
      method: 'POST',
      url: '/training/courses',
      data
    })
  },

  update: (id: number, data: TrainingForm) => {
    return request<ApiResponse<Training>>({
      method: 'PUT',
      url: `/training/courses/${id}`,
      data
    })
  },

  delete: (id: number) => {
    return request<ApiResponse<null>>({
      method: 'DELETE',
      url: `/training/courses/${id}`
    })
  },

  // ========== 培训报名 ==========
  enroll: (courseId: number, data: { userId: number }) => {
    return request<ApiResponse<TrainingEnrollment>>({
      method: 'POST',
      url: `/training/courses/${courseId}/enroll`,
      data
    })
  },

  getEnrollments: (courseId: number, params?: { enrollmentStatus?: string; completionStatus?: string; pageNum?: number; pageSize?: number }) => {
    return request<ApiResponse<PageResponse<TrainingEnrollment>>>({
      method: 'GET',
      url: `/training/courses/${courseId}/enrollments`,
      params
    })
  },

  cancelEnrollment: (courseId: number, enrollmentId: number) => {
    return request<ApiResponse<null>>({
      method: 'DELETE',
      url: `/training/courses/${courseId}/enroll/${enrollmentId}`
    })
  },

  // ========== 培训安排 ==========
  getSchedules: (courseId: number) => {
    return request<ApiResponse<TrainingSchedule[]>>({
      method: 'GET',
      url: `/training/courses/${courseId}/schedule`
    })
  },

  createSchedule: (courseId: number, data: Partial<TrainingSchedule>) => {
    return request<ApiResponse<TrainingSchedule>>({
      method: 'POST',
      url: `/training/courses/${courseId}/schedule`,
      data
    })
  },

  // ========== 考试 ==========
  listExams: (params: TrainingExamQuery) => {
    return request<ApiResponse<PageResponse<TrainingExam>>>({
      method: 'GET',
      url: '/training/exams',
      params
    })
  },

  getExamById: (id: number) => {
    return request<ApiResponse<TrainingExam>>({
      method: 'GET',
      url: `/training/exams/${id}`
    })
  },

  submitExam: (id: number, data: { answer_sheet: string }) => {
    return request<ApiResponse<{ score: number; passed: boolean }>>({
      method: 'POST',
      url: `/training/exams/${id}/submit`,
      data
    })
  },

  createExam: (data: { exam_code: string; title: string; course_id: number; exam_type: string; total_score: number; passing_score: number; duration: number; exam_date: string; exam_location: string }) => {
    return request<ApiResponse<TrainingExam>>({
      method: 'POST',
      url: '/training/exams',
      data
    })
  },

  updateExam: (id: number, data: Partial<{ title: string; exam_type: string; total_score: number; passing_score: number; duration: number; exam_date: string; exam_location: string }>) => {
    return request<ApiResponse<TrainingExam>>({
      method: 'PUT',
      url: `/training/exams/${id}`,
      data
    })
  },

  deleteExam: (id: number) => {
    return request<ApiResponse<null>>({
      method: 'DELETE',
      url: `/training/exams/${id}`
    })
  },

  getExamScore: (id: number) => {
    return request<ApiResponse<ExamRecord>>({
      method: 'GET',
      url: `/training/exams/${id}/score`
    })
  },

  // ========== 证书 ==========
  listCertificates: (params?: { userId?: number; courseId?: number; pageNum?: number; pageSize?: number }) => {
    return request<ApiResponse<PageResponse<TrainingCertificate>>>({
      method: 'GET',
      url: '/training/certificates',
      params
    })
  },

  getCertificateById: (id: number) => {
    return request<ApiResponse<TrainingCertificate>>({
      method: 'GET',
      url: `/training/certificates/${id}`
    })
  },

  verifyCertificate: (id: number) => {
    return request<ApiResponse<{ valid: boolean; certificateNo: string; holderName: string; courseName: string; issueDate: string }>>({
      method: 'GET',
      url: `/training/certificates/${id}/verify`
    })
  },

  // ========== 统计 ==========
  getStatistics: () => {
    return request<ApiResponse<TrainingStatistics>>({
      method: 'GET',
      url: '/training/train-statistics'
    })
  }
}