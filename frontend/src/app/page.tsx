import { CICSHeader, CICSFooter, SecondaryNav, Sidebar } from '@/components/layout'
import { ActionCard } from '@/components/ui'
import Image from 'next/image'
import { 
  GraduationCap, 
  Users, 
  HelpCircle, 
  BookOpen, 
  ListChecks, 
  Scale 
} from 'lucide-react'

const actionCards = [
  {
    title: "Thesis",
    description: "Click here to browse\ntheses",
    icon: GraduationCap,
    href: "/theses"
  },
  {
    title: "Capstone",
    description: "Click here to browse\ncapstone projects",
    icon: Users,
    href: "/capstone"
  },
  {
    title: "FAQs",
    description: "Frequently\nAsked Questions.",
    icon: HelpCircle,
    href: "/faq"
  },
  {
    title: "User Guide",
    description: "Learn how to\nsearch and access\nRepository content",
    icon: BookOpen,
    href: "/user-guide"
  },
  {
    title: "Steps in\nsubmitting ETs",
    description: "Read first before submitting\nyour ETs.",
    icon: ListChecks,
    href: "/how-to-submit"
  },
  {
    title: "IR & ET\nPolicy",
    description: "Click here to read our\nRepository @ ET Policy.",
    icon: Scale,
    href: "/policies"
  }
]

export default function Home() {
  return (
    <div className="min-h-screen bg-bg-grey flex flex-col">
      {/* Header */}
      <CICSHeader />
      
      {/* Secondary Navigation */}
      <SecondaryNav title="Home" breadcrumb="Home" />
      
      {/* Main Content Area */}
      <div className="flex flex-1 px-8 lg:px-[300px] gap-6">
        {/* Sidebar */}
        <Sidebar />
        
        {/* Main Content */}
        <main className="flex-1 min-w-0 pt-7 pb-5">
          {/* Benavides Hero Image */}
          <div className="w-full h-[205px] relative mb-5 rounded-lg overflow-hidden">
            <Image
              src="/images/frassati.png"
              alt="Frassati Building"
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 1029px"
              className="object-cover"
            />
          </div>
          
          {/* Description */}
          <p className="font-body text-body-sm text-grey-700 leading-relaxed mb-6">
            The SPARK Repository (System for Preserving Academic Research and Knowledge) is a digital repository of theses, capstone projects, and scholarly outputs of the faculty, students, and researchers of the University of Santo Tomas College of Information and Computing Sciences.
          </p>
          
          {/* Section Title */}
          <h2 className="font-heading text-h2 text-navy mb-8">
            Browse Repository
          </h2>
          
          {/* Action Cards Grid */}
          <div className="grid grid-cols-3 gap-x-16 gap-y-16 pt-12 pb-8 justify-items-center">
            {actionCards.map((card, index) => (
              <ActionCard 
                key={index}
                title={card.title}
                description={card.description}
                icon={card.icon}
                href={card.href}
              />
            ))}
          </div>
        </main>
      </div>
      
      {/* Footer */}
      <CICSFooter />
    </div>
  )
}
