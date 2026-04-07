import type {
  AdminStatCard,
  ReviewActionType,
  ReviewHistoryItem,
  SubmissionDraft,
  SubmissionRecord,
  UserRecord,
  ReportFilters,
  ReportExportFormat,
  ReportExportPreset,
  ReportSnapshot,
  ReportExportPayload,
} from '@/types/admin'
import type {
  AdminRepository,
  DashboardSnapshot,
} from '@/lib/admin/repositories/types'

type ApiAdminRepositoryOptions = {
  baseUrl?: string
}

export class ApiAdminRepository implements AdminRepository {
  private readonly baseUrl: string

  constructor(options: ApiAdminRepositoryOptions = {}) {
    this.baseUrl = options.baseUrl ?? '/api/admin'
  }

  getDashboardSnapshot(): DashboardSnapshot {
    throw new Error('ApiAdminRepository.getDashboardSnapshot is not implemented yet.')
  }

  getSubmissionSummaryCards(): AdminStatCard[] {
    throw new Error('ApiAdminRepository.getSubmissionSummaryCards is not implemented yet.')
  }

  listSubmissions(): SubmissionRecord[] {
    throw new Error('ApiAdminRepository.listSubmissions is not implemented yet.')
  }

  getSubmissionById(id: string): SubmissionRecord | undefined {
    throw new Error(`ApiAdminRepository.getSubmissionById is not implemented yet (id: ${id}).`)
  }

  getSubmissionReviewHistory(submissionId: string): ReviewHistoryItem[] {
    throw new Error(`ApiAdminRepository.getSubmissionReviewHistory is not implemented yet (submissionId: ${submissionId}).`)
  }

  getSubmissionDraft(): SubmissionDraft {
    throw new Error('ApiAdminRepository.getSubmissionDraft is not implemented yet.')
  }

  saveSubmissionDraft(patch: Partial<SubmissionDraft>): SubmissionDraft {
    throw new Error(`ApiAdminRepository.saveSubmissionDraft is not implemented yet (fields: ${Object.keys(patch).join(', ')}).`)
  }

  clearSubmissionDraft(): void {
    throw new Error('ApiAdminRepository.clearSubmissionDraft is not implemented yet.')
  }

  submitSubmissionDraft(author: { name: string; email: string }): SubmissionRecord | null {
    throw new Error(`ApiAdminRepository.submitSubmissionDraft is not implemented yet (author: ${author.email}).`)
  }

  reviewSubmission(
    submissionId: string,
    action: ReviewActionType,
    actorName: string,
    payload: { comment?: string; issues?: string[]; adminNotes?: string }
  ): SubmissionRecord | undefined {
    throw new Error(`ApiAdminRepository.reviewSubmission is not implemented yet (submissionId: ${submissionId}, action: ${action}, actor: ${actorName}, fields: ${Object.keys(payload).join(', ')}).`)
  }

  listUsers(): UserRecord[] {
    throw new Error('ApiAdminRepository.listUsers is not implemented yet.')
  }

  createUser(user: UserRecord): UserRecord {
    throw new Error(`ApiAdminRepository.createUser is not implemented yet (email: ${user.email}).`)
  }

  updateUser(userId: string, patch: Partial<UserRecord>): UserRecord | undefined {
    throw new Error(`ApiAdminRepository.updateUser is not implemented yet (userId: ${userId}, fields: ${Object.keys(patch).join(', ')}).`)
  }

  deleteUser(userId: string): void {
    throw new Error(`ApiAdminRepository.deleteUser is not implemented yet (userId: ${userId}).`)
  }

  getReportSnapshot(filters: ReportFilters): ReportSnapshot {
    throw new Error('ApiAdminRepository.getReportSnapshot is not implemented yet.')
  }

  getReportExportPayload(preset: ReportExportPreset, format: ReportExportFormat, filters: ReportFilters): ReportExportPayload {
    throw new Error('ApiAdminRepository.getReportExportPayload is not implemented yet.')
  }

  getBaseUrl() {
    return this.baseUrl
  }
}