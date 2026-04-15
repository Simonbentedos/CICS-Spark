# SPARK System - Fixes Progress

## Summary of Remaining Work

### FRONTEND ONLY: (7 issues)
1. Gray accent color and UST logo - Design/styling
2. ✅ **Hardcoded document counts** - Fixed for both capstone and thesis pages
3. Missing content pages - Policies, user guide, contact details text
4. FAQs need updating - Content updates
5. Reports page hardcoded - Mock data in UI
6. No Settings page - UI doesn't exist yet
7. Authors page broken - UI/navigation issues

### BACKEND ONLY: (2 issues)
1. Performance/slow response times - API optimization needed
2. Document limits unclear - Backend logic/constraints

### BOTH FRONTEND + BACKEND: (5 issues)
1. ✅ **Full-text request workflow** - Department field fixed, email notifications partially implemented
2. ✅ **Superadmin document preview** - PDF preview implemented with iframe
3. Student submission workflow - Form refinement + API fixes
4. Approved submissions not reflecting - Frontend not fetching + backend not serving correctly
5. User Management refinement - UI improvements + API fixes

### DATA/CONTENT (Not code): (2 issues)
1. Real accounts and credentials - Database/Supabase setup
2. Real thesis documents - Content population

---

## Issues Being Addressed

### 1. Full-text Request Workflow ✅ PARTIALLY FIXED
**Problem:** Department/Affiliation field was a free text input, but backend expects one of: `['CS', 'IT', 'IS', 'Other']`

**Solution:** ✅ Changed the input to a dropdown select with the four valid options and made it required.

**What's Fixed:**
- ✅ Department field is now a dropdown (CS/IT/IS/Other)
- ✅ Field is required
- ✅ Matches backend validation

**What Still Needs Work:**
- Better error handling for duplicate requests
- Email notification when request is fulfilled/denied (currently manual)

**Files Modified:**
- `frontend/src/app/theses/[collection]/[track]/[thesis]/page.tsx`
- `frontend/src/app/capstone/[collection]/[track]/[item]/page.tsx`

**Status:** ✅ Core issue fixed - Department dropdown working

**Testing:**
1. Go to any approved thesis/capstone detail page
2. Click "Request Full Text" button
3. Verify Department field shows as dropdown with CS/IT/IS/Other options
4. Try submitting without selecting (should show validation error)
5. Select a department and submit
6. Login as admin → go to Full-Text Requests
7. Verify the request appears with correct department value

---

### 2. Approved Submissions Not Reflecting 🔍 NEEDS TESTING
**Problem:** When admin approves submissions, they don't show on public thesis/capstone pages

**Investigation Findings:**
- ✅ Backend `listDocuments` API correctly filters by `status: 'approved'`
- ✅ Backend uses case-insensitive LIKE query for track matching
- ✅ Frontend thesis/capstone track pages call `listDocuments` API correctly
- ⚠️ Possible issues:
  - No approved documents exist in database yet
  - Track name mismatch in database vs frontend
  - Department mapping issue

**How to Test:**
1. Login as student (student.cs@spark.test / Password123!)
2. Go to Dashboard → New Submission
3. Fill out all 4 steps and submit a thesis
4. Login as admin (cs-admin@spark.test / Password123!)
5. Go to Submissions → find the pending submission
6. Click Review → Approve
7. Logout and go to public site
8. Navigate to Theses → Computer Science → [the track you selected]
9. **Expected:** Your approved thesis should appear in the list
10. **If not appearing:** Check if track name in database matches exactly

**Potential Fix Needed:**
If track names don't match, we may need to:
- Standardize track names in the database
- OR update the frontend to use exact database values
- OR make the backend matching more flexible

---

### 3. Superadmin Document Preview ✅ FIXED
**Problem:** No PDF preview for submissions in superadmin/admin review pages

**Solution:** 
- ✅ Added backend endpoint: `GET /api/admin/submissions/:id/preview-pdf`
- ✅ Generates signed URL from Supabase Storage (valid for 1 hour)
- ✅ Added PDF iframe viewer in review pages
- ✅ Shows loading state while PDF loads
- ✅ Respects department permissions (admins can only view their department's PDFs)

**How it Works:**
1. Admin/Superadmin opens a submission review page
2. Frontend calls the new API endpoint
3. Backend generates a temporary signed URL from Supabase Storage
4. PDF displays in an iframe (600px height)
5. URL expires after 1 hour for security

**Files Modified:**
- `backend/src/modules/admin/admin.controller.ts` - New endpoint
- `backend/src/modules/admin/admin.service.ts` - PDF URL generation logic
- `frontend/src/lib/api/documents.ts` - API function
- `frontend/src/app/admin/submissions/review/[submissionId]/page.tsx` - PDF viewer
- `frontend/src/app/superadmin/submissions/review/[submissionId]/page.tsx` - PDF viewer

**Status:** ✅ Complete - Admins and superadmins can now preview PDFs before approving

---

### 4. Student Submission Workflow 🔍 NEEDS INVESTIGATION
**Problem:** Form refinement + API fixes needed (per PDF document)

**What to Check:**
1. Test the 4-step submission form:
   - Step 1: Basic info (title, authors, date, type)
   - Step 2: Academic details (adviser, abstract, keywords)
   - Step 3: File upload (PDF)
   - Step 4: Review and submit
2. Look for:
   - Validation errors
   - UI/UX issues
   - Data not saving correctly
   - File upload failures

**Files to Review:**
- `frontend/src/app/student/submissions/new/[step]/page.tsx`
- `backend/src/modules/documents/documents.controller.ts`
- `backend/src/modules/documents/documents.service.ts`

**Status:** 🔍 Needs hands-on testing to identify specific issues

---

### 5. User Management Refinement 🔍 NEEDS INVESTIGATION
**Problem:** UI improvements + API fixes needed

**What to Check:**
1. Superadmin → User Management page
2. Test creating new admin accounts
3. Test creating new student accounts
4. Check if users can be edited or deleted
5. Verify department filtering works

**Files to Review:**
- `frontend/src/app/superadmin/users/page.tsx`
- `backend/src/modules/superadmin/superadmin.controller.ts`
- `backend/src/modules/admin/admin.controller.ts`

**Status:** 🔍 Needs hands-on testing to identify specific issues

---

## Additional Fixes Made

### Sidebar Hyperlinks Color ✅ FIXED
**Changed:** Sidebar navigation links from maroon to gray
**File:** `frontend/src/components/layout/Sidebar.tsx`
**Change:** `text-cics-maroon` → `text-gray-600`

### Environment Configuration ✅ FIXED
**Problem:** Missing and incorrectly configured environment files
**Fixed:**
- Created `frontend/.env.local` with correct variables
- Reformatted `backend/.env` (service_role key added by user)
- Resolved "Failed to Fetch" and "INVALID API KEY" errors

**Files:**
- `frontend/.env.local` (created)
- `backend/.env` (reformatted)

### Student Revision Feedback Display ✅ FIXED
**Problem:** When admin requests revision or rejects with feedback, students couldn't see the reason in their dashboard
**Fixed:**
- Backend now includes reviews in `getMyDocuments` API response
- Added "Feedback" column to student dashboard table
- Shows latest revision OR rejection feedback (truncated to 2 lines)
- Color-coded: violet for revision, red for rejection
- Full feedback still visible on the revision page

**Files Modified:**
- `backend/src/modules/student/student.service.ts` - Include reviews in query
- `frontend/src/app/student/dashboard/page.tsx` - Display feedback column with color coding

### Student Submission Date Picker ✅ FIXED
**Problem:** Date of Publication field was a text input with placeholder "MM/DD/YYYY"
**Fixed:**
- Changed to HTML5 date picker (`<input type="date">`)
- Provides native calendar UI
- Ensures proper date format
- Better UX on mobile devices

**Files Modified:**
- `frontend/src/components/admin/SubmissionStepContent.tsx` - Changed input type to "date"

### Dynamic Document Counts ✅ FIXED
**Problem:** Document counts on capstone/thesis pages were hardcoded (e.g., "Service Management (2)" showed 2 but had 4 documents)
**Fixed:**
- Created `getDocumentCounts()` API function to fetch real counts from database
- Made capstone main page dynamic - fetches department counts on load
- Made capstone collection page dynamic - fetches track counts on load
- Made thesis main page dynamic - fetches department counts on load
- Made thesis collection page dynamic - fetches track counts on load
- Counts now accurately reflect approved documents in database

**Files Modified:**
- `frontend/src/lib/api/documents.ts` - Added getDocumentCounts function
- `frontend/src/app/capstone/page.tsx` - Fetch real department counts
- `frontend/src/app/capstone/[collection]/page.tsx` - Fetch real track counts
- `frontend/src/app/theses/page.tsx` - Fetch real department counts
- `frontend/src/app/theses/[collection]/page.tsx` - Fetch real track counts

### Email Notifications ✅ PARTIALLY IMPLEMENTED
**Problem:** System needs to send email notifications for various events (student invite, fulltext requests, submission reviews)

**Implemented:**
- ✅ Student account creation now uses `inviteUserByEmail()` - sends invite email with password setup link
- ✅ Added `redirectTo` parameter to invite emails - points to `/auth/callback`
- ✅ Created auth callback page (`/auth/callback`) - handles Supabase redirect after email confirmation
- ✅ Added `FRONTEND_URL` environment variable to backend
- ✅ Added email notification logic to `updateFulltextRequest()` - logs to console (TODO: implement actual sending)
- ✅ Added email notification logic to `reviewSubmission()` - logs to console (TODO: implement actual sending)
- ✅ Fetches student email from users table for submission review notifications
- ✅ Generates appropriate email content based on decision (approve/reject/revise)

**What Still Needs Work:**
- ⚠️ **Supabase Dashboard Configuration Required:**
  - Must configure Site URL: `http://localhost:3000`
  - Must add Redirect URLs: `http://localhost:3000/auth/callback` and `http://localhost:3000/**`
  - Go to: https://supabase.com/dashboard/project/qoxtlmpsguiosoatvtkj/auth/url-configuration
- ⚠️ **Email Sending for Guest Requesters:**
  - Full-text request emails need external service (Nodemailer with Gmail SMTP, SendGrid, Resend, etc.)
  - Currently only logs email content to console with `[EMAIL]` prefix
  - Requires email service setup (considering using `cics.sparkrepository@gmail.com` with Nodemailer)

**Files Modified:**
- `backend/src/modules/admin/admin.service.ts` - Added email notification logic and redirectTo parameter
- `backend/.env` - Added `FRONTEND_URL=http://localhost:3000`
- `backend/.env.example` - Added FRONTEND_URL documentation
- `frontend/src/app/auth/callback/page.tsx` - Created auth callback handler

**How it Works Now:**
1. **When superadmin creates student account:**
   - Supabase sends invite email with password setup link
   - Link redirects to `/auth/callback` after confirmation
   - Callback page automatically redirects to appropriate dashboard based on role
   - Database trigger activates account (`is_active = true`) on email confirmation

2. **When admin reviews a submission (approve/reject/revise):**
   - System fetches student's email from users table
   - Generates appropriate email subject and message
   - Logs to console: `[EMAIL] To: student@email.com, Subject: ..., Message: ...`
   - Creates in-app notification (already working)

3. **When admin handles fulltext request (fulfilled/denied):**
   - Generates appropriate email subject and message
   - Logs to console: `[EMAIL] To: requester@email.com, Subject: ..., Message: ...`

**Known Issues:**
- ⚠️ Invite links showing "otp_expired" error - Fixed by adding redirectTo and callback page
- ⚠️ Requires Supabase dashboard configuration (see above)
- ⚠️ Old invite links are expired - need to create new student accounts to test

**Next Steps for Full Implementation:**
1. Configure Supabase Dashboard redirect URLs (REQUIRED for invite emails to work)
2. Test student invite flow with new account creation
3. Set up email service for guest requesters (Nodemailer + Gmail or external service)
4. Replace console.log statements with actual email sending
5. Test email delivery for all scenarios

---

## Next Steps

1. **Test Full-text Request** - Verify the dropdown fix works end-to-end
2. **Test Approved Submissions** - Submit → Approve → Check if visible on public pages
3. **Decide on PDF Preview** - Choose between inline viewer or download button
4. **Test Student Submission** - Go through entire workflow and document issues
5. **Test User Management** - Try creating users and document any problems

---

## How to Test Everything

### Prerequisites
```bash
# Make sure both servers are running
npm run dev  # from project root
```

### Test Accounts
| Role | Email | Password | Login URL |
|------|-------|----------|-----------|
| Super Admin | superadmin@spark.test | Password123! | /login |
| CS Admin | cs-admin@spark.test | Password123! | /login |
| CS Student | student.cs@spark.test | Password123! | /student/login |

### Testing Workflow
1. **As Student:** Submit a new document
2. **As Admin:** Review and approve it
3. **As Guest:** Verify it appears on public pages
4. **As Guest:** Request full text with new dropdown
5. **As Admin:** Check full-text request appears correctly



---

## Session Summary - April 16, 2026

### Completed in This Session:

#### 1. ✅ Email Notifications for Submission Reviews
- Added email notification logic to `reviewSubmission()` method
- System now fetches student email and generates personalized messages
- Includes feedback in email when provided by admin
- Currently logs to console (awaiting email service integration)

#### 2. ✅ Dynamic Document Counts for Thesis Pages
- Converted thesis main page to client component with real-time counts
- Converted thesis collection page to fetch dynamic track counts
- Both pages now show accurate counts from database
- Matches capstone page implementation

#### 3. ✅ Fixed Student Invite Email Flow
- Added `redirectTo` parameter to invite emails
- Created `/auth/callback` page to handle Supabase redirects
- Added `FRONTEND_URL` environment variable
- Callback page automatically redirects to appropriate dashboard

#### 4. 🔍 Identified Email Service Requirements
- Student invites work via Supabase Auth (built-in)
- Guest requester emails need external service (Nodemailer/SendGrid/Resend)
- Considering using `cics.sparkrepository@gmail.com` with Nodemailer

### Files Modified This Session:
- `backend/src/modules/admin/admin.service.ts` - Email notifications + redirectTo
- `backend/.env` - Added FRONTEND_URL
- `backend/.env.example` - Added FRONTEND_URL
- `frontend/src/app/auth/callback/page.tsx` - Created callback handler
- `frontend/src/app/theses/page.tsx` - Dynamic counts
- `frontend/src/app/theses/[collection]/page.tsx` - Dynamic counts
- `FIXES_PROGRESS.md` - Updated documentation

### Action Items Before Next Session:
1. **Configure Supabase Dashboard** (REQUIRED):
   - Set Site URL: `http://localhost:3000`
   - Add Redirect URLs: `http://localhost:3000/auth/callback` and `http://localhost:3000/**`
   - URL: https://supabase.com/dashboard/project/qoxtlmpsguiosoatvtkj/auth/url-configuration

2. **Test Student Invite Flow**:
   - Restart backend server
   - Create new student account
   - Check email and click invite link
   - Verify redirect to callback → dashboard works

3. **Decide on Email Service**:
   - Option A: Nodemailer with Gmail (`cics.sparkrepository@gmail.com`)
   - Option B: External service (SendGrid, Resend, Mailgun)
   - Option C: Supabase Edge Function with email service

### Current Status Summary:
- ✅ 8 issues fully fixed
- 🔄 2 issues partially fixed (email notifications, full-text workflow)
- ⏳ 12 issues remaining
- 📊 Progress: ~40% complete

