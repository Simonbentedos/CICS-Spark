"use client"

import { useEffect, useState } from 'react'
import { CalendarDays, CheckCircle2, CircleX, Clock3, Eye, FileText } from 'lucide-react'
import Link from 'next/link'
import { Button, Card, CardContent, CardHeader, CardTitle } from '@/components/ui'
import AdminBadge from '@/components/admin/AdminBadge'
import AdminPageHeader from '@/components/admin/AdminPageHeader'
import { getAdminSession } from '@/lib/admin/session'
import { getAdminTheme } from '@/lib/admin/theme'
import { getAdminSubmissions, type ApiDocument } from '@/lib/api/documents'
import { getSubmissionStatusTone } from '@/lib/utils'

const kpiIcons = [Clock3, CheckCircle2, CircleX, FileText]

function docStatusLabel(status: string): string {
  const map: Record<string, string> = {
    pending: 'Pending Review',
    approved: 'Approved',
    rejected: 'Rejected',
    revision: 'Revision Requested',
  }
  return map[status] ?? status
}

export default function AdminDashboardPage() {
  const session = getAdminSession()
  const theme = getAdminTheme(session?.departmentCode ?? 'cs')

  const [submissions, setSubmissions] = useState<ApiDocument[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getAdminSubmissions()
      .then(setSubmissions)
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const pending = submissions.filter((s) => s.status === 'pending').length
  const approved = submissions.filter((s) => s.status === 'approved').length
  const rejected = submissions.filter((s) => s.status === 'rejected').length
  const total = submissions.length

  const kpiCards = [
    { label: 'Pending Review', value: pending },
    { label: 'Approved', value: approved },
    { label: 'Rejected', value: rejected },
    { label: 'Total Submissions', value: total },
  ]

  const today = new Date().toDateString()
  const todaySubmissions = submissions.filter(
    (s) => new Date(s.created_at).toDateString() === today,
  )

  const recentSubmissions = submissions.slice(0, 4)

  return (
    <div className="space-y-4">
      <AdminPageHeader
        title={theme.dashboardLabel}
        subtitle={`Welcome back! This is the ${theme.departmentName} admin dashboard.`}
      />

      <section
        className="rounded-lg border px-4 py-3"
        style={{ borderColor: theme.accentHex, backgroundColor: theme.accentSoft }}
      >
        <p className="text-xs font-semibold uppercase tracking-[0.08em]" style={{ color: theme.accentText }}>
          Department View
        </p>
        <p className="text-sm" style={{ color: theme.accentDark }}>
          Signed in as {session?.name ?? 'Admin'} — {theme.departmentName}.
        </p>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {kpiCards.map((card, index) => {
          const Icon = kpiIcons[index]
          return (
            <Card key={card.label} className="border border-grey-200 shadow-none">
              <CardContent className="p-4">
                <div
                  className="mb-3 inline-flex h-8 w-8 items-center justify-center rounded-md"
                  style={{ backgroundColor: theme.accentSoft }}
                >
                  <Icon className="h-4 w-4" style={{ color: theme.accentDark }} />
                </div>
                <p className="text-[34px] font-semibold leading-none text-grey-700">
                  {loading ? '—' : card.value}
                </p>
                <p className="mt-1 text-xs text-grey-600">{card.label}</p>
              </CardContent>
            </Card>
          )
        })}
      </section>

      <section className="grid gap-4 xl:grid-cols-3">
        <Card className="border border-grey-200 shadow-none">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-navy">This Month</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <p className="text-[34px] font-semibold leading-none text-grey-700">
                {loading ? '—' : submissions.filter((s) => {
                  const d = new Date(s.created_at)
                  const now = new Date()
                  return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
                }).length}
              </p>
              <p className="mt-1 text-xs text-grey-500">New submissions</p>
            </div>
            <div className="h-px bg-grey-200" />
            <p className="text-xs font-medium" style={{ color: theme.accentText }}>Live data from repository</p>
          </CardContent>
        </Card>

        <Card className="border border-grey-200 shadow-none">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-navy">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button variant="ghost" asChild className="h-9 w-full justify-between rounded-md bg-grey-100 px-3 text-xs text-grey-700 hover:bg-grey-200">
              <Link href="/admin/submissions?status=pending" className="no-underline">
                Review Pending{' '}
                <span
                  className="inline-flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-[10px] text-white"
                  style={{ backgroundColor: theme.accentHex }}
                >
                  {pending}
                </span>
              </Link>
            </Button>
            <Button variant="ghost" asChild className="h-9 w-full justify-start rounded-md bg-grey-100 px-3 text-xs text-grey-700 hover:bg-grey-200">
              <Link href="/admin/fulltext-requests" className="no-underline">
                Full-Text Requests
              </Link>
            </Button>
            <Button variant="ghost" asChild className="h-9 w-full justify-start rounded-md bg-grey-100 px-3 text-xs text-grey-700 hover:bg-grey-200">
              <Link href="/admin/users" className="no-underline">
                Manage Users
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="border border-grey-200 shadow-none">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm font-medium text-navy">
              <CalendarDays className="h-4 w-4" style={{ color: theme.accentHex }} />
              Today
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-xs">
            <div className="flex items-center justify-between text-grey-600">
              <span>New submissions</span>
              <span className="font-medium text-grey-700">{loading ? '—' : todaySubmissions.length}</span>
            </div>
            <div className="flex items-center justify-between text-grey-600">
              <span>Approved</span>
              <span className="font-medium text-green-600">
                {loading ? '—' : todaySubmissions.filter((s) => s.status === 'approved').length}
              </span>
            </div>
            <div className="flex items-center justify-between text-grey-600">
              <span>Rejected</span>
              <span className="font-medium text-red-500">
                {loading ? '—' : todaySubmissions.filter((s) => s.status === 'rejected').length}
              </span>
            </div>
          </CardContent>
        </Card>
      </section>

      <Card className="overflow-hidden border border-grey-200 shadow-none">
        <CardHeader className="border-b border-grey-200 pb-3">
          <CardTitle className="text-base font-semibold text-navy">Recent Submissions</CardTitle>
          <p className="text-xs text-grey-500">Latest submissions awaiting review</p>
        </CardHeader>

        <CardContent className="p-0">
          {loading ? (
            <p className="px-4 py-6 text-xs text-grey-500">Loading submissions…</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[860px] border-collapse text-xs text-grey-700">
                <thead className="bg-grey-50 text-[11px] uppercase tracking-wide text-grey-500">
                  <tr>
                    <th className="px-4 py-3 text-left font-medium">Title</th>
                    <th className="px-4 py-3 text-left font-medium">Authors</th>
                    <th className="px-4 py-3 text-left font-medium">Department</th>
                    <th className="px-4 py-3 text-left font-medium">Year</th>
                    <th className="px-4 py-3 text-left font-medium">Status</th>
                    <th className="px-4 py-3 text-left font-medium">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {recentSubmissions.map((doc) => (
                    <tr key={doc.id} className="border-t border-grey-200">
                      <td className="px-4 py-3 max-w-[280px]">
                        <span className="line-clamp-2">{doc.title}</span>
                      </td>
                      <td className="px-4 py-3">{Array.isArray(doc.authors) ? doc.authors.join(', ') : String(doc.authors ?? '')}</td>
                      <td className="px-4 py-3">{doc.department}</td>
                      <td className="px-4 py-3">{doc.year ?? '—'}</td>
                      <td className="px-4 py-3">
                        <AdminBadge
                          label={docStatusLabel(doc.status)}
                          tone={getSubmissionStatusTone(docStatusLabel(doc.status) as any)}
                        />
                      </td>
                      <td className="px-4 py-3">
                        <Link
                          href={`/admin/submissions/review/${doc.id}`}
                          className="inline-flex items-center gap-1 no-underline"
                          style={{ color: theme.accentHex }}
                        >
                          <Eye className="h-3.5 w-3.5" />
                          Review
                        </Link>
                      </td>
                    </tr>
                  ))}
                  {recentSubmissions.length === 0 && (
                    <tr>
                      <td colSpan={6} className="px-4 py-6 text-center text-grey-400">No submissions yet.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

          <div className="border-t border-grey-200 px-4 py-3">
            <Link href="/admin/submissions" className="text-xs font-medium no-underline" style={{ color: theme.accentHex }}>
              View all submissions {'->'}
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
