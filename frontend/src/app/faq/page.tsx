import { CICSFooter, CICSHeader, SecondaryNav, Sidebar } from '@/components/layout'
import FaqContent from '@/components/faq/FaqContent'

export default function FaqPage() {
  return (
    <div className="min-h-screen bg-bg-grey flex flex-col">
      <CICSHeader />

      <SecondaryNav
        title="FREQUENTLY ASKED QUESTIONS"
        breadcrumbItems={[
          { label: 'Home', href: '/' },
          { label: 'Frequently Asked Questions' },
        ]}
      />

      <div className="flex flex-1 px-8 lg:px-[300px] gap-6">
        <Sidebar />

        <main className="flex-1 min-w-0 pt-7 pb-5">
          <FaqContent />
        </main>
      </div>

      <CICSFooter />
    </div>
  )
}
