import Link from 'next/link'
import { LucideIcon } from 'lucide-react'

interface ActionCardProps {
  title: string
  description: string
  icon: LucideIcon
  href: string
}

export default function ActionCard({ title, description, icon: Icon, href }: ActionCardProps) {
  return (
    <Link 
      href={href}
      className="group bg-white border border-cics-maroon rounded-lg w-[200px] h-[200px] relative transition-shadow hover:shadow-card-hover no-underline"
    >
      <div className="absolute -top-9 left-0 right-0 flex flex-col items-center gap-5 p-2">
        {/* Icon container - changes bg on hover*/}
        <div className="bg-white group-hover:bg-cics-maroon border border-cics-maroon rounded size-14 flex items-center justify-center transition-all duration-200">
          <Icon 
            className="size-8 text-cics-maroon group-hover:text-white transition-colors duration-200" 
            strokeWidth={1.5} 
          />
        </div>
        
        {/* Title with decorative lines on hover */}
        <div className="relative text-center px-2">
          <p className="font-heading text-navy text-base tracking-wide leading-6 whitespace-pre-line">
            {title}
          </p>
          {/* Decorative line - full width, visible on hover */}
          <div className="absolute bottom-0 left-0 w-full h-[1.5px] bg-cics-maroon opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
        </div>
        
        {/* Description */}
        <div className="text-center px-4">
          <p className="font-body text-navy text-[11.2px] leading-4 whitespace-pre-line">
            {description}
          </p>
        </div>
      </div>
    </Link>
  )
}
