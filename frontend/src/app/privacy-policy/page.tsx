import { CICSFooter, CICSHeader, SecondaryNav, Sidebar } from '@/components/layout'

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-bg-grey flex flex-col">
      <CICSHeader />
      <SecondaryNav title="Privacy Policy" breadcrumbItems={[{ label: 'Home', href: '/' }, { label: 'Privacy Policy' }]} />

      <div className="flex flex-1 px-8 lg:px-[300px] gap-6">
        <Sidebar />
        <main className="flex-1 min-w-0 pt-7 pb-8">
          <h1 className="font-heading text-[30px] text-[#555] mb-4">Privacy Policy</h1>
          <p className="font-body text-[14px] leading-[26px] text-[#555]">
            The repository stores only the minimum personal metadata required for scholarly attribution, submission workflows, and administrative review. Data is processed in accordance with institutional data governance and applicable privacy standards.
          </p>
        </main>
      </div>

      <CICSFooter />
    </div>
  )
}