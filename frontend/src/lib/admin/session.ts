import type { AdminSession } from '@/types/admin'

const ADMIN_SESSION_KEY = 'spark_admin_session'

function canUseStorage() {
  return typeof window !== 'undefined'
}

export function getAdminSession(): AdminSession | null {
  if (!canUseStorage()) {
    return null
  }

  const raw = localStorage.getItem(ADMIN_SESSION_KEY)

  if (!raw) {
    return null
  }

  try {
    const parsed = JSON.parse(raw) as AdminSession

    if (!parsed?.email || !parsed?.name || !parsed?.token) {
      return null
    }

    if (!parsed.departmentCode || !parsed.departmentName) {
      return null
    }

    return parsed
  } catch {
    return null
  }
}

export function setAdminSession(session: AdminSession) {
  if (!canUseStorage()) {
    return
  }

  localStorage.setItem(ADMIN_SESSION_KEY, JSON.stringify(session))
}

export function clearAdminSession() {
  if (!canUseStorage()) {
    return
  }

  localStorage.removeItem(ADMIN_SESSION_KEY)
}
