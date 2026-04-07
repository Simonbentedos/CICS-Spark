export type DepartmentCode = 'cs' | 'it' | 'is'

export type MockAdminAccount = {
  email: string
  password: string
  name: string
  departmentCode: DepartmentCode
  departmentName: string
}

export const SAMPLE_ADMINS: MockAdminAccount[] = [
  {
    email: 'cs-admin@spark.test',
    password: 'Password123!',
    name: 'CS Dashboard Admin',
    departmentCode: 'cs',
    departmentName: 'Computer Science',
  },
  {
    email: 'it-admin@spark.test',
    password: 'Password123!',
    name: 'IT Dashboard Admin',
    departmentCode: 'it',
    departmentName: 'Information Technology',
  },
  {
    email: 'is-admin@spark.test',
    password: 'Password123!',
    name: 'IS Dashboard Admin',
    departmentCode: 'is',
    departmentName: 'Information Systems',
  },
]

export const SAMPLE_ADMIN = SAMPLE_ADMINS[0]

export function findAdminAccount(email: string, password: string) {
  return SAMPLE_ADMINS.find((admin) => admin.email === email && admin.password === password)
}

export function validateAdmin(email: string, password: string) {
  return Boolean(findAdminAccount(email, password))
}

export function createAdminToken(email: string = SAMPLE_ADMIN.email) {
  // lightweight mock token for local dev; not secure
  return `mock:${email}:token`
}