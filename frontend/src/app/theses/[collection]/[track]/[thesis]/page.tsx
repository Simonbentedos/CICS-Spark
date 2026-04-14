"use client"

import { use, useEffect, useRef, useState } from 'react'
import { CICSHeader, CICSFooter, SecondaryNav, Sidebar } from '@/components/layout'
import { ThesisDetailView } from '@/components/thesis'
import { thesisCollections, getThesisTracksByCollection, type ThesisEntry } from '@/lib/utils/theses-data'
import { getDocumentById, submitFulltextRequest } from '@/lib/api/documents'
import { Button, Card, CardContent, Input, Label } from '@/components/ui'
import { apiDocToEntry } from '@/lib/utils/api-adapters'

interface ThesisItemPageProps {
  params: Promise<{ collection: string; track: string; thesis: string }>
}

export default function ThesisItemPage({ params: paramsPromise }: Readonly<ThesisItemPageProps>) {
  const params = use(paramsPromise)
  const collection = thesisCollections.find((c) => c.slug === params.collection)
  const track = collection ? getThesisTracksByCollection(collection.slug).find((t) => t.slug === params.track) : undefined

  const [entry, setEntry] = useState<ThesisEntry | null>(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const fulltextFormRef = useRef<HTMLDivElement>(null)

  // Fulltext request form state
  const [showFulltextForm, setShowFulltextForm] = useState(false)
  const [ftName, setFtName] = useState('')
  const [ftEmail, setFtEmail] = useState('')
  const [ftPurpose, setFtPurpose] = useState('')
  const [ftDept, setFtDept] = useState('')
  const [ftSubmitting, setFtSubmitting] = useState(false)
  const [ftSuccess, setFtSuccess] = useState(false)
  const [ftError, setFtError] = useState<string | null>(null)

  useEffect(() => {
    getDocumentById(params.thesis)
      .then((doc) => setEntry(apiDocToEntry(doc)))
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false))
  }, [params.thesis])

  async function handleFulltextSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!ftName.trim() || !ftEmail.trim() || !ftPurpose.trim()) return
    setFtSubmitting(true)
    setFtError(null)
    try {
      await submitFulltextRequest({
        document_id: params.thesis,
        requester_name: ftName.trim(),
        requester_email: ftEmail.trim(),
        purpose: ftPurpose.trim(),
        department: ftDept.trim(),
      })
      setFtSuccess(true)
      setShowFulltextForm(false)
    } catch (err: unknown) {
      setFtError(err instanceof Error ? err.message : 'Failed to submit request.')
    } finally {
      setFtSubmitting(false)
    }
  }

  const breadcrumbs = [
    { label: 'Home', href: '/' },
    { label: 'Thesis', href: '/theses' },
    ...(collection ? [{ label: collection.title, href: `/theses/${collection.slug}` }] : []),
    ...(collection && track ? [{ label: track.title, href: `/theses/${collection.slug}/${track.slug}` }] : []),
    { label: 'Item Result' },
  ]

  return (
    <div className="min-h-screen bg-bg-grey flex flex-col">
      <CICSHeader />

      <SecondaryNav
        title={(collection?.title ?? 'Thesis').toUpperCase()}
        breadcrumbItems={breadcrumbs}
      />

      <div className="flex flex-1 px-8 lg:px-[300px] gap-6">
        <Sidebar />

        <main className="flex-1 min-w-0 pt-7 pb-5">
          {loading && <p className="text-sm text-[#888888]">Loading…</p>}

          {!loading && (notFound || !entry) && (
            <p className="text-sm text-[#888888]">Document not found or not publicly available.</p>
          )}

          {!loading && entry && (
            <>
              <ThesisDetailView
                collectionTitle={collection && track ? `${collection.title} - ${track.title}` : 'Thesis'}
                entry={entry}
                documentId={params.thesis}
                onRequestFulltext={() => {
                  setShowFulltextForm(true)
                  setFtSuccess(false)
                  setTimeout(() => fulltextFormRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 50)
                }}
              />

              {ftSuccess && (
                <div className="mt-6 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
                  Your full-text request has been submitted. The admin will contact you by email.
                </div>
              )}

              {showFulltextForm && (
                <div ref={fulltextFormRef}>
                <Card className="mt-6 border border-grey-200 shadow-none">
                  <CardContent className="p-5 space-y-4">
                    <h3 className="text-base font-semibold text-navy">Request Full Text Access</h3>
                    <p className="text-xs text-grey-500">Fill out this form and the admin will send the full PDF to your email.</p>
                    <form onSubmit={handleFulltextSubmit} className="space-y-3">
                      <div className="grid gap-3 sm:grid-cols-2">
                        <div className="space-y-1.5">
                          <Label htmlFor="ft-name" className="text-sm font-medium text-grey-700">Full Name *</Label>
                          <Input id="ft-name" required value={ftName} onChange={(e) => setFtName(e.target.value)} className="h-10 border-grey-200" />
                        </div>
                        <div className="space-y-1.5">
                          <Label htmlFor="ft-email" className="text-sm font-medium text-grey-700">Email Address *</Label>
                          <Input id="ft-email" type="email" required value={ftEmail} onChange={(e) => setFtEmail(e.target.value)} className="h-10 border-grey-200" />
                        </div>
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor="ft-dept" className="text-sm font-medium text-grey-700">Department / Affiliation</Label>
                        <Input id="ft-dept" value={ftDept} onChange={(e) => setFtDept(e.target.value)} className="h-10 border-grey-200" />
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor="ft-purpose" className="text-sm font-medium text-grey-700">Purpose *</Label>
                        <textarea
                          id="ft-purpose"
                          required
                          rows={3}
                          value={ftPurpose}
                          onChange={(e) => setFtPurpose(e.target.value)}
                          placeholder="Briefly describe your purpose for requesting the full text…"
                          className="w-full rounded-md border border-grey-200 px-3 py-2 text-sm text-grey-700 outline-none focus-visible:ring-2 focus-visible:ring-[#337ab7]"
                        />
                      </div>
                      {ftError && <p className="text-sm text-red-600">{ftError}</p>}
                      <div className="flex items-center gap-3">
                        <Button type="submit" disabled={ftSubmitting} className="h-9 bg-[#337ab7] hover:bg-[#2f6ea1] rounded-none">
                          {ftSubmitting ? 'Submitting…' : 'Submit Request'}
                        </Button>
                        <button type="button" onClick={() => setShowFulltextForm(false)} className="text-sm text-grey-500 hover:text-grey-700">
                          Cancel
                        </button>
                      </div>
                    </form>
                  </CardContent>
                </Card>
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
