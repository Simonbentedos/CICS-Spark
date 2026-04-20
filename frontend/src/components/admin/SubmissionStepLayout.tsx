import { Card, CardContent } from '@/components/ui'

type SubmissionStepLayoutProps = {
  step: 1 | 2 | 3 | 4
  sectionTitle: string
  children: React.ReactNode
  footer?: React.ReactNode
  pageTitle?: string
}

export default function SubmissionStepLayout({ step, sectionTitle, children, footer, pageTitle = 'Submit New Thesis' }: SubmissionStepLayoutProps) {
  return (
    <div className="mx-auto max-w-[760px] space-y-4">
      <header>
        <h1 className="text-[36px] font-semibold leading-tight text-navy">{pageTitle}</h1>
      </header>

      <Card className="border border-grey-200 shadow-none">
        <CardContent className="space-y-2 p-4">
          <p className="text-sm text-grey-600">Progress: Step {step} of 4</p>
          <div className="grid grid-cols-4 gap-1.5">
            {[1, 2, 3, 4].map((index) => (
              <div
                key={index}
                className={index <= step ? 'h-1.5 rounded-full bg-cics-maroon' : 'h-1.5 rounded-full bg-grey-200'}
              />
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="border border-grey-200 shadow-none">
        <CardContent className="space-y-4 p-4">
          <h2 className="text-[30px] font-semibold tracking-wide text-navy">{sectionTitle}</h2>
          {children}
          {footer ? <div className="border-t border-grey-200 pt-3">{footer}</div> : null}
        </CardContent>
      </Card>
    </div>
  )
}
