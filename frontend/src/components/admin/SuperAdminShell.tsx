'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import {
  BarChart2,
  FolderOpen,
  KeyRound,
  LayoutGrid,
  LogOut,
  ShieldAlert,
  Settings,
  Users,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { clearAdminSession, getAdminSession } from '@/lib/admin/session'
import { logout } from '@/lib/api/auth'
import NotificationBell from '@/components/admin/NotificationBell'
import ChangePasswordModal from '@/components/admin/ChangePasswordModal'

const NAV_ITEMS = [
  { href: '/superadmin/dashboard', label: 'Dashboard', icon: LayoutGrid },
  { href: '/superadmin/users', label: 'User Management', icon: Users },
  { href: '/superadmin/submissions', label: 'All Submissions', icon: FolderOpen },
  { href: '/superadmin/password-reset-requests', label: 'Password Requests', icon: ShieldAlert },
  { href: '/superadmin/reports', label: 'Reports', icon: BarChart2 },
  { href: '/superadmin/settings', label: 'Settings', icon: Settings },
] as const

export default function SuperAdminShell({ children }: Readonly<{ children: React.ReactNode }>) {
  const pathname = usePathname()
  const router = useRouter()
  const [authorized, setAuthorized] = useState(false)
  const [sessionName, setSessionName] = useState('Super Admin')
  const [sessionEmail, setSessionEmail] = useState('')
  const [showChangePassword, setShowChangePassword] = useState(false)

  useEffect(() => {
    const session = getAdminSession()
    if (!session || session.role !== 'super_admin') {
      router.replace('/login')
      return
    }
    setSessionName(session.name)
    setSessionEmail(session.email)
    setAuthorized(true)

    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = '' }
  }, [router])

  if (!authorized) return null

  async function handleLogout() {
    if (!window.confirm('Are you sure you want to log out?')) return
    await logout('super_admin')
    router.push('/login')
  }

  return (
    <div className="flex fixed inset-0 flex-col overflow-hidden bg-bg-grey">
      <div className="h-3 bg-cics-maroon" />

      <header className="border-b border-grey-200 bg-white px-6 py-3" aria-label="Super Admin context bar">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Image src="/images/CICS SEAL.png" alt="CICS Seal" width={32} height={40} className="h-10 w-8 object-contain" />
            <div>
              <p className="text-[14px] font-semibold leading-tight text-cics-maroon">SPARK Super Admin</p>
              <p className="text-[9px] leading-tight text-cics-maroon">University of Santo Tomas</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <NotificationBell accentColor="#800000" />
            <p className="text-sm font-medium text-grey-700">Super Admin Portal</p>
          </div>
        </div>
      </header>

      <div className="flex flex-1 min-h-0 overflow-hidden">
        <aside className="flex w-[255px] min-h-0 shrink-0 flex-col border-r border-grey-200 bg-white" aria-label="Super Admin sidebar">
          <nav className="flex-1 overflow-y-auto px-4 py-4 space-y-1" aria-label="Super Admin navigation">
            <div className="space-y-1">
              {NAV_ITEMS.map((item) => {
                const Icon = item.icon
                const active = pathname === item.href || pathname.startsWith(`${item.href}/`)
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      'flex items-center gap-3 rounded-[10px] px-3 py-2.5 text-sm no-underline transition-colors',
                      active ? 'bg-cics-maroon text-white hover:text-white' : 'text-grey-700 hover:bg-grey-50',
                    )}
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
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-cics-maroon text-[16px] font-medium text-white">
                {sessionName.split(' ').map((n) => n[0]).filter(Boolean).slice(0, 2).join('').toUpperCase()}
              </div>
              <div>
                <p className="text-sm font-medium text-grey-700">{sessionName}</p>
                <p className="text-[12px] text-grey-500">{sessionEmail}</p>
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

        <main id="main-content" tabIndex={-1} className="flex-1 min-w-0 overflow-y-auto px-5 py-4">
          {children}
        </main>
      </div>

      {showChangePassword && (
        <ChangePasswordModal
          accentColor="#800000"
          onClose={() => setShowChangePassword(false)}
        />
      )}
    </div>
  )
}
