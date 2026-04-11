'use client'

import { Upload } from 'lucide-react'
import { Button, Input, Label } from '@/components/ui'
import {
  FILE_REQUIREMENTS,
  SUBMISSION_DOCUMENT_TYPES,
} from '@/lib/utils'
import type { SubmissionDraft, SubmissionStepKey, SubmissionStepMeta } from '@/types/admin'

type SubmissionStepContentProps = {
  step: SubmissionStepMeta
  draft: SubmissionDraft
  onDraftChange: (patch: Partial<SubmissionDraft>) => void
  /** When provided, a real <input type="file"> is rendered instead of the filename text input */
  pdfFile?: File | null
  onFileChange?: (file: File | null) => void
  duplicateWarning?: string | null
  onTitleBlur?: () => void
}

export default function SubmissionStepContent({ step, draft, onDraftChange, pdfFile, onFileChange, duplicateWarning, onTitleBlur }: Readonly<SubmissionStepContentProps>) {
  if (step.key === 'basic-info') {
    return (
      <>
        <div className="space-y-2">
          <Label htmlFor="title" className="text-sm font-medium text-grey-700">Title *</Label>
          <Input
            id="title"
            placeholder="Enter thesis title..."
            className="h-11 border-grey-200"
            value={draft.title}
            onChange={(event) => onDraftChange({ title: event.target.value })}
            onBlur={onTitleBlur}
          />
          {duplicateWarning ? (
            <p className="text-xs text-amber-700 rounded-md border border-amber-200 bg-amber-50 px-3 py-2">{duplicateWarning}</p>
          ) : null}
        </div>

        <div className="grid gap-3 md:grid-cols-3">
          <div className="space-y-2">
            <Label htmlFor="firstName" className="text-sm font-medium text-grey-700">First Name *</Label>
            <Input id="firstName" className="h-11 border-grey-200" value={draft.firstName} onChange={(event) => onDraftChange({ firstName: event.target.value })} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="middleName" className="text-sm font-medium text-grey-700">Middle Name</Label>
            <Input id="middleName" className="h-11 border-grey-200" value={draft.middleName} onChange={(event) => onDraftChange({ middleName: event.target.value })} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="lastName" className="text-sm font-medium text-grey-700">Last Name *</Label>
            <Input id="lastName" className="h-11 border-grey-200" value={draft.lastName} onChange={(event) => onDraftChange({ lastName: event.target.value })} />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="publishedOn" className="text-sm font-medium text-grey-700">Date of Publication *</Label>
          <Input
            id="publishedOn"
            placeholder="MM/DD/YYYY"
            className="h-11 border-grey-200"
            value={draft.publishedOn}
            onChange={(event) => onDraftChange({ publishedOn: event.target.value })}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="department" className="text-sm font-medium text-grey-700">Department/College *</Label>
          <Input id="department" className="h-11 border-grey-200" value={draft.department} onChange={(event) => onDraftChange({ department: event.target.value })} />
        </div>

        <fieldset className="space-y-2">
          <legend className="text-sm font-medium text-grey-700">Document Type *</legend>
          <div className="space-y-1 text-sm text-grey-700">
            {SUBMISSION_DOCUMENT_TYPES.map((documentType) => (
              <label key={documentType} className="flex items-center gap-2">
                <input
                  type="radio"
                  name="documentType"
                  checked={draft.documentType === documentType}
                  onChange={() => onDraftChange({ documentType })}
                  className="border-grey-300 accent-cics-maroon focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cics-maroon focus-visible:ring-offset-1"
                />
                {documentType}
              </label>
            ))}
          </div>
        </fieldset>

        <div className="space-y-2">
          <Label htmlFor="degree" className="text-sm font-medium text-grey-700">Degree Name</Label>
          <Input
            id="degree"
            placeholder="e.g., Master of Science in Computer Science"
            className="h-11 border-grey-200"
            value={draft.degree}
            onChange={(event) => onDraftChange({ degree: event.target.value })}
          />
        </div>
      </>
    )
  }

  if (step.key === 'academic-details') {
    return (
      <>
        <div className="space-y-2">
          <Label htmlFor="advisor" className="text-sm font-medium text-grey-700">Thesis Advisor *</Label>
          <Input id="advisor" placeholder="Enter advisor name..." className="h-11 border-grey-200" value={draft.thesisAdvisor} onChange={(event) => onDraftChange({ thesisAdvisor: event.target.value })} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="chair" className="text-sm font-medium text-grey-700">Defense Panel Chair</Label>
          <Input id="chair" placeholder="Enter panel chair name..." className="h-11 border-grey-200" value={draft.panelChair} onChange={(event) => onDraftChange({ panelChair: event.target.value })} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="panelMembers" className="text-sm font-medium text-grey-700">Defense Panel Members</Label>
          <textarea
            id="panelMembers"
            value={draft.panelMembers}
            onChange={(event) => onDraftChange({ panelMembers: event.target.value })}
            placeholder="Enter panel members (one per line)..."
            className="min-h-[110px] w-full rounded-md border border-grey-200 px-3 py-2 text-sm text-grey-700 outline-none focus-visible:ring-2 focus-visible:ring-cics-maroon"
          />
          <p className="text-[11px] text-grey-500">Enter each panel member&apos;s name on a new line</p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="keywords" className="text-sm font-medium text-grey-700">Keywords *</Label>
          <Input id="keywords" placeholder="Enter keywords separated by commas..." className="h-11 border-grey-200" value={draft.keywords} onChange={(event) => onDraftChange({ keywords: event.target.value })} />
          <p className="text-[11px] text-grey-500">Separate keywords with commas (e.g., machine learning, AI, healthcare)</p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="abstract" className="text-sm font-medium text-grey-700">Abstract *</Label>
          <textarea
            id="abstract"
            value={draft.abstract}
            onChange={(event) => onDraftChange({ abstract: event.target.value })}
            placeholder="Enter thesis abstract..."
            className="min-h-[180px] w-full rounded-md border border-grey-200 px-3 py-2 text-sm text-grey-700 outline-none focus-visible:ring-2 focus-visible:ring-cics-maroon"
          />
          <p className="text-[11px] text-grey-500">{draft.abstract.length} characters</p>
        </div>
      </>
    )
  }

  if (step.key === 'file-upload') {
    return (
      <>
        <div className="space-y-2">
          <Label className="text-sm font-medium text-grey-700">Upload PDF *</Label>
          {onFileChange ? (
            <label className="flex min-h-[180px] cursor-pointer flex-col items-center justify-center rounded-md border-2 border-dashed border-grey-200 bg-white hover:border-[#0f766e] hover:bg-[#f0fdf9] transition-colors">
              <Upload className="mb-2 h-10 w-10 text-grey-400" />
              {pdfFile ? (
                <div className="text-center px-4">
                  <p className="text-sm font-medium text-[#0f766e]">{pdfFile.name}</p>
                  <p className="text-xs text-grey-500 mt-0.5">{(pdfFile.size / 1024 / 1024).toFixed(2)} MB — click to replace</p>
                </div>
              ) : (
                <div className="text-center px-4">
                  <p className="text-sm font-medium text-grey-700">Click to choose a PDF file</p>
                  <p className="text-xs text-grey-500 mt-0.5">or drag and drop here</p>
                </div>
              )}
              <input
                type="file"
                accept=".pdf,application/pdf"
                className="sr-only"
                onChange={(e) => {
                  const file = e.target.files?.[0] ?? null
                  onFileChange(file)
                  if (file) onDraftChange({ fileName: file.name })
                }}
              />
            </label>
          ) : (
            <div className="flex min-h-[180px] flex-col items-center justify-center rounded-md border border-grey-200 bg-white">
              <Upload className="mb-2 h-10 w-10 text-grey-500" />
              <div className="w-full max-w-[320px] space-y-2 px-4">
                <Input
                  placeholder="Enter file name (e.g., thesis.pdf)"
                  className="h-10 border-grey-200"
                  value={draft.fileName}
                  onChange={(event) => onDraftChange({ fileName: event.target.value })}
                />
              </div>
              <p className="mt-2 text-xs text-grey-500">Maximum file size: 50MB</p>
            </div>
          )}
        </div>

        <div className="rounded-md border border-cics-maroon-300 bg-cics-maroon-50 p-3 text-xs text-grey-700">
          <p className="font-semibold text-grey-700">File Requirements:</p>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            {FILE_REQUIREMENTS.map((requirement) => (
              <li key={requirement}>{requirement}</li>
            ))}
          </ul>
        </div>
      </>
    )
  }

  const authorName = [draft.firstName, draft.middleName, draft.lastName].filter(Boolean).join(' ')

  return (
    <>
      <div className="grid gap-3 text-sm md:grid-cols-2">
        <div className="rounded-md border border-grey-200 bg-white p-3">
          <p className="text-xs uppercase tracking-wide text-grey-500">Title</p>
          <p className="mt-1 font-medium text-grey-700">{draft.title || '—'}</p>
        </div>
        <div className="rounded-md border border-grey-200 bg-white p-3">
          <p className="text-xs uppercase tracking-wide text-grey-500">Author</p>
          <p className="mt-1 font-medium text-grey-700">{authorName || '—'}</p>
        </div>
        <div className="rounded-md border border-grey-200 bg-white p-3">
          <p className="text-xs uppercase tracking-wide text-grey-500">Department</p>
          <p className="mt-1 font-medium text-grey-700">{draft.department || '—'}</p>
        </div>
        <div className="rounded-md border border-grey-200 bg-white p-3">
          <p className="text-xs uppercase tracking-wide text-grey-500">Date of Publication</p>
          <p className="mt-1 font-medium text-grey-700">{draft.publishedOn || '—'}</p>
        </div>
      </div>

      <div className="rounded-md border border-grey-200 bg-white p-3 text-sm">
        <p className="text-xs uppercase tracking-wide text-grey-500">Uploaded File</p>
        <p className="mt-1 font-medium text-grey-700">{draft.fileName || '—'}</p>
      </div>

      <label className="flex items-start gap-2 rounded-md border border-grey-200 bg-grey-50 p-3 text-sm text-grey-700">
        <input
          type="checkbox"
          className="mt-1 rounded border-grey-300 accent-cics-maroon focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cics-maroon focus-visible:ring-offset-1"
          defaultChecked
        />
        <span>I confirm that all details are accurate and I have permission to submit this thesis document.</span>
      </label>
    </>
  )
}

export function isSubmissionStepKey(stepKey: string): stepKey is SubmissionStepKey {
  return stepKey === 'basic-info' || stepKey === 'academic-details' || stepKey === 'file-upload' || stepKey === 'verify-details'
}
