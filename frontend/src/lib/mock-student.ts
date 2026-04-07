export type MockStudentAccount = {
  email: string
  password: string
  name: string
  studentId: string
  department: string
}

export const SAMPLE_STUDENTS: MockStudentAccount[] = [
  {
    email: 'student.cs@spark.test',
    password: 'Password123!',
    name: 'Carlos Student',
    studentId: '2024-1001',
    department: 'Computer Science',
  },
  {
    email: 'student.it@spark.test',
    password: 'Password123!',
    name: 'Ingrid Student',
    studentId: '2024-1002',
    department: 'Information Technology',
  },
  {
    email: 'student.is@spark.test',
    password: 'Password123!',
    name: 'Sofia Student',
    studentId: '2024-1003',
    department: 'Information Systems',
  },
]

export function findStudentAccount(email: string, password: string) {
  return SAMPLE_STUDENTS.find((student) => student.email === email && student.password === password)
}

export function createStudentToken(email: string) {
  return `student:${email}:token`
}