import type { StudentSession } from '@/types/student'

const STUDENT_SESSION_KEY = 'spark_student_session'

function canUseStorage() {
  return typeof window !== 'undefined'
}

function setCookie(name: string, value: string) {
  document.cookie = `${name}=${encodeURIComponent(value)}; path=/; SameSite=Lax`
}

function deleteCookie(name: string) {
  document.cookie = `${name}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`
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

    if (!parsed?.email || !parsed?.name || !parsed?.token) {
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

  const serialized = JSON.stringify(session)
  localStorage.setItem(STUDENT_SESSION_KEY, serialized)
  // Mirror to cookie so middleware can read it server-side
  setCookie(STUDENT_SESSION_KEY, serialized)
}

export function clearStudentSession() {
  if (!canUseStorage()) {
    return
  }

  localStorage.removeItem(STUDENT_SESSION_KEY)
  deleteCookie(STUDENT_SESSION_KEY)
}
