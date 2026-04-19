import type { Metadata } from 'next'
import { Inter, Outfit } from 'next/font/google'
import '@/styles/globals.css'

const inter = Inter({ 
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

const outfit = Outfit({ 
  subsets: ['latin'],
  variable: '--font-outfit',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'CICS Repository - College of Information and Computing Sciences',
  description: 'A digital repository of theses and capstone projects of the College of Information and Computing Sciences, University of Santo Tomas',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${inter.variable} ${outfit.variable}`} suppressHydrationWarning>
      <body className="font-body antialiased" suppressHydrationWarning>
        {children}
      </body>
    </html>
  )
}
