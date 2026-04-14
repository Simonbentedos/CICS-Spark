import { CICSFooter, CICSHeader, SecondaryNav, Sidebar } from '@/components/layout'
import dynamic from 'next/dynamic'

const PoliciesDocument = dynamic(() => import('@/components/policies/PoliciesDocument'), {
  loading: () => (
    <div className="space-y-3">
      <div className="h-8 w-80 animate-pulse rounded bg-grey-200" />
      <div className="h-24 animate-pulse rounded bg-grey-100" />
      <div className="h-24 animate-pulse rounded bg-grey-100" />
    </div>
  ),
})

interface PoliciesPageProps {
  searchParams?: Promise<{ policy?: string }>
}

export default async function PoliciesPage({ searchParams }: Readonly<PoliciesPageProps>) {
  const resolvedParams = await searchParams
  const activePolicy = resolvedParams?.policy === 'et' ? 'et' : 'ir'

  return (
    <div className="min-h-screen bg-bg-grey flex flex-col">
      <CICSHeader />

      <SecondaryNav
        title="IR AND ET POLICIES"
        breadcrumbItems={[
          { label: 'Home', href: '/' },
          { label: 'IR and ET Policies' },
        ]}
      />

      <div className="flex flex-1 px-8 lg:px-[300px] gap-6">
        <Sidebar />

        <main className="flex-1 min-w-0 pt-7 pb-[60px]">
          <div className="h-[30px]" />
          <PoliciesDocument activePolicy={activePolicy} />
        </main>
      </div>

      <CICSFooter />
    </div>
  )
}
