"use client"

import { useEffect, useMemo, useState } from 'react'
import { Download, Printer, Search, Loader2 } from 'lucide-react'
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
import AdminFilterBar from '@/components/admin/AdminFilterBar'
import AdminMetricCards from '@/components/admin/AdminMetricCards'
import AdminPageHeader from '@/components/admin/AdminPageHeader'
import { getSubmissionStatuses } from '@/lib/utils'
import { getAdminSession } from '@/lib/admin/session'
import { getAdminSubmissions, type ApiDocument } from '@/lib/api/documents'
import { getAdminUsers, type ApiUser } from '@/lib/api/users'
import type {
  DepartmentReportRow,
  ReportDateRange,
  ReportExportFormat,
  ReportExportPreset,
  ReportFilters,
  ReportSnapshot,
  SubmissionStatus,
} from '@/types/admin'

const DATE_RANGE_OPTIONS: { value: ReportDateRange; label: string }[] = [
  { value: '30d', label: 'Last 30 Days' },
  { value: '90d', label: 'Last 90 Days' },
  { value: 'ytd', label: 'Year to Date' },
  { value: 'all', label: 'All Time' },
]

const REPORT_PRESET_OPTIONS: { value: ReportExportPreset; label: string }[] = [
  { value: 'executive-summary', label: 'Executive Summary' },
  { value: 'submission-pipeline', label: 'Submission Pipeline' },
  { value: 'department-performance', label: 'Department Performance' },
  { value: 'user-access-usage', label: 'User & Access Usage' },
  { value: 'audit-trail', label: 'Audit Trail' },
]

const EXPORT_FORMAT_OPTIONS: { value: ReportExportFormat; label: string }[] = [
  { value: 'csv', label: 'CSV' },
  { value: 'json', label: 'JSON' },
]

function getStatusBarClass(status: SubmissionStatus | string) {
  if (status === 'Approved') return 'bg-green-400'
  if (status === 'Rejected') return 'bg-red-400'
  if (status === 'Revision Requested') return 'bg-violet-400'
  return 'bg-cics-maroon-300'
}

function isWithinRange(dateString: string, range: ReportDateRange) {
  if (range === 'all') return true
  const date = new Date(dateString)
  if (isNaN(date.getTime())) return false
  const now = new Date()
  
  if (range === '30d') {
    const cutoff = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
    return date >= cutoff
  }
  if (range === '90d') {
    const cutoff = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000)
    return date >= cutoff
  }
  if (range === 'ytd') {
    const cutoff = new Date(now.getFullYear(), 0, 1) // Jan 1st of current year
    return date >= cutoff
  }
  return true
}

export default function AdminReportsPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedPreset, setSelectedPreset] = useState<ReportExportPreset>('executive-summary')
  const [selectedFormat, setSelectedFormat] = useState<ReportExportFormat>('csv')

  const [submissions, setSubmissions] = useState<ApiDocument[]>([])
  const [users, setUsers] = useState<ApiUser[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [filters, setFilters] = useState<ReportFilters>(() => ({
    range: 'all', // Show all-time data by default to match dashboard exactly
    department: 'all-departments',
    status: 'all-status',
  }))

  useEffect(() => {
    setLoading(true)
    Promise.all([
      getAdminSubmissions().catch(() => []),
      getAdminUsers().catch(() => []),
    ])
      .then(([subData, userData]) => {
        setSubmissions(subData)
        setUsers(userData)
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [])

  const report: ReportSnapshot = useMemo(() => {
    // 1. Apply filters
    const filteredSubmissions = submissions.filter(s => {
      const inRange = isWithinRange(s.created_at, filters.range)
      const matchesDept = filters.department === 'all-departments' || s.department === filters.department
      
      let mappedStatus = s.status === 'revision' ? 'Revision Requested' : 
                         s.status === 'pending' ? 'Pending Review' : 
                         s.status === 'approved' ? 'Approved' : 'Rejected'
                         
      const matchesStatus = filters.status === 'all-status' || mappedStatus === filters.status
      return inRange && matchesDept && matchesStatus
    })

    const total = filteredSubmissions.length
    const pending = filteredSubmissions.filter(s => s.status === 'pending').length
    const approved = filteredSubmissions.filter(s => s.status === 'approved').length
    const rejected = filteredSubmissions.filter(s => s.status === 'rejected').length
    const revision = filteredSubmissions.filter(s => s.status === 'revision').length

    // 2. KPI Cards
    const kpiCards = [
      { label: 'Total Submissions', value: total, tone: 'blue' as const },
      { label: 'Pending Review', value: pending, tone: 'orange' as const },
      { label: 'Approved', value: approved, tone: 'green' as const },
      { label: 'Rejected', value: rejected, tone: 'red' as const },
    ]

    // 3. Status Breakdown
    const statusBreakdown = [
      { status: 'Pending Review' as const, count: pending, percentage: total > 0 ? Math.round((pending / total) * 100) : 0 },
      { status: 'Approved' as const, count: approved, percentage: total > 0 ? Math.round((approved / total) * 100) : 0 },
      { status: 'Rejected' as const, count: rejected, percentage: total > 0 ? Math.round((rejected / total) * 100) : 0 },
      { status: 'Revision Requested' as const, count: revision, percentage: total > 0 ? Math.round((revision / total) * 100) : 0 },
    ]

    // 4. Department Breakdown
    const deptMap = new Map<string, { total: number; approved: number; rejected: number }>()
    filteredSubmissions.forEach(s => {
      const existing = deptMap.get(s.department) || { total: 0, approved: 0, rejected: 0 }
      existing.total++
      if (s.status === 'approved') existing.approved++
      if (s.status === 'rejected') existing.rejected++
      deptMap.set(s.department, existing)
    })
    
    // Extrapolate all available departments visually if missing data matches 'all-departments'
    if (filters.department === 'all-departments') {
      const allDepts = Array.from(new Set(submissions.map(x => x.department)))
      for (const d of allDepts) {
        if (!deptMap.has(d)) deptMap.set(d, { total: 0, approved: 0, rejected: 0 })
      }
    }

    const departmentBreakdown = Array.from(deptMap.entries()).map(([department, data]) => ({
      department,
      total: data.total,
      approved: data.approved,
      rejected: data.rejected,
      approvalRate: data.total > 0 ? Math.round((data.approved / data.total) * 100) : 0,
    }))

    // 5. Generate dynamically grouped trend data (last 6 months)
    const months = []
    for (let i = 5; i >= 0; i--) {
      const d = new Date()
      d.setMonth(d.getMonth() - i)
      months.push({
        label: d.toLocaleDateString('en-US', { month: 'short' }),
        year: d.getFullYear(),
        month: d.getMonth()
      })
    }
    
    const trend = months.map(m => {
      const submitted = filteredSubmissions.filter(s => {
        const d = new Date(s.created_at)
        return d.getMonth() === m.month && d.getFullYear() === m.year
      }).length
      return { label: m.label, submitted }
    })

    // 6. User growth data
    const filteredUsers = users.filter(u => {
      if (filters.department !== 'all-departments' && u.department !== filters.department) return false
      return true
    })
    const userGrowth = months.map(m => {
      const newUsers = filteredUsers.filter(u => {
        const d = new Date(u.created_at)
        return d.getMonth() === m.month && d.getFullYear() === m.year
      }).length
      return { label: m.label, newUsers }
    })
    
    // 7. Usage data (zeroed-out permanently unless tracked)
    const usage = {
      repositoryViews: 0,
      uniqueVisitors: 0,
      searches: 0,
      downloads: 0,
    }

    // 8. Dynamic Audit logs
    type PseudoAudit = { id: string, at: string, actor: string, action: string, target: string, details: string, ts: number }
    const audits: PseudoAudit[] = []
    
    filteredSubmissions.forEach(sub => {
      const authorsList = Array.isArray(sub.authors) ? sub.authors : []
      const fallbackAuthorStr = typeof sub.authors === 'string' ? sub.authors : ''
      const authorName = authorsList.length > 0 ? authorsList[0] : (fallbackAuthorStr || 'Student User')
      
      // Submission Log
      audits.push({
        id: `submit-${sub.id}`,
        at: new Date(sub.created_at).toLocaleString('en-US', { year: 'numeric', month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' }),
        actor: authorName,
        action: 'Submitted',
        target: sub.title,
        details: 'Initial submission',
        ts: new Date(sub.created_at).getTime()
      })
      
      // Reviews Logs
      if (sub.reviews) {
        sub.reviews.forEach((rev, index) => {
           let action = rev.decision === 'approve' ? 'Approved' : rev.decision === 'reject' ? 'Rejected' : 'Revision Requested'
           let detailsText = rev.feedback_text ? rev.feedback_text.substring(0, 50) + (rev.feedback_text.length > 50 ? '...' : '') : 'Review decision applied'
           audits.push({
             id: `rev-${rev.id || sub.id + '-' + index}`,
             at: new Date(rev.created_at).toLocaleString('en-US', { year: 'numeric', month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' }),
             actor: rev.reviewed_by || 'Admin User',
             action: action,
             target: sub.title,
             details: detailsText,
             ts: new Date(rev.created_at).getTime()
           })
        })
      }
    })
    
    audits.sort((a, b) => b.ts - a.ts)
    const recentAudits = audits.slice(0, 50).map(a => {
      const { ts, ...rest } = a;
      return rest;
    })

    return {
      kpiCards,
      trend,
      statusBreakdown,
      departmentBreakdown,
      userGrowth,
      usage,
      auditLogs: recentAudits,
    } as ReportSnapshot
  }, [submissions, users, filters])


  const departments = useMemo(
    () => Array.from(new Set(submissions.map((s) => s.department))),
    [submissions],
  )
  const statuses = useMemo(() => getSubmissionStatuses(), [])

  const maxTrend = Math.max(1, ...report.trend.map((item) => item.submitted))
  const maxUserGrowth = Math.max(1, ...report.userGrowth.map((item) => item.newUsers))

  const filteredDepartments = useMemo(() => {
    const normalized = searchQuery.trim().toLowerCase()
    if (!normalized) {
      return report.departmentBreakdown
    }

    return report.departmentBreakdown.filter((item) => item.department.toLowerCase().includes(normalized))
  }, [report.departmentBreakdown, searchQuery])

  function updateFilters(patch: Partial<ReportFilters>) {
    setFilters((current) => ({ ...current, ...patch }))
  }

  function handleExportReport() {
    let content = ''
    let mimeType = ''
    let fileName = ''
    
    if (selectedFormat === 'json') {
      content = JSON.stringify(report, null, 2)
      mimeType = 'application/json'
      fileName = `report-${selectedPreset}-${Date.now()}.json`
    } else {
      // CSV format snippet
      const rows = ['Metric,Value']
      report.kpiCards.forEach(card => {
        rows.push(`${card.label},${card.value}`)
      })
      rows.push('', 'Status,Count')
      report.statusBreakdown.forEach(st => {
        rows.push(`${st.status},${st.count}`)
      })
      rows.push('', 'Department,Total,Approved,Rejected')
      report.departmentBreakdown.forEach(d => {
        rows.push(`${d.department},${d.total},${d.approved},${d.rejected}`)
      })
      content = rows.join('\n')
      mimeType = 'text/csv'
      fileName = `report-${selectedPreset}-${Date.now()}.csv`
    }

    const blob = new Blob([content], { type: mimeType })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = fileName
    document.body.appendChild(link)
    link.click()
    link.remove()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-4">
      <AdminPageHeader
        title="Reports"
        subtitle="Analytics, performance, usage, and audit reporting for thesis repository operations."
        action={
          <div className="flex items-center gap-2">
            <Select value={selectedPreset} onValueChange={(value) => setSelectedPreset(value as ReportExportPreset)}>
              <SelectTrigger className="h-9 w-[190px] border-grey-200 bg-white text-xs text-navy dark:text-navy">
                <SelectValue placeholder="Select report" />
              </SelectTrigger>
              <SelectContent>
                {REPORT_PRESET_OPTIONS.map((item) => (
                  <SelectItem key={item.value} value={item.value}>{item.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedFormat} onValueChange={(value) => setSelectedFormat(value as ReportExportFormat)}>
              <SelectTrigger className="h-9 w-[110px] border-grey-200 bg-white text-xs text-navy dark:text-navy">
                <SelectValue placeholder="Format" />
              </SelectTrigger>
              <SelectContent>
                {EXPORT_FORMAT_OPTIONS.map((item) => (
                  <SelectItem key={item.value} value={item.value}>{item.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button variant="outline" className="h-9 px-3 text-xs" onClick={handleExportReport}>
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

      <Card className="border border-grey-200 shadow-none">
        <CardContent className="p-4">
          <AdminFilterBar
            searchValue={searchQuery}
            onSearchChange={setSearchQuery}
            searchPlaceholder="Search department reports..."
            controls={
              <>
                <Select value={filters.range} onValueChange={(value) => updateFilters({ range: value as ReportDateRange })}>
                  <SelectTrigger className="h-10 w-[160px] border-grey-200 bg-white text-xs text-navy dark:text-navy">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {DATE_RANGE_OPTIONS.map((item) => (
                      <SelectItem key={item.value} value={item.value}>{item.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={filters.department} onValueChange={(value) => updateFilters({ department: value })}>
                  <SelectTrigger className="h-10 w-[170px] border-grey-200 bg-white text-xs text-navy dark:text-navy">
                    <SelectValue placeholder="All Departments" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all-departments">All Departments</SelectItem>
                    {departments.map((item) => (
                      <SelectItem key={item} value={item}>{item}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={filters.status} onValueChange={(value) => updateFilters({ status: value as ReportFilters['status'] })}>
                  <SelectTrigger className="h-10 w-[150px] border-grey-200 bg-white text-xs text-navy dark:text-navy">
                    <SelectValue placeholder="All Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all-status">All Status</SelectItem>
                    {statuses.map((item) => (
                      <SelectItem key={item} value={item}>{item}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </>
            }
          />
        </CardContent>
      </Card>

      {loading ? (
        <div className="flex h-32 items-center justify-center p-8">
          <Loader2 className="h-8 w-8 animate-spin text-cics-maroon-300" />
          <span className="ml-3 text-sm text-grey-500">Loading accurate reporting data...</span>
        </div>
      ) : error ? (
        <div className="rounded-md border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          Failed to load reports: {error}
        </div>
      ) : (
        <>
          <AdminMetricCards cards={report.kpiCards} columnsClassName="sm:grid-cols-2 xl:grid-cols-4" />

          <section className="grid gap-4 xl:grid-cols-2">
            <Card className="border border-grey-200 shadow-none">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-navy">Submission Volume Trend</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-6 gap-2">
                {report.trend.map((point) => (
                  <div key={point.label} className="space-y-2 text-center">
                    <div className="flex h-[120px] items-end justify-center rounded-md bg-grey-50 p-1">
                      <div className="w-8 rounded-sm bg-cics-maroon" style={{ height: `${Math.max(8, (point.submitted / maxTrend) * 100)}%` }} />
                    </div>
                    <p className="text-[10px] text-grey-500">{point.label}</p>
                    <p className="text-[11px] font-medium text-grey-700">{point.submitted}</p>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="border border-grey-200 shadow-none">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-navy">Status Performance</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-xs">
                {report.statusBreakdown.map((item) => (
                  <div key={item.status} className="space-y-1">
                    <div className="flex items-center justify-between text-grey-600">
                      <span>{item.status}</span>
                      <span className="font-medium text-grey-700">{item.count} ({item.percentage}%)</span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-grey-100">
                      <div className={`h-2 rounded-full ${getStatusBarClass(item.status)}`} style={{ width: `${item.percentage}%` }} />
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </section>

          <section className="grid gap-4 xl:grid-cols-2">
            <Card className="border border-grey-200 shadow-none">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-navy">Department Breakdown</CardTitle>
              </CardHeader>
              <CardContent className="overflow-x-auto p-0 px-2 sm:px-6">
                <AdminDataTable<DepartmentReportRow>
                  columns={[
                    { id: 'department', header: 'Department', renderCell: (row) => <span className="pl-4 sm:pl-0 font-medium">{row.department}</span> },
                    { id: 'total', header: 'Total', headerClassName: 'text-center', className: 'text-center', renderCell: (row) => row.total },
                    { id: 'approved', header: 'Approved', headerClassName: 'text-center', className: 'text-center', renderCell: (row) => row.approved },
                    { id: 'rejected', header: 'Rejected', headerClassName: 'text-center', className: 'text-center', renderCell: (row) => row.rejected },
                    { id: 'rate', header: 'Approval Rate', headerClassName: 'text-center', className: 'text-center', renderCell: (row) => `${row.approvalRate}%` },
                  ]}
                  rows={filteredDepartments}
                  rowKey={(row) => row.department}
                  emptyMessage="No department data for selected filters."
                  minWidthClassName="min-w-[400px]"
                />
              </CardContent>
            </Card>

            <Card className="border border-grey-200 shadow-none">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-navy">User Growth (Active Departments)</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {report.userGrowth.map((item) => (
                  <div key={item.label} className="space-y-1">
                    <div className="flex items-center justify-between text-xs text-grey-600">
                      <span>{item.label}</span>
                      <span className="font-medium text-grey-700">{item.newUsers} new</span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-grey-100">
                      <div className="h-2 rounded-full bg-blue-400" style={{ width: `${Math.max(6, (item.newUsers / maxUserGrowth) * 100)}%` }} />
                    </div>
                  </div>
                ))}

                <div className="rounded-md border border-grey-200 bg-grey-50 p-3 text-xs text-grey-600">
                  <p className="inline-flex items-center gap-1 font-medium text-grey-700">
                    <Search className="h-3.5 w-3.5 text-grey-500" />
                    Access & Usage Metrics
                  </p>
                  <p className="mt-1 text-grey-500 italic">No usage tracking available. Defaulting to 0.</p>
                  <p className="mt-1">Views: <span className="font-medium text-grey-700">{report.usage.repositoryViews.toLocaleString()}</span></p>
                  <p>Visitors: <span className="font-medium text-grey-700">{report.usage.uniqueVisitors.toLocaleString()}</span></p>
                  <p>Searches: <span className="font-medium text-grey-700">{report.usage.searches.toLocaleString()}</span></p>
                  <p>Downloads: <span className="font-medium text-grey-700">{report.usage.downloads.toLocaleString()}</span></p>
                </div>
              </CardContent>
            </Card>
          </section>

          <Card className="border border-grey-200 shadow-none">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-navy">System Audit Logs</CardTitle>
            </CardHeader>
            <CardContent className="overflow-x-auto p-0 px-2 sm:px-6">
              <AdminDataTable
                columns={[
                  { id: 'at', header: 'Time', renderCell: (row) => <span className="pl-4 sm:pl-0 whitespace-nowrap">{row.at}</span> },
                  { id: 'actor', header: 'Actor', className: 'whitespace-nowrap', renderCell: (row) => row.actor },
                  { id: 'action', header: 'Action', className: 'whitespace-nowrap font-medium', renderCell: (row) => row.action },
                  { id: 'target', header: 'Target', className: 'max-w-[350px]', renderCell: (row) => <span className="line-clamp-2">{row.target}</span> },
                  { id: 'details', header: 'Details', className: 'max-w-[320px]', renderCell: (row) => <span className="line-clamp-2 text-grey-600">{row.details ?? '—'}</span> },
                ]}
                rows={report.auditLogs}
                rowKey={(row) => row.id}
                emptyMessage="No audit logs available for selected filters."
                minWidthClassName="min-w-[760px]"
              />
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}
