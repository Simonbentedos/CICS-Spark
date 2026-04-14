"use client"

import { use, useEffect, useState } from 'react'
import { ArrowLeft, CalendarDays, Download, User } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button, Card, CardContent, CardHeader, CardTitle } from '@/components/ui'
import AdminBadge from '@/components/admin/AdminBadge'
import ReviewActionDialog from '@/components/admin/ReviewActionDialog'
import {
  getAdminSubmissionById,
  reviewSubmission,
  downloadAbstractUrl,
  type ApiDocument,
  type ApiReview,
} from '@/lib/api/documents'
import { getSubmissionStatusTone } from '@/lib/utils'
import type { ReviewActionType } from '@/types/admin'

const STATUS_LABEL: Record<string, string> = {
  pending: 'Pending Review',
  approved: 'Approved',
  rejected: 'Rejected',
  revision: 'Revision Requested',
}

export default function SuperAdminSubmissionReviewPage({
  params: paramsPromise,
}: Readonly<{ params: Promise<{ submissionId: string }> }>) {
  const params = use(paramsPromise)
  const router = useRouter()
  const [submission, setSubmission] = useState<ApiDocument | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeAction, setActiveAction] = useState<ReviewActionType | null>(null)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    getAdminSubmissionById(params.submissionId)
      .then(setSubmission)
      .catch((err) => setError(err.message ?? 'Submission not found'))
      .finally(() => setLoading(false))
  }, [params.submissionId])

  if (loading) {
    return <p className="px-4 py-10 text-sm text-grey-500">Loading submission…</p>
  }

  if (error || !submission) {
    return (
      <div className="space-y-3">
        <h1 className="text-[28px] font-semibold text-navy">Submission not found</h1>
        <p className="text-sm text-red-600">{error}</p>
        <Link href="/superadmin/submissions" className="text-sm text-cics-maroon no-underline hover:underline">
          Return to Submissions
        </Link>
      </div>
    )
  }

  const reviews: ApiReview[] = (submission.reviews as ApiReview[]) ?? []
  const statusLabel = STATUS_LABEL[submission.status] ?? submission.status

  async function handleReview(payload: { comment?: string; issues?: string[] }) {
    if (!activeAction) return
    setSubmitting(true)
    try {
      const feedback = [payload.comment, ...(payload.issues ?? [])].filter(Boolean).join('\n')
      await reviewSubmission(submission!.id, activeAction, feedback || undefined)
      router.push('/superadmin/submissions')
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Review failed. Please try again.')
    } finally {
      setSubmitting(false)
      setActiveAction(null)
    }
  }

  return (
    <div className="space-y-4">
      <header className="space-y-1">
        <Link href="/superadmin/submissions" className="inline-flex items-center gap-1 text-xs text-grey-600 no-underline hover:text-cics-maroon">
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to Submissions
        </Link>
        <h1 className="text-[32px] font-semibold leading-tight text-navy">Review Submission</h1>
        <p className="text-sm text-grey-500">Review and process this submission</p>
      </header>

      <section className="grid gap-4 xl:grid-cols-[1fr_320px]">
        <div className="space-y-4">
          <Card className="border border-grey-200 shadow-none">
            <CardContent className="space-y-4 p-4">
              <div>
                <h2 className="text-sm font-medium text-grey-700">{submission.title}</h2>
                <div className="mt-1">
                  <AdminBadge label={statusLabel} tone={getSubmissionStatusTone(statusLabel as any)} />
                </div>
              </div>

              <div className="grid gap-3 text-xs text-grey-600 md:grid-cols-2">
                <div className="space-y-2">
                  <p className="inline-flex items-center gap-1 uppercase"><User className="h-3.5 w-3.5" /> Authors</p>
                  <p className="text-grey-700">{Array.isArray(submission.authors) ? submission.authors.join(', ') : String(submission.authors ?? '')}</p>
                  <p className="inline-flex items-center gap-1 uppercase"><CalendarDays className="h-3.5 w-3.5" /> Submitted</p>
                  <p className="text-grey-700">
                    {new Date(submission.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                  </p>
                </div>
                <div className="space-y-2">
                  <p className="uppercase">Department</p>
                  <p className="text-grey-700">{submission.department}</p>
                  <p className="uppercase">Type</p>
                  <p className="text-grey-700 capitalize">{submission.type}</p>
                  <p className="uppercase">Track</p>
                  <p className="text-grey-700">{submission.track_specialization ?? '—'}</p>
                  <p className="uppercase">Adviser</p>
                  <p className="text-grey-700">{submission.adviser ?? '—'}</p>
                </div>
              </div>

              <div className="space-y-2 border-t border-grey-200 pt-3">
                <p className="text-xs uppercase text-grey-500">Abstract</p>
                <p className="text-sm leading-6 text-grey-700">{submission.abstract ?? 'No abstract provided.'}</p>
              </div>

              {(() => {
                const kws: string[] = Array.isArray(submission.keywords)
                  ? submission.keywords
                  : String(submission.keywords ?? '').split(',').map((k) => k.trim()).filter(Boolean)
                return kws.length > 0 ? (
                  <div className="space-y-2 border-t border-grey-200 pt-3">
                    <p className="text-xs uppercase text-grey-500">Keywords</p>
                    <div className="flex flex-wrap gap-2">
                      {kws.map((keyword) => (
                        <span key={keyword} className="rounded-full border border-grey-200 bg-grey-50 px-2 py-1 text-[11px] text-grey-600">
                          {keyword}
                        </span>
                      ))}
                    </div>
                  </div>
                ) : null
              })()}
            </CardContent>
          </Card>

          <Card className="border border-grey-200 shadow-none">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-navy">Document</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex min-h-[100px] items-center justify-center rounded-md border border-grey-200 bg-white text-sm text-grey-400">
                PDF stored securely — not publicly accessible
              </div>
              <div className="flex items-center justify-between">
                <p className="text-xs text-grey-500">Full-text access is restricted</p>
                <a
                  href={downloadAbstractUrl(submission.id)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 rounded-md border border-grey-200 bg-white px-3 py-1.5 text-xs text-grey-700 hover:bg-grey-50"
                >
                  <Download className="h-3.5 w-3.5" />
                  Download Abstract
                </a>
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
              <Button
                className="h-9 w-full bg-green-600 text-white hover:bg-green-700 disabled:opacity-60"
                onClick={() => setActiveAction('approve')}
                disabled={submitting || submission.status === 'approved'}
              >
                ✓ Approve
              </Button>
              <Button
                className="h-9 w-full bg-violet-600 text-white hover:bg-violet-700 disabled:opacity-60"
                onClick={() => setActiveAction('revise')}
                disabled={submitting || submission.status === 'approved' || submission.status === 'rejected'}
              >
                ↺ Request Revision
              </Button>
              <Button
                className="h-9 w-full bg-red-600 text-white hover:bg-red-700 disabled:opacity-60"
                onClick={() => setActiveAction('reject')}
                disabled={submitting || submission.status === 'rejected' || submission.status === 'approved'}
              >
                ✕ Reject
              </Button>
            </CardContent>
          </Card>

          <Card className="border border-grey-200 shadow-none">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-navy">Review History</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-xs text-grey-600">
              {reviews.length === 0 ? (
                <p className="text-grey-400">No reviews yet.</p>
              ) : (
                reviews.map((review) => (
                  <div key={review.id} className="rounded-md border border-grey-200 p-2 space-y-1">
                    <p className="font-medium text-grey-700 capitalize">{review.decision}d</p>
                    <p>{new Date(review.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                    {review.feedback_text && (
                      <p className="text-grey-500 italic">{review.feedback_text}</p>
                    )}
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </aside>
      </section>

      {activeAction ? (
        <ReviewActionDialog
          action={activeAction}
          onClose={() => setActiveAction(null)}
          onConfirm={handleReview}
        />
      ) : null}
    </div>
  )
}
