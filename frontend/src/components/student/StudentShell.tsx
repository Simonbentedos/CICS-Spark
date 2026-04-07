'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { FilePlus2, Home, LogOut } from 'lucide-react'
import { clearStudentSession, getStudentSession } from '@/lib/student/session'

export default function StudentShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const isStudentLoginRoute = pathname === '/student/login'
  const [authorized, setAuthorized] = useState(false)
  const [studentName, setStudentName] = useState('Student User')

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
    setAuthorized(true)
  }, [isStudentLoginRoute, router])

  if (isStudentLoginRoute) {
    return <>{children}</>
  }

  if (!authorized) {
    return null
  }

  function handleLogout() {
    const shouldLogout = window.confirm('Are you sure you want to log out?')

    if (!shouldLogout) {
      return
    }

    clearStudentSession()
    router.push('/student/login')
  }

  const links = [
    { href: '/student/dashboard', label: 'Dashboard', icon: Home },
    { href: '/student/submissions/new/permission', label: 'Upload Material', icon: FilePlus2 },
  ]

  return (
    <div className="min-h-screen bg-bg-grey">
      <div className="h-3 bg-[#0f766e]" />
      <header className="border-b border-grey-200 bg-white px-6 py-3">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[16px] font-semibold text-[#0f766e]">Student Portal</p>
            <p className="text-[12px] text-grey-500">CICS Repository</p>
          </div>
          <div className="flex items-center gap-3">
            <p className="text-sm text-grey-700">{studentName}</p>
            <button onClick={handleLogout} className="inline-flex items-center gap-1 text-sm text-red-600 hover:text-red-700">
              <LogOut className="h-4 w-4" />
              Logout
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto flex max-w-[1200px] gap-4 px-6 py-5">
        <aside className="w-[220px] rounded-md border border-grey-200 bg-white p-3">
          <nav className="space-y-1">
            {links.map((item) => {
              const Icon = item.icon
              const active = pathname === item.href || pathname.startsWith(`${item.href}/`)
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-2 rounded-md px-3 py-2 text-sm no-underline ${active ? 'bg-[#0f766e] text-white hover:text-white' : 'text-grey-700 hover:bg-grey-100'}`}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </Link>
              )
            })}
          </nav>
        </aside>

        <main className="flex-1 min-w-0">{children}</main>
      </div>
    </div>
  )
}
