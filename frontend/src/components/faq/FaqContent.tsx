'use client'

import { useMemo, useState } from 'react'
import { BookOpen, ChevronRight } from 'lucide-react'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger, TypographyH2, TypographyP, TypographyH3 } from '@/components/ui'

type FaqItem = {
  question: string
  answer: string
}

type FaqCategory = {
  key: string
  label: string
  heading: string
  items: FaqItem[]
}

function FaqToggleIcon({ isOpen }: Readonly<{ isOpen: boolean }>) {
  return (
    <span
      className={`inline-flex h-4 w-4 items-center justify-center rounded-full border text-[11px] leading-none transition-all duration-200 ${
        isOpen
          ? 'border-[#5f5f5f] bg-transparent text-[#5f5f5f]'
          : 'border-[#5f5f5f] bg-[#5f5f5f] text-white'
      }`}
      aria-hidden="true"
    >
      {isOpen ? '−' : '+'}
    </span>
  )
}

const faqCategories: FaqCategory[] = [
  {
    key: 'basics',
    label: 'Basics (3)',
    heading: 'Basics',
    items: [
      {
        question: 'What is an Institutional Repository?',
        answer: 'An Institutional Repository is a digital archive that preserves and provides access to the scholarly and institutional output of the college.',
      },
      {
        question: 'What is SPARK @USTCICS?',
        answer: 'SPARK @USTCICS is the College of Information and Computing Sciences Repository platform for storing and sharing approved academic outputs.',
      },
      {
        question: 'Why should I submit my work to SPARK @USTCICS?',
        answer: 'Submitting your work improves discoverability, supports long-term preservation, and contributes to institutional knowledge.',
      },
    ],
  },
  {
    key: 'deposit',
    label: 'Depositing Materials (5)',
    heading: 'Depositing Materials',
    items: [
      {
        question: 'Who can submit ETs?',
        answer: 'Graduating students whose theses have been approved by their Department.',
      },
      {
        question: 'What can I submit?',
        answer: 'You may submit approved theses and required supporting files based on repository submission guidelines.',
      },
      {
        question: 'What formats are accepted?',
        answer: 'Primary document submissions should be in PDF format; supplemental files may follow allowed repository file types.',
      },
      {
        question: 'If I can’t upload myself, who can upload for me?',
        answer: 'You may coordinate with your college/unit repository representative or designated personnel for assisted submission.',
      },
      {
        question: 'Are there any size limits imposed on ETs?',
        answer: 'Yes, file size limits may apply depending on repository settings. Large files can be split or submitted with guidance from support staff.',
      },
    ],
  },
  {
    key: 'copyright',
    label: 'Copyright/Intellectual Property Issues (3)',
    heading: 'Copyright / Intellectual Property Issues',
    items: [
      {
        question: 'Who owns the copyright of my thesis?',
        answer: 'Copyright generally remains with the author, subject to institutional and legal policies.',
      },
      {
        question: 'Can I include third-party content?',
        answer: 'Yes, provided you have proper permission, citation, or a valid legal basis for use.',
      },
      {
        question: 'Can I request restrictions for reuse?',
        answer: 'Yes, restrictions can be reflected based on repository policy and approved submission terms.',
      },
    ],
  },
  {
    key: 'embargo',
    label: 'Embargo (5)',
    heading: 'Embargo',
    items: [
      {
        question: 'What is an embargo?',
        answer: 'An embargo temporarily restricts full-text access while allowing metadata visibility in the repository.',
      },
      {
        question: 'How long can an embargo last?',
        answer: 'Embargo duration follows approved institutional policy and may be renewable when justified.',
      },
      {
        question: 'Who approves embargo requests?',
        answer: 'Embargo approvals are processed by the authorized academic and repository offices.',
      },
      {
        question: 'Can I lift an embargo early?',
        answer: 'Early lifting may be requested and is subject to institutional review and approval.',
      },
      {
        question: 'What is visible during embargo?',
        answer: 'Typically, bibliographic metadata stays visible while full text remains restricted.',
      },
    ],
  },
  {
    key: 'search',
    label: 'Searching SPARK@USTCICS (3)',
    heading: 'Searching SPARK@USTCICS',
    items: [
      {
        question: 'How do I search by keyword?',
        answer: 'Use the search bar and enter relevant keywords, then refine your results using available filters.',
      },
      {
        question: 'Can I browse by collection?',
        answer: 'Yes, browse options allow you to navigate by collections, authors, and other repository groupings.',
      },
      {
        question: 'Can I search only open-access files?',
        answer: 'Yes, depending on available filters, you can narrow results to publicly accessible documents.',
      },
    ],
  },
  {
    key: 'contact',
    label: 'Contact Us (3)',
    heading: 'Contact Us',
    items: [
      {
        question: 'Who do I contact for submission issues?',
        answer: 'Please contact the repository support team through your college office or official support channels.',
      },
      {
        question: 'Where can I report metadata errors?',
        answer: 'Metadata issues can be reported to repository administrators for verification and correction.',
      },
      {
        question: 'How do I request content updates?',
        answer: 'Send an official request with document details so the repository team can evaluate and process updates.',
      },
    ],
  },
]

function FaqSection({ heading, items }: Readonly<{ heading: string; items: FaqItem[] }>) {
  const [openItemValue, setOpenItemValue] = useState<string | undefined>(undefined)

  return (
    <div className="w-full max-w-[650px]">
      <TypographyH2 className="mb-2">{heading}</TypographyH2>
      <div className="relative h-[2px] w-full bg-[#cfcfcf] mb-4">
        <div className="absolute left-0 top-0 h-[2px] w-[82px] bg-cics-maroon" />
      </div>

      <Accordion
        type="single"
        collapsible
        value={openItemValue}
        onValueChange={(value) => setOpenItemValue(value || undefined)}
        className="border-t border-[#888888]"
      >
        {items.map((item, index) => {
          const value = `faq-item-${index}`
          const isOpen = openItemValue === value

          return (
            <AccordionItem key={item.question} value={value} className="border-b border-[#888888]">
              <AccordionTrigger className="w-full min-h-[34px] px-[10px] py-[6px] hover:no-underline">
                <span className={`inline-flex items-center gap-[10px] font-body text-[12px] leading-[18px] transition-colors duration-200 ${isOpen ? 'text-cics-maroon' : 'text-[#888888] hover:text-cics-maroon'}`}>
                  <BookOpen className="h-4 w-4 transition-colors duration-200" strokeWidth={1.5} />
                  {item.question}
                </span>
                <FaqToggleIcon isOpen={isOpen} />
              </AccordionTrigger>

              <AccordionContent>
                <TypographyP className="px-[10px] py-[8px] text-[12px] leading-[20px] text-[#888888]">
                  {item.answer}
                </TypographyP>
              </AccordionContent>
            </AccordionItem>
          )
        })}
      </Accordion>
    </div>
  )
}

export default function FaqContent() {
  const [activeCategoryKey, setActiveCategoryKey] = useState('deposit')

  const activeCategory = useMemo(
    () => faqCategories.find((category) => category.key === activeCategoryKey) ?? faqCategories[1],
    [activeCategoryKey]
  )

  return (
    <section className="w-full flex items-start justify-between gap-16">
      <FaqSection heading={activeCategory.heading} items={activeCategory.items} />

      <aside className="w-[280px] shrink-0 pt-[34px]">
        <TypographyH3 className="text-[20px] leading-[30px] mb-1">Categories</TypographyH3>
        <div className="relative h-[2px] w-full bg-[#cfcfcf] mb-2">
          <div className="absolute left-0 top-0 h-[2px] w-[76px] bg-cics-maroon" />
        </div>

        <div>
          {faqCategories.map((category) => (
            <button
              key={category.key}
              type="button"
              onClick={() => setActiveCategoryKey(category.key)}
              className="w-full h-[30px] inline-flex items-center gap-[6px] text-left transition-colors duration-200"
            >
              <ChevronRight className={`h-3.5 w-3.5 transition-colors duration-200 ${activeCategoryKey === category.key ? 'text-cics-maroon' : 'text-[#888888]'}`} strokeWidth={1.5} />
              <span
                className={`font-body text-[12px] leading-[30px] transition-colors duration-200 ${
                  activeCategoryKey === category.key ? 'text-cics-maroon' : 'text-[#888888] hover:text-cics-maroon'
                }`}
              >
                {category.label}
              </span>
            </button>
          ))}
        </div>
      </aside>
    </section>
  )
}
