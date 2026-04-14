export type SubmissionStatus = 'Pending Review' | 'Approved' | 'Rejected' | 'Revision Requested'

export type UserRole = 'Super Admin' | 'Admin' | 'Student' | 'Reviewer'
export type UserStatus = 'Active' | 'Inactive' | 'Pending'

export interface AdminStatCard {
  label: string
  value: number
  tone?: 'default' | 'orange' | 'green' | 'red' | 'blue' | 'violet'
}

export interface SubmissionRecord {
  id: string
  title: string
  author: string
  authorEmail?: string
  department: string
  program?: string
  thesisAdvisor?: string
  date: string
  status: SubmissionStatus
  keywords?: string[]
  abstract?: string
  notes?: string
  previewImage?: string
  pageCount?: number
}

export interface SubmissionDraft {
  title: string
  firstName: string
  middleName: string
  lastName: string
  publishedOn: string
  department: string
  documentType: string
  trackSpecialization: string
  degree: string
  thesisAdvisor: string
  panelChair: string
  panelMembers: string
  keywords: string
  abstract: string
  fileName: string
}

export interface UserRecord {
  id: string
  name: string
  email: string
  role: UserRole
  department: string
  status: UserStatus
  lastLogin: string
  dateAdded?: string
}

export interface PermissionStatement {
  title: string
  intro: string
  bullets: string[]
}

export type SubmissionStepKey = 'basic-info' | 'academic-details' | 'file-upload' | 'verify-details'

export interface SubmissionStepMeta {
  key: SubmissionStepKey
  index: 1 | 2 | 3 | 4
  label: string
  sectionTitle: string
  nextLabel?: string
  nextHref?: string
  backHref?: string
}

export type ReviewActionType = 'approve' | 'revise' | 'reject'

export interface ReviewHistoryItem {
  id: string
  type: 'submitted' | 'approved' | 'revision-requested' | 'rejected'
  by: string
  at: string
  note?: string
}

export interface ReviewActionConfig {
  type: ReviewActionType
  title: string
  confirmLabel: string
  tone: 'green' | 'violet' | 'red'
}

export interface SelectOption {
  label: string
  value: string
}

export interface AdminSession {
  name: string
  email: string
  departmentCode: 'cs' | 'it' | 'is'
  departmentName: string
  role: 'admin' | 'super_admin'
  token: string
  loginAt: string
}

export type ReportDateRange = '30d' | '90d' | 'ytd' | 'all'
export type ReportExportFormat = 'csv' | 'json'
export type ReportExportPreset = 'executive-summary' | 'submission-pipeline' | 'department-performance' | 'user-access-usage' | 'audit-trail'

export interface ReportFilters {
  range: ReportDateRange
  department: string
  status: string
}

export interface ReportTrendPoint {
  label: string
  submitted: number
}

export interface ReportStatusBreakdown {
  status: SubmissionStatus
  count: number
  percentage: number
}

export interface DepartmentReportRow {
  department: string
  total: number
  approved: number
  rejected: number
  approvalRate: number
}

export interface ReportUserGrowth {
  label: string
  newUsers: number
}

export interface ReportUsage {
  repositoryViews: number
  uniqueVisitors: number
  searches: number
  downloads: number
}

export interface ReportAuditLog {
  id: string
  at: string
  actor: string
  action: string
  target: string
  details?: string
}

export interface ReportSnapshot {
  kpiCards: AdminStatCard[]
  trend: ReportTrendPoint[]
  statusBreakdown: ReportStatusBreakdown[]
  departmentBreakdown: DepartmentReportRow[]
  userGrowth: ReportUserGrowth[]
  usage: ReportUsage
  auditLogs: ReportAuditLog[]
}

export interface ReportExportPayload {
  content: string
  mimeType: string
  fileName: string
}
