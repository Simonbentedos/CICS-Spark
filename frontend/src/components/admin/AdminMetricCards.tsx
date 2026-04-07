import type { AdminStatCard } from '@/types/admin'
import { Card, CardContent } from '@/components/ui'
import { getMetricToneClasses } from '@/lib/utils'

type AdminMetricCardsProps = {
  cards: AdminStatCard[]
  columnsClassName?: string
  compact?: boolean
}

export default function AdminMetricCards({ cards, columnsClassName = 'sm:grid-cols-2 lg:grid-cols-4', compact = false }: AdminMetricCardsProps) {
  return (
    <section className={`grid gap-3 ${columnsClassName}`}>
      {cards.map((item) => {
        const toneClass = getMetricToneClasses(item.tone)

        return (
          <Card key={item.label} className={`border ${toneClass.border} shadow-none`}>
            <CardContent className={compact ? 'p-3' : 'p-4'}>
              <p className="text-[10px] uppercase tracking-wide text-grey-500">{item.label}</p>
              <p className={`mt-1 text-[30px] font-semibold leading-none ${toneClass.value}`}>{item.value}</p>
            </CardContent>
          </Card>
        )
      })}
    </section>
  )
}
