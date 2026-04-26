'use client'

import { useState } from 'react'
import { Upload } from 'lucide-react'
import { Input, Label, Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui'
import { FILE_REQUIREMENTS } from '@/lib/utils'
import type { SubmissionDraft, SubmissionStepKey, SubmissionStepMeta } from '@/types/admin'

// Tracks available per department
const TRACKS_BY_DEPT: Record<string, { value: string; label: string }[]> = {
  'Computer Science': [
    { value: 'Core Computer Science', label: 'Core Computer Science' },
    { value: 'Game Development', label: 'Game Development' },
    { value: 'Data Science', label: 'Data Science' },
  ],
  'Information Technology': [
    { value: 'Network and Security', label: 'Network and Security' },
    { value: 'Web and Mobile App Development', label: 'Web and Mobile App Development' },
    { value: 'IT Automation Track', label: 'IT Automation Track' },
  ],
  'Information Systems': [
    { value: 'Business Analytics', label: 'Business Analytics' },
    { value: 'Service Management', label: 'Service Management' },
  ],
}

// Document type is fixed by department — CS = Thesis, IT/IS = Capstone
function getDocTypeForDept(dept: string): string {
  const d = dept.toLowerCase()
  if (d.includes('information technology') || d.includes('information systems') || d === 'it' || d === 'is') {
    return 'Capstone'
  }
  return 'Thesis'
}

type SubmissionStepContentProps = {
  step: SubmissionStepMeta
  draft: SubmissionDraft
  onDraftChange: (patch: Partial<SubmissionDraft>) => void
  /** When provided, a real <input type="file"> is rendered instead of the filename text input */
  pdfFile?: File | null
  onFileChange?: (file: File | null) => void
  abstractFile?: File | null
  onAbstractFileChange?: (file: File | null) => void
  duplicateWarning?: string | null
  onTitleBlur?: () => void
}

type BasicInfoStepProps = {
  draft: SubmissionDraft
  onDraftChange: (patch: Partial<SubmissionDraft>) => void
  duplicateWarning?: string | null
  onTitleBlur?: () => void
}

function BasicInfoStep({ draft, onDraftChange, duplicateWarning, onTitleBlur }: Readonly<BasicInfoStepProps>) {
    const trackOptions = TRACKS_BY_DEPT[draft.department] ?? []
    const autoDocType = draft.department ? getDocTypeForDept(draft.department) : draft.documentType

    const [showAuthor2, setShowAuthor2] = useState(() => Boolean(draft.author2FirstName || draft.author2LastName))
    const [showAuthor3, setShowAuthor3] = useState(() => Boolean(draft.author3FirstName || draft.author3LastName))
    const [showAuthor4, setShowAuthor4] = useState(() => Boolean(draft.author4FirstName || draft.author4LastName))
    const [showAuthor5, setShowAuthor5] = useState(() => Boolean(draft.author5FirstName || draft.author5LastName))

    const canAddMore = !showAuthor2 || !showAuthor3 || !showAuthor4 || !showAuthor5

    function addNextAuthor() {
      if (!showAuthor2) { setShowAuthor2(true); return }
      if (!showAuthor3) { setShowAuthor3(true); return }
      if (!showAuthor4) { setShowAuthor4(true); return }
      if (!showAuthor5) { setShowAuthor5(true) }
    }

    function removeAuthor(n: 2 | 3 | 4 | 5) {
      const slots = [
        { first: draft.author2FirstName, mid: draft.author2MiddleName, last: draft.author2LastName, shown: showAuthor2 },
        { first: draft.author3FirstName, mid: draft.author3MiddleName, last: draft.author3LastName, shown: showAuthor3 },
        { first: draft.author4FirstName, mid: draft.author4MiddleName, last: draft.author4LastName, shown: showAuthor4 },
        { first: draft.author5FirstName, mid: draft.author5MiddleName, last: draft.author5LastName, shown: showAuthor5 },
      ]
      const removeIdx = n - 2
      const remaining = slots.filter((_, i) => i !== removeIdx && slots[i].shown)
      const [s2, s3, s4, s5] = [remaining[0], remaining[1], remaining[2], remaining[3]]
      onDraftChange({
        author2FirstName: s2?.first ?? '', author2MiddleName: s2?.mid ?? '', author2LastName: s2?.last ?? '',
        author3FirstName: s3?.first ?? '', author3MiddleName: s3?.mid ?? '', author3LastName: s3?.last ?? '',
        author4FirstName: s4?.first ?? '', author4MiddleName: s4?.mid ?? '', author4LastName: s4?.last ?? '',
        author5FirstName: s5?.first ?? '', author5MiddleName: s5?.mid ?? '', author5LastName: s5?.last ?? '',
      })
      setShowAuthor2(remaining.length >= 1)
      setShowAuthor3(remaining.length >= 2)
      setShowAuthor4(remaining.length >= 3)
      setShowAuthor5(remaining.length >= 4)
    }

    return (
      <>
        <div className="space-y-2">
          <Label htmlFor="title" className="text-sm font-medium text-grey-700">Title *</Label>
          <Input
            id="title"
            placeholder="Enter thesis/capstone title..."
            className="h-11 border-grey-200"
            value={draft.title}
            onChange={(event) => onDraftChange({ title: event.target.value })}
            onBlur={onTitleBlur}
          />
          {duplicateWarning ? (
            <p className="text-xs text-amber-700 rounded-md border border-amber-200 bg-amber-50 px-3 py-2">{duplicateWarning}</p>
          ) : null}
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-medium text-grey-700">Authors *</Label>
            {canAddMore && (
              <button type="button" onClick={addNextAuthor} className="text-xs text-[#0f766e] hover:underline focus-visible:outline-none">
                + Add Author
              </button>
            )}
          </div>

          {/* Author 1 */}
          <div className="space-y-1">
            <p className="text-xs text-grey-500">Author 1</p>
            <div className="grid gap-3 md:grid-cols-3">
              <div className="space-y-1">
                <Label htmlFor="firstName" className="text-xs text-grey-600">First Name *</Label>
                <Input id="firstName" className="h-10 border-grey-200" value={draft.firstName} onChange={(event) => onDraftChange({ firstName: event.target.value })} />
              </div>
              <div className="space-y-1">
                <Label htmlFor="middleName" className="text-xs text-grey-600">Middle Initial</Label>
                <Input id="middleName" className="h-10 border-grey-200" value={draft.middleName} onChange={(event) => onDraftChange({ middleName: event.target.value })} />
              </div>
              <div className="space-y-1">
                <Label htmlFor="lastName" className="text-xs text-grey-600">Last Name *</Label>
                <Input id="lastName" className="h-10 border-grey-200" value={draft.lastName} onChange={(event) => onDraftChange({ lastName: event.target.value })} />
              </div>
            </div>
          </div>

          {/* Author 2 */}
          {showAuthor2 && (
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <p className="text-xs text-grey-500">Author 2</p>
                <button type="button" onClick={() => removeAuthor(2)} className="text-xs text-red-400 hover:text-red-600 focus-visible:outline-none">Remove</button>
              </div>
              <div className="grid gap-3 md:grid-cols-3">
                <div className="space-y-1">
                  <Label className="text-xs text-grey-600">First Name</Label>
                  <Input className="h-10 border-grey-200" value={draft.author2FirstName} onChange={(e) => onDraftChange({ author2FirstName: e.target.value })} />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-grey-600">Middle Initial</Label>
                  <Input className="h-10 border-grey-200" value={draft.author2MiddleName} onChange={(e) => onDraftChange({ author2MiddleName: e.target.value })} />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-grey-600">Last Name</Label>
                  <Input className="h-10 border-grey-200" value={draft.author2LastName} onChange={(e) => onDraftChange({ author2LastName: e.target.value })} />
                </div>
              </div>
            </div>
          )}

          {/* Author 3 */}
          {showAuthor3 && (
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <p className="text-xs text-grey-500">Author 3</p>
                <button type="button" onClick={() => removeAuthor(3)} className="text-xs text-red-400 hover:text-red-600 focus-visible:outline-none">Remove</button>
              </div>
              <div className="grid gap-3 md:grid-cols-3">
                <div className="space-y-1">
                  <Label className="text-xs text-grey-600">First Name</Label>
                  <Input className="h-10 border-grey-200" value={draft.author3FirstName} onChange={(e) => onDraftChange({ author3FirstName: e.target.value })} />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-grey-600">Middle Initial</Label>
                  <Input className="h-10 border-grey-200" value={draft.author3MiddleName} onChange={(e) => onDraftChange({ author3MiddleName: e.target.value })} />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-grey-600">Last Name</Label>
                  <Input className="h-10 border-grey-200" value={draft.author3LastName} onChange={(e) => onDraftChange({ author3LastName: e.target.value })} />
                </div>
              </div>
            </div>
          )}

          {/* Author 4 */}
          {showAuthor4 && (
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <p className="text-xs text-grey-500">Author 4</p>
                <button type="button" onClick={() => removeAuthor(4)} className="text-xs text-red-400 hover:text-red-600 focus-visible:outline-none">Remove</button>
              </div>
              <div className="grid gap-3 md:grid-cols-3">
                <div className="space-y-1">
                  <Label className="text-xs text-grey-600">First Name</Label>
                  <Input className="h-10 border-grey-200" value={draft.author4FirstName} onChange={(e) => onDraftChange({ author4FirstName: e.target.value })} />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-grey-600">Middle Initial</Label>
                  <Input className="h-10 border-grey-200" value={draft.author4MiddleName} onChange={(e) => onDraftChange({ author4MiddleName: e.target.value })} />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-grey-600">Last Name</Label>
                  <Input className="h-10 border-grey-200" value={draft.author4LastName} onChange={(e) => onDraftChange({ author4LastName: e.target.value })} />
                </div>
              </div>
            </div>
          )}

          {/* Author 5 */}
          {showAuthor5 && (
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <p className="text-xs text-grey-500">Author 5</p>
                <button type="button" onClick={() => removeAuthor(5)} className="text-xs text-red-400 hover:text-red-600 focus-visible:outline-none">Remove</button>
              </div>
              <div className="grid gap-3 md:grid-cols-3">
                <div className="space-y-1">
                  <Label className="text-xs text-grey-600">First Name</Label>
                  <Input className="h-10 border-grey-200" value={draft.author5FirstName} onChange={(e) => onDraftChange({ author5FirstName: e.target.value })} />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-grey-600">Middle Initial</Label>
                  <Input className="h-10 border-grey-200" value={draft.author5MiddleName} onChange={(e) => onDraftChange({ author5MiddleName: e.target.value })} />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-grey-600">Last Name</Label>
                  <Input className="h-10 border-grey-200" value={draft.author5LastName} onChange={(e) => onDraftChange({ author5LastName: e.target.value })} />
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="publishedOn" className="text-sm font-medium text-grey-700">Date of Publication *</Label>
          <Input
            id="publishedOn"
            type="date"
            className="h-11 border-grey-200"
            value={draft.publishedOn}
            onChange={(event) => onDraftChange({ publishedOn: event.target.value })}
          />
        </div>

        <div className="grid gap-3 md:grid-cols-2">
          <div className="space-y-2">
            <Label className="text-sm font-medium text-grey-700">Department/College</Label>
            <div className="h-11 flex items-center rounded-md border border-grey-200 bg-grey-50 px-3 text-sm text-grey-500 select-none">
              {draft.department || 'Assigned from your account'}
            </div>
            <p className="text-[11px] text-grey-400">Set by your account — cannot be changed.</p>
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium text-grey-700">Document Type</Label>
            <div className="h-11 flex items-center rounded-md border border-grey-200 bg-grey-50 px-3 text-sm text-grey-500 select-none">
              {autoDocType}
            </div>
            <p className="text-[11px] text-grey-400">Determined by your department.</p>
          </div>
        </div>

        <div className="space-y-2">
          <Label className="text-sm font-medium text-grey-700">Specialization Track *</Label>
          {trackOptions.length > 0 ? (
            <Select
              value={draft.trackSpecialization}
              onValueChange={(value) => onDraftChange({ trackSpecialization: value })}
            >
              <SelectTrigger className="h-11 border-grey-200 focus:ring-cics-maroon">
                <SelectValue placeholder="Select your track..." />
              </SelectTrigger>
              <SelectContent>
                {trackOptions.map((track) => (
                  <SelectItem key={track.value} value={track.value}>{track.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : (
            <div className="h-11 flex items-center rounded-md border border-grey-200 bg-grey-50 px-3 text-sm text-grey-400 select-none">
              {draft.department ? 'No tracks available for this department' : 'Set your department first'}
            </div>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="degree" className="text-sm font-medium text-grey-700">Degree Name</Label>
          <div className="h-11 flex items-center rounded-md border border-grey-200 bg-grey-50 px-3 text-sm text-grey-700 select-none">
            {draft.degree || '—'}
          </div>
        </div>
      </>
    )
}

export default function SubmissionStepContent({ step, draft, onDraftChange, pdfFile, onFileChange, abstractFile, onAbstractFileChange, duplicateWarning, onTitleBlur }: Readonly<SubmissionStepContentProps>) {
  if (step.key === 'basic-info') {
    return <BasicInfoStep draft={draft} onDraftChange={onDraftChange} duplicateWarning={duplicateWarning} onTitleBlur={onTitleBlur} />
  }

  if (step.key === 'academic-details') {
    return (
      <>
        <div className="space-y-2">
          <Label htmlFor="advisor" className="text-sm font-medium text-grey-700">Thesis Advisor *</Label>
          <Input id="advisor" placeholder="Enter advisor name..." className="h-11 border-grey-200" value={draft.thesisAdvisor} onChange={(event) => onDraftChange({ thesisAdvisor: event.target.value })} />
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

        <div className="space-y-2">
          <Label className="text-sm font-medium text-grey-700">ACM/ITSU Abstract PDF *</Label>
          {onAbstractFileChange ? (
            <label className="flex min-h-[120px] cursor-pointer flex-col items-center justify-center rounded-md border-2 border-dashed border-grey-200 bg-white hover:border-[#0f766e] hover:bg-[#f0fdf9] transition-colors">
              <Upload className="mb-2 h-7 w-7 text-grey-400" />
              {abstractFile ? (
                <div className="text-center px-4">
                  <p className="text-sm font-medium text-[#0f766e]">{abstractFile.name}</p>
                  <p className="text-xs text-grey-500 mt-0.5">{(abstractFile.size / 1024 / 1024).toFixed(2)} MB — click to replace</p>
                </div>
              ) : (
                <div className="text-center px-4">
                  <p className="text-sm font-medium text-grey-700">Click to choose abstract PDF</p>
                  <p className="text-xs text-grey-500 mt-0.5">ACM or ITSU format</p>
                </div>
              )}
              <input
                type="file"
                accept=".pdf,application/pdf"
                className="sr-only"
                onChange={(e) => {
                  const file = e.target.files?.[0] ?? null
                  onAbstractFileChange(file)
                  if (file) onDraftChange({ abstractFileName: file.name })
                }}
              />
            </label>
          ) : null}
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

  const buildName = (first: string, mid: string, last: string) => [first, mid, last].filter(Boolean).join(' ')
  const allAuthors = [
    buildName(draft.firstName, draft.middleName, draft.lastName),
    buildName(draft.author2FirstName, draft.author2MiddleName, draft.author2LastName),
    buildName(draft.author3FirstName, draft.author3MiddleName, draft.author3LastName),
    buildName(draft.author4FirstName, draft.author4MiddleName, draft.author4LastName),
    buildName(draft.author5FirstName, draft.author5MiddleName, draft.author5LastName),
  ].filter(Boolean)

  return (
    <>
      <div className="grid gap-3 text-sm md:grid-cols-2">
        <div className="rounded-md border border-grey-200 bg-white p-3 md:col-span-2">
          <p className="text-xs uppercase tracking-wide text-grey-500">Title</p>
          <p className="mt-1 font-medium text-grey-700">{draft.title || '—'}</p>
        </div>
        <div className="rounded-md border border-grey-200 bg-white p-3 md:col-span-2">
          <p className="text-xs uppercase tracking-wide text-grey-500">Authors</p>
          {allAuthors.length > 0 ? (
            <ul className="mt-1 space-y-0.5">
              {allAuthors.map((name, i) => (
                <li key={i} className="font-medium text-grey-700">{name}</li>
              ))}
            </ul>
          ) : (
            <p className="mt-1 font-medium text-grey-700">—</p>
          )}
        </div>
        <div className="rounded-md border border-grey-200 bg-white p-3">
          <p className="text-xs uppercase tracking-wide text-grey-500">Date of Publication</p>
          <p className="mt-1 font-medium text-grey-700">
            {draft.publishedOn
              ? new Date(draft.publishedOn + 'T00:00:00').toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
              : '—'}
          </p>
        </div>
        <div className="rounded-md border border-grey-200 bg-white p-3">
          <p className="text-xs uppercase tracking-wide text-grey-500">Department</p>
          <p className="mt-1 font-medium text-grey-700">{draft.department || '—'}</p>
        </div>
        <div className="rounded-md border border-grey-200 bg-white p-3">
          <p className="text-xs uppercase tracking-wide text-grey-500">Document Type</p>
          <p className="mt-1 font-medium text-grey-700">{draft.department ? getDocTypeForDept(draft.department) : draft.documentType || '—'}</p>
        </div>
        <div className="rounded-md border border-grey-200 bg-white p-3 md:col-span-2">
          <p className="text-xs uppercase tracking-wide text-grey-500">Specialization Track</p>
          <p className="mt-1 font-medium text-grey-700">{draft.trackSpecialization || '—'}</p>
        </div>
        <div className="rounded-md border border-grey-200 bg-white p-3 md:col-span-2">
          <p className="text-xs uppercase tracking-wide text-grey-500">Degree Name</p>
          <p className="mt-1 font-medium text-grey-700">{draft.degree || '—'}</p>
        </div>
        <div className="rounded-md border border-grey-200 bg-white p-3">
          <p className="text-xs uppercase tracking-wide text-grey-500">Thesis Advisor</p>
          <p className="mt-1 font-medium text-grey-700">{draft.thesisAdvisor || '—'}</p>
        </div>
        <div className="rounded-md border border-grey-200 bg-white p-3">
          <p className="text-xs uppercase tracking-wide text-grey-500">Keywords</p>
          <p className="mt-1 font-medium text-grey-700">{draft.keywords || '—'}</p>
        </div>
      </div>

      <div className="rounded-md border border-grey-200 bg-white p-3 text-sm">
        <p className="text-xs uppercase tracking-wide text-grey-500">Uploaded File</p>
        <p className="mt-1 font-medium text-grey-700">{draft.fileName || '—'}</p>
      </div>

      {draft.abstractFileName ? (
        <div className="rounded-md border border-grey-200 bg-white p-3 text-sm">
          <p className="text-xs uppercase tracking-wide text-grey-500">Abstract PDF</p>
          <p className="mt-1 font-medium text-grey-700">{draft.abstractFileName}</p>
        </div>
      ) : null}

      <label className="flex items-start gap-2 rounded-md border border-grey-200 bg-grey-50 p-3 text-sm text-grey-700">
        <input
          type="checkbox"
          className="mt-1 rounded border-grey-300 accent-cics-maroon focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cics-maroon focus-visible:ring-offset-1"
          defaultChecked
        />
        <span>I confirm that all details are accurate and I have permission to submit this {getDocTypeForDept(draft.department).toLowerCase()} document.</span>
      </label>
    </>
  )
}

export function isSubmissionStepKey(stepKey: string): stepKey is SubmissionStepKey {
  return stepKey === 'basic-info' || stepKey === 'academic-details' || stepKey === 'file-upload' || stepKey === 'verify-details'
}
