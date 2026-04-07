import { notFound } from 'next/navigation'
import { CICSHeader, CICSFooter, SecondaryNav, Sidebar } from '@/components/layout'
import { ThesisDetailView } from '@/components/thesis'
import {
  capstoneCollections,
  getCapstoneEntry,
  getCapstoneTracksByCollection,
  listCapstonesByTrack,
} from '@/lib/utils/capstone-data'

export const dynamicParams = false

export function generateStaticParams() {
  return capstoneCollections.flatMap((collection) =>
    getCapstoneTracksByCollection(collection.slug).flatMap((track) =>
      listCapstonesByTrack(collection.slug, track.slug).map((entry) => ({
        collection: collection.slug,
        track: track.slug,
        item: entry.slug,
      }))
    )
  )
}

interface CapstoneItemPageProps {
  params: {
    collection: string
    track: string
    item: string
  }
}

export default function CapstoneItemPage({ params }: Readonly<CapstoneItemPageProps>) {
  const collection = capstoneCollections.find((item) => item.slug === params.collection)

  if (!collection) {
    notFound()
  }

  const track = getCapstoneTracksByCollection(collection.slug).find((item) => item.slug === params.track)

  if (!track) {
    notFound()
  }

  const entry = getCapstoneEntry(collection.slug, track.slug, params.item)

  if (!entry) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-bg-grey flex flex-col">
      <CICSHeader />

      <SecondaryNav
        title={collection.title.toUpperCase()}
        breadcrumbItems={[
          { label: 'Home', href: '/' },
          { label: 'Capstone', href: '/capstone' },
          { label: collection.title, href: `/capstone/${collection.slug}` },
          { label: track.title, href: `/capstone/${collection.slug}/${track.slug}` },
          { label: 'Item Result' },
        ]}
      />

      <div className="flex flex-1 px-8 lg:px-[300px] gap-6">
        <Sidebar />

        <main className="flex-1 min-w-0 pt-7 pb-5">
          <ThesisDetailView collectionTitle={`${collection.title} - ${track.title}`} entry={entry} />
        </main>
      </div>

      <CICSFooter />
    </div>
  )
}