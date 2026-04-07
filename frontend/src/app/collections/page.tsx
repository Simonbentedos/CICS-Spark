import Link from 'next/link'
import { CICSFooter, CICSHeader, SecondaryNav, Sidebar } from '@/components/layout'

export default function CollectionsPage() {
  return (
    <div className="min-h-screen bg-bg-grey flex flex-col">
      <CICSHeader />

      <SecondaryNav
        title="Collections"
        breadcrumbItems={[
          { label: 'Home', href: '/' },
          { label: 'Collections' },
        ]}
      />

      <div className="flex flex-1 px-8 lg:px-[300px] gap-6">
        <Sidebar />

        <main className="flex-1 min-w-0 pt-7 pb-8">
          <p className="font-body text-[14px] leading-[30px] text-[#555] mb-3">
            Browse available repository collections and specialization-track groupings.
          </p>

          <div className="relative border-b border-[#d6d4d4] pb-[11px] mb-5">
            <h1 className="font-heading text-[30px] leading-[30px] text-[#555]">Browse by Collections</h1>
            <div className="absolute left-0 bottom-[-1px] h-[3px] w-[120px] bg-cics-maroon rounded-tr-[5px] rounded-br-[5px]" />
          </div>

          <div className="flex flex-col gap-5 pt-2">
            <section>
              <h2 className="font-heading text-[22px] text-[#555] mb-2">Departments</h2>
              <div className="flex flex-col gap-1">
                <Link href="/theses" className="font-body text-[16px] text-[#337ab7] hover:underline w-fit">Thesis Departments</Link>
                <Link href="/capstone" className="font-body text-[16px] text-[#337ab7] hover:underline w-fit">Capstone Departments</Link>
              </div>
            </section>

            <section>
              <h2 className="font-heading text-[22px] text-[#555] mb-2">Specialization Tracks</h2>
              <div className="flex flex-col gap-1">
                <Link href="/theses/department-of-computer-science" className="font-body text-[16px] text-[#337ab7] hover:underline w-fit">Computer Science Tracks</Link>
                <Link href="/capstone/department-of-information-technology" className="font-body text-[16px] text-[#337ab7] hover:underline w-fit">Information Technology Tracks</Link>
                <Link href="/capstone/department-of-information-systems" className="font-body text-[16px] text-[#337ab7] hover:underline w-fit">Information Systems Tracks</Link>
              </div>
            </section>
          </div>
        </main>
      </div>

      <CICSFooter />
    </div>
  )
}