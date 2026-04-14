/**
 * SPARK — One-shot setup script
 *
 * Run from the repo root:
 *   node backend/scripts/seed.js
 *
 * What it does:
 *   1. Creates 7 Supabase Auth users (email already confirmed, no invite flow)
 *   2. Inserts them into public.users with is_active = TRUE
 *   3. Creates the 'documents' storage bucket (private)
 *   4. Inserts 20 approved sample documents for public browse testing
 *
 * Safe to re-run — every step uses upsert / ignores "already exists" errors.
 *
 * After running this script, open the Supabase SQL Editor and run:
 *   backend/supabase/rls.sql
 */

'use strict'

const path = require('path')
const fs = require('fs')
const { createClient } = require('@supabase/supabase-js')

// ---------------------------------------------------------------------------
// 1. Load .env from backend/.env
// ---------------------------------------------------------------------------

function loadEnv() {
  const envPath = path.join(__dirname, '..', '.env')
  if (!fs.existsSync(envPath)) {
    throw new Error(`backend/.env not found at ${envPath}. Create it from backend/.env.example first.`)
  }
  const raw = fs.readFileSync(envPath, 'utf8')
  const env = {}
  for (const line of raw.split('\n')) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue
    const eqIdx = trimmed.indexOf('=')
    if (eqIdx === -1) continue
    const key = trimmed.slice(0, eqIdx).trim()
    const value = trimmed.slice(eqIdx + 1).trim().replace(/^["']|["']$/g, '')
    env[key] = value
  }
  return env
}

// ---------------------------------------------------------------------------
// 2. Account definitions
// ---------------------------------------------------------------------------

const ACCOUNTS = [
  {
    email: 'superadmin@spark.test',
    password: 'Password123!',
    first_name: 'Super',
    last_name: 'Admin',
    role: 'super_admin',
    department: 'CS',
  },
  {
    email: 'cs-admin@spark.test',
    password: 'Password123!',
    first_name: 'CS',
    last_name: 'Admin',
    role: 'admin',
    department: 'CS',
  },
  {
    email: 'it-admin@spark.test',
    password: 'Password123!',
    first_name: 'IT',
    last_name: 'Admin',
    role: 'admin',
    department: 'IT',
  },
  {
    email: 'is-admin@spark.test',
    password: 'Password123!',
    first_name: 'IS',
    last_name: 'Admin',
    role: 'admin',
    department: 'IS',
  },
  {
    email: 'student.cs@spark.test',
    password: 'Password123!',
    first_name: 'Carlos',
    last_name: 'Santos',
    role: 'student',
    department: 'CS',
  },
  {
    email: 'student.it@spark.test',
    password: 'Password123!',
    first_name: 'Ingrid',
    last_name: 'Ramos',
    role: 'student',
    department: 'IT',
  },
  {
    email: 'student.is@spark.test',
    password: 'Password123!',
    first_name: 'Sofia',
    last_name: 'Dela Cruz',
    role: 'student',
    department: 'IS',
  },
]

// ---------------------------------------------------------------------------
// 3. Sample documents (approved, no PDF — for public browse testing)
// ---------------------------------------------------------------------------

function buildDocuments(idByEmail) {
  const cs = idByEmail['student.cs@spark.test']
  const it = idByEmail['student.it@spark.test']
  const is = idByEmail['student.is@spark.test']

  return [
    // CS — Core Computer Science
    {
      title: 'Adaptive Routing Optimization for High-Density Campus Networks',
      authors: JSON.stringify(['Arielle Mendoza', 'Joshua P. Santos']),
      abstract:
        'This study proposes a dynamic routing strategy for congested campus networks using graph optimization and traffic-aware path selection. The approach improved end-to-end latency and reduced packet loss under peak student usage.',
      year: 2025,
      department: 'CS',
      type: 'thesis',
      track_specialization: 'Core Computer Science',
      adviser: 'Dr. Reyes',
      keywords: JSON.stringify(['routing algorithms', 'network optimization', 'graph theory']),
      pdf_file_path: null,
      uploaded_by: cs,
      status: 'approved',
    },
    {
      title: 'Formal Verification Techniques for Academic Smart Contract Deployments',
      authors: JSON.stringify(['Bea C. Tolentino', 'Karl M. Reyes']),
      abstract:
        'The paper evaluates static analysis and symbolic execution methods for detecting vulnerabilities in educational blockchain applications. Findings show improved defect detection before production deployment.',
      year: 2025,
      department: 'CS',
      type: 'thesis',
      track_specialization: 'Core Computer Science',
      adviser: 'Dr. Santos',
      keywords: JSON.stringify(['formal methods', 'smart contracts', 'static analysis']),
      pdf_file_path: null,
      uploaded_by: cs,
      status: 'approved',
    },
    {
      title: 'Compiler Optimization Strategies for Resource-Constrained Edge Devices',
      authors: JSON.stringify(['Carlos M. Javier', 'Dominique O. Villanueva']),
      abstract:
        'This thesis benchmarks instruction-level and memory-level optimizations for low-power edge deployments. The resulting toolchain reduced runtime and improved energy efficiency across test workloads.',
      year: 2025,
      department: 'CS',
      type: 'thesis',
      track_specialization: 'Core Computer Science',
      adviser: 'Dr. Cruz',
      keywords: JSON.stringify(['compilers', 'edge computing', 'low-power systems']),
      pdf_file_path: null,
      uploaded_by: cs,
      status: 'approved',
    },
    // CS — Game Development
    {
      title: 'Procedural Level Design Framework for Mobile Role-Playing Games',
      authors: JSON.stringify(['Danica T. Lopez', 'Ethan N. Co']),
      abstract:
        'A procedural generation framework was developed to produce balanced quest maps and enemy progression in mobile RPGs. User testing indicated improved replayability without sacrificing difficulty consistency.',
      year: 2025,
      department: 'CS',
      type: 'thesis',
      track_specialization: 'Game Development',
      adviser: 'Dr. Lim',
      keywords: JSON.stringify(['procedural generation', 'game design', 'mobile rpg']),
      pdf_file_path: null,
      uploaded_by: cs,
      status: 'approved',
    },
    {
      title: 'Gesture-Driven VR Learning Modules for Introductory Programming',
      authors: JSON.stringify(['Franco B. Ong', 'Giselle M. Cabrera']),
      abstract:
        'This research introduces an interactive VR environment where programming concepts are taught through spatial and gesture-based tasks. Experimental sections showed higher engagement and retention rates.',
      year: 2025,
      department: 'CS',
      type: 'thesis',
      track_specialization: 'Game Development',
      adviser: 'Dr. Aquino',
      keywords: JSON.stringify(['virtual reality', 'educational games', 'human-computer interaction']),
      pdf_file_path: null,
      uploaded_by: cs,
      status: 'approved',
    },
    // CS — Data Science
    {
      title: 'Predicting Student Retention Using Ensemble Machine Learning Models',
      authors: JSON.stringify(['Hannah P. Valdez', 'Ian L. Cruz']),
      abstract:
        'Using institutional datasets, this thesis compares ensemble models for identifying retention risk factors. The best-performing model achieved consistent precision across multiple program cohorts.',
      year: 2025,
      department: 'CS',
      type: 'thesis',
      track_specialization: 'Data Science',
      adviser: 'Dr. Bautista',
      keywords: JSON.stringify(['machine learning', 'retention analytics', 'predictive modeling']),
      pdf_file_path: null,
      uploaded_by: cs,
      status: 'approved',
    },
    {
      title: 'NLP Pipeline for Topic Discovery in Philippine Policy Documents',
      authors: JSON.stringify(['Jillian D. Mercado', 'Kean A. Ramos']),
      abstract:
        'This study builds a multilingual NLP pipeline for extracting themes in policy archives. The pipeline improved retrieval and category consistency for policy research workflows.',
      year: 2025,
      department: 'CS',
      type: 'thesis',
      track_specialization: 'Data Science',
      adviser: 'Dr. Garcia',
      keywords: JSON.stringify(['natural language processing', 'topic modeling', 'text analytics']),
      pdf_file_path: null,
      uploaded_by: cs,
      status: 'approved',
    },
    // IT — Network and Security
    {
      title: 'SIEM-Lite Monitoring for University Computer Laboratories',
      authors: JSON.stringify(['Lance R. De Guzman', 'Mia S. Ricarte']),
      abstract:
        'A lightweight security monitoring platform was deployed to collect, correlate, and alert suspicious activity in campus labs. The implementation improved incident response visibility for administrators.',
      year: 2025,
      department: 'IT',
      type: 'capstone',
      track_specialization: 'Network and Security',
      adviser: 'Dr. Navarro',
      keywords: JSON.stringify(['siem', 'intrusion detection', 'network security']),
      pdf_file_path: null,
      uploaded_by: it,
      status: 'approved',
    },
    {
      title: 'Zero-Trust Access Prototype for Shared Academic Infrastructure',
      authors: JSON.stringify(['Nico A. Villarta', 'Olivia T. Manuel']),
      abstract:
        'This capstone introduces identity-aware controls and segmented access policies for shared academic services. Pilot implementation reduced lateral movement risks in controlled simulations.',
      year: 2025,
      department: 'IT',
      type: 'capstone',
      track_specialization: 'Network and Security',
      adviser: 'Dr. Torres',
      keywords: JSON.stringify(['zero trust', 'identity access management', 'segmentation']),
      pdf_file_path: null,
      uploaded_by: it,
      status: 'approved',
    },
    // IT — Web and Mobile App Development
    {
      title: 'Clinic Queue and Follow-Up Mobile Suite for Community Health Units',
      authors: JSON.stringify(['Paula M. Cordero', 'Quincy J. Flores']),
      abstract:
        'A mobile-first queueing and patient follow-up system was developed for partner community clinics. Deployment lowered waiting-time bottlenecks and improved follow-up compliance.',
      year: 2025,
      department: 'IT',
      type: 'capstone',
      track_specialization: 'Web and Mobile App Development',
      adviser: 'Dr. Pascual',
      keywords: JSON.stringify(['mobile development', 'patient workflow', 'scheduling']),
      pdf_file_path: null,
      uploaded_by: it,
      status: 'approved',
    },
    {
      title: 'Modernized Alumni Engagement Portal with Event and Mentorship Modules',
      authors: JSON.stringify(['Rafael K. Sy', 'Sofia M. Villareal']),
      abstract:
        'The team rebuilt an alumni portal with role-based dashboards, event registration, and mentoring workflows. Usability testing showed faster task completion for alumni officers.',
      year: 2025,
      department: 'IT',
      type: 'capstone',
      track_specialization: 'Web and Mobile App Development',
      adviser: 'Dr. Reyes',
      keywords: JSON.stringify(['web portal', 'ux', 'role-based access']),
      pdf_file_path: null,
      uploaded_by: it,
      status: 'approved',
    },
    // IT — IT Automation
    {
      title: 'DevOps Workflow Automation for Courseware Deployment in Lab Environments',
      authors: JSON.stringify(['Trisha P. Natividad', 'Ulysses B. Santos']),
      abstract:
        'This project automated courseware packaging, deployment, and rollback procedures across lab machines. The pipeline reduced manual setup time and improved release consistency.',
      year: 2025,
      department: 'IT',
      type: 'capstone',
      track_specialization: 'IT Automation Track',
      adviser: 'Dr. Mendoza',
      keywords: JSON.stringify(['devops', 'automation', 'ci-cd']),
      pdf_file_path: null,
      uploaded_by: it,
      status: 'approved',
    },
    {
      title: 'Automated Inventory Reconciliation Bot for Campus Procurement',
      authors: JSON.stringify(['Vince T. Colet', 'Wynne A. Ibarra']),
      abstract:
        'The capstone delivers an automation bot that reconciles procurement records with warehouse logs and flags discrepancies. The solution shortened month-end reconciliation cycles.',
      year: 2025,
      department: 'IT',
      type: 'capstone',
      track_specialization: 'IT Automation Track',
      adviser: 'Dr. Santos',
      keywords: JSON.stringify(['process automation', 'rpa', 'inventory systems']),
      pdf_file_path: null,
      uploaded_by: it,
      status: 'approved',
    },
    // IS — Business Analytics
    {
      title: 'Enrollment Analytics Command Center for Department Planning',
      authors: JSON.stringify(['Xyra F. Legaspi', 'Yven M. Abad']),
      abstract:
        'A centralized analytics dashboard was built to monitor enrollment trends, retention indicators, and sectioning demand. Department staff used the tool for evidence-based planning.',
      year: 2025,
      department: 'IS',
      type: 'capstone',
      track_specialization: 'Business Analytics',
      adviser: 'Dr. Luna',
      keywords: JSON.stringify(['business intelligence', 'dashboards', 'enrollment analytics']),
      pdf_file_path: null,
      uploaded_by: is,
      status: 'approved',
    },
    {
      title: 'Predictive Service Load Forecasting for Registrar Operations',
      authors: JSON.stringify(['Zack B. Ferrer', 'Alya R. Domingo']),
      abstract:
        'The project develops forecasting models to estimate service demand peaks in registrar transactions. The model output supports staffing and appointment planning decisions.',
      year: 2025,
      department: 'IS',
      type: 'capstone',
      track_specialization: 'Business Analytics',
      adviser: 'Dr. Reyes',
      keywords: JSON.stringify(['forecasting', 'operations analytics', 'service demand']),
      pdf_file_path: null,
      uploaded_by: is,
      status: 'approved',
    },
    // IS — Service Management
    {
      title: 'ITIL-Based Ticket Lifecycle Platform for Academic Support Offices',
      authors: JSON.stringify(['Brenna J. Torres', 'Caleb P. Sarmiento']),
      abstract:
        'A service desk platform aligned with ITIL processes was developed to standardize incident, request, and change workflows. The rollout improved SLA tracking and escalation visibility.',
      year: 2025,
      department: 'IS',
      type: 'capstone',
      track_specialization: 'Service Management',
      adviser: 'Dr. Castillo',
      keywords: JSON.stringify(['itil', 'service desk', 'incident management']),
      pdf_file_path: null,
      uploaded_by: is,
      status: 'approved',
    },
    {
      title: 'Service Catalog and Governance Portal for Shared Campus Services',
      authors: JSON.stringify(['Daphne N. Ramos', 'Emil G. Mercado']),
      abstract:
        'This capstone delivers a governance portal that defines service ownership, catalog standards, and escalation pathways. Stakeholders reported better transparency in service accountability.',
      year: 2025,
      department: 'IS',
      type: 'capstone',
      track_specialization: 'Service Management',
      adviser: 'Dr. Flores',
      keywords: JSON.stringify(['service governance', 'catalog management', 'workflow policy']),
      pdf_file_path: null,
      uploaded_by: is,
      status: 'approved',
    },
    // One pending submission per student (to test the admin review flow)
    {
      title: 'Convolutional Neural Networks for Handwritten Baybayin Script Recognition',
      authors: JSON.stringify(['Carlos Santos', 'Maria G. Reyes']),
      abstract:
        'This thesis trains and evaluates CNN architectures for recognizing handwritten Baybayin characters from scanned documents. The best model achieved high accuracy on a novel curated dataset.',
      year: 2025,
      department: 'CS',
      type: 'thesis',
      track_specialization: 'Data Science',
      adviser: 'Dr. Fernandez',
      keywords: JSON.stringify(['cnn', 'character recognition', 'baybayin']),
      pdf_file_path: null,
      uploaded_by: cs,
      status: 'pending',
    },
    {
      title: 'IoT-Based Real-Time Environmental Monitoring for Smart Classrooms',
      authors: JSON.stringify(['Ingrid Ramos', 'Jose L. Tan']),
      abstract:
        'A sensor network was deployed across pilot classrooms to monitor temperature, humidity, CO2, and lighting. The dashboard enabled facilities managers to respond to comfort issues proactively.',
      year: 2025,
      department: 'IT',
      type: 'capstone',
      track_specialization: 'IT Automation Track',
      adviser: 'Dr. Lopez',
      keywords: JSON.stringify(['iot', 'smart classroom', 'environmental monitoring']),
      pdf_file_path: null,
      uploaded_by: it,
      status: 'pending',
    },
    {
      title: 'Digital Transformation Readiness Assessment Tool for SMEs',
      authors: JSON.stringify(['Sofia Dela Cruz', 'Miguel A. Padilla']),
      abstract:
        'An assessment framework and accompanying web tool was built to measure digital transformation maturity across business dimensions. Pilot SMEs used results to prioritize improvement initiatives.',
      year: 2025,
      department: 'IS',
      type: 'capstone',
      track_specialization: 'Business Analytics',
      adviser: 'Dr. Santos',
      keywords: JSON.stringify(['digital transformation', 'maturity model', 'sme']),
      pdf_file_path: null,
      uploaded_by: is,
      status: 'pending',
    },
  ]
}

// ---------------------------------------------------------------------------
// 4. Main
// ---------------------------------------------------------------------------

async function main() {
  const env = loadEnv()

  if (!env.SUPABASE_URL || !env.SUPABASE_SECRET_KEY) {
    throw new Error('SUPABASE_URL and SUPABASE_SECRET_KEY must be set in backend/.env')
  }

  const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_SECRET_KEY, {
    auth: { autoRefreshToken: false, persistSession: false },
  })

  console.log('\n=== SPARK Setup Script ===\n')

  // ── Step 1: Create auth users ──────────────────────────────────────────────
  console.log('Step 1: Creating Supabase Auth users...')
  const idByEmail = {}

  for (const account of ACCOUNTS) {
    // Try to get existing user first
    const { data: listData } = await supabase.auth.admin.listUsers()
    const existing = listData?.users?.find((u) => u.email === account.email)

    if (existing) {
      console.log(`  [skip] ${account.email} — already exists (id: ${existing.id})`)
      idByEmail[account.email] = existing.id
      continue
    }

    const { data, error } = await supabase.auth.admin.createUser({
      email: account.email,
      password: account.password,
      email_confirm: true, // skip confirmation email for MVP dummy accounts
    })

    if (error) {
      throw new Error(`Failed to create auth user ${account.email}: ${error.message}`)
    }

    idByEmail[account.email] = data.user.id
    console.log(`  [ok]   ${account.email} (id: ${data.user.id})`)
  }

  // ── Step 2: Insert/upsert into public.users ────────────────────────────────
  console.log('\nStep 2: Inserting into public.users...')

  const userRows = ACCOUNTS.map((a) => ({
    id: idByEmail[a.email],
    email: a.email,
    first_name: a.first_name,
    last_name: a.last_name,
    role: a.role,
    department: a.department,
    is_active: true,
  }))

  const { error: usersError } = await supabase
    .from('users')
    .upsert(userRows, { onConflict: 'id' })

  if (usersError) {
    throw new Error(`Failed to upsert public.users: ${usersError.message}`)
  }
  console.log(`  [ok]   ${userRows.length} rows upserted into public.users`)

  // ── Step 3: Create storage bucket ─────────────────────────────────────────
  console.log('\nStep 3: Creating storage bucket "documents"...')

  const { error: bucketError } = await supabase.storage.createBucket('documents', {
    public: false,
    allowedMimeTypes: ['application/pdf'],
    fileSizeLimit: 41943040, // 40 MB
  })

  if (bucketError) {
    if (bucketError.message.includes('already exists') || bucketError.message.includes('duplicate')) {
      console.log('  [skip] Bucket "documents" already exists')
    } else {
      throw new Error(`Failed to create storage bucket: ${bucketError.message}`)
    }
  } else {
    console.log('  [ok]   Bucket "documents" created (private, PDF-only, 10 MB limit)')
  }

  // ── Step 4: Seed documents ─────────────────────────────────────────────────
  console.log('\nStep 4: Seeding sample documents...')

  const documents = buildDocuments(idByEmail)

  // Check how many already exist to avoid double-seeding
  const { data: existingDocs, error: checkError } = await supabase
    .from('documents')
    .select('title')

  if (checkError) {
    throw new Error(`Failed to check existing documents: ${checkError.message}`)
  }

  const existingTitles = new Set((existingDocs ?? []).map((d) => d.title))
  const toInsert = documents.filter((d) => !existingTitles.has(d.title))

  if (toInsert.length === 0) {
    console.log('  [skip] All sample documents already exist')
  } else {
    const { error: docsError } = await supabase.from('documents').insert(toInsert)
    if (docsError) {
      throw new Error(`Failed to insert documents: ${docsError.message}`)
    }
    console.log(`  [ok]   Inserted ${toInsert.length} documents (${documents.length - toInsert.length} already existed)`)
  }

  // ── Done ───────────────────────────────────────────────────────────────────
  console.log('\n=== Setup complete ===')
  console.log('\nNext step: open the Supabase SQL Editor and run backend/supabase/rls.sql')
  console.log('           to apply RLS policies and the account-activation trigger.\n')
  console.log('Credentials:')
  for (const a of ACCOUNTS) {
    console.log(`  ${a.role.padEnd(12)} ${a.email.padEnd(30)} Password123!`)
  }
  console.log()
}

main().catch((err) => {
  console.error('\n[ERROR]', err.message)
  process.exit(1)
})
