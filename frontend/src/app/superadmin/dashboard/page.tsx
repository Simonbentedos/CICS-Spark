"use client"

import { useEffect, useState } from 'react'
import { CheckCircle2, Clock, FileText, Users, XCircle } from 'lucide-react'
import { Card, CardContent } from '@/components/ui'
import AdminPageHeader from '@/components/admin/AdminPageHeader'
import { getAdminSubmissions } from '@/lib/api/documents'
import { getAdminUsers } from '@/lib/api/users'

export default function SuperAdminDashboardPage() {
  const [submissionCounts, setSubmissionCounts] = useState({ total: 0, pending: 0, approved: 0, rejected: 0 })
  const [userCount, setUserCount] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      getAdminSubmissions().catch(() => []),
      getAdminUsers().catch(() => []),
    ]).then(([submissions, users]) => {
      setSubmissionCounts({
        total: submissions.length,
        pending: submissions.filter((s) => s.status === 'pending').length,
        approved: submissions.filter((s) => s.status === 'approved').length,
        rejected: submissions.filter((s) => s.status === 'rejected').length,
      })
      setUserCount(users.length)
    }).finally(() => setLoading(false))
  }, [])

  const stats = [
    { label: 'Total Submissions', value: submissionCounts.total, icon: FileText, color: 'text-cics-maroon', bg: 'bg-[#fdf2f2]' },
    { label: 'Pending Review', value: submissionCounts.pending, icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50' },
    { label: 'Approved', value: submissionCounts.approved, icon: CheckCircle2, color: 'text-green-600', bg: 'bg-green-50' },
    { label: 'Rejected', value: submissionCounts.rejected, icon: XCircle, color: 'text-red-600', bg: 'bg-red-50' },
    { label: 'Total Users', value: userCount, icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
  ]

  return (
    <div className="space-y-5">
      <AdminPageHeader
        title="Super Admin Dashboard"
        subtitle="System-wide overview across all departments"
      />

      <section className="grid grid-cols-2 gap-3 md:grid-cols-5">
        {stats.map(({ label, value, icon: Icon, color, bg }) => (
          <Card key={label} className="border border-grey-200 shadow-none">
            <CardContent className="p-4">
              <div className={`mb-2 inline-flex h-9 w-9 items-center justify-center rounded-lg ${bg}`}>
                <Icon className={`h-4 w-4 ${color}`} />
              </div>
              <p className={`text-2xl font-semibold ${color}`}>{loading ? '—' : value}</p>
              <p className="mt-0.5 text-xs text-grey-500">{label}</p>
            </CardContent>
          </Card>
        ))}
      </section>

      <Card className="border border-grey-200 shadow-none">
        <CardContent className="p-4">
          <p className="text-sm font-medium text-grey-700 mb-1">Quick Actions</p>
          <div className="flex flex-wrap gap-3 mt-2">
            <a href="/superadmin/users" className="inline-flex items-center gap-1.5 rounded-md bg-cics-maroon px-4 py-2 text-sm font-medium text-white no-underline hover:bg-cics-maroon-600">
              <Users className="h-4 w-4" />
              Manage Users
            </a>
            <a href="/superadmin/submissions" className="inline-flex items-center gap-1.5 rounded-md border border-grey-200 bg-white px-4 py-2 text-sm font-medium text-grey-700 no-underline hover:bg-grey-50">
              <FileText className="h-4 w-4" />
              View All Submissions
            </a>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
