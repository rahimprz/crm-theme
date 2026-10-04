import type { Lead } from '@/data/types'
import { memberById } from '@/store/crm'
import { useUI } from '@/store/ui'
import { Avatar } from '@/components/ui/Avatar'
import { ScoreMeter, SourceLabel } from './meta'
import { money, relativeTime } from '@/lib/format'
import { cn } from '@/lib/cn'

export function LeadCard({ lead, overlay }: { lead: Lead; overlay?: boolean }) {
  const openDrawer = useUI((s) => s.openDrawer)
  const owner = memberById(lead.ownerId)
  return (
    <article
      onClick={() => !overlay && openDrawer({ type: 'lead', id: lead.id })}
      className={cn(
        'card spotlight cursor-pointer p-3.5 transition-[transform,border-color] duration-200 hover:-translate-y-0.5 hover:border-line-strong',
        overlay && 'border-primary/50 shadow-[var(--glow-primary)]',
      )}
    >
      <div className="flex items-center gap-2.5">
        <Avatar name={lead.name} hue={lead.hue} size="sm" />
        <div className="min-w-0 flex-1">
          <div className="truncate text-[13.5px] font-semibold text-fg">{lead.name}</div>
          <div className="truncate text-[12px] text-muted">{lead.company}</div>
        </div>
      </div>
      <div className="mt-3 flex items-center justify-between">
        <ScoreMeter score={lead.score} />
        <span className="tabular text-[13px] font-semibold text-fg">{money(lead.value, true)}</span>
      </div>
      <div className="mt-3 flex items-center justify-between border-t border-line pt-2.5">
        <SourceLabel source={lead.source} />
        <div className="flex items-center gap-1.5 text-[11px] text-faint">
          {relativeTime(lead.lastActivity)}
          {owner && <Avatar name={owner.name} hue={owner.hue} size="xs" />}
        </div>
      </div>
    </article>
  )
}
