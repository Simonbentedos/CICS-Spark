import { CalendarDays, Folder, Tag, User } from 'lucide-react'
import Link from 'next/link'
import { ThesisEntry } from '@/lib/utils/theses-data'
import { TypographyMeta, TypographyP } from '@/components/ui'

interface ThesisListItemProps {
  entry: ThesisEntry
  collectionSlug: string
  basePath?: '/theses' | '/capstone'
  showDivider?: boolean
}

export default function ThesisListItem({
  entry,
  collectionSlug,
  basePath = '/theses',
  showDivider = true,
}: Readonly<ThesisListItemProps>) {
  return (
    <article className={`flex flex-col gap-2 pb-5 ${showDivider ? 'border-b border-[#dddddd]' : ''}`}>
      <Link
        href={`${basePath}/${collectionSlug}/${entry.slug}`}
        className="font-body text-[16px] leading-[22px] text-[#337ab7] hover:underline w-full text-left"
      >
        {entry.title}
      </Link>

      <div className="flex items-center gap-4 text-[#888888] font-body text-[10px] leading-[14px]">
        <span className="inline-flex items-center gap-1">
          <User size={9} />
          {entry.authors}
        </span>
        <span className="inline-flex items-center gap-1">
          <CalendarDays size={9} />
          {entry.date}
        </span>
        <span className="inline-flex items-center gap-1">
          <Folder size={9} />
          {entry.type}
        </span>
      </div>

      <div className="w-[92%] border-l-[3px] border-cics-maroon bg-cics-maroon-50 px-3 py-1.5">
        <TypographyP className="text-[13px] leading-[16px] text-[#1d1d1b]">
          {entry.abstract}
        </TypographyP>
      </div>

      <div className="inline-flex items-center gap-1 text-[#888888] font-body text-[10px] leading-[14px]">
        <Tag size={9} />
        <TypographyMeta className="text-[10px] leading-[14px] text-[#888888]">{entry.tags}</TypographyMeta>
      </div>
    </article>
  )
}