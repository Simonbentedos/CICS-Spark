# CICS Repository PRD (Product Requirements Document)

## 1. Product Overview

SPARK is a web-based academic repository for the College of Information and Computing Sciences (CICS). It stores theses, capstone projects, and related metadata, with role-based workflows for public browsing, student submission, admin review, and super-admin governance.

## 2. Goals

- Preserve and publish approved academic outputs.
- Provide fast public search and browsing for abstracts and metadata.
- Enforce a clear review-and-approval workflow before publication.
- Separate responsibilities by role (Guest, Student, Admin, Super Admin).

## 3. Non-Goals (Current Phase)

- No direct self-registration for public users.
- No admin-side direct thesis submission (submission belongs to Student role).
- No external payment or monetization flows.

## 4. User Roles and Permissions

## Guest
- Browse repository collections and search records.
- View and download abstracts.
- Submit full-text access requests.
- Cannot upload, edit, approve, or publish materials.

## Student User
- Login to student portal.
- Upload thesis/research PDF and required metadata.
- Revise and resubmit when feedback is returned.
- Track review status and history.
- Cannot approve/reject/publish submissions.

## Admin (Department-level)
- Review student submissions.
- Verify metadata and document compliance.
- Approve/reject with feedback.
- Publish approved submissions.
- Handle full-text request fulfillment process.
- Cannot assign global roles or manage system-wide settings.

## Super Admin
- Assign and manage admin/student accounts.
- Oversee global repository settings and governance.
- Monitor cross-department content and audit activity.

## 5. Functional Requirements

## FR-01 Authentication and Access Control
- Role-based login and session handling.
- Route protection per role.
- Logout with confirmation.

## FR-02 Repository Browsing
- Public browsing by document type, department, and specialization tracks.
- A-Z author listing.
- Search by title, author, keyword, and date.

## FR-03 Submission Workflow (Student-Owned)
- Student upload form: file + metadata.
- Validation: required fields and allowed file formats.
- Submission status states: Pending Review, Approved, Rejected, Revision Requested.

## FR-04 Review Workflow (Admin-Owned)
- Review queue with filters and sorting.
- Per-submission review page.
- Approval/rejection/revision feedback.
- Publication only after successful review.

## FR-05 Full-Text Access Request
- Guest/student request mechanism.
- Admin receives and processes requests.
- Admin sends full-text manually (current phase) and logs status updates.

## FR-06 User and Role Management
- Super Admin can create/manage users and assign roles.
- Admin has scoped user visibility based on department rules.

## FR-07 Audit and Reporting
- Activity logging (auth, review actions, publication events, status changes).
- Department and status summary reports.

## 6. Workflow Summary

1. Guest browses/searches and downloads abstract.
2. If full text needed, guest submits request.
3. Student uploads thesis + metadata via student portal.
4. Admin reviews and either:
   - Approves -> publish to repository.
   - Requests revision -> student revises and resubmits.
   - Rejects -> status updated with reason.
5. Super Admin oversees users, roles, and global controls.

## 7. Quality and Standards Baseline

The system should align with:

- ISO/IEC 25010 (software quality):
  - Functional suitability
  - Reliability
  - Usability
  - Performance efficiency
  - Maintainability
- ISO/IEC 27001 (information security):
  - RBAC
  - HTTPS transport
  - Audit logging
  - Secure credential handling
- OAIS (ISO 14721) concepts for preservation-oriented repository behavior.
- Dublin Core metadata fields for discoverability and interoperability.
- OAI-PMH readiness for metadata harvesting and external indexing.
- WCAG 2.1 AA for accessibility.

## 8. Performance Requirements

- Initial route transition feedback <= 200ms (loading UI shown when needed).
- Search request/response for local dataset <= 1s for normal load.
- No hydration/runtime errors in production build.
- Lighthouse performance target >= 80 for key public pages (phase target).

## 9. Security Requirements

- Enforce role-based route guards.
- Validate and sanitize all user inputs.
- Store sensitive credentials securely (hashed, never plain text).
- Keep audit trails for admin actions.

## 10. Data Model (Minimum)

- User: id, name, email, role, department, status.
- Submission: id, title, authors, department, track, metadata, file pointer, status, reviewer notes.
- ReviewLog: submissionId, action, actor, timestamp, notes.
- FullTextRequest: requestId, requester, itemId, status, processedBy, processedAt.

## 11. Release Plan (Fast Execution)

## Phase 1: Stabilize Current Frontend (Now)
- Remove admin submission feature entry points.
- Fix hydration/runtime issues.
- Finalize specialization-track browsing UX.
- Complete route coverage (no 404s for linked pages).

## Phase 2: Student Portal MVP
- Student authentication and dashboard.
- Upload + metadata flow.
- Submission revision loop.

## Phase 3: Admin Review and Full-Text Queue
- Structured review states and feedback templates.
- Full-text request tracker.
- Notification hooks.

## Phase 4: Super Admin and Governance
- Role assignment UI.
- System-wide settings.
- Enhanced audit and reporting.

## 12. Engineering Checklist

- Use strict TypeScript and CI checks.
- Add route-level tests for role access.
- Add component tests for critical workflows.
- Keep UI/UX consistent across Thesis/Capstone/Tracks.
- Track defects by severity and owner.

## 13. Open Decisions

- Final student authentication provider.
- File storage backend and retention policy.
- Email provider for notifications/full-text delivery.
- Final metadata schema extensions per department.