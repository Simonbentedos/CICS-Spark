"use client"

import { useEffect, useRef } from 'react'
import { X } from 'lucide-react'

export default function AdminModal({
  title,
  subtitle,
  children,
  onClose,
  widthClassName = 'max-w-[560px]',
}: Readonly<{
  title: string
  subtitle?: string
  children: React.ReactNode
  onClose: () => void
  widthClassName?: string
}>) {
  const closeButtonRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    closeButtonRef.current?.focus()

    function handleKeydown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        event.preventDefault()
        onClose()
      }
    }

    document.addEventListener('keydown', handleKeydown)
    return () => document.removeEventListener('keydown', handleKeydown)
  }, [onClose])

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/35 p-4">
      <dialog
        open
        aria-label={title}
        className={`w-full rounded-[14px] bg-white p-6 shadow-[0_20px_25px_rgba(0,0,0,0.2)] ${widthClassName}`}
      >
        <div className="mb-4 flex items-start justify-between gap-4">
          <div>
            <h3 className="text-[34px] font-semibold leading-tight text-navy">{title}</h3>
            {subtitle ? <p className="mt-1 text-sm text-grey-500">{subtitle}</p> : null}
          </div>
          <button
            ref={closeButtonRef}
            type="button"
            onClick={onClose}
            aria-label="Close dialog"
            className="text-grey-500 hover:text-grey-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cics-maroon focus-visible:ring-offset-2"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        {children}
      </dialog>
    </div>
  )
}
