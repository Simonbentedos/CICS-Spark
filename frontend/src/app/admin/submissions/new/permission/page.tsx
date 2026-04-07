"use client"

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { CircleCheck, CircleX } from 'lucide-react'
import { Button } from '@/components/ui'
import { adminRepository } from '@/lib/admin/admin-repository'
import { ADMIN_PERMISSION_STATEMENT } from '@/lib/utils'

export default function NewThesisPermissionPage() {
  const router = useRouter()

  function handleAccept() {
    adminRepository.clearSubmissionDraft()
    router.push('/admin/submissions/new/basic-info')
  }

  return (
    <div className="mx-auto max-w-[780px] space-y-6 pt-4">
      <section>
        <h1 className="text-[36px] font-semibold leading-tight text-navy">{ADMIN_PERMISSION_STATEMENT.title}</h1>
        <div className="mt-2 h-[2px] w-full bg-cics-red" />
      </section>

      <section className="space-y-4 text-sm leading-6 text-grey-700">
        <p>{ADMIN_PERMISSION_STATEMENT.intro}</p>

        <ul className="list-disc space-y-1 pl-6">
          {ADMIN_PERMISSION_STATEMENT.bullets.map((bullet) => (
            <li key={bullet}>{bullet}</li>
          ))}
        </ul>
      </section>

      <div className="flex items-center justify-center gap-6 pt-6">
        <Button asChild className="h-10 min-w-44">
          <Link href="/admin/submissions" className="no-underline">
            <CircleX className="mr-1.5 h-4 w-4" />
            I Decline
          </Link>
        </Button>

        <Button className="h-10 min-w-44" onClick={handleAccept}>
            <CircleCheck className="mr-1.5 h-4 w-4" />
            I Accept
        </Button>
      </div>
    </div>
  )
}
