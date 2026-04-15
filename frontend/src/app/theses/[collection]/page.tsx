'use client'

import { notFound } from 'next/navigation'
import Link from 'next/link'
import { CICSHeader, CICSFooter, SecondaryNav, Sidebar } from '@/components/layout'
import { getThesisTracksByCollection, thesisCollections } from '@/lib/utils/theses-data'
import { useEffect, useState } from 'react'
import { getDocumentCounts } from '@/lib/api/documents'

type TrackWithCount = {
  slug: string
  title: string
  description: string
  count: number
}

interface CollectionPageProps {
  params: Promise<{ collection: string }>
}

export default function CollectionPage({ params }: Readonly<CollectionPageProps>) {
  const [collectionSlug, setCollectionSlug] = useState<string | null>(null)
  const [tracks, setTracks] = useState<TrackWithCount[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    params.then(({ collection }) => {
      setCollectionSlug(collection)
    })
  }, [params])

  useEffect(() => {
    if (!collectionSlug) return

    const collection = thesisCollections.find((item) => item.slug === collectionSlug)
    if (!collection) {
      notFound()
      return
    }

    async function fetchTrackCounts() {
      try {
        const baseTracks = getThesisTracksByCollection(collectionSlug!)
        
        // Map collection slug to department code
        const departmentMap: Record<string, string> = {
          'department-of-computer-science': 'CS',
        }
        const department = departmentMap[collectionSlug!]

        if (!department) {
          setTracks(baseTracks.map(t => ({ ...t, count: 0 })))
          setLoading(false)
          return
        }

        const tracksWithCounts = await Promise.all(
          baseTracks.map(async (track) => {
            const { total } = await getDocumentCounts({
              department,
              type: 'thesis',
              track: track.title,
            })

            return {
              ...track,
              count: total,
            }
          })
        )

        setTracks(tracksWithCounts)
      } catch (error) {
        console.error('Failed to fetch track counts:', error)
        setTracks(getThesisTracksByCollection(collectionSlug!).map(t => ({ ...t, count: 0 })))
      } finally {
        setLoading(false)
      }
    }

    fetchTrackCounts()
  }, [collectionSlug])

  if (!collectionSlug) {
    return null
  }

  const collection = thesisCollections.find((item) => item.slug === collectionSlug)
  if (!collection) {
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
          { label: collection.title },
        ]}
      />

      <div className="flex flex-1 px-8 lg:px-[300px] gap-6">
        <Sidebar />

        <main className="flex-1 min-w-0 pt-7 pb-5">
          <p className="font-body text-[14px] leading-[30px] text-[#555] mb-3">
            Select a specialization track to view available thesis materials.
          </p>

          <div className="relative border-b border-[#d6d4d4] pb-[11px] mb-5">
            <h1 className="font-heading text-[21px] leading-[30px] text-[#555]">
              Specialization Tracks
            </h1>
            <div className="absolute left-0 bottom-[-1px] h-[3px] w-[145px] bg-[#f3aa2c] rounded-tr-[5px] rounded-br-[5px]" />
          </div>

          {loading ? (
            <p className="font-body text-[14px] text-[#555]">Loading tracks...</p>
          ) : (
            <div className="flex flex-col gap-5">
              {tracks.map((track) => (
                <section key={track.slug} className="flex flex-col">
                  <Link
                    href={`/theses/${collection.slug}/${track.slug}`}
                    className="font-body text-[16px] leading-[30px] text-[#337ab7] hover:underline w-fit"
                  >
                    {track.title} ({track.count})
                  </Link>
                  <p className="font-body text-[14px] leading-[20px] text-[#555]">
                    {track.description}
                  </p>
                </section>
              ))}
            </div>
          )}
        </main>
      </div>

      <CICSFooter />
    </div>
  )
}