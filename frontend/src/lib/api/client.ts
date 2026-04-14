/**
 * Thin fetch wrapper that attaches the stored JWT to every request
 * and normalises error responses.
 */

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL ?? 'http://localhost:5000'

function getStoredToken(): string | null {
  if (typeof window === 'undefined') return null
  // Try admin session first, then student session
  try {
    const admin = localStorage.getItem('spark_admin_session')
    if (admin) {
      const parsed = JSON.parse(admin)
      if (parsed?.token) return parsed.token
    }
    const student = localStorage.getItem('spark_student_session')
    if (student) {
      const parsed = JSON.parse(student)
      if (parsed?.token) return parsed.token
    }
  } catch {
    return null
  }
  return null
}

type RequestOptions = Omit<RequestInit, 'body'> & {
  body?: Record<string, unknown> | FormData
  token?: string | null
}

export async function apiRequest<T = unknown>(
  path: string,
  options: RequestOptions = {},
): Promise<T> {
  const { body, token: explicitToken, ...rest } = options
  const token = explicitToken !== undefined ? explicitToken : getStoredToken()

  const headers: Record<string, string> = {}

  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  let bodyInit: BodyInit | undefined
  if (body instanceof FormData) {
    bodyInit = body
    // Do NOT set Content-Type — browser sets it with the boundary
  } else if (body !== undefined) {
    headers['Content-Type'] = 'application/json'
    bodyInit = JSON.stringify(body)
  }

  const res = await fetch(`${BACKEND_URL}${path}`, {
    ...rest,
    headers: { ...headers, ...(rest.headers as Record<string, string> | undefined) },
    body: bodyInit,
  })

  if (!res.ok) {
    let message = `Request failed: ${res.status} ${res.statusText}`
    try {
      const err = await res.json()
      message = err?.message ?? message
    } catch {
      // ignore JSON parse failure
    }
    throw new ApiError(message, res.status)
  }

  // 204 No Content — return empty object
  if (res.status === 204) return {} as T

  return res.json() as Promise<T>
}

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
  ) {
    super(message)
    this.name = 'ApiError'
  }
}
