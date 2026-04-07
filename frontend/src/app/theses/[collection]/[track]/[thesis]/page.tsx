import { notFound } from 'next/navigation'
import { CICSHeader, CICSFooter, SecondaryNav, Sidebar } from '@/components/layout'
import { ThesisDetailView } from '@/components/thesis'
import {
  getThesisEntry,
  getThesisTracksByCollection,
  listThesesByTrack,
  thesisCollections,
} from '@/lib/utils/theses-data'

export const dynamicParams = false

export function generateStaticParams() {
  return thesisCollections.flatMap((collection) =>
    getThesisTracksByCollection(collection.slug).flatMap((track) =>
      listThesesByTrack(collection.slug, track.slug).map((entry) => ({
        collection: collection.slug,
        track: track.slug,
        thesis: entry.slug,
      }))
    )
  )
}

interface ThesisItemPageProps {
  params: {
    collection: string
    track: string
    thesis: string
  }
}

export default function ThesisItemPage({ params }: Readonly<ThesisItemPageProps>) {
  const collection = thesisCollections.find((item) => item.slug === params.collection)

  if (!collection) {
    notFound()
  }

  const track = getThesisTracksByCollection(collection.slug).find((item) => item.slug === params.track)

  if (!track) {
    notFound()
  }

  const entry = getThesisEntry(collection.slug, track.slug, params.thesis)

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
          { label: 'Thesis', href: '/theses' },
          { label: collection.title, href: `/theses/${collection.slug}` },
          { label: track.title, href: `/theses/${collection.slug}/${track.slug}` },
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