"use client"

import { useEffect, useMemo, useState } from 'react'
import { Download, Loader2, Printer } from 'lucide-react'
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui'
import AdminDataTable from '@/components/admin/AdminDataTable'
import AdminMetricCards from '@/components/admin/AdminMetricCards'
import AdminPageHeader from '@/components/admin/AdminPageHeader'
import { getAdminSubmissions, type ApiDocument } from '@/lib/api/documents'
import { getAdminUsers, type ApiUser } from '@/lib/api/users'
import { getUsageMetrics, type UsageMetrics } from '@/lib/api/analytics'
import type { DepartmentReportRow, ReportDateRange, ReportExportFormat } from '@/types/admin'

const DATE_RANGE_OPTIONS: { value: ReportDateRange; label: string }[] = [
  { value: '30d', label: 'Last 30 Days' },
  { value: '90d', label: 'Last 90 Days' },
  { value: 'ytd', label: 'Year to Date' },
  { value: 'all', label: 'All Time' },
]

const EXPORT_FORMAT_OPTIONS: { value: ReportExportFormat; label: string }[] = [
  { value: 'csv', label: 'CSV' },
  { value: 'json', label: 'JSON' },
]

const DEPT_COLORS: Record<string, string> = {
  CS: 'bg-blue-400',
  IT: 'bg-violet-400',
  IS: 'bg-emerald-400',
}

function isWithinRange(dateString: string, range: ReportDateRange) {
  if (range === 'all') return true
  const date = new Date(dateString)
  if (isNaN(date.getTime())) return false
  const now = new Date()
  if (range === '30d') return date >= new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
  if (range === '90d') return date >= new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000)
  if (range === 'ytd') return date >= new Date(now.getFullYear(), 0, 1)
  return true
}

export default function SuperAdminReportsPage() {
  const [submissions, setSubmissions] = useState<ApiDocument[]>([])
  const [users, setUsers] = useState<ApiUser[]>([])
  const [usageMetrics, setUsageMetrics] = useState<UsageMetrics>({ repositoryViews: 0, uniqueVisitors: 0, searches: 0, downloads: 0 })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [range, setRange] = useState<ReportDateRange>('all')
  const [selectedFormat, setSelectedFormat] = useState<ReportExportFormat>('csv')

  useEffect(() => {
    setLoading(true)
    Promise.all([
      getAdminSubmissions().catch(() => []),
      getAdminUsers().catch(() => []),
      getUsageMetrics().catch(() => ({ repositoryViews: 0, uniqueVisitors: 0, searches: 0, downloads: 0 })),
    ])
      .then(([subData, userData, metricsData]) => {
        setSubmissions(subData)
        setUsers(userData)
        setUsageMetrics(metricsData)
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [])

  const filtered = useMemo(
    () => submissions.filter((s) => isWithinRange(s.created_at, range)),
    [submissions, range],
  )

  const filteredUsers = useMemo(
    () => users.filter((u) => isWithinRange(u.created_at, range)),
    [users, range],
  )

  // KPI cards
  const kpiCards = useMemo(() => [
    { label: 'Total Submissions', value: filtered.length, tone: 'blue' as const },
    { label: 'Pending Review', value: filtered.filter((s) => s.status === 'pending').length, tone: 'orange' as const },
    { label: 'Approved', value: filtered.filter((s) => s.status === 'approved').length, tone: 'green' as const },
    { label: 'Rejected', value: filtered.filter((s) => s.status === 'rejected').length, tone: 'red' as const },
    { label: 'Total Users', value: users.length, tone: 'default' as const },
    { label: 'Active Admins', value: users.filter((u) => u.role === 'admin' && u.is_active).length, tone: 'blue' as const },
    { label: 'Active Students', value: users.filter((u) => u.role === 'student' && u.is_active).length, tone: 'green' as const },
    { label: 'Inactive Accounts', value: users.filter((u) => !u.is_active).length, tone: 'red' as const },
  ], [filtered, users])

  // Department breakdown
  const departmentBreakdown = useMemo((): DepartmentReportRow[] => {
    const deptMap = new Map<string, { total: number; approved: number; rejected: number; pending: number; revision: number }>()
    for (const s of filtered) {
      const d = s.department
      const existing = deptMap.get(d) ?? { total: 0, approved: 0, rejected: 0, pending: 0, revision: 0 }
      existing.total++
      if (s.status === 'approved') existing.approved++
      if (s.status === 'rejected') existing.rejected++
      if (s.status === 'pending') existing.pending++
      if (s.status === 'revision') existing.revision++
      deptMap.set(d, existing)
    }
    return Array.from(deptMap.entries()).map(([department, data]) => ({
      department,
      total: data.total,
      approved: data.approved,
      rejected: data.rejected,
      approvalRate: data.total > 0 ? Math.round((data.approved / data.total) * 100) : 0,
    }))
  }, [filtered])

  // User breakdown per role and department (super_admin excluded — they're system-level, not dept-scoped)
  const userBreakdown = useMemo(() => {
    const map = new Map<string, { admins: number; students: number; total: number; active: number }>()
    for (const u of users) {
      if (u.role === 'super_admin') continue
      const dept = u.department ?? 'All'
      const existing = map.get(dept) ?? { admins: 0, students: 0, total: 0, active: 0 }
      existing.total++
      if (u.is_active) existing.active++
      if (u.role === 'admin') existing.admins++
      if (u.role === 'student') existing.students++
      map.set(dept, existing)
    }
    return Array.from(map.entries()).map(([dept, data]) => ({ dept, ...data }))
  }, [users])

  // Last 6 months trend
  const months = useMemo(() => {
    const result = []
    for (let i = 5; i >= 0; i--) {
      const d = new Date()
      d.setMonth(d.getMonth() - i)
      result.push({ label: d.toLocaleDateString('en-US', { month: 'short' }), month: d.getMonth(), year: d.getFullYear() })
    }
    return result
  }, [])

  const trend = useMemo(() => months.map((m) => ({
    label: m.label,
    CS: submissions.filter((s) => { const d = new Date(s.created_at); return d.getMonth() === m.month && d.getFullYear() === m.year && s.department === 'CS' }).length,
    IT: submissions.filter((s) => { const d = new Date(s.created_at); return d.getMonth() === m.month && d.getFullYear() === m.year && s.department === 'IT' }).length,
    IS: submissions.filter((s) => { const d = new Date(s.created_at); return d.getMonth() === m.month && d.getFullYear() === m.year && s.department === 'IS' }).length,
  })), [submissions, months])

  const maxTrend = Math.max(1, ...trend.map((t) => t.CS + t.IT + t.IS))
  const [hoveredMonth, setHoveredMonth] = useState<string | null>(null)

  // System audit log built from submissions + reviews
  const auditLogs = useMemo(() => {
    type AuditEntry = { id: string; at: string; actor: string; action: string; target: string; department: string; details: string; ts: number }
    const logs: AuditEntry[] = []

    for (const sub of filtered) {
      const authors = Array.isArray(sub.authors) ? sub.authors : []
      const actor = authors[0] ?? 'Student'
      logs.push({
        id: `submit-${sub.id}`,
        at: new Date(sub.created_at).toLocaleString('en-US', { year: 'numeric', month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' }),
        actor,
        action: 'Submitted',
        target: sub.title,
        department: sub.department,
        details: 'Initial submission',
        ts: new Date(sub.created_at).getTime(),
      })

      if (sub.reviews) {
        for (const rev of sub.reviews) {
          const action = rev.decision === 'approve' ? 'Approved' : rev.decision === 'reject' ? 'Rejected' : 'Revision Requested'
          const details = rev.feedback_text ? rev.feedback_text.substring(0, 60) + (rev.feedback_text.length > 60 ? '…' : '') : 'Review decision applied'
          logs.push({
            id: `rev-${rev.id ?? sub.id + rev.created_at}`,
            at: new Date(rev.created_at).toLocaleString('en-US', { year: 'numeric', month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' }),
            actor: rev.reviewed_by ?? 'Admin',
            action,
            target: sub.title,
            department: sub.department,
            details,
            ts: new Date(rev.created_at).getTime(),
          })
        }
      }
    }

    return logs.sort((a, b) => b.ts - a.ts).slice(0, 50).map(({ ts, ...rest }) => rest)
  }, [filtered])


  function handleExport() {
    let content = ''
    let fileName = ''
    const date = new Date().toISOString().split('T')[0]

    if (selectedFormat === 'json') {
      content = JSON.stringify({ kpiCards, departmentBreakdown, userBreakdown, trend, usageMetrics, auditLogs }, null, 2)
      fileName = `spark-superadmin-report-${date}.json`
      const blob = new Blob([content], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a'); a.href = url; a.download = fileName
      document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(url)
      return
    }

    const rows = [
      '# SPARK Super Admin Report',
      `# Generated: ${new Date().toLocaleString()}`,
      `# Range: ${range}`,
      '',
      '## Key Performance Indicators',
      'Metric,Value',
      ...kpiCards.map((c) => `${c.label},${c.value}`),
      '',
      '## Department Submission Breakdown',
      'Department,Total,Approved,Rejected,Approval Rate',
      ...departmentBreakdown.map((d) => `${d.department},${d.total},${d.approved},${d.rejected},${d.approvalRate}%`),
      '',
      '## User Breakdown by Department',
      'Department,Admins,Students,Total,Active',
      ...userBreakdown.map((u) => `${u.dept},${u.admins},${u.students},${u.total},${u.active}`),
      '',
      '## Submission Trend (Last 6 Months)',
      'Month,CS,IT,IS,Total',
      ...trend.map((t) => `${t.label},${t.CS},${t.IT},${t.IS},${t.CS + t.IT + t.IS}`),
      '',
      '## Usage Metrics',
      'Metric,Value',
      `Approved Documents,${usageMetrics.repositoryViews}`,
      `Active Users,${usageMetrics.uniqueVisitors}`,
      `Full-Text Requests,${usageMetrics.searches}`,
      `Fulfilled Requests,${usageMetrics.downloads}`,
      '',
      '## System Audit Log (Top 50)',
      'Time,Actor,Action,Department,Target,Details',
      ...auditLogs.map((l) => `"${l.at}","${l.actor}","${l.action}","${l.department}","${l.target.replace(/,/g, ';')}","${l.details.replace(/,/g, ';')}"`),
    ]

    content = rows.join('\n')
    fileName = `spark-superadmin-report-${date}.csv`
    const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a'); a.href = url; a.download = fileName
    document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-4">
      <AdminPageHeader
        title="System Reports"
        subtitle="Cross-department analytics and performance overview for all of SPARK."
        action={
          <div className="flex items-center gap-2">
            <Select value={selectedFormat} onValueChange={(v) => setSelectedFormat(v as ReportExportFormat)}>
              <SelectTrigger className="h-9 w-[110px] border-grey-200 bg-white text-xs text-navy">
                <SelectValue placeholder="Format" />
              </SelectTrigger>
              <SelectContent>
                {EXPORT_FORMAT_OPTIONS.map((item) => (
                  <SelectItem key={item.value} value={item.value}>{item.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button variant="outline" className="h-9 px-3 text-xs" onClick={handleExport}>
              <Download className="mr-1 h-3.5 w-3.5" />
              Download
            </Button>
            <Button variant="outline" className="h-9 px-3 text-xs" onClick={() => globalThis.print()}>
              <Printer className="mr-1 h-3.5 w-3.5" />
              Print / PDF
            </Button>
          </div>
        }
      />

      <div className="flex items-center gap-2">
        <Select value={range} onValueChange={(v) => setRange(v as ReportDateRange)}>
          <SelectTrigger className="h-9 w-[160px] border-grey-200 bg-white text-xs text-navy">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {DATE_RANGE_OPTIONS.map((item) => (
              <SelectItem key={item.value} value={item.value}>{item.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <div className="flex h-32 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-cics-maroon" />
          <span className="ml-3 text-sm text-grey-500">Loading report data…</span>
        </div>
      ) : error ? (
        <div className="rounded-md border border-red-200 bg-red-50 p-4 text-sm text-red-700">Failed to load reports: {error}</div>
      ) : (
        <>
          {/* KPI Cards */}
          <AdminMetricCards cards={kpiCards} columnsClassName="sm:grid-cols-2 xl:grid-cols-4" />

          <section className="grid gap-4 xl:grid-cols-2">
            {/* Submission Trend — per department */}
            <Card className="border border-grey-200 shadow-none">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-navy">Submission Trend by Department (Last 6 Months)</CardTitle>
              </CardHeader>
              <CardContent className="px-6 pb-6">
                <div className="flex items-end justify-between gap-3 h-[180px]">
                  {trend.map((point, idx) => {
                    const total = point.CS + point.IT + point.IS
                    const isHovered = hoveredMonth === point.label
                    const currentMonth = trend[trend.length - 1]
                    const currentTotal = currentMonth.CS + currentMonth.IT + currentMonth.IS
                    const isCurrentMonth = idx === trend.length - 1

                    function diffLabel(diff: number) {
                      if (diff === 0) return <span className="text-grey-400">—</span>
                      return (
                        <span className={diff > 0 ? 'text-green-600' : 'text-red-500'}>
                          {diff > 0 ? '+' : ''}{diff}
                        </span>
                      )
                    }

                    return (
                      <div
                        key={point.label}
                        className="relative flex flex-col items-center flex-1 h-full"
                        onMouseEnter={() => setHoveredMonth(point.label)}
                        onMouseLeave={() => setHoveredMonth(null)}
                      >
                        {isHovered && (
                          <div className="absolute bottom-full mb-2 z-10 min-w-[120px] rounded-lg border border-grey-200 bg-white px-3 py-2 shadow-md text-xs left-1/2 -translate-x-1/2">
                            <p className="font-semibold text-grey-700 mb-1 border-b border-grey-100 pb-1">
                              {point.label}{isCurrentMonth && <span className="ml-1 text-[10px] font-normal text-grey-400">(current)</span>}
                            </p>
                            {(['CS', 'IT', 'IS'] as const).map((dept) => (
                              <div key={dept} className="flex items-center justify-between gap-3">
                                <span className="inline-flex items-center gap-1 text-grey-500">
                                  <span className={`h-2 w-2 rounded-sm ${DEPT_COLORS[dept]}`} />
                                  {dept}
                                </span>
                                <span className="inline-flex items-center gap-2">
                                  <span className="font-medium text-grey-700">{point[dept]}</span>
                                  {!isCurrentMonth && <span className="w-6 text-right">{diffLabel(point[dept] - currentMonth[dept])}</span>}
                                </span>
                              </div>
                            ))}
                            <div className="flex items-center justify-between gap-3 border-t border-grey-100 mt-1 pt-1">
                              <span className="text-grey-500">Total</span>
                              <span className="inline-flex items-center gap-2">
                                <span className="font-semibold text-grey-800">{total}</span>
                                {!isCurrentMonth && <span className="w-6 text-right">{diffLabel(total - currentTotal)}</span>}
                              </span>
                            </div>
                          </div>
                        )}
                        <div className="flex-1 w-full flex items-end justify-center pb-2 gap-0.5">
                          {(['CS', 'IT', 'IS'] as const).map((dept) => (
                            <div
                              key={dept}
                              className={`flex-1 rounded-t-sm ${DEPT_COLORS[dept]} transition-all`}
                              style={{ height: `${Math.max(point[dept] > 0 ? 8 : 0, (point[dept] / maxTrend) * 100)}%` }}
                            />
                          ))}
                        </div>
                        <div className="pt-2 border-t border-grey-200 w-full text-center">
                          <p className="text-[11px] font-medium text-grey-600">{point.label}</p>
                          <p className="text-xs font-semibold text-grey-700 mt-0.5">{total}</p>
                        </div>
                      </div>
                    )
                  })}
                </div>
                <div className="mt-3 flex items-center gap-4 text-[11px] text-grey-500">
                  {(['CS', 'IT', 'IS'] as const).map((dept) => (
                    <span key={dept} className="inline-flex items-center gap-1">
                      <span className={`h-2 w-2 rounded-sm ${DEPT_COLORS[dept]}`} />
                      {dept}
                    </span>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Department Submission Breakdown */}
            <Card className="border border-grey-200 shadow-none">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-navy">Department Submission Breakdown</CardTitle>
              </CardHeader>
              <CardContent className="overflow-x-auto p-0 px-2 sm:px-6">
                <AdminDataTable<DepartmentReportRow>
                  columns={[
                    { id: 'department', header: 'Dept', renderCell: (r) => <span className="font-medium">{r.department}</span> },
                    { id: 'total', header: 'Total', headerClassName: 'text-center', className: 'text-center', renderCell: (r) => r.total },
                    { id: 'approved', header: 'Approved', headerClassName: 'text-center', className: 'text-center', renderCell: (r) => r.approved },
                    { id: 'rejected', header: 'Rejected', headerClassName: 'text-center', className: 'text-center', renderCell: (r) => r.rejected },
                    { id: 'rate', header: 'Approval Rate', headerClassName: 'text-center', className: 'text-center', renderCell: (r) => `${r.approvalRate}%` },
                  ]}
                  rows={departmentBreakdown}
                  rowKey={(r) => r.department}
                  emptyMessage="No submission data available."
                  minWidthClassName="min-w-[380px]"
                />
              </CardContent>
            </Card>
          </section>

          <section className="grid gap-4 xl:grid-cols-2">
            {/* User Breakdown per department */}
            <Card className="border border-grey-200 shadow-none">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-navy">User Breakdown by Department</CardTitle>
              </CardHeader>
              <CardContent className="overflow-x-auto p-0 px-2 sm:px-6">
                <AdminDataTable
                  columns={[
                    { id: 'dept', header: 'Dept', renderCell: (r) => <span className="font-medium">{r.dept}</span> },
                    { id: 'admins', header: 'Admins', headerClassName: 'text-center', className: 'text-center', renderCell: (r) => r.admins },
                    { id: 'students', header: 'Students', headerClassName: 'text-center', className: 'text-center', renderCell: (r) => r.students },
                    { id: 'total', header: 'Total', headerClassName: 'text-center', className: 'text-center', renderCell: (r) => r.total },
                    { id: 'active', header: 'Active', headerClassName: 'text-center', className: 'text-center', renderCell: (r) => r.active },
                  ]}
                  rows={userBreakdown}
                  rowKey={(r) => r.dept}
                  emptyMessage="No user data available."
                  minWidthClassName="min-w-[380px]"
                />
              </CardContent>
            </Card>

            {/* Usage Metrics */}
            <Card className="border border-grey-200 shadow-none">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-navy">Repository Usage Metrics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                {[
                  { label: 'Approved Documents', value: usageMetrics.repositoryViews },
                  { label: 'Active Users', value: usageMetrics.uniqueVisitors },
                  { label: 'Full-Text Requests', value: usageMetrics.searches },
                  { label: 'Fulfilled Requests', value: usageMetrics.downloads },
                ].map((item) => (
                  <div key={item.label} className="flex items-center justify-between border-b border-grey-100 pb-2 last:border-0 last:pb-0">
                    <span className="text-grey-600">{item.label}</span>
                    <span className="font-semibold text-grey-800">{item.value.toLocaleString()}</span>
                  </div>
                ))}
              </CardContent>
            </Card>
          </section>

          {/* System Audit Log */}
          <Card className="border border-grey-200 shadow-none">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-navy">System Audit Log</CardTitle>
            </CardHeader>
            <CardContent className="overflow-x-auto p-0 px-2 sm:px-6">
              <AdminDataTable
                columns={[
                  { id: 'at', header: 'Time', renderCell: (r) => <span className="whitespace-nowrap text-grey-600">{r.at}</span> },
                  { id: 'actor', header: 'Actor', className: 'whitespace-nowrap', renderCell: (r) => r.actor },
                  { id: 'action', header: 'Action', renderCell: (r) => {
                    const tone: Record<string, string> = {
                      Submitted: 'bg-blue-50 text-blue-700 border-blue-200',
                      Approved: 'bg-green-50 text-green-700 border-green-200',
                      Rejected: 'bg-red-50 text-red-700 border-red-200',
                      'Revision Requested': 'bg-amber-50 text-amber-700 border-amber-200',
                    }
                    return (
                      <span className={`inline-flex whitespace-nowrap rounded-full border px-2 py-0.5 text-[11px] font-medium ${tone[r.action] ?? 'bg-grey-50 text-grey-600 border-grey-200'}`}>
                        {r.action}
                      </span>
                    )
                  }},
                  { id: 'department', header: 'Dept', className: 'whitespace-nowrap text-grey-600', renderCell: (r) => r.department },
                  { id: 'target', header: 'Target', className: 'max-w-[300px]', renderCell: (r) => <span className="line-clamp-2">{r.target}</span> },
                  { id: 'details', header: 'Details', className: 'max-w-[260px]', renderCell: (r) => <span className="line-clamp-2 text-grey-500 text-xs">{r.details}</span> },
                ]}
                rows={auditLogs}
                rowKey={(r) => r.id}
                emptyMessage="No audit activity for the selected range."
                minWidthClassName="min-w-[820px]"
              />
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}
