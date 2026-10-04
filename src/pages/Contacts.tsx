import { useLayoutEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Search, LayoutGrid, Rows3, Mail, Phone, Star, MapPin, SearchX } from 'lucide-react'
import { useCrm } from '@/store/crm'
import { useUI } from '@/store/ui'
import { toast } from '@/store/toast'
import type { Contact, ContactStage } from '@/data/types'
import { PageHeader } from '@/components/layout/PageHeader'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { SegmentedControl } from '@/components/ui/SegmentedControl'
import { Avatar } from '@/components/ui/Avatar'
import { CompanyLogo } from '@/components/ui/CompanyLogo'
import { Badge } from '@/components/ui/Badge'
import { EmptyState } from '@/components/ui/EmptyState'
import { contactStageMeta } from '@/components/crm/meta'
import { Flip, gsap, reducedMotion } from '@/lib/gsap'
import { relativeTime } from '@/lib/format'
import { cn } from '@/lib/cn'

const stages: (ContactStage | 'all')[] = ['all', 'customer', 'prospect', 'partner', 'churned']

/**
 * People directory. Switching between grid and list morphs every card into
 * its new place with GSAP Flip.
 */
export default function Contacts() {
  const contacts = useCrm((s) => s.contacts)
  const companies = useCrm((s) => s.companies)
  const toggleFavorite = useCrm((s) => s.toggleFavorite)
  const openQuickCreate = useUI((s) => s.openQuickCreate)
  const navigate = useNavigate()
  const [layout, setLayout] = useState<'grid' | 'list'>('grid')
  const [stage, setStage] = useState<ContactStage | 'all'>('all')
  const [query, setQuery] = useState('')
  const grid = useRef<HTMLDivElement>(null)
  const flipState = useRef<Flip.FlipState | null>(null)

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase()
    return contacts.filter(
      (c) => (stage === 'all' || c.stage === stage) && (!q || `${c.firstName} ${c.lastName}`.toLowerCase().includes(q) || c.title.toLowerCase().includes(q) || c.email.includes(q)),
    )
  }, [contacts, stage, query])

  const change = (fn: () => void) => {
    if (grid.current && !reducedMotion()) flipState.current = Flip.getState(grid.current.querySelectorAll('[data-flip]'))
    fn()
  }

  useLayoutEffect(() => {
    const state = flipState.current
    if (!state || !grid.current) return
    flipState.current = null
    Flip.from(state, {
      duration: 0.7,
      ease: 'volt.out',
      stagger: 0.012,
      absolute: true,
      onEnter: (els) => gsap.fromTo(els, { opacity: 0, scale: 0.85 }, { opacity: 1, scale: 1, duration: 0.5 }),
      onLeave: (els) => gsap.to(els, { opacity: 0, scale: 0.85, duration: 0.3 }),
    })
  }, [layout, stage, rows.length])

  useLayoutEffect(() => {
    if (reducedMotion() || !grid.current) return
    gsap.fromTo(grid.current.querySelectorAll('[data-flip]'), { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: 0.6, stagger: 0.02, ease: 'volt.out' })
  }, [])

  const company = (c: Contact) => companies.find((co) => co.id === c.companyId)

  return (
    <div>
      <PageHeader
        eyebrow="Records"
        title="People"
        description={`${contacts.length} contacts across ${companies.length} companies.`}
        actions={
          <Button variant="primary" icon={<Plus />} onClick={() => openQuickCreate('contact')}>
            New person
          </Button>
        }
      />

      <div className="mb-5 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="no-scrollbar -mx-4 flex gap-1.5 overflow-x-auto px-4 lg:mx-0 lg:px-0">
          {stages.map((s) => {
            const count = s === 'all' ? contacts.length : contacts.filter((c) => c.stage === s).length
            return (
              <button
                key={s}
                type="button"
                onClick={() => change(() => setStage(s))}
                className={cn(
                  'flex h-8 shrink-0 items-center gap-2 rounded-full border px-3 text-[12.5px] font-medium transition-all',
                  stage === s ? 'border-primary/50 bg-primary/12 text-fg' : 'border-line text-muted hover:border-line-strong hover:text-fg',
                )}
              >
                {s === 'all' ? 'Everyone' : contactStageMeta[s].label}
                <span className="tabular text-[11px] text-faint">{count}</span>
              </button>
            )
          })}
        </div>
        <div className="flex items-center gap-2">
          <div className="flex-1 sm:w-64 sm:flex-none">
            <Input id="contact-search" icon={<Search />} placeholder="Search people…" value={query} onChange={(e) => setQuery(e.target.value)} className="h-9" />
          </div>
          <SegmentedControl
            value={layout}
            onChange={(v) => change(() => setLayout(v))}
            ariaLabel="Layout"
            options={[
              { value: 'grid', label: '', icon: <LayoutGrid /> },
              { value: 'list', label: '', icon: <Rows3 /> },
            ]}
          />
        </div>
      </div>

      {rows.length === 0 ? (
        <div className="card">
          <EmptyState icon={<SearchX />} title="Nobody matches" description="Try another name or switch back to Everyone." />
        </div>
      ) : (
        <div ref={grid} className={cn(layout === 'grid' ? 'grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4' : 'card flex flex-col divide-y divide-line overflow-hidden')}>
          {rows.map((c) => {
            const co = company(c)
            const name = `${c.firstName} ${c.lastName}`
            const st = contactStageMeta[c.stage]
            return (
              <div
                key={c.id}
                data-flip
                data-flip-id={c.id}
                onClick={() => navigate(`/contacts/${c.id}`)}
                className={cn(
                  'group relative cursor-pointer',
                  layout === 'grid' ? 'card spotlight flex flex-col gap-4 p-5 transition-[border-color] hover:border-line-strong' : 'flex items-center gap-4 px-4 py-3 hover:bg-surface-2',
                )}
              >
                <div className={cn('flex items-center gap-3', layout === 'list' && 'min-w-0 flex-1')}>
                  <Avatar name={name} hue={c.hue} size={layout === 'grid' ? 'lg' : 'md'} status={c.stage === 'customer' ? 'online' : undefined} />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <span className="truncate text-[14px] font-semibold text-fg group-hover:text-primary">{name}</span>
                      {c.favorite && <Star className="size-3.5 shrink-0 fill-accent text-accent" />}
                    </div>
                    <div className="truncate text-[12.5px] text-muted">{c.title}</div>
                  </div>
                  {layout === 'grid' && <Badge tone={st.tone}>{st.label}</Badge>}
                </div>

                {layout === 'grid' ? (
                  <>
                    <div className="flex items-center gap-2 rounded-lg border border-line bg-surface-2 p-2.5">
                      {co && <CompanyLogo shape={co.logo} color={co.color} size="sm" />}
                      <div className="min-w-0 flex-1">
                        <div className="truncate text-[12.5px] font-medium text-fg">{co?.name}</div>
                        <div className="flex items-center gap-1 truncate text-[11.5px] text-faint">
                          <MapPin className="size-3" /> {c.city}
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {c.tags.map((t) => (
                        <span key={t} className="rounded-md bg-surface-3 px-2 py-0.5 text-[11px] text-muted">{t}</span>
                      ))}
                    </div>
                    <div className="mt-auto flex items-center justify-between border-t border-line pt-3">
                      <span className="text-[11.5px] text-faint">Contacted {relativeTime(c.lastContacted).toLowerCase()}</span>
                      <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
                        <QuickAction icon={<Mail />} label="Email" onClick={() => toast.info('Email draft opened', c.email)} />
                        <QuickAction icon={<Phone />} label="Call" onClick={() => toast.info('Calling…', c.phone)} />
                        <QuickAction
                          icon={<Star className={cn(c.favorite && 'fill-accent text-accent')} />}
                          label="Favorite"
                          onClick={() => {
                            toggleFavorite('contact', c.id)
                            toast.success(c.favorite ? 'Removed from favorites' : 'Added to favorites', name)
                          }}
                        />
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="hidden w-48 items-center gap-2 md:flex">
                      {co && <CompanyLogo shape={co.logo} color={co.color} size="xs" />}
                      <span className="truncate text-[13px] text-muted">{co?.name}</span>
                    </div>
                    <span className="hidden w-56 truncate text-[12.5px] text-faint lg:block">{c.email}</span>
                    <div className="hidden w-24 sm:block"><Badge tone={st.tone}>{st.label}</Badge></div>
                    <span className="hidden w-28 text-right text-[12px] text-faint xl:block">{relativeTime(c.lastContacted)}</span>
                  </>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

function QuickAction({ icon, label, onClick }: { icon: React.ReactNode; label: string; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} aria-label={label} className="flex size-7 items-center justify-center rounded-md text-faint transition-colors hover:bg-surface-3 hover:text-fg [&_svg]:size-3.5">
      {icon}
    </button>
  )
}
