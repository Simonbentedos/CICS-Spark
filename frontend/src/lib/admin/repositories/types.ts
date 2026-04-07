import type {
  AdminStatCard,
  ReviewHistoryItem,
  ReviewActionType,
  SubmissionDraft,
  SubmissionRecord,
  UserRecord,
  ReportFilters,
  ReportExportFormat,
  ReportExportPreset,
  ReportSnapshot,
  ReportExportPayload,
} from '@/types/admin'

export type DashboardMonthlySummary = {
  newSubmissions: number
  growthText: string
}

export type DashboardTodaySummary = {
  newSubmissions: number
  approved: number
  rejected: number
}

export type DashboardSnapshot = {
  kpiCards: AdminStatCard[]
  monthlySummary: DashboardMonthlySummary
  todaySummary: DashboardTodaySummary
}

export interface AdminRepository {
  getDashboardSnapshot(): DashboardSnapshot
  getSubmissionSummaryCards(): AdminStatCard[]
  listSubmissions(): SubmissionRecord[]
  getSubmissionById(id: string): SubmissionRecord | undefined
  getSubmissionReviewHistory(submissionId: string): ReviewHistoryItem[]
  getSubmissionDraft(): SubmissionDraft
  saveSubmissionDraft(patch: Partial<SubmissionDraft>): SubmissionDraft
  clearSubmissionDraft(): void
  submitSubmissionDraft(author: { name: string; email: string }): SubmissionRecord | null
  reviewSubmission(
    submissionId: string,
    action: ReviewActionType,
    actorName: string,
    payload: { comment?: string; issues?: string[]; adminNotes?: string }
  ): SubmissionRecord | undefined
  listUsers(): UserRecord[]
  createUser(user: UserRecord): UserRecord
  updateUser(userId: string, patch: Partial<UserRecord>): UserRecord | undefined
  deleteUser(userId: string): void
  getReportSnapshot(filters: ReportFilters): ReportSnapshot
  getReportExportPayload(preset: ReportExportPreset, format: ReportExportFormat, filters: ReportFilters): ReportExportPayload
}