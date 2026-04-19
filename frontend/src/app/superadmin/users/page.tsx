"use client"

import { useEffect, useMemo, useState } from 'react'
import { Mail, Plus } from 'lucide-react'
import { Button, Card, CardContent } from '@/components/ui'
import AdminBadge from '@/components/admin/AdminBadge'
import AdminDataTable from '@/components/admin/AdminDataTable'
import AdminFilterBar from '@/components/admin/AdminFilterBar'
import AdminPagination from '@/components/admin/AdminPagination'
import AdminPageHeader from '@/components/admin/AdminPageHeader'
import AdminUserDialog from '@/components/admin/AdminUserDialog'
import { getAdminUsers, createAdmin, createStudent, type ApiUser } from '@/lib/api/users'

const PAGE_SIZE = 10

const ROLE_TONE: Record<string, 'blue' | 'orange' | 'violet' | 'default'> = {
  super_admin: 'violet',
  admin: 'blue',
  student: 'orange',
}

type DialogMode = 'add-admin' | 'add-student' | null

export default function SuperAdminUsersPage() {
  const [users, setUsers] = useState<ApiUser[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [page, setPage] = useState(1)
  const [dialogMode, setDialogMode] = useState<DialogMode>(null)
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)

  function fetchUsers() {
    setLoading(true)
    getAdminUsers()
      .then(setUsers)
      .catch((err) => setError(err.message ?? 'Failed to load users'))
      .finally(() => setLoading(false))
  }

  useEffect(() => { fetchUsers() }, [])
  useEffect(() => { setPage(1) }, [searchQuery])

  const filtered = useMemo(() => {
    const q = searchQuery.trim().toLowerCase()
    return users.filter(
      (u) =>
        !q ||
        `${u.first_name} ${u.last_name}`.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        u.role.toLowerCase().includes(q),
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
        renderCell: (u: ApiUser) => {
          const roleLabel = u.role.replace('_', ' ')
          const capitalizedRole = roleLabel.charAt(0).toUpperCase() + roleLabel.slice(1)
          return <AdminBadge label={capitalizedRole} tone={ROLE_TONE[u.role] ?? 'default'} />
        },
      },
      {
        id: 'department',
        header: 'Dept',
        renderCell: (u: ApiUser) => u.department ?? 'All',
      },
      {
        id: 'status',
        header: 'Status',
        renderCell: (u: ApiUser) => (
          <AdminBadge label={u.is_active ? 'Active' : 'Inactive'} tone={u.is_active ? 'green' : 'default'} />
        ),
      },
      {
        id: 'dateAdded',
        header: 'Date Added',
        renderCell: (u: ApiUser) =>
          new Date(u.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      },
    ],
    [],
  )

  async function handleAdd(payload: { name: string; email: string; role: string; department?: string; status?: string; password?: string }) {
    setSaving(true)
    setSaveError(null)
    const nameParts = payload.name.trim().split(' ')
    const first_name = nameParts[0] ?? ''
    const last_name = nameParts.slice(1).join(' ') || first_name
    const department = (payload.department ?? 'CS') as 'CS' | 'IT' | 'IS'

    try {
      if (dialogMode === 'add-admin') {
        await createAdmin({ email: payload.email, first_name, last_name, department, password: payload.password })
      } else {
        await createStudent({ email: payload.email, first_name, last_name, department, password: payload.password })
      }
      setDialogMode(null)
      fetchUsers()
    } catch (err: unknown) {
      setSaveError(err instanceof Error ? err.message : 'Failed to create account')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-4">
      <AdminPageHeader
        title="User Management"
        subtitle="All users across all departments"
        action={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              className="h-9 rounded-md px-4 text-xs border-cics-maroon text-cics-maroon hover:bg-cics-maroon hover:text-white"
              onClick={() => setDialogMode('add-student')}
            >
              <Plus className="mr-1 h-4 w-4" />
              Add Student
            </Button>
            <Button className="h-9 rounded-md px-4 text-xs" onClick={() => setDialogMode('add-admin')}>
              <Plus className="mr-1 h-4 w-4" />
              Add Admin
            </Button>
          </div>
        }
      />

      {error && (
        <p className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>
      )}

      <Card className="border border-grey-200 shadow-none">
        <CardContent className="space-y-4 p-4">
          <AdminFilterBar
            searchValue={searchQuery}
            onSearchChange={setSearchQuery}
            searchPlaceholder="Search by name, email, or role..."
          />

          {loading ? (
            <p className="py-8 text-center text-xs text-grey-500">Loading users…</p>
          ) : (
            <AdminDataTable
              columns={columns}
              rows={paged}
              rowKey={(u) => u.id}
              emptyMessage="No users match your search."
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
                Admins: {users.filter((u) => u.role === 'admin' || u.role === 'super_admin').length} ·
                Students: {users.filter((u) => u.role === 'student').length}
              </p>
            }
          />
        </CardContent>
      </Card>

      {dialogMode ? (
        <AdminUserDialog
          mode="add"
          lockedRole={dialogMode === 'add-admin' ? 'admin' : 'student'}
          onClose={() => { setDialogMode(null); setSaveError(null) }}
          onSubmit={handleAdd}
        />
      ) : null}

      {saveError && (
        <p className="fixed bottom-4 right-4 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 shadow-md">
          {saveError}
        </p>
      )}
    </div>
  )
}
