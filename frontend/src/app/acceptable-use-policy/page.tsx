import Link from 'next/link'
import { CICSFooter, CICSHeader, SecondaryNav, Sidebar } from '@/components/layout'
import { TypographyH2, TypographyP, Separator } from '@/components/ui'

const aupSections = [
  {
    title: '1. Purpose',
    paragraphs: [
      'This Acceptable Use Policy (AUP) outlines the rules and responsibilities governing access to and use of the SPARK Repository, the institutional digital archive of the College of Information and Computing Sciences at the University of Santo Tomas.',
      'By accessing or using the repository, all users acknowledge and agree to comply with the provisions stated in this policy.',
    ],
  },
  {
    title: '2. Authorized Users',
    paragraphs: ['Access to the SPARK Repository is available to:'],
    bullets: [
      'Students, faculty, and staff of the University of Santo Tomas',
      'Researchers, scholars, and members of the public engaged in academic or educational activities',
      'Institutional collaborators and affiliated organizations',
    ],
    postParagraphs: ['Administrative access is limited strictly to authorized repository personnel.'],
  },
  {
    title: '3. Permitted Uses',
    paragraphs: ['The repository may be used for the following legitimate purposes:'],
    bullets: [
      'Academic research, study, and teaching',
      'Proper citation and referencing in scholarly and educational work',
      'Downloading materials for personal, non-commercial academic use',
      'Browsing, searching, and exploring repository collections',
    ],
  },
  {
    title: '4. Prohibited Uses',
    paragraphs: ['Users are strictly prohibited from engaging in the following activities:'],
    bullets: [
      'Reproducing, distributing, or using repository content for commercial purposes without proper authorization',
      'Engaging in bulk or automated downloading of repository materials',
      'Using repository content in a manner that violates intellectual property rights',
      'Submitting false, misleading, or plagiarized materials',
      'Attempting to access restricted or administrative areas without authorization',
      'Disrupting or interfering with the normal operation and availability of the repository',
    ],
  },
  {
    title: '5. Intellectual Property',
    paragraphs: [
      'All materials hosted in the SPARK Repository remain the intellectual property of their respective authors or rights holders, unless otherwise specified by formal agreement.',
      'Users must respect all applicable copyright laws, licensing terms, and usage restrictions associated with each item. Materials may only be used within the scope of permitted academic and non-commercial purposes, unless explicit permission has been granted for broader use.',
      'Where applicable, licenses such as Creative Commons may define how content can be reused. In the absence of a stated license, users are responsible for obtaining permission from the rights holder before reproducing or distributing the material beyond fair use or similar legal exceptions.',
    ],
  },
  {
    title: '6. Submission Standards',
    paragraphs: [
      'Authors and contributors are responsible for ensuring that all submitted materials comply with institutional policies and do not infringe upon third-party rights. Submissions must adhere to the established Electronic Thesis Submission (ETS) Guidelines and Institutional Repository policies.',
      'The SPARK Repository reserves the right to remove or restrict access to content that violates these standards without prior notice.',
    ],
  },
  {
    title: '7. Privacy',
    paragraphs: [
      'User interactions with the SPARK Repository may be logged for system security, monitoring, and analytical purposes. Repository administrators must ensure that unnecessary personal data is not exposed through publicly accessible interfaces.',
      <>
        For more information, users are advised to refer to the official{' '}
        <Link href="/privacy-policy" className="text-cics-maroon hover:underline">
          Privacy Policy
        </Link>
        .
      </>,
    ],
  },
  {
    title: '8. Violations and Enforcement',
    paragraphs: [
      'Failure to comply with this policy may result in actions such as suspension of repository access, removal of submitted materials, and referral to appropriate University disciplinary processes.',
      'The College of Information and Computing Sciences Library reserves the authority to enforce this policy and adjust access privileges when necessary.',
    ],
  },
  {
    title: '9. Contact',
    paragraphs: [
      'For inquiries regarding this policy or to report violations, please contact the College of Information and Computing Sciences Administrators and Staffs, Saint Pier Giorgio Frassati, O.P. Building, University of Santo Tomas, Espana Boulevard, Sampaloc, Manila.',
    ],
  },
]

export default function AcceptableUsePolicyPage() {
  return (
    <div className="min-h-screen bg-bg-grey flex flex-col">
      <CICSHeader />
      <SecondaryNav
        title="Acceptable Use Policy"
        breadcrumbItems={[{ label: 'Home', href: '/' }, { label: 'Acceptable Use Policy' }]}
      />

      <div className="flex flex-1 px-8 lg:px-[15%] xl:px-[18%] 2xl:px-[22%] gap-12">
        <Sidebar />
        <main className="flex-1 min-w-0 pt-7 pb-12">
          <h1 className="font-heading text-[26px] font-bold text-[#444] mb-8 uppercase tracking-tight">
            Acceptable Use Policy
          </h1>

          <div className="space-y-12">
            {aupSections.map((section) => (
              <section key={section.title} className="space-y-6">
                <div className="space-y-2">
                  <TypographyH2 className="text-[17px] font-bold text-[#333] border-none">{section.title}</TypographyH2>
                  <Separator className="bg-[#e5e5e5]" />
                </div>

                <div className="space-y-4">
                  {section.paragraphs?.map((para, i) => (
                    <TypographyP key={i} className="text-[13px] leading-[22px] text-[#555]">
                      {para}
                    </TypographyP>
                  ))}

                  {section.bullets && (
                    <ul className="space-y-2 pl-2">
                      {section.bullets.map((bullet, i) => (
                        <li key={i} className="flex items-start gap-2 text-[13px] leading-[22px] text-[#555]">
                          <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-cics-maroon" />
                          <span>{bullet}</span>
                        </li>
                      ))}
                    </ul>
                  )}

                  {section.postParagraphs?.map((para, i) => (
                    <TypographyP key={i} className="text-[13px] leading-[22px] text-[#555]">
                      {para}
                    </TypographyP>
                  ))}
                </div>
              </section>
            ))}
          </div>
        </main>
      </div>

      <CICSFooter />
    </div>
  )
}