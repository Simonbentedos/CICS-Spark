"use client"

import { useEffect, useState } from 'react'
import { CICSFooter, CICSHeader, SecondaryNav, Sidebar } from '@/components/layout'
import { listDocuments } from '@/lib/api/documents'

const LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('')

// Normalise an author string to "Last, First" for sorting
function normaliseName(name: string): string {
  const parts = name.trim().split(/\s+/)
  if (parts.length === 1) return name
  const last = parts[parts.length - 1]
  const rest = parts.slice(0, -1).join(' ')
  return `${last}, ${rest}`
}

function getFirstLetter(name: string): string {
  const normalised = normaliseName(name)
  return normalised.charAt(0).toUpperCase()
}

export default function AuthorsPage() {
  const [authorGroups, setAuthorGroups] = useState<Record<string, string[]>>({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    listDocuments({ limit: 500 })
      .then(({ data }) => {
        const seen = new Set<string>()
        const groups: Record<string, string[]> = {}

        for (const letter of LETTERS) {
          groups[letter] = []
        }

        for (const doc of data) {
          const authors: string[] = Array.isArray(doc.authors)
            ? doc.authors
            : typeof doc.authors === 'string'
            ? [doc.authors]
            : []

          for (const author of authors) {
            const clean = author.trim()
            if (!clean || seen.has(clean)) continue
            seen.add(clean)
            const letter = getFirstLetter(clean)
            if (groups[letter]) {
              groups[letter].push(normaliseName(clean))
            }
          }
        }

        // Sort each letter's list alphabetically
        for (const letter of LETTERS) {
          groups[letter].sort()
        }

        setAuthorGroups(groups)
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="min-h-screen bg-bg-grey flex flex-col">
      <CICSHeader />

      <SecondaryNav
        title="Author"
        breadcrumbItems={[
          { label: 'Home', href: '/' },
          { label: 'Authors' },
        ]}
      />

      <div className="flex flex-1 px-8 lg:px-[300px] gap-6">
        <Sidebar />

        <main className="flex-1 min-w-0 pt-7 pb-8">
          <p className="font-body text-[14px] leading-[24px] text-[#555] mb-4">
            Listing of authors who have works in the repository. Click the name of an author to see a listing of that person&apos;s work.
          </p>

          <div className="relative border-b border-[#d6d4d4] pb-[11px] mb-5">
            <h1 className="font-heading text-[32px] leading-[30px] text-[#555]">Browse by Author</h1>
            <div className="absolute left-0 bottom-[-1px] h-[3px] w-[95px] bg-[#f3aa2c] rounded-tr-[5px] rounded-br-[5px]" />
          </div>

          {loading ? (
            <p className="text-sm text-[#888888]">Loading authors…</p>
          ) : (
            <>
              <div className="flex flex-wrap gap-x-2 gap-y-1 mb-6">
                {LETTERS.map((letter) => (
                  <a key={letter} href={`#author-${letter}`} className="font-body text-[20px] leading-none text-cics-maroon hover:underline no-underline">
                    {letter}
                  </a>
                ))}
              </div>

              <div className="space-y-6">
                {LETTERS.map((letter) => {
                  const names = authorGroups[letter] ?? []
                  if (names.length === 0) return null

                  return (
                    <section key={letter} id={`author-${letter}`} className="scroll-mt-24">
                      <h2 className="font-heading text-[36px] text-cics-maroon leading-none mb-2">{letter}</h2>
                      <div className="flex flex-col gap-1">
                        {names.map((name) => (
                          <a
                            key={name}
                            href={`/search?q=${encodeURIComponent(name.replace(/,\s*/, ' ').trim())}`}
                            className="font-body text-[15px] text-cics-maroon hover:underline w-fit"
                          >
                            {name}
                          </a>
                        ))}
                      </div>
                    </section>
                  )
                })}
              </div>
            </>
          )}
        </main>
      </div>

      <CICSFooter />
    </div>
  )
}
