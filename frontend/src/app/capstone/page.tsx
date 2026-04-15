"use client"

import { useEffect, useState } from 'react'
import { CICSFooter, CICSHeader, SecondaryNav, Sidebar } from '@/components/layout'
import Link from 'next/link'
import { capstoneCollections } from '@/lib/utils/capstone-data'
import { getDocumentCounts } from '@/lib/api/documents'

type CollectionWithCount = {
  slug: string
  title: string
  description: string
  count: number
}

export default function CapstonePage() {
  const [collections, setCollections] = useState<CollectionWithCount[]>(
    capstoneCollections.map(c => ({ ...c, count: 0 }))
  )
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchCounts() {
      const updated = await Promise.all(
        capstoneCollections.map(async (collection) => {
          const deptCode = collection.slug === 'department-of-information-technology' ? 'IT' : 'IS'
          try {
            const { total } = await getDocumentCounts({ department: deptCode, type: 'capstone' })
            return { ...collection, count: total }
          } catch {
            return { ...collection, count: 0 }
          }
        })
      )
      setCollections(updated)
      setLoading(false)
    }
    fetchCounts()
  }, [])

  return (
    <div className="min-h-screen bg-bg-grey flex flex-col">
      <CICSHeader />

      <SecondaryNav
        title="Capstone"
        breadcrumbItems={[
          { label: 'Home', href: '/' },
          { label: 'Capstone' },
        ]}
      />

      <div className="flex flex-1 px-8 lg:px-[300px] gap-6">
        <Sidebar />

        <main className="flex-1 min-w-0 pt-7 pb-5">
          <p className="font-body text-[14px] leading-[30px] text-[#555] mb-3">
            Capstone projects submitted by students from the different departments.
          </p>

          <div className="relative border-b border-[#d6d4d4] pb-[11px] mb-5">
            <h1 className="font-heading text-[21px] leading-[30px] text-[#555]">
              Collections under this Category
            </h1>
            <div className="absolute left-0 bottom-[-1px] h-[3px] w-[100px] bg-[#f3aa2c] rounded-tr-[5px] rounded-br-[5px]" />
          </div>

          {loading ? (
            <p className="text-sm text-grey-500">Loading collections...</p>
          ) : (
            <div className="flex flex-col gap-5">
              {collections.map((collection) => (
                <section key={collection.title} className="flex flex-col">
                  <Link
                    href={`/capstone/${collection.slug}`}
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
          )}
        </main>
      </div>

      <CICSFooter />
    </div>
  )
}