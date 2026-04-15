"use client"

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { AlertTriangle, CheckCircle2, Clock, FileText, FilePlus2, RotateCcw, XCircle } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui'
import { getStudentSession } from '@/lib/student/session'
import { getMyDocuments, type ApiDocument } from '@/lib/api/documents'

const STATUS_LABEL: Record<string, string> = {
  pending: 'Pending Review',
  approved: 'Approved',
  rejected: 'Rejected',
  revision: 'Revision Requested',
}

const STATUS_STYLES: Record<string, string> = {
  pending: 'bg-amber-50 text-amber-700 border border-amber-200',
  approved: 'bg-green-50 text-green-700 border border-green-200',
  rejected: 'bg-red-50 text-red-700 border border-red-200',
  revision: 'bg-violet-50 text-violet-700 border border-violet-200',
}

export default function StudentDashboardPage() {
  const session = getStudentSession()
  const [docs, setDocs] = useState<ApiDocument[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getMyDocuments()
      .then(setDocs)
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const pending = docs.filter((d) => d.status === 'pending').length
  const approved = docs.filter((d) => d.status === 'approved').length
  const rejected = docs.filter((d) => d.status === 'rejected').length
  const needsRevision = docs.filter((d) => d.status === 'revision')

  const stats = [
    { label: 'Total Submissions', value: docs.length, icon: FileText, color: 'text-[#0f766e]', bg: 'bg-[#f0fdf9]' },
    { label: 'Pending Review', value: pending, icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50' },
    { label: 'Approved', value: approved, icon: CheckCircle2, color: 'text-green-600', bg: 'bg-green-50' },
    { label: 'Rejected', value: rejected, icon: XCircle, color: 'text-red-600', bg: 'bg-red-50' },
  ]

  return (
    <div className="space-y-5">
      <header>
        <h1 className="text-[28px] font-semibold text-navy leading-tight">
          Welcome back{session?.name ? `, ${session.name.split(' ')[0]}` : ''}!
        </h1>
        <p className="text-sm text-grey-500 mt-0.5">Upload materials and monitor your review status.</p>
      </header>

      {needsRevision.length > 0 && (
        <div className="flex items-start gap-3 rounded-lg border border-violet-200 bg-violet-50 px-4 py-3">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-violet-600" />
          <div className="text-sm">
            <p className="font-medium text-violet-800">
              {needsRevision.length} submission{needsRevision.length > 1 ? 's' : ''} require{needsRevision.length === 1 ? 's' : ''} revision
            </p>
            <p className="mt-0.5 text-violet-700">Please review the feedback and resubmit your work.</p>
          </div>
        </div>
      )}

      <section className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {stats.map(({ label, value, icon: Icon, color, bg }) => (
          <Card key={label} className="border border-grey-200 shadow-none">
            <CardContent className="p-4">
              <div className={`mb-2 inline-flex h-9 w-9 items-center justify-center rounded-lg ${bg}`}>
                <Icon className={`h-4 w-4 ${color}`} />
              </div>
              <p className={`text-2xl font-semibold ${color}`}>{loading ? '—' : value}</p>
              <p className="mt-0.5 text-xs text-grey-500">{label}</p>
            </CardContent>
          </Card>
        ))}
      </section>

      <Card className="border border-grey-200 shadow-none">
        <CardContent className="flex items-center justify-between p-4">
          <div>
            <p className="text-sm font-medium text-grey-700">Ready to submit your thesis or capstone?</p>
            <p className="mt-0.5 text-xs text-grey-500">New uploads go through admin review before publication.</p>
          </div>
          <Link
            href="/student/submissions/new/permission"
            className="inline-flex items-center gap-1.5 rounded-md bg-[#0f766e] px-4 py-2 text-sm font-medium text-white no-underline hover:bg-[#0d6460] hover:text-white"
          >
            <FilePlus2 className="h-4 w-4" />
            New Submission
          </Link>
        </CardContent>
      </Card>

      <Card className="border border-grey-200 shadow-none">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-semibold text-navy">My Submissions</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <p className="px-4 py-8 text-center text-xs text-grey-500">Loading your submissions…</p>
          ) : docs.length === 0 ? (
            <div className="flex flex-col items-center gap-2 py-12 text-center">
              <FileText className="h-8 w-8 text-grey-300" />
              <p className="text-sm text-grey-500">No submissions yet.</p>
              <Link href="/student/submissions/new/permission" className="text-xs text-[#0f766e] hover:underline">
                Start your first submission →
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-grey-100 bg-grey-50">
                    <th className="px-4 py-2.5 text-left text-xs font-medium uppercase tracking-wide text-grey-500">Title</th>
                    <th className="px-4 py-2.5 text-left text-xs font-medium uppercase tracking-wide text-grey-500">Type</th>
                    <th className="px-4 py-2.5 text-left text-xs font-medium uppercase tracking-wide text-grey-500">Submitted</th>
                    <th className="px-4 py-2.5 text-left text-xs font-medium uppercase tracking-wide text-grey-500">Status</th>
                    <th className="px-4 py-2.5 text-left text-xs font-medium uppercase tracking-wide text-grey-500">Feedback</th>
                    <th className="px-4 py-2.5 text-left text-xs font-medium uppercase tracking-wide text-grey-500">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-grey-100">
                  {docs.map((doc) => {
                    const latestFeedback = doc.reviews
                      ?.filter((r: any) => r.decision === 'revise' || r.decision === 'reject')
                      .sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0]
                      ?.feedback_text ?? null

                    return (
                    <tr key={doc.id} className="hover:bg-grey-50">
                      <td className="max-w-[320px] px-4 py-3">
                        <p className="line-clamp-2 text-grey-700">{doc.title}</p>
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-grey-500 capitalize">{doc.type}</td>
                      <td className="whitespace-nowrap px-4 py-3 text-grey-500">
                        {new Date(doc.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3">
                        <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium ${STATUS_STYLES[doc.status] ?? ''}`}>
                          {STATUS_LABEL[doc.status] ?? doc.status}
                        </span>
                      </td>
                      <td className="max-w-[280px] px-4 py-3">
                        {latestFeedback ? (
                          <p className={`line-clamp-2 text-xs italic ${doc.status === 'rejected' ? 'text-red-700' : 'text-violet-700'}`}>
                            {latestFeedback}
                          </p>
                        ) : (
                          <span className="text-xs text-grey-400">—</span>
                        )}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3">
                        {doc.status === 'revision' && (
                          <Link
                            href={`/student/submissions/revise/${doc.id}`}
                            className="inline-flex items-center gap-1 text-xs text-violet-600 hover:text-violet-800 no-underline"
                          >
                            <RotateCcw className="h-3.5 w-3.5" />
                            Revise
                          </Link>
                        )}
                      </td>
                    </tr>
                  )})}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
