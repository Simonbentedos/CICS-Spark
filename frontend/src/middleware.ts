import { NextRequest, NextResponse } from 'next/server'

const ADMIN_SESSION_KEY = 'spark_admin_session'
const STUDENT_SESSION_KEY = 'spark_student_session'

/**
 * Route protection middleware.
 *
 * /admin/*      → requires a valid admin or super_admin session cookie
 * /superadmin/* → requires a valid super_admin session cookie
 * /student/*    → requires a valid student session cookie
 *
 * Sessions are stored in localStorage (client-only), so this middleware
 * reads them from cookies that the client sets on navigation. For the MVP
 * we use a simple cookie mirror approach: the login pages set a lightweight
 * cookie so the middleware can verify access server-side without the JWT.
 */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // ── Admin & Super Admin routes ──────────────────────────────────────────────
  if (pathname.startsWith('/admin') || pathname.startsWith('/superadmin')) {
    const sessionCookie = request.cookies.get(ADMIN_SESSION_KEY)

    if (!sessionCookie?.value) {
      const loginUrl = request.nextUrl.clone()
      loginUrl.pathname = '/login'
      return NextResponse.redirect(loginUrl)
    }

    try {
      const session = JSON.parse(sessionCookie.value)
      if (!session?.token || !session?.role) {
        throw new Error('invalid')
      }

      // Super admin routes require super_admin role
      if (pathname.startsWith('/superadmin') && session.role !== 'super_admin') {
        const dashUrl = request.nextUrl.clone()
        dashUrl.pathname = '/admin/dashboard'
        return NextResponse.redirect(dashUrl)
      }
    } catch {
      const loginUrl = request.nextUrl.clone()
      loginUrl.pathname = '/login'
      return NextResponse.redirect(loginUrl)
    }
  }

  // ── Student routes ──────────────────────────────────────────────────────────
  if (pathname.startsWith('/student') && !pathname.startsWith('/student/login')) {
    const sessionCookie = request.cookies.get(STUDENT_SESSION_KEY)

    if (!sessionCookie?.value) {
      const loginUrl = request.nextUrl.clone()
      loginUrl.pathname = '/student/login'
      return NextResponse.redirect(loginUrl)
    }

    try {
      const session = JSON.parse(sessionCookie.value)
      if (!session?.token) throw new Error('invalid')
    } catch {
      const loginUrl = request.nextUrl.clone()
      loginUrl.pathname = '/student/login'
      return NextResponse.redirect(loginUrl)
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*', '/superadmin/:path*', '/student/:path*'],
}
