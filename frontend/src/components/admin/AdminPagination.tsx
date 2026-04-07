import { cn } from '@/lib/utils'

type AdminPaginationProps = {
  page: number
  totalPages: number
  onPageChange: (nextPage: number) => void
  leftText: string
  rightContent?: React.ReactNode
  className?: string
  maxVisiblePages?: number
}

function getPageWindow(page: number, totalPages: number, maxVisiblePages: number) {
  if (totalPages <= maxVisiblePages) {
    return Array.from({ length: totalPages }).map((_, index) => index + 1)
  }

  const half = Math.floor(maxVisiblePages / 2)
  let start = Math.max(1, page - half)
  let end = Math.min(totalPages, start + maxVisiblePages - 1)

  if (end - start + 1 < maxVisiblePages) {
    start = Math.max(1, end - maxVisiblePages + 1)
  }

  return Array.from({ length: end - start + 1 }).map((_, index) => start + index)
}

export default function AdminPagination({
  page,
  totalPages,
  onPageChange,
  leftText,
  rightContent,
  className,
  maxVisiblePages = 5,
}: Readonly<AdminPaginationProps>) {
  const safeTotalPages = Math.max(1, totalPages)
  const safePage = Math.min(Math.max(page, 1), safeTotalPages)
  const pageNumbers = getPageWindow(safePage, safeTotalPages, maxVisiblePages)

  return (
    <div className={cn('flex items-center justify-between', className)}>
      <p className="text-xs text-grey-500">{leftText}</p>
      <div className="flex items-center gap-3">
        {rightContent}
        <div className="flex items-center gap-1 text-xs">
          <button
            type="button"
            disabled={safePage <= 1}
            onClick={() => onPageChange(Math.max(1, safePage - 1))}
            aria-label="Go to previous page"
            className="h-6 w-6 rounded border border-grey-200 text-grey-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cics-maroon focus-visible:ring-offset-1 disabled:opacity-40"
          >
            ‹
          </button>

          {pageNumbers.map((pageNumber) => {
            const active = safePage === pageNumber

            return (
              <button
                key={pageNumber}
                type="button"
                onClick={() => onPageChange(pageNumber)}
                aria-label={`Go to page ${pageNumber}`}
                aria-current={active ? 'page' : undefined}
                className={
                  active
                    ? 'h-6 w-6 rounded bg-cics-maroon text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cics-maroon focus-visible:ring-offset-1'
                    : 'h-6 w-6 rounded border border-grey-200 text-grey-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cics-maroon focus-visible:ring-offset-1'
                }
              >
                {pageNumber}
              </button>
            )
          })}

          <button
            type="button"
            disabled={safePage >= safeTotalPages}
            onClick={() => onPageChange(Math.min(safeTotalPages, safePage + 1))}
            aria-label="Go to next page"
            className="h-6 w-6 rounded border border-grey-200 text-grey-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cics-maroon focus-visible:ring-offset-1 disabled:opacity-40"
          >
            ›
          </button>
        </div>
      </div>
    </div>
  )
}