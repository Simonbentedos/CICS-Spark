import { Filter } from 'lucide-react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui'
import type { SubmissionStatus } from '@/types/admin'

type AdminSubmissionFiltersProps = {
  department: string
  onDepartmentChange: (value: string) => void
  status: string
  onStatusChange: (value: string) => void
  sortOrder: string
  onSortOrderChange: (value: string) => void
  departments: string[]
  statuses: readonly SubmissionStatus[]
}

export default function AdminSubmissionFilters({
  department,
  onDepartmentChange,
  status,
  onStatusChange,
  sortOrder,
  onSortOrderChange,
  departments,
  statuses,
}: Readonly<AdminSubmissionFiltersProps>) {
  return (
    <>
      <div className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-grey-200 bg-white text-grey-500">
        <Filter className="h-4 w-4" aria-hidden="true" />
      </div>

      <Select value={department} onValueChange={onDepartmentChange}>
        <SelectTrigger className="h-10 w-[170px] border-grey-200 bg-white text-xs focus-visible:ring-2 focus-visible:ring-cics-maroon focus-visible:ring-offset-1" aria-label="Filter by department">
          <SelectValue placeholder="All Departments" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all-departments">All Departments</SelectItem>
          {departments.map((item) => (
            <SelectItem key={item} value={item}>{item}</SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={status} onValueChange={onStatusChange}>
        <SelectTrigger className="h-10 w-[145px] border-grey-200 bg-white text-xs focus-visible:ring-2 focus-visible:ring-cics-maroon focus-visible:ring-offset-1" aria-label="Filter by status">
          <SelectValue placeholder="All Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all-status">All Status</SelectItem>
          {statuses.map((item) => (
            <SelectItem key={item} value={item}>{item}</SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={sortOrder} onValueChange={onSortOrderChange}>
        <SelectTrigger className="h-10 w-[150px] border-grey-200 bg-white text-xs focus-visible:ring-2 focus-visible:ring-cics-maroon focus-visible:ring-offset-1" aria-label="Sort submissions by date">
          <SelectValue placeholder="Date: Descending" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="date-desc">Date: Descending</SelectItem>
          <SelectItem value="date-asc">Date: Ascending</SelectItem>
        </SelectContent>
      </Select>
    </>
  )
}