-- =============================================================================
-- SPARK — Seed file for MVP dummy accounts and approved documents
-- =============================================================================
-- HOW TO RUN:
--   1. Open the Supabase project dashboard → SQL Editor
--   2. Paste this entire file and run it.
--
-- IMPORTANT: The auth.users rows must be created first via the Supabase
-- Auth dashboard (Authentication → Users → "Add user") using these emails
-- and password "Password123!" before running this seed, because the
-- users table has a FK to auth.users(id).
--
-- After creating auth users, fill in the UUIDs below from the Auth dashboard.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- STEP 1: Create auth.users manually in Supabase dashboard, then copy UUIDs here.
-- Template (replace placeholder UUIDs with real ones from Auth dashboard):
-- -----------------------------------------------------------------------------

-- Super Admin: superadmin@spark.test
-- CS Admin:    cs-admin@spark.test
-- IT Admin:    it-admin@spark.test
-- IS Admin:    is-admin@spark.test
-- CS Student:  student.cs@spark.test
-- IT Student:  student.it@spark.test
-- IS Student:  student.is@spark.test

-- -----------------------------------------------------------------------------
-- STEP 2: Insert into public.users (replace UUIDs with real ones from Auth)
-- These are inserted with is_active = TRUE so no email confirmation needed.
-- -----------------------------------------------------------------------------

-- NOTE: Run this only after the auth.users rows exist.
-- Replace each 'REPLACE_WITH_ACTUAL_UUID' with the UUID from the Auth dashboard.

INSERT INTO public.users (id, email, first_name, last_name, role, department, is_active)
VALUES
  ('REPLACE_WITH_SUPERADMIN_UUID',  'superadmin@spark.test',   'Super',   'Admin',   'super_admin', 'CS', TRUE),
  ('REPLACE_WITH_CS_ADMIN_UUID',    'cs-admin@spark.test',     'CS',      'Admin',   'admin',       'CS', TRUE),
  ('REPLACE_WITH_IT_ADMIN_UUID',    'it-admin@spark.test',     'IT',      'Admin',   'admin',       'IT', TRUE),
  ('REPLACE_WITH_IS_ADMIN_UUID',    'is-admin@spark.test',     'IS',      'Admin',   'admin',       'IS', TRUE),
  ('REPLACE_WITH_CS_STUDENT_UUID',  'student.cs@spark.test',   'Carlos',  'Student', 'student',     'CS', TRUE),
  ('REPLACE_WITH_IT_STUDENT_UUID',  'student.it@spark.test',   'Ingrid',  'Student', 'student',     'IT', TRUE),
  ('REPLACE_WITH_IS_STUDENT_UUID',  'student.is@spark.test',   'Sofia',   'Student', 'student',     'IS', TRUE)
ON CONFLICT (id) DO UPDATE SET
  is_active = TRUE,
  first_name = EXCLUDED.first_name,
  last_name = EXCLUDED.last_name,
  role = EXCLUDED.role,
  department = EXCLUDED.department;

-- -----------------------------------------------------------------------------
-- STEP 3: Seed approved documents for public browsing
-- Replace student UUIDs with the actual UUIDs inserted above.
-- These documents go directly to 'approved' so they appear on the public site.
-- -----------------------------------------------------------------------------

INSERT INTO public.documents (
  title, authors, abstract, year, department, type, track_specialization,
  adviser, degree, keywords, pdf_file_path, uploaded_by, status
)
VALUES
  -- CS — Core Computer Science (3 theses)
  (
    'Adaptive Routing Optimization for High-Density Campus Networks',
    '["Arielle Mendoza", "Joshua P. Santos"]',
    'This study proposes a dynamic routing strategy for congested campus networks using graph optimization and traffic-aware path selection. The approach improved end-to-end latency and reduced packet loss under peak student usage.',
    2025, 'CS', 'thesis', 'Core Computer Science',
    'Dr. Reyes', 'Master of Science in Computer Science', '["routing algorithms", "network optimization", "graph theory"]',
    NULL, 'REPLACE_WITH_CS_STUDENT_UUID', 'approved'
  ),
  (
    'Formal Verification Techniques for Academic Smart Contract Deployments',
    '["Bea C. Tolentino", "Karl M. Reyes"]',
    'The paper evaluates static analysis and symbolic execution methods for detecting vulnerabilities in educational blockchain applications. Findings show improved defect detection before production deployment.',
    2025, 'CS', 'thesis', 'Core Computer Science',
    'Dr. Santos', 'Master of Science in Computer Science', '["formal methods", "smart contracts", "static analysis"]',
    NULL, 'REPLACE_WITH_CS_STUDENT_UUID', 'approved'
  ),
  (
    'Compiler Optimization Strategies for Resource-Constrained Edge Devices',
    '["Carlos M. Javier", "Dominique O. Villanueva"]',
    'This thesis benchmarks instruction-level and memory-level optimizations for low-power edge deployments. The resulting toolchain reduced runtime and improved energy efficiency across test workloads.',
    2025, 'CS', 'thesis', 'Core Computer Science',
    'Dr. Cruz', 'Master of Science in Computer Science', '["compilers", "edge computing", "low-power systems"]',
    NULL, 'REPLACE_WITH_CS_STUDENT_UUID', 'approved'
  ),
  -- CS — Game Development (2 theses)
  (
    'Procedural Level Design Framework for Mobile Role-Playing Games',
    '["Danica T. Lopez", "Ethan N. Co"]',
    'A procedural generation framework was developed to produce balanced quest maps and enemy progression in mobile RPGs. User testing indicated improved replayability without sacrificing difficulty consistency.',
    2025, 'CS', 'thesis', 'Game Development',
    'Dr. Lim', 'Master of Science in Computer Science', '["procedural generation", "game design", "mobile rpg"]',
    NULL, 'REPLACE_WITH_CS_STUDENT_UUID', 'approved'
  ),
  (
    'Gesture-Driven VR Learning Modules for Introductory Programming',
    '["Franco B. Ong", "Giselle M. Cabrera"]',
    'This research introduces an interactive VR environment where programming concepts are taught through spatial and gesture-based tasks. Experimental sections showed higher engagement and retention rates.',
    2025, 'CS', 'thesis', 'Game Development',
    'Dr. Aquino', 'Master of Science in Computer Science', '["virtual reality", "educational games", "human-computer interaction"]',
    NULL, 'REPLACE_WITH_CS_STUDENT_UUID', 'approved'
  ),
  -- CS — Data Science (2 theses)
  (
    'Predicting Student Retention Using Ensemble Machine Learning Models',
    '["Hannah P. Valdez", "Ian L. Cruz"]',
    'Using institutional datasets, this thesis compares ensemble models for identifying retention risk factors. The best-performing model achieved consistent precision across multiple program cohorts.',
    2025, 'CS', 'thesis', 'Data Science',
    'Dr. Bautista', 'Master of Science in Computer Science', '["machine learning", "retention analytics", "predictive modeling"]',
    NULL, 'REPLACE_WITH_CS_STUDENT_UUID', 'approved'
  ),
  (
    'NLP Pipeline for Topic Discovery in Philippine Policy Documents',
    '["Jillian D. Mercado", "Kean A. Ramos"]',
    'This study builds a multilingual NLP pipeline for extracting themes in policy archives. The pipeline improved retrieval and category consistency for policy research workflows.',
    2025, 'CS', 'thesis', 'Data Science',
    'Dr. Garcia', 'Master of Science in Computer Science', '["natural language processing", "topic modeling", "text analytics"]',
    NULL, 'REPLACE_WITH_CS_STUDENT_UUID', 'approved'
  ),
  -- IT — Network and Security (2 capstones)
  (
    'SIEM-Lite Monitoring for University Computer Laboratories',
    '["Lance R. De Guzman", "Mia S. Ricarte"]',
    'A lightweight security monitoring platform was deployed to collect, correlate, and alert suspicious activity in campus labs. The implementation improved incident response visibility for administrators.',
    2025, 'IT', 'capstone', 'Network and Security',
    'Dr. Navarro', 'Bachelor of Science in Information Technology', '["siem", "intrusion detection", "network security"]',
    NULL, 'REPLACE_WITH_IT_STUDENT_UUID', 'approved'
  ),
  (
    'Zero-Trust Access Prototype for Shared Academic Infrastructure',
    '["Nico A. Villarta", "Olivia T. Manuel"]',
    'This capstone introduces identity-aware controls and segmented access policies for shared academic services. Pilot implementation reduced lateral movement risks in controlled simulations.',
    2025, 'IT', 'capstone', 'Network and Security',
    'Dr. Torres', 'Bachelor of Science in Information Technology', '["zero trust", "identity access management", "segmentation"]',
    NULL, 'REPLACE_WITH_IT_STUDENT_UUID', 'approved'
  ),
  -- IT — Web and Mobile App Development (2 capstones)
  (
    'Clinic Queue and Follow-Up Mobile Suite for Community Health Units',
    '["Paula M. Cordero", "Quincy J. Flores"]',
    'A mobile-first queueing and patient follow-up system was developed for partner community clinics. Deployment lowered waiting-time bottlenecks and improved follow-up compliance.',
    2025, 'IT', 'capstone', 'Web and Mobile App Development',
    'Dr. Pascual', 'Bachelor of Science in Information Technology', '["mobile development", "patient workflow", "scheduling"]',
    NULL, 'REPLACE_WITH_IT_STUDENT_UUID', 'approved'
  ),
  (
    'Modernized Alumni Engagement Portal with Event and Mentorship Modules',
    '["Rafael K. Sy", "Sofia M. Villareal"]',
    'The team rebuilt an alumni portal with role-based dashboards, event registration, and mentoring workflows. Usability testing showed faster task completion for alumni officers.',
    2025, 'IT', 'capstone', 'Web and Mobile App Development',
    'Dr. Reyes', 'Bachelor of Science in Information Technology', '["web portal", "ux", "role-based access"]',
    NULL, 'REPLACE_WITH_IT_STUDENT_UUID', 'approved'
  ),
  -- IT — IT Automation (2 capstones)
  (
    'DevOps Workflow Automation for Courseware Deployment in Lab Environments',
    '["Trisha P. Natividad", "Ulysses B. Santos"]',
    'This project automated courseware packaging, deployment, and rollback procedures across lab machines. The pipeline reduced manual setup time and improved release consistency.',
    2025, 'IT', 'capstone', 'IT Automation Track',
    'Dr. Mendoza', 'Bachelor of Science in Information Technology', '["devops", "automation", "ci-cd"]',
    NULL, 'REPLACE_WITH_IT_STUDENT_UUID', 'approved'
  ),
  (
    'Automated Inventory Reconciliation Bot for Campus Procurement',
    '["Vince T. Colet", "Wynne A. Ibarra"]',
    'The capstone delivers an automation bot that reconciles procurement records with warehouse logs and flags discrepancies. The solution shortened month-end reconciliation cycles.',
    2025, 'IT', 'capstone', 'IT Automation Track',
    'Dr. Santos', 'Bachelor of Science in Information Technology', '["process automation", "rpa", "inventory systems"]',
    NULL, 'REPLACE_WITH_IT_STUDENT_UUID', 'approved'
  ),
  -- IS — Business Analytics (2 capstones)
  (
    'Enrollment Analytics Command Center for Department Planning',
    '["Xyra F. Legaspi", "Yven M. Abad"]',
    'A centralized analytics dashboard was built to monitor enrollment trends, retention indicators, and sectioning demand. Department staff used the tool for evidence-based planning.',
    2025, 'IS', 'capstone', 'Business Analytics',
    'Dr. Luna', 'Bachelor of Science in Information Systems', '["business intelligence", "dashboards", "enrollment analytics"]',
    NULL, 'REPLACE_WITH_IS_STUDENT_UUID', 'approved'
  ),
  (
    'Predictive Service Load Forecasting for Registrar Operations',
    '["Zack B. Ferrer", "Alya R. Domingo"]',
    'The project develops forecasting models to estimate service demand peaks in registrar transactions. The model output supports staffing and appointment planning decisions.',
    2025, 'IS', 'capstone', 'Business Analytics',
    'Dr. Reyes', 'Bachelor of Science in Information Systems', '["forecasting", "operations analytics", "service demand"]',
    NULL, 'REPLACE_WITH_IS_STUDENT_UUID', 'approved'
  ),
  -- IS — Service Management (2 capstones)
  (
    'ITIL-Based Ticket Lifecycle Platform for Academic Support Offices',
    '["Brenna J. Torres", "Caleb P. Sarmiento"]',
    'A service desk platform aligned with ITIL processes was developed to standardize incident, request, and change workflows. The rollout improved SLA tracking and escalation visibility.',
    2025, 'IS', 'capstone', 'Service Management',
    'Dr. Castillo', 'Bachelor of Science in Information Systems', '["itil", "service desk", "incident management"]',
    NULL, 'REPLACE_WITH_IS_STUDENT_UUID', 'approved'
  ),
  (
    'Service Catalog and Governance Portal for Shared Campus Services',
    '["Daphne N. Ramos", "Emil G. Mercado"]',
    'This capstone delivers a governance portal that defines service ownership, catalog standards, and escalation pathways. Stakeholders reported better transparency in service accountability.',
    2025, 'IS', 'capstone', 'Service Management',
    'Dr. Flores', 'Bachelor of Science in Information Systems', '["service governance", "catalog management", "workflow policy"]',
    NULL, 'REPLACE_WITH_IS_STUDENT_UUID', 'approved'
  );
