import { useMemo, useState } from 'react'
import { Plus, Kanban, Table2, Search, CircleDollarSign, Scale, Trophy, Ruler, Percent } from 'lucide-react'
import { useCrm, memberById } from '@/store/crm'
import { useUI } from '@/store/ui'
import { toast } from '@/store/toast'
import { members, stageMeta, stageOrder } from '@/data/mock'
import type { Deal, DealStage } from '@/data/types'
import { PageHeader } from '@/components/layout/PageHeader'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { SegmentedControl } from '@/components/ui/SegmentedControl'
import { Avatar } from '@/components/ui/Avatar'
import { CompanyLogo } from '@/components/ui/CompanyLogo'
import { Ring } from '@/components/ui/Progress'
import { Tooltip } from '@/components/ui/Tooltip'
import { AnimatedNumber } from '@/components/ui/AnimatedNumber'
import { KanbanBoard } from '@/components/crm/KanbanBoard'
import { DealCard } from '@/components/crm/DealCard'
import { PriorityFlag, StageBadge } from '@/components/crm/meta'
import { celebrate } from '@/lib/confetti'
import { money, shortDate } from '@/lib/format'
import { cn } from '@/lib/cn'

function Summary({ deals }: { deals: Deal[] }) {
  const open = deals.filter((d) => d.stage !== 'won' && d.stage !== 'lost')
  const won = deals.filter((d) => d.stage === 'won')
  const lost = deals.filter((d) => d.stage === 'lost')
  const stats = [
    { icon: <CircleDollarSign />, label: 'Open pipeline', value: open.reduce((s, d) => s + d.value, 0), format: 'currency' as const, color: 'var(--primary)' },
    { icon: <Scale />, label: 'Weighted forecast', value: open.reduce((s, d) => s + (d.value * d.probability) / 100, 0), format: 'currency' as const, color: 'var(--accent)' },
    { icon: <Trophy />, label: 'Won', value: won.reduce((s, d) => s + d.value, 0), format: 'currency' as const, color: 'var(--success)' },
    { icon: <Ruler />, label: 'Average deal', value: deals.reduce((s, d) => s + d.value, 0) / Math.max(1, deals.length), format: 'currency' as const, color: 'var(--c3)' },
    { icon: <Percent />, label: 'Win rate', value: (won.length / Math.max(1, won.length + lost.length)) * 100, format: 'percent' as const, color: 'var(--c5)' },
  ]
  return (
    <div className="card mb-5 grid grid-cols-2 divide-line sm:grid-cols-3 lg:grid-cols-5 lg:divide-x">
      {stats.map((s, i) => (
        <div key={s.label} className={cn('flex items-center gap-3 p-4', i === 4 && 'col-span-2 sm:col-span-1')}>
          <span className="flex size-9 shrink-0 items-center justify-center rounded-lg [&_svg]:size-4" style={{ background: `color-mix(in oklab, ${s.color} 15%, transparent)`, color: s.color }}>
            {s.icon}
          </span>
          <div className="min-w-0">
            <div className="truncate text-[12px] text-muted">{s.label}</div>
            <AnimatedNumber value={s.value} format={s.format} className="text-[19px] font-semibold tracking-[-0.02em] text-fg" />
          </div>
        </div>
      ))}
    </div>
  )
}

export default function Deals() {
  const deals = useCrm((s) => s.deals)
  const companies = useCrm((s) => s.companies)
  const moveDeal = useCrm((s) => s.moveDeal)
  const openQuickCreate = useUI((s) => s.openQuickCreate)
  const openDrawer = useUI((s) => s.openDrawer)
  const [layout, setLayout] = useState<'board' | 'table'>('board')
  const [owners, setOwners] = useState<string[]>([])
  const [query, setQuery] = useState('')

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return deals.filter((d) => (!owners.length || owners.includes(d.ownerId)) && (!q || d.name.toLowerCase().includes(q) || d.product.toLowerCase().includes(q)))
  }, [deals, owners, query])

  const total = filtered.filter((d) => d.stage !== 'lost').reduce((s, d) => s + d.value, 0) || 1

  const onMove = (id: string, to: string, _from: string, point?: { x: number; y: number }) => {
    const deal = deals.find((d) => d.id === id)
    if (!deal) return
    const stage = to as DealStage
    moveDeal(id, stage)
    if (stage === 'won') {
      celebrate(point)
      toast.celebrate('Deal won!', `${deal.name} · ${money(deal.value)}`)
    } else if (stage === 'lost') toast.warning('Deal marked as lost', deal.name)
    else toast.info(`Moved to ${stageMeta[stage].label}`, `${deal.name} · ${stageMeta[stage].probability}% probability`)
  }

  return (
    <div>
      <PageHeader
        eyebrow="Records"
        title="Deals pipeline"
        description="Drag deals between stages. Drop one on Closed won to celebrate."
        actions={
          <>
            <SegmentedControl
              value={layout}
              onChange={setLayout}
              options={[
                { value: 'board', label: 'Board', icon: <Kanban /> },
                { value: 'table', label: 'Table', icon: <Table2 /> },
              ]}
            />
            <Button variant="primary" icon={<Plus />} onClick={() => openQuickCreate('deal')}>
              New deal
            </Button>
          </>
        }
      />

      <Summary deals={filtered} />

      <div className="mb-4 flex flex-wrap items-center gap-3">
        <div className="w-full sm:w-64">
          <Input id="deal-search" icon={<Search />} placeholder="Search deals or products…" value={query} onChange={(e) => setQuery(e.target.value)} className="h-9" />
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[12px] text-faint">Owner</span>
          <div className="flex -space-x-1.5">
            {members.slice(0, 5).map((m) => {
              const on = owners.includes(m.id)
              return (
                <Tooltip key={m.id} content={m.name} side="bottom">
                  <button
                    type="button"
                    onClick={() => setOwners((o) => (on ? o.filter((x) => x !== m.id) : [...o, m.id]))}
                    className={cn('rounded-full transition-all duration-300 hover:z-10 hover:-translate-y-0.5', on ? 'z-10 ring-2 ring-primary ring-offset-2 ring-offset-bg' : owners.length ? 'opacity-40 grayscale' : '')}
                    aria-pressed={on}
                  >
                    <Avatar name={m.name} hue={m.hue} size="sm" ring />
                  </button>
                </Tooltip>
              )
            })}
          </div>
          {owners.length > 0 && (
            <button type="button" onClick={() => setOwners([])} className="text-[12px] text-primary hover:underline">
              Clear
            </button>
          )}
        </div>
      </div>

      {layout === 'board' ? (
        <KanbanBoard
          columns={stageOrder.map((s) => {
            const items = filtered.filter((d) => d.stage === s)
            const value = items.reduce((a, d) => a + d.value, 0)
            return {
              id: s,
              title: stageMeta[s].label,
              color: stageMeta[s].color,
              items,
              summary: (
                <div>
                  <div className="flex items-baseline justify-between text-[12px]">
                    <span className="tabular font-semibold text-fg">{money(value, true)}</span>
                    {s !== 'lost' && <span className="tabular text-faint">{Math.round((value / total) * 100)}%</span>}
                  </div>
                  <div className="mt-1.5 h-1 overflow-hidden rounded-full bg-surface-3">
                    <div className="h-full rounded-full transition-[width] duration-700" style={{ width: `${s === 'lost' ? 0 : (value / total) * 100}%`, background: stageMeta[s].color }} />
                  </div>
                </div>
              ),
            }
          })}
          getId={(d) => d.id}
          renderCard={(d, { overlay }) => <DealCard deal={d} overlay={overlay} />}
          onMove={onMove}
          onAdd={() => openQuickCreate('deal')}
        />
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] text-left text-[13px]">
              <thead>
                <tr className="border-b border-line text-[11.5px] text-faint">
                  <th className="px-5 py-3 font-medium">Deal</th>
                  <th className="px-3 py-3 font-medium">Stage</th>
                  <th className="px-3 py-3 text-right font-medium">Value</th>
                  <th className="px-3 py-3 font-medium">Product</th>
                  <th className="px-3 py-3 font-medium">Close date</th>
                  <th className="px-3 py-3 font-medium">Priority</th>
                  <th className="px-3 py-3 font-medium">Owner</th>
                  <th className="px-5 py-3 text-right font-medium">Win</th>
                </tr>
              </thead>
              <tbody>
                {[...filtered].sort((a, b) => stageOrder.indexOf(a.stage) - stageOrder.indexOf(b.stage) || b.value - a.value).map((d) => {
                  const co = companies.find((c) => c.id === d.companyId)
                  const owner = memberById(d.ownerId)
                  return (
                    <tr key={d.id} onClick={() => openDrawer({ type: 'deal', id: d.id })} className="group cursor-pointer border-b border-line/60 last:border-0 hover:bg-surface-2" style={{ height: 'var(--row-h)' }}>
                      <td className="px-5">
                        <div className="flex items-center gap-3">
                          {co && <CompanyLogo shape={co.logo} color={co.color} size="sm" />}
                          <div className="min-w-0">
                            <div className="truncate font-medium text-fg group-hover:text-primary">{d.name}</div>
                            <div className="truncate text-[12px] text-faint">{co?.name}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-3"><StageBadge stage={d.stage} /></td>
                      <td className="tabular px-3 text-right font-semibold text-fg">{money(d.value)}</td>
                      <td className="px-3 text-muted">{d.product}</td>
                      <td className="tabular px-3 text-muted">{shortDate(d.closeDate)}</td>
                      <td className="px-3"><PriorityFlag priority={d.priority} showLabel /></td>
                      <td className="px-3">{owner && <span className="flex items-center gap-2 text-muted"><Avatar name={owner.name} hue={owner.hue} size="xs" />{owner.name.split(' ')[0]}</span>}</td>
                      <td className="px-5"><div className="flex justify-end"><Ring value={d.probability} size={30} stroke={3}><span className="tabular text-[9px] font-semibold text-muted">{d.probability}</span></Ring></div></td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
