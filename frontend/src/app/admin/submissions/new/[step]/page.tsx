"use client"

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { use, useMemo, useState } from 'react'
import { Button } from '@/components/ui'
import SubmissionStepLayout from '@/components/admin/SubmissionStepLayout'
import SubmissionStepContent, { isSubmissionStepKey } from '@/components/admin/SubmissionStepContent'
import { adminRepository } from '@/lib/admin/admin-repository'
import { getAdminSession } from '@/lib/admin/session'
import { getSubmissionStep } from '@/lib/utils'

export default function NewThesisStepPage({ params: paramsPromise }: Readonly<{ params: Promise<{ step: string }> }>) {
  const params = use(paramsPromise)
  const router = useRouter()
  const step = isSubmissionStepKey(params.step) ? getSubmissionStep(params.step) : undefined

  const [draft, setDraft] = useState(() => adminRepository.getSubmissionDraft())

  const canProceed = useMemo(() => {
    if (!step) {
      return false
    }

    if (step.key === 'basic-info') {
      return Boolean(draft.title.trim() && draft.firstName.trim() && draft.lastName.trim() && draft.department.trim())
    }

    if (step.key === 'academic-details') {
      return Boolean(draft.thesisAdvisor.trim() && draft.keywords.trim() && draft.abstract.trim())
    }

    if (step.key === 'file-upload') {
      return Boolean(draft.fileName.trim())
    }

    return Boolean(draft.title.trim())
  }, [draft, step?.key])

  function updateDraft(patch: Partial<typeof draft>) {
    const nextDraft = adminRepository.saveSubmissionDraft(patch)
    setDraft(nextDraft)
  }

  function goBack() {
    if (!step?.backHref) {
      return
    }

    router.push(step.backHref)
  }

  function goNext() {
    if (!canProceed) {
      return
    }

    if (step?.key === 'verify-details') {
      const session = getAdminSession()
      adminRepository.submitSubmissionDraft({
        name: session?.name ?? 'SPARK Admin',
        email: session?.email ?? 'admin@spark.test',
      })
      router.push('/admin/submissions/new/confirmation')
      return
    }

    if (step?.nextHref) {
      router.push(step.nextHref)
    }
  }

  if (!step) {
    return (
      <div className="mx-auto max-w-[760px] space-y-3">
        <h1 className="text-[28px] font-semibold text-navy">Submission step not found</h1>
        <Link href="/admin/submissions/new/permission" className="text-sm text-cics-maroon no-underline hover:text-cics-maroon-600">
          Return to submission start
        </Link>
      </div>
    )
  }

  return (
    <SubmissionStepLayout
      step={step.index}
      sectionTitle={step.sectionTitle}
      footer={
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Button variant="outline" asChild className="h-10">
              <Link href="/admin/submissions" className="no-underline">Cancel</Link>
            </Button>
            {step.backHref ? (
              <Button variant="outline" className="h-10" onClick={goBack}>
                ← Back
              </Button>
            ) : null}
          </div>
          {step.nextLabel ? (
            <Button className="h-10 px-6" onClick={goNext} disabled={!canProceed}>
              {step.nextLabel}
            </Button>
          ) : null}
        </div>
      }
    >
      <SubmissionStepContent step={step} draft={draft} onDraftChange={updateDraft} />
    </SubmissionStepLayout>
  )
}
