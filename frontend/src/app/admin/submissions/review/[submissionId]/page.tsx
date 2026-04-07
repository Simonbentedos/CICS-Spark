"use client"

import { useMemo, useState } from 'react'
import { ArrowLeft, CalendarDays, Download, User } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button, Card, CardContent, CardHeader, CardTitle, Input } from '@/components/ui'
import AdminBadge from '@/components/admin/AdminBadge'
import ReviewActionDialog from '@/components/admin/ReviewActionDialog'
import { adminRepository } from '@/lib/admin/admin-repository'
import { getAdminSession } from '@/lib/admin/session'
import {
  getSubmissionStatusTone,
} from '@/lib/utils'
import type { ReviewActionType } from '@/types/admin'

export default function SubmissionReviewPage({ params }: Readonly<{ params: { submissionId: string } }>) {
  const router = useRouter()
  const submission = useMemo(() => adminRepository.getSubmissionById(params.submissionId), [params.submissionId])
  const [activeAction, setActiveAction] = useState<ReviewActionType | null>(null)
  const [adminNotes, setAdminNotes] = useState('')

  if (!submission) {
    return (
      <div className="space-y-3">
        <h1 className="text-[28px] font-semibold text-navy">Submission not found</h1>
        <Link href="/admin/submissions" className="text-sm text-cics-red no-underline hover:text-cics-red-600">
          Return to Submissions
        </Link>
      </div>
    )
  }

  const reviewHistory = adminRepository.getSubmissionReviewHistory(submission.id)

  return (
    <div className="space-y-4">
      <header className="space-y-1">
        <Link href="/admin/submissions" className="inline-flex items-center gap-1 text-xs text-grey-600 no-underline hover:text-cics-red">
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to Submissions
        </Link>
        <h1 className="text-[32px] font-semibold leading-tight text-navy">Review Submission</h1>
        <p className="text-sm text-grey-500">Review and approve thesis submission</p>
      </header>

      <section className="grid gap-4 xl:grid-cols-[1fr_320px]">
        <div className="space-y-4">
          <Card className="border border-grey-200 shadow-none">
            <CardContent className="space-y-4 p-4">
              <div>
                <h2 className="text-sm font-medium text-grey-700">{submission.title}</h2>
                <div className="mt-1">
                  <AdminBadge label={submission.status} tone={getSubmissionStatusTone(submission.status)} />
                </div>
              </div>

              <div className="grid gap-3 text-xs text-grey-600 md:grid-cols-2">
                <div className="space-y-2">
                  <p className="inline-flex items-center gap-1"><User className="h-3.5 w-3.5" /> AUTHOR</p>
                  <p className="text-grey-700">{submission.author}</p>
                  <p>{submission.authorEmail ?? '—'}</p>
                  <p className="inline-flex items-center gap-1"><CalendarDays className="h-3.5 w-3.5" /> SUBMITTED</p>
                  <p className="text-grey-700">{submission.date}, 2025</p>
                </div>
                <div className="space-y-2">
                  <p>DEPARTMENT</p>
                  <p className="text-grey-700">{submission.department}</p>
                  <p>PROGRAM</p>
                  <p className="text-grey-700">{submission.program ?? '—'}</p>
                  <p>THESIS ADVISOR</p>
                  <p className="text-grey-700">{submission.thesisAdvisor ?? '—'}</p>
                </div>
              </div>

              <div className="space-y-2 border-t border-grey-200 pt-3">
                <p className="text-xs uppercase text-grey-500">Abstract</p>
                <p className="text-sm leading-6 text-grey-700">{submission.abstract ?? 'No abstract provided.'}</p>
              </div>

              <div className="space-y-2 border-t border-grey-200 pt-3">
                <p className="text-xs uppercase text-grey-500">Keywords</p>
                <div className="flex flex-wrap gap-2">
                  {(submission.keywords ?? []).map((keyword) => (
                    <span key={keyword} className="rounded-full border border-grey-200 bg-grey-50 px-2 py-1 text-[11px] text-grey-600">
                      {keyword}
                    </span>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border border-grey-200 shadow-none">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-navy">Document Preview</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex min-h-[360px] items-center justify-center rounded-md border border-grey-200 bg-white text-sm text-grey-400">
                PDF preview placeholder
              </div>
              <div className="flex items-center justify-between">
                <p className="text-xs text-grey-500">Page 1 / {submission.pageCount ?? 1}</p>
                <Button className="h-8 px-3 text-xs">
                  <Download className="mr-1 h-3.5 w-3.5" />
                  Download PDF
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        <aside className="space-y-3">
          <Card className="border border-grey-200 shadow-none">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-navy">Review Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button className="h-9 w-full bg-green-600 text-white hover:bg-green-700" onClick={() => setActiveAction('approve')}>
                ✓ Approve
              </Button>
              <Button className="h-9 w-full bg-violet-600 text-white hover:bg-violet-700" onClick={() => setActiveAction('revise')}>
                ↺ Request Revision
              </Button>
              <Button className="h-9 w-full bg-red-600 text-white hover:bg-red-700" onClick={() => setActiveAction('reject')}>
                ✕ Reject
              </Button>
            </CardContent>
          </Card>

          <Card className="border border-grey-200 shadow-none">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-navy">Admin Notes</CardTitle>
            </CardHeader>
            <CardContent>
              <Input
                value={adminNotes}
                onChange={(event) => setAdminNotes(event.target.value)}
                placeholder="Internal notes for admin team..."
                className="h-10"
              />
            </CardContent>
          </Card>

          <Card className="border border-grey-200 shadow-none">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-navy">Review History</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-xs text-grey-600">
              {reviewHistory.map((item) => (
                <div key={item.id} className="rounded-md border border-grey-200 p-2">
                  <p className="font-medium text-grey-700">{item.type.replace('-', ' ')}</p>
                  <p>{item.at}</p>
                  <p>by {item.by}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </aside>
      </section>

      {activeAction ? (
        <ReviewActionDialog
          action={activeAction}
          onClose={() => setActiveAction(null)}
          onConfirm={(payload) => {
            const session = getAdminSession()
            const actorName = session?.name ?? 'Admin Reviewer'

            adminRepository.reviewSubmission(submission.id, activeAction, actorName, {
              ...payload,
              adminNotes,
            })
            setActiveAction(null)
            router.push('/admin/submissions')
          }}
        />
      ) : null}
    </div>
  )
}
