import { ChartArea } from 'lucide-react'
import { getRevenueSeries, ranges, type RangeId } from '@/data/analytics'
import { Card, CardHeader } from '@/components/ui/Card'
import { AnimatedNumber } from '@/components/ui/AnimatedNumber'
import { AreaChart } from '@/components/charts/AreaChart'
import { money } from '@/lib/format'

export function RevenueCard({ range }: { range: RangeId }) {
  const s = getRevenueSeries(range)
  const total = s.revenue.reduce((a, b) => a + b, 0)
  const target = s.target.reduce((a, b) => a + b, 0)
  const pct = (total / target) * 100
  return (
    <Card className="flex flex-col" data-reveal>
      <CardHeader
        icon={<ChartArea />}
        title="Revenue"
        subtitle={`${ranges.find((r) => r.id === range)?.long} · closed won vs target`}
        action={
          <div className="hidden items-center gap-4 text-[12px] text-muted sm:flex">
            <span className="flex items-center gap-1.5">
              <span className="h-[3px] w-3.5 rounded-full bg-primary" /> Revenue
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-0 w-3.5 border-t-2 border-dashed border-accent" /> Target
            </span>
          </div>
        }
      />
      <div className="flex flex-wrap items-end gap-x-6 gap-y-2 px-5 pt-4">
        <div>
          <AnimatedNumber value={total} format="currency" compact={false} className="text-[28px] leading-none font-semibold tracking-[-0.03em] text-fg" />
          <div className="mt-1 text-[12px] text-faint">Total closed</div>
        </div>
        <div>
          <div className="tabular text-[15px] font-semibold text-fg">{pct.toFixed(1)}%</div>
          <div className="text-[12px] text-faint">of {money(target, true)} target</div>
        </div>
      </div>
      <div className="px-3 pt-2 pb-4">
        <AreaChart
          labels={s.labels}
          height={290}
          format={(n) => money(n, true)}
          series={[
            { key: 'revenue', label: 'Revenue', color: 'var(--primary)', values: s.revenue },
            { key: 'target', label: 'Target', color: 'var(--accent)', values: s.target, reference: true },
          ]}
        />
      </div>
    </Card>
  )
}
