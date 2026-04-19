import { apiRequest } from './client'

export type DocumentStatus = 'pending' | 'approved' | 'rejected' | 'revision'

export type ApiDocument = {
  id: string
  title: string
  authors: string[]
  abstract: string | null
  year: number | null
  department: 'CS' | 'IT' | 'IS'
  type: 'thesis' | 'capstone'
  track_specialization: string | null
  adviser: string | null
  degree: string | null
  keywords: string[]
  pdf_file_path: string | null
  uploaded_by: string | null
  status: DocumentStatus
  created_at: string
  updated_at: string
  reviews?: ApiReview[]
}

export type ApiReview = {
  id: string
  decision: 'approve' | 'reject' | 'revise'
  feedback_text: string | null
  reviewed_by: string | null
  created_at: string
}

export type ListDocumentsResponse = {
  data: ApiDocument[]
  page: number
  limit: number
  total: number
}

export type DuplicateCheckResponse = {
  isDuplicate: boolean
  matches: { id: string; title: string; similarity: number }[]
}

export type FulltextRequest = {
  id: string
  document_id: string
  requester_name: string
  requester_email: string
  purpose: string | null
  department: string | null
  status: 'pending' | 'fulfilled' | 'denied'
  handled_by: string | null
  created_at: string
  fulfilled_at: string | null
}

// ── Public endpoints ──────────────────────────────────────────────────────────

export async function getDocumentCounts(params: {
  department?: string
  type?: string
  track?: string
}): Promise<{ total: number }> {
  const qs = new URLSearchParams()
  if (params.department) qs.set('department', params.department)
  if (params.type) qs.set('type', params.type)
  if (params.track) qs.set('track', params.track)
  qs.set('limit', '1') // We only need the count, not the actual documents

  const response = await apiRequest<ListDocumentsResponse>(`/api/documents?${qs.toString()}`, { token: null })
  return { total: response.total }
}

export async function listDocuments(params: {
  department?: string
  type?: string
  year?: number
  track?: string
  keyword?: string
  page?: number
  limit?: number
} = {}): Promise<ListDocumentsResponse> {
  const qs = new URLSearchParams()
  if (params.department) qs.set('department', params.department)
  if (params.type) qs.set('type', params.type)
  if (params.year) qs.set('year', String(params.year))
  if (params.track) qs.set('track', params.track)
  if (params.keyword) qs.set('keyword', params.keyword)
  if (params.page) qs.set('page', String(params.page))
  if (params.limit) qs.set('limit', String(params.limit))

  return apiRequest<ListDocumentsResponse>(`/api/documents?${qs.toString()}`, { token: null })
}

export async function getDocumentById(id: string): Promise<ApiDocument> {
  return apiRequest<ApiDocument>(`/api/documents/${id}`, { token: null })
}

export async function searchDocuments(q: string): Promise<ApiDocument[]> {
  const qs = new URLSearchParams({ q })
  return apiRequest<ApiDocument[]>(`/api/documents/search?${qs.toString()}`, { token: null })
}

export async function checkDuplicate(title: string): Promise<DuplicateCheckResponse> {
  const qs = new URLSearchParams({ title })
  return apiRequest<DuplicateCheckResponse>(
    `/api/documents/check-duplicate?${qs.toString()}`,
    { token: null },
  )
}

export function downloadAbstractUrl(documentId: string): string {
  return `${process.env.NEXT_PUBLIC_BACKEND_URL ?? 'http://localhost:5000'}/api/documents/${documentId}/download-abstract`
}

// ── Student endpoints ─────────────────────────────────────────────────────────

export async function getMyDocuments(): Promise<ApiDocument[]> {
  return apiRequest<ApiDocument[]>('/api/student/documents')
}

export async function uploadDocument(formData: FormData): Promise<ApiDocument> {
  return apiRequest<ApiDocument>('/api/documents/upload', {
    method: 'POST',
    body: formData,
  })
}

export async function reviseDocument(
  documentId: string,
  formData: FormData,
): Promise<ApiDocument> {
  return apiRequest<ApiDocument>(`/api/documents/${documentId}`, {
    method: 'PUT',
    body: formData,
  })
}

// ── Guest full-text requests ──────────────────────────────────────────────────

export async function submitFulltextRequest(payload: {
  document_id: string
  requester_name: string
  requester_email: string
  purpose: string
  department: string
}): Promise<{ message: string; request: FulltextRequest }> {
  return apiRequest('/api/fulltext-requests', {
    method: 'POST',
    body: payload,
    token: null,
  })
}

// ── Admin endpoints ───────────────────────────────────────────────────────────

export async function getAdminSubmissions(status?: string): Promise<ApiDocument[]> {
  const qs = status ? `?status=${status}` : ''
  return apiRequest<ApiDocument[]>(`/api/admin/submissions${qs}`)
}

export async function getAdminSubmissionById(id: string): Promise<ApiDocument> {
  return apiRequest<ApiDocument>(`/api/admin/submissions/${id}`)
}

export async function getSubmissionPdfUrl(id: string): Promise<{ pdfUrl: string; expiresIn: number }> {
  return apiRequest<{ pdfUrl: string; expiresIn: number }>(`/api/admin/submissions/${id}/preview-pdf`)
}

export async function reviewSubmission(
  id: string,
  decision: 'approve' | 'reject' | 'revise',
  feedback?: string,
): Promise<{ message: string; document: ApiDocument }> {
  return apiRequest(`/api/admin/submissions/${id}/review`, {
    method: 'POST',
    body: { decision, feedback },
  })
}

export async function getFulltextRequests(status?: string): Promise<FulltextRequest[]> {
  const qs = status ? `?status=${status}` : ''
  return apiRequest<FulltextRequest[]>(`/api/admin/fulltext-requests${qs}`)
}

export async function updateFulltextRequest(
  id: string,
  status: 'fulfilled' | 'denied',
): Promise<{ message: string; request: FulltextRequest }> {
  return apiRequest(`/api/admin/fulltext-requests/${id}`, {
    method: 'PUT',
    body: { status },
  })
}
