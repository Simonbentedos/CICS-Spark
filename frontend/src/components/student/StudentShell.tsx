'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import { FilePlus2, KeyRound, LayoutGrid, LogOut } from 'lucide-react'
import { clearStudentSession, getStudentSession } from '@/lib/student/session'
import NotificationBell from '@/components/admin/NotificationBell'
import ChangePasswordModal from '@/components/admin/ChangePasswordModal'
import { cn } from '@/lib/utils'

const NAV_ITEMS = [
  { href: '/student/dashboard', label: 'Dashboard', icon: LayoutGrid },
  { href: '/student/submissions/new/permission', label: 'Upload Material', icon: FilePlus2 },
] as const

export default function StudentShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const isStudentLoginRoute = pathname === '/student/login'
  const [authorized, setAuthorized] = useState(false)
  const [studentName, setStudentName] = useState('Student User')
  const [studentEmail, setStudentEmail] = useState('')
  const [showChangePassword, setShowChangePassword] = useState(false)
  const inactivityTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (isStudentLoginRoute) {
      setAuthorized(true)
      return
    }

    const session = getStudentSession()

    if (!session) {
      router.replace('/student/login')
      return
    }

    setStudentName(session.name)
    setStudentEmail(session.email ?? '')
    setAuthorized(true)

    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = '' }
  }, [isStudentLoginRoute, router])

  // Auto-logout after 30 minutes of inactivity
  useEffect(() => {
    if (!authorized || isStudentLoginRoute) return

    const TIMEOUT_MS = 30 * 60 * 1000

    function resetTimer() {
      if (inactivityTimer.current) clearTimeout(inactivityTimer.current)
      inactivityTimer.current = setTimeout(() => {
        clearStudentSession()
        router.push('/student/login')
      }, TIMEOUT_MS)
    }

    const events = ['mousemove', 'mousedown', 'keydown', 'touchstart', 'scroll'] as const
    events.forEach((e) => window.addEventListener(e, resetTimer, { passive: true }))
    resetTimer()

    return () => {
      events.forEach((e) => window.removeEventListener(e, resetTimer))
      if (inactivityTimer.current) clearTimeout(inactivityTimer.current)
    }
  }, [authorized, isStudentLoginRoute, router])

  if (isStudentLoginRoute) return <>{children}</>
  if (!authorized) return null

  function handleLogout() {
    if (!window.confirm('Are you sure you want to log out?')) return
    clearStudentSession()
    router.push('/student/login')
  }

  return (
    <div className="flex fixed inset-0 flex-col overflow-hidden bg-bg-grey">
      <div className="h-3 bg-[#0f766e]" />

      <header className="border-b border-grey-200 bg-white px-6 py-3" aria-label="Student context bar">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Image src="/images/CICS SEAL.png" alt="CICS Seal" width={32} height={40} className="h-10 w-8 object-contain" />
            <div>
              <p className="text-[14px] font-semibold leading-tight text-[#0f766e]">Student Portal</p>
              <p className="text-[9px] leading-tight text-[#0f766e]">University of Santo Tomas</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <NotificationBell accentColor="#0f766e" />
            <p className="text-sm font-medium text-grey-700">CICS Repository</p>
          </div>
        </div>
      </header>

      <div className="flex flex-1 min-h-0 overflow-hidden">
        <aside className="flex w-[255px] min-h-0 shrink-0 flex-col border-r border-grey-200 bg-white" aria-label="Student sidebar">
          <nav className="flex-1 overflow-y-auto px-4 py-4" aria-label="Student navigation">
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
                      active ? 'bg-[#0f766e] text-white hover:text-white' : 'text-grey-700 hover:bg-grey-50',
                    )}
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
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#0f766e] text-[18px] font-medium text-white">
                {studentName.charAt(0)}
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-grey-700">{studentName}</p>
                <p className="truncate text-[11px] text-grey-500">{studentEmail}</p>
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
          accentColor="#0f766e"
          sessionType="student"
          onClose={() => setShowChangePassword(false)}
        />
      )}
    </div>
  )
}
