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
  return String(value ?? '')
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

  const detail: ThesisDetail = {
    publicationDate: year,
    documentType: doc.type === 'thesis' ? 'Thesis' : 'Capstone',
    degreeName: '—',
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
    recommendedCitation: `${authors}. (${year}). ${doc.title}.`,
    embargoPeriod: 'None',
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
