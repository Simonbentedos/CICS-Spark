"use client"

import { useState } from 'react'
import { CalendarDays, CheckCircle2, CircleX, Clock3, Eye, FileText } from 'lucide-react'
import Link from 'next/link'
import { Button, Card, CardContent, CardHeader, CardTitle } from '@/components/ui'
import AdminBadge from '@/components/admin/AdminBadge'
import AdminPageHeader from '@/components/admin/AdminPageHeader'
import { adminRepository } from '@/lib/admin/admin-repository'
import type { DashboardSnapshot } from '@/lib/admin/repositories/types'
import type { SubmissionRecord } from '@/types/admin'
import { getSubmissionStatusTone } from '@/lib/utils'
import { getAdminSession } from '@/lib/admin/session'
import { getAdminTheme } from '@/lib/admin/theme'

const kpiIcons = [Clock3, CheckCircle2, CircleX, FileText]

export default function AdminDashboardPage() {
  const [dashboard] = useState<DashboardSnapshot>(() => adminRepository.getDashboardSnapshot())
  const [recentSubmissions] = useState<SubmissionRecord[]>(() => adminRepository.listSubmissions().slice(0, 4))
  const session = getAdminSession()
  const theme = getAdminTheme(session?.departmentCode ?? 'cs')

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
          Signed in as {theme.departmentName} administrator.
        </p>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {dashboard.kpiCards.map((card, index) => {
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
                <p className="text-[34px] font-semibold leading-none text-grey-700">{card.value}</p>
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
              <p className="text-[34px] font-semibold leading-none text-grey-700">{dashboard.monthlySummary.newSubmissions}</p>
              <p className="mt-1 text-xs text-grey-500">New submissions</p>
            </div>
            <div className="h-px bg-grey-200" />
            <p className="text-xs font-medium" style={{ color: theme.accentText }}>{dashboard.monthlySummary.growthText}</p>
          </CardContent>
        </Card>

        <Card className="border border-grey-200 shadow-none">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-navy">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button variant="ghost" asChild className="h-9 w-full justify-between rounded-md bg-grey-100 px-3 text-xs text-grey-700 hover:bg-grey-200">
              <Link href="/admin/submissions?status=Pending%20Review" className="no-underline">
                Review Pending{' '}
                <span
                  className="inline-flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-[10px] text-white"
                  style={{ backgroundColor: theme.accentHex }}
                >
                  {dashboard.kpiCards[0]?.value ?? 0}
                </span>
              </Link>
            </Button>
            <Button variant="ghost" asChild className="h-9 w-full justify-start rounded-md bg-grey-100 px-3 text-xs text-grey-700 hover:bg-grey-200">
              <Link href="/admin/submissions/new/permission" className="no-underline">
                Add New Thesis
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
              <span className="font-medium text-grey-700">{dashboard.todaySummary.newSubmissions}</span>
            </div>
            <div className="flex items-center justify-between text-grey-600">
              <span>Approved</span>
              <span className="font-medium text-green-600">{dashboard.todaySummary.approved}</span>
            </div>
            <div className="flex items-center justify-between text-grey-600">
              <span>Rejected</span>
              <span className="font-medium text-red-500">{dashboard.todaySummary.rejected}</span>
            </div>
          </CardContent>
        </Card>
      </section>

      <Card className="overflow-hidden border border-grey-200 shadow-none">
        <CardHeader className="border-b border-grey-200 pb-3">
          <CardTitle className="text-base font-semibold text-navy">Recent Submissions</CardTitle>
          <p className="text-xs text-grey-500">Latest thesis submissions awaiting review</p>
        </CardHeader>

        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[860px] border-collapse text-xs text-grey-700">
              <thead className="bg-grey-50 text-[11px] uppercase tracking-wide text-grey-500">
                <tr>
                  <th className="px-4 py-3 text-left font-medium">Thesis Title</th>
                  <th className="px-4 py-3 text-left font-medium">Author</th>
                  <th className="px-4 py-3 text-left font-medium">Department</th>
                  <th className="px-4 py-3 text-left font-medium">Date</th>
                  <th className="px-4 py-3 text-left font-medium">Status</th>
                  <th className="px-4 py-3 text-left font-medium">Action</th>
                </tr>
              </thead>
              <tbody>
                {recentSubmissions.map((submission) => (
                  <tr key={submission.id} className="border-t border-grey-200">
                    <td className="px-4 py-3">{submission.title}</td>
                    <td className="px-4 py-3">{submission.author}</td>
                    <td className="px-4 py-3">{submission.department}</td>
                    <td className="px-4 py-3">{submission.date}</td>
                    <td className="px-4 py-3">
                      <AdminBadge label={submission.status} tone={getSubmissionStatusTone(submission.status)} />
                    </td>
                    <td className="px-4 py-3">
                      <Link
                        href={`/admin/submissions/review/${submission.id}`}
                        className="inline-flex items-center gap-1 no-underline"
                        style={{ color: theme.accentHex }}
                      >
                        <Eye className="h-3.5 w-3.5" />
                        Review
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

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
