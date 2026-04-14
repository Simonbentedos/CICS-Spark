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
  return apiRequest('/api/admin/students', {
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
