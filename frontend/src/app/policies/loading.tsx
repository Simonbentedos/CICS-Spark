export default function PoliciesLoading() {
  return (
    <div className="min-h-screen bg-bg-grey flex flex-col">
      <div className="h-4 bg-cics-maroon w-full" />
      <div className="px-8 lg:px-[300px] py-8">
        <div className="h-8 w-72 animate-pulse rounded bg-grey-200" />
        <div className="mt-4 h-24 animate-pulse rounded bg-grey-100" />
        <div className="mt-3 h-24 animate-pulse rounded bg-grey-100" />
        <div className="mt-3 h-24 animate-pulse rounded bg-grey-100" />
      </div>
    </div>
  )
}
