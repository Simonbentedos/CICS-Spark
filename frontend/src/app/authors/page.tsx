"use client"

import { useEffect, useState, useMemo } from 'react'
import Link from 'next/link'
import { CICSFooter, CICSHeader, SecondaryNav, Sidebar } from '@/components/layout'
import { listDocuments, type ApiDocument } from '@/lib/api/documents'

/* ───── Types ───── */

type AuthorInfo = {
  name: string               // display name  "Arielle Mendoza"
  lastName: string           // last word in name, used for sorting
  initials: string           // "AM"
  workCount: number
  lastPublishedDate: string  // ISO date of the most recent document
  lastPublishedLabel: string // "March 2025"
  department: string         // first department found
}

/* ───── Constants ───── */

const PER_PAGE = 25
const DEPARTMENTS = ['All departments', 'CS', 'IT', 'IS'] as const
const SORT_OPTIONS = [
  { value: 'last-name-az', label: 'Last Name (A–Z)' },
  { value: 'last-name-za', label: 'Last Name (Z–A)' },
  { value: 'works-desc',   label: 'Most Works' },
  { value: 'works-asc',    label: 'Fewest Works' },
  { value: 'recent',       label: 'Recently Published' },
] as const

/* ───── Helpers ───── */

/** Safely parse the authors field which may be a JSON string, an array, or a plain string */
function parseAuthors(raw: unknown): string[] {
  if (Array.isArray(raw)) {
    // Could be an already-parsed array of strings, or nested JSON strings
    return raw.flatMap((item) => {
      if (typeof item === 'string') {
        // Try to parse if it looks like JSON array
        const trimmed = item.trim()
        if (trimmed.startsWith('[')) {
          try {
            const parsed = JSON.parse(trimmed)
            if (Array.isArray(parsed)) return parsed.map((s: unknown) => String(s).trim()).filter(Boolean)
          } catch { /* not JSON, treat as plain string */ }
        }
        return [trimmed]
      }
      return [String(item).trim()]
    }).filter(Boolean)
  }
  if (typeof raw === 'string') {
    const trimmed = raw.trim()
    if (trimmed.startsWith('[')) {
      try {
        const parsed = JSON.parse(trimmed)
        if (Array.isArray(parsed)) return parsed.map((s: unknown) => String(s).trim()).filter(Boolean)
      } catch { /* fallback */ }
    }
    // Comma-separated fallback
    return trimmed.split(',').map((s) => s.trim()).filter(Boolean)
  }
  return []
}

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/)
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase()
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase()
}

function getLastName(name: string): string {
  const parts = name.trim().split(/\s+/)
  return parts[parts.length - 1].toLowerCase()
}

function formatDate(iso: string): string {
  const d = new Date(iso)
  return d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
}

function getDeptLabel(dept: string): string {
  const map: Record<string, string> = {
    CS: 'Department of Computer Science',
    IT: 'Department of Information Technology',
    IS: 'Department of Information Systems',
  }
  return map[dept] ?? dept
}

/* ───── Component ───── */

export default function AuthorsPage() {
  const [allAuthors, setAllAuthors] = useState<AuthorInfo[]>([])
  const [loading, setLoading] = useState(true)

  // Filters & search
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState<string>('last-name-az')
  const [filterDept, setFilterDept] = useState<string>('All departments')
  const [page, setPage] = useState(1)

  /* ─── Fetch all documents, extract unique authors ─── */
  useEffect(() => {
    listDocuments({ limit: 1000 })
      .then(({ data }) => {
        const authorMap = new Map<string, {
          workCount: number
          latestDate: string
          department: string
        }>()

        for (const doc of data) {
          const names = parseAuthors(doc.authors)
          for (const rawName of names) {
            const name = rawName.trim()
            if (!name) continue

            const key = name.toLowerCase()
            const existing = authorMap.get(key)

            const docDate = doc.created_at ?? ''
            const dept = doc.department ?? ''

            if (existing) {
              existing.workCount += 1
              if (docDate > existing.latestDate) {
                existing.latestDate = docDate
              }
            } else {
              authorMap.set(key, {
                workCount: 1,
                latestDate: docDate,
                department: dept,
              })
            }
          }
        }

        // Convert map to array
        const result: AuthorInfo[] = []
        for (const [key, info] of authorMap) {
          // Recover original-cased name from documents
          let displayName = key
          for (const doc of data) {
            const names = parseAuthors(doc.authors)
            const match = names.find((n) => n.toLowerCase() === key)
            if (match) { displayName = match; break }
          }

          result.push({
            name: displayName,
            lastName: getLastName(displayName),
            initials: getInitials(displayName),
            workCount: info.workCount,
            lastPublishedDate: info.latestDate,
            lastPublishedLabel: info.latestDate ? formatDate(info.latestDate) : 'Unknown',
            department: info.department,
          })
        }

        setAllAuthors(result)
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  /* ─── Filtered, sorted, paginated ─── */
  const filtered = useMemo(() => {
    let list = [...allAuthors]

    // Department filter
    if (filterDept !== 'All departments') {
      list = list.filter((a) => a.department === filterDept)
    }

    // Search
    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase()
      list = list.filter((a) => a.name.toLowerCase().includes(q))
    }

    // Sort
    switch (sortBy) {
      case 'last-name-az':
        list.sort((a, b) => a.lastName.localeCompare(b.lastName))
        break
      case 'last-name-za':
        list.sort((a, b) => b.lastName.localeCompare(a.lastName))
        break
      case 'works-desc':
        list.sort((a, b) => b.workCount - a.workCount)
        break
      case 'works-asc':
        list.sort((a, b) => a.workCount - b.workCount)
        break
      case 'recent':
        list.sort((a, b) => b.lastPublishedDate.localeCompare(a.lastPublishedDate))
        break
    }

    return list
  }, [allAuthors, filterDept, searchQuery, sortBy])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE))
  const paginated = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE)

  // Reset page when filters change
  useEffect(() => { setPage(1) }, [searchQuery, sortBy, filterDept])

  const sortLabel = SORT_OPTIONS.find((o) => o.value === sortBy)?.label ?? ''

  return (
    <div className="min-h-screen bg-bg-grey flex flex-col">
      <CICSHeader />

      <SecondaryNav
        title="Authors"
        breadcrumbItems={[
          { label: 'Home', href: '/' },
          { label: 'Authors' },
        ]}
      />

      <div className="flex flex-1 px-8 lg:px-[300px] gap-6">
        <Sidebar />

        <main className="flex-1 min-w-0 pt-7 pb-8">
          {/* Intro */}
          <p className="font-body text-[14px] leading-[24px] text-[#555] mb-5">
            Browse repository contributors and open their profile pages to view published works.
          </p>

          {/* ─── Search + Sort + Filter Bar ─── */}
          <div className="flex flex-wrap items-center gap-3 mb-5">
            {/* Search */}
            <div className="relative flex-1 min-w-[200px] max-w-[340px]">
              <svg
                className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#999]"
                fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
              >
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.35-4.35" strokeLinecap="round" />
              </svg>
              <input
                id="authors-search"
                type="text"
                placeholder="Search by author name…"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-[42px] pl-9 pr-3 border border-[#ccc] rounded-[4px] bg-white font-body text-[13px] text-[#333] placeholder:text-[#999] focus:outline-none focus:ring-2 focus:ring-cics-maroon/30 focus:border-cics-maroon transition-colors"
              />
            </div>

            {/* Sort */}
            <select
              id="authors-sort"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="h-[42px] px-3 pr-8 border border-[#ccc] rounded-[4px] bg-white font-body text-[13px] text-[#555] focus:outline-none focus:ring-2 focus:ring-cics-maroon/30 focus:border-cics-maroon cursor-pointer appearance-none"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23666' d='M6 8.825a.5.5 0 0 1-.354-.146l-4-4a.5.5 0 1 1 .708-.708L6 7.617l3.646-3.646a.5.5 0 1 1 .708.708l-4 4A.5.5 0 0 1 6 8.825z'/%3E%3C/svg%3E")`,
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'right 10px center',
              }}
            >
              {SORT_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>

            {/* Department filter */}
            <select
              id="authors-department-filter"
              value={filterDept}
              onChange={(e) => setFilterDept(e.target.value)}
              className="h-[42px] px-3 pr-8 border border-[#ccc] rounded-[4px] bg-white font-body text-[13px] text-[#555] focus:outline-none focus:ring-2 focus:ring-cics-maroon/30 focus:border-cics-maroon cursor-pointer appearance-none"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23666' d='M6 8.825a.5.5 0 0 1-.354-.146l-4-4a.5.5 0 1 1 .708-.708L6 7.617l3.646-3.646a.5.5 0 1 1 .708.708l-4 4A.5.5 0 0 1 6 8.825z'/%3E%3C/svg%3E")`,
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'right 10px center',
              }}
            >
              {DEPARTMENTS.map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>

          {/* ─── Sort info line ─── */}
          <p className="font-body text-[12px] text-[#888] mb-4">
            Sorted by {sortLabel}
          </p>

          {/* ─── Results count ─── */}
          <p className="font-body text-[13px] text-[#555] mb-3">
            Showing {paginated.length} of {filtered.length} author{filtered.length !== 1 ? 's' : ''}
            {' · '}Sorted by {sortLabel}
          </p>

          {/* ─── Author Cards ─── */}
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="animate-pulse flex items-center gap-4 py-5 border-b border-[#e8e8e8]">
                  <div className="h-11 w-11 rounded-full bg-grey-200" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 w-48 bg-grey-200 rounded" />
                    <div className="h-3 w-72 bg-grey-100 rounded" />
                  </div>
                </div>
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-16">
              <svg className="mx-auto h-12 w-12 text-grey-300 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
              </svg>
              <p className="font-body text-[14px] text-[#888]">No authors found matching your search.</p>
            </div>
          ) : (
            <div className="flex flex-col">
              {paginated.map((author, idx) => (
                <Link
                  key={author.name}
                  href={`/authors/${encodeURIComponent(author.name)}`}
                  className="group flex items-center gap-4 py-[18px] border-b border-[#e8e8e8] last:border-b-0 hover:bg-[#fafafa] transition-colors -mx-2 px-2 rounded no-underline"
                >
                  {/* Avatar */}
                  <div className="shrink-0 h-[44px] w-[44px] rounded-full bg-cics-maroon flex items-center justify-center">
                    <span className="font-heading text-[15px] font-semibold text-white leading-none tracking-wide">
                      {author.initials}
                    </span>
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-heading text-[17px] font-semibold text-[#333] leading-snug group-hover:text-cics-maroon transition-colors mb-0.5">
                      {author.name}
                    </h3>
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 font-body text-[12px] text-[#888]">
                      {/* Work count */}
                      <span className="inline-flex items-center gap-1">
                        <svg className="h-3 w-3 text-cics-maroon" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
                        </svg>
                        {author.workCount} work{author.workCount !== 1 ? 's' : ''}
                      </span>
                      <span className="text-[#ccc]">·</span>
                      {/* Last published */}
                      <span className="inline-flex items-center gap-1">
                        <svg className="h-3 w-3 text-cics-maroon" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5" />
                        </svg>
                        Last published {author.lastPublishedLabel}
                      </span>
                      <span className="text-[#ccc]">·</span>
                      {/* Department */}
                      <span className="inline-flex items-center gap-1">
                        <svg className="h-3 w-3 text-cics-maroon" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.438 60.438 0 0 0-.491 6.347A48.62 48.62 0 0 1 12 20.904a48.62 48.62 0 0 1 8.232-4.41 60.46 60.46 0 0 0-.491-6.347m-15.482 0a50.636 50.636 0 0 0-2.658-.813A59.906 59.906 0 0 1 12 3.493a59.903 59.903 0 0 1 10.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.717 50.717 0 0 1 12 13.489a50.702 50.702 0 0 1 7.74-3.342" />
                        </svg>
                        {getDeptLabel(author.department)}
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}

          {/* ─── Pagination ─── */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-8">
              <button
                id="authors-page-prev"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="h-[38px] px-4 border border-[#ddd] rounded-[4px] bg-white font-body text-[13px] text-[#555] hover:bg-[#f5f5f5] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                Previous
              </button>

              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter((p) => {
                  // Show first, last, and pages near current
                  if (p === 1 || p === totalPages) return true
                  return Math.abs(p - page) <= 1
                })
                .reduce<(number | 'ellipsis')[]>((acc, p, idx, arr) => {
                  if (idx > 0 && p - (arr[idx - 1] as number) > 1) acc.push('ellipsis')
                  acc.push(p)
                  return acc
                }, [])
                .map((item, idx) =>
                  item === 'ellipsis' ? (
                    <span key={`e-${idx}`} className="px-1 text-[#aaa] font-body text-[13px]">…</span>
                  ) : (
                    <button
                      key={item}
                      onClick={() => setPage(item as number)}
                      className={`h-[38px] w-[38px] rounded-[4px] font-body text-[13px] font-medium transition-colors ${
                        page === item
                          ? 'bg-cics-maroon text-white border border-cics-maroon'
                          : 'bg-white text-[#555] border border-[#ddd] hover:bg-[#f5f5f5]'
                      }`}
                    >
                      {item}
                    </button>
                  )
              )}

              <button
                id="authors-page-next"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
                className="h-[38px] px-4 border border-[#ddd] rounded-[4px] bg-white font-body text-[13px] text-[#555] hover:bg-[#f5f5f5] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                Next
              </button>
            </div>
          )}
        </main>
      </div>

      <CICSFooter />
    </div>
  )
}
