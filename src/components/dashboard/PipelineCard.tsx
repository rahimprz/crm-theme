import { useNavigate } from 'react-router-dom'
import { Filter, ArrowUpRight } from 'lucide-react'
import { useCrm } from '@/store/crm'
import { stageMeta } from '@/data/mock'
import type { DealStage } from '@/data/types'
import { Card, CardHeader } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Progress } from '@/components/ui/Progress'
import { AnimatedNumber } from '@/components/ui/AnimatedNumber'
import { money } from '@/lib/format'

const openStages: DealStage[] = ['discovery', 'qualified', 'proposal', 'negotiation']
/** Historical stage-to-stage conversion, last 4 quarters. */
const conversion: Partial<Record<DealStage, number>> = { discovery: 62, qualified: 48, proposal: 57 }

/** Open pipeline by stage, with conversion between stages. Updates live as deals move. */
export function PipelineCard() {
  const deals = useCrm((s) => s.deals)
  const navigate = useNavigate()
  const rows = openStages.map((stage) => {
    const ds = deals.filter((d) => d.stage === stage)
    return { stage, count: ds.length, value: ds.reduce((s, d) => s + d.value, 0) }
  })
  const max = Math.max(...rows.map((r) => r.value), 1)
  const total = rows.reduce((s, r) => s + r.value, 0)
  const weighted = deals.filter((d) => openStages.includes(d.stage)).reduce((s, d) => s + (d.value * d.probability) / 100, 0)

  return (
    <Card className="flex flex-col" data-reveal>
      <CardHeader
        icon={<Filter />}
        title="Pipeline by stage"
        subtitle={`${rows.reduce((s, r) => s + r.count, 0)} open deals`}
        action={
          <Button variant="ghost" size="icon-sm" onClick={() => navigate('/deals')} aria-label="Open pipeline">
            <ArrowUpRight />
          </Button>
        }
      />
      <div className="flex flex-1 flex-col gap-4 px-5 pt-5 pb-5">
        {rows.map((r, i) => {
          const next = rows[i + 1]
          return (
            <div key={r.stage}>
              <div className="mb-1.5 flex items-center justify-between gap-2 text-[13px]">
                <span className="flex items-center gap-2 text-fg">
                  <span className="size-2 rounded-full" style={{ background: stageMeta[r.stage].color }} />
                  {stageMeta[r.stage].label}
                  <span className="tabular text-[11.5px] text-faint">{r.count}</span>
                </span>
                <span className="tabular font-semibold text-fg">{money(r.value, true)}</span>
              </div>
              <Progress value={r.value} max={max} color={stageMeta[r.stage].color} height={8} />
              {next && conversion[r.stage] && (
                <div className="mt-1.5 pl-4 text-[11px] text-faint">↓ {conversion[r.stage]}% usually move to {stageMeta[next.stage].label.toLowerCase()}</div>
              )}
            </div>
          )
        })}
        <div className="mt-auto grid grid-cols-2 gap-2 border-t border-line pt-4">
          <div>
            <div className="text-[11.5px] text-faint">Total pipeline</div>
            <AnimatedNumber value={total} format="currency" className="text-[18px] font-semibold text-fg" />
          </div>
          <div>
            <div className="text-[11.5px] text-faint">Weighted forecast</div>
            <AnimatedNumber value={weighted} format="currency" className="text-[18px] font-semibold text-accent" />
          </div>
        </div>
      </div>
    </Card>
  )
}
