import {
  ADMIN_SUBMISSIONS,
  ADMIN_USERS,
  REVIEW_HISTORY_BY_SUBMISSION,
} from '@/lib/utils'
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

export class MockAdminRepository implements AdminRepository {
  private submissions: SubmissionRecord[] = [...ADMIN_SUBMISSIONS]

  private users: UserRecord[] = [...ADMIN_USERS]

  private reviewHistory: Record<string, ReviewHistoryItem[]> = { ...REVIEW_HISTORY_BY_SUBMISSION }

  private submissionDraft: SubmissionDraft = defaultSubmissionDraft()

  constructor() {
    this.hydrate()
  }

  private hydrate() {
    const persistedSubmissions = this.readFromStorage<SubmissionRecord[]>('spark_admin_submissions')
    const persistedUsers = this.readFromStorage<UserRecord[]>('spark_admin_users')
    const persistedHistory = this.readFromStorage<Record<string, ReviewHistoryItem[]>>('spark_admin_review_history')
    const persistedDraft = this.readFromStorage<SubmissionDraft>('spark_admin_submission_draft')

    if (persistedSubmissions?.length) {
      this.submissions = persistedSubmissions
    }

    if (persistedUsers?.length) {
      this.users = persistedUsers
    }

    if (persistedHistory) {
      this.reviewHistory = persistedHistory
    }

    if (persistedDraft) {
      this.submissionDraft = { ...defaultSubmissionDraft(), ...persistedDraft }
    }
  }

  private readFromStorage<T>(key: string): T | null {
    if (globalThis.window === undefined) {
      return null
    }

    const raw = localStorage.getItem(key)

    if (!raw) {
      return null
    }

    try {
      return JSON.parse(raw) as T
    } catch {
      return null
    }
  }

  private persist() {
    if (globalThis.window === undefined) {
      return
    }

    localStorage.setItem('spark_admin_submissions', JSON.stringify(this.submissions))
    localStorage.setItem('spark_admin_users', JSON.stringify(this.users))
    localStorage.setItem('spark_admin_review_history', JSON.stringify(this.reviewHistory))
    localStorage.setItem('spark_admin_submission_draft', JSON.stringify(this.submissionDraft))
  }

  getDashboardSnapshot(): DashboardSnapshot {
    const pending = countSubmissionsByStatus(this.submissions, 'Pending Review')
    const approved = countSubmissionsByStatus(this.submissions, 'Approved')
    const rejected = countSubmissionsByStatus(this.submissions, 'Rejected')

    return {
      kpiCards: [
        { label: 'Pending Review', value: pending, tone: 'orange' },
        { label: 'Approved', value: approved, tone: 'green' },
        { label: 'Rejected', value: rejected, tone: 'red' },
        { label: 'Total Theses', value: this.submissions.length, tone: 'blue' },
      ],
      monthlySummary: {
        newSubmissions: this.submissions.length,
        growthText: 'Updated from current repository data',
      },
      todaySummary: {
        newSubmissions: Math.min(this.submissions.length, 5),
        approved: Math.min(approved, 5),
        rejected: Math.min(rejected, 5),
      },
    }
  }

  getSubmissionSummaryCards(): AdminStatCard[] {
    return [
      { label: 'Total', value: this.submissions.length, tone: 'default' },
      { label: 'Pending', value: countSubmissionsByStatus(this.submissions, 'Pending Review'), tone: 'orange' },
      { label: 'Revisions', value: countSubmissionsByStatus(this.submissions, 'Revision Requested'), tone: 'violet' },
      { label: 'Approved', value: countSubmissionsByStatus(this.submissions, 'Approved'), tone: 'green' },
      { label: 'Rejected', value: countSubmissionsByStatus(this.submissions, 'Rejected'), tone: 'red' },
    ]
  }

  listSubmissions(): SubmissionRecord[] {
    return [...this.submissions]
  }

  getSubmissionById(id: string): SubmissionRecord | undefined {
    return this.submissions.find((submission) => submission.id === id)
  }

  getSubmissionReviewHistory(submissionId: string): ReviewHistoryItem[] {
    return [...(this.reviewHistory[submissionId] ?? [])]
  }

  getSubmissionDraft(): SubmissionDraft {
    return { ...this.submissionDraft }
  }

  saveSubmissionDraft(patch: Partial<SubmissionDraft>): SubmissionDraft {
    this.submissionDraft = { ...this.submissionDraft, ...patch }
    this.persist()
    return { ...this.submissionDraft }
  }

  clearSubmissionDraft(): void {
    this.submissionDraft = defaultSubmissionDraft()
    this.persist()
  }

  submitSubmissionDraft(author: { name: string; email: string }): SubmissionRecord | null {
    if (!this.submissionDraft.title.trim()) {
      return null
    }

    const created = new Date()
    const month = created.toLocaleDateString('en-US', { month: 'short' })
    const day = created.getDate()

    const keywords = this.submissionDraft.keywords
      .split(',')
      .map((value) => value.trim())
      .filter(Boolean)

    const submission: SubmissionRecord = {
      id: `sub-${Date.now()}`,
      title: this.submissionDraft.title.trim(),
      author: this.submissionDraft.firstName && this.submissionDraft.lastName
        ? `${this.submissionDraft.firstName.trim()} ${this.submissionDraft.lastName.trim()}`
        : author.name,
      authorEmail: author.email,
      department: this.submissionDraft.department.trim() || 'Unknown Department',
      program: this.submissionDraft.degree.trim() || undefined,
      thesisAdvisor: this.submissionDraft.thesisAdvisor.trim() || undefined,
      date: `${month} ${day}`,
      status: 'Pending Review',
      keywords,
      abstract: this.submissionDraft.abstract.trim() || undefined,
      pageCount: 1,
    }

    this.submissions = [submission, ...this.submissions]
    this.reviewHistory[submission.id] = [
      {
        id: `hist-${Date.now()}`,
        type: 'submitted',
        by: author.name,
        at: created.toLocaleString('en-US'),
      },
    ]

    this.clearSubmissionDraft()
    this.persist()

    return submission
  }

  reviewSubmission(
    submissionId: string,
    action: ReviewActionType,
    actorName: string,
    payload: { comment?: string; issues?: string[]; adminNotes?: string }
  ): SubmissionRecord | undefined {
    let updatedSubmission: SubmissionRecord | undefined

    this.submissions = this.submissions.map((submission) => {
      if (submission.id !== submissionId) {
        return submission
      }

      let nextStatus: SubmissionRecord['status']
      if (action === 'approve') {
        nextStatus = 'Approved'
      } else if (action === 'revise') {
        nextStatus = 'Revision Requested'
      } else {
        nextStatus = 'Rejected'
      }

      updatedSubmission = {
        ...submission,
        status: nextStatus,
        notes: payload.adminNotes?.trim() || submission.notes,
      }

      return updatedSubmission
    })

    if (updatedSubmission) {
      let historyType: ReviewHistoryItem['type']
      if (action === 'approve') {
        historyType = 'approved'
      } else if (action === 'revise') {
        historyType = 'revision-requested'
      } else {
        historyType = 'rejected'
      }

      const details = [payload.comment?.trim(), payload.issues?.length ? `Issues: ${payload.issues.join(', ')}` : undefined]
        .filter(Boolean)
        .join(' | ')

      const item: ReviewHistoryItem = {
        id: `hist-${Date.now()}`,
        type: historyType,
        by: actorName,
        at: new Date().toLocaleString('en-US'),
        note: details || undefined,
      }

      const existing = this.reviewHistory[submissionId] ?? []
      this.reviewHistory[submissionId] = [item, ...existing]
      this.persist()
    }

    return updatedSubmission
  }

  listUsers(): UserRecord[] {
    return [...this.users]
  }

  createUser(user: UserRecord): UserRecord {
    this.users = [user, ...this.users]
    this.persist()
    return user
  }

  updateUser(userId: string, patch: Partial<UserRecord>): UserRecord | undefined {
    let updatedUser: UserRecord | undefined

    this.users = this.users.map((user) => {
      if (user.id !== userId) {
        return user
      }

      updatedUser = { ...user, ...patch }
      return updatedUser
    })

    this.persist()
    return updatedUser
  }

  deleteUser(userId: string): void {
    this.users = this.users.filter((user) => user.id !== userId)
    this.persist()
  }

  getReportSnapshot(filters: ReportFilters): ReportSnapshot {
    const submissions = this.listSubmissions()
    
    // Filter submissions based on filters
    let filtered = [...submissions]
    
    if (filters.department && filters.department !== 'all-departments') {
      filtered = filtered.filter(s => s.department === filters.department)
    }
    
    if (filters.status && filters.status !== 'all-status') {
      filtered = filtered.filter(s => s.status === filters.status)
    }

    // Calculate KPI cards
    const pending = filtered.filter(s => s.status === 'Pending Review').length
    const approved = filtered.filter(s => s.status === 'Approved').length
    const rejected = filtered.filter(s => s.status === 'Rejected').length
    const revision = filtered.filter(s => s.status === 'Revision Requested').length

    // Calculate status breakdown
    const total = filtered.length
    const statusBreakdown = [
      { status: 'Pending Review' as const, count: pending, percentage: total > 0 ? Math.round((pending / total) * 100) : 0 },
      { status: 'Approved' as const, count: approved, percentage: total > 0 ? Math.round((approved / total) * 100) : 0 },
      { status: 'Rejected' as const, count: rejected, percentage: total > 0 ? Math.round((rejected / total) * 100) : 0 },
      { status: 'Revision Requested' as const, count: revision, percentage: total > 0 ? Math.round((revision / total) * 100) : 0 },
    ]

    // Calculate department breakdown
    const deptMap = new Map<string, { total: number; approved: number; rejected: number }>()
    filtered.forEach(s => {
      const existing = deptMap.get(s.department) || { total: 0, approved: 0, rejected: 0 }
      existing.total++
      if (s.status === 'Approved') existing.approved++
      if (s.status === 'Rejected') existing.rejected++
      deptMap.set(s.department, existing)
    })

    const departmentBreakdown = Array.from(deptMap.entries()).map(([department, data]) => ({
      department,
      total: data.total,
      approved: data.approved,
      rejected: data.rejected,
      approvalRate: data.total > 0 ? Math.round((data.approved / data.total) * 100) : 0,
    }))

    // Generate trend data (mock last 6 months)
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun']
    const trend = months.map(label => ({
      label,
      submitted: Math.floor(Math.random() * 20) + 5,
    }))

    // User growth data
    const userGrowth = months.map(label => ({
      label,
      newUsers: Math.floor(Math.random() * 10) + 1,
    }))

    // Usage data (mock)
    const usage = {
      repositoryViews: Math.floor(Math.random() * 5000) + 1000,
      uniqueVisitors: Math.floor(Math.random() * 1000) + 200,
      searches: Math.floor(Math.random() * 500) + 100,
      downloads: Math.floor(Math.random() * 200) + 50,
    }

    // Audit logs (mock)
    const auditLogs = [
      { id: '1', at: '2024-01-15 10:30', actor: 'Admin User', action: 'Approved', target: 'Thesis Title 1', details: 'Approved submission' },
      { id: '2', at: '2024-01-14 14:22', actor: 'Admin User', action: 'Rejected', target: 'Thesis Title 2', details: 'Plagiarism detected' },
      { id: '3', at: '2024-01-13 09:15', actor: 'Student User', action: 'Submitted', target: 'Thesis Title 3', details: 'New submission' },
    ]

    return {
      kpiCards: [
        { label: 'Total Submissions', value: total, tone: 'blue' },
        { label: 'Pending Review', value: pending, tone: 'orange' },
        { label: 'Approved', value: approved, tone: 'green' },
        { label: 'Rejected', value: rejected, tone: 'red' },
      ],
      trend,
      statusBreakdown,
      departmentBreakdown,
      userGrowth,
      usage,
      auditLogs,
    }
  }

  getReportExportPayload(preset: ReportExportPreset, format: ReportExportFormat, filters: ReportFilters): ReportExportPayload {
    const snapshot = this.getReportSnapshot(filters)
    
    let content: string
    let mimeType: string
    let fileName: string

    if (format === 'json') {
      content = JSON.stringify(snapshot, null, 2)
      mimeType = 'application/json'
      fileName = `report-${preset}-${Date.now()}.json`
    } else {
      // CSV format
      const rows = ['Type,Value']
      snapshot.kpiCards.forEach(card => {
        rows.push(`${card.label},${card.value}`)
      })
      content = rows.join('\n')
      mimeType = 'text/csv'
      fileName = `report-${preset}-${Date.now()}.csv`
    }

    return { content, mimeType, fileName }
  }
}

function countSubmissionsByStatus(submissions: SubmissionRecord[], status: SubmissionRecord['status']) {
  return submissions.filter((submission) => submission.status === status).length
}

function defaultSubmissionDraft(): SubmissionDraft {
  return {
    title: '',
    firstName: '',
    middleName: '',
    lastName: '',
    author2FirstName: '',
    author2MiddleName: '',
    author2LastName: '',
    author3FirstName: '',
    author3MiddleName: '',
    author3LastName: '',
    author4FirstName: '',
    author4MiddleName: '',
    author4LastName: '',
    author5FirstName: '',
    author5MiddleName: '',
    author5LastName: '',
    publishedOn: '',
    department: '',
    documentType: '',
    trackSpecialization: '',
    degree: '',
    thesisAdvisor: '',
    panelChair: '',
    panelMembers: '',
    keywords: '',
    abstract: '',
    fileName: '',
  }
}