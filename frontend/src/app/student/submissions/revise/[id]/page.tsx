"use client"

import { use, useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { AlertTriangle, CheckCircle2, Upload } from 'lucide-react'
import { Button, Card, CardContent, CardHeader, CardTitle, Input, Label, Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui'
import { getMyDocuments, reviseDocument, type ApiDocument } from '@/lib/api/documents'
import { FILE_REQUIREMENTS } from '@/lib/utils'

const TRACKS_BY_DEPT: Record<string, { value: string; label: string }[]> = {
  CS: [
    { value: 'Core Computer Science', label: 'Core Computer Science' },
    { value: 'Game Development', label: 'Game Development' },
    { value: 'Data Science', label: 'Data Science' },
  ],
  IT: [
    { value: 'Network and Security', label: 'Network and Security' },
    { value: 'Web and Mobile App Development', label: 'Web and Mobile App Development' },
    { value: 'IT Automation Track', label: 'IT Automation Track' },
  ],
  IS: [
    { value: 'Business Analytics', label: 'Business Analytics' },
    { value: 'Service Management', label: 'Service Management' },
  ],
}

const DEPT_NAMES: Record<string, string> = {
  CS: 'Computer Science',
  IT: 'Information Technology',
  IS: 'Information Systems',
}

export default function StudentRevisionPage({ params: paramsPromise }: Readonly<{ params: Promise<{ id: string }> }>) {
  const params = use(paramsPromise)
  const router = useRouter()
  const { id } = params

  const [doc, setDoc] = useState<ApiDocument | null>(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  const [title, setTitle] = useState('')
  const [authorName, setAuthorName] = useState('')
  const [abstract, setAbstract] = useState('')
  const [keywords, setKeywords] = useState('')
  const [adviser, setAdviser] = useState('')
  const [trackSpecialization, setTrackSpecialization] = useState('')
  const [dateSubmitted, setDateSubmitted] = useState('')

  const [pdfFile, setPdfFile] = useState<File | null>(null)
  const [abstractFile, setAbstractFile] = useState<File | null>(null)
  const [itsoFile, setItsoFile] = useState<File | null>(null)

  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [submitted, setSubmitted] = useState(false)

  const fileInputRef = useRef<HTMLInputElement>(null)
  const abstractFileInputRef = useRef<HTMLInputElement>(null)
  const itsoFileInputRef = useRef<HTMLInputElement>(null)
  const [dragOver, setDragOver] = useState<'manuscript' | 'acm' | 'itso' | null>(null)

  function handleDrop(e: React.DragEvent, setter: (f: File | null) => void, zone: 'manuscript' | 'acm' | 'itso') {
    e.preventDefault()
    e.stopPropagation()
    setDragOver(null)
    const file = e.dataTransfer.files?.[0]
    if (file && (file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf'))) {
      setter(file)
    }
  }

  useEffect(() => {
    getMyDocuments()
      .then((docs) => {
        const found = docs.find((d) => d.id === id)
        if (!found) { setNotFound(true); return }
        if (found.status !== 'revision') { setNotFound(true); return }
        setDoc(found)
        setTitle(found.title)
        setAuthorName(Array.isArray(found.authors) ? found.authors.join(', ') : '')
        setAbstract(found.abstract ?? '')
        setKeywords(Array.isArray(found.keywords) ? found.keywords.join(', ') : '')
        setAdviser(found.adviser ?? '')
        setTrackSpecialization(found.track_specialization ?? '')
        if (found.year) setDateSubmitted(`${found.year}-01-01`)
      })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false))
  }, [id])

  const rawFeedback = doc?.reviews
    ?.filter((r) => r.decision === 'revise')
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0]
    ?.feedback_text ?? null

  const requireMatch = rawFeedback?.match(/^\[REQUIRE:([^\]]*)\]\n?/) ?? null
  const requiredFiles: string[] = requireMatch ? requireMatch[1].split(',').filter(Boolean) : []
  const requireManuscript = requiredFiles.includes('manuscript')
  const requireAcm = requiredFiles.includes('acm')
  const requireItso = requiredFiles.includes('itso')
  const latestFeedback = requireMatch && rawFeedback
    ? rawFeedback.slice(requireMatch[0].length) || null
    : rawFeedback

  const trackOptions = TRACKS_BY_DEPT[doc?.department ?? ''] ?? []

  const canSubmit =
    title.trim().length > 0 &&
    (!requireManuscript || pdfFile !== null) &&
    (!requireAcm || abstractFile !== null) &&
    (!requireItso || itsoFile !== null)

  async function handleSubmit() {
    if (!canSubmit || submitting) return
    setSubmitting(true)
    setSubmitError(null)
    try {
      const kwList = keywords.split(',').map((k) => k.trim()).filter(Boolean)
      const authorList = authorName.split(',').map((a) => a.trim()).filter(Boolean)
      const formData = new FormData()
      if (pdfFile) formData.append('file', pdfFile)
      if (abstractFile) formData.append('abstract_file', abstractFile)
      if (itsoFile) formData.append('itso_file', itsoFile)
      formData.append('title', title)
      formData.append('authors', JSON.stringify(authorList.length ? authorList : [authorName]))
      if (abstract) formData.append('abstract', abstract)
      if (adviser) formData.append('adviser', adviser)
      if (kwList.length) formData.append('keywords', JSON.stringify(kwList))
      if (trackSpecialization) formData.append('track_specialization', trackSpecialization)
      if (dateSubmitted) {
        const year = new Date(dateSubmitted).getFullYear()
        if (!isNaN(year)) formData.append('year', String(year))
      }
      await reviseDocument(id, formData)
      setSubmitted(true)
      setTimeout(() => router.push('/student/dashboard'), 3000)
    } catch (err: unknown) {
      setSubmitError(err instanceof Error ? err.message : 'Revision failed. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return <p className="py-12 text-center text-sm text-grey-500">Loading your submission…</p>
  }

  if (notFound) {
    return (
      <div className="mx-auto max-w-[760px] space-y-3 py-8">
        <h1 className="text-[28px] font-semibold text-navy">Submission not found</h1>
        <p className="text-sm text-grey-500">
          This document is either not yours, or is not currently awaiting revision.
        </p>
        <Link href="/student/dashboard" className="text-sm text-[#0f766e] hover:underline no-underline">
          ← Back to Dashboard
        </Link>
      </div>
    )
  }

  const today = new Date().toISOString().split('T')[0]

  if (submitted) {
    return (
      <div className="mx-auto max-w-[760px] py-16 flex flex-col items-center gap-4 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
          <CheckCircle2 className="h-8 w-8 text-green-600" />
        </div>
        <h2 className="text-2xl font-semibold text-navy">Revision Submitted!</h2>
        <p className="text-sm text-grey-500 max-w-sm">
          Your updated submission has been sent back for admin review. You will be notified once a decision is made.
        </p>
        <p className="text-xs text-grey-400">Redirecting you to your dashboard…</p>
        <Link href="/student/dashboard" className="mt-2 text-sm text-[#0f766e] hover:underline no-underline">
          Go to Dashboard now →
        </Link>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-[760px] space-y-4">
      <header>
        <h1 className="text-[28px] font-semibold text-navy leading-tight">Revise Submission</h1>
        <p className="mt-0.5 text-sm text-grey-500">Update your submission details and resubmit for review.</p>
      </header>

      {(latestFeedback || requiredFiles.length > 0) && (
        <div className="flex items-start gap-3 rounded-lg border border-violet-200 bg-violet-50 px-4 py-3">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-violet-600" />
          <div className="text-sm space-y-1.5">
            <p className="font-medium text-violet-800">Reviewer feedback</p>
            {latestFeedback && <p className="text-violet-700 whitespace-pre-wrap">{latestFeedback}</p>}
            {requiredFiles.length > 0 && (
              <div className="mt-1 rounded-md border border-amber-200 bg-amber-50 px-3 py-2">
                <p className="text-xs font-semibold text-amber-800">Required resubmission:</p>
                <ul className="mt-1 list-disc pl-4 text-xs text-amber-700">
                  {requireManuscript && <li>Complete Manuscript PDF</li>}
                  {requireAcm && <li>ACM Abstract PDF</li>}
                  {requireItso && <li>ITSO Abstract PDF</li>}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}

      {doc && (
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
          {[
            { label: 'Department', value: DEPT_NAMES[doc.department] ?? doc.department },
            { label: 'Document Type', value: doc.type.charAt(0).toUpperCase() + doc.type.slice(1) },
            { label: 'Program', value: doc.degree ?? '—' },
          ].map(({ label, value }) => (
            <div key={label} className="rounded-md border border-grey-200 bg-grey-50 p-3">
              <p className="text-[10px] uppercase tracking-wide text-grey-400">{label}</p>
              <p className="mt-0.5 text-sm font-medium text-grey-600">{value}</p>
            </div>
          ))}
        </div>
      )}

      {/* Document details — no <form> to avoid file-input navigation side effects */}
      <Card className="border border-grey-200 shadow-none">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-semibold text-navy">Document Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 p-4 pt-0">
          <div className="space-y-2">
            <Label htmlFor="title" className="text-sm font-medium text-grey-700">Title *</Label>
            <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} className="h-11 border-grey-200" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="authors" className="text-sm font-medium text-grey-700">Authors</Label>
            <Input id="authors" value={authorName} onChange={(e) => setAuthorName(e.target.value)} placeholder="Comma-separated author names" className="h-11 border-grey-200" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="adviser" className="text-sm font-medium text-grey-700">Technical Adviser</Label>
            <Input id="adviser" value={adviser} onChange={(e) => setAdviser(e.target.value)} className="h-11 border-grey-200" />
          </div>

          {trackOptions.length > 0 && (
            <div className="space-y-2">
              <Label className="text-sm font-medium text-grey-700">Specialization Track</Label>
              <Select value={trackSpecialization} onValueChange={setTrackSpecialization}>
                <SelectTrigger className="h-11 border-grey-200">
                  <SelectValue placeholder="Select your track..." />
                </SelectTrigger>
                <SelectContent>
                  {trackOptions.map((t) => (
                    <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="dateSubmitted" className="text-sm font-medium text-grey-700">Date Submitted (final manuscript)</Label>
            <Input id="dateSubmitted" type="date" max={today} value={dateSubmitted} onChange={(e) => setDateSubmitted(e.target.value)} className="h-11 border-grey-200" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="keywords" className="text-sm font-medium text-grey-700">Keywords</Label>
            <Input id="keywords" value={keywords} onChange={(e) => setKeywords(e.target.value)} placeholder="Comma-separated keywords" className="h-11 border-grey-200" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="abstract" className="text-sm font-medium text-grey-700">Abstract</Label>
            <textarea
              id="abstract"
              value={abstract}
              onChange={(e) => setAbstract(e.target.value)}
              rows={6}
              className="w-full rounded-md border border-grey-200 px-3 py-2 text-sm text-grey-700 outline-none focus-visible:ring-2 focus-visible:ring-[#0f766e]"
            />
          </div>
        </CardContent>
      </Card>

      {/* Manuscript PDF upload */}
      {(requireManuscript || requiredFiles.length === 0) && (
        <Card className={`shadow-none ${requireManuscript ? 'border border-amber-300' : 'border border-grey-200'}`}>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold text-navy flex items-center gap-2">
              Complete Manuscript PDF
              {requireManuscript
                ? <span className="text-xs font-semibold text-amber-700 bg-amber-100 border border-amber-200 rounded-full px-2 py-0.5">Required</span>
                : null}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 p-4 pt-0">
            {requireManuscript
              ? <p className="text-xs text-amber-700">The reviewer has requested a new manuscript. You must upload a replacement to resubmit.</p>
              : <p className="text-xs text-grey-500">Leave blank to keep the existing file.</p>}
            <div
              role="button"
              tabIndex={0}
              onClick={() => fileInputRef.current?.click()}
              onKeyDown={(e) => e.key === 'Enter' && fileInputRef.current?.click()}
              onDragOver={(e) => { e.preventDefault(); setDragOver('manuscript') }}
              onDragEnter={(e) => { e.preventDefault(); setDragOver('manuscript') }}
              onDragLeave={() => setDragOver(null)}
              onDrop={(e) => handleDrop(e, setPdfFile, 'manuscript')}
              className={`flex cursor-pointer flex-col items-center justify-center rounded-md border-2 border-dashed py-8 transition-colors ${dragOver === 'manuscript' ? 'border-[#0f766e] bg-[#f0fdf9]' : requireManuscript && !pdfFile ? 'border-amber-300 bg-amber-50 hover:border-amber-400' : 'border-grey-200 bg-white hover:border-[#0f766e] hover:bg-[#f0fdf9]'}`}
            >
              <Upload className="mb-2 h-8 w-8 text-grey-400" />
              {pdfFile ? (
                <div className="text-center px-4">
                  <p className="text-sm font-medium text-[#0f766e]">{pdfFile.name}</p>
                  <p className="text-xs text-grey-500 mt-0.5">{(pdfFile.size / 1024 / 1024).toFixed(2)} MB — click or drag to replace</p>
                </div>
              ) : (
                <p className="text-sm text-grey-500">Click or drag a PDF file here</p>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,application/pdf"
                className="sr-only"
                onChange={(e) => setPdfFile(e.target.files?.[0] ?? null)}
              />
            </div>
            <ul className="list-disc space-y-0.5 pl-5 text-xs text-grey-500">
              {FILE_REQUIREMENTS.map((req) => <li key={req}>{req}</li>)}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* ACM Abstract upload */}
      {(requireAcm || (requiredFiles.length === 0 && doc?.department !== 'CS')) && (
        <Card className={`shadow-none ${requireAcm ? 'border border-amber-300' : 'border border-grey-200'}`}>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold text-navy flex items-center gap-2">
              ACM Abstract in PDF
              {requireAcm
                ? <span className="text-xs font-semibold text-amber-700 bg-amber-100 border border-amber-200 rounded-full px-2 py-0.5">Required</span>
                : null}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 p-4 pt-0">
            {requireAcm
              ? <p className="text-xs text-amber-700">The reviewer has requested a new ACM abstract. You must upload a replacement to resubmit.</p>
              : <p className="text-xs text-grey-500">Leave blank to keep the existing ACM file.</p>}
            <div
              role="button"
              tabIndex={0}
              onClick={() => abstractFileInputRef.current?.click()}
              onKeyDown={(e) => e.key === 'Enter' && abstractFileInputRef.current?.click()}
              onDragOver={(e) => { e.preventDefault(); setDragOver('acm') }}
              onDragEnter={(e) => { e.preventDefault(); setDragOver('acm') }}
              onDragLeave={() => setDragOver(null)}
              onDrop={(e) => handleDrop(e, setAbstractFile, 'acm')}
              className={`flex cursor-pointer flex-col items-center justify-center rounded-md border-2 border-dashed py-8 transition-colors ${dragOver === 'acm' ? 'border-[#0f766e] bg-[#f0fdf9]' : requireAcm && !abstractFile ? 'border-amber-300 bg-amber-50 hover:border-amber-400' : 'border-grey-200 bg-white hover:border-[#0f766e] hover:bg-[#f0fdf9]'}`}
            >
              <Upload className="mb-2 h-8 w-8 text-grey-400" />
              {abstractFile ? (
                <div className="text-center px-4">
                  <p className="text-sm font-medium text-[#0f766e]">{abstractFile.name}</p>
                  <p className="text-xs text-grey-500 mt-0.5">{(abstractFile.size / 1024 / 1024).toFixed(2)} MB — click or drag to replace</p>
                </div>
              ) : (
                <p className="text-sm text-grey-500">Click or drag an ACM abstract PDF here</p>
              )}
              <input
                ref={abstractFileInputRef}
                type="file"
                accept=".pdf,application/pdf"
                className="sr-only"
                onChange={(e) => setAbstractFile(e.target.files?.[0] ?? null)}
              />
            </div>
          </CardContent>
        </Card>
      )}

      {/* ITSO Abstract upload */}
      {(requireItso || (requiredFiles.length === 0 && doc?.department !== 'CS')) && (
        <Card className={`shadow-none ${requireItso ? 'border border-amber-300' : 'border border-grey-200'}`}>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold text-navy flex items-center gap-2">
              ITSO Abstract in PDF
              {requireItso
                ? <span className="text-xs font-semibold text-amber-700 bg-amber-100 border border-amber-200 rounded-full px-2 py-0.5">Required</span>
                : null}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 p-4 pt-0">
            {requireItso
              ? <p className="text-xs text-amber-700">The reviewer has requested a new ITSO abstract. You must upload a replacement to resubmit.</p>
              : <p className="text-xs text-grey-500">Leave blank to keep the existing ITSO file.</p>}
            <div
              role="button"
              tabIndex={0}
              onClick={() => itsoFileInputRef.current?.click()}
              onKeyDown={(e) => e.key === 'Enter' && itsoFileInputRef.current?.click()}
              onDragOver={(e) => { e.preventDefault(); setDragOver('itso') }}
              onDragEnter={(e) => { e.preventDefault(); setDragOver('itso') }}
              onDragLeave={() => setDragOver(null)}
              onDrop={(e) => handleDrop(e, setItsoFile, 'itso')}
              className={`flex cursor-pointer flex-col items-center justify-center rounded-md border-2 border-dashed py-8 transition-colors ${dragOver === 'itso' ? 'border-[#0f766e] bg-[#f0fdf9]' : requireItso && !itsoFile ? 'border-amber-300 bg-amber-50 hover:border-amber-400' : 'border-grey-200 bg-white hover:border-[#0f766e] hover:bg-[#f0fdf9]'}`}
            >
              <Upload className="mb-2 h-8 w-8 text-grey-400" />
              {itsoFile ? (
                <div className="text-center px-4">
                  <p className="text-sm font-medium text-[#0f766e]">{itsoFile.name}</p>
                  <p className="text-xs text-grey-500 mt-0.5">{(itsoFile.size / 1024 / 1024).toFixed(2)} MB — click or drag to replace</p>
                </div>
              ) : (
                <p className="text-sm text-grey-500">Click or drag an ITSO abstract PDF here</p>
              )}
              <input
                ref={itsoFileInputRef}
                type="file"
                accept=".pdf,application/pdf"
                className="sr-only"
                onChange={(e) => setItsoFile(e.target.files?.[0] ?? null)}
              />
            </div>
          </CardContent>
        </Card>
      )}

      {submitError && (
        <p className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{submitError}</p>
      )}

      <div className="flex items-center justify-between gap-3 pb-4">
        <Button variant="outline" asChild className="h-10">
          <Link href="/student/dashboard" className="no-underline">Cancel</Link>
        </Button>
        <Button
          type="button"
          disabled={submitting || !canSubmit}
          onClick={handleSubmit}
          className="h-10 px-6 bg-[#0f766e] hover:bg-[#0d6460]"
        >
          {submitting ? 'Resubmitting…' : 'Resubmit for Review →'}
        </Button>
      </div>
    </div>
  )
}
