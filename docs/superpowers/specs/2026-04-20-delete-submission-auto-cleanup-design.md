# Design: Delete Submission + Auto-Delete Rejected Submissions

**Date:** 2026-04-20
**Status:** Approved

---

## Overview

Two related features:

1. **Manual delete** — Super admins can delete any submission from the submissions list page.
2. **Auto-delete** — Submissions with `status='rejected'` that haven't been resubmitted within 30 days are automatically purged.
3. **Resubmit rejected** — Students can resubmit a rejected document in-place (same record, status resets to `pending`), which also resets the 30-day deletion clock.

---

## Architecture

### Backend

#### 1. `DELETE /api/superadmin/submissions/:id`

- **Location:** `SuperadminController` + `SuperadminService`
- **Guard:** `SupabaseGuard`, `RolesGuard`, `@Roles('super_admin')`
- **Flow:**
  1. Fetch document row by `id` — throw `NotFoundException` if missing
  2. Delete PDF from Supabase Storage: `storage.from('documents').remove([pdf_file_path])`
  3. Delete DB row from `documents`
  4. Return `{ message: 'Submission deleted.' }`
- **Error handling:** Storage deletion failures are logged but do not block DB deletion (orphaned files are acceptable; DB row is the source of truth). DB deletion failure throws `InternalServerErrorException`.

#### 2. `CleanupModule` — auto-delete cron job

- **Location:** New module at `backend/src/modules/cleanup/`
  - `cleanup.module.ts` — imports `DatabaseModule`, registers `CleanupService`
  - `cleanup.service.ts` — contains the `@Cron` method
- **Schedule:** `@Cron('0 2 * * *')` — runs at 2 AM daily
- **Logic:**
  ```
  SELECT * FROM documents
  WHERE status = 'rejected'
    AND updated_at < NOW() - INTERVAL '30 days'
  ```
  For each result: delete storage file, then delete DB row.
- **Clock:** Uses `updated_at`. When a student resubmits a rejected doc, `updated_at` is set to `NOW()` and `status` resets to `pending` — the record is no longer `rejected`, so the cron naturally skips it.
- **App wiring:** `ScheduleModule.forRoot()` added to `AppModule` imports; `CleanupModule` added to `AppModule` imports.
- **Package:** `@nestjs/schedule` (install via `npm install @nestjs/schedule`)

#### 3. Allow resubmission of rejected documents

- **Location:** `DocumentsService.reviseDocument`
- **Change:** Extend the status guard from `status !== 'revision'` to reject only when `status` is neither `'revision'` nor `'rejected'`.
- **Effect:** A student can call `PUT /api/documents/:id` on a rejected doc. The existing flow handles everything: optional new PDF upload, metadata updates, `status` reset to `'pending'`, `updated_at` updated.
- **Error message update:** Change the ForbiddenException message to reflect both allowed statuses: `"Only documents with status 'revision' or 'rejected' can be re-submitted."`

---

### Frontend

#### Submissions page (`/superadmin/submissions`)

- **New state:**
  - `deleteTarget: ApiDocument | null` — the submission to delete
  - `deleteSaving: boolean`
  - `deleteError: string | null`

- **New column in `columns` array:**
  Replace the single `action` column (Review link) with two action buttons:
  - "Review" link (existing)
  - "Delete" button — Trash2 icon, red hover, only shown to super_admin (always shown since this is the superadmin page)

- **Confirmation modal:** `AdminModal` (existing component) opens when Delete is clicked
  - Title: "Delete Submission"
  - Subtitle: Shows the submission title in quotes
  - Confirm button: red `bg-red-600`, label "Delete Submission" / "Deleting…"
  - Error shown inline if delete fails

- **After delete:** `setDeleteTarget(null)`, refetch submissions list

#### API layer (`frontend/src/lib/api/documents.ts`)

- Add `deleteSubmission(id: string): Promise<{ message: string }>` → `DELETE /api/superadmin/submissions/:id`

---

## Data Flow

```
Super admin clicks Delete
  → AdminModal opens with submission title
  → Confirms → deleteSubmission(id) → DELETE /api/superadmin/submissions/:id
  → Backend: fetch doc → delete storage → delete DB row
  → Frontend: close modal → refetch list

Nightly at 2 AM (server)
  → CleanupService.purgeStaleRejected()
  → Query rejected docs older than 30 days
  → For each: delete storage → delete DB row

Student resubmits rejected doc
  → PUT /api/documents/:id (existing endpoint, now allows 'rejected' status)
  → updated_at = NOW(), status = 'pending'
  → Doc no longer matches cron query → clock reset
```

---

## Error Handling

| Scenario | Behavior |
|---|---|
| Doc not found on manual delete | `NotFoundException` |
| Storage delete fails on manual delete | Log warning, proceed with DB delete |
| DB delete fails on manual delete | `InternalServerErrorException` |
| Cron storage delete fails | Log warning, proceed with DB delete |
| Cron DB delete fails | Log error, continue to next record |
| Student tries to resubmit non-rejected/non-revision doc | `ForbiddenException` |

---

## Files to Create

- `backend/src/modules/cleanup/cleanup.module.ts`
- `backend/src/modules/cleanup/cleanup.service.ts`

## Files to Modify

- `backend/src/app.module.ts` — add `ScheduleModule.forRoot()` + `CleanupModule`
- `backend/src/modules/superadmin/superadmin.controller.ts` — add `DELETE submissions/:id`
- `backend/src/modules/superadmin/superadmin.service.ts` — add `deleteSubmission(id)`
- `backend/src/modules/documents/documents.service.ts` — extend status guard in `reviseDocument`
- `frontend/src/lib/api/documents.ts` — add `deleteSubmission(id)`
- `frontend/src/app/superadmin/submissions/page.tsx` — add Delete button, modal, state, handler
