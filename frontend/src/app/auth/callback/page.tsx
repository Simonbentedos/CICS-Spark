'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function AuthCallbackPage() {
  const router = useRouter()

  useEffect(() => {
    const handleCallback = async () => {
      const supabase = createClient()

      // Get the session from the URL hash
      const { data, error } = await supabase.auth.getSession()

      if (error) {
        console.error('Auth callback error:', error)
        // Redirect to login with error
        router.push('/login?error=auth_failed')
        return
      }

      if (data.session) {
        // Get user role to determine redirect
        const { data: userData } = await supabase
          .from('users')
          .select('role')
          .eq('id', data.session.user.id)
          .single()

        // Redirect based on role
        if (userData?.role === 'student') {
          router.push('/student/dashboard')
        } else if (userData?.role === 'admin') {
          router.push('/admin/dashboard')
        } else if (userData?.role === 'super_admin') {
          router.push('/superadmin/dashboard')
        } else {
          router.push('/')
        }
      } else {
        // No session, redirect to login
        router.push('/login')
      }
    }

    handleCallback()
  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center bg-bg-grey">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cics-maroon mx-auto mb-4"></div>
        <p className="text-gray-600">Setting up your account...</p>
      </div>
    </div>
  )
}
