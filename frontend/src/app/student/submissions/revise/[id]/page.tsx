"use client"

import { use, useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { AlertTriangle, Upload } from 'lucide-react'
import { Button, Card, CardContent, CardHeader, CardTitle, Input, Label } from '@/components/ui'
import { getMyDocuments, reviseDocument, type ApiDocument } from '@/lib/api/documents'
import { FILE_REQUIREMENTS } from '@/lib/utils'

export default function StudentRevisionPage({ params: paramsPromise }: Readonly<{ params: Promise<{ id: string }> }>) {
  const params = use(paramsPromise)
  const router = useRouter()
  const { id } = params

  const [doc, setDoc] = useState<ApiDocument | null>(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  // Editable fields (pre-filled from the document)
  const [title, setTitle] = useState('')
  const [authorName, setAuthorName] = useState('')
  const [abstract, setAbstract] = useState('')
  const [keywords, setKeywords] = useState('')
  const [adviser, setAdviser] = useState('')

  // New PDF (optional — only replace if the student selects a new file)
  const [pdfFile, setPdfFile] = useState<File | null>(null)

  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  const fileInputRef = useRef<HTMLInputElement>(null)

  // ── Load the document ────────────────────────────────────────────────────────

  useEffect(() => {
    getMyDocuments()
      .then((docs) => {
        const found = docs.find((d) => d.id === id)
        if (!found) {
          setNotFound(true)
          return
        }
        if (found.status !== 'revision') {
          setNotFound(true)
          return
        }
        setDoc(found)
        setTitle(found.title)
        setAuthorName(Array.isArray(found.authors) ? found.authors.join(', ') : '')
        setAbstract(found.abstract ?? '')
        setKeywords(Array.isArray(found.keywords) ? found.keywords.join(', ') : '')
        setAdviser(found.adviser ?? '')
      })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false))
  }, [id])

  // ── Derive the latest review feedback ────────────────────────────────────────

  const latestFeedback = doc?.reviews
    ?.filter((r) => r.decision === 'revise')
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0]
    ?.feedback_text ?? null

  // ── Submit revision ──────────────────────────────────────────────────────────

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!title.trim()) return

    setSubmitting(true)
    setSubmitError(null)

    try {
      const kwList = keywords.split(',').map((k) => k.trim()).filter(Boolean)
      const authorList = authorName.split(',').map((a) => a.trim()).filter(Boolean)

      const formData = new FormData()
      if (pdfFile) formData.append('file', pdfFile)
      formData.append('title', title)
      formData.append('authors', JSON.stringify(authorList.length ? authorList : [authorName]))
      if (abstract) formData.append('abstract', abstract)
      if (adviser) formData.append('adviser', adviser)
      if (kwList.length) formData.append('keywords', JSON.stringify(kwList))

      await reviseDocument(id, formData)
      router.push('/student/dashboard')
    } catch (err: unknown) {
      setSubmitError(err instanceof Error ? err.message : 'Revision failed. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  // ── Render states ────────────────────────────────────────────────────────────

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

  return (
    <div className="mx-auto max-w-[760px] space-y-4">
      <header>
        <h1 className="text-[28px] font-semibold text-navy leading-tight">Revise Submission</h1>
        <p className="mt-0.5 text-sm text-grey-500">
          Update your submission and resubmit it for review.
        </p>
      </header>

      {/* Admin feedback */}
      {latestFeedback && (
        <div className="flex items-start gap-3 rounded-lg border border-violet-200 bg-violet-50 px-4 py-3">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-violet-600" />
          <div className="text-sm">
            <p className="font-medium text-violet-800">Reviewer feedback</p>
            <p className="mt-1 text-violet-700 whitespace-pre-wrap">{latestFeedback}</p>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Metadata fields */}
        <Card className="border border-grey-200 shadow-none">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold text-navy">Document Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 p-4 pt-0">
            <div className="space-y-2">
              <Label htmlFor="title" className="text-sm font-medium text-grey-700">Title *</Label>
              <Input
                id="title"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="h-11 border-grey-200"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="authors" className="text-sm font-medium text-grey-700">Authors</Label>
              <Input
                id="authors"
                value={authorName}
                onChange={(e) => setAuthorName(e.target.value)}
                placeholder="Comma-separated author names"
                className="h-11 border-grey-200"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="adviser" className="text-sm font-medium text-grey-700">Thesis Adviser</Label>
              <Input
                id="adviser"
                value={adviser}
                onChange={(e) => setAdviser(e.target.value)}
                className="h-11 border-grey-200"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="keywords" className="text-sm font-medium text-grey-700">Keywords</Label>
              <Input
                id="keywords"
                value={keywords}
                onChange={(e) => setKeywords(e.target.value)}
                placeholder="Comma-separated keywords"
                className="h-11 border-grey-200"
              />
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

        {/* File replacement */}
        <Card className="border border-grey-200 shadow-none">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold text-navy">Replace PDF (optional)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 p-4 pt-0">
            <p className="text-xs text-grey-500">
              Leave blank to keep the existing file. Upload a new PDF only if you need to replace it.
            </p>
            <label className="flex cursor-pointer flex-col items-center justify-center rounded-md border-2 border-dashed border-grey-200 bg-white py-8 hover:border-[#0f766e] hover:bg-[#f0fdf9] transition-colors">
              <Upload className="mb-2 h-8 w-8 text-grey-400" />
              {pdfFile ? (
                <div className="text-center px-4">
                  <p className="text-sm font-medium text-[#0f766e]">{pdfFile.name}</p>
                  <p className="text-xs text-grey-500 mt-0.5">{(pdfFile.size / 1024 / 1024).toFixed(2)} MB — click to replace</p>
                </div>
              ) : (
                <p className="text-sm text-grey-500">Click to choose a PDF file</p>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,application/pdf"
                className="sr-only"
                onChange={(e) => setPdfFile(e.target.files?.[0] ?? null)}
              />
            </label>

            <ul className="list-disc space-y-0.5 pl-5 text-xs text-grey-500">
              {FILE_REQUIREMENTS.map((req) => <li key={req}>{req}</li>)}
            </ul>
          </CardContent>
        </Card>

        {submitError && (
          <p className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{submitError}</p>
        )}

        <div className="flex items-center justify-between gap-3 pb-4">
          <Button variant="outline" asChild className="h-10">
            <Link href="/student/dashboard" className="no-underline">Cancel</Link>
          </Button>
          <Button
            type="submit"
            disabled={submitting || !title.trim()}
            className="h-10 px-6 bg-[#0f766e] hover:bg-[#0d6460]"
          >
            {submitting ? 'Resubmitting…' : 'Resubmit for Review →'}
          </Button>
        </div>
      </form>
    </div>
  )
}
