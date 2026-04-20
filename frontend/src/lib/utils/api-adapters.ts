/**
 * Shared adapters for converting backend ApiDocument objects to frontend
 * ThesisEntry / ThesisDetail shapes used throughout the public UI.
 */

import { type ApiDocument } from '@/lib/api/documents'
import { type ThesisEntry, type ThesisDetail } from '@/lib/utils/theses-data'

const DEPT_NAMES: Record<string, string> = {
  CS: 'Computer Science',
  IT: 'Information Technology',
  IS: 'Information Systems',
}

const DEPT_SLUGS: Record<string, string> = {
  CS: 'department-of-computer-science',
  IT: 'department-of-information-technology',
  IS: 'department-of-information-systems',
}

function joinArray(value: unknown): string {
  if (Array.isArray(value)) return value.join(', ')
  if (typeof value === 'string') {
    try {
      const parsed = JSON.parse(value)
      if (Array.isArray(parsed)) return parsed.join(', ')
    } catch { /* not a JSON array string */ }
    return value
  }
  return String(value ?? '')
}

/** Converts a full name to APA last-name-first format: "Patrick Miguel V. Razon" → "Razon, P. M. V." */
function toApaAuthor(fullName: string): string {
  const parts = fullName.trim().split(/\s+/)
  if (parts.length === 0) return fullName
  if (parts.length === 1) return fullName
  const lastName = parts[parts.length - 1]
  const given = parts.slice(0, -1)
  const initials = given.map((p) => (p.endsWith('.') ? p : `${p[0]}.`)).join(' ')
  return `${lastName}, ${initials}`
}

/** Formats an authors array into APA 7th edition author list */
function buildApaAuthors(rawAuthors: unknown): string {
  const list: string[] = Array.isArray(rawAuthors)
    ? rawAuthors
    : typeof rawAuthors === 'string'
      ? (() => { try { const p = JSON.parse(rawAuthors); return Array.isArray(p) ? p : [rawAuthors] } catch { return [rawAuthors] } })()
      : []

  const formatted = list.filter(Boolean).map(toApaAuthor)
  if (formatted.length === 0) return '—'
  if (formatted.length === 1) return formatted[0]
  if (formatted.length === 2) return `${formatted[0]}, & ${formatted[1]}`
  return `${formatted.slice(0, -1).join(', ')}, & ${formatted[formatted.length - 1]}`
}

function docYear(doc: ApiDocument): string {
  return doc.year ? String(doc.year) : new Date(doc.created_at).getFullYear().toString()
}

/**
 * Converts an ApiDocument to a ThesisEntry including the full ThesisDetail
 * block. Works for both listing pages (detail is optional) and detail pages.
 *
 * trackSlug falls back to an empty string if the document has no
 * track_specialization — callers that build URLs should guard against this.
 */
export function apiDocToEntry(doc: ApiDocument): ThesisEntry {
  const dept = doc.department ?? 'CS'
  const year = docYear(doc)
  const authors = joinArray(doc.authors)
  const keywords = joinArray(doc.keywords)

  const apaAuthors = buildApaAuthors(doc.authors)
  const docTypeLabel = doc.type === 'thesis' ? 'Thesis' : 'Capstone Project'
  const citationPre = `${apaAuthors} (${year}). `
  const citationPost = ` [${docTypeLabel}, University of Santo Tomas].`

  const detail: ThesisDetail = {
    publicationDate: year,
    documentType: doc.type === 'thesis' ? 'Thesis' : 'Capstone',
    degreeName: doc.degree || 'Not specified',
    subjectCategories: keywords,
    college: 'College of Information and Computing Sciences',
    departmentUnit: DEPT_NAMES[dept] ?? dept,
    thesisAdvisor: doc.adviser ?? 'Not provided',
    defensePanelChair: 'Not provided',
    defensePanelMembers: ['Not provided'],
    abstractSummary: doc.abstract ? [doc.abstract] : ['No abstract available.'],
    language: 'English',
    format: 'Electronic (PDF)',
    keywords: keywords || 'None',
    recommendedCitation: `${citationPre}${doc.title}${citationPost}`,
    citationParts: { pre: citationPre, title: doc.title, post: citationPost },
  }

  return {
    slug: doc.id,
    title: doc.title,
    authors,
    date: year,
    type: doc.type === 'thesis' ? 'Thesis' : 'Capstone',
    abstract: doc.abstract ?? '',
    tags: keywords,
    departmentSlug: DEPT_SLUGS[dept] ?? 'department-of-computer-science',
    trackSlug: doc.track_specialization ?? '',
    detail,
  }
}
