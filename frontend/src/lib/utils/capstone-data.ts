import type { SpecializationTrack, ThesisCollection, ThesisEntry } from './theses-data'

export const capstoneCollections: ThesisCollection[] = [
  {
    slug: 'department-of-information-technology',
    title: 'Department of Information Technology',
    count: 6,
    description: 'Capstone projects submitted to the Department of Information Technology.',
  },
  {
    slug: 'department-of-information-systems',
    title: 'Department of Information Systems',
    count: 4,
    description: 'Capstone projects submitted to the Department of Information Systems.',
  },
]

const capstoneTrackMap: Record<string, SpecializationTrack[]> = {
  'department-of-information-technology': [
    {
      slug: 'network-and-security',
      title: 'Network and Security',
      description: 'Focuses on securing, managing, and auditing networks from foundational to advanced cybersecurity practice.',
      count: 2,
    },
    {
      slug: 'web-and-mobile-app-development',
      title: 'Web and Mobile App Development',
      description: 'Extends programming coursework through modern languages, frameworks, tools, and software best practices.',
      count: 2,
    },
    {
      slug: 'it-automation-track',
      title: 'IT Automation Track',
      description: 'Emphasizes system integration and self-regulating IT processes through scripts, programs, and automation tools.',
      count: 2,
    },
  ],
  'department-of-information-systems': [
    {
      slug: 'business-analytics',
      title: 'Business Analytics',
      description: 'Prepares students for analytics careers with enterprise data, modeling, tools, and ethical practice.',
      count: 2,
    },
    {
      slug: 'service-management',
      title: 'Service Management',
      description: 'Trains students for IT-BPO service roles using outcomes-based competencies and service operations practice.',
      count: 2,
    },
  ],
}

export const sampleCapstoneEntries: ThesisEntry[] = [
  {
    slug: 'siem-lite-for-campus-labs',
    title: 'SIEM-Lite Monitoring for University Computer Laboratories',
    authors: 'Lance R. De Guzman, Mia S. Ricarte',
    date: 'February 2025',
    type: 'Capstone',
    abstract:
      'A lightweight security monitoring platform was deployed to collect, correlate, and alert suspicious activity in campus labs. The implementation improved incident response visibility for administrators.',
    tags: 'siem, intrusion detection, network security',
    departmentSlug: 'department-of-information-technology',
    trackSlug: 'network-and-security',
  },
  {
    slug: 'zero-trust-lab-access-prototype',
    title: 'Zero-Trust Access Prototype for Shared Academic Infrastructure',
    authors: 'Nico A. Villarta, Olivia T. Manuel',
    date: 'May 2025',
    type: 'Capstone',
    abstract:
      'This capstone introduces identity-aware controls and segmented access policies for shared academic services. Pilot implementation reduced lateral movement risks in controlled simulations.',
    tags: 'zero trust, identity access management, segmentation',
    departmentSlug: 'department-of-information-technology',
    trackSlug: 'network-and-security',
  },
  {
    slug: 'clinic-queue-mobile-suite',
    title: 'Clinic Queue and Follow-Up Mobile Suite for Community Health Units',
    authors: 'Paula M. Cordero, Quincy J. Flores',
    date: 'July 2025',
    type: 'Capstone',
    abstract:
      'A mobile-first queueing and patient follow-up system was developed for partner community clinics. Deployment lowered waiting-time bottlenecks and improved follow-up compliance.',
    tags: 'mobile development, patient workflow, scheduling',
    departmentSlug: 'department-of-information-technology',
    trackSlug: 'web-and-mobile-app-development',
  },
  {
    slug: 'alumni-portal-modernization',
    title: 'Modernized Alumni Engagement Portal with Event and Mentorship Modules',
    authors: 'Rafael K. Sy, Sofia M. Villareal',
    date: 'September 2025',
    type: 'Capstone',
    abstract:
      'The team rebuilt an alumni portal with role-based dashboards, event registration, and mentoring workflows. Usability testing showed faster task completion for alumni officers.',
    tags: 'web portal, ux, role-based access',
    departmentSlug: 'department-of-information-technology',
    trackSlug: 'web-and-mobile-app-development',
  },
  {
    slug: 'devops-workflow-automation-for-labs',
    title: 'DevOps Workflow Automation for Courseware Deployment in Lab Environments',
    authors: 'Trisha P. Natividad, Ulysses B. Santos',
    date: 'March 2025',
    type: 'Capstone',
    abstract:
      'This project automated courseware packaging, deployment, and rollback procedures across lab machines. The pipeline reduced manual setup time and improved release consistency.',
    tags: 'devops, automation, ci-cd',
    departmentSlug: 'department-of-information-technology',
    trackSlug: 'it-automation-track',
  },
  {
    slug: 'automated-inventory-reconciliation-bot',
    title: 'Automated Inventory Reconciliation Bot for Campus Procurement',
    authors: 'Vince T. Colet, Wynne A. Ibarra',
    date: 'November 2025',
    type: 'Capstone',
    abstract:
      'The capstone delivers an automation bot that reconciles procurement records with warehouse logs and flags discrepancies. The solution shortened month-end reconciliation cycles.',
    tags: 'process automation, rpa, inventory systems',
    departmentSlug: 'department-of-information-technology',
    trackSlug: 'it-automation-track',
  },
  {
    slug: 'enrollment-analytics-command-center',
    title: 'Enrollment Analytics Command Center for Department Planning',
    authors: 'Xyra F. Legaspi, Yven M. Abad',
    date: 'April 2025',
    type: 'Capstone',
    abstract:
      'A centralized analytics dashboard was built to monitor enrollment trends, retention indicators, and sectioning demand. Department staff used the tool for evidence-based planning.',
    tags: 'business intelligence, dashboards, enrollment analytics',
    departmentSlug: 'department-of-information-systems',
    trackSlug: 'business-analytics',
  },
  {
    slug: 'predictive-service-load-forecasting',
    title: 'Predictive Service Load Forecasting for Registrar Operations',
    authors: 'Zack B. Ferrer, Alya R. Domingo',
    date: 'August 2025',
    type: 'Capstone',
    abstract:
      'The project develops forecasting models to estimate service demand peaks in registrar transactions. The model output supports staffing and appointment planning decisions.',
    tags: 'forecasting, operations analytics, service demand',
    departmentSlug: 'department-of-information-systems',
    trackSlug: 'business-analytics',
  },
  {
    slug: 'itil-based-ticket-lifecycle-platform',
    title: 'ITIL-Based Ticket Lifecycle Platform for Academic Support Offices',
    authors: 'Brenna J. Torres, Caleb P. Sarmiento',
    date: 'June 2025',
    type: 'Capstone',
    abstract:
      'A service desk platform aligned with ITIL processes was developed to standardize incident, request, and change workflows. The rollout improved SLA tracking and escalation visibility.',
    tags: 'itil, service desk, incident management',
    departmentSlug: 'department-of-information-systems',
    trackSlug: 'service-management',
  },
  {
    slug: 'service-catalog-governance-portal',
    title: 'Service Catalog and Governance Portal for Shared Campus Services',
    authors: 'Daphne N. Ramos, Emil G. Mercado',
    date: 'October 2025',
    type: 'Capstone',
    abstract:
      'This capstone delivers a governance portal that defines service ownership, catalog standards, and escalation pathways. Stakeholders reported better transparency in service accountability.',
    tags: 'service governance, catalog management, workflow policy',
    departmentSlug: 'department-of-information-systems',
    trackSlug: 'service-management',
  },
]

export function getCapstoneTracksByCollection(collectionSlug: string): SpecializationTrack[] {
  return capstoneTrackMap[collectionSlug] ?? []
}

export function listCapstonesByTrack(collectionSlug: string, trackSlug: string): ThesisEntry[] {
  return sampleCapstoneEntries.filter(
    (entry) => entry.departmentSlug === collectionSlug && entry.trackSlug === trackSlug
  )
}

export function getCapstoneEntry(collectionSlug: string, trackSlug: string, capstoneSlug: string): ThesisEntry | undefined {
  return sampleCapstoneEntries.find(
    (entry) =>
      entry.departmentSlug === collectionSlug &&
      entry.trackSlug === trackSlug &&
      entry.slug === capstoneSlug
  )
}
