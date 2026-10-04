import { TrendingUp, TrendingDown, CircleDollarSign, Layers, Magnet, Target } from 'lucide-react'
import type { Kpi } from '@/data/analytics'
import { Card } from '@/components/ui/Card'
import { AnimatedNumber } from '@/components/ui/AnimatedNumber'
import { Sparkline } from '@/components/charts/Sparkline'
import { useSize } from '@/hooks/useSize'
import { delta } from '@/lib/format'
import { cn } from '@/lib/cn'

const meta: Record<Kpi['id'], { icon: typeof Layers; color: string }> = {
  revenue: { icon: CircleDollarSign, color: 'var(--primary)' },
  pipeline: { icon: Layers, color: 'var(--accent)' },
  leads: { icon: Magnet, color: 'var(--c3)' },
  winrate: { icon: Target, color: 'var(--c5)' },
}

/** Stat tile: label, counting value, change vs previous period, and a 12-point trend. */
export function KpiTile({ kpi, rangeLabel }: { kpi: Kpi; rangeLabel: string }) {
  const [box, { width }] = useSize<HTMLDivElement>()
  const d = delta(kpi.value, kpi.previous)
  const up = d >= 0
  const m = meta[kpi.id]
  const Icon = m.icon
  return (
    <Card className="group flex flex-col gap-4 p-5" data-reveal>
      <div className="flex items-center justify-between">
        <span className="text-[13px] font-medium text-muted">{kpi.label}</span>
        <span
          className="flex size-8 items-center justify-center rounded-lg transition-transform duration-500 group-hover:rotate-[-8deg] group-hover:scale-110"
          style={{ background: `color-mix(in oklab, ${m.color} 15%, transparent)`, color: m.color }}
        >
          <Icon className="size-4" />
        </span>
      </div>
      <div>
        <AnimatedNumber value={kpi.value} format={kpi.format} className="text-[30px] leading-none font-semibold tracking-[-0.03em] text-fg" />
        <div className="mt-2 flex items-center gap-2 text-[12px]">
          <span className={cn('inline-flex items-center gap-1 rounded-full px-1.5 py-0.5 font-semibold', up ? 'bg-success/12 text-success' : 'bg-danger/12 text-danger')}>
            {up ? <TrendingUp className="size-3" /> : <TrendingDown className="size-3" />}
            {up ? '+' : ''}
            {d.toFixed(1)}%
          </span>
          <span className="text-faint">vs previous {rangeLabel.toLowerCase().replace('last ', '')}</span>
        </div>
      </div>
      <div ref={box} className="-mx-1 mt-auto">
        {width > 0 && <Sparkline values={kpi.trend} color={m.color} width={width} height={40} />}
      </div>
    </Card>
  )
}
