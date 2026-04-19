# API Reference

**Base URL:** `http://localhost:5000/api`

Protected routes require an `Authorization: Bearer <access_token>` header. The token is returned from `POST /auth/login`.

---

## Quick Reference

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/auth/login` | Public | Log in and get a token |
| POST | `/auth/logout` | Any user | Invalidate current session |
| GET | `/auth/me` | Any user | Get own profile |
| POST | `/auth/change-password` | Any user | Change own password |
| POST | `/auth/password-reset-request` | Student, Admin | Submit a password reset request |
| GET | `/documents` | Public | Browse approved documents |
| GET | `/documents/search` | Public | Full-text search |
| GET | `/documents/check-duplicate` | Public | Check for similar titles |
| GET | `/documents/:id/download-abstract` | Public | Download abstract as a text file |
| POST | `/documents/upload` | Student | Submit a new document |
| PUT | `/documents/:id` | Student | Revise a document sent back for revision |
| POST | `/fulltext-requests` | Public | Request full-text PDF access |
| GET | `/notifications` | Any user | List own notifications |
| PATCH | `/notifications/read-all` | Any user | Mark all notifications as read |
| PATCH | `/notifications/:id/read` | Any user | Mark one notification as read |
| GET | `/admin/submissions` | Admin, Super Admin | List submissions (department-scoped) |
| POST | `/admin/submissions/:id/review` | Admin, Super Admin | Approve, revise, or reject a submission |
| GET | `/admin/fulltext-requests` | Admin, Super Admin | List full-text access requests |
| PUT | `/admin/fulltext-requests/:id` | Admin, Super Admin | Fulfil or deny a full-text request |
| PATCH | `/superadmin/users/:id/disable` | Super Admin | Disable a user account |
| PUT | `/superadmin/users/:id` | Super Admin | Edit a user's name and department |
| POST | `/superadmin/admins` | Super Admin | Create an admin account |
| POST | `/superadmin/students` | Super Admin | Create a student account |
| GET | `/superadmin/password-reset-requests` | Super Admin | List password reset requests |
| POST | `/superadmin/password-reset-requests/:id/approve` | Super Admin | Approve a reset request and email a recovery link |
| POST | `/superadmin/password-reset-requests/:id/decline` | Super Admin | Decline a reset request |
| GET | `/repository/documents` | Public | Legacy title search |

---

## Auth

### POST /auth/login
**Public.** Authenticates a user and returns a JWT.

**Request**
```json
{
  "email": "user@example.com",
  "password": "secret123"
}
```

**Response `201`**
```json
{
  "access_token": "<supabase_jwt>",
  "role": "student",
  "department": "CS",
  "first_name": "Juan",
  "last_name": "dela Cruz"
}
```

**Errors**
| Code | Reason |
|------|--------|
| 401 | Invalid credentials, inactive account, or user record not found |

---

### POST /auth/logout
**Auth: any user.** Invalidates the current Supabase session server-side.

**Response `201`**
```json
{ "message": "Logout successful" }
```

**Errors**
| Code | Reason |
|------|--------|
| 401 | Missing or invalid token |

---

### GET /auth/me
**Auth: any user.** Returns the authenticated user's profile.

**Response `200`**
```json
{
  "id": "uuid",
  "email": "user@example.com",
  "role": "student",
  "department": "CS",
  "first_name": "Juan",
  "last_name": "dela Cruz",
  "is_active": true
}
```

**Errors**
| Code | Reason |
|------|--------|
| 401 | Missing or invalid token |

---

### POST /auth/change-password
**Auth: any user.** Verifies the current password then updates to a new one.

**Request**
```json
{
  "currentPassword": "OldPass123!",
  "newPassword": "NewPass456!"
}
```

**Response `200`**
```json
{ "message": "Password changed successfully." }
```

**Errors**
| Code | Reason |
|------|--------|
| 400 | New password is less than 8 characters |
| 401 | Current password is incorrect |

---

### POST /auth/password-reset-request
**Auth: `student`, `admin`.** Submits a password reset request for super admin review. Only one pending request is allowed per user at a time.

**No request body required.** The requester's identity is read from the session token.

**Response `201`**
```json
{
  "message": "Password reset request submitted. A super admin will review it shortly.",
  "request": {
    "id": "uuid",
    "user_id": "uuid",
    "email": "user@example.com",
    "first_name": "Juan",
    "last_name": "dela Cruz",
    "role": "student",
    "status": "pending",
    "requested_at": "2024-01-15T10:00:00Z",
    "resolved_at": null
  }
}
```

**Errors**
| Code | Reason |
|------|--------|
| 401 | Missing or invalid token |
| 403 | Role is not `student` or `admin` |
| 409 | A pending request already exists for this user |
| 500 | Failed to save request |

---

## Documents

### GET /documents
**Public.** Returns a paginated list of approved documents with optional filters.

**Query parameters**
| Param | Type | Description |
|-------|------|-------------|
| `department` | string | `IS` \| `IT` \| `CS` |
| `type` | string | `thesis` \| `capstone` |
| `year` | number | Exact year |
| `track` | string | Partial match on `track_specialization` |
| `keyword` | string | Matches within the keywords array |
| `page` | number | Default `1` |
| `limit` | number | Default `10` |

**Response `200`**
```json
{
  "data": [ { "...": "document rows" } ],
  "page": 1,
  "limit": 10,
  "total": 42
}
```

---

### GET /documents/search
**Public.** Full-text search across `title`, `abstract`, `authors`, and `keywords` of approved documents.

**Query parameters**
| Param | Type | Description |
|-------|------|-------------|
| `q` | string | Required. Search query. |

**Response `200`** — array of matching document rows

**Errors**
| Code | Reason |
|------|--------|
| 400 | `q` is missing or blank |

---

### GET /documents/check-duplicate
**Public.** Checks a proposed title against all non-rejected documents using the Dice coefficient. Returns matches with similarity ≥ 80%. Call this before submitting a new document.

**Query parameters**
| Param | Type | Description |
|-------|------|-------------|
| `title` | string | Required. The proposed title. |

**Response `200`**
```json
{
  "isDuplicate": true,
  "matches": [
    { "id": "uuid", "title": "Similar Existing Title", "similarity": 0.92 }
  ]
}
```

**Errors**
| Code | Reason |
|------|--------|
| 400 | `title` is missing or blank |

---

### GET /documents/:id/download-abstract
**Public.** Downloads the abstract of an approved document as a plain-text file.

**Response `200`** — `Content-Type: text/plain`, `Content-Disposition: attachment; filename="<title>-abstract.txt"`
```
Title:      My Research Paper
Authors:    Juan dela Cruz, Maria Santos
Year:       2024
Department: CS
Type:       thesis
Adviser:    Dr. Reyes

Abstract:
Lorem ipsum...
```

**Errors**
| Code | Reason |
|------|--------|
| 404 | Document not found or not approved |

---

### POST /documents/upload
**Auth: `student`.** Uploads a PDF and creates a document record with `status = "pending"`. The file is stored at `{userId}/{timestamp}_{filename}` in the private `documents` storage bucket.

**Request** — `multipart/form-data`
| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `file` | PDF file | Yes | Max 10 MB |
| `title` | string | Yes | |
| `authors` | JSON string | Yes | e.g. `'["Name A","Name B"]'` |
| `department` | string | Yes | `IS` \| `IT` \| `CS` |
| `type` | string | Yes | `thesis` \| `capstone` |
| `abstract` | string | No | |
| `year` | number | No | 1900 – current year + 1 |
| `track_specialization` | string | No | |
| `adviser` | string | No | |
| `keywords` | JSON string | No | e.g. `'["keyword1","keyword2"]'` |

**Response `201`** — full `documents` row with `status: "pending"`

**Errors**
| Code | Reason |
|------|--------|
| 400 | Validation error or non-PDF file |
| 401 | Missing or invalid token |
| 403 | Role is not `student` |
| 500 | Failed to upload file or save record |

---

### PUT /documents/:id
**Auth: `student`.** Re-uploads a revised PDF and/or updates metadata. Only allowed when the document's `status` is `revision`. Resets `status` to `pending`. Only the document's owner may call this.

**Request** — `multipart/form-data`, all fields optional
| Field | Type | Notes |
|-------|------|-------|
| `file` | PDF file | Max 10 MB. Replaces the existing PDF. |
| `title` | string | |
| `authors` | JSON string | |
| `abstract` | string | |
| `year` | number | |
| `track_specialization` | string | |
| `adviser` | string | |
| `keywords` | JSON string | |

**Response `200`** — updated `documents` row with `status: "pending"`

**Errors**
| Code | Reason |
|------|--------|
| 401 | Missing or invalid token |
| 403 | Document status is not `revision`, or user is not the owner |
| 404 | Document not found |
| 500 | Failed to upload file or update record |

---

## Full-Text Requests

### POST /fulltext-requests
**Public.** Submits a request for full-text access to an approved document. Prevents duplicate pending requests from the same email for the same document.

**Request**
```json
{
  "document_id": "uuid",
  "requester_name": "John Doe",
  "requester_email": "john@example.com",
  "purpose": "Academic research for thesis",
  "department": "CS"
}
```

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `document_id` | UUID string | Yes | |
| `requester_name` | string | Yes | |
| `requester_email` | string | Yes | Valid email format |
| `purpose` | string | Yes | |
| `department` | string | Yes | `IS` \| `IT` \| `CS` \| `Other` |

**Response `201`**
```json
{
  "message": "Full-text request submitted successfully. You will be contacted via email once processed.",
  "request": { "...": "fulltext_requests row" }
}
```

**Errors**
| Code | Reason |
|------|--------|
| 404 | Document not found or not approved |
| 409 | A pending request already exists for this email + document |
| 500 | Failed to save request |

---

## Notifications

### GET /notifications
**Auth: any user.** Returns all notifications for the authenticated user, sorted newest first.

**Response `200`**
```json
[
  {
    "id": "uuid",
    "type": "document_approved",
    "message": "Your document \"My Thesis\" was approved.",
    "is_read": false,
    "reference_id": "uuid",
    "created_at": "2024-01-15T10:00:00Z"
  }
]
```

**Errors**
| Code | Reason |
|------|--------|
| 401 | Missing or invalid token |

---

### PATCH /notifications/read-all
**Auth: any user.** Marks all unread notifications for the authenticated user as read.

**Response `200`**
```json
{ "message": "All notifications marked as read." }
```

**Errors**
| Code | Reason |
|------|--------|
| 401 | Missing or invalid token |
| 500 | Failed to update notifications |

---

### PATCH /notifications/:id/read
**Auth: any user.** Marks a single notification as read.

**Response `200`** — updated notification row

**Errors**
| Code | Reason |
|------|--------|
| 401 | Missing or invalid token |
| 404 | Notification not found or not owned by this user |
| 500 | Failed to update notification |

---

## Admin

### GET /admin/submissions
**Auth: `admin`, `super_admin`.** Lists document submissions sorted newest first. Admins see only their own department; super admins see all.

**Query parameters**
| Param | Type | Description |
|-------|------|-------------|
| `status` | string | `pending` \| `under_review` \| `revision` \| `approved` \| `rejected` |

**Response `200`** — array of document rows

**Errors**
| Code | Reason |
|------|--------|
| 401 | Missing or invalid token |
| 403 | Insufficient role |

---

### POST /admin/submissions/:id/review
**Auth: `admin`, `super_admin`.** Records a review decision on a submission.

- `approve` — publishes the document to the public repository
- `revise` — stores feedback and notifies the student to resubmit
- `reject` — closes the submission and notifies the student

**Request**
```json
{
  "decision": "revise",
  "feedback": "Please expand the methodology section."
}
```

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `decision` | string | Yes | `approve` \| `reject` \| `revise` |
| `feedback` | string | No | Shown to the student on `revise` or `reject` |

**Response `201`**
```json
{
  "message": "Document revised successfully.",
  "document": { "...": "updated document row" }
}
```

**Errors**
| Code | Reason |
|------|--------|
| 401 | Missing or invalid token |
| 403 | Document belongs to a different department |
| 404 | Document not found |
| 500 | Failed to save review or update document |

---

### GET /admin/fulltext-requests
**Auth: `admin`, `super_admin`.** Lists full-text access requests sorted newest first.

**Query parameters**
| Param | Type | Description |
|-------|------|-------------|
| `status` | string | `pending` \| `fulfilled` \| `denied` |

**Response `200`** — array of `fulltext_requests` rows

**Errors**
| Code | Reason |
|------|--------|
| 401 | Missing or invalid token |
| 403 | Insufficient role |

---

### PUT /admin/fulltext-requests/:id
**Auth: `admin`, `super_admin`.** Marks a full-text request as fulfilled or denied. Sets `handled_by` to the current user and stamps `fulfilled_at` when fulfilled.

**Request**
```json
{ "status": "fulfilled" }
```

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `status` | string | Yes | `fulfilled` \| `denied` |

**Response `200`**
```json
{
  "message": "Full-text request marked as fulfilled.",
  "request": { "...": "updated fulltext_requests row" }
}
```

**Errors**
| Code | Reason |
|------|--------|
| 401 | Missing or invalid token |
| 403 | Request has already been processed |
| 404 | Full-text request not found |
| 500 | Failed to update request |

---

## Super Admin

### PATCH /superadmin/users/:id/disable
**Auth: `super_admin`.** Disables a user account by setting `is_active = false`. Only works on `admin` and `student` accounts.

**Response `200`**
```json
{
  "message": "User account disabled successfully.",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "first_name": "Juan",
    "last_name": "dela Cruz",
    "role": "student",
    "department": "CS",
    "is_active": false,
    "created_at": "2024-01-15T10:00:00Z"
  }
}
```

**Errors**
| Code | Reason |
|------|--------|
| 401 | Missing or invalid token |
| 403 | Target account role is not `admin` or `student` |
| 404 | User not found |
| 500 | Failed to disable account |

---

### PUT /superadmin/users/:id
**Auth: `super_admin`.** Updates a user's first name, last name, and department.

**Request**
```json
{
  "first_name": "Juan",
  "last_name": "dela Cruz",
  "department": "CS"
}
```

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `first_name` | string | Yes | |
| `last_name` | string | Yes | |
| `department` | string | Yes | `IS` \| `IT` \| `CS` |

**Response `200`**
```json
{
  "message": "User updated successfully.",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "first_name": "Juan",
    "last_name": "dela Cruz",
    "role": "student",
    "department": "CS",
    "is_active": true,
    "created_at": "2024-01-15T10:00:00Z"
  }
}
```

**Errors**
| Code | Reason |
|------|--------|
| 401 | Missing or invalid token |
| 403 | Role is not `super_admin` |
| 404 | User not found |
| 500 | Failed to update user record |

---

### POST /superadmin/admins
**Auth: `super_admin`.** Creates an admin account and sends a welcome email with a temporary password.

**Request**
```json
{
  "email": "newadmin@example.com",
  "first_name": "Maria",
  "last_name": "Santos",
  "department": "IT"
}
```

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `email` | string | Yes | Valid email format |
| `first_name` | string | Yes | |
| `last_name` | string | Yes | |
| `department` | string | Yes | `IS` \| `IT` \| `CS` |

**Response `201`**
```json
{
  "message": "Admin account created successfully.",
  "admin": {
    "id": "uuid",
    "email": "newadmin@example.com",
    "first_name": "Maria",
    "last_name": "Santos",
    "role": "admin",
    "department": "IT",
    "is_active": true,
    "created_at": "2024-01-15T10:00:00Z"
  }
}
```

**Errors**
| Code | Reason |
|------|--------|
| 401 | Missing or invalid token |
| 403 | Role is not `super_admin` |
| 409 | An account with this email already exists |
| 500 | Failed to create account |

---

### POST /superadmin/students
**Auth: `super_admin`.** Creates a student account and sends a Supabase invite email. The account is inactive until the student accepts the invite.

**Request**
```json
{
  "email": "newstudent@example.com",
  "first_name": "Juan",
  "last_name": "dela Cruz",
  "department": "CS"
}
```

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `email` | string | Yes | Valid email format |
| `first_name` | string | Yes | |
| `last_name` | string | Yes | |
| `department` | string | Yes | `IS` \| `IT` \| `CS` |

**Response `201`**
```json
{
  "message": "Student account created successfully. An invite email has been sent.",
  "student": {
    "id": "uuid",
    "email": "newstudent@example.com",
    "first_name": "Juan",
    "last_name": "dela Cruz",
    "role": "student",
    "department": "CS",
    "is_active": false,
    "created_at": "2024-01-15T10:00:00Z"
  }
}
```

**Errors**
| Code | Reason |
|------|--------|
| 401 | Missing or invalid token |
| 403 | Role is not `super_admin` |
| 409 | A student with this email already exists |
| 500 | Failed to create account |

---

### GET /superadmin/password-reset-requests
**Auth: `super_admin`.** Lists password reset requests submitted by students and admins. Sorted newest first.

**Query parameters**
| Param | Type | Description |
|-------|------|-------------|
| `status` | string | Optional. `pending` \| `approved` \| `declined` |

**Response `200`**
```json
{
  "requests": [
    {
      "id": "uuid",
      "user_id": "uuid",
      "email": "user@example.com",
      "first_name": "Juan",
      "last_name": "dela Cruz",
      "role": "student",
      "status": "pending",
      "requested_at": "2024-01-15T10:00:00Z",
      "resolved_at": null
    }
  ]
}
```

**Errors**
| Code | Reason |
|------|--------|
| 401 | Missing or invalid token |
| 403 | Role is not `super_admin` |
| 500 | Failed to fetch requests |

---

### POST /superadmin/password-reset-requests/:id/approve
**Auth: `super_admin`.** Approves a pending password reset request. Generates a Supabase recovery link and emails it to the user. Sets `status = "approved"` and stamps `resolved_at`.

**Response `200`**
```json
{ "message": "Password reset request approved. Recovery email sent." }
```

**Errors**
| Code | Reason |
|------|--------|
| 401 | Missing or invalid token |
| 403 | Role is not `super_admin` |
| 404 | Request not found |
| 409 | Request has already been resolved |
| 500 | Failed to generate recovery link or update request |

---

### POST /superadmin/password-reset-requests/:id/decline
**Auth: `super_admin`.** Declines a pending password reset request and notifies the user by email. Sets `status = "declined"` and stamps `resolved_at`.

**Response `200`**
```json
{ "message": "Password reset request declined." }
```

**Errors**
| Code | Reason |
|------|--------|
| 401 | Missing or invalid token |
| 403 | Role is not `super_admin` |
| 404 | Request not found |
| 409 | Request has already been resolved |
| 500 | Failed to update request |

---

## Repository *(Legacy)*

### GET /repository/documents
**Public.** Returns approved documents whose title contains the search query (case-insensitive partial match). Prefer `GET /documents/search` for new work.

**Query parameters**
| Param | Type | Description |
|-------|------|-------------|
| `name` | string | Required. Partial title to match. |

**Response `200`** — array of matching document rows

**Errors**
| Code | Reason |
|------|--------|
| 400 | `name` query param is missing or blank |
