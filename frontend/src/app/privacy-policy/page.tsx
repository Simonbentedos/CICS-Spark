import { CICSFooter, CICSHeader, SecondaryNav, Sidebar } from '@/components/layout'
import { TypographyH2, TypographyH3, TypographyP, Separator } from '@/components/ui'

const privacyPolicySections = [
  {
    title: '1. Introduction',
    paragraphs: [
      'The SPARK Repository is maintained by the College of Information and Computing Sciences Administrators and Staffs of the University of Santo Tomas. This Privacy Policy outlines how information is collected, used, and protected when users access or interact with the repository.',
      'It explains the types of data processed, the purposes for which data is used, retention practices, and the available channels for inquiries or data subject requests.',
    ],
  },
  {
    title: '2. Information We Collect',
    subsections: [
      {
        title: '2.1 Information from Submitters',
        paragraphs: [
          'Authorized users submitting content through the administrative portal are required to provide relevant details, such as:',
        ],
        bullets: [
          'Author names, institutional affiliations, and contact email addresses',
          'Metadata describing the work (e.g., title, abstract, keywords, department)',
          'Uploaded files (e.g., thesis documents in PDF format)',
        ],
        postParagraphs: [
          'Author names and affiliations form part of the publicly accessible record. Email addresses are collected strictly for administrative communication and are not made publicly visible.',
        ],
      },
    ],
  },
  {
    title: '3. Use of Information',
    paragraphs: [
      'Information collected by the SPARK Repository is used for the following purposes:',
    ],
    bullets: [
      'To present repository content and associated metadata',
      'To manage and maintain repository operations',
      'To produce anonymized usage statistics for institutional analysis',
      'To handle submissions and related communications',
      'To meet legal, regulatory, or institutional requirements',
    ],
    postParagraphs: [
      'Personal data is not sold, rented, or disclosed to third parties for commercial use. Processing activities are carried out in support of academic dissemination, records management, system security, and other legitimate institutional functions.',
    ],
  },
  {
    title: '4. Data Retention',
    paragraphs: [
      'Repository records, including metadata and full-text documents, may be preserved as part of the University’s scholarly archive. Audit logs are typically stored indefinitely.',
    ],
  },
  {
    title: '5. Third-Party Services',
    paragraphs: [
      'The SPARK Repository relies on Supabase as its backend service provider. Data is stored and processed on infrastructure managed by Supabase, Inc., in accordance with established data processing agreements.',
      'The repository also utilizes the following external services for communications and interoperability:',
    ],
    bullets: [
      'HTTP API: Handles transactional email services.',
      'OAI-PMH Harvesters: Enables external platforms such as Google Scholar, library catalogs, and academic aggregators to discover and index repository metadata via standard protocols.',
    ],
    postParagraphs: [
      'No third-party analytics services involving cross-site tracking are implemented.',
    ],
  },
  {
    title: '6. Securities and Policies',
    paragraphs: [
      'Appropriate technical and administrative safeguards are in place to protect information against unauthorized access, alteration, or disclosure. Access to administrative functions is limited to authorized personnel through secure authentication mechanisms.',
      'Authors may request updates to metadata or adjustments to access settings by coordinating with the College of Information and Computing Sciences Administrators and Staffs.',
    ],
  },
  {
    title: '7. Policy Updates',
    paragraphs: [
      'This Privacy Policy may be revised periodically to reflect changes in practices or requirements. The most recent version is indicated by the revision date provided in the document.',
    ],
  },
  {
    title: '8. Contact Information',
    paragraphs: [
      'For questions or concerns regarding this Privacy Policy, please contact the College of Information and Computing Sciences Administrators and Staffs. The CICS Office is located at the 2nd floor of the Saint Pier Giorgio Frassati, O.P. Building, University of Santo Tomas, Espana Boulevard, Sampaloc, Manila.',
    ],
  },
]

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-bg-grey flex flex-col">
      <CICSHeader />
      <SecondaryNav title="Privacy Policy" breadcrumbItems={[{ label: 'Home', href: '/' }, { label: 'Privacy Policy' }]} />

      <div className="flex flex-1 px-8 lg:px-[15%] xl:px-[18%] 2xl:px-[22%] gap-12">
        <Sidebar />
        <main className="flex-1 min-w-0 pt-7 pb-12">
          <h1 className="font-heading text-[26px] font-bold text-[#444] mb-8 uppercase tracking-tight">Privacy Policy</h1>
          
          <div className="space-y-12">
            {privacyPolicySections.map((section) => (
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
                          <span className="text-cics-maroon mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-cics-maroon" />
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

                {section.subsections?.map((sub) => (
                  <div key={sub.title} className="space-y-4 pt-2">
                    <TypographyH3 className="text-[16px] font-bold text-[#333]">{sub.title}</TypographyH3>
                    
                    <div className="space-y-4">
                      {sub.paragraphs.map((para, i) => (
                        <TypographyP key={i} className="text-[13px] leading-[22px] text-[#555]">
                          {para}
                        </TypographyP>
                      ))}

                      {sub.bullets && (
                        <ul className="space-y-2 pl-2">
                          {sub.bullets.map((bullet, i) => (
                            <li key={i} className="flex items-start gap-2 text-[13px] leading-[22px] text-[#555]">
                              <span className="text-cics-maroon mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-cics-maroon" />
                              <span>{bullet}</span>
                            </li>
                          ))}
                        </ul>
                      )}

                      {sub.postParagraphs?.map((para, i) => (
                        <TypographyP key={i} className="text-[13px] leading-[22px] text-[#555]">
                          {para}
                        </TypographyP>
                      ))}
                    </div>
                  </div>
                ))}
              </section>
            ))}
          </div>
        </main>
      </div>

      <CICSFooter />
    </div>
  )
}

