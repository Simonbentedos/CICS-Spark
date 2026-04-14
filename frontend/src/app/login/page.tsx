"use client"

import Link from 'next/link'
import {
  ArrowLeft,
  Eye,
  EyeOff,
  Lock,
  Mail,
  Shield,
} from 'lucide-react'
import { Button, Card, Input, Label } from '@/components/ui'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { login } from '@/lib/api/auth'
import { SAMPLE_ADMINS } from '@/lib/mock-admin'

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      const data = await login(email.trim(), password.trim())

      if (data.role === 'student') {
        setError('Use the Student Login for student accounts.')
        return
      }

      if (data.role === 'super_admin') {
        router.push('/superadmin/dashboard')
      } else {
        router.push('/admin/dashboard')
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Login failed'
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,#f5f2ed_0%,#ffffff_55%,#f7efe5_100%)] relative overflow-hidden">
      <div className="absolute inset-0 opacity-[0.05] bg-[radial-gradient(circle_at_20%_10%,#d35e22_0%,transparent_45%),radial-gradient(circle_at_80%_90%,#1a1a2e_0%,transparent_35%)]" />

      <div className="relative z-10 px-8 py-10 lg:px-10">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-[13px] text-[#707070] hover:text-cics-maroon transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Repository
        </Link>

        <section className="mx-auto mt-8 max-w-[448px]">
          <div className="flex flex-col items-center text-center">
            <img
              src="/images/CICS SEAL.png"
              alt="UST CICS Seal"
              className="h-32 w-32 object-contain"
            />
            <h1 className="mt-2 font-heading text-[36px] leading-[36px] font-semibold text-[#1A1A2E]">
              Admin Portal
            </h1>
            <p className="mt-1 font-body text-[16px] leading-[24px] text-[#888888]">
              SPARK Repository System
            </p>
          </div>

          <Card className="mt-10 overflow-hidden rounded-[12px] border border-[#d9d9d9] shadow-[0_8px_22px_rgba(17,24,39,0.12)]">
            <div className="bg-cics-maroon px-6 py-6">
              <div className="flex items-center gap-3">
                <div className="inline-flex h-10 w-10 items-center justify-center rounded-[8px] border border-white/20 bg-white/10">
                  <Lock className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h2 className="font-body text-[24px] leading-[28px] font-semibold text-white">Welcome Back</h2>
                  <p className="font-body text-[14px] leading-[20px] text-white/90">Sign in to continue</p>
                </div>
              </div>
            </div>

            <div className="bg-[#f6f6f6] px-[33px] py-8">
              <form className="space-y-5" onSubmit={handleSubmit}>
                <div>
                  <Label htmlFor="email" className="mb-2 block text-[14px] font-medium text-[#1A1A2E]">
                    Email Address
                  </Label>
                  <div className="relative">
                    <Mail className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-[#a7a7a7]" />
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(ev) => setEmail(ev.target.value)}
                      placeholder="Enter email"
                      required
                      maxLength={255}
                      className="h-[46px] rounded-[8px] border-[#d9d9d9] bg-white pl-10 pr-3 text-[14px] text-[#444] placeholder:text-[#a7a7a7] focus:ring-1"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="password" className="mb-2 block text-[14px] font-medium text-[#1A1A2E]">
                    Password
                  </Label>
                  <div className="relative">
                    <Lock className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-[#a7a7a7]" />
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(ev) => setPassword(ev.target.value)}
                      placeholder="Enter your password"
                      required
                      className="h-[46px] rounded-[8px] border-[#d9d9d9] bg-white pl-10 pr-10 text-[14px] text-[#444] placeholder:text-[#a7a7a7] focus:ring-1"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((current) => !current)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8f8f8f] hover:text-cics-maroon transition-colors"
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                </div>

                {error && <p className="text-sm text-red-600">{error}</p>}

                <Button
                  className="h-[48px] w-full rounded-[8px] bg-cics-maroon text-[16px] font-medium text-white hover:bg-cics-maroon disabled:opacity-60"
                  disabled={loading}
                >
                  {loading ? 'Signing in…' : 'Sign In'}
                </Button>
              </form>
            </div>
          </Card>

          <div className="mt-10 text-center">
            <p className="inline-flex items-center gap-2 text-[14px] text-[#888888]">
              <Shield className="h-4 w-4" />
              Secured admin access only
            </p>
            <p className="mt-2 text-[12px] text-[#a0a0a0]">
              Contact IT support for account issues or access requests
            </p>
          </div>

          <div className="mt-4 rounded-[12px] border border-[#cfe9e2] bg-[#ecfdf5] p-4 text-center">
            <p className="text-[13px] text-[#3f5d57] mb-2">Student account access</p>
            <Link
              href="/student/login"
              className="inline-flex items-center justify-center rounded-[8px] bg-[#0f766e] px-4 py-2 text-[13px] font-medium text-white no-underline hover:text-white"
            >
              Open Student Portal Login
            </Link>
          </div>

          <div className="mt-5 rounded-[12px] border border-[#d9d9d9] bg-white/90 p-4">
            <p className="font-body text-[13px] font-semibold text-[#1A1A2E] mb-2">Dummy Admin Credentials</p>
            <div className="space-y-2 text-[12px] text-[#5d5d5d]">
              {SAMPLE_ADMINS.map((account) => (
                <p key={account.email}>
                  {account.departmentName}: <span className="font-medium">{account.email}</span> / <span className="font-medium">{account.password}</span>
                </p>
              ))}
            </div>
          </div>
        </section>
      </div>
    </main>
  )
}
