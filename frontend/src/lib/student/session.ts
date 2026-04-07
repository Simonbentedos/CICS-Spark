import type { StudentSession } from '@/types/student'

const STUDENT_SESSION_KEY = 'spark_student_session'

function canUseStorage() {
  return typeof window !== 'undefined'
}

export function getStudentSession(): StudentSession | null {
  if (!canUseStorage()) {
    return null
  }

  const raw = localStorage.getItem(STUDENT_SESSION_KEY)

  if (!raw) {
    return null
  }

  try {
    const parsed = JSON.parse(raw) as StudentSession

    if (!parsed?.email || !parsed?.name || !parsed?.token || !parsed?.studentId) {
      return null
    }

    return parsed
  } catch {
    return null
  }
}

export function setStudentSession(session: StudentSession) {
  if (!canUseStorage()) {
    return
  }

  localStorage.setItem(STUDENT_SESSION_KEY, JSON.stringify(session))
}

export function clearStudentSession() {
  if (!canUseStorage()) {
    return
  }

  localStorage.removeItem(STUDENT_SESSION_KEY)
}