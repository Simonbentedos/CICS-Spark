import { notFound } from 'next/navigation'
import { CICSHeader, CICSFooter, SecondaryNav, Sidebar } from '@/components/layout'
import { CollectionHeading, ThesisListItem } from '@/components/thesis'
import {
  getThesisTracksByCollection,
  listThesesByTrack,
  thesisCollections,
} from '@/lib/utils/theses-data'

export const dynamicParams = false

export function generateStaticParams() {
  return thesisCollections.flatMap((collection) =>
    getThesisTracksByCollection(collection.slug).map((track) => ({
      collection: collection.slug,
      track: track.slug,
    }))
  )
}

interface ThesisTrackPageProps {
  params: {
    collection: string
    track: string
  }
}

export default function ThesisTrackPage({ params }: Readonly<ThesisTrackPageProps>) {
  const collection = thesisCollections.find((item) => item.slug === params.collection)

  if (!collection) {
    notFound()
  }

  const track = getThesisTracksByCollection(collection.slug).find((item) => item.slug === params.track)

  if (!track) {
    notFound()
  }

  const entries = listThesesByTrack(collection.slug, track.slug)

  return (
    <div className="min-h-screen bg-bg-grey flex flex-col">
      <CICSHeader />

      <SecondaryNav
        title={collection.title.toUpperCase()}
        breadcrumbItems={[
          { label: 'Home', href: '/' },
          { label: 'Thesis', href: '/theses' },
          { label: collection.title, href: `/theses/${collection.slug}` },
          { label: track.title },
        ]}
      />

      <div className="flex flex-1 px-8 lg:px-[300px] gap-6">
        <Sidebar />

        <main className="flex-1 min-w-0 pt-7 pb-5">
          <div className="max-w-[1029px] pt-4">
            <div className="flex justify-end mb-5">
              <CollectionHeading title={track.title} />
            </div>

            <div className="w-full border-b border-[#dddddd] mb-8" />

            <div className="flex flex-col gap-7">
              {entries.map((entry, index) => (
                <ThesisListItem
                  key={entry.slug}
                  entry={entry}
                  collectionSlug={`${collection.slug}/${track.slug}`}
                  showDivider={index !== entries.length - 1}
                />
              ))}
            </div>
          </div>
        </main>
      </div>

      <CICSFooter />
    </div>
  )
}