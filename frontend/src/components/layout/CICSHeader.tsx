'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useState } from 'react'
import { Menu, X } from 'lucide-react'

export default function CICSHeader() {
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 w-full">
      {/* Thin top maroon bar */}
      <div className="bg-cics-maroon h-4 w-full" />

      {/* Main header */}
      <div className="bg-bg-grey flex items-center justify-between px-4 sm:px-8 lg:px-[280px] py-2">

        {/* Logo + Text section */}
        <Link href="/" className="flex items-center gap-2.5 no-underline shrink-0">
          <div className="flex items-center gap-2">
            <Image
              src="/images/UST LOGO.png"
              alt="UST Logo"
              width={41}
              height={51}
              className="h-[41px] w-[33px] sm:h-[51px] sm:w-[41px] object-contain"
            />
            <Image
              src="/images/CICS SEAL.png"
              alt="CICS Seal"
              width={41}
              height={51}
              className="h-[41px] w-[33px] sm:h-[51px] sm:w-[41px] object-contain"
            />
          </div>
          <div className="flex flex-col">
            <span className="font-body text-cics-maroon text-[8px] leading-tight">The</span>
            <span className="font-heading font-bold text-cics-maroon text-[14px] leading-tight">SPARK Repository</span>
            <span className="font-heading font-bold text-[10px] leading-tight" style={{ color: 'var(--cics-maroon)' }}>
              University of Santo Tomas
            </span>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-1">
          <Link href="/" className="font-body text-grey-700 hover:text-cics-maroon transition-colors px-4 py-2 text-sm">Home</Link>
          <Link href="/faq" className="font-body text-grey-700 hover:text-cics-maroon transition-colors px-4 py-2 text-sm">FAQ</Link>
          <Link href="/about" className="font-body text-grey-700 hover:text-cics-maroon transition-colors px-4 py-2 text-sm">About Us</Link>
          <Link href="/login" className="font-body text-grey-700 hover:text-cics-maroon transition-colors px-4 py-2 text-sm">Login</Link>
        </nav>

        {/* Mobile hamburger */}
        <button
          className="md:hidden p-2 text-cics-maroon"
          onClick={() => setMenuOpen(v => !v)}
          aria-label={menuOpen ? 'Close menu' : 'Open menu'}
        >
          {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile dropdown menu */}
      {menuOpen && (
        <nav className="md:hidden bg-bg-grey border-t border-grey-200 px-4 py-2 flex flex-col">
          <Link href="/" onClick={() => setMenuOpen(false)} className="font-body text-grey-700 hover:text-cics-maroon py-2 text-sm border-b border-grey-100">Home</Link>
          <Link href="/faq" onClick={() => setMenuOpen(false)} className="font-body text-grey-700 hover:text-cics-maroon py-2 text-sm border-b border-grey-100">FAQ</Link>
          <Link href="/about" onClick={() => setMenuOpen(false)} className="font-body text-grey-700 hover:text-cics-maroon py-2 text-sm border-b border-grey-100">About Us</Link>
          <Link href="/login" onClick={() => setMenuOpen(false)} className="font-body text-grey-700 hover:text-cics-maroon py-2 text-sm">Login</Link>
        </nav>
      )}
    </header>
  )
}
