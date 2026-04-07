# CICS SPARK Repository

A Next.js frontend for the **SPARK (System for Preserving Academic Research and Knowledge)** repository used by the College of Information and Computing Sciences.

## Features

- Thesis and Capstone browsing by **Department -> Specialization Track -> Academic Material**
- Author directory page with A-Z grouping
- Collections page with quick access to department and specialization routes
- Admin portal with **3 distinguishable dashboards**:
  - Computer Science (Blue accent)
  - Information Technology (Green accent)
  - Information Systems (Orange accent)
- Search page with multi-field and date-range filtering

## Tech Stack

- Next.js 14
- React 18
- TypeScript
- Tailwind CSS

## Prerequisites

- Node.js 18+
- npm 9+

## Getting Started

1. Install dependencies:

```bash
npm install
```

2. Run the development server:

```bash
npm run dev
```

3. Open:

```text
http://localhost:3000
```

## Production Build

Build and run locally:

```bash
npm run build
npm run start
```

## Useful Scripts

- `npm run dev` - start dev server
- `npm run build` - create production build
- `npm run start` - start production server
- `npm run lint` - run linting

## Dummy Admin Credentials

Use any of these at `/login`:

- Computer Science Dashboard: `cs-admin@spark.test` / `Password123!`
- Information Technology Dashboard: `it-admin@spark.test` / `Password123!`
- Information Systems Dashboard: `is-admin@spark.test` / `Password123!`

## Dummy Student Credentials

Use these at `/student/login`:

- Computer Science Student: `student.cs@spark.test` / `Password123!`
- Information Technology Student: `student.it@spark.test` / `Password123!`
- Information Systems Student: `student.is@spark.test` / `Password123!`

## Main Frontend Routes

- `/` - Landing page
- `/theses` - Thesis departments
- `/capstone` - Capstone departments
- `/collections` - Collections browser
- `/authors` - Author directory (A-Z)
- `/search` - Advanced search
- `/faq` - FAQ page
- `/policies` - Repository policies
- `/about` - About page
- `/contact` - Contact page
- `/user-guide` - User guide page
- `/how-to-submit` - Submission guide
- `/login` - Admin login
- `/student/login` - Student login
- `/student/dashboard` - Student dashboard

## Notes

- Admin data is mock/local for frontend testing.
- Session and mock repository data are persisted in browser `localStorage`.
- Product requirements and delivery guide: [`docs/PRD.md`](docs/PRD.md)

## Today's Changes (Concise)

- Added specialization-track drill-down for Thesis and Capstone:
  - Department -> Specialization Track -> Materials -> Item Detail
- Updated specialization descriptions (CS/IT/IS) with short paraphrased summaries.
- Added/fixed public pages and links to remove 404s:
  - `collections`, `authors`, `about`, `contact`, `user-guide`, `how-to-submit`, `acceptable-use-policy`, `privacy-policy`
- Fixed header/breadcrumb rendering and hydration issue in breadcrumb separator markup.
- Improved perceived page transitions with global loading UI and dev-speed script update (`next dev --turbo`).
- Styled sidebar search box to match the target reference.
- Implemented 3 distinct admin dashboards (CS blue, IT green, IS orange) with dummy admin credentials.
- Added logout confirmation prompt.
- Enabled both admin and student submission flows:
  - Admin can add thesis via `/admin/submissions/new/*`
  - Students can submit via `/student/submissions/new/*`
- Added student portal with student-owned submission flow:
  - `/student/login`, `/student/dashboard`, `/student/submissions/new/*`
- Added PRD guide for faster team development:
  - [`docs/PRD.md`](docs/PRD.md)
- Updated admin login branding text from `SAGE Thesis Repository System` to `SPARK Repository System`.
