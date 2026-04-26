"use client"

import { useEffect, useMemo, useState } from 'react'
import { Ban, CircleCheck, Mail, Pencil, Plus } from 'lucide-react'
import { Button, Card, CardContent } from '@/components/ui'
import AdminBadge from '@/components/admin/AdminBadge'
import AdminDataTable from '@/components/admin/AdminDataTable'
import AdminFilterBar from '@/components/admin/AdminFilterBar'
import AdminPagination from '@/components/admin/AdminPagination'
import AdminPageHeader from '@/components/admin/AdminPageHeader'
import AdminModal from '@/components/admin/AdminModal'
import AdminUserDialog from '@/components/admin/AdminUserDialog'
import EditUserDialog from '@/components/admin/EditUserDialog'
import { getAdminUsers, createAdmin, createStudent, updateUser, disableUser, enableUser, type ApiUser } from '@/lib/api/users'

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
  const [saveError, setSaveError] = useState<string | null>(null)
  const [editingUser, setEditingUser] = useState<ApiUser | null>(null)
  const [editSaving, setEditSaving] = useState(false)
  const [editError, setEditError] = useState<string | null>(null)
  const [disableTarget, setDisableTarget] = useState<ApiUser | null>(null)
  const [disableSaving, setDisableSaving] = useState(false)
  const [disableError, setDisableError] = useState<string | null>(null)
  const [enableTarget, setEnableTarget] = useState<ApiUser | null>(null)
  const [enableSaving, setEnableSaving] = useState(false)
  const [enableError, setEnableError] = useState<string | null>(null)

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
      {
        id: 'actions',
        header: '',
        renderCell: (u: ApiUser) => (
          <span className="inline-flex items-center gap-1.5">
            <Button
              variant="outline"
              className="h-7 rounded-md px-2.5 text-xs border-grey-200 text-grey-600 hover:border-cics-maroon hover:bg-cics-maroon/10 hover:text-cics-maroon"
              onClick={() => { setEditingUser(u); setEditError(null) }}
            >
              <Pencil className="mr-1 h-3 w-3" />
              Edit
            </Button>
            {u.is_active ? (
              <Button
                variant="outline"
                className="h-7 rounded-md px-2.5 text-xs border-grey-200 text-grey-600 hover:border-red-500 hover:bg-red-50 hover:text-red-600"
                onClick={() => { setDisableTarget(u); setDisableError(null) }}
              >
                <Ban className="mr-1 h-3 w-3" />
                Disable
              </Button>
            ) : (
              <Button
                variant="outline"
                className="h-7 rounded-md px-2.5 text-xs border-grey-200 text-grey-600 hover:border-green-600 hover:bg-green-50 hover:text-green-700"
                onClick={() => { setEnableTarget(u); setEnableError(null) }}
              >
                <CircleCheck className="mr-1 h-3 w-3" />
                Enable
              </Button>
            )}
          </span>
        ),
      },
    ],
    [],
  )

  async function handleDisable() {
    if (!disableTarget) return
    setDisableSaving(true)
    setDisableError(null)
    try {
      await disableUser(disableTarget.id)
      setDisableTarget(null)
      fetchUsers()
    } catch (err: unknown) {
      setDisableError(err instanceof Error ? err.message : 'Failed to disable account')
    } finally {
      setDisableSaving(false)
    }
  }

  async function handleEnable() {
    if (!enableTarget) return
    setEnableSaving(true)
    setEnableError(null)
    try {
      await enableUser(enableTarget.id)
      setEnableTarget(null)
      fetchUsers()
    } catch (err: unknown) {
      setEnableError(err instanceof Error ? err.message : 'Failed to enable account')
    } finally {
      setEnableSaving(false)
    }
  }

  async function handleEdit(payload: { first_name: string; last_name: string; department: 'CS' | 'IT' | 'IS' }) {
    if (!editingUser) return
    setEditSaving(true)
    setEditError(null)
    try {
      await updateUser(editingUser.id, payload)
      setEditingUser(null)
      fetchUsers()
    } catch (err: unknown) {
      setEditError(err instanceof Error ? err.message : 'Failed to update user')
    } finally {
      setEditSaving(false)
    }
  }

  async function handleAdd(payload: { name: string; email: string; role: string; department?: string; status?: string; password?: string }) {
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

      {editingUser ? (
        <EditUserDialog
          user={editingUser}
          onClose={() => { setEditingUser(null); setEditError(null) }}
          onSubmit={handleEdit}
          saving={editSaving}
          error={editError}
        />
      ) : null}

      {disableTarget ? (
        <AdminModal
          title="Disable Account"
          subtitle={`${disableTarget.first_name} ${disableTarget.last_name} will no longer be able to log in.`}
          onClose={() => { setDisableTarget(null); setDisableError(null) }}
          widthClassName="max-w-[420px]"
        >
          {disableError ? (
            <p className="mb-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700" role="alert">
              {disableError}
            </p>
          ) : null}
          <div className="flex items-center justify-end gap-2 border-t border-grey-200 pt-3">
            <Button variant="outline" className="h-10 px-6" onClick={() => { setDisableTarget(null); setDisableError(null) }} disabled={disableSaving}>
              Cancel
            </Button>
            <Button className="h-10 px-6 bg-red-600 hover:bg-red-700" onClick={handleDisable} disabled={disableSaving}>
              {disableSaving ? 'Disabling…' : 'Disable Account'}
            </Button>
          </div>
        </AdminModal>
      ) : null}

      {enableTarget ? (
        <AdminModal
          title="Enable Account"
          subtitle={`${enableTarget.first_name} ${enableTarget.last_name} will be able to log in again.`}
          onClose={() => { setEnableTarget(null); setEnableError(null) }}
          widthClassName="max-w-[420px]"
        >
          {enableError ? (
            <p className="mb-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700" role="alert">
              {enableError}
            </p>
          ) : null}
          <div className="flex items-center justify-end gap-2 border-t border-grey-200 pt-3">
            <Button variant="outline" className="h-10 px-6" onClick={() => { setEnableTarget(null); setEnableError(null) }} disabled={enableSaving}>
              Cancel
            </Button>
            <Button className="h-10 px-6 bg-green-600 hover:bg-green-700" onClick={handleEnable} disabled={enableSaving}>
              {enableSaving ? 'Enabling…' : 'Enable Account'}
            </Button>
          </div>
        </AdminModal>
      ) : null}

      {saveError && (
        <p className="fixed bottom-4 right-4 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 shadow-md">
          {saveError}
        </p>
      )}
    </div>
  )
}
