import { CICSFooter, CICSHeader, SecondaryNav, Sidebar } from '@/components/layout'

const steps = [
  'Use the sidebar search or browse pages to locate thesis and capstone materials.',
  'Open a department, then select a specialization track before reviewing item-level records.',
  'Use Advanced Search to filter by title, author, keywords, and date range.',
  'Access item pages for metadata, abstract, and citation details.',
]

export default function UserGuidePage() {
  return (
    <div className="min-h-screen bg-bg-grey flex flex-col">
      <CICSHeader />
      <SecondaryNav title="User Guide" breadcrumbItems={[{ label: 'Home', href: '/' }, { label: 'User Guide' }]} />

      <div className="flex flex-1 px-8 lg:px-[300px] gap-6">
        <Sidebar />
        <main className="flex-1 min-w-0 pt-7 pb-8">
          <h1 className="font-heading text-[30px] text-[#555] mb-4">Repository User Guide</h1>
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