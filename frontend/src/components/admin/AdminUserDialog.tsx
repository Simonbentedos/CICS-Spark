"use client"

import { useState } from 'react'
import { Button, Input, Label, Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui'
import AdminModal from '@/components/admin/AdminModal'
import { USER_ROLE_OPTIONS, USER_STATUS_OPTIONS } from '@/lib/utils'
import type { UserRecord, UserRole, UserStatus } from '@/types/admin'

type Mode = 'add' | 'edit'

type AdminUserDialogProps = {
  mode: Mode
  user?: UserRecord
  lockedRole?: 'admin' | 'student'
  onClose: () => void
  onSubmit: (payload: {
    id?: string
    name: string
    email: string
    role: string
    department?: string
    status: string
    password?: string
    confirmPassword?: string
    changePassword?: boolean
  }) => void
}

type EditModeFieldsProps = {
  status: UserStatus
  onStatusChange: (value: UserStatus) => void
  changePassword: boolean
  onChangePasswordToggle: (checked: boolean) => void
}

function EditModeFields({
  status,
  onStatusChange,
  changePassword,
  onChangePasswordToggle,
}: Readonly<EditModeFieldsProps>) {
  return (
    <>
      <div className="space-y-1">
        <Label className="text-sm text-navy">Status</Label>
        <Select value={status} onValueChange={(value) => onStatusChange(value as UserStatus)}>
          <SelectTrigger className="h-10 focus-visible:ring-2 focus-visible:ring-cics-maroon focus-visible:ring-offset-1" aria-label="User status">
            <SelectValue placeholder="Select status" />
          </SelectTrigger>
          <SelectContent>
            {USER_STATUS_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <label className="flex items-center gap-2 border-t border-grey-200 pt-3 text-sm text-navy">
        <input
          type="checkbox"
          checked={changePassword}
          onChange={(event) => onChangePasswordToggle(event.target.checked)}
          className="rounded border-grey-300 accent-cics-maroon focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cics-maroon focus-visible:ring-offset-1"
        />
        <span>Change password</span>
      </label>
    </>
  )
}

type PasswordFieldsProps = {
  isAdd: boolean
  password: string
  confirmPassword: string
  invalidPassword: boolean
  passwordMismatch: boolean
  onPasswordChange: (value: string) => void
  onConfirmPasswordChange: (value: string) => void
}

function PasswordFields({
  isAdd,
  password,
  confirmPassword,
  invalidPassword,
  passwordMismatch,
  onPasswordChange,
  onConfirmPasswordChange,
}: Readonly<PasswordFieldsProps>) {
  return (
    <div className="space-y-3 rounded-[10px] border border-grey-200 bg-grey-50 p-3">
      <div className="space-y-1">
        <Label className="text-sm text-navy">{isAdd ? 'Password *' : 'New Password'}</Label>
        <Input
          id="admin-user-password"
          type="password"
          value={password}
          onChange={(event) => onPasswordChange(event.target.value)}
          placeholder="Minimum 8 characters"
          className="h-10"
          aria-describedby={invalidPassword ? 'admin-user-password-error' : undefined}
        />
      </div>

      <div className="space-y-1">
        <Label htmlFor="admin-user-confirm-password" className="text-sm text-navy">Confirm Password</Label>
        <Input
          id="admin-user-confirm-password"
          type="password"
          value={confirmPassword}
          onChange={(event) => onConfirmPasswordChange(event.target.value)}
          placeholder="Confirm new password"
          className="h-10"
          aria-describedby={passwordMismatch ? 'admin-user-confirm-password-error' : undefined}
        />
      </div>

      {invalidPassword ? <p id="admin-user-password-error" className="text-xs text-red-500" role="alert">Password must be at least 8 characters long</p> : null}
      {passwordMismatch ? <p id="admin-user-confirm-password-error" className="text-xs text-red-500" role="alert">Passwords do not match</p> : null}
    </div>
  )
}

const DEPARTMENT_OPTIONS = [
  { value: 'CS', label: 'Computer Science (CS)' },
  { value: 'IT', label: 'Information Technology (IT)' },
  { value: 'IS', label: 'Information Systems (IS)' },
]

export default function AdminUserDialog({
  mode,
  user,
  lockedRole,
  onClose,
  onSubmit,
}: Readonly<AdminUserDialogProps>) {
  const [name, setName] = useState(user?.name ?? '')
  const [email, setEmail] = useState(user?.email ?? '')
  const [role, setRole] = useState(lockedRole ?? user?.role ?? 'Admin')
  const [department, setDepartment] = useState<string>('CS')
  const [status, setStatus] = useState(user?.status ?? 'Active')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [changePassword, setChangePassword] = useState(false)

  const isAdd = mode === 'add'
  const isEdit = mode === 'edit'
  const roleLabel = lockedRole === 'student' ? 'Student' : lockedRole === 'admin' ? 'Admin' : undefined
  const title = isAdd
    ? lockedRole === 'student' ? 'Add New Student' : lockedRole === 'admin' ? 'Add New Admin' : 'Add New User'
    : 'Edit Admin User'
  const subtitle = isAdd
    ? 'Create a new account for the SPARK repository system.'
    : 'Update user information and permissions.'

  const mustShowPasswordFields = isAdd || changePassword

  const invalidPassword = mustShowPasswordFields && password.length > 0 && password.length < 8
  const passwordMismatch = mustShowPasswordFields && confirmPassword.length > 0 && password !== confirmPassword

  const disableSubmit =
    !name.trim() ||
    !email.trim() ||
    !role ||
    (mustShowPasswordFields && password.length < 8) ||
    (mustShowPasswordFields && password !== confirmPassword)

  function handleSubmit() {
    onSubmit({
      id: user?.id,
      name: name.trim(),
      email: email.trim(),
      role,
      department: isAdd ? department : undefined,
      status,
      password: mustShowPasswordFields ? password : undefined,
      confirmPassword: mustShowPasswordFields ? confirmPassword : undefined,
      changePassword,
    })
  }

  return (
    <AdminModal title={title} subtitle={subtitle} onClose={onClose} widthClassName="max-w-[560px]">
      <div className="space-y-3">
        <div className="space-y-1">
          <Label htmlFor="admin-user-name" className="text-sm text-navy">{isAdd ? 'Full Name *' : 'Name'}</Label>
          <Input id="admin-user-name" value={name} onChange={(event) => setName(event.target.value)} placeholder="Enter full name" className="h-10" />
        </div>

        <div className="space-y-1">
          <Label htmlFor="admin-user-email" className="text-sm text-navy">{isAdd ? 'Email Address *' : 'Email'}</Label>
          <Input id="admin-user-email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="user@ust.edu.ph" className="h-10" />
        </div>

        <div className="space-y-1">
          <Label className="text-sm text-navy">Role</Label>
          {lockedRole ? (
            <div className="h-10 flex items-center rounded-md border border-grey-200 bg-grey-50 px-3 text-sm text-grey-700 select-none">
              {roleLabel}
            </div>
          ) : (
            <Select value={role} onValueChange={(value) => setRole(value as UserRole)}>
              <SelectTrigger className="h-10 focus-visible:ring-2 focus-visible:ring-cics-maroon focus-visible:ring-offset-1" aria-label="User role">
                <SelectValue placeholder="Select role" />
              </SelectTrigger>
              <SelectContent>
                {USER_ROLE_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>

        {isAdd ? (
          <div className="space-y-1">
            <Label className="text-sm text-navy">Department *</Label>
            <Select value={department} onValueChange={setDepartment}>
              <SelectTrigger className="h-10 focus-visible:ring-2 focus-visible:ring-cics-maroon focus-visible:ring-offset-1" aria-label="Department">
                <SelectValue placeholder="Select department" />
              </SelectTrigger>
              <SelectContent>
                {DEPARTMENT_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        ) : null}

        {isEdit ? (
          <EditModeFields
            status={status}
            onStatusChange={setStatus}
            changePassword={changePassword}
            onChangePasswordToggle={setChangePassword}
          />
        ) : null}

        {mustShowPasswordFields ? (
          <PasswordFields
            isAdd={isAdd}
            password={password}
            confirmPassword={confirmPassword}
            invalidPassword={invalidPassword}
            passwordMismatch={passwordMismatch}
            onPasswordChange={setPassword}
            onConfirmPasswordChange={setConfirmPassword}
          />
        ) : null}
      </div>

      <div className="mt-4 flex items-center justify-end gap-2 border-t border-grey-200 pt-3">
        <Button variant="outline" className="h-10 px-6" onClick={onClose}>Cancel</Button>
        <Button
          className="h-10 px-6"
          disabled={disableSubmit}
          onClick={handleSubmit}
        >
          {isAdd ? 'Add User' : 'Save Changes'}
        </Button>
      </div>
    </AdminModal>
  )
}
