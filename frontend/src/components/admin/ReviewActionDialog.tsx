"use client"

import { useMemo, useState } from 'react'
import { Button, Label } from '@/components/ui'
import AdminModal from '@/components/admin/AdminModal'
import {
  REVIEW_APPROVE_CHECKLIST,
  REVIEW_COMMON_ISSUES,
  getReviewActionConfig,
} from '@/lib/utils'
import type { ReviewActionType } from '@/types/admin'

export default function ReviewActionDialog({
  action,
  onClose,
  onConfirm,
}: Readonly<{
  action: ReviewActionType
  onClose: () => void
  onConfirm: (payload: { comment?: string; issues?: string[] }) => void
}>) {
  const config = useMemo(() => getReviewActionConfig(action), [action])
  const [comment, setComment] = useState('')
  const [issues, setIssues] = useState<string[]>([])

  if (!config) {
    return null
  }

  let toneClass = 'border border-violet-200 bg-violet-50 text-violet-700 hover:bg-violet-100'
  if (config.tone === 'green') {
    toneClass = 'border border-green-200 bg-green-50 text-green-700 hover:bg-green-100'
  } else if (config.tone === 'red') {
    toneClass = 'border border-red-200 bg-red-50 text-red-700 hover:bg-red-100'
  }

  function toggleIssue(issue: string) {
    setIssues((current) =>
      current.includes(issue) ? current.filter((item) => item !== issue) : [...current, issue]
    )
  }

  return (
    <AdminModal title={config.title} onClose={onClose} widthClassName="max-w-[500px]">
      {action === 'approve' ? (
        <div className="space-y-4">
          <p className="text-base text-grey-600">This action will:</p>
          <ul className="space-y-2 text-base text-grey-600">
            {REVIEW_APPROVE_CHECKLIST.map((item) => (
              <li key={item} className="flex items-center gap-2">
                <span className="text-green-700">✓</span>
                {item}
              </li>
            ))}
          </ul>
          <div className="flex items-center gap-3 pt-1">
            <Button variant="outline" className="h-10 flex-1" onClick={onClose}>Cancel</Button>
            <Button className={`h-10 flex-1 ${toneClass}`} onClick={() => onConfirm({})}>
              {config.confirmLabel}
            </Button>
          </div>
        </div>
      ) : null}

      {action === 'revise' ? (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label className="text-sm font-medium text-navy">Comments for Student *</Label>
            <textarea
              id="review-revision-comment"
              value={comment}
              onChange={(event) => setComment(event.target.value)}
              placeholder="Please specify what changes are needed..."
              className="min-h-[130px] w-full rounded-[10px] border border-grey-200 px-3 py-2 text-sm text-grey-700 outline-none focus-visible:ring-2 focus-visible:ring-cics-maroon"
            />
          </div>

          <div>
            <p className="mb-2 text-sm text-grey-600">Common Issues:</p>
            <div className="space-y-2">
              {REVIEW_COMMON_ISSUES.map((issue) => (
                <label key={issue} className="flex items-center gap-2 text-sm text-grey-700">
                  <input
                    type="checkbox"
                    checked={issues.includes(issue)}
                    onChange={() => toggleIssue(issue)}
                    className="rounded border-grey-300 accent-cics-maroon focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cics-maroon focus-visible:ring-offset-1"
                  />
                  {issue}
                </label>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button variant="outline" className="h-10 flex-1" onClick={onClose}>Cancel</Button>
            <Button
              className={`h-10 flex-1 ${toneClass}`}
              onClick={() => onConfirm({ comment, issues })}
              disabled={comment.trim().length === 0}
            >
              {config.confirmLabel}
            </Button>
          </div>

        </div>
      ) : null}

      {action === 'reject' ? (
        <div className="space-y-4">
          <p className="text-sm font-medium text-red-700">⚠️ This action cannot be undone</p>
          <div className="space-y-2">
            <Label className="text-sm font-medium text-navy">Reason for Rejection *</Label>
            <textarea
              id="review-rejection-reason"
              value={comment}
              onChange={(event) => setComment(event.target.value)}
              placeholder="Please explain why this thesis is being rejected..."
              className="min-h-[130px] w-full rounded-[10px] border border-grey-200 px-3 py-2 text-sm text-grey-700 outline-none focus-visible:ring-2 focus-visible:ring-red-200"
            />
            <p className="text-xs text-grey-400">This message will be sent to the student.</p>
          </div>

          <div className="flex items-center gap-3">
            <Button variant="outline" className="h-10 flex-1" onClick={onClose}>Cancel</Button>
            <Button
              className={`h-10 flex-1 ${toneClass}`}
              onClick={() => onConfirm({ comment })}
              disabled={comment.trim().length === 0}
            >
              {config.confirmLabel}
            </Button>
          </div>
        </div>
      ) : null}
    </AdminModal>
  )
}
