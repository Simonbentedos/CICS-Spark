"use client"

import { use, useEffect, useState } from 'react'
import { CICSHeader, CICSFooter, SecondaryNav, Sidebar } from '@/components/layout'
import { ThesisDetailView } from '@/components/thesis'
import { capstoneCollections, getCapstoneTracksByCollection } from '@/lib/utils/capstone-data'
import { type ThesisEntry } from '@/lib/utils/theses-data'
import { getDocumentById, submitFulltextRequest } from '@/lib/api/documents'
import { Button, Dialog, Input, Label } from '@/components/ui'
import { apiDocToEntry } from '@/lib/utils/api-adapters'

interface CapstoneItemPageProps {
  params: Promise<{ collection: string; track: string; item: string }>
}

export default function CapstoneItemPage({ params: paramsPromise }: Readonly<CapstoneItemPageProps>) {
  const params = use(paramsPromise)
  const collection = capstoneCollections.find((c) => c.slug === params.collection)
  const track = collection ? getCapstoneTracksByCollection(collection.slug).find((t) => t.slug === params.track) : undefined

  const [entry, setEntry] = useState<ThesisEntry | null>(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  // Fulltext request modal state
  const [showFulltextModal, setShowFulltextModal] = useState(false)
  const [ftName, setFtName] = useState('')
  const [ftEmail, setFtEmail] = useState('')
  const [ftPurpose, setFtPurpose] = useState('')
  const [ftDept, setFtDept] = useState('')
  const [ftSubmitting, setFtSubmitting] = useState(false)
  const [ftSuccess, setFtSuccess] = useState(false)
  const [ftError, setFtError] = useState<string | null>(null)

  useEffect(() => {
    getDocumentById(params.item)
      .then((doc) => setEntry(apiDocToEntry(doc)))
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false))
  }, [params.item])

  async function handleFulltextSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!ftName.trim() || !ftEmail.trim() || !ftPurpose.trim() || !ftDept.trim()) return
    setFtSubmitting(true)
    setFtError(null)
    try {
      await submitFulltextRequest({
        document_id: params.item,
        requester_name: ftName.trim(),
        requester_email: ftEmail.trim(),
        purpose: ftPurpose.trim(),
        department: ftDept.trim(),
      })
      setFtSuccess(true)
      // Keep modal open to show success state — user dismisses it themselves
    } catch (err: unknown) {
      setFtError(err instanceof Error ? err.message : 'Failed to submit request.')
    } finally {
      setFtSubmitting(false)
    }
  }

  const breadcrumbs = [
    { label: 'Home', href: '/' },
    { label: 'Capstone', href: '/capstone' },
    ...(collection ? [{ label: collection.title, href: `/capstone/${collection.slug}` }] : []),
    ...(collection && track ? [{ label: track.title, href: `/capstone/${collection.slug}/${track.slug}` }] : []),
    { label: 'Item Result' },
  ]

  return (
    <div className="min-h-screen bg-bg-grey flex flex-col">
      <CICSHeader />

      <SecondaryNav
        title={(collection?.title ?? 'Capstone').toUpperCase()}
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
                collectionTitle={collection && track ? `${collection.title} - ${track.title}` : 'Capstone'}
                entry={entry}
                documentId={params.item}
                onRequestFulltext={() => {
                  setShowFulltextModal(true)
                  setFtSuccess(false)
                  setFtError(null)
                }}
              />

              <p className="mt-3 font-mono text-[11px] text-grey-400">
                OAI Identifier: oai:spark.cics:{params.item}
              </p>

            </>
          )}
        </main>
      </div>

      {/* Full-text Request Modal */}
      <Dialog
        open={showFulltextModal}
        onClose={() => { setShowFulltextModal(false); setFtSuccess(false) }}
        title={ftSuccess ? 'Request Submitted' : 'Request Full Text Access'}
      >
        {ftSuccess ? (
          <div className="space-y-4 text-center py-2">
            <div className="flex items-center justify-center">
              <span className="text-green-500 text-5xl">✓</span>
            </div>
            <p className="text-sm font-medium text-grey-700">Your full-text request has been submitted successfully.</p>
            <p className="text-sm text-grey-500">The admin will review your request and contact you by email.</p>
            <Button
              className="h-10 w-full bg-[#337ab7] hover:bg-[#2f6ea1] rounded-md"
              onClick={() => { setShowFulltextModal(false); setFtSuccess(false) }}
            >
              Close
            </Button>
          </div>
        ) : (
          <>
            <p className="text-sm text-grey-500 mb-4">Fill out this form and the admin will send the full PDF to your email.</p>
            <form onSubmit={handleFulltextSubmit} className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="ft-name" className="text-sm font-medium text-grey-700">Full Name *</Label>
                  <Input id="ft-name" required value={ftName} onChange={(e) => setFtName(e.target.value)} className="h-10 border-grey-200" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="ft-email" className="text-sm font-medium text-grey-700">Email Address *</Label>
                  <Input id="ft-email" type="email" required value={ftEmail} onChange={(e) => setFtEmail(e.target.value)} className="h-10 border-grey-200" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="ft-dept" className="text-sm font-medium text-grey-700">Department / Affiliation *</Label>
                <select
                  id="ft-dept"
                  required
                  value={ftDept}
                  onChange={(e) => setFtDept(e.target.value)}
                  className="w-full h-10 rounded-md border border-grey-200 px-3 text-sm text-grey-700 outline-none focus-visible:ring-2 focus-visible:ring-[#337ab7]"
                >
                  <option value="">Select department...</option>
                  <option value="CS">Computer Science (CS)</option>
                  <option value="IT">Information Technology (IT)</option>
                  <option value="IS">Information Systems (IS)</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div className="space-y-2">
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
              <div className="flex items-center gap-3 pt-2">
                <Button type="submit" disabled={ftSubmitting} className="h-10 bg-[#337ab7] hover:bg-[#2f6ea1] rounded-md px-6">
                  {ftSubmitting ? 'Submitting…' : 'Submit Request'}
                </Button>
                <button type="button" onClick={() => setShowFulltextModal(false)} className="text-sm text-grey-500 hover:text-grey-700">
                  Cancel
                </button>
              </div>
            </form>
          </>
        )}
      </Dialog>

      <CICSFooter />
    </div>
  )
}
