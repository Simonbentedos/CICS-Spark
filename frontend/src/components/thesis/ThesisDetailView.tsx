import { Download, Mail } from 'lucide-react'
import { Button, TypographyH2, TypographyMeta } from '@/components/ui'
import { ThesisEntry, resolveThesisDetail } from '@/lib/utils/theses-data'
import CollectionHeading from './CollectionHeading'

interface ThesisDetailViewProps {
  collectionTitle: string
  entry: ThesisEntry
}

interface DetailRowProps {
  label: string
  value: string | string[]
}

function DetailRow({ label, value }: Readonly<DetailRowProps>) {
  const values = Array.isArray(value) ? value : [value]

  return (
    <section className="space-y-1">
      <h3 className="font-body text-[14px] leading-[12px] font-semibold text-navy">{label}</h3>
      <div className="space-y-0.5">
        {values.map((item, index) => (
          <TypographyMeta key={`${label}-${index}`} className="text-[12px] leading-[18px] text-[#888888]">
            {item}
          </TypographyMeta>
        ))}
      </div>
    </section>
  )
}

export default function ThesisDetailView({ collectionTitle, entry }: Readonly<ThesisDetailViewProps>) {
  const detail = resolveThesisDetail(entry)

  return (
    <div className="max-w-[1029px] w-full pt-4">
      <div className="flex justify-end mb-5">
        <CollectionHeading title={collectionTitle} />
      </div>

      <div className="w-full border-b border-[#dddddd] mb-6" />

      <section className="flex items-start justify-between gap-10">
        <div className="flex-1 max-w-[500px]">
          <TypographyH2 className="text-[22px] leading-[24px] text-navy mb-4">{entry.title}</TypographyH2>

          <div className="border-t-2 border-b border-[#888888] py-2 mb-4">
            <p className="font-body text-[12px] leading-[18px] font-semibold text-cics-maroon underline">
              {entry.authors}
            </p>
          </div>

          <div className="space-y-4">
            <DetailRow label="Date of Publication" value={detail.publicationDate} />
            <DetailRow label="Document Type" value={detail.documentType} />
            <DetailRow label="Degree Name" value={detail.degreeName} />
            <DetailRow label="Subject Categories" value={detail.subjectCategories} />
            <DetailRow label="College" value={detail.college} />
            <DetailRow label="Department/Unit" value={detail.departmentUnit} />
            <DetailRow label="Thesis Advisor" value={detail.thesisAdvisor} />
            <DetailRow label="Defense Panel Chair" value={detail.defensePanelChair} />
            <DetailRow label="Defense Panel Member" value={detail.defensePanelMembers} />
            <DetailRow label="Abstract/Summary" value={detail.abstractSummary} />
            <DetailRow label="Language" value={detail.language} />
            <DetailRow label="Format" value={detail.format} />
            <DetailRow label="Keywords" value={detail.keywords} />
            <DetailRow label="Recommended Citation" value={detail.recommendedCitation} />
            <DetailRow label="Embargo Period" value={detail.embargoPeriod} />
          </div>
        </div>

        <aside className="pt-0.5 flex flex-col gap-[38px]">
          <Button
            variant="outline"
            className="w-[190px] min-h-[42px] rounded-none border-[#337ab7] text-[#337ab7] hover:bg-[#337ab7] hover:text-white"
          >
            <Download className="h-4 w-4 mr-2" />
            Download Abstract
          </Button>

          <Button className="w-[190px] min-h-[42px] rounded-none bg-[#337ab7] border border-[#0074cc] hover:bg-[#2f6ea1]">
            <Mail className="h-4 w-4 mr-2" />
            Request Full Text
          </Button>
        </aside>
      </section>
    </div>
  )
}
