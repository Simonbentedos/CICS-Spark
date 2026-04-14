import { apiRequest } from './client'
import { setAdminSession, clearAdminSession } from '@/lib/admin/session'
import { setStudentSession, clearStudentSession } from '@/lib/student/session'

export type LoginResponse = {
  access_token: string
  role: 'student' | 'admin' | 'super_admin'
  department: 'CS' | 'IT' | 'IS' | null
  first_name: string
  last_name: string
}

/**
 * Authenticate via the backend and persist the session in localStorage.
 * Returns the login response on success; throws ApiError on failure.
 */
export async function login(email: string, password: string): Promise<LoginResponse> {
  const data = await apiRequest<LoginResponse>('/api/auth/login', {
    method: 'POST',
    body: { email, password },
    token: null, // no token needed for login
  })

  const deptCode = (data.department ?? 'cs').toLowerCase() as 'cs' | 'it' | 'is'
  const deptName: Record<string, string> = {
    cs: 'Computer Science',
    it: 'Information Technology',
    is: 'Information Systems',
  }

  if (data.role === 'student') {
    setStudentSession({
      name: `${data.first_name} ${data.last_name}`,
      email,
      token: data.access_token,
      studentId: '',  // populated by /me if needed
      department: deptName[deptCode] ?? data.department,
      loginAt: new Date().toISOString(),
    })
  } else {
    // admin or super_admin
    setAdminSession({
      name: `${data.first_name} ${data.last_name}`,
      email,
      departmentCode: deptCode,
      departmentName: deptName[deptCode] ?? data.department,
      role: data.role,
      token: data.access_token,
      loginAt: new Date().toISOString(),
    })
  }

  return data
}

/**
 * Call the logout endpoint and wipe the local session.
 */
export async function logout(role: 'admin' | 'super_admin' | 'student' = 'admin'): Promise<void> {
  try {
    await apiRequest('/api/auth/logout', { method: 'POST' })
  } catch {
    // Best-effort — always clear local session
  } finally {
    if (role === 'student') {
      clearStudentSession()
    } else {
      clearAdminSession()
    }
  }
}
