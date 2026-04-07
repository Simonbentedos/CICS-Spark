import { Search } from 'lucide-react'
import { Input } from '@/components/ui'
import { cn } from '@/lib/utils'

type AdminFilterBarProps = {
  searchValue: string
  onSearchChange: (value: string) => void
  searchPlaceholder?: string
  controls?: React.ReactNode
  className?: string
  inputClassName?: string
}

export default function AdminFilterBar({
  searchValue,
  onSearchChange,
  searchPlaceholder = 'Search...',
  controls,
  className,
  inputClassName,
}: Readonly<AdminFilterBarProps>) {
  return (
    <div className={cn('flex flex-col gap-3 xl:flex-row xl:items-center', className)}>
      <div className="relative flex-1">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-grey-400" />
        <Input
          value={searchValue}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder={searchPlaceholder}
          className={cn('h-10 border-grey-200 bg-white pl-9', inputClassName)}
          aria-label={searchPlaceholder}
        />
      </div>

      {controls ? <div className="flex flex-wrap items-center gap-2">{controls}</div> : null}
    </div>
  )
}