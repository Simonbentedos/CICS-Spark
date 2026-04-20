"use client"

import { useState } from 'react'
import { Button, Input, Label, Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui'
import AdminModal from '@/components/admin/AdminModal'
import type { ApiUser } from '@/lib/api/users'

const DEPARTMENT_OPTIONS = [
  { value: 'IS', label: 'Information Systems (IS)' },
  { value: 'CS', label: 'Computer Science (CS)' },
  { value: 'IT', label: 'Information Technology (IT)' },
]

type EditUserDialogProps = {
  user: ApiUser
  onClose: () => void
  onSubmit: (payload: { first_name: string; last_name: string; department: 'CS' | 'IT' | 'IS' }) => void
  saving?: boolean
  error?: string | null
}

export default function EditUserDialog({
  user,
  onClose,
  onSubmit,
  saving = false,
  error = null,
}: Readonly<EditUserDialogProps>) {
  const [firstName, setFirstName] = useState(user.first_name)
  const [lastName, setLastName] = useState(user.last_name)
  const [department, setDepartment] = useState<'CS' | 'IT' | 'IS'>(user.department ?? 'IS')

  const disableSubmit = saving || !firstName.trim() || !lastName.trim()

  function handleSubmit() {
    onSubmit({ first_name: firstName.trim(), last_name: lastName.trim(), department })
  }

  return (
    <AdminModal title="Edit User" subtitle="Update the user's name and department." onClose={onClose} widthClassName="max-w-[480px]">
      <div className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <Label htmlFor="edit-user-first-name" className="text-sm text-navy">First Name</Label>
            <Input
              id="edit-user-first-name"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              placeholder="First name"
              className="h-10"
              disabled={saving}
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="edit-user-last-name" className="text-sm text-navy">Last Name</Label>
            <Input
              id="edit-user-last-name"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              placeholder="Last name"
              className="h-10"
              disabled={saving}
            />
          </div>
        </div>

        <div className="space-y-1">
          <Label className="text-sm text-navy">Department</Label>
          <Select value={department} onValueChange={(v) => setDepartment(v as 'CS' | 'IT' | 'IS')} disabled={saving}>
            <SelectTrigger className="h-10 focus-visible:ring-2 focus-visible:ring-cics-maroon focus-visible:ring-offset-1" aria-label="Department">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {DEPARTMENT_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1">
          <Label className="text-sm text-navy">Email</Label>
          <div className="flex h-10 items-center rounded-md border border-grey-200 bg-grey-50 px-3 text-sm text-grey-500 select-none">
            {user.email}
          </div>
        </div>

        <div className="space-y-1">
          <Label className="text-sm text-navy">Role</Label>
          <div className="flex h-10 items-center rounded-md border border-grey-200 bg-grey-50 px-3 text-sm text-grey-500 select-none capitalize">
            {user.role.replace('_', ' ')}
          </div>
        </div>

        {error ? (
          <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700" role="alert">
            {error}
          </p>
        ) : null}
      </div>

      <div className="mt-4 flex items-center justify-end gap-2 border-t border-grey-200 pt-3">
        <Button variant="outline" className="h-10 px-6" onClick={onClose} disabled={saving}>
          Cancel
        </Button>
        <Button className="h-10 px-6" disabled={disableSubmit} onClick={handleSubmit}>
          {saving ? 'Saving…' : 'Save Changes'}
        </Button>
      </div>
    </AdminModal>
  )
}
