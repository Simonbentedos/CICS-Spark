import { CICSFooter, CICSHeader, SecondaryNav, Sidebar } from '@/components/layout'

export default function AcceptableUsePolicyPage() {
  return (
    <div className="min-h-screen bg-bg-grey flex flex-col">
      <CICSHeader />
      <SecondaryNav title="Acceptable Use Policy" breadcrumbItems={[{ label: 'Home', href: '/' }, { label: 'Acceptable Use Policy' }]} />

      <div className="flex flex-1 px-8 lg:px-[300px] gap-6">
        <Sidebar />
        <main className="flex-1 min-w-0 pt-7 pb-8">
          <h1 className="font-heading text-[30px] text-[#555] mb-4">Acceptable Use Policy</h1>
          <p className="font-body text-[14px] leading-[26px] text-[#555]">
            Users must access repository materials for academic, research, and educational purposes only. Unauthorized redistribution, tampering, scraping abuse, and misuse of account credentials are prohibited.
          </p>
        </main>
      </div>

      <CICSFooter />
    </div>
  )
}