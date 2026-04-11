import type { AdminSession } from '@/types/admin'

const ADMIN_SESSION_KEY = 'spark_admin_session'

function canUseStorage() {
  return typeof window !== 'undefined'
}

function setCookie(name: string, value: string) {
  document.cookie = `${name}=${encodeURIComponent(value)}; path=/; SameSite=Lax`
}

function deleteCookie(name: string) {
  document.cookie = `${name}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`
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

    if (!parsed.departmentCode || !parsed.departmentName || !parsed.role) {
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

  const serialized = JSON.stringify(session)
  localStorage.setItem(ADMIN_SESSION_KEY, serialized)
  // Mirror to cookie so middleware can read it server-side
  setCookie(ADMIN_SESSION_KEY, serialized)
}

export function clearAdminSession() {
  if (!canUseStorage()) {
    return
  }

  localStorage.removeItem(ADMIN_SESSION_KEY)
  deleteCookie(ADMIN_SESSION_KEY)
}
