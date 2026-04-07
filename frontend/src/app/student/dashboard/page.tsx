"use client"

import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui'
import { adminRepository } from '@/lib/admin/admin-repository'
import { getStudentSession } from '@/lib/student/session'

export default function StudentDashboardPage() {
  const session = getStudentSession()
  const all = adminRepository.listSubmissions()
  const mine = all.filter((item) => item.authorEmail === session?.email)

  const pending = mine.filter((item) => item.status === 'Pending Review').length
  const approved = mine.filter((item) => item.status === 'Approved').length
  const revisions = mine.filter((item) => item.status === 'Revision Requested').length

  return (
    <div className="space-y-4">
      <header>
        <h1 className="text-[32px] font-semibold text-navy">Student Dashboard</h1>
        <p className="text-sm text-grey-600">Upload materials and monitor your review status.</p>
      </header>

      <section className="grid gap-4 md:grid-cols-4">
        <Card className="border border-grey-200 shadow-none"><CardContent className="p-4"><p className="text-xs text-grey-500">My Submissions</p><p className="text-3xl font-semibold text-grey-700">{mine.length}</p></CardContent></Card>
        <Card className="border border-grey-200 shadow-none"><CardContent className="p-4"><p className="text-xs text-grey-500">Pending</p><p className="text-3xl font-semibold text-amber-600">{pending}</p></CardContent></Card>
        <Card className="border border-grey-200 shadow-none"><CardContent className="p-4"><p className="text-xs text-grey-500">Approved</p><p className="text-3xl font-semibold text-green-600">{approved}</p></CardContent></Card>
        <Card className="border border-grey-200 shadow-none"><CardContent className="p-4"><p className="text-xs text-grey-500">For Revision</p><p className="text-3xl font-semibold text-violet-600">{revisions}</p></CardContent></Card>
      </section>

      <Card className="border border-grey-200 shadow-none">
        <CardHeader>
          <CardTitle className="text-base">Submission Actions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <Link href="/student/submissions/new/permission" className="inline-flex rounded-md bg-[#0f766e] px-4 py-2 text-white no-underline hover:text-white">
            Start New Submission
          </Link>
          <p className="text-grey-600">New uploads go to admin review before publication.</p>
        </CardContent>
      </Card>

      <Card className="border border-grey-200 shadow-none">
        <CardHeader><CardTitle className="text-base">My Recent Submissions</CardTitle></CardHeader>
        <CardContent>
          {mine.length === 0 ? (
            <p className="text-sm text-grey-500">No submissions yet.</p>
          ) : (
            <div className="space-y-2">
              {mine.slice(0, 5).map((item) => (
                <div key={item.id} className="flex items-center justify-between rounded border border-grey-200 px-3 py-2 text-sm">
                  <span className="text-grey-700">{item.title}</span>
                  <span className="text-grey-500">{item.status}</span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}