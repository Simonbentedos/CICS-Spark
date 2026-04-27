import Link from 'next/link'

export default function StudentSubmissionConfirmationPage() {
  return (
    <div className="mx-auto max-w-[780px] space-y-4 pt-4">
      <section>
        <h1 className="text-[36px] font-semibold leading-tight text-navy">Successfully Submitted</h1>
        <div className="mt-2 h-[2px] w-full bg-[#0f766e]" />
      </section>

      <section className="space-y-3 text-sm leading-6 text-grey-700">
        <p className="font-semibold">Your material was submitted successfully.</p>
        <p>The department admin will review your file and metadata. You will receive a status update after approval, rejection, or revision request.</p>
      </section>

      <Link href="/student/dashboard" className="inline-flex rounded-md bg-[#0f766e] px-4 py-2 text-sm text-white no-underline hover:text-white">
        Return to Dashboard
      </Link>
    </div>
  )
}