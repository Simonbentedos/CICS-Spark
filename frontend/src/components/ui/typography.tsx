import * as React from 'react'
import { cn } from '@/lib/utils'

function TypographyH2({ className, ...props }: React.ComponentPropsWithoutRef<'h2'>) {
  return <h2 className={cn('font-body text-[20px] leading-[24px] font-semibold text-[#4b4b4b]', className)} {...props} />
}

function TypographyH3({ className, ...props }: React.ComponentPropsWithoutRef<'h3'>) {
  return <h3 className={cn('font-body text-[16px] leading-[24px] font-semibold text-[#4b4b4b]', className)} {...props} />
}

function TypographyP({ className, ...props }: React.ComponentPropsWithoutRef<'p'>) {
  return <p className={cn('font-body text-[12px] leading-[19px] text-[#5d5d5d]', className)} {...props} />
}

function TypographyMeta({ className, ...props }: React.ComponentPropsWithoutRef<'p'>) {
  return <p className={cn('font-body text-[11px] leading-[17px] text-[#888888]', className)} {...props} />
}

function TypographyLink({ className, ...props }: React.ComponentPropsWithoutRef<'a'>) {
  return <a className={cn('font-body text-[11px] leading-[18px] text-[#337AB7] hover:underline', className)} {...props} />
}

export { TypographyH2, TypographyH3, TypographyP, TypographyMeta, TypographyLink }
