'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import {
  FileText,
  FolderOpen,
  LayoutGrid,
  LogOut,
  Settings,
  Users,
  Inbox,
} from 'lucide-react'
import { ADMIN_NAV_ITEMS, ADMIN_PROFILE, cn, getAdminTopTitle } from '@/lib/utils'
import { getAdminSession } from '@/lib/admin/session'
import { getAdminTheme } from '@/lib/admin/theme'
import { logout } from '@/lib/api/auth'

const iconMap = {
  dashboard: LayoutGrid,
  submissions: FolderOpen,
  fulltext: Inbox,
  reports: FileText,
  users: Users,
  settings: Settings,
} as const

export default function AdminShell({ children }: Readonly<{ children: React.ReactNode }>) {
  const pathname = usePathname()
  const router = useRouter()
  const topTitle = getAdminTopTitle(pathname)
  const [authorized, setAuthorized] = useState(false)
  const [sessionName, setSessionName] = useState(ADMIN_PROFILE.name)
  const [sessionEmail, setSessionEmail] = useState(ADMIN_PROFILE.email)
  const [departmentCode, setDepartmentCode] = useState<'cs' | 'it' | 'is'>('cs')
  const theme = getAdminTheme(departmentCode)

  useEffect(() => {
    const session = getAdminSession()

    if (!session) {
      router.replace('/login')
      return
    }

    setSessionName(session.name)
    setSessionEmail(session.email)
    setDepartmentCode(session.departmentCode)
    setAuthorized(true)
  }, [router])

  if (!authorized) {
    return null
  }

  async function handleLogout() {
    const shouldLogout = window.confirm('Are you sure you want to log out?')
    if (!shouldLogout) return
    await logout('admin')
    router.push('/login')
  }

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-bg-grey">
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

          <p className="text-sm font-medium text-grey-700">{topTitle}</p>
        </div>
      </header>

      <div className="flex flex-1 min-h-0 overflow-hidden">
        <aside className="flex w-[255px] min-h-0 shrink-0 flex-col border-r border-grey-200 bg-white" aria-label="Admin sidebar">
          <nav className="flex-1 overflow-y-auto px-4 py-4" aria-label="Admin primary navigation">
            <div className="space-y-1">
              {ADMIN_NAV_ITEMS.map((item) => {
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

          <div className="mt-auto shrink-0 border-t border-grey-300 px-4 py-4">
            <div className="flex items-center gap-3">
              <div
                className="flex h-11 w-11 items-center justify-center rounded-full text-[24px] font-medium"
                style={{ backgroundColor: theme.badgeBg, color: theme.badgeText }}
              >
                {sessionName.charAt(0)}
              </div>
              <div>
                <p className="text-sm font-medium text-grey-700">{sessionName}</p>
                <p className="text-[12px] text-grey-500">{sessionEmail}</p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleLogout}
              className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-red-500 hover:text-red-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1"
              style={{ ['--tw-ring-color' as string]: theme.accentHex }}
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
    </div>
  )
}
