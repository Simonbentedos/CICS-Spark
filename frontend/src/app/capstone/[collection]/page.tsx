import { notFound } from 'next/navigation'
import Link from 'next/link'
import { CICSHeader, CICSFooter, SecondaryNav, Sidebar } from '@/components/layout'
import { capstoneCollections, getCapstoneTracksByCollection } from '@/lib/utils/capstone-data'

export const dynamicParams = false

export function generateStaticParams() {
  return capstoneCollections.map((collection) => ({
    collection: collection.slug,
  }))
}

interface CapstoneDepartmentPageProps {
  params: Promise<{ collection: string }>
}

export default async function CapstoneDepartmentPage({ params }: Readonly<CapstoneDepartmentPageProps>) {
  const { collection: collectionSlug } = await params
  const collection = capstoneCollections.find((item) => item.slug === collectionSlug)

  if (!collection) {
    notFound()
  }

  const tracks = getCapstoneTracksByCollection(collection.slug)

  return (
    <div className="min-h-screen bg-bg-grey flex flex-col">
      <CICSHeader />

      <SecondaryNav
        title={collection.title.toUpperCase()}
        breadcrumbItems={[
          { label: 'Home', href: '/' },
          { label: 'Capstone', href: '/capstone' },
          { label: collection.title },
        ]}
      />

      <div className="flex flex-1 px-8 lg:px-[300px] gap-6">
        <Sidebar />

        <main className="flex-1 min-w-0 pt-7 pb-5">
          <p className="font-body text-[14px] leading-[30px] text-[#555] mb-3">
            Select a specialization track to view available capstone materials.
          </p>

          <div className="relative border-b border-[#d6d4d4] pb-[11px] mb-5">
            <h1 className="font-heading text-[21px] leading-[30px] text-[#555]">
              Specialization Tracks
            </h1>
            <div className="absolute left-0 bottom-[-1px] h-[3px] w-[145px] bg-[#f3aa2c] rounded-tr-[5px] rounded-br-[5px]" />
          </div>

          <div className="flex flex-col gap-5">
            {tracks.map((track) => (
              <section key={track.slug} className="flex flex-col">
                <Link
                  href={`/capstone/${collection.slug}/${track.slug}`}
                  className="font-body text-[16px] leading-[30px] text-[#337ab7] hover:underline w-fit"
                >
                  {track.title} ({track.count})
                </Link>
                <p className="font-body text-[14px] leading-[20px] text-[#555]">{track.description}</p>
              </section>
            ))}
          </div>
        </main>
      </div>

      <CICSFooter />
    </div>
  )
}