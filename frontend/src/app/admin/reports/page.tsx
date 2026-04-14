"use client"

import { useEffect, useMemo, useState } from 'react'
import { Download, Printer, Search } from 'lucide-react'
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
import { adminRepository } from '@/lib/admin/admin-repository'
import { getSubmissionStatuses } from '@/lib/utils'
import { getAdminSession } from '@/lib/admin/session'
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

function getStatusBarClass(status: SubmissionStatus) {
  if (status === 'Approved') return 'bg-green-400'
  if (status === 'Rejected') return 'bg-red-400'
  if (status === 'Revision Requested') return 'bg-violet-400'
  return 'bg-cics-maroon-300'
}

const CICS_DEPARTMENTS = ['Computer Science', 'Information Technology', 'Information Systems']

export default function AdminReportsPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedPreset, setSelectedPreset] = useState<ReportExportPreset>('executive-summary')
  const [selectedFormat, setSelectedFormat] = useState<ReportExportFormat>('csv')

  // Scope department filter based on session role
  const sessionDept = useMemo(() => {
    if (typeof window === 'undefined') return null
    const session = getAdminSession()
    if (!session || session.role === 'super_admin') return null
    return session.departmentName ?? null
  }, [])

  const [filters, setFilters] = useState<ReportFilters>(() => ({
    range: '30d',
    department: sessionDept ?? 'all-departments',
    status: 'all-status',
  }))
  const [report, setReport] = useState<ReportSnapshot>(() => adminRepository.getReportSnapshot({
    range: '30d',
    department: sessionDept ?? 'all-departments',
    status: 'all-status',
  }))

  useEffect(() => {
    setReport(adminRepository.getReportSnapshot(filters))
  }, [filters])

  // Dept-scoped admins can only see their own department
  const departments = useMemo(
    () => sessionDept ? [sessionDept] : CICS_DEPARTMENTS,
    [sessionDept],
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
    const exportPayload = adminRepository.getReportExportPayload(selectedPreset, selectedFormat, filters)
    const blob = new Blob([exportPayload.content], { type: exportPayload.mimeType })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = exportPayload.fileName
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
              <SelectTrigger className="h-9 w-[190px] border-grey-200 bg-white text-xs">
                <SelectValue placeholder="Select report" />
              </SelectTrigger>
              <SelectContent>
                {REPORT_PRESET_OPTIONS.map((item) => (
                  <SelectItem key={item.value} value={item.value}>{item.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedFormat} onValueChange={(value) => setSelectedFormat(value as ReportExportFormat)}>
              <SelectTrigger className="h-9 w-[110px] border-grey-200 bg-white text-xs">
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
                  <SelectTrigger className="h-10 w-[160px] border-grey-200 bg-white text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {DATE_RANGE_OPTIONS.map((item) => (
                      <SelectItem key={item.value} value={item.value}>{item.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={filters.department} onValueChange={(value) => updateFilters({ department: value })}>
                  <SelectTrigger className="h-10 w-[170px] border-grey-200 bg-white text-xs">
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
                  <SelectTrigger className="h-10 w-[150px] border-grey-200 bg-white text-xs">
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
          <CardContent className="overflow-x-auto">
            <AdminDataTable<DepartmentReportRow>
              columns={[
                { id: 'department', header: 'Department', renderCell: (row) => row.department },
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
            <CardTitle className="text-sm font-medium text-navy">User Growth</CardTitle>
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
                Access & Usage
              </p>
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
          <CardTitle className="text-sm font-medium text-navy">Audit Logs</CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <AdminDataTable
            columns={[
              { id: 'at', header: 'Time', renderCell: (row) => row.at },
              { id: 'actor', header: 'Actor', renderCell: (row) => row.actor },
              { id: 'action', header: 'Action', renderCell: (row) => row.action },
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
    </div>
  )
}
