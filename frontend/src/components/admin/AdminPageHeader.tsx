type AdminPageHeaderProps = {
  title: string
  subtitle: string
  action?: React.ReactNode
}

export default function AdminPageHeader({ title, subtitle, action }: AdminPageHeaderProps) {
  return (
    <header className="flex items-start justify-between gap-4">
      <div>
        <h1 className="text-[32px] font-semibold leading-tight text-navy">{title}</h1>
        <p className="mt-1 text-sm text-grey-500">{subtitle}</p>
      </div>
      {action}
    </header>
  )
}
