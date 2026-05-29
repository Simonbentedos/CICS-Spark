"use client"

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { use, useMemo, useState } from 'react'
import { Button } from '@/components/ui'
import SubmissionStepLayout from '@/components/admin/SubmissionStepLayout'
import SubmissionStepContent, { isSubmissionStepKey } from '@/components/admin/SubmissionStepContent'
import { getStudentSession } from '@/lib/student/session'
import { uploadDocument, checkDuplicate } from '@/lib/api/documents'
import type { SubmissionDraft, SubmissionStepMeta } from '@/types/admin'

// ── Draft persistence (text fields only — File cannot be serialised) ──────────

// Module-level variables persist File objects across client-side navigations
// (File objects cannot be stored in localStorage/sessionStorage)
let _pendingPdfFile: File | null = null
let _pendingAbstractFile: File | null = null
let _pendingItsoFile: File | null = null
let _lastDraftUserId: string | null = null

function emptyDraft(): SubmissionDraft {
  return {
    title: '',
    firstName: '',
    middleName: '',
    lastName: '',
    author2FirstName: '',
    author2MiddleName: '',
    author2LastName: '',
    author3FirstName: '',
    author3MiddleName: '',
    author3LastName: '',
    author4FirstName: '',
    author4MiddleName: '',
    author4LastName: '',
    author5FirstName: '',
    author5MiddleName: '',
    author5LastName: '',
    publishedOn: '',
    department: '',
    documentType: 'Thesis',
    trackSpecialization: '',
    degree: '',
    thesisAdvisor: '',
    keywords: '',
    abstract: '',
    fileName: '',
    abstractFileName: '',
    itsoFileName: '',
  }
}

function getDraftKey(userId: string): string {
  return `spark_submission_draft_${userId}`
}

function loadDraft(userId: string): SubmissionDraft {
  try {
    if (typeof window === 'undefined') return emptyDraft()
    const draftKey = getDraftKey(userId)
    const raw = localStorage.getItem(draftKey)
    if (!raw) return emptyDraft()
    return { ...emptyDraft(), ...JSON.parse(raw) }
  } catch {
    return emptyDraft()
  }
}

function persistDraft(patch: Partial<SubmissionDraft>, current: SubmissionDraft, userId: string): SubmissionDraft {
  const next = { ...current, ...patch }
  try {
    if (typeof window !== 'undefined') {
      const draftKey = getDraftKey(userId)
      localStorage.setItem(draftKey, JSON.stringify(next))
    }
  } catch { /* storage full — ignore */ }
  return next
}

function clearDraft(userId: string) {
  try {
    if (typeof window !== 'undefined') {
      const draftKey = getDraftKey(userId)
      localStorage.removeItem(draftKey)
    }
  } catch { /* ignore */ }
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function getDeptCode(deptName: string): 'CS' | 'IT' | 'IS' {
  const n = deptName.toLowerCase()
  if (n === 'it' || n.includes('information technology')) return 'IT'
  if (n === 'is' || n.includes('information systems')) return 'IS'
  if (n === 'cs' || n.includes('computer science')) return 'CS'
  return 'CS' // default to CS
}

const DEGREE_BY_DEPT: Record<string, string> = {
  CS: 'Bachelor of Science in Computer Science (BSCS)',
  IT: 'Bachelor of Science in Information Technology (BSIT)',
  IS: 'Bachelor of Science in Information Systems (BSIS)',
}


function extractYear(dateStr: string): number | undefined {
  const match = dateStr.match(/\b(19|20)\d{2}\b/)
  return match ? parseInt(match[0], 10) : undefined
}

// ── Step metadata ─────────────────────────────────────────────────────────────

const STUDENT_STEPS: Record<string, SubmissionStepMeta> = {
  'basic-info': {
    key: 'basic-info',
    index: 1,
    label: 'Step 1 of 4',
    sectionTitle: 'BASIC INFORMATION',
    nextLabel: 'Next: Academic Info →',
    nextHref: '/student/submissions/new/academic-details',
  },
  'academic-details': {
    key: 'academic-details',
    index: 2,
    label: 'Step 2 of 4',
    sectionTitle: 'ACADEMIC DETAILS',
    nextLabel: 'Next: File Upload →',
    nextHref: '/student/submissions/new/file-upload',
    backHref: '/student/submissions/new/basic-info',
  },
  'file-upload': {
    key: 'file-upload',
    index: 3,
    label: 'Step 3 of 4',
    sectionTitle: 'FILE UPLOAD',
    nextLabel: 'Next: Review →',
    nextHref: '/student/submissions/new/verify-details',
    backHref: '/student/submissions/new/academic-details',
  },
  'verify-details': {
    key: 'verify-details',
    index: 4,
    label: 'Step 4 of 4',
    sectionTitle: 'VERIFY DETAILS',
    nextLabel: 'Submit for Review →',
    nextHref: '/student/submissions/new/confirmation',
    backHref: '/student/submissions/new/file-upload',
  },
}

// ── Page component ────────────────────────────────────────────────────────────

export default function StudentSubmissionStepPage({ params: paramsPromise }: Readonly<{ params: Promise<{ step: string }> }>) {
  const params = use(paramsPromise)
  const router = useRouter()
  const step = isSubmissionStepKey(params.step) ? STUDENT_STEPS[params.step] : undefined

  // Get session first to ensure user-specific draft loading
  const session = getStudentSession()
  const userId = session?.studentId || session?.email || 'anonymous'

  // One-time migration: clear old global draft key
  if (typeof window !== 'undefined') {
    try {
      const oldDraft = localStorage.getItem('spark_submission_draft')
      if (oldDraft) {
        console.log('Migrating old draft to user-specific storage')
        localStorage.removeItem('spark_submission_draft')
      }
    } catch {
      // ignore
    }
  }

  // Clear draft and files if user changed
  if (_lastDraftUserId && _lastDraftUserId !== userId) {
    _pendingPdfFile = null
    _pendingAbstractFile = null
    _pendingItsoFile = null
  }
  _lastDraftUserId = userId

  const [draft, setDraft] = useState<SubmissionDraft>(() => {
    const base = loadDraft(userId)
    
    // Department and degree come from the student's account (read-only in the form)
    // If the draft's department doesn't match the current user's department, reset the draft
    if (session?.department && base.department && base.department !== session.department) {
      console.warn('Draft department mismatch - resetting draft')
      return {
        ...emptyDraft(),
        department: session.department,
        degree: DEGREE_BY_DEPT[getDeptCode(session.department)] ?? '',
      }
    }
    
    if (!base.department) {
      if (session?.department) {
        base.department = session.department
        base.degree = DEGREE_BY_DEPT[getDeptCode(session.department)] ?? base.degree
      }
    }
    return base
  })
  const [pdfFile, setPdfFileState] = useState<File | null>(_pendingPdfFile)
  const [abstractFile, setAbstractFileState] = useState<File | null>(_pendingAbstractFile)
  const [itsoFile, setItsoFileState] = useState<File | null>(_pendingItsoFile)
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [duplicateWarning, setDuplicateWarning] = useState<string | null>(null)

  const isDuplicateBlocked = Boolean(duplicateWarning?.startsWith('DUPLICATE:'))
  const isCSStudent = getDeptCode(draft.department) === 'CS'

  const canProceed = useMemo(() => {
    if (!step) return false
    if (step.key === 'basic-info') {
      return Boolean(draft.title.trim() && draft.firstName.trim() && draft.lastName.trim() && draft.trackSpecialization) && !isDuplicateBlocked
    }
    if (step.key === 'academic-details') {
      return Boolean(draft.thesisAdvisor.trim() && draft.keywords.trim() && draft.abstract.trim())
    }
    if (step.key === 'file-upload') {
      return pdfFile !== null && (isCSStudent || (abstractFile !== null && itsoFile !== null))
    }
    // verify-details: enabled once title + all required files present
    return Boolean(draft.title.trim()) && pdfFile !== null && (isCSStudent || (abstractFile !== null && itsoFile !== null))
  }, [draft, step?.key, pdfFile, abstractFile, itsoFile, isDuplicateBlocked, isCSStudent])

  function setPdfFile(file: File | null) {
    _pendingPdfFile = file
    setPdfFileState(file)
  }

  function setAbstractFile(file: File | null) {
    _pendingAbstractFile = file
    setAbstractFileState(file)
  }

  function setItsoFile(file: File | null) {
    _pendingItsoFile = file
    setItsoFileState(file)
  }

  function updateDraft(patch: Partial<SubmissionDraft>) {
    setDraft((cur) => persistDraft(patch, cur, userId))
  }

  async function handleTitleBlur() {
    const title = draft.title.trim()
    if (title.length < 5) return
    try {
      const result = await checkDuplicate(title)
      if (result.isDuplicate) {
        const pct = Math.round((result.matches[0]?.similarity ?? 0) * 100)
        setDuplicateWarning(`DUPLICATE: This title is identical or near-identical to an existing submission (${pct}% match). Submission is not allowed.`)
      } else if (result.matches.length > 0) {
        const pct = Math.round((result.matches[0].similarity ?? 0) * 100)
        setDuplicateWarning(`Similar title found (${pct}% match). Please verify your submission is not a duplicate before proceeding.`)
      } else {
        setDuplicateWarning(null)
      }
    } catch {
      // Network errors: silently ignore — don't block the user
    }
  }

  function goBack() {
    if (step?.backHref) router.push(step.backHref)
  }

  async function goNext() {
    if (!canProceed || !step) return

    if (step.key === 'verify-details') {
      await handleSubmit()
      return
    }

    if (step.nextHref) router.push(step.nextHref)
  }

  async function handleSubmit() {
    const session = getStudentSession()
    if (!session) {
      router.push('/student/login')
      return
    }

    const userId = session.studentId || session.email

    if (!pdfFile) {
      setSubmitError('Please upload a PDF file on step 3 before submitting.')
      return
    }

    setSubmitting(true)
    setSubmitError(null)

    try {
      const deptCode = getDeptCode(session.department)
      // Doc type is always determined by department — CS = thesis, IT/IS = capstone
      const docType: 'thesis' | 'capstone' = deptCode === 'CS' ? 'thesis' : 'capstone'
      const year = extractYear(draft.publishedOn)
      const buildAuthorName = (first: string, middle: string, last: string) =>
        [first, middle, last].filter(Boolean).join(' ')
      const authors = [
        buildAuthorName(draft.firstName, draft.middleName, draft.lastName),
        buildAuthorName(draft.author2FirstName, draft.author2MiddleName, draft.author2LastName),
        buildAuthorName(draft.author3FirstName, draft.author3MiddleName, draft.author3LastName),
        buildAuthorName(draft.author4FirstName, draft.author4MiddleName, draft.author4LastName),
        buildAuthorName(draft.author5FirstName, draft.author5MiddleName, draft.author5LastName),
      ].filter(Boolean)
      const keywords = draft.keywords
        .split(',')
        .map((k) => k.trim())
        .filter(Boolean)

      const formData = new FormData()
      formData.append('file', pdfFile)
      if (abstractFile) formData.append('abstract_file', abstractFile)
      if (itsoFile) formData.append('itso_file', itsoFile)
      formData.append('title', draft.title)
      formData.append('authors', JSON.stringify(authors))
      formData.append('department', deptCode)
      formData.append('type', docType)
      if (draft.trackSpecialization) formData.append('track_specialization', draft.trackSpecialization)
      if (draft.degree) formData.append('degree', draft.degree)
      if (draft.abstract) formData.append('abstract', draft.abstract)
      if (year) formData.append('year', String(year))
      if (draft.thesisAdvisor) formData.append('adviser', draft.thesisAdvisor)
      if (keywords.length) formData.append('keywords', JSON.stringify(keywords))

      await uploadDocument(formData)

      // Clear draft and pending files on success
      _pendingPdfFile = null
      _pendingAbstractFile = null
      _pendingItsoFile = null
      clearDraft(userId)

      router.push('/student/submissions/new/confirmation')
    } catch (err: unknown) {
      setSubmitError(err instanceof Error ? err.message : 'Submission failed. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  if (!step) {
    return (
      <div className="mx-auto max-w-[760px] space-y-3">
        <h1 className="text-[28px] font-semibold text-navy">Submission step not found</h1>
        <Link href="/student/submissions/new/permission" className="text-sm text-[#0f766e] no-underline hover:underline">
          Return to submission start
        </Link>
      </div>
    )
  }

  const isVerifyStep = step.key === 'verify-details'
  const missingFile = isVerifyStep && (
    pdfFile === null ||
    (!isCSStudent && (abstractFile === null || itsoFile === null))
  )
  const deptCode = getDeptCode(draft.department)
  const pageTitle = deptCode === 'CS' ? 'Submit New Thesis' : 'Submit New Capstone'
  
  // Debug: log department info
  console.log('DEBUG - Department:', draft.department, 'Code:', deptCode, 'Title:', pageTitle)

  return (
    <SubmissionStepLayout
      step={step.index}
      sectionTitle={step.sectionTitle}
      pageTitle={pageTitle}
      footer={
        <div className="space-y-2">
          {submitError && (
            <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{submitError}</p>
          )}
          {missingFile && (
            <p className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-700">
              {pdfFile === null
                ? 'No thesis/capstone PDF selected.'
                : 'ACM and ITSO abstract PDFs are required for IT and IS students.'
              } Please go back to step 3 and upload the required files.
            </p>
          )}
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Button variant="outline" asChild className="h-10">
                <Link href="/student/dashboard" className="no-underline">Cancel</Link>
              </Button>
              {step.backHref ? (
                <Button variant="outline" className="h-10" onClick={goBack}>
                  ← Back
                </Button>
              ) : null}
            </div>
            {step.nextLabel ? (
              <Button
                className="h-10 px-6 bg-[#0f766e] hover:bg-[#0d6460]"
                onClick={goNext}
                disabled={!canProceed || submitting}
              >
                {submitting ? (
                  <span className="flex items-center gap-2">
                    <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"/></svg>
                    Uploading…
                  </span>
                ) : step.nextLabel}
              </Button>
            ) : null}
          </div>
        </div>
      }
    >
      <SubmissionStepContent
        step={step}
        draft={draft}
        onDraftChange={updateDraft}
        pdfFile={pdfFile}
        onFileChange={setPdfFile}
        abstractFile={abstractFile}
        onAbstractFileChange={setAbstractFile}
        itsoFile={itsoFile}
        onItsoFileChange={setItsoFile}
        abstractRequired={!isCSStudent}
        duplicateWarning={duplicateWarning}
        onTitleBlur={handleTitleBlur}
      />
    </SubmissionStepLayout>
  )
}
