import Link from 'next/link'

function SidebarLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link href={href} className="font-body text-[13px] text-cics-maroon hover:underline transition-colors">
      {children}
    </Link>
  )
}

function SidebarSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="w-full flex flex-col">
      <div className="bg-cics-maroon rounded-t px-4 py-2">
        <span className="font-heading text-[15px] font-bold uppercase tracking-wider text-white">{title}</span>
      </div>
      <div className="flex flex-col gap-1.5 px-2 py-3">
        {children}
      </div>
    </div>
  )
}

export default function Sidebar() {
  return (
    <aside className="w-[220px] shrink-0 flex flex-col gap-4 pt-7 pb-5">
      {/* Search Section */}
      <div className="w-full flex flex-col">
        <div className="bg-cics-maroon rounded-t px-4 py-2">
          <span className="font-heading text-[15px] font-bold uppercase tracking-wider text-white">SEARCH</span>
        </div>
        <div className="flex flex-col gap-1.5 px-[10px] py-3">
          <span className="font-body text-[11px] leading-[14px] text-[#333]">Enter search terms:</span>
          <form action="/search" method="get" className="flex items-center gap-1.5">
            <input
              type="text"
              name="q"
              className="h-[22px] w-[96px] border border-[#c6c6c6] bg-[#f9f9f9] px-1.5 text-[11px] text-[#333] focus:outline-none focus:ring-1 focus:ring-cics-maroon"
              aria-label="Search terms"
            />
            <button
              type="submit"
              className="h-[22px] border border-[#a5a5a5] bg-[#efefef] px-2 font-body text-[10px] leading-none text-[#222] hover:bg-[#e6e6e6]"
            >
              Search
            </button>
          </form>
          <Link href="/search" className="font-body text-[12px] text-cics-maroon hover:underline transition-colors">
            Advanced Search
          </Link>
        </div>
      </div>

      {/* Browse */}
      <SidebarSection title="BROWSE">
        <SidebarLink href="/collections">Collections</SidebarLink>
        <SidebarLink href="/authors">Authors</SidebarLink>
      </SidebarSection>

      {/* Guides */}
      <SidebarSection title="GUIDES">
        <SidebarLink href="/user-guide">User Guide</SidebarLink>
        <SidebarLink href="/how-to-submit">How to submit ETs</SidebarLink>
      </SidebarSection>

      {/* Quick Links */}
      <SidebarSection title="QUICK LINKS">
        <SidebarLink href="/policies">Policies</SidebarLink>
        <SidebarLink href="/privacy-policy">Privacy Policy</SidebarLink>
        <SidebarLink href="/acceptable-use-policy">Acceptable Use Policy</SidebarLink>
        <SidebarLink href="https://www.ust.edu.ph">University Website</SidebarLink>
        <SidebarLink href="https://library.ust.edu.ph">University Libraries</SidebarLink>
        <SidebarLink href="/contact">Contact</SidebarLink>
      </SidebarSection>
    </aside>
  )
}
