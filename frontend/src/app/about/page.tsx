import { CICSFooter, CICSHeader, SecondaryNav, Sidebar } from '@/components/layout'

interface SimpleInfoPageProps {
  title: string
  description: string
  body: string[]
}

function SimpleInfoPage({ title, description, body }: Readonly<SimpleInfoPageProps>) {
  return (
    <div className="min-h-screen bg-bg-grey flex flex-col">
      <CICSHeader />
      <SecondaryNav title={title} breadcrumbItems={[{ label: 'Home', href: '/' }, { label: title }]} />

      <div className="flex flex-1 px-8 lg:px-[300px] gap-6">
        <Sidebar />
        <main className="flex-1 min-w-0 pt-7 pb-8">
          <h1 className="font-heading text-[30px] text-[#555] mb-3">{title}</h1>
          <p className="font-body text-[14px] text-[#555] mb-5">{description}</p>
          <div className="space-y-3">
            {body.map((line) => (
              <p key={line} className="font-body text-[14px] leading-[26px] text-[#555]">{line}</p>
            ))}
          </div>
        </main>
      </div>

      <CICSFooter />
    </div>
  )
}

export default function AboutPage() {
  return (
    <SimpleInfoPage
      title="About Us"
      description="Overview of the SPARK Repository and its purpose."
      body={[
        'SPARK (System for Preserving Academic Research and Knowledge) is the official repository for theses and capstone outputs of the College of Information and Computing Sciences.',
        'The platform preserves institutional research and improves discoverability through curated metadata, searchable collections, and structured submission workflows.',
      ]}
    />
  )
}
