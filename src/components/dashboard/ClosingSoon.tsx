import { CalendarClock } from 'lucide-react'
import { useCrm } from '@/store/crm'
import { useUI } from '@/store/ui'
import { Card, CardHeader } from '@/components/ui/Card'
import { CompanyLogo } from '@/components/ui/CompanyLogo'
import { StageBadge } from '@/components/crm/meta'
import { dayDiff, money } from '@/lib/format'
import { cn } from '@/lib/cn'

/** Open deals with the nearest close dates, so nothing slips at month end. */
export function ClosingSoon() {
  const deals = useCrm((s) => s.deals)
  const companies = useCrm((s) => s.companies)
  const openDrawer = useUI((s) => s.openDrawer)
  const rows = deals
    .filter((d) => d.stage !== 'won' && d.stage !== 'lost')
    .sort((a, b) => a.closeDate.localeCompare(b.closeDate))
    .slice(0, 6)

  return (
    <Card className="flex flex-col" data-reveal>
      <CardHeader icon={<CalendarClock />} title="Closing soon" subtitle="Open deals by expected close date" />
      <ul className="flex-1 space-y-1 p-3">
        {rows.map((d) => {
          const co = companies.find((c) => c.id === d.companyId)
          const days = dayDiff(d.closeDate)
          return (
            <li key={d.id}>
              <button type="button" onClick={() => openDrawer({ type: 'deal', id: d.id })} className="flex w-full items-center gap-3 rounded-lg p-2 text-left transition-colors hover:bg-surface-2">
                {co && <CompanyLogo shape={co.logo} color={co.color} size="sm" />}
                <div className="min-w-0 flex-1">
                  <div className="truncate text-[13px] font-medium text-fg">{d.name}</div>
                  <div className="mt-0.5"><StageBadge stage={d.stage} /></div>
                </div>
                <div className="text-right">
                  <div className="tabular text-[13px] font-semibold text-fg">{money(d.value, true)}</div>
                  <div className={cn('tabular text-[11.5px]', days < 0 ? 'text-danger' : days <= 7 ? 'text-accent' : 'text-faint')}>
                    {days < 0 ? `${Math.abs(days)}d overdue` : days === 0 ? 'Today' : `in ${days}d`}
                  </div>
                </div>
              </button>
            </li>
          )
        })}
      </ul>
    </Card>
  )
}
