"use client"

import { useEffect, useMemo, useState } from 'react'
import { CalendarDays, Eye, Plus } from 'lucide-react'
import Link from 'next/link'
import {
  Button,
  Card,
  CardContent,
} from '@/components/ui'
import AdminBadge from '@/components/admin/AdminBadge'
import AdminDataTable from '@/components/admin/AdminDataTable'
import AdminFilterBar from '@/components/admin/AdminFilterBar'
import AdminMetricCards from '@/components/admin/AdminMetricCards'
import AdminPagination from '@/components/admin/AdminPagination'
import AdminPageHeader from '@/components/admin/AdminPageHeader'
import AdminSubmissionFilters from '@/components/admin/AdminSubmissionFilters'
import { adminRepository } from '@/lib/admin/admin-repository'
import {
  getSubmissionDepartments,
  getSubmissionStatusTone,
  getSubmissionStatuses,
} from '@/lib/utils'
import type { SubmissionRecord, SubmissionStatus } from '@/types/admin'

const PAGE_SIZE = 8

function parseDate(date: string) {
  const [monthToken, dayToken] = date.split(' ')
  const monthMap: Record<string, number> = {
    Jan: 0,
    Feb: 1,
    Mar: 2,
    Apr: 3,
    May: 4,
    Jun: 5,
    Jul: 6,
    Aug: 7,
    Sep: 8,
    Oct: 9,
    Nov: 10,
    Dec: 11,
  }

  return new Date(2025, monthMap[monthToken] ?? 0, Number(dayToken ?? 1)).getTime()
}

export default function AdminSubmissionsPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [department, setDepartment] = useState('all-departments')
  const [status, setStatus] = useState('all-status')
  const [sortOrder, setSortOrder] = useState('date-desc')
  const [page, setPage] = useState(1)
  const [submissions] = useState<SubmissionRecord[]>(() => adminRepository.listSubmissions())
  const [summaryCards] = useState(() => adminRepository.getSubmissionSummaryCards())

  const departments = useMemo(() => getSubmissionDepartments(submissions), [submissions])
  const statuses = useMemo(() => getSubmissionStatuses(), [])

  const filteredSubmissions = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase()

    const base = submissions.filter((submission) => {
      const matchesQuery =
        !normalizedQuery ||
        submission.title.toLowerCase().includes(normalizedQuery) ||
        submission.author.toLowerCase().includes(normalizedQuery)

      const matchesDepartment = department === 'all-departments' || submission.department === department
      const matchesStatus = status === 'all-status' || submission.status === (status as SubmissionStatus)

      return matchesQuery && matchesDepartment && matchesStatus
    })

    return base.sort((left, right) => {
      const delta = parseDate(left.date) - parseDate(right.date)
      return sortOrder === 'date-asc' ? delta : -delta
    })
  }, [department, searchQuery, sortOrder, status, submissions])

  const totalPages = Math.max(1, Math.ceil(filteredSubmissions.length / PAGE_SIZE))
  const safePage = Math.min(page, totalPages)
  const pagedSubmissions = filteredSubmissions.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE)

  const startRow = filteredSubmissions.length === 0 ? 0 : (safePage - 1) * PAGE_SIZE + 1
  const endRow = Math.min(safePage * PAGE_SIZE, filteredSubmissions.length)

  useEffect(() => {
    setPage(1)
  }, [searchQuery, department, status, sortOrder])

  useEffect(() => {
    if (!('window' in globalThis)) {
      return
    }

    const params = new URLSearchParams(globalThis.location.search)
    const query = params.get('search')
    const statusParam = params.get('status')

    if (query) {
      setSearchQuery(query)
    }

    if (statusParam) {
      if (statusParam === 'all-status' || statuses.includes(statusParam as SubmissionStatus)) {
        setStatus(statusParam)
      }
    }
  }, [statuses])

  const columns = useMemo(
    () => [
      {
        id: 'title',
        header: 'Thesis Title',
        className: 'max-w-[360px]',
        renderCell: (submission: SubmissionRecord) => <span className="line-clamp-2">{submission.title}</span>,
      },
      { id: 'author', header: 'Author', renderCell: (submission: SubmissionRecord) => submission.author },
      { id: 'department', header: 'Department', renderCell: (submission: SubmissionRecord) => submission.department },
      {
        id: 'date',
        header: 'Date',
        renderCell: (submission: SubmissionRecord) => (
          <span className="inline-flex items-center gap-1">
            <CalendarDays className="h-3.5 w-3.5 text-grey-500" />
            {submission.date}
          </span>
        ),
      },
      {
        id: 'status',
        header: 'Status',
        renderCell: (submission: SubmissionRecord) => (
          <AdminBadge label={submission.status} tone={getSubmissionStatusTone(submission.status)} />
        ),
      },
      {
        id: 'action',
        header: 'Action',
        renderCell: (submission: SubmissionRecord) => (
          <Link
            href={`/admin/submissions/review/${submission.id}`}
            className="inline-flex items-center gap-1 text-cics-maroon no-underline transition-colors hover:text-cics-maroon-600"
          >
            <Eye className="h-3.5 w-3.5" />
            Review
          </Link>
        ),
      },
    ],
    []
  )

  return (
    <div className="space-y-4">
      <AdminPageHeader
        title="Submissions"
        subtitle="Review and manage thesis submissions"
        action={
          <Button asChild className="h-9 rounded-md px-4 text-xs">
            <Link href="/admin/submissions/new/permission" className="no-underline">
              <Plus className="mr-1 h-4 w-4" />
              Add Thesis
            </Link>
          </Button>
        }
      />

      <AdminMetricCards cards={summaryCards} columnsClassName="sm:grid-cols-2 lg:grid-cols-5" compact />

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

          <AdminDataTable
            columns={columns}
            rows={pagedSubmissions}
            rowKey={(submission) => submission.id}
            emptyMessage="No submissions match your filters."
            minWidthClassName="min-w-[980px]"
          />

          <AdminPagination
            page={safePage}
            totalPages={totalPages}
            onPageChange={setPage}
            leftText={`Showing ${startRow} to ${endRow} of ${filteredSubmissions.length} results`}
          />
        </CardContent>
      </Card>
    </div>
  )
}
