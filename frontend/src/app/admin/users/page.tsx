"use client"

import { useEffect, useMemo, useState } from 'react'
import { Mail, Pencil, Plus, Trash2 } from 'lucide-react'
import {
  Button,
  Card,
  CardContent,
} from '@/components/ui'
import AdminBadge from '@/components/admin/AdminBadge'
import AdminDataTable from '@/components/admin/AdminDataTable'
import AdminFilterBar from '@/components/admin/AdminFilterBar'
import AdminPagination from '@/components/admin/AdminPagination'
import AdminPageHeader from '@/components/admin/AdminPageHeader'
import AdminUserDialog from '@/components/admin/AdminUserDialog'
import { adminRepository } from '@/lib/admin/admin-repository'
import {
  getUserRoleTone,
  getUserStatusTone,
} from '@/lib/utils'
import type { UserRecord } from '@/types/admin'

const PAGE_SIZE = 8

export default function AdminUsersPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [users, setUsers] = useState<UserRecord[]>([])
  const [page, setPage] = useState(1)
  const [dialogState, setDialogState] = useState<{ mode: 'add' | 'edit'; user?: UserRecord } | null>(null)

  useEffect(() => {
    setUsers(adminRepository.listUsers())
  }, [])

  const filteredUsers = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase()

    return users.filter((user) => {
      const matchesQuery =
        !normalizedQuery ||
        user.name.toLowerCase().includes(normalizedQuery) ||
        user.email.toLowerCase().includes(normalizedQuery)

      return matchesQuery
    })
  }, [searchQuery, users])

  useEffect(() => {
    setPage(1)
  }, [searchQuery])

  const totalPages = Math.max(1, Math.ceil(filteredUsers.length / PAGE_SIZE))
  const safePage = Math.min(page, totalPages)
  const pagedUsers = filteredUsers.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE)

  const columns = useMemo(
    () => [
      {
        id: 'name',
        header: 'Name',
        renderCell: (user: UserRecord) => (
          <span className="inline-flex items-center gap-2">
            <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-cics-maroon text-[10px] text-white">
              {user.name.split(' ').map((part) => part[0]).join('').slice(0, 2)}
            </span>
            <span>{user.name}</span>
          </span>
        ),
      },
      {
        id: 'email',
        header: 'Email',
        renderCell: (user: UserRecord) => (
          <span className="inline-flex items-center gap-1 text-grey-600">
            <Mail className="h-3.5 w-3.5 text-grey-400" />
            {user.email}
          </span>
        ),
      },
      {
        id: 'role',
        header: 'Role',
        renderCell: (user: UserRecord) => <AdminBadge label={user.role} tone={getUserRoleTone(user.role)} />,
      },
      {
        id: 'status',
        header: 'Status',
        renderCell: (user: UserRecord) => <AdminBadge label={user.status} tone={getUserStatusTone(user.status)} />,
      },
      {
        id: 'dateAdded',
        header: 'Date Added',
        renderCell: (user: UserRecord) => user.dateAdded ?? '—',
      },
      {
        id: 'actions',
        header: 'Actions',
        renderCell: (user: UserRecord) => (
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setDialogState({ mode: 'edit', user })}
              className="text-grey-500 hover:text-cics-maroon"
            >
              <Pencil className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              onClick={() => {
                adminRepository.deleteUser(user.id)
                setUsers(adminRepository.listUsers())
              }}
              className="text-grey-500 hover:text-red-600"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
        ),
      },
    ],
    []
  )

  const activeUsers = users.filter((user) => user.status === 'Active').length
  const inactiveUsers = users.filter((user) => user.status === 'Inactive').length

  return (
    <div className="space-y-4">
      <AdminPageHeader
        title="User Management"
        subtitle="Manage admin users and their permissions"
        action={
          <Button className="h-9 rounded-md px-4 text-xs" onClick={() => setDialogState({ mode: 'add' })}>
            <Plus className="mr-1 h-4 w-4" />
            Add User
          </Button>
        }
      />

      <Card className="border border-grey-200 shadow-none">
        <CardContent className="space-y-4 p-4">
          <AdminFilterBar
            searchValue={searchQuery}
            onSearchChange={setSearchQuery}
            searchPlaceholder="Search users by name or email..."
          />

          <AdminDataTable
            columns={columns}
            rows={pagedUsers}
            rowKey={(user) => user.id}
            emptyMessage="No users match your search."
            minWidthClassName="min-w-[980px]"
          />

          <AdminPagination
            page={safePage}
            totalPages={totalPages}
            onPageChange={setPage}
            leftText={`Showing ${filteredUsers.length} of ${users.length} users`}
            rightContent={<p className="text-xs text-grey-500">Active: {activeUsers} · Inactive: {inactiveUsers}</p>}
          />
        </CardContent>
      </Card>

      {dialogState ? (
        <AdminUserDialog
          mode={dialogState.mode}
          user={dialogState.user}
          onClose={() => setDialogState(null)}
          onSubmit={(payload) => {
            if (dialogState.mode === 'add') {
              const newUser: UserRecord = {
                id: `usr-${Date.now()}`,
                name: payload.name,
                email: payload.email,
                role: payload.role as UserRecord['role'],
                department: 'Repository Office',
                status: 'Active',
                lastLogin: 'Never',
                dateAdded: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
              }
              adminRepository.createUser(newUser)
            } else if (dialogState.user) {
              adminRepository.updateUser(dialogState.user.id, {
                name: payload.name,
                email: payload.email,
                role: payload.role as UserRecord['role'],
                status: payload.status as UserRecord['status'],
              })
            }
            setUsers(adminRepository.listUsers())
            setDialogState(null)
          }}
        />
      ) : null}
    </div>
  )
}
