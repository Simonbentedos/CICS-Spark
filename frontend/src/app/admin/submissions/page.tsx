"use client"

import { useEffect, useMemo, useState } from 'react'
import { CalendarDays, Eye } from 'lucide-react'
import Link from 'next/link'
import { Card, CardContent } from '@/components/ui'
import AdminBadge from '@/components/admin/AdminBadge'
import AdminDataTable from '@/components/admin/AdminDataTable'
import AdminFilterBar from '@/components/admin/AdminFilterBar'
import AdminMetricCards from '@/components/admin/AdminMetricCards'
import AdminPagination from '@/components/admin/AdminPagination'
import AdminPageHeader from '@/components/admin/AdminPageHeader'
import AdminSubmissionFilters from '@/components/admin/AdminSubmissionFilters'
import { getAdminSubmissions, type ApiDocument } from '@/lib/api/documents'
import { getSubmissionStatusTone, getSubmissionStatuses } from '@/lib/utils'
import type { AdminStatCard } from '@/types/admin'

const PAGE_SIZE = 8

const STATUS_LABEL: Record<string, string> = {
  pending: 'Pending Review',
  approved: 'Approved',
  rejected: 'Rejected',
  revision: 'Revision Requested',
}

export default function AdminSubmissionsPage() {
  const [submissions, setSubmissions] = useState<ApiDocument[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [searchQuery, setSearchQuery] = useState('')
  const [department, setDepartment] = useState('all-departments')
  const [status, setStatus] = useState('all-status')
  const [sortOrder, setSortOrder] = useState('date-desc')
  const [page, setPage] = useState(1)

  useEffect(() => {
    getAdminSubmissions()
      .then(setSubmissions)
      .catch((err) => setError(err.message ?? 'Failed to load submissions'))
      .finally(() => setLoading(false))
  }, [])

  // Read URL params on mount
  useEffect(() => {
    if (typeof window === 'undefined') return
    const params = new URLSearchParams(window.location.search)
    const q = params.get('search')
    const s = params.get('status')
    if (q) setSearchQuery(q)
    if (s) setStatus(s)
  }, [])

  useEffect(() => { setPage(1) }, [searchQuery, department, status, sortOrder])

  const departments = useMemo(
    () => ['all-departments', ...Array.from(new Set(submissions.map((s) => s.department)))],
    [submissions],
  )
  const statuses = useMemo(() => getSubmissionStatuses(), [])

  const summaryCards: AdminStatCard[] = useMemo(() => [
    { label: 'Pending Review', value: submissions.filter((s) => s.status === 'pending').length, tone: 'orange' },
    { label: 'Approved', value: submissions.filter((s) => s.status === 'approved').length, tone: 'green' },
    { label: 'Rejected', value: submissions.filter((s) => s.status === 'rejected').length, tone: 'red' },
    { label: 'Revision', value: submissions.filter((s) => s.status === 'revision').length, tone: 'violet' },
    { label: 'Total', value: submissions.length, tone: 'default' },
  ], [submissions])

  const filtered = useMemo(() => {
    const q = searchQuery.trim().toLowerCase()
    const base = submissions.filter((doc) => {
      const authors = Array.isArray(doc.authors) ? doc.authors.join(' ') : String(doc.authors ?? '')
      const matchesQ = !q || doc.title.toLowerCase().includes(q) || authors.toLowerCase().includes(q)
      const matchesDept = department === 'all-departments' || doc.department === department
      const docLabel = STATUS_LABEL[doc.status] ?? doc.status
      const matchesStatus = status === 'all-status' || docLabel === status || doc.status === status
      return matchesQ && matchesDept && matchesStatus
    })
    return base.sort((a, b) => {
      const delta = new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      return sortOrder === 'date-asc' ? delta : -delta
    })
  }, [submissions, searchQuery, department, status, sortOrder])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const safePage = Math.min(page, totalPages)
  const paged = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE)
  const startRow = filtered.length === 0 ? 0 : (safePage - 1) * PAGE_SIZE + 1
  const endRow = Math.min(safePage * PAGE_SIZE, filtered.length)

  const columns = useMemo(
    () => [
      {
        id: 'title',
        header: 'Title',
        className: 'max-w-[360px]',
        renderCell: (doc: ApiDocument) => <span className="line-clamp-2">{doc.title}</span>,
      },
      {
        id: 'authors',
        header: 'Authors',
        className: 'max-w-[260px]',
        renderCell: (doc: ApiDocument) => {
          const raw: unknown = doc.authors
          const list = Array.isArray(raw) ? raw : typeof raw === 'string' ? (() => { try { return JSON.parse(raw) } catch { return [raw] } })() : []
          return (list as string[]).join(', ') || '—'
        },
      },
      { id: 'department', header: 'Dept', className: 'whitespace-nowrap', renderCell: (doc: ApiDocument) => doc.department },
      {
        id: 'date',
        header: 'Submitted',
        className: 'whitespace-nowrap',
        renderCell: (doc: ApiDocument) => (
          <span className="inline-flex items-center gap-1 whitespace-nowrap">
            <CalendarDays className="h-3.5 w-3.5 text-grey-500" />
            {new Date(doc.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
          </span>
        ),
      },
      {
        id: 'status',
        header: 'Status',
        className: 'whitespace-nowrap',
        renderCell: (doc: ApiDocument) => {
          const label = STATUS_LABEL[doc.status] ?? doc.status
          return <AdminBadge label={label} tone={getSubmissionStatusTone(label as any)} />
        },
      },
      {
        id: 'action',
        header: 'Action',
        renderCell: (doc: ApiDocument) => (
          <Link
            href={`/admin/submissions/review/${doc.id}`}
            className="inline-flex items-center gap-1 text-cics-maroon no-underline transition-colors hover:text-cics-maroon-600"
          >
            <Eye className="h-3.5 w-3.5" />
            Review
          </Link>
        ),
      },
    ],
    [],
  )

  return (
    <div className="space-y-4">
      <AdminPageHeader
        title="Submissions"
        subtitle="Review and manage thesis and capstone submissions"
      />

      <AdminMetricCards cards={summaryCards} columnsClassName="sm:grid-cols-2 lg:grid-cols-5" compact />

      {error && (
        <p className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>
      )}

      <Card className="border border-grey-200 shadow-none">
        <CardContent className="space-y-4 p-4">
          <AdminFilterBar
            searchValue={searchQuery}
            onSearchChange={setSearchQuery}
            searchPlaceholder="Search by title or author..."
            controls={
              <AdminSubmissionFilters
                department={department}
                onDepartmentChange={setDepartment}
                status={status}
                onStatusChange={setStatus}
                sortOrder={sortOrder}
                onSortOrderChange={setSortOrder}
                departments={departments}
                statuses={statuses}
              />
            }
          />

          {loading ? (
            <p className="py-8 text-center text-xs text-grey-500">Loading submissions…</p>
          ) : (
            <AdminDataTable
              columns={columns}
              rows={paged}
              rowKey={(doc) => doc.id}
              emptyMessage="No submissions match your filters."
              minWidthClassName="min-w-[980px]"
            />
          )}

          <AdminPagination
            page={safePage}
            totalPages={totalPages}
            onPageChange={setPage}
            leftText={`Showing ${startRow} to ${endRow} of ${filtered.length} results`}
          />
        </CardContent>
      </Card>
    </div>
  )
}
