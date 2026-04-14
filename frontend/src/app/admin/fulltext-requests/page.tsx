"use client"

import { useEffect, useMemo, useState } from 'react'
import { CalendarDays, CheckCircle2, XCircle } from 'lucide-react'
import { Card, CardContent } from '@/components/ui'
import AdminBadge from '@/components/admin/AdminBadge'
import AdminDataTable from '@/components/admin/AdminDataTable'
import AdminFilterBar from '@/components/admin/AdminFilterBar'
import AdminPagination from '@/components/admin/AdminPagination'
import AdminPageHeader from '@/components/admin/AdminPageHeader'
import {
  getFulltextRequests,
  updateFulltextRequest,
  type FulltextRequest,
} from '@/lib/api/documents'

const PAGE_SIZE = 10

const STATUS_TONE: Record<string, 'default' | 'green' | 'red' | 'orange'> = {
  pending: 'orange',
  fulfilled: 'green',
  denied: 'red',
}

export default function FulltextRequestsPage() {
  const [requests, setRequests] = useState<FulltextRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [page, setPage] = useState(1)
  const [updating, setUpdating] = useState<string | null>(null)

  function fetchRequests() {
    setLoading(true)
    getFulltextRequests()
      .then(setRequests)
      .catch((err) => setError(err.message ?? 'Failed to load requests'))
      .finally(() => setLoading(false))
  }

  useEffect(() => { fetchRequests() }, [])
  useEffect(() => { setPage(1) }, [searchQuery])

  async function handleUpdate(id: string, status: 'fulfilled' | 'denied') {
    setUpdating(id)
    try {
      await updateFulltextRequest(id, status)
      fetchRequests()
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Update failed')
    } finally {
      setUpdating(null)
    }
  }

  const filtered = useMemo(() => {
    const q = searchQuery.trim().toLowerCase()
    return requests.filter(
      (r) =>
        !q ||
        r.requester_name.toLowerCase().includes(q) ||
        r.requester_email.toLowerCase().includes(q),
    )
  }, [searchQuery, requests])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const safePage = Math.min(page, totalPages)
  const paged = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE)

  const columns = useMemo(
    () => [
      {
        id: 'requester',
        header: 'Requester',
        renderCell: (r: FulltextRequest) => (
          <div>
            <p className="font-medium text-grey-700">{r.requester_name}</p>
            <p className="text-grey-400">{r.requester_email}</p>
          </div>
        ),
      },
      {
        id: 'document',
        header: 'Document ID',
        renderCell: (r: FulltextRequest) => (
          <span className="font-mono text-[11px] text-grey-500">{r.document_id.slice(0, 8)}…</span>
        ),
      },
      {
        id: 'department',
        header: 'Dept',
        renderCell: (r: FulltextRequest) => r.department ?? '—',
      },
      {
        id: 'purpose',
        header: 'Purpose',
        className: 'max-w-[240px]',
        renderCell: (r: FulltextRequest) => (
          <span className="line-clamp-2 text-grey-600">{r.purpose ?? '—'}</span>
        ),
      },
      {
        id: 'date',
        header: 'Submitted',
        renderCell: (r: FulltextRequest) => (
          <span className="inline-flex items-center gap-1">
            <CalendarDays className="h-3.5 w-3.5 text-grey-400" />
            {new Date(r.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
          </span>
        ),
      },
      {
        id: 'status',
        header: 'Status',
        renderCell: (r: FulltextRequest) => (
          <AdminBadge label={r.status} tone={STATUS_TONE[r.status] ?? 'default'} />
        ),
      },
      {
        id: 'actions',
        header: 'Actions',
        renderCell: (r: FulltextRequest) =>
          r.status !== 'pending' ? (
            <span className="text-grey-400 text-xs">Processed</span>
          ) : (
            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={updating === r.id}
                onClick={() => handleUpdate(r.id, 'fulfilled')}
                className="inline-flex items-center gap-1 text-xs text-green-700 hover:text-green-900 disabled:opacity-50"
              >
                <CheckCircle2 className="h-3.5 w-3.5" />
                Fulfill
              </button>
              <button
                type="button"
                disabled={updating === r.id}
                onClick={() => handleUpdate(r.id, 'denied')}
                className="inline-flex items-center gap-1 text-xs text-red-600 hover:text-red-800 disabled:opacity-50"
              >
                <XCircle className="h-3.5 w-3.5" />
                Deny
              </button>
            </div>
          ),
      },
    ],
    [updating],
  )

  return (
    <div className="space-y-4">
      <AdminPageHeader
        title="Full-Text Requests"
        subtitle="Manage guest and student requests for full-text document access"
      />

      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Pending', value: requests.filter((r) => r.status === 'pending').length, cls: 'text-orange-600' },
          { label: 'Fulfilled', value: requests.filter((r) => r.status === 'fulfilled').length, cls: 'text-green-600' },
          { label: 'Denied', value: requests.filter((r) => r.status === 'denied').length, cls: 'text-red-600' },
        ].map((card) => (
          <Card key={card.label} className="border border-grey-200 shadow-none">
            <CardContent className="p-4">
              <p className={`text-[28px] font-semibold leading-none ${card.cls}`}>{loading ? '—' : card.value}</p>
              <p className="mt-1 text-xs text-grey-500">{card.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {error && (
        <p className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>
      )}

      <Card className="border border-grey-200 shadow-none">
        <CardContent className="space-y-4 p-4">
          <AdminFilterBar
            searchValue={searchQuery}
            onSearchChange={setSearchQuery}
            searchPlaceholder="Search by requester name or email..."
          />

          {loading ? (
            <p className="py-8 text-center text-xs text-grey-500">Loading requests…</p>
          ) : (
            <AdminDataTable
              columns={columns}
              rows={paged}
              rowKey={(r) => r.id}
              emptyMessage="No full-text requests match your search."
              minWidthClassName="min-w-[900px]"
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
    </div>
  )
}
