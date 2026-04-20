import { Download, Mail } from 'lucide-react'
import { Button, TypographyH2, TypographyMeta } from '@/components/ui'
import { ThesisEntry, resolveThesisDetail } from '@/lib/utils/theses-data'
import { downloadAbstractUrl } from '@/lib/api/documents'
import CollectionHeading from './CollectionHeading'

interface ThesisDetailViewProps {
  collectionTitle: string
  entry: ThesisEntry
  /** When provided, wires the Download Abstract and Request Full Text buttons */
  documentId?: string
  onRequestFulltext?: () => void
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

export default function ThesisDetailView({ collectionTitle, entry, documentId, onRequestFulltext }: Readonly<ThesisDetailViewProps>) {
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
            <DetailRow label="College" value={detail.college} />
            <DetailRow label="Department/Unit" value={detail.departmentUnit} />
            <DetailRow label="Thesis Advisor" value={detail.thesisAdvisor} />
            <DetailRow label="Defense Panel Chair" value={detail.defensePanelChair} />
            <DetailRow label="Defense Panel Member" value={detail.defensePanelMembers} />
            <DetailRow label="Abstract/Summary" value={detail.abstractSummary} />
            <DetailRow label="Language" value={detail.language} />
            <DetailRow label="Format" value={detail.format} />
            <DetailRow label="Keywords" value={detail.keywords} />
            {detail.citationParts ? (
              <section className="space-y-1">
                <h3 className="font-body text-[14px] leading-[12px] font-semibold text-navy">Recommended Citation</h3>
                <p className="text-[12px] leading-[18px] text-[#888888]">
                  {detail.citationParts.pre}<em>{detail.citationParts.title}</em>{detail.citationParts.post}
                </p>
              </section>
            ) : (
              <DetailRow label="Recommended Citation" value={detail.recommendedCitation} />
            )}
          </div>
        </div>

        <aside className="pt-0.5 flex flex-col gap-4">
          {documentId ? (
            <a
              href={downloadAbstractUrl(documentId)}
              download
              className="inline-flex w-[260px] min-h-[48px] items-center justify-center gap-2.5 rounded-full border-2 border-gray-600 text-gray-600 hover:bg-gray-600 hover:text-white font-body text-[15px] font-semibold no-underline transition-colors duration-200"
            >
              <Download className="h-[18px] w-[18px]" />
              Download Abstract
            </a>
          ) : (
            <Button
              variant="outline"
              className="w-[260px] min-h-[48px] rounded-full border-2 border-gray-600 text-gray-600 hover:bg-gray-600 hover:text-white font-body text-[15px] font-semibold transition-colors duration-200"
            >
              <Download className="h-[18px] w-[18px] mr-2.5" />
              Download Abstract
            </Button>
          )}

          <Button
            className="w-[260px] min-h-[48px] rounded-full bg-gray-600 border-2 border-gray-600 hover:bg-gray-700 hover:border-gray-700 text-white font-body text-[15px] font-semibold transition-colors duration-200"
            onClick={onRequestFulltext}
          >
            <Mail className="h-[18px] w-[18px] mr-2.5" />
            Request Full Text
          </Button>
        </aside>
      </section>
    </div>
  )
}
