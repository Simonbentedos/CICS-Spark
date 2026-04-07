export default function AdminLoading() {
  return (
    <div className="min-h-screen bg-bg-grey p-6">
      <div className="h-8 w-56 animate-pulse rounded bg-grey-200" />
      <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <div className="h-24 animate-pulse rounded bg-grey-100" />
        <div className="h-24 animate-pulse rounded bg-grey-100" />
        <div className="h-24 animate-pulse rounded bg-grey-100" />
        <div className="h-24 animate-pulse rounded bg-grey-100" />
      </div>
      <div className="mt-4 h-64 animate-pulse rounded bg-grey-100" />
    </div>
  )
}
