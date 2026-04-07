import { CICSFooter, CICSHeader, SecondaryNav, Sidebar } from '@/components/layout'

const steps = [
  'Sign in using your student account.',
  'Open the Student Submission Portal and start a new upload.',
  'Complete basic information, academic details, and file upload sections.',
  'Review all metadata and submit for admin approval workflow.',
]

export default function HowToSubmitPage() {
  return (
    <div className="min-h-screen bg-bg-grey flex flex-col">
      <CICSHeader />
      <SecondaryNav title="How to Submit ETs" breadcrumbItems={[{ label: 'Home', href: '/' }, { label: 'How to Submit ETs' }]} />

      <div className="flex flex-1 px-8 lg:px-[300px] gap-6">
        <Sidebar />
        <main className="flex-1 min-w-0 pt-7 pb-8">
          <h1 className="font-heading text-[30px] text-[#555] mb-4">Steps in Submitting ETs</h1>
          <ol className="list-decimal pl-5 space-y-2">
            {steps.map((step) => (
              <li key={step} className="font-body text-[14px] leading-[26px] text-[#555]">{step}</li>
            ))}
          </ol>
        </main>
      </div>

      <CICSFooter />
    </div>
  )
}
