import { CICSHeader, CICSFooter, SecondaryNav, Sidebar } from '@/components/layout'
import Link from 'next/link'
import { thesisCollections } from '@/lib/utils/theses-data'

export default function ThesesPage() {
  return (
    <div className="min-h-screen bg-bg-grey flex flex-col">
      <CICSHeader />

      <SecondaryNav
        title="Thesis"
        breadcrumbItems={[
          { label: 'Home', href: '/' },
          { label: 'Thesis' },
        ]}
      />

      <div className="flex flex-1 px-8 lg:px-[300px] gap-6">
        <Sidebar />

        <main className="flex-1 min-w-0 pt-7 pb-5">
          <p className="font-body text-[14px] leading-[30px] text-[#555] mb-3">
            Theses submitted by students from the different colleges
          </p>

          <div className="relative border-b border-[#d6d4d4] pb-[11px] mb-5">
            <h1 className="font-heading text-[21px] leading-[30px] text-[#555]">
              Collections under this Category
            </h1>
            <div className="absolute left-0 bottom-[-1px] h-[3px] w-[100px] bg-[#f3aa2c] rounded-tr-[5px] rounded-br-[5px]" />
          </div>

          <div className="flex flex-col gap-5">
            {thesisCollections.map((collection) => (
              <section key={collection.title} className="flex flex-col">
                <Link
                  href={`/theses/${collection.slug}`}
                  className="font-body text-[16px] leading-[30px] text-[#337ab7] hover:underline w-fit"
                >
                  {collection.title} ({collection.count})
                </Link>
                <p className="font-body text-[14px] leading-[20px] text-[#555]">
                  {collection.description}
                </p>
              </section>
            ))}
          </div>
        </main>
      </div>

      <CICSFooter />
    </div>
  )
}
