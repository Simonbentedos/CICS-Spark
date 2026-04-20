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
    title: 'Overview',
    subsections: [
      {
        title: '1.1. Background',
        paragraphs: [
          'The first incarnation of the Institutional Repository (IR) of the University of the Philippines Diliman began in 2011 as a response to the call of the ASEAN University Network Inter-Library Online (AUNILO) to have an interconnected network of library resources across all members of the ASEAN University Network. In 2014, the IR was revived by the Computer Services Section, in cooperation with the University Archives, from where the bulk of its materials came from. In April 2016, during a public symposium sponsored by the Office of the Vice Chancellor for Academic Affairs, the IR was officially launched to the public, with the intention of receiving submissions from the University by the start of AY 2016-17. The IR is officially named Digital Archives@UP Diliman, or DA@UPD for short.',
        ],
      },
      {
        title: '1.2. Administration',
        paragraphs: [
          'The University Library is tasked with the management and maintenance of the IR. While functional and administrative policies may be decided by the University Library, higher level decisions with wider scope and impact may be decided by the OVCAA.',
        ],
      },
    ],
  },
  {
    title: 'Mission Statement',
    paragraphs: [
      'DA@UPD is the official Institutional Repository of the University of the Philippines Diliman and as the flagship campus, it is also in charge of the permanent records of the offices of the UP System. It identifies, acquires, maintains, preserves, and allows access to the digital institutional records and memory of the University. These include materials that were created, circulated, used, and received by the legitimate members of the University, academic and administrative units, and notable alumni with significant contributions to their disciplines.',
    ],
  },
  {
    title: 'Authority',
    paragraphs: [
      'DA@UPD is an initiative of the University Archives. The University Archives is mandated to collect and maintain archival materials that reflect the growth and development of the University through Executive Order No. 13, signed on 7 June 1974.',
    ],
  },
  {
    title: 'Collection Development Statement',
    paragraphs: [
      'The Collection Development Statement of DA@UPD is rooted in the principles of the Collection Development Policy of the University Library. Materials in the IR reflect the growth and development of the University, and are permanent/archival in nature.',
    ],
  },
  {
    title: 'Content Policy',
    paragraphs: [
      'DA@UPD contains the following materials in digital format:',
      'Electronic Theses (ETs); UPIANA/UP Publications from UP units and offices; special and regular publications; faculty and REPS publications; permanent UP records; and personal papers of faculty, executives, officials and alumni with significant contributions.',
    ],
  },
  {
    title: 'Acquisition Statement',
    paragraphs: [
      "DA@UPD shall acquire content aligned with the University Library's and University Archives' collection development policy through direct submission, harvesting, transfer, donation, gift, licensing agreement, or purchase.",
    ],
    subsections: [
      {
        title: '7.1. Statement on Access',
        paragraphs: [
          'All materials submitted to DA@UPD are made available in the website to bonafide members of the UP Community in support of education, research and extension. Restricted submissions are accepted only as dictated by University policies.',
        ],
      },
      {
        title: '7.2. Individual Privacy',
        paragraphs: [
          'The University does not collect nor divulge personal information and respects the privacy of all authors and submissions to the IR. Contributors are advised to redact sensitive personal or private information.',
        ],
      },
      {
        title: '7.3. Restriction of Content',
        paragraphs: [
          'Administrators reserve the right to restrict access to items or collections where noted. Otherwise, materials submitted to the IR are accessible and open to the UP Community.',
        ],
      },
    ],
  },
  {
    title: 'Intellectual Property Policy',
    paragraphs: [
      'Copyright/Intellectual Property of submissions to DA@UPD remain with the creators, unless otherwise stated. DA@UPD subscribes and upholds governing Intellectual Property laws of the Philippines and the University.',
    ],
  },
  {
    title: 'Roles and Responsibilities',
    paragraphs: ['Below are the key players necessary for the long-term viability and success of DA@UPD:'],
    subsections: [
      {
        title: '9.1. Contributor / Content Creator',
        paragraphs: [
          'Students, faculty members, staff, alumni, and academic/non-academic units may contribute content to the IR, provided submissions meet Collection Development Policy criteria.',
        ],
      },
      {
        title: '9.2. Library Committee on Institutional Repository',
        paragraphs: [
          'The committee searches, identifies, and acquires key collections and adopts best practices and standards for repository management.',
        ],
      },
      {
        title: '9.3. University Library',
        paragraphs: [
          'The University Library provides managerial and technical expertise, daily monitoring, policy implementation, and long-term sustainability support.',
        ],
      },
      {
        title: '9.4. Office of the Vice Chancellor for Academic Affairs',
        paragraphs: [
          'OVCAA oversees smooth implementation of DA@UPD across the University.',
        ],
      },
      {
        title: '9.5. University of the Philippines Administration',
        paragraphs: [
          'The University provides materials, commitment, and resources to ensure long-term program viability.',
        ],
      },
    ],
  },
  {
    title: 'Licensing Statement',
    paragraphs: ['Licensing of submitted materials to DA@UPD is the responsibility of the creator.'],
  },
  {
    title: 'Commercial Use of Works',
    paragraphs: [
      'Requests for commercial use are subject to existing laws and policies and must be obtained from the University prior to commercial application and reproduction.',
    ],
  },
  {
    title: 'Security Statement',
    paragraphs: [
      'The University Library employs applicable technology and security measures to protect content and contributor privacy.',
    ],
  },
  {
    title: 'Citation/Linking Policy',
    paragraphs: [
      'Citation and linking of any material in DA@UPD is permissible and is the sole responsibility of the user. Permanent links are provided for continued access.',
    ],
  },
  {
    title: 'Liability Policy',
    paragraphs: [
      'The University reserves the right to restrict or remove access to submissions that violate University policies or laws and disclaims responsibility for improper/illegal use of submissions.',
    ],
  },
  {
    title: 'Arrangement/Description Policy',
    paragraphs: [
      'Arrangement and description of materials are according to accepted international archiving and digital preservation standards to facilitate research and interoperability.',
    ],
  },
  {
    title: 'Submission Policy',
    paragraphs: [
      'DA@UPD accepts submissions in digital or converted works from bona fide members and offices of the UP Community under prescribed requirements and procedures.',
    ],
  },
  {
    title: 'Contributor Policy',
    paragraphs: [
      'DA@UPD accepts submissions from students, staff, faculty and alumni. Academic and administrative units are encouraged to submit permanent records to the IR.',
    ],
  },
  {
    title: 'Take-Down Policy',
    paragraphs: [
      'DA@UPD reserves the right to remove submissions and materials subject to proper procedures and valid requests processed case-by-case.',
    ],
  },
  {
    title: 'Deposit Policy',
    paragraphs: [
      'Materials submitted to DA@UPD reflect the intellectual output and development of the University; DA@UPD does not accept short-term deposits.',
    ],
  },
  {
    title: 'Preservation Policy',
    paragraphs: [
      'The University Library commits to planning, maintenance, management and long-term preservation of all digital materials submitted to the IR.',
    ],
  },
  {
    title: 'Privacy Policy',
    paragraphs: [
      'The University Library is committed to protecting privacy of users and authors/content providers and adheres to the Data Privacy Act and applicable UP System policies.',
    ],
  },
  {
    title: 'Succession Policy',
    paragraphs: [
      'In the event that the University Library ceases to exist, all content in DA@UPD will remain with the University in perpetua.',
    ],
  },
  {
    title: 'Documentation and Amendment Statement',
    paragraphs: [
      'This policy is a permanent record and subsequent amendments should be noted accordingly. It is reviewed every three years and amended as needed.',
    ],
  },
]

const etPolicySections: PolicySection[] = [
  {
    title: 'Overview',
    paragraphs: [
      'Electronic Theses (ETs) in the repository are governed by submission, access, and preservation rules set by the University. These policies support discoverability while respecting restrictions required by academic and legal guidelines.',
    ],
  },
  {
    title: 'Submission Requirements',
    paragraphs: [
      'Only final, approved ET versions are accepted for repository submission. Files must include complete metadata, approved title page information, and required endorsements from the submitting academic unit.',
      'Students and submitting offices are responsible for ensuring that ET content is complete, accurate, and compliant with existing intellectual property and ethics guidelines.',
    ],
  },
  {
    title: 'Access',
    paragraphs: [
      'ETs may be open access or restricted to University members depending on approvals and policy requirements.',
      'Metadata remains visible even when full text access is restricted unless otherwise required by policy.',
    ],
  },
  {
    title: 'Copyright and Reuse',
    paragraphs: [
      'Copyright remains with the author unless rights are otherwise assigned. Any reuse, reproduction, or commercial use must comply with applicable laws and institutional rules.',
    ],
  },
  {
    title: 'Retention and Preservation',
    paragraphs: [
      'Accepted ETs are preserved as part of the permanent scholarly record. The repository implements preservation actions and system controls for long-term usability and integrity of digital files.',
    ],
  },
  {
    title: 'Corrections and Take-Down Requests',
    paragraphs: [
      'Requests to correct metadata or restrict/remove ET access are evaluated case-by-case under established University procedures and legal obligations.',
    ],
  },
]

const relatedPolicyLinks = [
  'Collection Development Policy',
  'Electronic Thesis Policy',
  'Revised Policy on Access to Theses (2017)',
  'Public Access to Theses (OVCRD Website)',
  'UP President Alfredo E. Pascual (Memorandum No. PAEP 2012-03)',
  'Office of the Vice-Chancellor for Research and Development (Memorandum No. BMP 12-011)',
  'Office of the Vice-Chancellor for Research and Development (Memorandum No. FRN 15-038)',
]

const etRelatedLinks = [
  'Electronic Thesis Policy',
  'Revised Policy on Access to Theses (2017)',
  'Public Access to Theses (OVCRD Website)',
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
            {links.map((label) => (
              <Link key={label} href="#" className="block font-body text-[11px] leading-[18px] text-[#337AB7] hover:underline">
                {label}
              </Link>
            ))}
          </div>
        </section>
      </div>
    </section>
  )
}
