"use client"

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { ArrowLeft, Eye, EyeOff, Lock, Mail } from 'lucide-react'
import { Button, Card, Input, Label } from '@/components/ui'
import { SAMPLE_STUDENTS } from '@/lib/mock-student'
import { login } from '@/lib/api/auth'

export default function StudentLoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      const data = await login(email.trim(), password.trim())

      if (data.role !== 'student') {
        setError('This portal is for student accounts only. Use the Admin Login.')
        return
      }

      router.push('/student/dashboard')
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Login failed'
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,#ecfdf5_0%,#ffffff_55%,#f0fdfa_100%)] px-8 py-10 lg:px-10">
      <Link href="/" className="inline-flex items-center gap-2 text-[13px] text-[#707070] hover:text-[#0f766e]">
        <ArrowLeft className="h-4 w-4" />
        Back to Repository
      </Link>

      <section className="mx-auto mt-8 max-w-[448px]">
        <div className="text-center">
          <h1 className="font-heading text-[36px] leading-[36px] font-semibold text-[#134e4a]">Student Portal</h1>
          <p className="mt-1 text-[15px] text-[#5f6e6b]">Submit and track your thesis/capstone materials</p>
        </div>

        <Card className="mt-8 overflow-hidden rounded-[12px] border border-[#d9e5e1] shadow-[0_8px_22px_rgba(17,24,39,0.1)]">
          <div className="bg-[#0f766e] px-6 py-5">
            <h2 className="text-[22px] font-semibold text-white">Student Login</h2>
          </div>

          <div className="bg-[#f7fbfa] px-[33px] py-8">
            <form className="space-y-5" onSubmit={handleSubmit}>
              <div>
                <Label htmlFor="email" className="mb-2 block text-[14px] font-medium text-[#134e4a]">Email Address</Label>
                <div className="relative">
                  <Mail className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-[#90a4a0]" />
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(ev) => setEmail(ev.target.value)}
                    placeholder="Enter your email"
                    required
                    maxLength={255}
                    className="h-[46px] rounded-[8px] border-[#d9e5e1] bg-white pl-10"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="password" className="mb-2 block text-[14px] font-medium text-[#134e4a]">Password</Label>
                <div className="relative">
                  <Lock className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-[#90a4a0]" />
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(ev) => setPassword(ev.target.value)}
                    placeholder="Enter your password"
                    required
                    className="h-[46px] rounded-[8px] border-[#d9e5e1] bg-white pl-10 pr-10"
                  />
                  <button type="button" onClick={() => setShowPassword((v) => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#7d928e]">
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              {error ? <p className="text-sm text-red-600">{error}</p> : null}

              <Button
                className="h-[48px] w-full rounded-[8px] bg-[#0f766e] text-[16px] text-white hover:bg-[#0f766e] disabled:opacity-60"
                disabled={loading}
              >
                {loading ? 'Signing in…' : 'Sign In'}
              </Button>
            </form>
          </div>
        </Card>

        <div className="mt-5 rounded-[12px] border border-[#d9e5e1] bg-white p-4">
          <p className="text-[13px] font-semibold text-[#134e4a] mb-2">Dummy Student Credentials</p>
          <div className="space-y-2 text-[12px] text-[#5d6d6a]">
            {SAMPLE_STUDENTS.map((account) => (
              <p key={account.email}>
                {account.department}: <span className="font-medium">{account.email}</span> / <span className="font-medium">{account.password}</span>
              </p>
            ))}
          </div>
        </div>

        <p className="mt-4 text-center text-[13px] text-[#6a7d79]">
          Need admin access? <Link href="/login" className="text-[#0f766e] hover:underline">Go to Admin Login</Link>
        </p>
      </section>
    </main>
  )
}
