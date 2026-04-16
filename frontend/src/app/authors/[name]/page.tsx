"use client"

import { useEffect, useState, useMemo } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { CalendarDays, Folder, Tag, User } from 'lucide-react'
import { CICSFooter, CICSHeader, SecondaryNav, Sidebar } from '@/components/layout'
import { listDocuments, type ApiDocument } from '@/lib/api/documents'

/* ───── Types ───── */

type AuthorProfile = {
  name: string
  initials: string
  workCount: number
  department: string
  departmentLabel: string
  lastPublished: string        // formatted label
  researchAreas: string[]      // collected keywords from all works
}

/* ───── Constants ───── */

const DEPT_LABELS: Record<string, string> = {
  CS: 'Department of Computer Science',
  IT: 'Department of Information Technology',
  IS: 'Department of Information Systems',
}

const DEPT_SLUGS: Record<string, string> = {
  CS: 'department-of-computer-science',
  IT: 'department-of-information-technology',
  IS: 'department-of-information-systems',
}

const ALL_YEARS = 'All years'
const ALL_TYPES = 'All types'
const ALL_DEPTS = 'All departments'

/* ───── Helpers ───── */

/** Safely parse the authors field which may be a JSON string, an array, or a plain string */
function parseAuthors(raw: unknown): string[] {
  if (Array.isArray(raw)) {
    return raw.flatMap((item) => {
      if (typeof item === 'string') {
        const trimmed = item.trim()
        if (trimmed.startsWith('[')) {
          try {
            const parsed = JSON.parse(trimmed)
            if (Array.isArray(parsed)) return parsed.map((s: unknown) => String(s).trim()).filter(Boolean)
          } catch { /* not JSON */ }
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
    return trimmed.split(',').map((s) => s.trim()).filter(Boolean)
  }
  return []
}

function parseKeywords(raw: unknown): string[] {
  if (Array.isArray(raw)) {
    return raw.flatMap((item) => {
      if (typeof item === 'string') {
        const trimmed = item.trim()
        if (trimmed.startsWith('[')) {
          try {
            const parsed = JSON.parse(trimmed)
            if (Array.isArray(parsed)) return parsed.map((s: unknown) => String(s).trim()).filter(Boolean)
          } catch { /* not JSON */ }
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
    return trimmed.split(',').map((s) => s.trim()).filter(Boolean)
  }
  return []
}

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/)
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase()
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase()
}

function formatMonthYear(iso: string): string {
  const d = new Date(iso)
  return d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
}

function getDocYear(doc: ApiDocument): string {
  return doc.year ? String(doc.year) : new Date(doc.created_at).getFullYear().toString()
}

/* ───── Component ───── */

export default function AuthorProfilePage() {
  const params = useParams()
  const authorSlug = decodeURIComponent(params.name as string)

  const [authorDocs, setAuthorDocs] = useState<ApiDocument[]>([])
  const [profile, setProfile] = useState<AuthorProfile | null>(null)
  const [loading, setLoading] = useState(true)

  // Filters
  const [filterYear, setFilterYear] = useState(ALL_YEARS)
  const [filterType, setFilterType] = useState(ALL_TYPES)
  const [filterDept, setFilterDept] = useState(ALL_DEPTS)

  useEffect(() => {
    listDocuments({ limit: 1000 })
      .then(({ data }) => {
        // Find all documents by this author (case-insensitive match)
        const docs = data.filter((doc) => {
          const authors = parseAuthors(doc.authors)
          return authors.some((a) => a.toLowerCase() === authorSlug.toLowerCase())
        })

        setAuthorDocs(docs)

        if (docs.length > 0) {
          // Build profile
          const allKeywords = new Set<string>()
          let latestDate = ''
          let department = docs[0].department ?? 'CS'

          for (const doc of docs) {
            const kws = parseKeywords(doc.keywords)
            kws.forEach((kw) => allKeywords.add(kw))
            if (doc.created_at > latestDate) latestDate = doc.created_at
          }

          // Recover original casing of author name
          let displayName = authorSlug
          for (const doc of docs) {
            const authors = parseAuthors(doc.authors)
            const match = authors.find((a) => a.toLowerCase() === authorSlug.toLowerCase())
            if (match) { displayName = match; break }
          }

          setProfile({
            name: displayName,
            initials: getInitials(displayName),
            workCount: docs.length,
            department,
            departmentLabel: DEPT_LABELS[department] ?? department,
            lastPublished: latestDate ? formatMonthYear(latestDate) : 'Unknown',
            researchAreas: Array.from(allKeywords).slice(0, 8),
          })
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [authorSlug])

  /* ─── Available filter options ─── */
  const years = useMemo(() => {
    const set = new Set<string>()
    authorDocs.forEach((doc) => set.add(getDocYear(doc)))
    return [ALL_YEARS, ...Array.from(set).sort().reverse()]
  }, [authorDocs])

  const types = [ALL_TYPES, 'thesis', 'capstone']
  const departments = [ALL_DEPTS, 'CS', 'IT', 'IS']

  /* ─── Filtered docs ─── */
  const filteredDocs = useMemo(() => {
    let list = [...authorDocs]
    if (filterYear !== ALL_YEARS) {
      list = list.filter((d) => getDocYear(d) === filterYear)
    }
    if (filterType !== ALL_TYPES) {
      list = list.filter((d) => d.type === filterType)
    }
    if (filterDept !== ALL_DEPTS) {
      list = list.filter((d) => d.department === filterDept)
    }
    // Sort by most recent first
    list.sort((a, b) => b.created_at.localeCompare(a.created_at))
    return list
  }, [authorDocs, filterYear, filterType, filterDept])

  const selectStyle = {
    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23666' d='M6 8.825a.5.5 0 0 1-.354-.146l-4-4a.5.5 0 1 1 .708-.708L6 7.617l3.646-3.646a.5.5 0 1 1 .708.708l-4 4A.5.5 0 0 1 6 8.825z'/%3E%3C/svg%3E")`,
    backgroundRepeat: 'no-repeat' as const,
    backgroundPosition: 'right 10px center',
  }

  return (
    <div className="min-h-screen bg-bg-grey flex flex-col">
      <CICSHeader />

      <SecondaryNav
        title="Author Profile"
        breadcrumbItems={[
          { label: 'Home', href: '/' },
          { label: 'Authors', href: '/authors' },
          { label: profile?.name ?? 'Author' },
        ]}
      />

      <div className="flex flex-1 px-8 lg:px-[300px] gap-6">
        <Sidebar />

        <main className="flex-1 min-w-0 pt-7 pb-8">
          {loading ? (
            /* ─ Skeleton ─ */
            <div className="animate-pulse">
              <div className="bg-white rounded-lg border border-[#e8e8e8] p-6 mb-8">
                <div className="flex items-start gap-5">
                  <div className="h-14 w-14 rounded-full bg-grey-200" />
                  <div className="flex-1 space-y-3">
                    <div className="h-6 w-48 bg-grey-200 rounded" />
                    <div className="h-4 w-80 bg-grey-100 rounded" />
                  </div>
                </div>
              </div>
              <div className="h-5 w-36 bg-grey-200 rounded mb-4" />
              {[1, 2, 3].map((i) => (
                <div key={i} className="space-y-2 pb-5 mb-5 border-b border-[#e8e8e8]">
                  <div className="h-4 w-3/4 bg-grey-200 rounded" />
                  <div className="h-3 w-1/2 bg-grey-100 rounded" />
                  <div className="h-16 w-[92%] bg-grey-50 rounded" />
                </div>
              ))}
            </div>
          ) : !profile ? (
            /* ─ Not found ─ */
            <div className="text-center py-16">
              <svg className="mx-auto h-16 w-16 text-grey-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
              </svg>
              <h2 className="font-heading text-[20px] text-[#555] mb-2">Author Not Found</h2>
              <p className="font-body text-[14px] text-[#888] mb-4">No published works found for &ldquo;{authorSlug}&rdquo;.</p>
              <Link href="/authors" className="btn-primary rounded text-[13px] no-underline">
                ← Back to Authors
              </Link>
            </div>
          ) : (
            <>
              {/* ═══════════ PROFILE CARD ═══════════ */}
              <div className="bg-white rounded-lg border border-[#e8e8e8] shadow-card mb-8">
                <div className="p-6 pb-5">
                  <div className="flex items-start gap-5">
                    {/* Avatar */}
                    <div className="shrink-0 h-[56px] w-[56px] rounded-full bg-cics-maroon flex items-center justify-center">
                      <span className="font-heading text-[20px] font-semibold text-white leading-none tracking-wide">
                        {profile.initials}
                      </span>
                    </div>

                    {/* Name & stats */}
                    <div className="flex-1 min-w-0">
                      <h1 className="font-heading text-[24px] font-bold text-[#333] leading-snug mb-3">
                        {profile.name}
                      </h1>

                      <div className="flex flex-wrap gap-x-8 gap-y-2 mb-0">
                        {/* Published Works */}
                        <div className="flex flex-col">
                          <span className="font-body text-[10px] font-semibold uppercase tracking-wider text-[#999] mb-0.5">
                            Published Works
                          </span>
                          <span className="inline-flex items-center gap-1.5 font-body text-[14px] font-semibold text-[#333]">
                            <svg className="h-4 w-4 text-cics-maroon" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
                            </svg>
                            {profile.workCount} work{profile.workCount !== 1 ? 's' : ''}
                          </span>
                        </div>

                        {/* Department */}
                        <div className="flex flex-col">
                          <span className="font-body text-[10px] font-semibold uppercase tracking-wider text-[#999] mb-0.5">
                            Department
                          </span>
                          <span className="inline-flex items-center gap-1.5 font-body text-[14px] text-[#333]">
                            <svg className="h-4 w-4 text-cics-maroon" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.438 60.438 0 0 0-.491 6.347A48.62 48.62 0 0 1 12 20.904a48.62 48.62 0 0 1 8.232-4.41 60.46 60.46 0 0 0-.491-6.347m-15.482 0a50.636 50.636 0 0 0-2.658-.813A59.906 59.906 0 0 1 12 3.493a59.903 59.903 0 0 1 10.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.717 50.717 0 0 1 12 13.489a50.702 50.702 0 0 1 7.74-3.342" />
                            </svg>
                            {profile.departmentLabel}
                          </span>
                        </div>

                        {/* Latest Publication */}
                        <div className="flex flex-col">
                          <span className="font-body text-[10px] font-semibold uppercase tracking-wider text-[#999] mb-0.5">
                            Latest Publication
                          </span>
                          <span className="inline-flex items-center gap-1.5 font-body text-[14px] text-[#333]">
                            <svg className="h-4 w-4 text-cics-maroon" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5" />
                            </svg>
                            {profile.lastPublished}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Research Areas */}
                {profile.researchAreas.length > 0 && (
                  <div className="px-6 pb-5 pt-1 border-t border-[#f0f0f0]">
                    <span className="font-body text-[10px] font-semibold uppercase tracking-wider text-[#999] block mb-2">
                      Research Areas
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {profile.researchAreas.map((area) => (
                        <span
                          key={area}
                          className="inline-block px-3 py-1 rounded-full bg-cics-maroon-50 border border-cics-maroon-200 font-body text-[12px] text-cics-maroon-600"
                        >
                          {area}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* ═══════════ PUBLISHED WORKS ═══════════ */}
              <div className="relative border-b border-[#d6d4d4] pb-[11px] mb-1">
                <h2 className="font-heading text-[21px] leading-[30px] text-[#555]">Published Works</h2>
                <div className="absolute left-0 bottom-[-1px] h-[3px] w-[95px] bg-[#f3aa2c] rounded-tr-[5px] rounded-br-[5px]" />
              </div>

              <p className="font-body text-[12px] text-[#888] mb-4 mt-2">
                Showing {filteredDocs.length} of {authorDocs.length} work{authorDocs.length !== 1 ? 's' : ''}
              </p>

              {/* Filters */}
              <div className="flex flex-wrap items-center gap-3 mb-6">
                <select
                  id="author-works-year"
                  value={filterYear}
                  onChange={(e) => setFilterYear(e.target.value)}
                  className="h-[40px] px-3 pr-8 border border-[#ccc] rounded-[4px] bg-white font-body text-[13px] text-[#555] focus:outline-none focus:ring-2 focus:ring-cics-maroon/30 focus:border-cics-maroon cursor-pointer appearance-none"
                  style={selectStyle}
                >
                  {years.map((y) => (
                    <option key={y} value={y}>{y}</option>
                  ))}
                </select>

                <select
                  id="author-works-type"
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="h-[40px] px-3 pr-8 border border-[#ccc] rounded-[4px] bg-white font-body text-[13px] text-[#555] focus:outline-none focus:ring-2 focus:ring-cics-maroon/30 focus:border-cics-maroon cursor-pointer appearance-none"
                  style={selectStyle}
                >
                  {types.map((t) => (
                    <option key={t} value={t}>{t === ALL_TYPES ? t : t.charAt(0).toUpperCase() + t.slice(1)}</option>
                  ))}
                </select>

                <select
                  id="author-works-dept"
                  value={filterDept}
                  onChange={(e) => setFilterDept(e.target.value)}
                  className="h-[40px] px-3 pr-8 border border-[#ccc] rounded-[4px] bg-white font-body text-[13px] text-[#555] focus:outline-none focus:ring-2 focus:ring-cics-maroon/30 focus:border-cics-maroon cursor-pointer appearance-none"
                  style={selectStyle}
                >
                  {departments.map((d) => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>

              {/* Works list */}
              {filteredDocs.length === 0 ? (
                <p className="font-body text-[14px] text-[#888] py-8 text-center">
                  No works match the selected filters.
                </p>
              ) : (
                <div className="flex flex-col gap-6">
                  {filteredDocs.map((doc, idx) => {
                    const authors = parseAuthors(doc.authors).join(', ')
                    const keywords = parseKeywords(doc.keywords)
                    const year = getDocYear(doc)
                    const deptSlug = DEPT_SLUGS[doc.department] ?? 'department-of-computer-science'
                    const trackSlug = doc.track_specialization ?? ''
                    const basePath = doc.type === 'capstone' ? '/capstone' : '/theses'
                    const detailHref = `${basePath}/${deptSlug}/${trackSlug ? trackSlug + '/' : ''}${doc.id}`

                    return (
                      <article
                        key={doc.id}
                        className={`flex flex-col gap-2 pb-5 ${idx !== filteredDocs.length - 1 ? 'border-b border-[#dddddd]' : ''}`}
                      >
                        {/* Title */}
                        <Link
                          href={detailHref}
                          className="font-body text-[16px] leading-[22px] text-[#337ab7] hover:underline w-full text-left"
                        >
                          {doc.title}
                        </Link>

                        {/* Meta row */}
                        <div className="flex flex-wrap items-center gap-4 text-[#888888] font-body text-[10px] leading-[14px]">
                          <span className="inline-flex items-center gap-1">
                            <User size={9} />
                            {authors}
                          </span>
                          <span className="inline-flex items-center gap-1">
                            <CalendarDays size={9} />
                            {formatMonthYear(doc.created_at)}
                          </span>
                          <span className="inline-flex items-center gap-1">
                            <svg className="h-[9px] w-[9px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.438 60.438 0 0 0-.491 6.347A48.62 48.62 0 0 1 12 20.904a48.62 48.62 0 0 1 8.232-4.41 60.46 60.46 0 0 0-.491-6.347m-15.482 0a50.636 50.636 0 0 0-2.658-.813A59.906 59.906 0 0 1 12 3.493a59.903 59.903 0 0 1 10.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.717 50.717 0 0 1 12 13.489a50.702 50.702 0 0 1 7.74-3.342" />
                            </svg>
                            {DEPT_LABELS[doc.department] ?? doc.department}
                          </span>
                          <span className="inline-flex items-center gap-1">
                            <Folder size={9} />
                            {doc.type === 'thesis' ? 'Thesis' : 'Capstone'}
                          </span>
                        </div>

                        {/* Abstract */}
                        {doc.abstract && (
                          <div className="w-[92%] border-l-[3px] border-cics-maroon bg-cics-maroon-50 px-3 py-1.5">
                            <p className="font-body text-[13px] leading-[16px] text-[#1d1d1b]">
                              {doc.abstract}
                            </p>
                          </div>
                        )}

                        {/* Keywords */}
                        {keywords.length > 0 && (
                          <div className="inline-flex items-center gap-1 text-[#888888] font-body text-[10px] leading-[14px]">
                            <Tag size={9} />
                            <span className="text-[10px] leading-[14px] text-[#888888]">
                              {keywords.join(', ')}
                            </span>
                          </div>
                        )}
                      </article>
                    )
                  })}
                </div>
              )}
            </>
          )}
        </main>
      </div>

      <CICSFooter />
    </div>
  )
}
