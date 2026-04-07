import { CONFIRMATION_MESSAGE } from '@/lib/utils'

export default function NewThesisConfirmationPage() {
  return (
    <div className="mx-auto max-w-[780px] space-y-4 pt-4">
      <section>
        <h1 className="text-[36px] font-semibold leading-tight text-navy">{CONFIRMATION_MESSAGE.title}</h1>
        <div className="mt-2 h-[2px] w-full bg-cics-red" />
      </section>

      <section className="space-y-3 text-sm leading-6 text-grey-700">
        <p className="font-semibold">{CONFIRMATION_MESSAGE.lead}</p>
        <p>{CONFIRMATION_MESSAGE.body}</p>
      </section>
    </div>
  )
}
