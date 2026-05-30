import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import type { ReportDateRange } from '@/types/admin'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export * from './utils/admin-data'

export function getAcademicYearOptions(): { value: ReportDateRange; label: string }[] {
  const now = new Date()
  const currentAyStart = now.getMonth() >= 7 ? now.getFullYear() : now.getFullYear() - 1
  return Array.from({ length: 6 }, (_, i) => {
    const start = currentAyStart - i
    return { value: `ay${start}` as ReportDateRange, label: `Academic Year ${start}-${start + 1}` }
  })
}

export function isWithinRange(dateString: string, range: ReportDateRange): boolean {
  if (range === 'all') return true
  const date = new Date(dateString)
  if (isNaN(date.getTime())) return false
  const now = new Date()

  if (range === 'ytd') return date >= new Date(now.getFullYear(), 0, 1)

  const ayMatch = range.match(/^ay(\d{4})$/)
  if (ayMatch) {
    const startYear = parseInt(ayMatch[1], 10)
    const start = new Date(startYear, 7, 1)
    const end = new Date(startYear + 1, 7, 1)
    return date >= start && date < end
  }

  const yearMatch = range.match(/^(\d+)y$/)
  if (yearMatch) {
    const years = parseInt(yearMatch[1], 10)
    const cutoff = new Date(now)
    cutoff.setFullYear(cutoff.getFullYear() - years)
    return date >= cutoff
  }
  return false
}
