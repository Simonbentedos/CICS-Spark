'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import {
  FileText,
  FolderOpen,
  KeyRound,
  LayoutGrid,
  LogOut,
  Menu,
  Settings,
  Users,
  Inbox,
  X,
} from 'lucide-react'
import { ADMIN_NAV_ITEMS, ADMIN_PROFILE, cn, getAdminTopTitle } from '@/lib/utils'
import { clearAdminSession, getAdminSession, setAdminSession } from '@/lib/admin/session'
import { getAdminTheme } from '@/lib/admin/theme'
import { logout } from '@/lib/api/auth'
import { getMyPermissions, type Permission } from '@/lib/api/permissions'
import NotificationBell from '@/components/admin/NotificationBell'
import ChangePasswordModal from '@/components/admin/ChangePasswordModal'

const iconMap = {
  dashboard: LayoutGrid,
  submissions: FolderOpen,
  fulltext: Inbox,
  reports: FileText,
  users: Users,
  settings: Settings,
} as const

// Map navigation items to required permissions
const NAV_PERMISSIONS: Record<string, Permission | null> = {
  '/admin/dashboard': null, // Dashboard always visible
  '/admin/submissions': 'submissions.view',
  '/admin/fulltext-requests': 'fulltext.manage',
  '/admin/users': 'users.view',
  '/admin/reports': 'reports.view',
}

export default function AdminShell({ children }: Readonly<{ children: React.ReactNode }>) {
  const pathname = usePathname()
  const router = useRouter()
  const topTitle = getAdminTopTitle(pathname)
  const [authorized, setAuthorized] = useState(false)
  const [sessionName, setSessionName] = useState(ADMIN_PROFILE.name)
  const [sessionEmail, setSessionEmail] = useState(ADMIN_PROFILE.email)
  const [departmentCode, setDepartmentCode] = useState<'cs' | 'it' | 'is'>('cs')
  const [userRole, setUserRole] = useState<'admin' | 'super_admin'>('admin')
  const [permissions, setPermissions] = useState<Permission[]>([])
  const [permissionsLoaded, setPermissionsLoaded] = useState(false)
  const [showChangePassword, setShowChangePassword] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const theme = getAdminTheme(departmentCode)
  const inactivityTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    const session = getAdminSession()

    if (!session) {
      router.replace('/login')
      return
    }

    if (session.role === 'super_admin') {
      router.replace('/superadmin/dashboard')
      return
    }

    setSessionName(session.name)
    setSessionEmail(session.email)
    setDepartmentCode(session.departmentCode)
    setUserRole(session.role)
    setAuthorized(true)

    // Fetch permissions for regular admins
    if (session.role === 'admin') {
      getMyPermissions()
        .then(perms => {
          setPermissions(perms)
          setPermissionsLoaded(true)
        })
        .catch(err => {
          console.error('Failed to load permissions:', err)
          setPermissionsLoaded(true) // Still mark as loaded to show UI
        })
    } else {
      // Super admin has all permissions
      setPermissionsLoaded(true)
    }

    // Prevent double scrollbar by locking the main document body.
    // AdminShell has its own scrollable containers inside.
    document.body.style.overflow = 'hidden'
    
    return () => {
      document.body.style.overflow = ''
    }
  }, [router])

  // Silently refresh the Supabase token every 50 minutes
  useEffect(() => {
    if (!authorized) return

    async function refresh() {
      const session = getAdminSession()
      if (!session?.refreshToken) return
      try {
        const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL ?? 'http://localhost:5000'
        const res = await fetch(`${backendUrl}/api/auth/refresh`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ refresh_token: session.refreshToken }),
        })
        if (!res.ok) return
        const data = await res.json()
        setAdminSession({ ...session, token: data.access_token, refreshToken: data.refresh_token })
      } catch {
        // silent — next real API call will handle expiry
      }
    }

    const interval = setInterval(refresh, 50 * 60 * 1000)
    return () => clearInterval(interval)
  }, [authorized])

  // Auto-logout after 30 minutes of inactivity
  useEffect(() => {
    if (!authorized) return

    const TIMEOUT_MS = 30 * 60 * 1000

    function resetTimer() {
      if (inactivityTimer.current) clearTimeout(inactivityTimer.current)
      inactivityTimer.current = setTimeout(() => {
        clearAdminSession()
        router.push('/login')
      }, TIMEOUT_MS)
    }

    const events = ['mousemove', 'mousedown', 'keydown', 'touchstart', 'scroll'] as const
    events.forEach((e) => window.addEventListener(e, resetTimer, { passive: true }))
    resetTimer()

    return () => {
      events.forEach((e) => window.removeEventListener(e, resetTimer))
      if (inactivityTimer.current) clearTimeout(inactivityTimer.current)
    }
  }, [authorized, router])

  // Filter navigation items based on permissions
  const visibleNavItems = ADMIN_NAV_ITEMS.filter(item => {
    // Super admin sees everything
    if (userRole === 'super_admin') return true
    
    // Check if this nav item requires a permission
    const requiredPermission = NAV_PERMISSIONS[item.href]
    
    // If no permission required, show it
    if (!requiredPermission) return true
    
    // Check if user has the required permission
    return permissions.includes(requiredPermission)
  })

  if (!authorized || !permissionsLoaded) {
    return null
  }

  async function handleLogout() {
    const shouldLogout = window.confirm('Are you sure you want to log out?')
    if (!shouldLogout) return
    await logout('admin')
    router.push('/login')
  }

  return (
    <div className="flex fixed inset-0 flex-col overflow-hidden bg-bg-grey">
      <div className="h-3" style={{ backgroundColor: theme.accentHex }} />

      <header className="border-b border-grey-200 bg-white px-6 py-3" aria-label="Admin context bar">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Image src="/images/CICS SEAL.png" alt="CICS Seal" width={32} height={40} className="h-10 w-8 object-contain" />
            <div>
              <p className="text-[14px] font-semibold leading-tight" style={{ color: theme.accentDark }}>
                {theme.departmentName} Admin Portal
              </p>
              <p className="text-[9px] leading-tight" style={{ color: theme.accentDark }}>University of Santo Tomas</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <NotificationBell accentColor={theme.accentHex} />
            <p className="hidden sm:block text-sm font-medium text-grey-700">{topTitle}</p>
            <button
              className="md:hidden p-1 text-grey-600"
              onClick={() => setSidebarOpen(v => !v)}
              aria-label="Toggle sidebar"
            >
              <Menu className="h-5 w-5" />
            </button>
          </div>
        </div>
      </header>

      <div className="flex flex-1 min-h-0 overflow-hidden">
        {/* Mobile overlay backdrop */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 z-40 bg-black/40 md:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        <aside
          className={cn(
            'flex w-[255px] min-h-0 shrink-0 flex-col border-r border-grey-200 bg-white',
            'fixed md:relative inset-y-0 left-0 z-50 md:z-auto transition-transform duration-200',
            sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
          )}
          aria-label="Admin sidebar"
        >
          {/* Mobile close button */}
          <button
            className="md:hidden absolute top-3 right-3 p-1 text-grey-500"
            onClick={() => setSidebarOpen(false)}
            aria-label="Close sidebar"
          >
            <X className="h-4 w-4" />
          </button>
          <nav className="flex-1 overflow-y-auto px-4 py-4" aria-label="Admin primary navigation">
            <div className="space-y-1">
              {visibleNavItems.map((item) => {
              const Icon = iconMap[item.icon]
              const active = pathname === item.href ||
                (item.href === '/admin/submissions' && pathname.startsWith('/admin/submissions/')) ||
                (item.href === '/admin/fulltext-requests' && pathname.startsWith('/admin/fulltext-requests'))

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                      'flex items-center gap-3 rounded-[10px] px-3 py-2.5 text-sm no-underline transition-colors',
                      active ? 'text-white hover:text-white' : 'text-grey-700'
                  )}
                  style={active ? { backgroundColor: theme.accentHex } : undefined}
                >
                    <Icon className="h-4 w-4" />
                    <span>{item.label}</span>
                </Link>
              )
              })}
            </div>
          </nav>

          <div className="mt-auto shrink-0 border-t border-grey-300 px-4 py-4 space-y-3">
            <div className="flex items-center gap-3">
              <div
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[18px] font-medium"
                style={{ backgroundColor: theme.badgeBg, color: theme.badgeText }}
              >
                {sessionName.charAt(0)}
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-grey-700">{sessionName}</p>
                <p className="truncate text-[11px] text-grey-500">{sessionEmail}</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setShowChangePassword(true)}
              className="flex w-full items-center gap-2 rounded-[8px] px-3 py-2 text-sm text-grey-600 hover:bg-grey-50 hover:text-grey-800 focus-visible:outline-none"
            >
              <KeyRound className="h-4 w-4" />
              Change Password
            </button>
            <button
              type="button"
              onClick={handleLogout}
              className="flex w-full items-center gap-2 rounded-[8px] px-3 py-2 text-sm font-medium text-red-500 hover:bg-red-50 hover:text-red-600 focus-visible:outline-none"
            >
              <LogOut className="h-4 w-4" />
              Logout
            </button>
          </div>
        </aside>

        <main id="main-content" tabIndex={-1} className="flex-1 min-w-0 overflow-y-auto px-5 py-4" aria-label="Admin main content">
          {children}
        </main>
      </div>

      {showChangePassword && (
        <ChangePasswordModal
          accentColor={theme.accentHex}
          onClose={() => setShowChangePassword(false)}
        />
      )}
    </div>
  )
}
