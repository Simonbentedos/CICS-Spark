"use client"

import { useRouter } from 'next/navigation'
import { CircleCheck } from 'lucide-react'
import { Button } from '@/components/ui'
import { adminRepository } from '@/lib/admin/admin-repository'

const STUDENT_PERMISSION_STATEMENT = {
  title: 'Student Submission Agreement',
  intro: 'By uploading this material, you confirm it is your academic work or that you have proper authority to submit it. You grant the university repository permission to store, review, and publish approved records according to repository policy.',
  bullets: [
    'Your submission will be reviewed by the department admin before publication.',
    'You may be asked to revise metadata, abstract, or file formatting.',
    'Only approved submissions are published to the public repository.',
  ],
}

export default function StudentSubmissionPermissionPage() {
  const router = useRouter()

  function handleAccept() {
    adminRepository.clearSubmissionDraft()
    router.push('/student/submissions/new/basic-info')
  }

  return (
    <div className="mx-auto max-w-[780px] space-y-6 pt-4">
      <section>
        <h1 className="text-[36px] font-semibold leading-tight text-navy">{STUDENT_PERMISSION_STATEMENT.title}</h1>
        <div className="mt-2 h-[2px] w-full bg-[#0f766e]" />
      </section>

      <section className="space-y-4 text-sm leading-6 text-grey-700">
        <p>{STUDENT_PERMISSION_STATEMENT.intro}</p>
        <ul className="list-disc space-y-1 pl-6">
          {STUDENT_PERMISSION_STATEMENT.bullets.map((bullet) => (
            <li key={bullet}>{bullet}</li>
          ))}
        </ul>
      </section>

      <div className="flex items-center justify-center pt-6">
        <Button className="h-10 min-w-44 bg-[#0f766e] hover:bg-[#0f766e]" onClick={handleAccept}>
          <CircleCheck className="mr-1.5 h-4 w-4" />
          I Accept
        </Button>
      </div>
    </div>
  )
}