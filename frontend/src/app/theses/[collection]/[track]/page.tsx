"use client"

import { use, useEffect, useState } from 'react'
import { notFound } from 'next/navigation'
import { CICSHeader, CICSFooter, SecondaryNav, Sidebar } from '@/components/layout'
import { CollectionHeading, ThesisListItem } from '@/components/thesis'
import { thesisCollections, getThesisTracksByCollection, type ThesisEntry } from '@/lib/utils/theses-data'
import { listDocuments } from '@/lib/api/documents'
import { apiDocToEntry } from '@/lib/utils/api-adapters'

const COLLECTION_TO_DEPT: Record<string, string> = {
  'department-of-computer-science': 'CS',
}

interface ThesisTrackPageProps {
  params: Promise<{ collection: string; track: string }>
}

export default function ThesisTrackPage({ params: paramsPromise }: Readonly<ThesisTrackPageProps>) {
  const params = use(paramsPromise)
  const collection = thesisCollections.find((c) => c.slug === params.collection)
  const track = collection ? getThesisTracksByCollection(collection.slug).find((t) => t.slug === params.track) : undefined

  const [entries, setEntries] = useState<ThesisEntry[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!collection || !track) return
    const dept = COLLECTION_TO_DEPT[params.collection]
    listDocuments({ department: dept, type: 'thesis', track: track.title, limit: 100 })
      .then(({ data }) => setEntries(data.map(apiDocToEntry)))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [params.collection, params.track])

  if (!collection || !track) {
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

            {loading ? (
              <p className="text-sm text-[#888888]">Loading…</p>
            ) : entries.length === 0 ? (
              <p className="text-sm text-[#888888]">No published theses in this track yet.</p>
            ) : (
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
            )}
          </div>
        </main>
      </div>

      <CICSFooter />
    </div>
  )
}
