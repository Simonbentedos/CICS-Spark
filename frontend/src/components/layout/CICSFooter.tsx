import Link from 'next/link'

export default function CICSFooter() {
  return (
    <footer className="bg-[#0f0f0f] w-full py-5 mt-auto border-t-4 border-cics-maroon">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-4 sm:px-8 lg:px-[280px]">
        <p className="font-body text-[#aaa] text-[13px] text-center sm:text-left">
          Copyright © 2025-2026 | College of Information and Computing Sciences, University of Santo Tomas
        </p>
        <div className="flex items-center font-body text-[#aaa] text-[13px] gap-1 flex-shrink-0">
          <Link href="/acceptable-use-policy" className="hover:text-white transition-colors">
            Acceptable Use Policy
          </Link>
          <span>|</span>
          <Link href="/privacy-policy" className="hover:text-white transition-colors">
            Privacy Policy
          </Link>
        </div>
      </div>
    </footer>
  )
}
