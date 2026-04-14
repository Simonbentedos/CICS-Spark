import { CICSFooter, CICSHeader, SecondaryNav } from '@/components/layout'
import dynamic from 'next/dynamic'

const AdvancedSearchPanel = dynamic(() => import('@/components/search/AdvancedSearchPanel'), {
  loading: () => (
    <div className="px-8 lg:px-[300px] py-8">
      <div className="h-10 w-64 animate-pulse rounded bg-grey-200" />
      <div className="mt-4 h-48 animate-pulse rounded bg-grey-100" />
    </div>
  ),
})

type SearchPageProps = {
  searchParams?: Promise<{ q?: string; from?: string; to?: string }>
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const resolvedParams = await searchParams
  const initialQuery = typeof resolvedParams?.q === 'string' ? resolvedParams.q : ''
  const initialFromDate = typeof resolvedParams?.from === 'string' ? resolvedParams.from : ''
  const initialToDate = typeof resolvedParams?.to === 'string' ? resolvedParams.to : ''

  return (
    <div className="min-h-screen bg-bg-grey flex flex-col">
      <CICSHeader />

      <SecondaryNav
        title="SEARCH"
        breadcrumbItems={[
          { label: 'Home', href: '/' },
          { label: 'Search Result' },
        ]}
      />

      <main className="flex-1">
        <AdvancedSearchPanel
          initialQuery={initialQuery}
          initialFromDate={initialFromDate}
          initialToDate={initialToDate}
        />
      </main>

      <CICSFooter />
    </div>
  )
}
