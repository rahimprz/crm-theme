import { useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Search, Users, Star, ArrowUpRight, SearchX } from 'lucide-react'
import { useCrm } from '@/store/crm'
import { useUI } from '@/store/ui'
import type { Company, CompanyTier } from '@/data/types'
import { PageHeader } from '@/components/layout/PageHeader'
import { Button } from '@/components/ui/Button'
import { Input, Select } from '@/components/ui/Input'
import { SegmentedControl } from '@/components/ui/SegmentedControl'
import { CompanyLogo } from '@/components/ui/CompanyLogo'
import { AvatarStack } from '@/components/ui/Avatar'
import { Ring } from '@/components/ui/Progress'
import { Badge } from '@/components/ui/Badge'
import { EmptyState } from '@/components/ui/EmptyState'
import { useReveal } from '@/hooks/useReveal'
import { gsap, reducedMotion } from '@/lib/gsap'
import { money, number } from '@/lib/format'
import { cn } from '@/lib/cn'

type Sort = 'arr' | 'health' | 'name' | 'employees'

/** Card that tilts toward the cursor in 3D. */
function TiltCard({ children, onClick }: { children: React.ReactNode; onClick: () => void }) {
  const ref = useRef<HTMLDivElement>(null)
  const move = (e: React.PointerEvent) => {
    if (e.pointerType !== 'mouse' || reducedMotion() || !ref.current) return
    const r = ref.current.getBoundingClientRect()
    const x = (e.clientX - r.left) / r.width - 0.5
    const y = (e.clientY - r.top) / r.height - 0.5
    gsap.to(ref.current, { rotateY: x * 8, rotateX: -y * 8, duration: 0.5, ease: 'power3.out', transformPerspective: 900 })
  }
  const leave = () => ref.current && gsap.to(ref.current, { rotateY: 0, rotateX: 0, duration: 0.8, ease: 'elastic.out(1, 0.5)' })
  return (
    <div ref={ref} data-reveal onPointerMove={move} onPointerLeave={leave} onClick={onClick} className="card spotlight group flex cursor-pointer flex-col p-5 [transform-style:preserve-3d] hover:border-line-strong">
      {children}
    </div>
  )
}

const healthTone = (h: number) => (h >= 75 ? 'var(--success)' : h >= 55 ? 'var(--accent)' : 'var(--danger)')

export default function Companies() {
  const companies = useCrm((s) => s.companies)
  const contacts = useCrm((s) => s.contacts)
  const deals = useCrm((s) => s.deals)
  const openQuickCreate = useUI((s) => s.openQuickCreate)
  const navigate = useNavigate()
  const [tier, setTier] = useState<CompanyTier | 'all'>('all')
  const [sort, setSort] = useState<Sort>('arr')
  const [query, setQuery] = useState('')
  const ref = useRef<HTMLDivElement>(null)

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase()
    return companies
      .filter((c) => (tier === 'all' || c.tier === tier) && (!q || c.name.toLowerCase().includes(q) || c.industry.toLowerCase().includes(q) || c.city.toLowerCase().includes(q)))
      .sort((a, b) => (sort === 'name' ? a.name.localeCompare(b.name) : (b[sort] as number) - (a[sort] as number)))
  }, [companies, tier, sort, query])

  useReveal(ref, [tier, sort, rows.length])

  const peopleAt = (c: Company) => contacts.filter((p) => p.companyId === c.id)
  const openDeals = (c: Company) => deals.filter((d) => d.companyId === c.id && d.stage !== 'won' && d.stage !== 'lost')

  return (
    <div ref={ref}>
      <PageHeader
        eyebrow="Records"
        title="Companies"
        description="Accounts you sell to, with health, revenue and open opportunities at a glance."
        actions={
          <Button variant="primary" icon={<Plus />} onClick={() => openQuickCreate('company')}>
            New company
          </Button>
        }
      />
      <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-center">
        <div className="no-scrollbar -mx-4 overflow-x-auto px-4 md:mx-0 md:px-0">
          <SegmentedControl
            value={tier}
            onChange={setTier}
            options={[
              { value: 'all', label: 'All' },
              { value: 'Enterprise', label: 'Enterprise' },
              { value: 'Mid-market', label: 'Mid-market' },
              { value: 'SMB', label: 'SMB' },
            ]}
          />
        </div>
        <div className="flex flex-1 items-center gap-2 md:justify-end">
          <div className="flex-1 md:w-64 md:flex-none">
            <Input id="company-search" icon={<Search />} placeholder="Search companies…" value={query} onChange={(e) => setQuery(e.target.value)} className="h-9" />
          </div>
          <div className="w-40">
            <Select id="company-sort" value={sort} onChange={(e) => setSort(e.target.value as Sort)} className="h-9" aria-label="Sort by">
              <option value="arr">Sort: ARR</option>
              <option value="health">Sort: Health</option>
              <option value="employees">Sort: Size</option>
              <option value="name">Sort: Name</option>
            </Select>
          </div>
        </div>
      </div>

      {rows.length === 0 ? (
        <div className="card">
          <EmptyState icon={<SearchX />} title="No companies match" description="Try a different search or tier." />
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {rows.map((c) => {
            const people = peopleAt(c)
            const od = openDeals(c)
            return (
              <TiltCard key={c.id} onClick={() => navigate(`/companies/${c.id}`)}>
                <div className="flex items-start justify-between gap-3" style={{ transform: 'translateZ(30px)' }}>
                  <CompanyLogo shape={c.logo} color={c.color} size="lg" className="transition-transform duration-500 group-hover:scale-110 group-hover:rotate-[-6deg]" />
                  <div className="flex items-center gap-1.5">
                    {c.favorite && <Star className="size-4 fill-accent text-accent" />}
                    <ArrowUpRight className="size-4 text-faint transition-all group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-primary" />
                  </div>
                </div>
                <div className="mt-4" style={{ transform: 'translateZ(20px)' }}>
                  <h3 className="text-[16px] font-semibold text-fg">{c.name}</h3>
                  <p className="text-[12.5px] text-muted">
                    {c.industry} · {c.city}
                  </p>
                </div>
                <p className="mt-3 line-clamp-2 text-[12.5px] text-faint">{c.description}</p>
                <div className="mt-4 grid grid-cols-3 gap-2 rounded-lg border border-line bg-surface-2 p-3">
                  <div>
                    <div className="text-[11px] text-faint">ARR</div>
                    <div className="tabular text-[14px] font-semibold text-fg">{money(c.arr, true)}</div>
                  </div>
                  <div>
                    <div className="text-[11px] text-faint">Employees</div>
                    <div className="tabular text-[14px] font-semibold text-fg">{number(c.employees, true)}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Ring value={c.health} size={30} stroke={3.5} color={healthTone(c.health)}>
                      <span className="tabular text-[9px] font-semibold text-muted">{c.health}</span>
                    </Ring>
                    <div className="text-[11px] leading-tight text-faint">Health</div>
                  </div>
                </div>
                <div className="mt-4 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {people.length > 0 ? (
                      <AvatarStack size="xs" people={people.map((p) => ({ name: `${p.firstName} ${p.lastName}`, hue: p.hue }))} />
                    ) : (
                      <Users className="size-4 text-faint" />
                    )}
                    <span className="text-[12px] text-faint">{people.length} people</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Badge tone={c.tier === 'Enterprise' ? 'accent' : c.tier === 'Mid-market' ? 'primary' : 'neutral'}>{c.tier}</Badge>
                    {od.length > 0 && <Badge tone="success">{od.length} open</Badge>}
                  </div>
                </div>
                <div className={cn('mt-3 h-1 overflow-hidden rounded-full bg-surface-3')}>
                  <div className="h-full rounded-full" style={{ width: `${c.health}%`, background: healthTone(c.health) }} />
                </div>
              </TiltCard>
            )
          })}
        </div>
      )}
    </div>
  )
}
