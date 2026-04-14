'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { Minus, Plus, Search } from 'lucide-react'
import { endOfDay, isValid, parse, startOfDay } from 'date-fns'
import { ThesisListItem } from '@/components/thesis'
import {
  Button,
  DatePicker,
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  TypographyMeta,
} from '@/components/ui'
import { searchDocuments, listDocuments, type ApiDocument } from '@/lib/api/documents'
import { type ThesisEntry } from '@/lib/utils/theses-data'
import { apiDocToEntry } from '@/lib/utils/api-adapters'

type SearchField = 'any' | 'title' | 'author' | 'keywords'

type Criteria = {
  id: string
  field: SearchField
  query: string
}

const DATE_PATTERN = 'MM/dd/yyyy'
const ENTRY_DATE_PATTERNS = ['MMMM yyyy', 'MMM yyyy', 'MMMM d, yyyy', 'MMM d, yyyy', 'MM/dd/yyyy', 'yyyy-MM-dd'] as const
const MAX_CRITERIA = 5

function includesIgnoreCase(value: string, term: string) {
  return value.toLowerCase().includes(term.toLowerCase())
}

function matchesCriteria(criteria: Criteria, entry: ThesisEntry): boolean {
  if (!criteria.query.trim()) return true
  const term = criteria.query.trim()
  if (criteria.field === 'title') return includesIgnoreCase(entry.title, term)
  if (criteria.field === 'author') return includesIgnoreCase(entry.authors, term)
  if (criteria.field === 'keywords') return includesIgnoreCase(entry.tags, term)
  return (
    includesIgnoreCase(entry.title, term) ||
    includesIgnoreCase(entry.authors, term) ||
    includesIgnoreCase(entry.tags, term) ||
    includesIgnoreCase(entry.abstract, term)
  )
}

function parseStrictFilterDate(value: string) {
  if (value.length !== 10) return undefined
  const d = parse(value, DATE_PATTERN, new Date())
  return isValid(d) ? d : undefined
}

function parseEntryYear(entry: ThesisEntry): Date | undefined {
  const yearMatch = /^(\d{4})$/.exec(entry.date.trim())
  if (yearMatch) return new Date(Number(yearMatch[1]), 0, 1)
  for (const pattern of ENTRY_DATE_PATTERNS) {
    const d = parse(entry.date.trim(), pattern, new Date())
    if (isValid(d)) return d
  }
  const fallback = new Date(entry.date)
  return isValid(fallback) ? fallback : undefined
}

type AdvancedSearchPanelProps = {
  initialQuery?: string
  initialFromDate?: string
  initialToDate?: string
}

export default function AdvancedSearchPanel({
  initialQuery = '',
  initialFromDate = '',
  initialToDate = '',
}: Readonly<AdvancedSearchPanelProps>) {
  const normalizedInitialQuery = initialQuery.trim()
  const criteriaIdRef = useRef(1)

  const [criteriaList, setCriteriaList] = useState<Criteria[]>([
    { id: 'criteria-0', field: 'any', query: normalizedInitialQuery },
  ])
  const [fromDate, setFromDate] = useState(initialFromDate.trim())
  const [toDate, setToDate] = useState(initialToDate.trim())

  const [allResults, setAllResults] = useState<ThesisEntry[]>([])
  const [loading, setLoading] = useState(false)
  const [hasSearched, setHasSearched] = useState(
    Boolean(normalizedInitialQuery || initialFromDate.trim() || initialToDate.trim())
  )

  const hasSearchInput = criteriaList.some((c) => c.query.trim().length > 0) ||
    fromDate.trim().length > 0 || toDate.trim().length > 0

  const parsedFromDate = parseStrictFilterDate(fromDate)
  const parsedToDate = parseStrictFilterDate(toDate)
  const hasInvalidDateRange = Boolean(parsedFromDate && parsedToDate && parsedFromDate > parsedToDate)

  // Client-side filter on top of API results
  const results = allResults.filter((entry) => {
    if (!criteriaList.every((c) => matchesCriteria(c, entry))) return false
    if (!parsedFromDate && !parsedToDate) return true
    const entryDate = parseEntryYear(entry)
    if (!entryDate) return false
    if (parsedFromDate && entryDate < startOfDay(parsedFromDate)) return false
    if (parsedToDate && entryDate > endOfDay(parsedToDate)) return false
    return true
  })

  const executeSearch = useCallback(async () => {
    if (hasInvalidDateRange) return
    setHasSearched(true)
    setLoading(true)
    try {
      // Use the first non-empty criteria query for the API call
      const primaryQuery = criteriaList.find((c) => c.query.trim())?.query.trim() ?? ''
      let docs: ApiDocument[]
      if (primaryQuery) {
        docs = await searchDocuments(primaryQuery)
      } else {
        const res = await listDocuments({ limit: 200 })
        docs = res.data
      }
      setAllResults(docs.map(apiDocToEntry))
    } catch {
      setAllResults([])
    } finally {
      setLoading(false)
    }
  }, [criteriaList, hasInvalidDateRange])

  // Run search on mount if there's an initial query
  useEffect(() => {
    if (normalizedInitialQuery) {
      executeSearch()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function updateCriteria(index: number, next: Partial<Criteria>) {
    setCriteriaList((cur) => cur.map((item, i) => (i === index ? { ...item, ...next } : item)))
  }

  function addCriteria() {
    setCriteriaList((cur) => {
      if (cur.length >= MAX_CRITERIA) return cur
      const next: Criteria = { id: `criteria-${criteriaIdRef.current}`, field: 'any', query: '' }
      criteriaIdRef.current += 1
      return [...cur, next]
    })
  }

  function removeCriteria(id: string) {
    setCriteriaList((cur) => (cur.length <= 1 ? cur : cur.filter((c) => c.id !== id)))
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') { e.preventDefault(); executeSearch() }
  }

  const showResults = hasSearched && hasSearchInput && !loading
  const canAddCriteria = criteriaList.length < MAX_CRITERIA

  return (
    <section className="w-full">
      <div className="bg-[#f2f2f2] w-full px-8 lg:px-[80px] py-10 mb-8 border-b border-[#e5e5e5]">
        <div className="max-w-[980px] mx-auto">
          <div className="rounded-[6px] p-4 lg:p-5">
            <div className="flex flex-col gap-3">
              {criteriaList.map((criteria, index) => (
                <div
                  key={criteria.id}
                  className="grid grid-cols-[158px_minmax(0,1fr)_96px_96px] items-center gap-3"
                >
                  <Select
                    value={criteria.field}
                    onValueChange={(v) => updateCriteria(index, { field: v as SearchField })}
                  >
                    <SelectTrigger className="spark-search-select">
                      <SelectValue placeholder="Any field" />
                    </SelectTrigger>
                    <SelectContent className="spark-search-select-content">
                      <SelectItem value="any">Any field</SelectItem>
                      <SelectItem value="title">Title</SelectItem>
                      <SelectItem value="author">Author</SelectItem>
                      <SelectItem value="keywords">Keywords</SelectItem>
                    </SelectContent>
                  </Select>

                  <Input
                    value={criteria.query}
                    onChange={(e) => updateCriteria(index, { query: e.target.value })}
                    onKeyDown={handleKeyDown}
                    className="h-[50px] w-full rounded-none border-[#9a9a9a] bg-white px-5 text-[13px] text-[#767676] placeholder:text-[#767676] focus:ring-1"
                    placeholder="Search for..."
                  />

                  <div className="flex h-[50px] w-[96px] items-center justify-center justify-self-end">
                    {index === 0 ? (
                      <Button
                        type="button"
                        onClick={addCriteria}
                        disabled={!canAddCriteria}
                        className="h-[50px] w-[96px] rounded-none border border-[#777676] bg-[#888888] text-white hover:bg-[#7d7d7d] disabled:opacity-50 disabled:hover:bg-[#888888]"
                        aria-label="Add search field"
                      >
                        <Plus className="h-6 w-6" />
                      </Button>
                    ) : (
                      <Button
                        type="button"
                        onClick={() => removeCriteria(criteria.id)}
                        className="h-[50px] w-[96px] rounded-none border border-[#a7a7a7] bg-[#bdbdbd] text-white hover:bg-[#a9a9a9]"
                        aria-label="Remove search field"
                      >
                        <Minus className="h-6 w-6" />
                      </Button>
                    )}
                  </div>

                  <div className="flex h-[50px] w-[96px] items-center justify-center justify-self-end">
                    {index === 0 ? (
                      <Button
                        type="button"
                        onClick={executeSearch}
                        disabled={loading}
                        className="h-[50px] w-[96px] rounded-none border border-cics-maroon-500 bg-cics-maroon text-white hover:bg-cics-maroon-600 disabled:opacity-60"
                        aria-label="Run search"
                      >
                        <Search className="h-6 w-6" />
                      </Button>
                    ) : null}
                  </div>
                </div>
              ))}

              {!canAddCriteria && (
                <p className="font-body text-[12px] text-[#7a7a7a] text-right pr-[210px]">
                  Maximum of {MAX_CRITERIA} search constraints reached.
                </p>
              )}

              <div className="grid grid-cols-[158px_minmax(0,1fr)_96px_96px] items-center gap-3">
                <div />
                <div className="flex items-center justify-end gap-4">
                  <TypographyMeta className="text-[12px] leading-[18px] text-[#515350]">Date range:</TypographyMeta>
                  <div className="flex items-center gap-[10px]">
                    <DatePicker
                      value={fromDate}
                      onChange={(v) => { setFromDate(v) }}
                      placeholder="MM/DD/YYYY"
                      inputClassName={hasInvalidDateRange ? 'spark-date-input border-[#dc2626] text-[#991b1b] focus:ring-[#dc2626]' : 'spark-date-input'}
                      popoverClassName="spark-calendar-popover"
                    />
                    <TypographyMeta className="text-[12px] text-[#515350]">-</TypographyMeta>
                    <DatePicker
                      value={toDate}
                      onChange={(v) => { setToDate(v) }}
                      placeholder="MM/DD/YYYY"
                      inputClassName={hasInvalidDateRange ? 'spark-date-input border-[#dc2626] text-[#991b1b] focus:ring-[#dc2626]' : 'spark-date-input'}
                      popoverClassName="spark-calendar-popover"
                    />
                  </div>
                </div>
                <div />
                <div />
              </div>

              {hasInvalidDateRange && (
                <p className="font-body text-[12px] text-[#b91c1c] text-right pr-[210px]">
                  From date must be earlier than or equal to To date.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {loading && (
        <div className="bg-white w-full py-10">
          <p className="text-center text-sm text-[#888888]">Searching…</p>
        </div>
      )}

      {!loading && !showResults && <div className="bg-white min-h-[420px] w-full" />}

      {!loading && showResults && (
        <div className="bg-white w-full py-10">
          <div className="w-full max-w-[1157px] mx-auto px-3">
            <div className="h-[56px] rounded-[12px] border border-[#cdeac2] bg-[#dff0d8] px-[10px] flex items-center mb-8">
              <p className="font-body text-[13px] leading-[20px] text-[#3c763d]">
                Your search returned <span className="font-semibold">{results.length}</span> record{results.length === 1 ? '' : 's'}.
              </p>
            </div>

            <div className="max-w-[1137px] flex flex-col gap-6 px-[10px] pt-5 pb-[30px]">
              {results.map((entry, index) => (
                <ThesisListItem
                  key={entry.slug}
                  entry={entry}
                  collectionSlug={entry.trackSlug ? `${entry.departmentSlug}/${entry.trackSlug}` : entry.departmentSlug}
                  basePath={entry.type === 'Capstone' ? '/capstone' : '/theses'}
                  showDivider={index !== results.length - 1}
                />
              ))}
            </div>

            {results.length === 0 && (
              <p className="font-body text-[14px] text-[#888888] px-[10px]">No search results matched your query.</p>
            )}
          </div>
        </div>
      )}
    </section>
  )
}
