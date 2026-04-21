import { apiRequest } from './client'

export type Permission = 
  | 'submissions.view'
  | 'submissions.review'
  | 'submissions.delete'
  | 'users.view'
  | 'users.create'
  | 'reports.view'
  | 'reports.export'
  | 'fulltext.manage'

export type AdminPermissions = {
  userId: string
  permissions: Permission[]
}

/**
 * GET /api/permissions/me
 * Get current user's permissions
 */
export async function getMyPermissions(): Promise<Permission[]> {
  const response = await apiRequest<{ permissions: Permission[] }>('/api/permissions/me')
  return response.permissions
}

/**
 * GET /api/permissions/department/:department
 * Get all admin permissions for a department (Super Admin only)
 */
export async function getDepartmentPermissions(department: string): Promise<AdminPermissions[]> {
  const response = await apiRequest<{ adminPermissions: AdminPermissions[] }>(
    `/api/permissions/department/${department}`
  )
  return response.adminPermissions
}

/**
 * PUT /api/permissions/department/:department
 * Update admin permissions for a department (Super Admin only)
 */
export async function updateDepartmentPermissions(
  department: string,
  adminPermissions: AdminPermissions[]
): Promise<void> {
  await apiRequest(`/api/permissions/department/${department}`, {
    method: 'PUT',
    body: { adminPermissions },
  })
}
