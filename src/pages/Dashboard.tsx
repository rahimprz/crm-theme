import { useRef, useState } from 'react'
import { useCrm } from '@/store/crm'
import { getKpis, ranges, type RangeId } from '@/data/analytics'
import { useReveal } from '@/hooks/useReveal'
import { DashboardHero } from '@/components/dashboard/Hero'
import { KpiTile } from '@/components/dashboard/KpiTile'
import { RevenueCard } from '@/components/dashboard/RevenueCard'
import { PipelineCard } from '@/components/dashboard/PipelineCard'
import { RecentDeals } from '@/components/dashboard/RecentDeals'
import { LeadSources } from '@/components/dashboard/LeadSources'
import { ActivityCard } from '@/components/dashboard/ActivityCard'
import { AgendaCard } from '@/components/dashboard/AgendaCard'
import { Leaderboard } from '@/components/dashboard/Leaderboard'
import { ReachOutCard } from '@/components/dashboard/ReachOutCard'
import { ClosingSoon } from '@/components/dashboard/ClosingSoon'

/**
 * Dashboard. Sections reveal as you scroll; every widget lives in
 * src/components/dashboard/ so you can rearrange the grid below freely.
 */
export default function Dashboard() {
  const ref = useRef<HTMLDivElement>(null)
  const [range, setRange] = useState<RangeId>('30d')
  const deals = useCrm((s) => s.deals)
  const leads = useCrm((s) => s.leads)
  const openPipeline = deals.filter((d) => d.stage !== 'won' && d.stage !== 'lost').reduce((s, d) => s + d.value, 0)
  const kpis = getKpis(range, openPipeline, leads.length)
  const rangeLabel = ranges.find((r) => r.id === range)!.long
  useReveal(ref)

  return (
    <div ref={ref} className="flex flex-col gap-5">
      <DashboardHero range={range} onRange={setRange} />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {kpis.map((k) => (
          <KpiTile key={k.id} kpi={k} rangeLabel={rangeLabel} />
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
        <div className="min-w-0 lg:col-span-8">
          <RevenueCard range={range} />
        </div>
        <div className="min-w-0 lg:col-span-4">
          <PipelineCard />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
        <div className="min-w-0 lg:col-span-8">
          <RecentDeals />
        </div>
        <div className="min-w-0 lg:col-span-4">
          <LeadSources />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-12">
        <div className="min-w-0 xl:col-span-5">
          <ActivityCard />
        </div>
        <div className="min-w-0 xl:col-span-4">
          <AgendaCard />
        </div>
        <div className="min-w-0 md:col-span-2 xl:col-span-3">
          <Leaderboard />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
        <div className="min-w-0 lg:col-span-7">
          <ReachOutCard />
        </div>
        <div className="min-w-0 lg:col-span-5">
          <ClosingSoon />
        </div>
      </div>
    </div>
  )
}
