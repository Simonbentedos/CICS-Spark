import type {
  AdminStatCard,
  PermissionStatement,
  ReviewActionConfig,
  ReviewHistoryItem,
  SelectOption,
  SubmissionRecord,
  SubmissionStatus,
  SubmissionStepKey,
  SubmissionStepMeta,
  UserRecord,
} from '@/types/admin'

export const ADMIN_PROFILE = {
  name: 'Elidh Ishvy Iñigo',
  email: 'elidhishvyiiñigo@ust.edu.ph',
}

export const ADMIN_SUPPORT_EMAIL = 'itsupport@ust.edu.ph'

export const ADMIN_NAV_ITEMS = [
  { href: '/admin/dashboard', label: 'Dashboard', icon: 'dashboard' },
  { href: '/admin/submissions', label: 'Submissions', icon: 'submissions' },
  { href: '/admin/fulltext-requests', label: 'Full-Text Requests', icon: 'fulltext' },
  { href: '/admin/users', label: 'Users', icon: 'users' },
  { href: '/admin/reports', label: 'Reports', icon: 'reports' },
  { href: '/admin/settings', label: 'Settings', icon: 'settings' },
] as const

export const ADMIN_PAGE_TITLES: Record<string, string> = {
  '/admin/dashboard': 'Admin Dashboard',
  '/admin/submissions': 'Admin Submissions',
  '/admin/users': 'Admin Dashboard',
}

export const SUBMISSION_DOCUMENT_TYPES = [
  'Thesis',
  'Capstone',
] as const

export const ADMIN_SUBMISSIONS: SubmissionRecord[] = [
  {
    id: 'sub-001',
    title: 'The Impact of Assistive Technology on Reading Comprehension Among Students with Learning Disabilities in Inclusive Classroom Settings',
    author: 'Maria Elena Rodriguez',
    authorEmail: 'mariaelena.rodriguez@ust.edu.ph',
    department: 'Education',
    program: 'Master of Arts in Special Needs Education',
    thesisAdvisor: 'Dr. Jonathan K. Williams',
    date: 'Nov 20',
    status: 'Pending Review',
    keywords: ['Assistive Technology', 'Learning Disabilities', 'Reading Comprehension', 'Inclusive Education'],
    abstract:
      'This study examines the effectiveness of assistive technology tools in improving reading comprehension outcomes for students with learning disabilities within inclusive classroom environments. Using a mixed-methods approach, the research involved 45 students across three elementary schools over a 12-week period.',
    previewImage: '/images/placeholder-document.png',
    pageCount: 102,
  },
  { id: 'sub-002', title: 'Digital Transformation in Education', author: 'Carlos Rivera', authorEmail: 'carlos.rivera@ust.edu.ph', department: 'Education', date: 'Nov 16', status: 'Pending Review' },
  { id: 'sub-003', title: 'Renewable Energy Systems Design', author: 'Diana Lee', authorEmail: 'diana.lee@ust.edu.ph', department: 'Engineering', date: 'Nov 12', status: 'Approved' },
  { id: 'sub-004', title: 'Traditional Medicine Practices in Rural Communities', author: 'Isabel Fernandez', authorEmail: 'isabel.fernandez@ust.edu.ph', department: 'Anthropology', date: 'Nov 11', status: 'Rejected' },
  { id: 'sub-005', title: 'Sustainable Urban Development Strategies', author: 'Alice Johnson', authorEmail: 'alice.johnson@ust.edu.ph', department: 'Architecture', date: 'Nov 10', status: 'Pending Review' },
  { id: 'sub-006', title: 'Climate Change Effects on Philippine Biodiversity', author: 'Bob Martin', authorEmail: 'bob.martin@ust.edu.ph', department: 'Biology', date: 'Nov 9', status: 'Revision Requested' },
  { id: 'sub-007', title: 'Impact of AI on Student Learning Outcomes', author: 'Jane Smith', authorEmail: 'jane.smith@ust.edu.ph', department: 'Psychology', date: 'Nov 8', status: 'Pending Review' },
  { id: 'sub-008', title: 'Machine Learning Applications in Healthcare Diagnosis', author: 'John Doe', authorEmail: 'john.doe@ust.edu.ph', department: 'Computer Science', date: 'Nov 5', status: 'Approved' },
  { id: 'sub-009', title: 'Social Media Influence on Political Discourse', author: 'Emily Chen', authorEmail: 'emily.chen@ust.edu.ph', department: 'Communication', date: 'Oct 28', status: 'Rejected' },
  { id: 'sub-010', title: 'Quantum Computing Applications in Cryptography', author: 'David Wong', authorEmail: 'david.wong@ust.edu.ph', department: 'Computer Science', date: 'Oct 18', status: 'Pending Review' },
  { id: 'sub-011', title: 'Blockchain Technology in Supply Chain Management', author: 'Michael Tan', authorEmail: 'michael.tan@ust.edu.ph', department: 'Business Administration', date: 'Oct 14', status: 'Pending Review' },
  { id: 'sub-012', title: 'Neuroplasticity and Language Acquisition', author: 'Sofia Martinez', authorEmail: 'sofia.martinez@ust.edu.ph', department: 'Linguistics', date: 'Oct 6', status: 'Revision Requested' },
]

export const ADMIN_USERS: UserRecord[] = [
  { id: 'usr-001', name: 'Maria Santos', email: 'maria.santos@ust.edu.ph', role: 'Super Admin', department: 'Repository Office', status: 'Active', lastLogin: 'Today, 8:20 AM', dateAdded: 'Jan 15, 2024' },
  { id: 'usr-002', name: 'Juan Dela Cruz', email: 'juan.delacruz@ust.edu.ph', role: 'Admin', department: 'Repository Office', status: 'Active', lastLogin: 'Today, 7:45 AM', dateAdded: 'Feb 20, 2024' },
  { id: 'usr-003', name: 'Ana Reyes', email: 'ana.reyes@ust.edu.ph', role: 'Student', department: 'Education', status: 'Active', lastLogin: 'Yesterday', dateAdded: 'Mar 10, 2024' },
  { id: 'usr-004', name: 'Pedro Garcia', email: 'pedro.garcia@ust.edu.ph', role: 'Student', department: 'Engineering', status: 'Inactive', lastLogin: '1 week ago', dateAdded: 'Apr 5, 2024' },
]

export const USER_ROLE_OPTIONS: SelectOption[] = [
  { label: 'Super Admin', value: 'Super Admin' },
  { label: 'Admin', value: 'Admin' },
  { label: 'Student', value: 'Student' },
]

export const USER_STATUS_OPTIONS: SelectOption[] = [
  { label: 'Active', value: 'Active' },
  { label: 'Inactive', value: 'Inactive' },
  { label: 'Pending', value: 'Pending' },
]

export const REVIEW_ACTION_CONFIGS: ReviewActionConfig[] = [
  { type: 'approve', title: 'Approve Thesis', confirmLabel: 'Approve & Publish', tone: 'green' },
  { type: 'revise', title: 'Request Revision', confirmLabel: 'Send Request', tone: 'violet' },
  { type: 'reject', title: 'Reject Thesis', confirmLabel: 'Confirm Rejection', tone: 'red' },
]

export const REVIEW_APPROVE_CHECKLIST = [
  'Publish thesis to the repository',
  'Make it publicly searchable',
  'Send approval notification to student',
]

export const REVIEW_COMMON_ISSUES = ['Formatting errors', 'Missing metadata', 'Abstract needs revision']

export const REVIEW_SAMPLE_REVISION_COMMENT =
  'Your abstract is too vague. What specific AT tools? What grades? "Mixed-methods" and "statistically significant" tell me nothing substantial. You\'re not identifying a clear gap in the literature or articulating why this matters beyond confirming obvious assumptions about assistive technology. Be specific about your contribution.'

export const REVIEW_HISTORY_BY_SUBMISSION: Record<string, ReviewHistoryItem[]> = {
  'sub-001': [
    { id: 'hist-001', type: 'submitted', by: 'Maria Elena Rodriguez', at: '2025-11-20 2:10 PM' },
  ],
}

export const DASHBOARD_KPI_CARDS = [
  { label: 'Pending Review', value: countSubmissionsByStatus(ADMIN_SUBMISSIONS, 'Pending Review'), tone: 'orange' },
  { label: 'Approved', value: countSubmissionsByStatus(ADMIN_SUBMISSIONS, 'Approved'), tone: 'green' },
  { label: 'Rejected', value: countSubmissionsByStatus(ADMIN_SUBMISSIONS, 'Rejected'), tone: 'red' },
  { label: 'Total Theses', value: ADMIN_SUBMISSIONS.length, tone: 'blue' },
] satisfies AdminStatCard[]

export const SUBMISSION_SUMMARY_CARDS = [
  { label: 'Total', value: ADMIN_SUBMISSIONS.length, tone: 'default' },
  { label: 'Pending', value: countSubmissionsByStatus(ADMIN_SUBMISSIONS, 'Pending Review'), tone: 'orange' },
  { label: 'Revisions', value: countSubmissionsByStatus(ADMIN_SUBMISSIONS, 'Revision Requested'), tone: 'violet' },
  { label: 'Approved', value: countSubmissionsByStatus(ADMIN_SUBMISSIONS, 'Approved'), tone: 'green' },
  { label: 'Rejected', value: countSubmissionsByStatus(ADMIN_SUBMISSIONS, 'Rejected'), tone: 'red' },
] satisfies AdminStatCard[]

export const USER_SUMMARY_CARDS = [
  { label: 'Total Users', value: ADMIN_USERS.length, tone: 'default' },
  { label: 'Admins', value: ADMIN_USERS.filter((user) => user.role === 'Admin' || user.role === 'Super Admin').length, tone: 'blue' },
  { label: 'Students', value: ADMIN_USERS.filter((user) => user.role === 'Student').length, tone: 'orange' },
  { label: 'Active', value: ADMIN_USERS.filter((user) => user.status === 'Active').length, tone: 'green' },
] satisfies AdminStatCard[]

export const DASHBOARD_MONTHLY_SUMMARY = {
  newSubmissions: 89,
  growthText: '↑ 12% from last month',
}

export const DASHBOARD_TODAY_SUMMARY = {
  newSubmissions: 5,
  approved: 2,
  rejected: 2,
}

export const ADMIN_PERMISSION_STATEMENT: PermissionStatement = {
  title: 'University Permission Statement',
  intro:
    'I hereby grant the UST non-exclusive worldwide, royalty-free license to reproduce, publish and publicly distribute copies of this thesis in whatever form subject to the provisions of applicable laws, the provision of the UST IRR (link) policy and any contractual obligations, as well as more specific permission making on the Title Page. Specifically, I grant the following rights to the University:',
  bullets: [
    'To upload a copy of the work in the theses database of the college/school/institute/departments and in any other databases available on the public internet',
    'To publish the work in the college/school/institute/departments journal, both in print and electronic or digital format and online; and',
    'To give open access to above-mentioned work, thus allowing “fair use” of the work in accordance with the provisions of the IPC of the Philippines (Republic Act No. 8293), especially for teaching, scholarly and research purposes.',
  ],
}

export const FILE_REQUIREMENTS = [
  'File must be in PDF format',
  'File size should not exceed 50MB',
  'Ensure the PDF is not password protected',
  'Document should be properly formatted and readable',
]

export const CONFIRMATION_MESSAGE = {
  title: 'Confirm Submission',
  lead: 'Congratulations for successfully uploading your work!',
  body:
    'Wait for confirmation from the library that your thesis has been accepted. You will receive an email once your submission has been approved. If corrections or adjustments are required, instructions will be sent to your email account. Once any adjustments or corrections have been completed, you can log back into the ET account and replace the necessary corrections.',
}

export const SUBMISSION_STEPS: SubmissionStepMeta[] = [
  {
    key: 'basic-info',
    index: 1,
    label: 'Step 1 of 4',
    sectionTitle: 'BASIC INFORMATION',
    nextLabel: 'Next: Academic Info →',
    nextHref: '/admin/submissions/new/academic-details',
  },
  {
    key: 'academic-details',
    index: 2,
    label: 'Step 2 of 4',
    sectionTitle: 'ACADEMIC DETAILS',
    nextLabel: 'Next: File Upload →',
    nextHref: '/admin/submissions/new/file-upload',
    backHref: '/admin/submissions/new/basic-info',
  },
  {
    key: 'file-upload',
    index: 3,
    label: 'Step 3 of 4',
    sectionTitle: 'FILE UPLOAD',
    nextLabel: 'Next: Review →',
    nextHref: '/admin/submissions/new/verify-details',
    backHref: '/admin/submissions/new/academic-details',
  },
  {
    key: 'verify-details',
    index: 4,
    label: 'Step 4 of 4',
    sectionTitle: 'VERIFY DETAILS',
    nextLabel: 'Submit Thesis →',
    nextHref: '/admin/submissions/new/confirmation',
    backHref: '/admin/submissions/new/file-upload',
  },
]

export const VERIFY_DETAILS_SNAPSHOT = {
  title: 'Sample Thesis Title',
  author: 'Anthony Torres',
  department: 'College of Education',
  publishedOn: 'November 2025',
  fileName: 'sample-thesis.pdf',
}

export function countSubmissionsByStatus(submissions: SubmissionRecord[], status: SubmissionStatus) {
  return submissions.filter((submission) => submission.status === status).length
}

export function getSubmissionStep(stepKey: string) {
  return SUBMISSION_STEPS.find((step) => step.key === stepKey as SubmissionStepKey)
}

export function getSubmissionDepartments(submissions: SubmissionRecord[] = ADMIN_SUBMISSIONS) {
  return Array.from(new Set(submissions.map((submission) => submission.department))).sort((left, right) => left.localeCompare(right))
}

export function getSubmissionStatuses() {
  return ['Pending Review', 'Approved', 'Rejected', 'Revision Requested'] as const
}

export function getUserDepartments() {
  return Array.from(new Set(ADMIN_USERS.map((user) => user.department))).sort((left, right) => left.localeCompare(right))
}

export function getAdminTopTitle(pathname: string) {
  if (pathname.startsWith('/admin/submissions/new')) {
    return 'Submit New Thesis'
  }

  if (pathname.startsWith('/admin/submissions/review')) {
    return 'Admin Dashboard'
  }

  return ADMIN_PAGE_TITLES[pathname] ?? 'Admin Panel'
}

export function getMetricToneClasses(tone: AdminStatCard['tone'] = 'default') {
  if (tone === 'orange') return { value: 'text-cics-maroon', bg: 'bg-cics-maroon-50', border: 'border-cics-maroon-200' }
  if (tone === 'green') return { value: 'text-green-600', bg: 'bg-green-50', border: 'border-green-200' }
  if (tone === 'red') return { value: 'text-red-500', bg: 'bg-red-50', border: 'border-red-200' }
  if (tone === 'blue') return { value: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-200' }
  if (tone === 'violet') return { value: 'text-violet-600', bg: 'bg-violet-50', border: 'border-violet-200' }
  return { value: 'text-grey-700', bg: 'bg-grey-50', border: 'border-grey-200' }
}

export function getSubmissionStatusTone(status: SubmissionStatus) {
  if (status === 'Approved') return 'green'
  if (status === 'Rejected') return 'red'
  if (status === 'Revision Requested') return 'violet'
  return 'orange'
}

export function getUserStatusTone(status: UserRecord['status']) {
  if (status === 'Active') return 'green'
  if (status === 'Pending') return 'yellow'
  return 'default'
}

export function getUserRoleTone(role: UserRecord['role']) {
  if (role === 'Super Admin') return 'violet'
  if (role === 'Admin') return 'blue'
  return 'orange'
}

export function getSubmissionById(id: string) {
  return ADMIN_SUBMISSIONS.find((submission) => submission.id === id)
}

export function getReviewActionConfig(actionType: string) {
  return REVIEW_ACTION_CONFIGS.find((action) => action.type === actionType)
}

export function getSubmissionReviewHistory(submissionId: string) {
  return REVIEW_HISTORY_BY_SUBMISSION[submissionId] ?? []
}
