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
  searchParams?: {
    q?: string
    from?: string
    to?: string
  }
}

export default function SearchPage({ searchParams }: SearchPageProps) {
  const initialQuery = typeof searchParams?.q === 'string' ? searchParams.q : ''
  const initialFromDate = typeof searchParams?.from === 'string' ? searchParams.from : ''
  const initialToDate = typeof searchParams?.to === 'string' ? searchParams.to : ''

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
