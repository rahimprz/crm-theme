import { CalendarDays } from 'lucide-react'
import type { Deal } from '@/data/types'
import { useCrm, memberById } from '@/store/crm'
import { useUI } from '@/store/ui'
import { CompanyLogo } from '@/components/ui/CompanyLogo'
import { Avatar } from '@/components/ui/Avatar'
import { Ring } from '@/components/ui/Progress'
import { PriorityFlag } from './meta'
import { money, shortDate, dayDiff } from '@/lib/format'
import { cn } from '@/lib/cn'

export function DealCard({ deal, overlay }: { deal: Deal; overlay?: boolean }) {
  const company = useCrm((s) => s.companies.find((c) => c.id === deal.companyId))
  const openDrawer = useUI((s) => s.openDrawer)
  const owner = memberById(deal.ownerId)
  const closed = deal.stage === 'won' || deal.stage === 'lost'
  const overdue = !closed && dayDiff(deal.closeDate) < 0

  return (
    <article
      onClick={() => !overlay && openDrawer({ type: 'deal', id: deal.id })}
      className={cn(
        'card spotlight group cursor-pointer p-3.5 transition-[transform,border-color] duration-200 hover:-translate-y-0.5 hover:border-line-strong',
        overlay && 'border-primary/50 shadow-[var(--glow-primary)]',
        deal.stage === 'won' && 'border-success/30',
      )}
    >
      <div className="flex items-center gap-2">
        {company && <CompanyLogo shape={company.logo} color={company.color} size="xs" />}
        <span className="min-w-0 flex-1 truncate text-[12px] text-muted">{company?.name}</span>
        <PriorityFlag priority={deal.priority} />
      </div>
      <h4 className="mt-2 line-clamp-2 text-[13.5px] leading-snug font-semibold text-fg">{deal.name}</h4>
      <div className="mt-3 flex items-end justify-between gap-2">
        <div>
          <div className="tabular text-[17px] font-semibold tracking-[-0.02em] text-fg">{money(deal.value)}</div>
          <div className="text-[11.5px] text-faint">{deal.product}</div>
        </div>
        <Ring value={deal.probability} size={34} stroke={3.5} color={deal.stage === 'won' ? 'var(--success)' : deal.stage === 'lost' ? 'var(--danger)' : undefined}>
          <span className="tabular text-[9.5px] font-semibold text-muted">{deal.probability}</span>
        </Ring>
      </div>
      <div className="mt-3 flex items-center justify-between border-t border-line pt-2.5">
        <span className={cn('inline-flex items-center gap-1.5 text-[11.5px]', overdue ? 'text-danger' : 'text-muted')}>
          <CalendarDays className="size-3.5" />
          {closed ? `Closed ${shortDate(deal.closeDate)}` : overdue ? `Overdue · ${shortDate(deal.closeDate)}` : shortDate(deal.closeDate)}
        </span>
        <div className="flex items-center gap-1.5">
          {deal.tags[0] && <span className="rounded-md bg-surface-3 px-1.5 py-0.5 text-[10.5px] text-muted">{deal.tags[0]}</span>}
          {owner && <Avatar name={owner.name} hue={owner.hue} size="xs" />}
        </div>
      </div>
    </article>
  )
}
