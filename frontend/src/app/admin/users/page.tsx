"use client"

import { useEffect, useMemo, useState } from 'react'
import { Mail } from 'lucide-react'
import { Card, CardContent } from '@/components/ui'
import AdminBadge from '@/components/admin/AdminBadge'
import AdminDataTable from '@/components/admin/AdminDataTable'
import AdminFilterBar from '@/components/admin/AdminFilterBar'
import AdminPagination from '@/components/admin/AdminPagination'
import AdminPageHeader from '@/components/admin/AdminPageHeader'
import { getAdminUsers, type ApiUser } from '@/lib/api/users'

const PAGE_SIZE = 8

const ROLE_TONE: Record<string, 'blue' | 'orange' | 'violet' | 'default'> = {
  super_admin: 'violet',
  admin: 'blue',
  student: 'orange',
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<ApiUser[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [page, setPage] = useState(1)

  useEffect(() => {
    setLoading(true)
    getAdminUsers()
      .then(setUsers)
      .catch((err) => setError(err.message ?? 'Failed to load users'))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => { setPage(1) }, [searchQuery])

  const filtered = useMemo(() => {
    const q = searchQuery.trim().toLowerCase()
    return users.filter(
      (u) =>
        !q ||
        `${u.first_name} ${u.last_name}`.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q),
    )
  }, [searchQuery, users])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const safePage = Math.min(page, totalPages)
  const paged = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE)

  const columns = useMemo(
    () => [
      {
        id: 'name',
        header: 'Name',
        renderCell: (u: ApiUser) => (
          <span className="inline-flex items-center gap-2">
            <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-cics-maroon text-[10px] text-white">
              {`${u.first_name[0] ?? ''}${u.last_name[0] ?? ''}`}
            </span>
            {u.first_name} {u.last_name}
          </span>
        ),
      },
      {
        id: 'email',
        header: 'Email',
        renderCell: (u: ApiUser) => (
          <span className="inline-flex items-center gap-1 text-grey-600">
            <Mail className="h-3.5 w-3.5 text-grey-400" />
            {u.email}
          </span>
        ),
      },
      {
        id: 'role',
        header: 'Role',
        renderCell: (u: ApiUser) => (
          <AdminBadge
            label={u.role.replace('_', ' ')}
            tone={ROLE_TONE[u.role] ?? 'default'}
          />
        ),
      },
      {
        id: 'department',
        header: 'Dept',
        renderCell: (u: ApiUser) => u.department ?? '—',
      },
      {
        id: 'status',
        header: 'Status',
        renderCell: (u: ApiUser) => (
          <AdminBadge
            label={u.is_active ? 'Active' : 'Inactive'}
            tone={u.is_active ? 'green' : 'default'}
          />
        ),
      },
      {
        id: 'dateAdded',
        header: 'Date Added',
        renderCell: (u: ApiUser) =>
          new Date(u.created_at).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
          }),
      },
    ],
    [],
  )

  return (
    <div className="space-y-4">
      <AdminPageHeader
        title="Users"
        subtitle="View student accounts in your department"
      />

      {error && (
        <p className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>
      )}

      <Card className="border border-grey-200 shadow-none">
        <CardContent className="space-y-4 p-4">
          <AdminFilterBar
            searchValue={searchQuery}
            onSearchChange={setSearchQuery}
            searchPlaceholder="Search users by name or email..."
          />

          {loading ? (
            <p className="py-8 text-center text-xs text-grey-500">Loading users…</p>
          ) : (
            <AdminDataTable
              columns={columns}
              rows={paged}
              rowKey={(u) => u.id}
              emptyMessage="No users found in your department."
              minWidthClassName="min-w-[980px]"
            />
          )}

          <AdminPagination
            page={safePage}
            totalPages={totalPages}
            onPageChange={setPage}
            leftText={`Showing ${filtered.length} of ${users.length} users`}
            rightContent={
              <p className="text-xs text-grey-500">
                Active: {users.filter((u) => u.is_active).length} · Inactive: {users.filter((u) => !u.is_active).length}
              </p>
            }
          />
        </CardContent>
      </Card>
    </div>
  )
}
