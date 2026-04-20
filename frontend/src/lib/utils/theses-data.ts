export type ThesisCollection = {
  slug: string
  title: string
  count: number
  description: string
}

export type SpecializationTrack = {
  slug: string
  title: string
  description: string
  count: number
}

export type ThesisEntry = {
  slug: string
  title: string
  authors: string
  date: string
  type: 'Thesis' | 'Capstone'
  abstract: string
  tags: string
  departmentSlug: string
  trackSlug: string
  detail?: ThesisDetail
}

export type ThesisDetail = {
  publicationDate: string
  documentType: string
  degreeName: string
  subjectCategories: string
  college: string
  departmentUnit: string
  thesisAdvisor: string
  defensePanelChair: string
  defensePanelMembers: string[]
  abstractSummary: string[]
  language: string
  format: string
  keywords: string
  recommendedCitation: string
  /** Structured parts for rendering the title in italics per APA style */
  citationParts?: { pre: string; title: string; post: string }
}

export function resolveThesisDetail(entry: ThesisEntry): ThesisDetail {
  if (entry.detail) {
    return entry.detail
  }

  return {
    publicationDate: entry.date,
    documentType: entry.type,
    degreeName: 'Bachelor of Science in Computer Science',
    subjectCategories: entry.tags,
    college: 'College of Information and Computing Sciences',
    departmentUnit: 'Department of Computer Science',
    thesisAdvisor: 'Not provided',
    defensePanelChair: 'Not provided',
    defensePanelMembers: ['Not provided'],
    abstractSummary: [entry.abstract],
    language: 'English',
    format: 'Electronic',
    keywords: entry.tags,
    recommendedCitation: `${entry.authors}. ${entry.title}`,
  }
}

export const thesisCollections: ThesisCollection[] = [
  {
    slug: 'department-of-computer-science',
    title: 'Department of Computer Science',
    count: 7,
    description: 'Theses submitted to the Department of Computer Science.',
  },
]

const thesisTrackMap: Record<string, SpecializationTrack[]> = {
  'department-of-computer-science': [
    {
      slug: 'core-computer-science',
      title: 'Core Computer Science',
      description: 'Covers key CS domains beyond core requirements to prepare students for advanced study and research.',
      count: 3,
    },
    {
      slug: 'game-development',
      title: 'Game Development',
      description: 'Builds creative and technical skills for market-ready 2D/3D games using current tools and workflows.',
      count: 2,
    },
    {
      slug: 'data-science',
      title: 'Data Science',
      description: 'Develops data-driven expertise in analytics, mathematical modeling, and programming for industry use.',
      count: 2,
    },
  ],
}

export const sampleThesisEntries: ThesisEntry[] = [
  {
    slug: 'adaptive-routing-in-campus-networks',
    title: 'Adaptive Routing Optimization for High-Density Campus Networks',
    authors: 'Arielle Mendoza, Joshua P. Santos',
    date: 'March 2025',
    type: 'Thesis',
    abstract:
      'This study proposes a dynamic routing strategy for congested campus networks using graph optimization and traffic-aware path selection. The approach improved end-to-end latency and reduced packet loss under peak student usage.',
    tags: 'routing algorithms, network optimization, graph theory',
    departmentSlug: 'department-of-computer-science',
    trackSlug: 'core-computer-science',
  },
  {
    slug: 'formal-verification-of-smart-contracts',
    title: 'Formal Verification Techniques for Academic Smart Contract Deployments',
    authors: 'Bea C. Tolentino, Karl M. Reyes',
    date: 'May 2025',
    type: 'Thesis',
    abstract:
      'The paper evaluates static analysis and symbolic execution methods for detecting vulnerabilities in educational blockchain applications. Findings show improved defect detection before production deployment.',
    tags: 'formal methods, smart contracts, static analysis',
    departmentSlug: 'department-of-computer-science',
    trackSlug: 'core-computer-science',
  },
  {
    slug: 'compiler-optimizations-for-edge-devices',
    title: 'Compiler Optimization Strategies for Resource-Constrained Edge Devices',
    authors: 'Carlos M. Javier, Dominique O. Villanueva',
    date: 'July 2025',
    type: 'Thesis',
    abstract:
      'This thesis benchmarks instruction-level and memory-level optimizations for low-power edge deployments. The resulting toolchain reduced runtime and improved energy efficiency across test workloads.',
    tags: 'compilers, edge computing, low-power systems',
    departmentSlug: 'department-of-computer-science',
    trackSlug: 'core-computer-science',
  },
  {
    slug: 'procedural-level-design-for-mobile-rpgs',
    title: 'Procedural Level Design Framework for Mobile Role-Playing Games',
    authors: 'Danica T. Lopez, Ethan N. Co',
    date: 'April 2025',
    type: 'Thesis',
    abstract:
      'A procedural generation framework was developed to produce balanced quest maps and enemy progression in mobile RPGs. User testing indicated improved replayability without sacrificing difficulty consistency.',
    tags: 'procedural generation, game design, mobile rpg',
    departmentSlug: 'department-of-computer-science',
    trackSlug: 'game-development',
  },
  {
    slug: 'gesture-driven-vr-learning-modules',
    title: 'Gesture-Driven VR Learning Modules for Introductory Programming',
    authors: 'Franco B. Ong, Giselle M. Cabrera',
    date: 'September 2025',
    type: 'Thesis',
    abstract:
      'This research introduces an interactive VR environment where programming concepts are taught through spatial and gesture-based tasks. Experimental sections showed higher engagement and retention rates.',
    tags: 'virtual reality, educational games, human-computer interaction',
    departmentSlug: 'department-of-computer-science',
    trackSlug: 'game-development',
  },
  {
    slug: 'predicting-student-retention-with-ml',
    title: 'Predicting Student Retention Using Ensemble Machine Learning Models',
    authors: 'Hannah P. Valdez, Ian L. Cruz',
    date: 'June 2025',
    type: 'Thesis',
    abstract:
      'Using institutional datasets, this thesis compares ensemble models for identifying retention risk factors. The best-performing model achieved consistent precision across multiple program cohorts.',
    tags: 'machine learning, retention analytics, predictive modeling',
    departmentSlug: 'department-of-computer-science',
    trackSlug: 'data-science',
  },
  {
    slug: 'nlp-for-philippine-policy-documents',
    title: 'NLP Pipeline for Topic Discovery in Philippine Policy Documents',
    authors: 'Jillian D. Mercado, Kean A. Ramos',
    date: 'October 2025',
    type: 'Thesis',
    abstract:
      'This study builds a multilingual NLP pipeline for extracting themes in policy archives. The pipeline improved retrieval and category consistency for policy research workflows.',
    tags: 'natural language processing, topic modeling, text analytics',
    departmentSlug: 'department-of-computer-science',
    trackSlug: 'data-science',
  },
]

export function getThesisTracksByCollection(collectionSlug: string): SpecializationTrack[] {
  return thesisTrackMap[collectionSlug] ?? []
}

export function listThesesByTrack(collectionSlug: string, trackSlug: string): ThesisEntry[] {
  return sampleThesisEntries.filter(
    (entry) => entry.departmentSlug === collectionSlug && entry.trackSlug === trackSlug
  )
}

export function getThesisEntry(collectionSlug: string, trackSlug: string, thesisSlug: string): ThesisEntry | undefined {
  return sampleThesisEntries.find(
    (entry) =>
      entry.departmentSlug === collectionSlug &&
      entry.trackSlug === trackSlug &&
      entry.slug === thesisSlug
  )
}
