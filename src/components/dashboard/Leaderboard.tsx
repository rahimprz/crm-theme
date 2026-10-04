import { Trophy, Crown } from 'lucide-react'
import { useCrm } from '@/store/crm'
import { members } from '@/data/mock'
import { Card, CardHeader } from '@/components/ui/Card'
import { Avatar } from '@/components/ui/Avatar'
import { Progress } from '@/components/ui/Progress'
import { money } from '@/lib/format'
import { cn } from '@/lib/cn'

const base: Record<string, number> = { m1: 90_000, m2: 120_000, m3: 70_000, m4: 38_000, m5: 60_000, m6: 41_000 }

export function Leaderboard() {
  const deals = useCrm((s) => s.deals)
  const rows = members
    .map((m) => {
      const closed = base[m.id] + deals.filter((d) => d.ownerId === m.id && d.stage === 'won').reduce((s, d) => s + d.value, 0)
      return { ...m, closed, pct: (closed / m.quota) * 100 }
    })
    .sort((a, b) => b.pct - a.pct)

  return (
    <Card className="flex flex-col" data-reveal>
      <CardHeader icon={<Trophy />} title="Leaderboard" subtitle="Quota attainment this quarter" />
      <ol className="flex-1 space-y-1 p-3">
        {rows.map((m, i) => (
          <li key={m.id} className={cn('flex items-center gap-3 rounded-lg p-2', i === 0 && 'bg-accent/[0.06]')}>
            <span className={cn('tabular w-4 text-center text-[12px] font-semibold', i === 0 ? 'text-accent' : 'text-faint')}>{i + 1}</span>
            <span className="relative">
              <Avatar name={m.name} hue={m.hue} size="sm" />
              {i === 0 && <Crown className="absolute -top-2.5 -right-1.5 size-3.5 rotate-12 fill-accent text-accent drop-shadow-[0_0_6px_var(--accent)]" />}
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex items-baseline justify-between gap-2">
                <span className="truncate text-[13px] font-medium text-fg">{m.name}</span>
                <span className="tabular text-[12px] font-semibold text-fg">{Math.round(m.pct)}%</span>
              </div>
              <div className="mt-1.5 flex items-center gap-2">
                <Progress value={m.pct} height={4} color={i === 0 ? 'var(--accent)' : 'var(--primary)'} />
                <span className="tabular shrink-0 text-[11px] text-faint">{money(m.closed, true)}</span>
              </div>
            </div>
          </li>
        ))}
      </ol>
    </Card>
  )
}
