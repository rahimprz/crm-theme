import { PieChart } from 'lucide-react'
import { useCrm } from '@/store/crm'
import type { LeadSource } from '@/data/types'
import { Card, CardHeader } from '@/components/ui/Card'
import { Donut } from '@/components/charts/Donut'
import { sourceMeta } from '@/components/crm/meta'

const colors = ['var(--primary)', 'var(--accent)', 'var(--c3)', 'var(--c4)', 'var(--c5)', 'var(--faint)']

export function LeadSources() {
  const leads = useCrm((s) => s.leads)
  const counts = (Object.keys(sourceMeta) as LeadSource[])
    .map((k) => ({ key: k, label: sourceMeta[k].label, value: leads.filter((l) => l.source === k).length }))
    .filter((d) => d.value > 0)
    .sort((a, b) => b.value - a.value)
  const data = counts.map((c, i) => ({ ...c, color: colors[i] }))
  const total = leads.length

  return (
    <Card className="flex flex-col" data-reveal>
      <CardHeader icon={<PieChart />} title="Lead sources" subtitle="Where your leads come from" />
      <div className="flex flex-1 flex-col items-center gap-5 p-5 sm:flex-row lg:flex-col 2xl:flex-row">
        <Donut data={data} size={176} thickness={16} center={{ label: 'Total leads', value: total }} />
        <ul className="w-full min-w-0 flex-1 space-y-2.5">
          {data.map((d) => (
            <li key={d.key} className="flex items-center gap-2.5 text-[13px]">
              <span className="size-2.5 shrink-0 rounded-[3px]" style={{ background: d.color }} />
              <span className="flex-1 truncate text-muted">{d.label}</span>
              <span className="tabular font-semibold text-fg">{d.value}</span>
              <span className="tabular w-10 text-right text-[12px] text-faint">{Math.round((d.value / total) * 100)}%</span>
            </li>
          ))}
        </ul>
      </div>
    </Card>
  )
}
