import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { useLocation } from 'react-router-dom'
import {
  Plus,
  Upload,
  Search,
  Table2,
  Kanban,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  ListFilter,
  Flame,
  Magnet,
  Gauge,
  CircleDollarSign,
  UserRoundCheck,
  Trash2,
  X,
  Tags,
  Check,
  SearchX,
  Ellipsis,
  Mail,
  ArrowRightLeft,
} from 'lucide-react'
import { useCrm, memberById, currentUser } from '@/store/crm'
import { useUI } from '@/store/ui'
import { toast } from '@/store/toast'
import type { Lead, LeadStatus } from '@/data/types'
import { PageHeader } from '@/components/layout/PageHeader'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Tabs } from '@/components/ui/Tabs'
import { SegmentedControl } from '@/components/ui/SegmentedControl'
import { Checkbox } from '@/components/ui/Checkbox'
import { Avatar } from '@/components/ui/Avatar'
import { Popover, MenuItem } from '@/components/ui/Popover'
import { EmptyState } from '@/components/ui/EmptyState'
import { AnimatedNumber } from '@/components/ui/AnimatedNumber'
import { KanbanBoard } from '@/components/crm/KanbanBoard'
import { LeadCard } from '@/components/crm/LeadCard'
import { LeadStatusBadge, ScoreMeter, SourceLabel, leadStatusMeta, leadStatusOrder } from '@/components/crm/meta'
import { celebrate } from '@/lib/confetti'
import { gsap, reducedMotion } from '@/lib/gsap'
import { usePresence } from '@/hooks/usePresence'
import { money, relativeTime } from '@/lib/format'
import { cn } from '@/lib/cn'

type View = 'all' | 'hot' | 'unassigned' | 'mine'
type SortKey = 'name' | 'score' | 'value' | 'lastActivity'

const toneVar: Record<string, string> = {
  primary: 'var(--primary)',
  accent: 'var(--accent)',
  c3: 'var(--c3)',
  c5: 'var(--c5)',
  neutral: 'var(--faint)',
}

function StatTile({ icon, label, value, format, color }: { icon: React.ReactNode; label: string; value: number; format: 'number' | 'currency'; color: string }) {
  return (
    <div className="card spotlight flex items-center gap-3 p-3.5">
      <span className="flex size-9 shrink-0 items-center justify-center rounded-lg [&_svg]:size-4" style={{ background: `color-mix(in oklab, ${color} 15%, transparent)`, color }}>
        {icon}
      </span>
      <div className="min-w-0">
        <div className="truncate text-[12px] text-muted">{label}</div>
        <AnimatedNumber value={value} format={format} className="text-[18px] font-semibold text-fg" />
      </div>
    </div>
  )
}

function BulkBar({ selected, clear }: { selected: string[]; clear: () => void }) {
  const setLeadStatus = useCrm((s) => s.setLeadStatus)
  const updateLead = useCrm((s) => s.updateLead)
  const deleteLeads = useCrm((s) => s.deleteLeads)
  const [confirm, setConfirm] = useState(false)
  const { mounted, ref } = usePresence<HTMLDivElement>(selected.length > 0, {
    enter: (el) => gsap.fromTo(el, { y: 80, opacity: 0, scale: 0.9 }, { y: 0, opacity: 1, scale: 1, duration: 0.55, ease: 'back.out(1.6)' }),
    exit: (el) => gsap.to(el, { y: 60, opacity: 0, duration: 0.25, ease: 'power2.in' }),
  })
  if (!mounted) return null
  return (
    <div ref={ref} className="popover fixed bottom-[calc(88px+env(safe-area-inset-bottom))] left-1/2 z-50 flex -translate-x-1/2 items-center gap-1 p-1.5 md:bottom-8">
      <span className="tabular flex h-8 items-center gap-2 rounded-lg bg-primary/12 px-3 text-[13px] font-semibold text-primary">
        {selected.length} selected
      </span>
      <Popover
        width={200}
        trigger={({ toggle }) => (
          <Button variant="ghost" size="sm" icon={<Tags />} onClick={toggle}>
            <span className="hidden sm:inline">Status</span>
          </Button>
        )}
      >
        {({ close }) => (
          <div className="p-1.5">
            {leadStatusOrder.map((s) => (
              <MenuItem
                key={s}
                icon={<span className="size-2 rounded-full" style={{ background: toneVar[leadStatusMeta[s].tone] ?? 'var(--primary)' }} />}
                onClick={() => {
                  setLeadStatus(selected, s)
                  toast.success(`${selected.length} leads set to ${leadStatusMeta[s].label}`)
                  close()
                  clear()
                }}
              >
                {leadStatusMeta[s].label}
              </MenuItem>
            ))}
          </div>
        )}
      </Popover>
      <Button
        variant="ghost"
        size="sm"
        icon={<UserRoundCheck />}
        onClick={() => {
          selected.forEach((id) => updateLead(id, { ownerId: currentUser.id }))
          toast.success(`Assigned ${selected.length} leads to you`)
          clear()
        }}
      >
        <span className="hidden sm:inline">Assign to me</span>
      </Button>
      {confirm ? (
        <Button
          variant="danger"
          size="sm"
          icon={<Trash2 />}
          onClick={() => {
            deleteLeads(selected)
            toast.danger(`Deleted ${selected.length} leads`)
            setConfirm(false)
            clear()
          }}
        >
          Confirm delete
        </Button>
      ) : (
        <Button variant="ghost" size="sm" icon={<Trash2 />} onClick={() => setConfirm(true)} className="hover:text-danger">
          <span className="hidden sm:inline">Delete</span>
        </Button>
      )}
      <div className="mx-1 h-5 w-px bg-line" />
      <Button variant="ghost" size="icon-sm" onClick={() => { setConfirm(false); clear() }} aria-label="Clear selection">
        <X />
      </Button>
    </div>
  )
}

export default function Leads() {
  const leads = useCrm((s) => s.leads)
  const setLeadStatus = useCrm((s) => s.setLeadStatus)
  const convertLead = useCrm((s) => s.convertLead)
  const openDrawer = useUI((s) => s.openDrawer)
  const openQuickCreate = useUI((s) => s.openQuickCreate)
  const location = useLocation()
  const routeView = (location.state as { view?: View } | null)?.view
  const [view, setView] = useState<View>(routeView ?? 'all')
  // Saved views in the sidebar pass a preset through router state.
  useEffect(() => {
    if (routeView) setView(routeView)
  }, [location.key, routeView])
  const [layout, setLayout] = useState<'table' | 'board'>('table')
  const [query, setQuery] = useState('')
  const [statuses, setStatuses] = useState<LeadStatus[]>([])
  const [sort, setSort] = useState<{ key: SortKey; dir: 1 | -1 }>({ key: 'score', dir: -1 })
  const [selected, setSelected] = useState<string[]>([])
  const tableRef = useRef<HTMLDivElement>(null)

  const counts = {
    all: leads.length,
    hot: leads.filter((l) => l.score >= 75 && l.status !== 'lost').length,
    unassigned: leads.filter((l) => !l.ownerId).length,
    mine: leads.filter((l) => l.ownerId === currentUser.id).length,
  }

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase()
    return leads
      .filter((l) => (view === 'hot' ? l.score >= 75 && l.status !== 'lost' : view === 'unassigned' ? !l.ownerId : view === 'mine' ? l.ownerId === currentUser.id : true))
      .filter((l) => !statuses.length || statuses.includes(l.status))
      .filter((l) => !q || l.name.toLowerCase().includes(q) || l.company.toLowerCase().includes(q) || l.email.toLowerCase().includes(q))
      .sort((a, b) => {
        const k = sort.key
        const av = k === 'name' ? a.name : k === 'lastActivity' ? a.lastActivity : a[k]
        const bv = k === 'name' ? b.name : k === 'lastActivity' ? b.lastActivity : b[k]
        return (av > bv ? 1 : av < bv ? -1 : 0) * sort.dir
      })
  }, [leads, view, statuses, query, sort])

  // Rows cascade in whenever the result set changes.
  const rowKey = rows.map((r) => r.id).join()
  useLayoutEffect(() => {
    if (reducedMotion() || layout !== 'table') return
    const els = tableRef.current?.querySelectorAll('[data-row]')
    if (!els?.length) return
    gsap.fromTo(els, { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.4, stagger: 0.018, ease: 'volt.out' })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rowKey.length, view, statuses.join(), layout])

  const allChecked = rows.length > 0 && rows.every((r) => selected.includes(r.id))
  const someChecked = rows.some((r) => selected.includes(r.id))
  const toggleAll = () => setSelected(allChecked ? [] : rows.map((r) => r.id))
  const toggleOne = (id: string) => setSelected((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]))

  const SortHead = ({ k, children, align }: { k: SortKey; children: React.ReactNode; align?: 'right' }) => (
    <button
      type="button"
      onClick={() => setSort((s) => ({ key: k, dir: s.key === k ? ((s.dir * -1) as 1 | -1) : -1 }))}
      className={cn('inline-flex items-center gap-1 transition-colors hover:text-fg', sort.key === k && 'text-fg', align === 'right' && 'flex-row-reverse')}
    >
      {children}
      {sort.key === k ? sort.dir === 1 ? <ArrowUp className="size-3" /> : <ArrowDown className="size-3" /> : <ArrowUpDown className="size-3 opacity-40" />}
    </button>
  )

  const hotValue = leads.filter((l) => l.status !== 'lost').reduce((s, l) => s + l.value, 0)
  const avgScore = Math.round(leads.reduce((s, l) => s + l.score, 0) / Math.max(1, leads.length))

  return (
    <div>
      <PageHeader
        eyebrow="Records"
        title="Leads"
        description="Everyone who might buy. Score them, qualify them, and convert the best into deals."
        actions={
          <>
            <Button variant="secondary" icon={<Upload />} onClick={() => toast.info('Import leads', 'Drop a CSV with name, email and company columns.')}>
              Import
            </Button>
            <Button variant="primary" icon={<Plus />} onClick={() => openQuickCreate('lead')}>
              New lead
            </Button>
          </>
        }
      />

      <div className="mb-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatTile icon={<Magnet />} label="Total leads" value={leads.length} format="number" color="var(--primary)" />
        <StatTile icon={<Flame />} label="Hot (score 75+)" value={counts.hot} format="number" color="var(--accent)" />
        <StatTile icon={<Gauge />} label="Average score" value={avgScore} format="number" color="var(--c3)" />
        <StatTile icon={<CircleDollarSign />} label="Potential value" value={hotValue} format="currency" color="var(--c5)" />
      </div>

      <div className="card overflow-hidden">
        <div className="flex flex-col gap-3 border-b border-line px-4 pt-2 xl:flex-row xl:items-center xl:justify-between">
          <Tabs
            className="border-0"
            value={view}
            onChange={(v) => {
              setView(v)
              setSelected([])
            }}
            tabs={[
              { value: 'all', label: 'All leads', count: counts.all },
              { value: 'hot', label: 'Hot', count: counts.hot, icon: <Flame className="text-accent" /> },
              { value: 'unassigned', label: 'Unassigned', count: counts.unassigned },
              { value: 'mine', label: 'Mine', count: counts.mine },
            ]}
          />
          <div className="flex flex-wrap items-center gap-2 pb-3 xl:pb-0">
            <div className="w-full sm:w-56">
              <Input id="lead-search" icon={<Search />} placeholder="Search leads…" value={query} onChange={(e) => setQuery(e.target.value)} className="h-9" />
            </div>
            <Popover
              width={220}
              align="end"
              trigger={({ toggle }) => (
                <Button variant="secondary" size="md" icon={<ListFilter />} onClick={toggle}>
                  Status
                  {statuses.length > 0 && <span className="tabular rounded-full bg-primary px-1.5 text-[11px] text-primary-fg">{statuses.length}</span>}
                </Button>
              )}
            >
              <div className="p-1.5">
                {leadStatusOrder.map((s) => {
                  const on = statuses.includes(s)
                  return (
                    <MenuItem key={s} icon={<span className={cn('flex size-4 items-center justify-center rounded border', on ? 'border-primary bg-primary text-primary-fg' : 'border-line-strong')}>{on && <Check className="size-3" strokeWidth={3} />}</span>} onClick={() => setStatuses((x) => (on ? x.filter((y) => y !== s) : [...x, s]))}>
                      {leadStatusMeta[s].label}
                    </MenuItem>
                  )
                })}
                {statuses.length > 0 && (
                  <>
                    <div className="my-1 h-px bg-line" />
                    <MenuItem icon={<X />} onClick={() => setStatuses([])}>Clear filter</MenuItem>
                  </>
                )}
              </div>
            </Popover>
            <SegmentedControl
              value={layout}
              onChange={setLayout}
              ariaLabel="Layout"
              options={[
                { value: 'table', label: 'Table', icon: <Table2 /> },
                { value: 'board', label: 'Board', icon: <Kanban /> },
              ]}
            />
          </div>
        </div>

        {rows.length === 0 ? (
          <EmptyState icon={<SearchX />} title="No leads match" description="Try a different search, or clear the status filter to see everyone." action={<Button variant="secondary" onClick={() => { setQuery(''); setStatuses([]); setView('all') }}>Reset filters</Button>} />
        ) : layout === 'table' ? (
          <div ref={tableRef}>
            {/* Desktop table */}
            <div className="hidden overflow-x-auto md:block">
              <table className="w-full min-w-[980px] text-left text-[13px]">
                <thead>
                  <tr className="border-b border-line text-[11.5px] text-faint">
                    <th className="w-12 py-3 pl-4">
                      <Checkbox checked={allChecked} indeterminate={!allChecked && someChecked} onChange={toggleAll} label="Select all" />
                    </th>
                    <th className="py-3 pr-3 font-medium"><SortHead k="name">Lead</SortHead></th>
                    <th className="px-3 py-3 font-medium">Company</th>
                    <th className="px-3 py-3 font-medium">Status</th>
                    <th className="px-3 py-3 font-medium"><SortHead k="score">Score</SortHead></th>
                    <th className="px-3 py-3 font-medium">Source</th>
                    <th className="px-3 py-3 text-right font-medium"><SortHead k="value" align="right">Value</SortHead></th>
                    <th className="px-3 py-3 font-medium">Owner</th>
                    <th className="px-3 py-3 font-medium"><SortHead k="lastActivity">Last activity</SortHead></th>
                    <th className="w-12" />
                  </tr>
                </thead>
                <tbody>
                  {rows.map((l) => (
                    <LeadRow
                      key={l.id}
                      lead={l}
                      checked={selected.includes(l.id)}
                      onCheck={() => toggleOne(l.id)}
                      onOpen={() => openDrawer({ type: 'lead', id: l.id })}
                      onConvert={(e) => {
                        convertLead(l.id)
                        celebrate({ x: e.clientX, y: e.clientY })
                        toast.celebrate('Lead converted', `${l.company} is now a deal.`)
                      }}
                    />
                  ))}
                </tbody>
              </table>
            </div>
            {/* Phone list */}
            <ul className="divide-y divide-line md:hidden">
              {rows.map((l) => (
                <li key={l.id} data-row>
                  <button type="button" onClick={() => openDrawer({ type: 'lead', id: l.id })} className="flex w-full items-center gap-3 px-4 py-3 text-left active:bg-surface-2">
                    <Avatar name={l.name} hue={l.hue} size="md" />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <span className="truncate text-[14px] font-medium text-fg">{l.name}</span>
                        <span className="tabular text-[13px] font-semibold text-fg">{money(l.value, true)}</span>
                      </div>
                      <div className="mt-0.5 flex items-center justify-between gap-2">
                        <span className="truncate text-[12.5px] text-muted">{l.company}</span>
                        <LeadStatusBadge status={l.status} />
                      </div>
                      <ScoreMeter score={l.score} className="mt-2" />
                    </div>
                  </button>
                </li>
              ))}
            </ul>
            <div className="flex items-center justify-between border-t border-line px-4 py-3 text-[12px] text-faint">
              <span>
                Showing <span className="tabular text-fg">{rows.length}</span> of <span className="tabular">{leads.length}</span> leads
              </span>
              <span className="hidden sm:inline">Tip: select rows to change status in bulk</span>
            </div>
          </div>
        ) : (
          <div className="p-4">
            <KanbanBoard
              columns={leadStatusOrder.map((s) => ({
                id: s,
                title: leadStatusMeta[s].label,
                color: toneVar[leadStatusMeta[s].tone] ?? 'var(--primary)',
                items: rows.filter((l) => l.status === s),
                summary: <span className="tabular text-[12px] text-faint">{money(rows.filter((l) => l.status === s).reduce((a, l) => a + l.value, 0), true)} potential</span>,
              }))}
              getId={(l) => l.id}
              renderCard={(l, { overlay }) => <LeadCard lead={l} overlay={overlay} />}
              onMove={(id, to) => {
                setLeadStatus([id], to as LeadStatus)
                toast.info(`Moved to ${leadStatusMeta[to as LeadStatus].label}`)
              }}
              onAdd={() => openQuickCreate('lead')}
            />
          </div>
        )}
      </div>

      <BulkBar selected={selected} clear={() => setSelected([])} />
    </div>
  )
}

function LeadRow({ lead: l, checked, onCheck, onOpen, onConvert }: { lead: Lead; checked: boolean; onCheck: () => void; onOpen: () => void; onConvert: (e: React.MouseEvent) => void }) {
  const owner = memberById(l.ownerId)
  return (
    <tr data-row onClick={onOpen} className={cn('group cursor-pointer border-b border-line/60 transition-colors last:border-0 hover:bg-surface-2', checked && 'bg-primary/[0.06] hover:bg-primary/[0.08]')} style={{ height: 'var(--row-h)' }}>
      <td className="pl-4" onClick={(e) => e.stopPropagation()}>
        <Checkbox checked={checked} onChange={onCheck} label={`Select ${l.name}`} />
      </td>
      <td className="pr-3">
        <div className="flex items-center gap-3">
          <Avatar name={l.name} hue={l.hue} size="sm" />
          <div className="min-w-0">
            <div className="truncate font-medium text-fg transition-colors group-hover:text-primary">{l.name}</div>
            <div className="truncate text-[12px] text-faint">{l.email}</div>
          </div>
        </div>
      </td>
      <td className="px-3">
        <div className="truncate text-fg">{l.company}</div>
        <div className="truncate text-[12px] text-faint">{l.title}</div>
      </td>
      <td className="px-3"><LeadStatusBadge status={l.status} /></td>
      <td className="px-3"><ScoreMeter score={l.score} /></td>
      <td className="px-3"><SourceLabel source={l.source} /></td>
      <td className="tabular px-3 text-right font-semibold text-fg">{money(l.value)}</td>
      <td className="px-3">
        {owner ? (
          <span className="flex items-center gap-2 text-muted">
            <Avatar name={owner.name} hue={owner.hue} size="xs" />
            {owner.name.split(' ')[0]}
          </span>
        ) : (
          <span className="rounded-md border border-dashed border-warning/40 px-1.5 py-0.5 text-[11.5px] text-warning">Unassigned</span>
        )}
      </td>
      <td className="px-3 text-[12.5px] text-muted">{relativeTime(l.lastActivity)}</td>
      <td className="pr-3" onClick={(e) => e.stopPropagation()}>
        <Popover
          width={200}
          trigger={({ toggle }) => (
            <button type="button" onClick={toggle} className="flex size-8 items-center justify-center rounded-lg text-faint opacity-60 transition-all group-hover:opacity-100 hover:bg-surface-3 hover:text-fg" aria-label="Lead actions">
              <Ellipsis className="size-4" />
            </button>
          )}
        >
          {({ close }) => (
            <div className="p-1.5">
              <MenuItem icon={<Mail />} onClick={() => { close(); toast.info('Email draft opened', l.email) }}>Send email</MenuItem>
              <MenuItem icon={<ArrowRightLeft />} onClick={(e) => { close(); onConvert(e) }}>
                Convert to deal
              </MenuItem>
              <MenuItem icon={<UserRoundCheck />} onClick={() => { close(); onOpen() }}>Open details</MenuItem>
            </div>
          )}
        </Popover>
      </td>
    </tr>
  )
}
