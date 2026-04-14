# SPARK — System for Preserving Academic Research and Knowledge

SPARK is the official academic repository system for the **College of Information and Computing Sciences (CICS)** at the **University of Santo Tomas (UST)**. It handles the submission, review, and public publication of thesis and capstone projects across three departments: **Computer Science (CS)**, **Information Technology (IT)**, and **Information Systems (IS)**.

---

## Quick Summary

| | |
|---|---|
| Frontend | Next.js 15 — runs on `http://localhost:3000` |
| Backend | NestJS — runs on `http://localhost:5000` |
| Database | Supabase (PostgreSQL + Auth + Storage) |
| Login page (admin/super admin) | `http://localhost:3000/login` |
| Login page (students) | `http://localhost:3000/student/login` |

---

## Table of Contents

1. [How to Run the Project](#how-to-run-the-project)
2. [Environment Variables](#environment-variables)
3. [Test Accounts](#test-accounts)
4. [User Roles and What They Can Do](#user-roles-and-what-they-can-do)
5. [Features by Portal](#features-by-portal)
6. [Step-by-Step Workflows](#step-by-step-workflows)
7. [How Data Is Stored](#how-data-is-stored)
8. [Departments and Tracks](#departments-and-tracks)
9. [Tech Stack](#tech-stack)
10. [Project Structure](#project-structure)
11. [Known Limitations](#known-limitations)

---

## How to Run the Project

> **Note for groupmates:** The database is already seeded. You do NOT need to run any seed script. Just set up your env files and run the project — all test accounts and sample data are already in Supabase.

### Requirements

- Node.js 18 or higher
- npm

### Step 1 — Install dependencies

```bash
# From the root folder
npm install
cd frontend && npm install && cd ..
cd backend && npm install && cd ..
```

### Step 2 — Set up your environment files

See the [Environment Variables](#environment-variables) section below.

### Step 3 — Start the project

```bash
# From the root folder — starts both frontend and backend at the same time
npm run dev
```

Open `http://localhost:3000` in your browser.

> If you want to run them separately: `cd backend && npm run start:dev` and `cd frontend && npm run dev`

---

## Environment Variables

You need to create two files. Ask the project owner for the actual keys.

### Backend — create `backend/.env`

```env
PORT=5000
SUPABASE_URL=https://qoxtlmpsguiosoatvtkj.supabase.co
SUPABASE_SECRET_KEY=<service-role key — ask project owner, never put this in the frontend>
```

### Frontend — create `frontend/.env.local`

```env
NEXT_PUBLIC_SUPABASE_URL=https://qoxtlmpsguiosoatvtkj.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon/public key — ask project owner>
NEXT_PUBLIC_BACKEND_URL=http://localhost:5000
```

> There are two different Supabase keys. The **service-role key** is secret and only goes in the backend. The **anon key** is safe for the browser and goes in the frontend.

---

## Test Accounts

These accounts are already in the database. Use them to log in and test the system.

| Role | Email | Password | Department |
|---|---|---|---|
| Super Admin | `superadmin@spark.test` | `Password123!` | All departments |
| Admin | `cs-admin@spark.test` | `Password123!` | Computer Science |
| Admin | `it-admin@spark.test` | `Password123!` | Information Technology |
| Admin | `is-admin@spark.test` | `Password123!` | Information Systems |
| Student | `student.cs@spark.test` | `Password123!` | Computer Science |
| Student | `student.it@spark.test` | `Password123!` | Information Technology |
| Student | `student.is@spark.test` | `Password123!` | Information Systems |

**Where to log in:**
- Super Admin and Admin → `http://localhost:3000/login`
- Student → `http://localhost:3000/student/login`

---

## User Roles and What They Can Do

There are four types of users. Each has a different level of access.

### Guest (no login required)
Anyone visiting the site. They can:
- Browse all **approved** theses and capstones on the public site
- Search documents by keyword, author, department, year
- View document details (title, authors, abstract, keywords, adviser, year)
- Download the **abstract** (summary page only — not the full PDF)
- Submit a **full-text request** form to get the full PDF emailed to them

### Student
A CICS student with an account. They can:
- Everything a guest can do
- Log in at `/student/login`
- Submit a new thesis or capstone through a 4-step form
- Track the status of their submissions (Pending / Approved / Rejected / Revision Requested)
- Revise and resubmit a document when the admin requests a revision
- Receive notifications when their submission is reviewed

### Admin (Department Admin)
One admin per department (CS, IT, or IS). They can:
- Log in at `/login`
- View their department's submission queue
- Review each submission and take one of three actions:
  - **Approve** — the document becomes publicly visible on the repository
  - **Request Revision** — the student is notified and can resubmit with corrections
  - **Reject** — the submission is closed
- View full-text access requests from the public and mark them as fulfilled or denied
- View the list of users (students) in their department — **read only, no creating accounts**

> Admins only see data from their own department. A CS admin cannot see IT or IS submissions.

### Super Admin
The system administrator. They can:
- Everything an admin can do, but across **all departments**
- View all submissions system-wide
- Manage all user accounts (students and admins from all departments)
- **Create new admin accounts** (for department admins)
- **Create new student accounts**

> Only the Super Admin can create accounts. Regular admins cannot.

---

## Features by Portal

### Public Site (no login)

| Page | What it does |
|---|---|
| `/` | Landing page — intro, highlights, latest entries |
| `/theses` | Browse CS thesis collections |
| `/theses/[collection]/[track]` | List of approved theses for a specific CS track |
| `/theses/[collection]/[track]/[id]` | Full detail page for one thesis |
| `/capstone` | Browse IT and IS capstone collections |
| `/capstone/[collection]/[track]` | List of approved capstones for a specific track |
| `/capstone/[collection]/[track]/[id]` | Full detail page for one capstone |
| `/search` | Advanced search — keyword, department, type, year range |
| `/authors` | A–Z directory of all authors with published documents |
| `/collections` | Overview of all available collections |
| `/faq` | Frequently asked questions |
| `/about` | About the repository |
| `/contact` | Contact page |
| `/policies` | Submission and access policies |
| `/user-guide` | How to use the system |
| `/how-to-submit` | Guide for students on the submission process |

### Student Portal (`/student/...`)

| Page | What it does |
|---|---|
| `/student/login` | Student login page |
| `/student/dashboard` | Shows all of the student's submissions with status badges |
| `/student/submissions/new/permission` | Terms and agreement before starting a submission |
| `/student/submissions/new/basic-info` | Step 1 — title, name, date, document type |
| `/student/submissions/new/academic-details` | Step 2 — adviser, abstract, keywords |
| `/student/submissions/new/file-upload` | Step 3 — PDF file upload |
| `/student/submissions/new/verify-details` | Step 4 — review everything before submitting |
| `/student/submissions/new/confirmation` | Success page after submitting |
| `/student/submissions/revise/[id]` | Edit and resubmit a document that was sent back for revision |

**Notes on the submission form:**
- On Step 1, the system automatically checks if a similar title already exists and shows a warning
- The PDF file selected on Step 3 is carried over to Step 4 (it is kept in memory, not in localStorage)
- Document type choices are: **Thesis** (for CS) and **Capstone** (for IT/IS)

### Admin Portal (`/admin/...`)

| Page | What it does |
|---|---|
| `/login` | Admin and Super Admin login |
| `/admin/dashboard` | Overview: pending, approved, rejected, and total submission counts |
| `/admin/submissions` | Full list of submissions in the admin's department — searchable and filterable |
| `/admin/submissions/review/[id]` | Detailed view of one submission — approve, request revision, or reject |
| `/admin/fulltext-requests` | List of full-text access requests from the public |
| `/admin/users` | View all students in the admin's department (read only) |
| `/admin/reports` | Analytics dashboard — submission trends, status breakdown, department stats |

**Notes:**
- The Reject button is disabled if a submission is already approved
- The Reports page currently uses sample data (not live analytics)

### Super Admin Portal (`/superadmin/...`)

| Page | What it does |
|---|---|
| `/superadmin/dashboard` | Cross-department overview |
| `/superadmin/submissions` | All submissions across all three departments |
| `/superadmin/users` | All users system-wide — create admin accounts and student accounts |

---

## Step-by-Step Workflows

### How a student submits a document

1. Student logs in at `/student/login`
2. Goes to Dashboard → clicks **New Submission**
3. Reads and agrees to the terms
4. Fills in the 4-step form:
   - Title (system warns if a similar title already exists)
   - Adviser, abstract, keywords
   - Uploads PDF (max 10 MB)
   - Reviews everything
5. Clicks Submit → document is saved to the database with status **Pending Review**
6. Student is redirected to the confirmation page, then sees it on their dashboard

### How an admin reviews a submission

1. Admin logs in at `/login`
2. Goes to **Submissions** → finds the pending document
3. Clicks **Review** → reads the metadata, abstract, and review history
4. Takes an action:
   - **Approve** → document is published publicly on the repository. Student is notified.
   - **Request Revision** → admin writes feedback. Student is notified and can resubmit.
   - **Reject** → document is closed. Student is notified.

### How a student revises a rejected or revision-requested submission

1. Student receives a notification
2. Goes to Dashboard → sees the submission with a **Revision** badge
3. Clicks **Revise** → sees the admin's feedback
4. Edits the fields or re-uploads the PDF
5. Submits → status goes back to **Pending Review**

### How a guest requests the full-text PDF

1. Guest finds an approved thesis or capstone on the public site
2. Clicks **Request Full Text** → a form appears (page scrolls down to it automatically)
3. Fills in name, email, affiliation, and purpose
4. Submits the form
5. Admin sees the request in the **Full-Text Requests** tab
6. Admin manually emails the PDF to the requester
7. Admin marks the request as **Fulfilled** or **Denied**

### How the Super Admin creates a new account

1. Super Admin logs in at `/login` → lands on the Super Admin portal
2. Goes to **User Management**
3. Clicks **Add Admin** or **Add Student**
4. Fills in full name, email, department, and sets an initial password
5. Account is created immediately — no email confirmation needed
6. The new user can log in right away with the email and password that was set

---

## How Data Is Stored

| What | Where |
|---|---|
| User accounts, roles, departments | Supabase database (`users` table) |
| Submitted document metadata (title, authors, abstract, keywords, etc.) | Supabase database (`documents` table) |
| Review decisions and feedback | Supabase database (`reviews` table) |
| Notifications | Supabase database (`notifications` table) |
| Full-text access requests | Supabase database (`fulltext_requests` table) |
| PDF files | Supabase Storage (private bucket called `documents`) |
| Login session (JWT token) | Browser localStorage — cleared on logout |

**About PDFs specifically:**
- The actual PDF file is stored in **Supabase Storage**, not in the database
- The database only stores the file path that points to where the file is in storage
- PDFs are in a **private** bucket — no one can access them directly via a URL
- Only abstracts are public
- Full documents are sent manually by the admin after a full-text request is approved

---

## Departments and Tracks

### Computer Science — Document type: Thesis

| Track |
|---|
| Core Computer Science |
| Game Development |
| Data Science |

### Information Technology — Document type: Capstone

| Track |
|---|
| Network and Security |
| Web and Mobile App Development |
| IT Automation Track |

### Information Systems — Document type: Capstone

| Track |
|---|
| Business Analytics |
| Service Management |

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 15 (App Router), React 18, TypeScript |
| Backend | NestJS 11, TypeScript |
| Database | Supabase (PostgreSQL) |
| Authentication | Supabase Auth (email + password, JWT tokens) |
| File Storage | Supabase Storage (private bucket) |
| Styling | Tailwind CSS, Radix UI, shadcn/ui components |
| Icons | lucide-react |
| Form validation (backend) | class-validator |

---

## Project Structure

```
/
├── package.json                  ← Runs both apps together with one command
│
├── backend/                      ← NestJS API server (port 5000)
│   ├── src/
│   │   ├── modules/
│   │   │   ├── auth/             Login, logout, get current user
│   │   │   ├── documents/        Browse, search, upload, revise, download abstract
│   │   │   ├── admin/            Submission review, full-text requests, user listing
│   │   │   ├── superadmin/       Create admin accounts
│   │   │   ├── student/          Student's own submission list
│   │   │   ├── fulltext/         Guest full-text requests
│   │   │   └── notifications/    Per-user notification list
│   └── API-Endpoints.md          Full API reference with request/response shapes
│
└── frontend/                     ← Next.js app (port 3000)
    └── src/
        ├── app/
        │   ├── page.tsx          Public landing page
        │   ├── login/            Admin + Super Admin login
        │   ├── student/          Student portal pages
        │   ├── admin/            Admin portal pages
        │   ├── superadmin/       Super Admin portal pages
        │   ├── theses/           Public CS thesis pages
        │   ├── capstone/         Public IT/IS capstone pages
        │   ├── search/           Advanced search
        │   └── authors/          Author directory
        ├── components/
        │   ├── admin/            Admin shell, tables, review dialog, etc.
        │   ├── student/          Student shell
        │   ├── thesis/           Thesis list and detail components
        │   └── ui/               Shared UI components (buttons, inputs, cards)
        └── lib/
            ├── api/              Functions that call the backend API
            ├── admin/session.ts  Saves/reads admin login session
            └── student/session.ts Saves/reads student login session
```

---

## Known Limitations

| Area | Status |
|---|---|
| Reports page | Uses sample/mock data — not connected to real analytics yet |
| Full-text PDF delivery | Manual — admin emails the PDF themselves after approving a request |
| Email notifications | Not wired — the system stores notifications in the DB but does not send actual emails |
| HTTPS | Not set up for local development — required for production |
| OAI-PMH harvesting | Not implemented — needed if the repository should be indexed by Google Scholar |

---

## API Reference

See [`backend/API-Endpoints.md`](backend/API-Endpoints.md) for the full list of endpoints.

Base URL: `http://localhost:5000/api`

All protected endpoints require this header:
```
Authorization: Bearer <access_token>
```
