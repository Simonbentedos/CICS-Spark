import Link from 'next/link'
import { TypographyH2, TypographyH3, TypographyP } from '@/components/ui'

export type PolicyKey = 'ir' | 'et'

interface PolicySubSection {
  title: string
  paragraphs: string[]
}

interface PolicySection {
  title: string
  paragraphs?: string[]
  subsections?: PolicySubSection[]
}

const policySections: PolicySection[] = [
  {
    title: 'Repository Scope',
    paragraphs: [
      'SPARK Repository is the System for Preserving Academic Research and Knowledge of the University of Santo Tomas. It preserves, describes, and provides access to approved scholarly and institutional outputs produced by the College of Information and Computing Sciences.',
      'The repository is managed by the College of Information and Computing Sciences admins in coordination with authorized academic and administrative offices.',
    ],
  },
  {
    title: 'Content and Eligibility',
    paragraphs: [
      'Materials accepted into the SPARK Repository must be approved for inclusion and may consist of the following:',
      '• Undergraduate and graduate theses that have received formal approval',
      '• Research outputs and creative works produced by faculty members',
      '• Official publications and institutional records of the College',
      '• Additional materials endorsed by repository administrators in accordance with institutional policies',
    ],
  },
  {
    title: 'Access and Discovery',
    subsections: [
      {
        title: 'Metadata Availability',
        paragraphs: [
          'Descriptive and bibliographic metadata may be openly accessible to support searchability, citation, system interoperability, and sustained access over time.',
        ],
      },
      {
        title: 'Access Levels',
        paragraphs: [
          'Content within the repository may be designated as open access, restricted to campus users, or fully private. These access levels are determined based on institutional guidelines, legal considerations, and administrative decisions.',
          'Even when access to full content is restricted, metadata may remain visible for discovery purposes.',
        ],
      },
      {
        title: 'Interoperability and Machine Access',
        paragraphs: [
          'The SPARK Repository supports the sharing of metadata through standard formats and protocols, such as Dublin Core and OAI-PMH, to enable integration with external discovery platforms, subject to repository controls.',
        ],
      },
    ],
  },
  {
    title: 'Rights and Licensing',
    paragraphs: [
      'Ownership of intellectual property remains with the original author or rights holder unless otherwise specified through a formal agreement. By submitting work to the SPARK Repository, contributors grant the University a non-exclusive license to store, manage, and make the material available under approved access conditions.',
      'Where applicable, specific licenses (e.g., Creative Commons) may define how materials can be reused. In the absence of such licenses, reuse is governed by applicable laws and requires permission from the rights holder.',
    ],
  },
  {
    title: 'Privacy and Personal Data',
    paragraphs: [
      'The SPARK Repository adheres to the provisions of the Data Privacy Act of 2012 and relevant institutional policies. Care is taken to ensure that only necessary personal information is included as part of the scholarly record.',
      'Contributors are responsible for ensuring that sensitive or unnecessary personal data is removed or properly redacted prior to submission.',
    ],
  },
  {
    title: 'Preservation and Integrity',
    paragraphs: [
      'To maintain the long-term accessibility and reliability of digital materials, the SPARK Repository implements preservation measures such as metadata management, file integrity checks (e.g., checksums), and controlled record maintenance.',
      'These measures support sustainability but do not constitute formal archival certification unless explicitly declared by the institution.',
    ],
  },
  {
    title: 'Corrections, Takedown, and Review',
    title: 'Take-Down Policy',
    paragraphs: [
      'Requests for metadata updates, access modifications, or removal of materials are evaluated individually, taking into account institutional policies, legal obligations, and records management requirements.',
      'The SPARK Repository retains the authority to limit, revise, or remove access to any content that is found to be unauthorized, inaccurate, unlawful, or non-compliant with repository policies.',
    ],
  },
]

const etPolicySections: PolicySection[] = [
  {
    title: 'Deposit Requirements',
    paragraphs: [
      'Theses submitted to the SPARK Repository must be in their final, officially approved form and cleared for inclusion in the institutional repository. Only versions authorized by the appropriate academic units will be accepted for deposit.',
      'Submitters are required to provide complete and accurate metadata, including the final title, author(s), academic department, adviser details, abstract, keywords, and any approved access or rights conditions associated with the work.',
    ],
  },
  {
    title: 'Author Identifiers and Rights',
    paragraphs: [
      'Contributors are encouraged to include unique author identifiers, such as ORCID, to enhance proper attribution and improve interoperability across research systems.',
      'All rights declarations and licensing options must accurately reflect the permissions granted by both the author and the institution at the time of submission.',
    title: 'Access',
    paragraphs: [
      'ETs may be open access or restricted to University members depending on approvals and policy requirements.',
      'Metadata remains visible even when full text access is restricted unless otherwise required by policy.',
    ],
  },
  {
    title: 'Access Controls',
    paragraphs: [
      'Theses within the SPARK Repository may be designated for open access or limited institutional access, depending on approved conditions.',
    ],
  },
  {
    title: 'Preservation Copy',
    paragraphs: [
      'The SPARK Repository maintains deposited theses and their corresponding metadata. These materials are preserved to support long-term access, reference, and institutional documentation.',
    ],
  },
  {
    title: 'Corrections and Withdrawals',
    paragraphs: [
      'Requests involving metadata updates, changes in access permissions, or removal of content are subject to review under established repository procedures. Such requests must be supported by valid institutional approval or legal grounds.',
    ],
  },
]

const relatedPolicyLinks = [
  { label: 'Privacy Policy', href: '/privacy-policy' },
  { label: 'Acceptable Use Policy', href: '/acceptable-use-policy' },
  { label: 'Electronic Thesis Policies', href: '/policies?policy=et' },
]

const etRelatedLinks = [
  { label: 'Privacy Policy', href: '/privacy-policy' },
  { label: 'Acceptable Use Policy', href: '/acceptable-use-policy' },
  { label: 'Institutional Repository Policies', href: '/policies?policy=ir' },
]

function PolicyBlock({ title, paragraphs, subsections }: Readonly<PolicySection>) {
  return (
    <section className="space-y-1.5">
      <TypographyH2>{title}</TypographyH2>

      {paragraphs?.map((paragraph) => (
        <TypographyP key={paragraph.slice(0, 40)} className="text-[11px] leading-[17px]">
          {paragraph}
        </TypographyP>
      ))}

      {subsections?.map((subsection) => (
        <div key={subsection.title} className="pl-[20px] pt-0.5 space-y-1">
          <TypographyH3>{subsection.title}</TypographyH3>
          {subsection.paragraphs.map((paragraph) => (
            <TypographyP key={paragraph.slice(0, 40)} className="text-[11px] leading-[17px]">
              {paragraph}
            </TypographyP>
          ))}
        </div>
      ))}
    </section>
  )
}

interface PoliciesDocumentProps {
  activePolicy: PolicyKey
}

export default function PoliciesDocument({ activePolicy }: Readonly<PoliciesDocumentProps>) {
  const isInstitutionalPolicy = activePolicy === 'ir'
  const sections = isInstitutionalPolicy ? policySections : etPolicySections
  const links = isInstitutionalPolicy ? relatedPolicyLinks : etRelatedLinks
  const tabBaseClass = 'relative h-[38px] px-4 border border-[#d8d8d8] border-b-0 border-t-[2px] font-body text-[11px] leading-[20px] inline-flex items-center whitespace-nowrap'
  const activeTabClass = 'bg-bg-grey text-cics-red border-t-cics-red -mb-px z-20'
  const inactiveTabClass = 'bg-[#efefef] text-[#7a7a7a] border-t-transparent hover:text-cics-red/80'

  return (
    <section className="w-full max-w-none">
      <div className="flex items-end">
        <Link
          href="/policies?policy=ir"
          className={`${tabBaseClass} border-r-0 ${isInstitutionalPolicy ? activeTabClass : inactiveTabClass}`}
        >
          Institutional Repository Policies
        </Link>
        <Link
          href="/policies?policy=et"
          className={`${tabBaseClass} ${isInstitutionalPolicy ? inactiveTabClass : activeTabClass}`}
        >
          Electronic Thesis Policies
        </Link>
      </div>

      <div className="border border-[#d9d9d9] bg-bg-grey px-[24px] py-[22px] space-y-3">
        {sections.map((section) => (
          <PolicyBlock
            key={section.title}
            title={section.title}
            paragraphs={section.paragraphs}
            subsections={section.subsections}
          />
        ))}

        <section className="space-y-2">
          <TypographyH2>Related Policy Information</TypographyH2>
          <div className="pl-[20px] space-y-0.5">
            {links.map((link) => (
              <Link key={link.label} href={link.href} className="block font-body text-[11px] leading-[18px] text-[#337AB7] hover:underline">
                {link.label}
              </Link>
            ))}
          </div>
        </section>
      </div>
    </section>
  )
}
