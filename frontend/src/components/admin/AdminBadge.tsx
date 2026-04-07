import { cn } from '@/lib/utils'

type AdminBadgeTone = 'default' | 'orange' | 'green' | 'red' | 'blue' | 'violet' | 'yellow'

const toneStyles: Record<AdminBadgeTone, string> = {
  default: 'border border-grey-200 bg-grey-100 text-grey-700',
  orange: 'border border-cics-maroon-100 bg-cics-maroon-50 text-cics-maroon-700',
  green: 'border border-green-100 bg-green-50 text-green-700',
  red: 'border border-red-100 bg-red-50 text-red-700',
  blue: 'border border-blue-100 bg-blue-50 text-blue-700',
  violet: 'border border-violet-100 bg-violet-50 text-violet-700',
  yellow: 'border border-amber-100 bg-amber-50 text-amber-700',
}

export default function AdminBadge({ label, tone }: Readonly<{ label: string; tone: AdminBadgeTone }>) {
  return (
    <span className={cn('inline-flex rounded-full px-2 py-1 text-[10px] font-medium', toneStyles[tone])}>
      {label}
    </span>
  )
}
