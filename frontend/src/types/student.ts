export interface StudentSession {
  name: string
  email: string
  token: string
  refreshToken?: string
  studentId: string
  department: string
  loginAt: string
}