import Link from 'next/link'
import { Breadcrumb, BreadcrumbItem as BreadcrumbListItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui'

export interface BreadcrumbItem {
  label: string
  href?: string
}

interface SecondaryNavProps {
  title: string
  breadcrumb?: string
  breadcrumbItems?: BreadcrumbItem[]
}

export default function SecondaryNav({ title, breadcrumb, breadcrumbItems }: Readonly<SecondaryNavProps>) {
  const resolvedBreadcrumbItems: BreadcrumbItem[] = breadcrumbItems
    ?? (breadcrumb
      ? breadcrumb.split('>').map((part) => part.trim()).filter(Boolean).map((label) => ({ label }))
      : [])

  return (
    <div
      className="sticky top-[calc(1rem+55px)] z-40 w-full border-b-[3px] border-border-grey px-4 sm:px-8 lg:px-[300px] shadow-sm bg-cover bg-center bg-no-repeat"
      style={{ backgroundImage: "url('/images/Texture.png')" }}
    >
      <div className="flex min-h-[56px] w-full items-end justify-between gap-4 border-b-[3px] border-cics-maroon py-2 flex-wrap">
        <span className="font-heading text-light-grey text-[22px] sm:text-[28px] leading-[32px] uppercase tracking-wide break-words max-w-full sm:max-w-[55%]">
          {title}
        </span>
        {resolvedBreadcrumbItems.length > 0 && (
          <Breadcrumb className="hidden sm:block">
            <BreadcrumbList className="font-body text-[13px] flex-wrap justify-end">
              {resolvedBreadcrumbItems.map((item, index) => {
                const isLast = index === resolvedBreadcrumbItems.length - 1
                return (
                  <BreadcrumbListItem key={`${item.label}-${index}`}>
                    {item.href && !isLast ? (
                      <BreadcrumbLink asChild className="text-cics-maroon hover:text-cics-maroon">
                        <Link href={item.href}>{item.label}</Link>
                      </BreadcrumbLink>
                    ) : (
                      <BreadcrumbPage className={isLast ? 'text-[#888888]' : 'text-cics-maroon'}>
                        {item.label}
                      </BreadcrumbPage>
                    )}
                    {!isLast && <BreadcrumbSeparator className="text-[#888888]" />}
                  </BreadcrumbListItem>
                )
              })}
            </BreadcrumbList>
          </Breadcrumb>
        )}
      </div>
    </div>
  )
}
