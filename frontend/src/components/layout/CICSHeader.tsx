import Link from 'next/link'
import Image from 'next/image'

export default function CICSHeader() {
  return (
    <header className="sticky top-0 z-50 w-full">
      {/* Thin top maroon bar */}
      <div className="bg-cics-maroon h-4 w-full" />

      {/* Main header */}
      <div className="bg-bg-grey flex items-center justify-between px-8 lg:px-[280px] py-2">

        {/* Logo + Text section */}
        <Link href="/" className="flex items-center gap-2.5 no-underline shrink-0">

          {/* Logos container */}
          <div className="flex items-center gap-2">

            {/* UST Logo (LEFT) */}
            <Image
              src="/images/UST LOGO.png"
              alt="UST Logo"
              width={41}
              height={51}
              className="h-[51px] w-[41px] object-contain"
            />

            {/* CICS Logo (RIGHT) */}
            <Image
              src="/images/CICS SEAL.png"
              alt="CICS Seal"
              width={41}
              height={51}
              className="h-[51px] w-[41px] object-contain"
            />

          </div>

          {/* Text section */}
          <div className="flex flex-col">
            <span className="font-body text-cics-maroon text-[8px] leading-tight">
              The
            </span>

            <span className="font-heading font-bold text-cics-maroon text-[14px] leading-tight">
              SPARK Repository
            </span>

            <span
              className="font-heading font-bold text-[10px] leading-tight"
              style={{ color: 'var(--cics-maroon)' }}
            >
              University of Santo Tomas
            </span>
          </div>

        </Link>

        {/* Navigation */}
        <nav className="hidden md:flex items-center gap-1">
          <Link href="/" className="font-body text-grey-700 hover:text-cics-maroon transition-colors px-4 py-2 text-sm">
            Home
          </Link>

          <Link href="/faq" className="font-body text-grey-700 hover:text-cics-maroon transition-colors px-4 py-2 text-sm">
            FAQ
          </Link>

          <Link href="/about" className="font-body text-grey-700 hover:text-cics-maroon transition-colors px-4 py-2 text-sm">
            About Us
          </Link>

          <Link href="/login" className="font-body text-grey-700 hover:text-cics-maroon transition-colors px-4 py-2 text-sm">
            Login
          </Link>
        </nav>

      </div>
    </header>
  )
}