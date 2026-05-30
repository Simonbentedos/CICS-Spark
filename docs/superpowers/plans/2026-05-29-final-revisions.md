# Final Revisions Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement 4 final revisions before client handover: document title in fulltext requests, academic year filter on reports, separate ACM/ITSO file uploads, and uppercase feedback labels.

**Architecture:** Task 1 requires a backend Supabase join + frontend type/UI change. Task 2 is frontend-only type + filter logic changes on both report pages. Task 3 requires a DB column, backend service/controller changes, and frontend changes across student submission, revision, and admin review. Task 4 is a single frontend helper.

**Tech Stack:** NestJS, Next.js 15 App Router, Supabase/PostgreSQL, TypeScript

---

## File Map

**Task 1 — Fulltext requests: document title**
- Modify: `backend/src/modules/admin/admin.service.ts` — `getFulltextRequests` joins documents table
- Modify: `frontend/src/lib/api/documents.ts` — add `document_title` to `FulltextRequest`
- Modify: `frontend/src/app/admin/fulltext-requests/page.tsx` — replace Document ID column with Document Title

**Task 2 — Reports: academic year filter**
- Modify: `frontend/src/types/admin.ts` — update `ReportDateRange` (remove 30d/90d, add `ay${number}`)
- Modify: `frontend/src/app/admin/reports/page.tsx` — replace options, update `isWithinRange`
- Modify: `frontend/src/app/superadmin/reports/page.tsx` — same

**Task 3 — Separate ACM/ITSO uploads**
- Create: `backend/supabase/add_itso_file_path.sql`
- Modify: `backend/src/modules/documents/documents.controller.ts`
- Modify: `backend/src/modules/documents/documents.service.ts`
- Modify: `backend/src/modules/admin/admin.service.ts`
- Modify: `backend/src/modules/admin/admin.controller.ts`
- Modify: `frontend/src/lib/api/documents.ts`
- Modify: `frontend/src/types/admin.ts` — add `itsoFileName` to `SubmissionDraft`
- Modify: `frontend/src/components/admin/ReviewActionDialog.tsx`
- Modify: `frontend/src/components/admin/SubmissionStepContent.tsx`
- Modify: `frontend/src/app/student/submissions/new/[step]/page.tsx`
- Modify: `frontend/src/app/student/submissions/revise/[id]/page.tsx`
- Modify: `frontend/src/app/admin/submissions/review/[submissionId]/page.tsx`

**Task 4 — Uppercase feedback labels**
- Modify: `frontend/src/app/student/dashboard/page.tsx`

---

## Setup

### Task 0: Branch setup

- [ ] **Step 1: Create and switch to the new branch**

```bash
git fetch origin main
git checkout -b ethan/fix origin/main
```

---

## Task 1: Fulltext Requests — Show Document Title

**No DB schema change needed** — the `documents` table already has `title`. We use a Supabase foreign key join.

### Task 1, Step 1: Backend — join documents table

Modify: `backend/src/modules/admin/admin.service.ts`

Find `getFulltextRequests`. There are two query paths (admin-scoped and super_admin). In **both** paths, change the `.select(...)` call to add the join and flatten the result.

**Admin-scoped path** (replace the select + return):
```typescript
let query = this.databaseService.client
  .from('fulltext_requests')
  .select(
    'id, document_id, requester_name, requester_email, purpose, department, status, handled_by, created_at, fulfilled_at, document:documents(title)',
  )
  .in('document_id', docIds)
  .order('created_at', { ascending: false });

if (status) query = query.eq('status', status);

const { data, error } = await query;
if (error) throw new InternalServerErrorException(error.message);
return (data ?? []).map(({ document, ...rest }: any) => ({
  ...rest,
  document_title: (document as any)?.title ?? null,
}));
```

**Super admin path** (replace the select + return):
```typescript
let query = this.databaseService.client
  .from('fulltext_requests')
  .select(
    'id, document_id, requester_name, requester_email, purpose, department, status, handled_by, created_at, fulfilled_at, document:documents(title)',
  )
  .order('created_at', { ascending: false });

if (status) query = query.eq('status', status);

const { data, error } = await query;
if (error) throw new InternalServerErrorException(error.message);
return (data ?? []).map(({ document, ...rest }: any) => ({
  ...rest,
  document_title: (document as any)?.title ?? null,
}));
```

- [ ] **Step 2: Frontend — add `document_title` to type**

Modify: `frontend/src/lib/api/documents.ts`

In the `FulltextRequest` type, add one field after `document_id`:
```typescript
export type FulltextRequest = {
  id: string
  document_id: string
  document_title: string | null   // ← add this
  requester_name: string
  // ... rest unchanged
}
```

- [ ] **Step 3: Frontend — replace Document ID column**

Modify: `frontend/src/app/admin/fulltext-requests/page.tsx`

Replace the `id: 'document'` column object:
```tsx
{
  id: 'document',
  header: 'Document Title',
  className: 'max-w-[260px]',
  renderCell: (r: FulltextRequest) => (
    <span className="line-clamp-2 text-sm text-grey-700">
      {r.document_title ?? <span className="font-mono text-[11px] text-grey-400">{r.document_id.slice(0, 8)}…</span>}
    </span>
  ),
},
```

- [ ] **Step 4: Commit**

```bash
git add backend/src/modules/admin/admin.service.ts \
        frontend/src/lib/api/documents.ts \
        frontend/src/app/admin/fulltext-requests/page.tsx
git commit -m "feat: show document title instead of ID in fulltext requests table"
```

---

## Task 2: Reports — Academic Year Filter

Replace `Last 30 Days` and `Last 90 Days` with the last 6 academic years (Aug 1 – Jul 31). Apply to both the admin and super admin reports pages.

**Academic year rule:** AY YYYY–YYYY+1 starts August 1, YYYY and ends July 31, YYYY+1.

### Task 2, Step 1: Update `ReportDateRange` type

Modify: `frontend/src/types/admin.ts`

Replace line 120:
```typescript
// Before:
export type ReportDateRange = '30d' | '90d' | 'ytd' | '1y' | '2y' | '3y' | '4y' | '5y' | 'all'

// After:
export type ReportDateRange = 'ytd' | '1y' | '2y' | '3y' | '4y' | '5y' | 'all' | `ay${number}`
```

- [ ] **Step 2: Update admin reports page**

Modify: `frontend/src/app/admin/reports/page.tsx`

**Replace the `DATE_RANGE_OPTIONS` constant** (currently at the top of the file, 9 entries) with:
```typescript
function getAcademicYearOptions(): { value: ReportDateRange; label: string }[] {
  const now = new Date()
  const currentAyStart = now.getMonth() >= 7 ? now.getFullYear() : now.getFullYear() - 1
  return Array.from({ length: 6 }, (_, i) => {
    const start = currentAyStart - i
    return { value: `ay${start}` as ReportDateRange, label: `Academic Year ${start}-${start + 1}` }
  })
}

const DATE_RANGE_OPTIONS: { value: ReportDateRange; label: string }[] = [
  ...getAcademicYearOptions(),
  { value: 'ytd', label: 'Year to Date' },
  { value: '1y', label: 'Last 1 Year' },
  { value: '2y', label: 'Last 2 Years' },
  { value: '3y', label: 'Last 3 Years' },
  { value: '4y', label: 'Last 4 Years' },
  { value: '5y', label: 'Last 5 Years' },
  { value: 'all', label: 'All Time' },
]
```

**Replace the `isWithinRange` function** (remove the `30d` and `90d` branches, add `ay*`):
```typescript
function isWithinRange(dateString: string, range: ReportDateRange) {
  if (range === 'all') return true
  const date = new Date(dateString)
  if (isNaN(date.getTime())) return false
  const now = new Date()

  if (range === 'ytd') return date >= new Date(now.getFullYear(), 0, 1)

  const ayMatch = range.match(/^ay(\d{4})$/)
  if (ayMatch) {
    const startYear = parseInt(ayMatch[1], 10)
    const start = new Date(startYear, 7, 1)      // Aug 1, startYear
    const end = new Date(startYear + 1, 7, 1)    // Aug 1, startYear+1 (exclusive)
    return date >= start && date < end
  }

  const yearMatch = range.match(/^(\d+)y$/)
  if (yearMatch) {
    const years = parseInt(yearMatch[1], 10)
    const cutoff = new Date(now)
    cutoff.setFullYear(cutoff.getFullYear() - years)
    return date >= cutoff
  }
  return true
}
```

- [ ] **Step 3: Update superadmin reports page**

Modify: `frontend/src/app/superadmin/reports/page.tsx`

Apply the **exact same two replacements** as Step 2:
1. Replace `DATE_RANGE_OPTIONS` with the `getAcademicYearOptions()` version
2. Replace `isWithinRange` (remove `30d`/`90d` branches, add `ay*` branch)

The function bodies are identical to Step 2.

- [ ] **Step 4: Commit**

```bash
git add frontend/src/types/admin.ts \
        frontend/src/app/admin/reports/page.tsx \
        frontend/src/app/superadmin/reports/page.tsx
git commit -m "feat: replace 30d/90d filters with academic year filter on reports pages"
```

---

## Task 3: Separate ACM and ITSO File Uploads

Currently there is one combined "ACM/ITSO Abstract" upload. This task splits it into two distinct uploads: **ACM Abstract PDF** and **ITSO Abstract PDF**. IT/IS students must upload both; CS students may leave both optional.

**DB change required:** Add nullable `itso_file_path` column to `documents`.

### Task 3, Step 1: Create DB migration SQL

Create: `backend/supabase/add_itso_file_path.sql`

```sql
-- Add separate ITSO file path column to documents table.
-- Nullable so existing rows are unaffected.
ALTER TABLE documents ADD COLUMN IF NOT EXISTS itso_file_path TEXT NULL;
```

**Run this in the Supabase SQL Editor before starting the backend/frontend changes.**

- [ ] **Step 2: Backend controller — add `itso_file` field to both interceptors**

Modify: `backend/src/modules/documents/documents.controller.ts`

In the `uploadDocument` handler, replace the `FileFieldsInterceptor` call and the handler signature + body:
```typescript
@Post('upload')
@UseGuards(SupabaseGuard, RolesGuard)
@Roles('student')
@UseInterceptors(FileFieldsInterceptor([
  { name: 'file', maxCount: 1 },
  { name: 'abstract_file', maxCount: 1 },
  { name: 'itso_file', maxCount: 1 },
], { limits: { fileSize: MAX_FILE_SIZE } }))
uploadDocument(
  @UploadedFiles() files: { file?: Express.Multer.File[]; abstract_file?: Express.Multer.File[]; itso_file?: Express.Multer.File[] },
  @Body() dto: UploadDocumentDto,
  @Request() req: any,
) {
  const mainFile = files?.file?.[0];
  if (!mainFile) throw new BadRequestException('PDF file is required.');
  if (mainFile.mimetype !== 'application/pdf') throw new BadRequestException('Main file must be a PDF.');
  const abstractFile = files?.abstract_file?.[0];
  if (abstractFile && abstractFile.mimetype !== 'application/pdf') throw new BadRequestException('ACM file must be a PDF.');
  const itsoFile = files?.itso_file?.[0];
  if (itsoFile && itsoFile.mimetype !== 'application/pdf') throw new BadRequestException('ITSO file must be a PDF.');
  return this.documentsService.uploadDocument(req.user.id, mainFile, dto, abstractFile, itsoFile);
}
```

In the `reviseDocument` handler, replace the `FileFieldsInterceptor` call and handler:
```typescript
@Put(':id')
@UseGuards(SupabaseGuard, RolesGuard)
@Roles('student')
@UseInterceptors(FileFieldsInterceptor([
  { name: 'file', maxCount: 1 },
  { name: 'abstract_file', maxCount: 1 },
  { name: 'itso_file', maxCount: 1 },
], { limits: { fileSize: MAX_FILE_SIZE } }))
reviseDocument(
  @Param('id') id: string,
  @UploadedFiles() files: { file?: Express.Multer.File[]; abstract_file?: Express.Multer.File[]; itso_file?: Express.Multer.File[] },
  @Body() dto: ReviseDocumentDto,
  @Request() req: any,
) {
  const mainFile = files?.file?.[0];
  const abstractFile = files?.abstract_file?.[0];
  const itsoFile = files?.itso_file?.[0];
  return this.documentsService.reviseDocument(id, req.user.id, mainFile, dto, abstractFile, itsoFile);
}
```

- [ ] **Step 3: Backend service — handle ITSO file in `uploadDocument` and `reviseDocument`**

Modify: `backend/src/modules/documents/documents.service.ts`

**`uploadDocument` signature change** — make `abstractFile` optional, add `itsoFile?`:
```typescript
async uploadDocument(
  userId: string,
  file: Express.Multer.File,
  dto: UploadDocumentDto,
  abstractFile?: Express.Multer.File,
  itsoFile?: Express.Multer.File,
) {
```

After uploading the main PDF (and the existing `abstractFile` upload block), add ITSO upload. Replace the existing `abstractFile` upload section with this (which handles both files being optional, matching the new CS-optional logic):

```typescript
let abstractFilePath: string | null = null;
if (abstractFile) {
  const abstractStoragePath = `${userId}/${ts}_abstract_${abstractFile.originalname}`;
  const { error: abstractStorageError } = await this.databaseService.client.storage
    .from('documents')
    .upload(abstractStoragePath, abstractFile.buffer, { contentType: abstractFile.mimetype });
  if (abstractStorageError) {
    await this.databaseService.client.storage.from('documents').remove([storagePath]);
    throw new InternalServerErrorException(
      abstractStorageError.message || 'Failed to upload ACM abstract file to storage.',
    );
  }
  abstractFilePath = abstractStoragePath;
}

let itsoFilePath: string | null = null;
if (itsoFile) {
  const itsoStoragePath = `${userId}/${ts}_itso_${itsoFile.originalname}`;
  const { error: itsoStorageError } = await this.databaseService.client.storage
    .from('documents')
    .upload(itsoStoragePath, itsoFile.buffer, { contentType: itsoFile.mimetype });
  if (itsoStorageError) {
    await this.databaseService.client.storage.from('documents').remove([storagePath]);
    if (abstractFilePath) await this.databaseService.client.storage.from('documents').remove([abstractFilePath]);
    throw new InternalServerErrorException(
      itsoStorageError.message || 'Failed to upload ITSO file to storage.',
    );
  }
  itsoFilePath = itsoStoragePath;
}
```

In the `.insert({...})` call, replace `abstract_file_path: abstractFilePath` and add `itso_file_path`:
```typescript
abstract_file_path: abstractFilePath,
itso_file_path: itsoFilePath,
```

**`reviseDocument` signature change** — add `itsoFile?`:
```typescript
async reviseDocument(
  documentId: string,
  userId: string,
  file: Express.Multer.File | undefined,
  dto: ReviseDocumentDto,
  abstractFile?: Express.Multer.File,
  itsoFile?: Express.Multer.File,
) {
```

After the existing `abstractFile` handling block in `reviseDocument`, add:
```typescript
let itso_file_path = existing.itso_file_path;

if (itsoFile) {
  if (existing.itso_file_path) {
    await this.databaseService.client.storage
      .from('documents')
      .remove([existing.itso_file_path]);
  }
  const itsoStoragePath = `${userId}/${Date.now()}_itso_${itsoFile.originalname}`;
  const { error: itsoStorageError } = await this.databaseService.client.storage
    .from('documents')
    .upload(itsoStoragePath, itsoFile.buffer, { contentType: itsoFile.mimetype });
  if (itsoStorageError) {
    throw new InternalServerErrorException('Failed to upload revised ITSO file.');
  }
  itso_file_path = itsoStoragePath;
}
```

In the `updatePayload` building block, add:
```typescript
if (itso_file_path !== existing.itso_file_path) updatePayload.itso_file_path = itso_file_path;
```

- [ ] **Step 4: Backend admin service — select `itso_file_path`, add `getSubmissionItsoPdfUrl`**

Modify: `backend/src/modules/admin/admin.service.ts`

In `getSubmissions`, add `itso_file_path` to the select string:
```typescript
'id, title, authors, abstract, year, department, type, track_specialization, adviser, degree, keywords, pdf_file_path, abstract_file_path, itso_file_path, uploaded_by, status, created_at, updated_at'
```

In `getSubmissionById`, same — add `itso_file_path` to both select strings.

Add the new method after `getSubmissionAbstractPdfUrl`:
```typescript
async getSubmissionItsoPdfUrl(documentId: string, currentUser: any) {
  const { data: document, error: fetchError } = await this.databaseService.client
    .from('documents')
    .select('id, itso_file_path, department')
    .eq('id', documentId)
    .single();

  if (fetchError || !document) {
    throw new NotFoundException('Document not found.');
  }

  if (currentUser.role === 'admin' && document.department !== currentUser.department) {
    throw new ForbiddenException('You can only preview documents from your department.');
  }

  if (!document.itso_file_path) {
    throw new NotFoundException('No ITSO PDF associated with this document.');
  }

  const { data: signedUrlData, error: urlError } = await this.databaseService.client
    .storage
    .from('documents')
    .createSignedUrl(document.itso_file_path, 3600);

  if (urlError || !signedUrlData) {
    throw new InternalServerErrorException('Failed to generate ITSO PDF preview URL.');
  }

  return { pdfUrl: signedUrlData.signedUrl, expiresIn: 3600 };
}
```

- [ ] **Step 5: Backend admin controller — add ITSO preview endpoint**

Modify: `backend/src/modules/admin/admin.controller.ts`

Add after the `previewAbstractPdf` handler (around line 94):
```typescript
/**
 * GET /api/admin/submissions/:id/preview-itso-pdf
 * Admin or super_admin only. Returns signed URL for the ITSO PDF.
 * Requires: submissions.view permission
 */
@Get('submissions/:id/preview-itso-pdf')
@Roles('admin', 'super_admin')
@UseGuards(PermissionGuard)
@RequirePermission('submissions.view')
async previewItsoPdf(@Param('id') id: string, @Request() req: any) {
  return this.adminService.getSubmissionItsoPdfUrl(id, req.user);
}
```

- [ ] **Step 6: Commit backend changes**

```bash
git add backend/supabase/add_itso_file_path.sql \
        backend/src/modules/documents/documents.controller.ts \
        backend/src/modules/documents/documents.service.ts \
        backend/src/modules/admin/admin.service.ts \
        backend/src/modules/admin/admin.controller.ts
git commit -m "feat: add separate ITSO file upload support (backend + DB migration)"
```

- [ ] **Step 7: Frontend — update `ApiDocument` type and add `getSubmissionItsoPdfUrl`**

Modify: `frontend/src/lib/api/documents.ts`

In `ApiDocument`, add after `abstract_file_path`:
```typescript
itso_file_path: string | null
```

Add a new function after `getSubmissionAbstractPdfUrl`:
```typescript
export async function getSubmissionItsoPdfUrl(id: string): Promise<{ pdfUrl: string; expiresIn: number }> {
  return apiRequest<{ pdfUrl: string; expiresIn: number }>(`/api/admin/submissions/${id}/preview-itso-pdf`)
}
```

Also add the import to the review page's existing import line (done in Step 10 when editing that file).

- [ ] **Step 8: Frontend — update `SubmissionDraft` type**

Modify: `frontend/src/types/admin.ts`

In `SubmissionDraft`, add after `abstractFileName`:
```typescript
itsoFileName: string
```

- [ ] **Step 9: Frontend — update `ReviewActionDialog` to separate ACM and ITSO**

Modify: `frontend/src/components/admin/ReviewActionDialog.tsx`

Update the `ReviewPayload` type:
```typescript
export type ReviewPayload = {
  comment?: string
  issues?: string[]
  requireFiles?: ('manuscript' | 'acm' | 'itso')[]
}
```

Update the `requireFiles` state type:
```typescript
const [requireFiles, setRequireFiles] = useState<('manuscript' | 'acm' | 'itso')[]>([])
```

Update `toggleRequireFile`:
```typescript
function toggleRequireFile(file: 'manuscript' | 'acm' | 'itso') {
  setRequireFiles((current) =>
    current.includes(file) ? current.filter((f) => f !== file) : [...current, file]
  )
}
```

Replace the two checkboxes in the `action === 'revise'` block with three:
```tsx
<div className="rounded-md border border-amber-200 bg-amber-50 p-3 space-y-2">
  <p className="text-sm font-medium text-amber-800">Require student to resubmit:</p>
  <label className="flex items-center gap-2 text-sm text-amber-700">
    <input
      type="checkbox"
      checked={requireFiles.includes('manuscript')}
      onChange={() => toggleRequireFile('manuscript')}
      className="rounded border-amber-300 accent-amber-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-offset-1"
    />
    Complete Manuscript PDF
  </label>
  <label className="flex items-center gap-2 text-sm text-amber-700">
    <input
      type="checkbox"
      checked={requireFiles.includes('acm')}
      onChange={() => toggleRequireFile('acm')}
      className="rounded border-amber-300 accent-amber-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-offset-1"
    />
    ACM Abstract PDF
  </label>
  <label className="flex items-center gap-2 text-sm text-amber-700">
    <input
      type="checkbox"
      checked={requireFiles.includes('itso')}
      onChange={() => toggleRequireFile('itso')}
      className="rounded border-amber-300 accent-amber-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-offset-1"
    />
    ITSO Abstract PDF
  </label>
  {requireFiles.length === 0 && (
    <p className="text-[11px] text-amber-600 italic">No file resubmission required — student can revise metadata only.</p>
  )}
</div>
```

- [ ] **Step 10: Frontend — update `SubmissionStepContent` for 3 separate upload areas**

Modify: `frontend/src/components/admin/SubmissionStepContent.tsx`

Add `itsoFile` and `onItsoFileChange` to the props type:
```typescript
type SubmissionStepContentProps = {
  step: SubmissionStepMeta
  draft: SubmissionDraft
  onDraftChange: (patch: Partial<SubmissionDraft>) => void
  pdfFile?: File | null
  onFileChange?: (file: File | null) => void
  abstractFile?: File | null
  onAbstractFileChange?: (file: File | null) => void
  itsoFile?: File | null
  onItsoFileChange?: (file: File | null) => void
  duplicateWarning?: string | null
  onTitleBlur?: () => void
}
```

In the exported `SubmissionStepContent` component's destructuring, add:
```typescript
{ step, draft, onDraftChange, pdfFile, onFileChange, abstractFile, onAbstractFileChange,
  itsoFile, onItsoFileChange, duplicateWarning, onTitleBlur }
```

In the `step.key === 'file-upload'` branch, replace the existing single ACM/ITSO upload block with two separate ones:

```tsx
{/* ACM Abstract Upload */}
<div className="space-y-2">
  <Label className="text-sm font-medium text-grey-700">
    ACM Abstract in PDF{abstractRequired ? ' *' : ''}
    {!abstractRequired && <span className="ml-1.5 text-[11px] font-normal text-grey-400">(optional for CS)</span>}
  </Label>
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
          <p className="text-sm font-medium text-grey-700">Click to choose ACM abstract PDF</p>
          <p className="text-xs text-grey-500 mt-0.5">ACM format</p>
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

{/* ITSO Abstract Upload */}
<div className="space-y-2">
  <Label className="text-sm font-medium text-grey-700">
    ITSO Abstract in PDF{abstractRequired ? ' *' : ''}
    {!abstractRequired && <span className="ml-1.5 text-[11px] font-normal text-grey-400">(optional for CS)</span>}
  </Label>
  {onItsoFileChange ? (
    <label className="flex min-h-[120px] cursor-pointer flex-col items-center justify-center rounded-md border-2 border-dashed border-grey-200 bg-white hover:border-[#0f766e] hover:bg-[#f0fdf9] transition-colors">
      <Upload className="mb-2 h-7 w-7 text-grey-400" />
      {itsoFile ? (
        <div className="text-center px-4">
          <p className="text-sm font-medium text-[#0f766e]">{itsoFile.name}</p>
          <p className="text-xs text-grey-500 mt-0.5">{(itsoFile.size / 1024 / 1024).toFixed(2)} MB — click to replace</p>
        </div>
      ) : (
        <div className="text-center px-4">
          <p className="text-sm font-medium text-grey-700">Click to choose ITSO abstract PDF</p>
          <p className="text-xs text-grey-500 mt-0.5">ITSO format</p>
        </div>
      )}
      <input
        type="file"
        accept=".pdf,application/pdf"
        className="sr-only"
        onChange={(e) => {
          const file = e.target.files?.[0] ?? null
          onItsoFileChange(file)
          if (file) onDraftChange({ itsoFileName: file.name })
        }}
      />
    </label>
  ) : null}
</div>
```

In the `verify-details` (default) branch, add after the `abstractFileName` block:
```tsx
{draft.itsoFileName ? (
  <div className="rounded-md border border-grey-200 bg-white p-3 text-sm">
    <p className="text-xs uppercase tracking-wide text-grey-500">ITSO Abstract PDF</p>
    <p className="mt-1 font-medium text-grey-700">{draft.itsoFileName}</p>
  </div>
) : null}
```

- [ ] **Step 11: Frontend — update `[step]/page.tsx` for 3-file submission**

Modify: `frontend/src/app/student/submissions/new/[step]/page.tsx`

Add module-level variable after `_pendingAbstractFile`:
```typescript
let _pendingItsoFile: File | null = null
```

Add `itsoFileName: ''` to `emptyDraft()` return value.

Add `itsoFile` state after `abstractFile` state:
```typescript
const [itsoFile, setItsoFileState] = useState<File | null>(_pendingItsoFile)
```

Add setter after `setAbstractFile`:
```typescript
function setItsoFile(file: File | null) {
  _pendingItsoFile = file
  setItsoFileState(file)
}
```

Update `canProceed` for `file-upload` step:
```typescript
if (step.key === 'file-upload') {
  return pdfFile !== null && (isCSStudent || (abstractFile !== null && itsoFile !== null))
}
// verify-details step:
return Boolean(draft.title.trim()) && pdfFile !== null && (isCSStudent || (abstractFile !== null && itsoFile !== null))
```

In `handleSubmit`, after `if (abstractFile) formData.append('abstract_file', abstractFile)` add:
```typescript
if (itsoFile) formData.append('itso_file', itsoFile)
```

In the cleanup after success, add:
```typescript
_pendingItsoFile = null
```

Pass the new props to `SubmissionStepContent`:
```tsx
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
  duplicateWarning={duplicateWarning}
  onTitleBlur={handleTitleBlur}
/>
```

Also update the `missingFile` check in the footer:
```typescript
const missingFile = isVerifyStep && (
  pdfFile === null ||
  (!isCSStudent && (abstractFile === null || itsoFile === null))
)
```

Update the warning message accordingly:
```tsx
{pdfFile === null
  ? 'No manuscript PDF selected.'
  : 'ACM and ITSO abstract PDFs are required for IT and IS students.'}
```

- [ ] **Step 12: Frontend — update revise page for separate ITSO upload**

Modify: `frontend/src/app/student/submissions/revise/[id]/page.tsx`

Add `itsoFile` state:
```typescript
const [itsoFile, setItsoFile] = useState<File | null>(null)
const itsoFileInputRef = useRef<HTMLInputElement>(null)
```

Add `requireItso` derived value after `requireAcm`:
```typescript
const requireItso = requiredFiles.includes('itso')
```

Update `canSubmit`:
```typescript
const canSubmit =
  title.trim().length > 0 &&
  (!requireManuscript || pdfFile !== null) &&
  (!requireAcm || abstractFile !== null) &&
  (!requireItso || itsoFile !== null)
```

In `handleSubmit`, after `if (abstractFile) formData.append('abstract_file', abstractFile)` add:
```typescript
if (itsoFile) formData.append('itso_file', itsoFile)
```

Rename the existing "ACM/ITSO Abstract upload" card to "ACM Abstract in PDF" (change title and description). Then add a new card for ITSO after it:

```tsx
{/* ITSO Abstract upload */}
{(requireItso || requiredFiles.length === 0) && (
  <Card className={`shadow-none ${requireItso ? 'border border-amber-300' : 'border border-grey-200'}`}>
    <CardHeader className="pb-2">
      <CardTitle className="text-base font-semibold text-navy flex items-center gap-2">
        ITSO Abstract in PDF
        {requireItso
          ? <span className="text-xs font-semibold text-amber-700 bg-amber-100 border border-amber-200 rounded-full px-2 py-0.5">Required</span>
          : <span className="text-xs font-normal text-grey-400">(optional)</span>}
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
        className={`flex cursor-pointer flex-col items-center justify-center rounded-md border-2 border-dashed py-8 transition-colors ${requireItso && !itsoFile ? 'border-amber-300 bg-amber-50 hover:border-amber-400' : 'border-grey-200 bg-white hover:border-[#0f766e] hover:bg-[#f0fdf9]'}`}
      >
        <Upload className="mb-2 h-8 w-8 text-grey-400" />
        {itsoFile ? (
          <div className="text-center px-4">
            <p className="text-sm font-medium text-[#0f766e]">{itsoFile.name}</p>
            <p className="text-xs text-grey-500 mt-0.5">{(itsoFile.size / 1024 / 1024).toFixed(2)} MB — click to replace</p>
          </div>
        ) : (
          <p className="text-sm text-grey-500">Click to choose ITSO abstract PDF</p>
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
```

Also update the existing ACM card's title from "ACM/ITSO Abstract in PDF" to "ACM Abstract in PDF" and update text accordingly (`requireAcm` still refers to `acm` in requiredFiles).

- [ ] **Step 13: Frontend — update admin review page for ITSO PDF preview**

Modify: `frontend/src/app/admin/submissions/review/[submissionId]/page.tsx`

Add to imports from `@/lib/api/documents`:
```typescript
getSubmissionItsoPdfUrl,
```

Add state:
```typescript
const [itsoPdfUrl, setItsoPdfUrl] = useState<string | null>(null)
```

In the `useEffect` where PDF URLs are fetched, add:
```typescript
if (submission.itso_file_path) {
  getSubmissionItsoPdfUrl(params.submissionId)
    .then((data) => setItsoPdfUrl(data.pdfUrl))
    .catch(() => { /* no ITSO PDF — silently ignore */ })
}
```

Add the ITSO preview card after the existing `abstractPdfUrl` card:
```tsx
{itsoPdfUrl ? (
  <Card className="border border-grey-200 shadow-none">
    <CardHeader className="pb-2">
      <CardTitle className="text-sm font-medium text-navy">ITSO Abstract PDF</CardTitle>
    </CardHeader>
    <CardContent>
      <div className="rounded-md border border-grey-200 bg-white overflow-hidden">
        <iframe
          src={itsoPdfUrl}
          className="w-full h-[500px]"
          title="ITSO PDF Preview"
        />
      </div>
    </CardContent>
  </Card>
) : null}
```

Also update the REQUIRE feedback display in the review history to handle `itso` label:
```typescript
// Replace:
files.map(f => f === 'manuscript' ? 'Manuscript PDF' : 'ACM/ITSO Abstract PDF').join(' + ')
// With:
files.map(f => {
  if (f === 'manuscript') return 'Manuscript PDF'
  if (f === 'acm') return 'ACM Abstract PDF'
  if (f === 'itso') return 'ITSO Abstract PDF'
  return f.toUpperCase()
}).join(' + ')
```

- [ ] **Step 14: Commit frontend changes for Task 3**

```bash
git add frontend/src/lib/api/documents.ts \
        frontend/src/types/admin.ts \
        frontend/src/components/admin/ReviewActionDialog.tsx \
        frontend/src/components/admin/SubmissionStepContent.tsx \
        frontend/src/app/student/submissions/new/[step]/page.tsx \
        frontend/src/app/student/submissions/revise/[id]/page.tsx \
        frontend/src/app/admin/submissions/review/[submissionId]/page.tsx
git commit -m "feat: separate ACM and ITSO file uploads in student submission and admin review"
```

---

## Task 4: Uppercase Feedback Labels in Student Dashboard

The student dashboard shows raw `[REQUIRE:manuscript,acm]` text in the Feedback column. The file names should be uppercase.

- [ ] **Step 1: Add helper and apply to feedback display**

Modify: `frontend/src/app/student/dashboard/page.tsx`

Add a helper function before the `StudentDashboardPage` component:
```typescript
function formatFeedbackText(text: string): string {
  return text.replace(/\[REQUIRE:([^\]]*)\]/, (_match, files: string) =>
    `[REQUIRE:${files.split(',').map((f) => f.trim().toUpperCase()).join(',')}]`
  )
}
```

In the table body, in the feedback cell, wrap the display text:
```tsx
{latestFeedback ? (
  <div className={`rounded-md px-2 py-1.5 ${doc.status === 'rejected' ? 'bg-red-50' : 'bg-violet-50'}`}>
    <p className={`text-xs whitespace-pre-wrap break-words ${doc.status === 'rejected' ? 'text-red-700' : 'text-violet-700'}`}>
      {formatFeedbackText(latestFeedback)}
    </p>
  </div>
) : (
  <span className="text-xs text-grey-400">No feedback</span>
)}
```

- [ ] **Step 2: Commit**

```bash
git add frontend/src/app/student/dashboard/page.tsx
git commit -m "fix: uppercase file names in student dashboard feedback REQUIRE prefix"
```

---

## Final: Push branch

- [ ] **Push to remote**

```bash
git push -u origin ethan/fix
```

---

## Self-Review Checklist

**Spec coverage:**
1. ✅ Full Text Requests — Document Title column (Task 1)
2. ✅ Reports — Academic Year filter, last 6 AYs, both admin + superadmin pages (Task 2)
3. ✅ Student submission — 3 separate file uploads (Task 3)
4. ✅ Admin review — 3 document previews (Task 3, Step 13)
5. ✅ IT/IS required, CS optional for ACM and ITSO (Task 3, `canProceed` + verify-details warning)
6. ✅ Student feedback — uppercase labels (Task 4)

**DB changes:**
- Task 1: No schema change needed (join only)
- Task 3: `itso_file_path TEXT NULL` — run `add_itso_file_path.sql` in Supabase SQL Editor

**Type consistency:**
- `FulltextRequest.document_title` used in fulltext-requests page ✅
- `SubmissionDraft.itsoFileName` used in SubmissionStepContent verify-details ✅
- `ReviewPayload.requireFiles` updated to include `'itso'` ✅
- `ApiDocument.itso_file_path` referenced in review page ✅
- `ReportDateRange` template literal `ay${number}` matches `isWithinRange` `ay*` regex ✅
