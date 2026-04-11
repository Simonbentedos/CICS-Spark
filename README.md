# SPARK — System for Preserving Academic Research and Knowledge

**SPARK** is a web-based academic repository for the College of Information and Computing Sciences (CICS) at the University of Santo Tomas (UST). It manages thesis and capstone submissions through a role-gated review-and-approval pipeline before public publication.

---

## TL;DR

| What | Detail |
|---|---|
| Backend | NestJS 11 on port 5000, fully built and wired to Supabase |
| Frontend | Next.js 15 App Router on port 3000, fully wired to backend API |
| Database | Supabase (PostgreSQL + Auth + Storage) |
| Status | All core flows implemented; requires Supabase seeding before first run |

Roles: **Guest** (browse/search), **Student** (upload/revise), **Admin** (review, manage dept users), **Super Admin** (cross-dept, manage all accounts).

---

## What Has Been Built

### Backend (NestJS) — fully implemented

- JWT authentication via Supabase Auth (`POST /api/auth/login`, `POST /api/auth/logout`, `GET /api/auth/me`)
- Student document upload (multipart PDF → Supabase Storage bucket `documents`)
- Document revision by original uploader when status is `revision`
- Document listing with filters (department, type, track, keyword, year, pagination)
- Full-text search across title and abstract (Dice coefficient similarity)
- Duplicate title detection (`GET /api/documents/check-duplicate?title=...`, warns if ≥80% match)
- Abstract download endpoint (`GET /api/documents/:id/download-abstract`)
- Single document fetch by UUID (`GET /api/documents/:id`)
- Admin submission queue (filtered by department)
- Admin review actions: approve / reject / request revision
- Admin full-text request queue (list + mark fulfilled/denied)
- Notifications per user (list, mark read)
- Super Admin: create admin accounts (`POST /api/superadmin/admins`)
- Admin: create student accounts (`POST /api/admin/students`)
- `GET /api/student/documents` — list documents uploaded by the logged-in student
- `GET /api/admin/users` — list users scoped to admin's department
- SupabaseGuard (JWT verification) + RolesGuard on all protected routes
- DTO validation with class-validator on every endpoint
- DB trigger for account activation on email confirmation

### Frontend (Next.js) — fully wired to backend

#### Authentication
- Admin/Super Admin login at `/login` → `POST /api/auth/login`, JWT stored in localStorage + cookie
- Student login at `/student/login` → same pattern, separate session key
- Route guards on every protected page; redirects to `/login` if session is missing or role is wrong

#### Public Pages
- `/` — Landing page with hero, highlights, and latest entries
- `/theses/[collection]/[track]` — Thesis listing by CS track (live API, filtered by department + type)
- `/theses/[collection]/[track]/[id]` — Thesis detail with metadata, abstract download, full-text request form
- `/capstone/[collection]/[track]` — Capstone listing for IT and IS
- `/capstone/[collection]/[track]/[id]` — Capstone detail page (same features as thesis detail)
- `/search` — Advanced search with keyword, multi-criteria rows, and date range filter
- `/authors` — A–Z author directory built from live document data
- `/collections` — All collections overview
- Static pages: `/faq`, `/about`, `/contact`, `/policies`, `/user-guide`, `/how-to-submit`

#### Student Portal (`/student/*`)
- `/student/login` — Login page
- `/student/dashboard` — List of the student's own submissions with status badges; "Revise" link appears when status is `revision`
- `/student/submissions/new/[step]` — 4-step upload form:
  - **Step 1:** Metadata (title with live duplicate-detection on blur → amber warning if ≥80% match)
  - **Step 2:** Authors, keywords, abstract
  - **Step 3:** PDF file upload (real `<input type="file">`, file held in React state)
  - **Step 4:** Verify details → submits `POST /api/documents/upload` as multipart FormData
- `/student/submissions/revise/[id]` — Revision page: shows admin feedback, editable fields, optional PDF replacement → `PUT /api/documents/:id`

#### Admin Portal (`/admin/*`)
- `/login` — Admin/Super Admin login
- `/admin/dashboard` — KPI cards (submission counts by status, user count) wired to live API
- `/admin/submissions` — Submission queue filtered to admin's department; tabs: Pending / All / Revision Requested / Full-Text Requests
- `/admin/submissions/[id]` — Submission detail with review dialog (approve / reject / request revision with feedback)
- `/admin/users` — User table scoped to admin's department; "Add Student" dialog → `POST /api/admin/students`

#### Super Admin Portal (`/superadmin/*`)
- `/superadmin/dashboard` — Cross-department stats: all submissions by status + total user count
- `/superadmin/users` — All-users table with role, department, and status columns; "Add Admin" + "Add Student" dialogs

---

## Core Workflows

### Document Submission
1. Student logs in → navigates to `/student/submissions/new/permission` → agrees to terms
2. Step 1: enters title → on blur, duplicate check fires → amber warning shown if similar title exists
3. Step 3: selects PDF file (held in React state, not persisted to localStorage)
4. Step 4: reviews details → submits → `POST /api/documents/upload` with FormData → status `pending`
5. Draft cleared from localStorage; student redirected to dashboard

### Admin Review
1. Admin logs in → `/admin/submissions` → finds pending submission
2. Opens submission → clicks Approve / Request Revision / Reject
3. Decision posted to `POST /api/admin/submissions/:id/review`
4. On approve: document published (`status = approved`), student notified
5. On revision: student receives feedback, can edit and resubmit

### Full-Text Request
1. Guest views any approved thesis/capstone detail page
2. Clicks "Request Full Text" → inline form (name, email, department, purpose)
3. `POST /api/fulltext-requests` (no auth required)
4. Admin finds request in Full-Text Requests tab → manually emails the PDF → marks `fulfilled` or `denied`

---

## First-Time Supabase Setup (two steps)

The database schema tables and enum types must already exist in Supabase (see `CLAUDE.md`). Once they do, only two steps are needed:

### Step A — Run the seed script

Creates auth users, inserts `public.users` rows, creates the storage bucket, and seeds 20 sample documents. Run once from the repo root:

```bash
cd backend
npm run seed
```

The script is idempotent — safe to re-run if anything failed part way through.

### Step B — Apply RLS policies (paste once in Supabase SQL Editor)

Open your Supabase project → **SQL Editor** → paste the contents of `backend/supabase/rls.sql` → click **Run**.

This enables row-level security on all tables and installs the account-activation trigger. All statements use `OR REPLACE` / `DROP IF EXISTS`, so it is also safe to re-run.

That's it. The system is ready to run.

---

### MVP Credentials

| Role | Email | Password | Department |
|---|---|---|---|
| Super Admin | `superadmin@spark.test` | `Password123!` | CS |
| Admin | `cs-admin@spark.test` | `Password123!` | CS |
| Admin | `it-admin@spark.test` | `Password123!` | IT |
| Admin | `is-admin@spark.test` | `Password123!` | IS |
| Student | `student.cs@spark.test` | `Password123!` | CS |
| Student | `student.it@spark.test` | `Password123!` | IT |
| Student | `student.is@spark.test` | `Password123!` | IS |

---

## How to Run

### Prerequisites

- Node.js 18+
- npm 9+
- A Supabase project with the schema applied (see `CLAUDE.md`)

### 1. Install dependencies

```bash
npm install              # root (installs concurrently)
cd backend && npm install
cd ../frontend && npm install
```

### 2. Configure environment variables

**`backend/.env`** (create from `backend/.env.example`):
```env
PORT=5000
SUPABASE_URL=https://<your-project>.supabase.co
SUPABASE_SECRET_KEY=<service-role key — never expose to browser>
```

**`frontend/.env.local`** (create from `frontend/.env.local.example`):
```env
NEXT_PUBLIC_SUPABASE_URL=https://<your-project>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon key — safe for browser>
NEXT_PUBLIC_BACKEND_URL=http://localhost:5000
```

### 3. Run both apps

```bash
# From repo root — starts backend (port 5000) and frontend (port 3000) together
npm run dev
```

Or separately:
```bash
cd backend && npm run start:dev    # NestJS
cd frontend && npm run dev         # Next.js
```

Open `http://localhost:3000`.

---

## How to Test

### Quick Manual Walkthrough

#### Public browse and search
1. Go to `http://localhost:3000` — landing page loads
2. Navigate to **Collections → Computer Science → Core Computer Science**
3. Thesis listing fetches from API; click an entry → detail page opens
4. Click **Download Abstract** → PDF download prompt appears
5. Click **Request Full Text** → form expands; fill and submit → check Supabase `fulltext_requests` table
6. Go to `/search?q=machine+learning` → search fires automatically → results listed
7. Add a second criteria row, set a date range → client-side filter narrows results

#### Student flow
1. Go to `/student/login` → log in as `student.cs@spark.test` / `Password123!`
2. Dashboard shows (empty on first run)
3. Click **New Submission** → work through 4 steps → upload any PDF
4. On submit: check Supabase `documents` table for a new `pending` row; check Storage bucket for the file
5. Log out

#### Admin review
1. Go to `/login` → log in as `cs-admin@spark.test` / `Password123!`
2. Dashboard shows submission counts
3. Go to **Submissions** → find the pending submission
4. Open it → click **Request Revision** → enter feedback → submit
5. Check `reviews` table for the new row; check `notifications` table for the student notification

#### Student revision
1. Log back in as `student.cs@spark.test`
2. Dashboard shows the submission with a **Revision** badge and a **Revise** link
3. Click **Revise** → admin feedback is displayed → edit a field → submit
4. Check `documents` table: status resets to `pending`

#### Admin: full-text requests
1. As `cs-admin@spark.test` → go to **Submissions → Full-Text Requests tab**
2. Find the request → click **Mark Fulfilled**
3. Check `fulltext_requests` table for the status update

#### Super Admin
1. Log in as `superadmin@spark.test` → redirected to `/superadmin/dashboard`
2. Cross-department stats visible
3. Go to **User Management** → click **Add Admin** → fill form → submit
4. Check Supabase Auth for the invite email (or seed directly for MVP)

### Backend Tests

```bash
cd backend
npm run test        # unit tests
npm run test:e2e    # end-to-end tests (requires live Supabase connection)
```

---

## Known Limitations

- **No rate limiting** — `@nestjs/throttler` is not yet configured; auth endpoints are unprotected from brute force.
- **`apiDocToEntry` duplicated** — the adapter from `ApiDocument` to `ThesisEntry` is inlined in 5+ files; could be extracted to a shared `lib/utils/api-adapters.ts`.
- **Track-less document URLs** — if a document has no `track_specialization`, its browse URL becomes malformed (`/theses/department/.../uuid`). All uploads currently require a track via the student form.
- **Department field on upload form** — the "Department" input in step 1 is informational; the actual API call uses the department from the student's session token.
- **Supabase RLS policies** — must be manually applied. Until then, the backend's service-role key bypasses RLS for all writes, but public reads may behave unexpectedly.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 15 (App Router), React 18, TypeScript |
| Backend | NestJS 11, TypeScript, Express |
| Database | Supabase (PostgreSQL) |
| Auth | Supabase Auth (email + password, JWT) |
| File storage | Supabase Storage (bucket: `documents`) |
| Styling | Tailwind CSS, Radix UI primitives, shadcn/ui |
| Icons | lucide-react |
| Date handling | date-fns |
| Validation | class-validator + class-transformer (backend DTOs) |

---

## Project Structure (abbreviated)

```
/
├── backend/
│   ├── src/
│   │   ├── modules/auth/           Login, logout, /me; JWT + role guards
│   │   ├── modules/documents/      CRUD, search, duplicate check, abstract download
│   │   ├── modules/admin/          Submission queue, review, fulltext queue, user mgmt
│   │   ├── modules/superadmin/     Admin account creation
│   │   ├── modules/student/        Student document list
│   │   ├── modules/fulltext/       Guest full-text access requests
│   │   └── modules/notifications/  Per-user notifications
│   └── API-Endpoints.md            Full API reference
│
└── frontend/
    └── src/
        ├── app/
        │   ├── page.tsx                  Public landing page
        │   ├── theses/                   CS thesis browse + detail
        │   ├── capstone/                 IT/IS capstone browse + detail
        │   ├── search/                   Advanced search
        │   ├── authors/                  A-Z author directory
        │   ├── login/                    Admin login
        │   ├── student/                  Student portal
        │   ├── admin/                    Admin portal
        │   └── superadmin/               Super Admin portal
        ├── components/
        │   ├── admin/                    AdminShell, SuperAdminShell, tables, dialogs
        │   ├── student/                  StudentShell
        │   ├── thesis/                   ThesisListItem, ThesisDetailView
        │   └── search/                   AdvancedSearchPanel
        └── lib/
            ├── api/                      API client functions (auth, documents, users)
            ├── admin/session.ts          Admin session (localStorage + cookie)
            └── student/session.ts        Student session (localStorage + cookie)
```

---

## API Reference

See [`backend/API-Endpoints.md`](backend/API-Endpoints.md) for the full endpoint reference.

Base URL: `http://localhost:5000/api`

All protected endpoints require: `Authorization: Bearer <access_token>`
