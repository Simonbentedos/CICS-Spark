"use client"

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useMemo, useState } from 'react'
import { Button } from '@/components/ui'
import SubmissionStepLayout from '@/components/admin/SubmissionStepLayout'
import SubmissionStepContent, { isSubmissionStepKey } from '@/components/admin/SubmissionStepContent'
import { adminRepository } from '@/lib/admin/admin-repository'
import { getStudentSession } from '@/lib/student/session'
import type { SubmissionStepMeta } from '@/types/admin'

const STUDENT_STEPS: Record<string, SubmissionStepMeta> = {
  'basic-info': {
    key: 'basic-info',
    index: 1,
    label: 'Step 1 of 4',
    sectionTitle: 'BASIC INFORMATION',
    nextLabel: 'Next: Academic Info ->',
    nextHref: '/student/submissions/new/academic-details',
  },
  'academic-details': {
    key: 'academic-details',
    index: 2,
    label: 'Step 2 of 4',
    sectionTitle: 'ACADEMIC DETAILS',
    nextLabel: 'Next: File Upload ->',
    nextHref: '/student/submissions/new/file-upload',
    backHref: '/student/submissions/new/basic-info',
  },
  'file-upload': {
    key: 'file-upload',
    index: 3,
    label: 'Step 3 of 4',
    sectionTitle: 'FILE UPLOAD',
    nextLabel: 'Next: Review ->',
    nextHref: '/student/submissions/new/verify-details',
    backHref: '/student/submissions/new/academic-details',
  },
  'verify-details': {
    key: 'verify-details',
    index: 4,
    label: 'Step 4 of 4',
    sectionTitle: 'VERIFY DETAILS',
    nextLabel: 'Submit for Review ->',
    nextHref: '/student/submissions/new/confirmation',
    backHref: '/student/submissions/new/file-upload',
  },
}

export default function StudentSubmissionStepPage({ params }: Readonly<{ params: { step: string } }>) {
  const router = useRouter()
  const step = isSubmissionStepKey(params.step) ? STUDENT_STEPS[params.step] : undefined
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
    if (step?.backHref) {
      router.push(step.backHref)
    }
  }

  function goNext() {
    if (!canProceed || !step) {
      return
    }

    if (step.key === 'verify-details') {
      const session = getStudentSession()
      const fallbackName = `${draft.firstName} ${draft.lastName}`.trim() || 'Student User'
      adminRepository.submitSubmissionDraft({
        name: session?.name ?? fallbackName,
        email: session?.email ?? 'student@spark.test',
      })
      router.push('/student/submissions/new/confirmation')
      return
    }

    if (step.nextHref) {
      router.push(step.nextHref)
    }
  }

  if (!step) {
    return (
      <div className="mx-auto max-w-[760px] space-y-3">
        <h1 className="text-[28px] font-semibold text-navy">Submission step not found</h1>
        <Link href="/student/submissions/new/permission" className="text-sm text-[#0f766e] no-underline hover:underline">
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
              <Link href="/student/dashboard" className="no-underline">Cancel</Link>
            </Button>
            {step.backHref ? (
              <Button variant="outline" className="h-10" onClick={goBack}>
                {'<-'} Back
              </Button>
            ) : null}
          </div>
          {step.nextLabel ? (
            <Button className="h-10 px-6 bg-[#0f766e] hover:bg-[#0f766e]" onClick={goNext} disabled={!canProceed}>
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
