import { CICSFooter, CICSHeader, SecondaryNav, Sidebar } from '@/components/layout'

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-bg-grey flex flex-col">
      <CICSHeader />
      <SecondaryNav title="Contact" breadcrumbItems={[{ label: 'Home', href: '/' }, { label: 'Contact' }]} />

      <div className="flex flex-1 px-8 lg:px-[300px] gap-6">
        <Sidebar />
        <main className="flex-1 min-w-0 pt-7 pb-8">
          <h1 className="font-heading text-[30px] text-[#555] mb-3">Contact Repository Support</h1>
          <p className="font-body text-[14px] text-[#555] mb-5">For account, submission, and metadata concerns, use the channels below.</p>
          <div className="space-y-2 font-body text-[14px] text-[#555]">
            <p>Email: cics.sparkrepository@gmail.com</p>
            <p>Office: 2/F Saint Pier Giorgio Frassati, O.P. Building</p>
            <p>Hours: Monday to Friday, 8:00 AM - 5:00 PM</p>
          </div>
        </main>
      </div>

      <CICSFooter />
    </div>
  )
}
