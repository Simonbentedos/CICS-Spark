"use client"

import { useEffect, useMemo, useState } from 'react'
import { CheckCircle, Clock, XCircle } from 'lucide-react'
import { Button, Card, CardContent } from '@/components/ui'
import AdminBadge from '@/components/admin/AdminBadge'
import AdminDataTable from '@/components/admin/AdminDataTable'
import AdminFilterBar from '@/components/admin/AdminFilterBar'
import AdminModal from '@/components/admin/AdminModal'
import AdminPageHeader from '@/components/admin/AdminPageHeader'
import AdminPagination from '@/components/admin/AdminPagination'
import {
  getPasswordResetRequests,
  approvePasswordResetRequest,
  declinePasswordResetRequest,
  type PasswordResetRequest,
} from '@/lib/api/auth'

const PAGE_SIZE = 10

const STATUS_TONE: Record<string, 'green' | 'red' | 'orange'> = {
  approved: 'green',
  declined: 'red',
  pending: 'orange',
}

const STATUS_FILTER_OPTIONS = [
  { value: 'all', label: 'All Requests' },
  { value: 'pending', label: 'Pending' },
  { value: 'approved', label: 'Approved' },
  { value: 'declined', label: 'Declined' },
]

type ActionTarget = { request: PasswordResetRequest; action: 'approve' | 'decline' }

export default function PasswordResetRequestsPage() {
  const [requests, setRequests] = useState<PasswordResetRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [statusFilter, setStatusFilter] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [page, setPage] = useState(1)

  const [actionTarget, setActionTarget] = useState<ActionTarget | null>(null)
  const [actionSaving, setActionSaving] = useState(false)
  const [actionError, setActionError] = useState<string | null>(null)

  function fetchRequests() {
    setLoading(true)
    getPasswordResetRequests(statusFilter === 'all' ? undefined : statusFilter)
      .then(setRequests)
      .catch((err) => setError(err.message ?? 'Failed to load requests'))
      .finally(() => setLoading(false))
  }

  useEffect(() => { fetchRequests() }, [statusFilter])
  useEffect(() => { setPage(1) }, [searchQuery, statusFilter])

  const filtered = useMemo(() => {
    const q = searchQuery.trim().toLowerCase()
    if (!q) return requests
    return requests.filter(
      (r) =>
        `${r.first_name} ${r.last_name}`.toLowerCase().includes(q) ||
        r.email.toLowerCase().includes(q),
    )
  }, [requests, searchQuery])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const safePage = Math.min(page, totalPages)
  const paged = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE)

  const pendingCount = requests.filter((r) => r.status === 'pending').length

  const columns = useMemo(
    () => [
      {
        id: 'name',
        header: 'Name',
        renderCell: (r: PasswordResetRequest) => (
          <span className="inline-flex items-center gap-2">
            <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-cics-maroon text-[10px] text-white">
              {`${r.first_name[0] ?? ''}${r.last_name[0] ?? ''}`}
            </span>
            {r.first_name} {r.last_name}
          </span>
        ),
      },
      {
        id: 'email',
        header: 'Email',
        renderCell: (r: PasswordResetRequest) => (
          <span className="text-grey-600">{r.email}</span>
        ),
      },
      {
        id: 'status',
        header: 'Status',
        renderCell: (r: PasswordResetRequest) => (
          <AdminBadge
            label={r.status.charAt(0).toUpperCase() + r.status.slice(1)}
            tone={STATUS_TONE[r.status] ?? 'default'}
          />
        ),
      },
      {
        id: 'requested_at',
        header: 'Requested',
        renderCell: (r: PasswordResetRequest) =>
          new Date(r.requested_at).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
          }),
      },
      {
        id: 'resolved_at',
        header: 'Resolved',
        renderCell: (r: PasswordResetRequest) =>
          r.resolved_at
            ? new Date(r.resolved_at).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              })
            : '—',
      },
      {
        id: 'actions',
        header: '',
        renderCell: (r: PasswordResetRequest) => {
          if (r.status !== 'pending') return null
          return (
            <span className="inline-flex items-center gap-1.5">
              <Button
                variant="outline"
                className="h-7 rounded-md px-2.5 text-xs border-grey-200 text-grey-600 hover:border-green-600 hover:text-green-700"
                onClick={() => { setActionTarget({ request: r, action: 'approve' }); setActionError(null) }}
              >
                <CheckCircle className="mr-1 h-3 w-3" />
                Approve
              </Button>
              <Button
                variant="outline"
                className="h-7 rounded-md px-2.5 text-xs border-grey-200 text-grey-600 hover:border-red-500 hover:text-red-600"
                onClick={() => { setActionTarget({ request: r, action: 'decline' }); setActionError(null) }}
              >
                <XCircle className="mr-1 h-3 w-3" />
                Decline
              </Button>
            </span>
          )
        },
      },
    ],
    [],
  )

  async function handleConfirm() {
    if (!actionTarget) return
    setActionSaving(true)
    setActionError(null)
    try {
      if (actionTarget.action === 'approve') {
        await approvePasswordResetRequest(actionTarget.request.id)
      } else {
        await declinePasswordResetRequest(actionTarget.request.id)
      }
      setActionTarget(null)
      fetchRequests()
    } catch (err: unknown) {
      setActionError(err instanceof Error ? err.message : 'Action failed')
    } finally {
      setActionSaving(false)
    }
  }

  const isApprove = actionTarget?.action === 'approve'

  return (
    <div className="space-y-4">
      <AdminPageHeader
        title="Password Reset Requests"
        subtitle="Review and action forgot-password requests from users"
        action={
          pendingCount > 0 ? (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-orange-100 px-3 py-1 text-xs font-medium text-orange-700">
              <Clock className="h-3.5 w-3.5" />
              {pendingCount} pending
            </span>
          ) : undefined
        }
      />

      {error && (
        <p className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>
      )}

      <Card className="border border-grey-200 shadow-none">
        <CardContent className="space-y-4 p-4">
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex-1 min-w-[200px]">
              <AdminFilterBar
                searchValue={searchQuery}
                onSearchChange={setSearchQuery}
                searchPlaceholder="Search by name or email..."
              />
            </div>
            <div className="flex items-center gap-1 rounded-md border border-grey-200 p-0.5">
              {STATUS_FILTER_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setStatusFilter(opt.value)}
                  className={`rounded px-3 py-1.5 text-xs transition-colors ${
                    statusFilter === opt.value
                      ? 'bg-cics-maroon text-white'
                      : 'text-grey-600 hover:bg-grey-100'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {loading ? (
            <p className="py-8 text-center text-xs text-grey-500">Loading requests…</p>
          ) : (
            <AdminDataTable
              columns={columns}
              rows={paged}
              rowKey={(r) => r.id}
              emptyMessage="No password reset requests found."
              minWidthClassName="min-w-[860px]"
            />
          )}

          <AdminPagination
            page={safePage}
            totalPages={totalPages}
            onPageChange={setPage}
            leftText={`Showing ${filtered.length} of ${requests.length} requests`}
          />
        </CardContent>
      </Card>

      {actionTarget ? (
        <AdminModal
          title={isApprove ? 'Approve Request' : 'Decline Request'}
          subtitle={
            isApprove
              ? `A password reset link will be emailed to ${actionTarget.request.email}.`
              : `${actionTarget.request.first_name} ${actionTarget.request.last_name} will be notified that their request was declined.`
          }
          onClose={() => { setActionTarget(null); setActionError(null) }}
          widthClassName="max-w-[440px]"
        >
          {actionError ? (
            <p className="mb-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700" role="alert">
              {actionError}
            </p>
          ) : null}
          <div className="flex items-center justify-end gap-2 border-t border-grey-200 pt-3">
            <Button
              variant="outline"
              className="h-10 px-6"
              onClick={() => { setActionTarget(null); setActionError(null) }}
              disabled={actionSaving}
            >
              Cancel
            </Button>
            <Button
              className={`h-10 px-6 ${isApprove ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}`}
              onClick={handleConfirm}
              disabled={actionSaving}
            >
              {actionSaving
                ? isApprove ? 'Approving…' : 'Declining…'
                : isApprove ? 'Approve' : 'Decline'}
            </Button>
          </div>
        </AdminModal>
      ) : null}
    </div>
  )
}
