import { apiRequest } from './client'

export type ApiUser = {
  id: string
  email: string
  first_name: string
  last_name: string
  role: 'student' | 'admin' | 'super_admin'
  department: 'CS' | 'IT' | 'IS' | null
  is_active: boolean
  created_at: string
}

export async function getAdminUsers(): Promise<ApiUser[]> {
  return apiRequest<ApiUser[]>('/api/admin/users')
}

export async function createStudent(payload: {
  email: string
  first_name: string
  last_name: string
  department: 'CS' | 'IT' | 'IS'
  password?: string
}): Promise<{ message: string; student: ApiUser }> {
  return apiRequest('/api/superadmin/students', {
    method: 'POST',
    body: payload,
  })
}

export async function createAdmin(payload: {
  email: string
  first_name: string
  last_name: string
  department: 'CS' | 'IT' | 'IS'
  password?: string
}): Promise<{ message: string; admin: ApiUser }> {
  return apiRequest('/api/superadmin/admins', {
    method: 'POST',
    body: payload,
  })
}

export async function disableUser(id: string): Promise<{ message: string }> {
  return apiRequest(`/api/superadmin/users/${id}/disable`, { method: 'PATCH' })
}

export async function enableUser(id: string): Promise<{ message: string }> {
  return apiRequest(`/api/superadmin/users/${id}/enable`, { method: 'PATCH' })
}

export async function updateUser(
  id: string,
  payload: { first_name: string; last_name: string; department: 'CS' | 'IT' | 'IS' },
): Promise<{ message: string; user: ApiUser }> {
  return apiRequest(`/api/superadmin/users/${id}`, {
    method: 'PUT',
    body: payload,
  })
}
