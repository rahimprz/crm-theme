import { useLayoutEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  X,
  Mail,
  Phone,
  Copy,
  ArrowRightLeft,
  CalendarDays,
  User,
  Package,
  Footprints,
  Clock3,
  Trophy,
  CircleX,
  Sparkles,
  MessageSquareText,
  Check,
  ExternalLink,
} from 'lucide-react'
import { useUI } from '@/store/ui'
import { useCrm, memberById } from '@/store/crm'
import { toast } from '@/store/toast'
import { stageMeta, stageOrder } from '@/data/mock'
import type { Deal, DealStage, Lead } from '@/data/types'
import { Drawer } from '@/components/ui/Drawer'
import { Button } from '@/components/ui/Button'
import { Avatar } from '@/components/ui/Avatar'
import { CompanyLogo } from '@/components/ui/CompanyLogo'
import { Ring, Progress } from '@/components/ui/Progress'
import { Tabs } from '@/components/ui/Tabs'
import { Textarea } from '@/components/ui/Input'
import { LeadStatusBadge, PriorityFlag, SourceLabel, StageBadge, leadStatusMeta, leadStatusOrder } from './meta'
import { ActivityTimeline } from './ActivityTimeline'
import { celebrate } from '@/lib/confetti'
import { gsap, reducedMotion } from '@/lib/gsap'
import { money, shortDate, relativeTime } from '@/lib/format'
import { cn } from '@/lib/cn'

function FieldRow({ icon, label, children }: { icon: React.ReactNode; label: string; children: React.ReactNode }) {
  return (
    <div className="flex min-h-10 items-center gap-3 border-b border-line/70 py-2 last:border-0" data-stagger>
      <span className="flex w-32 shrink-0 items-center gap-2 text-[12.5px] text-faint [&_svg]:size-3.5">
        {icon}
        {label}
      </span>
      <div className="min-w-0 flex-1 text-[13px] text-fg">{children}</div>
    </div>
  )
}

function copy(text: string, label: string) {
  navigator.clipboard
    ?.writeText(text)
    .then(() => toast.success(`${label} copied`, text))
    .catch(() => toast.info(label, text))
}

/* ───────────────────────── Deal ───────────────────────── */

const pipelineStages: DealStage[] = stageOrder.filter((s) => s !== 'lost')

function StageStepper({ deal }: { deal: Deal }) {
  const moveDeal = useCrm((s) => s.moveDeal)
  const fill = useRef<HTMLSpanElement>(null)
  const idx = deal.stage === 'lost' ? -1 : pipelineStages.indexOf(deal.stage)
  const pct = idx < 0 ? 0 : (idx / (pipelineStages.length - 1)) * 100

  useLayoutEffect(() => {
    gsap.to(fill.current, { width: `${pct}%`, duration: reducedMotion() ? 0 : 0.9, ease: 'volt.out' })
  }, [pct])

  const go = (stage: DealStage, e: React.MouseEvent) => {
    moveDeal(deal.id, stage)
    if (stage === 'won') {
      celebrate({ x: e.clientX, y: e.clientY })
      toast.celebrate('Deal won!', `${deal.name} · ${money(deal.value)}`)
    } else toast.info(`Moved to ${stageMeta[stage].label}`, deal.name)
  }

  return (
    <div className="relative px-1 pt-1" data-stagger>
      <div className="absolute top-[13px] right-4 left-4 h-[2px] rounded-full bg-surface-3">
        <span
          ref={fill}
          className="absolute inset-y-0 left-0 rounded-full"
          style={{ width: 0, background: 'linear-gradient(90deg, var(--primary), var(--accent))', boxShadow: '0 0 10px var(--primary)' }}
        />
      </div>
      <ol className="relative flex justify-between">
        {pipelineStages.map((s, i) => {
          const done = idx >= i
          return (
            <li key={s} className="flex w-14 flex-col items-center gap-1.5">
              <button
                type="button"
                onClick={(e) => go(s, e)}
                className={cn(
                  'flex size-6 items-center justify-center rounded-full border-2 transition-all duration-300 hover:scale-110',
                  done ? 'border-primary bg-primary text-primary-fg shadow-[0_0_12px_var(--primary)]' : 'border-line-strong bg-surface text-faint hover:border-faint',
                  idx === i && 'ring-4 ring-primary/20',
                )}
                aria-label={`Move to ${stageMeta[s].label}`}
              >
                {done ? <Check className="size-3" strokeWidth={3} /> : <span className="size-1.5 rounded-full bg-current" />}
              </button>
              <span className={cn('text-center text-[10.5px] leading-tight', idx === i ? 'font-semibold text-fg' : 'text-faint')}>{stageMeta[s].label}</span>
            </li>
          )
        })}
      </ol>
    </div>
  )
}

function DealDrawerBody({ deal }: { deal: Deal }) {
  const close = useUI((s) => s.closeDrawer)
  const navigate = useNavigate()
  const company = useCrm((s) => s.companies.find((c) => c.id === deal.companyId))
  const contact = useCrm((s) => s.contacts.find((c) => c.id === deal.contactId))
  const activities = useCrm((s) => s.activities)
  const allTasks = useCrm((s) => s.tasks)
  const tasks = allTasks.filter((t) => t.related?.id === deal.id || t.related?.id === deal.companyId)
  const moveDeal = useCrm((s) => s.moveDeal)
  const logActivity = useCrm((s) => s.logActivity)
  const owner = memberById(deal.ownerId)
  const [tab, setTab] = useState<'activity' | 'notes' | 'tasks'>('activity')
  const [note, setNote] = useState('')

  const related = activities.filter((a) => a.target?.id === deal.id || a.target?.id === deal.companyId)

  return (
    <>
      <header className="flex items-start gap-3 border-b border-line p-5" data-stagger>
        {company && <CompanyLogo shape={company.logo} color={company.color} size="lg" />}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 text-[12.5px] text-muted">
            {company?.name}
            <StageBadge stage={deal.stage} />
          </div>
          <h2 className="font-display mt-1 text-[21px] leading-tight font-semibold text-fg">{deal.name}</h2>
        </div>
        <Button variant="ghost" size="icon-sm" onClick={close} aria-label="Close">
          <X />
        </Button>
      </header>

      <div className="flex-1 space-y-5 overflow-y-auto p-5">
        <div className="grid grid-cols-3 gap-2" data-stagger>
          <div className="rounded-[var(--radius-lg)] border border-line bg-surface-2 p-3">
            <div className="text-[11.5px] text-faint">Value</div>
            <div className="tabular mt-0.5 text-[17px] font-semibold text-fg">{money(deal.value, true)}</div>
          </div>
          <div className="flex items-center gap-2.5 rounded-[var(--radius-lg)] border border-line bg-surface-2 p-3">
            <Ring value={deal.probability} size={36} stroke={4} />
            <div>
              <div className="text-[11.5px] text-faint">Win chance</div>
              <div className="tabular text-[15px] font-semibold text-fg">{deal.probability}%</div>
            </div>
          </div>
          <div className="rounded-[var(--radius-lg)] border border-line bg-surface-2 p-3">
            <div className="text-[11.5px] text-faint">Weighted</div>
            <div className="tabular mt-0.5 text-[17px] font-semibold text-fg">{money((deal.value * deal.probability) / 100, true)}</div>
          </div>
        </div>

        <StageStepper deal={deal} />

        <div className="rounded-[var(--radius-lg)] border border-line px-3.5">
          <FieldRow icon={<User />} label="Owner">
            {owner && (
              <span className="flex items-center gap-2">
                <Avatar name={owner.name} hue={owner.hue} size="xs" />
                {owner.name}
              </span>
            )}
          </FieldRow>
          <FieldRow icon={<User />} label="Contact">
            {contact && (
              <button className="flex items-center gap-2 hover:text-primary" onClick={() => { close(); navigate(`/contacts/${contact.id}`) }}>
                <Avatar name={`${contact.firstName} ${contact.lastName}`} hue={contact.hue} size="xs" />
                {contact.firstName} {contact.lastName}
                <span className="text-faint">· {contact.title}</span>
              </button>
            )}
          </FieldRow>
          <FieldRow icon={<CalendarDays />} label="Close date">{shortDate(deal.closeDate)}</FieldRow>
          <FieldRow icon={<Package />} label="Product">{deal.product}</FieldRow>
          <FieldRow icon={<Footprints />} label="Next step">{deal.nextStep}</FieldRow>
          <FieldRow icon={<Clock3 />} label="Priority">
            <PriorityFlag priority={deal.priority} showLabel />
          </FieldRow>
        </div>

        <div data-stagger>
          <Tabs
            value={tab}
            onChange={setTab}
            tabs={[
              { value: 'activity', label: 'Activity', count: related.length },
              { value: 'notes', label: 'Notes' },
              { value: 'tasks', label: 'Tasks', count: tasks.length },
            ]}
          />
          <div className="pt-4">
            {tab === 'activity' && <ActivityTimeline items={related.length ? related : activities.slice(0, 4)} compact />}
            {tab === 'notes' && (
              <form
                className="space-y-2"
                onSubmit={(e) => {
                  e.preventDefault()
                  if (!note.trim()) return
                  logActivity({ type: 'note', text: 'added a note on', target: { type: 'deal', id: deal.id, label: deal.name }, detail: note.trim() })
                  setNote('')
                  setTab('activity')
                  toast.success('Note added', deal.name)
                }}
              >
                <Textarea id="deal-note" value={note} onChange={(e) => setNote(e.target.value)} placeholder="Write a note… mention a teammate with @" />
                <div className="flex justify-end">
                  <Button type="submit" variant="primary" size="sm" icon={<MessageSquareText />}>
                    Add note
                  </Button>
                </div>
              </form>
            )}
            {tab === 'tasks' && (
              <ul className="space-y-2">
                {tasks.length === 0 && <li className="text-[13px] text-muted">No open tasks on this deal.</li>}
                {tasks.map((t) => (
                  <li key={t.id} className="flex items-center gap-2.5 rounded-lg border border-line bg-surface-2 px-3 py-2 text-[13px]">
                    <span className={cn('size-2 rounded-full', t.done ? 'bg-success' : 'bg-primary')} />
                    <span className={cn('flex-1', t.done && 'text-faint line-through')}>{t.title}</span>
                    <PriorityFlag priority={t.priority} />
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>

      <footer className="flex items-center gap-2 border-t border-line p-4 pb-[max(16px,env(safe-area-inset-bottom))]" data-stagger>
        <Button
          variant="danger"
          icon={<CircleX />}
          onClick={() => {
            moveDeal(deal.id, 'lost')
            toast.warning('Marked as lost', deal.name)
          }}
        >
          Lost
        </Button>
        {company && (
          <Button variant="secondary" icon={<ExternalLink />} onClick={() => { close(); navigate(`/companies/${company.id}`) }}>
            Company
          </Button>
        )}
        <Button
          variant="accent"
          className="ml-auto"
          icon={<Trophy />}
          onClick={(e) => {
            moveDeal(deal.id, 'won')
            celebrate({ x: e.clientX, y: e.clientY })
            toast.celebrate('Deal won!', `${deal.name} · ${money(deal.value)}`)
          }}
        >
          Mark as won
        </Button>
      </footer>
    </>
  )
}

/* ───────────────────────── Lead ───────────────────────── */

function LeadDrawerBody({ lead }: { lead: Lead }) {
  const close = useUI((s) => s.closeDrawer)
  const navigate = useNavigate()
  const updateLead = useCrm((s) => s.updateLead)
  const convertLead = useCrm((s) => s.convertLead)
  const owner = memberById(lead.ownerId)
  const factors = [
    { label: 'Company fit', value: Math.min(100, lead.score + 8) },
    { label: 'Buying intent', value: Math.max(10, lead.score - 6) },
    { label: 'Engagement', value: Math.min(100, Math.round(lead.score * 0.9 + 6)) },
  ]
  const timeline = [
    { id: '1', type: 'lead' as const, actorId: lead.ownerId ?? 'm4', text: 'lead created from', target: { type: 'lead' as const, id: lead.id, label: lead.company }, at: lead.createdAt, detail: `Source · ${lead.source}` },
    { id: '2', type: 'email' as const, actorId: lead.ownerId ?? 'm4', text: 'sent an intro email to', target: { type: 'lead' as const, id: lead.id, label: lead.name }, at: lead.lastActivity, detail: 'Opened 3 times · clicked pricing link' },
  ]

  return (
    <>
      <header className="flex items-start gap-3 border-b border-line p-5" data-stagger>
        <Avatar name={lead.name} hue={lead.hue} size="lg" />
        <div className="min-w-0 flex-1">
          <h2 className="font-display text-[21px] leading-tight font-semibold text-fg">{lead.name}</h2>
          <p className="truncate text-[13px] text-muted">
            {lead.title} at <span className="text-fg">{lead.company}</span>
          </p>
          <div className="mt-2 flex flex-wrap items-center gap-1.5">
            <LeadStatusBadge status={lead.status} />
            {lead.tags.map((t) => (
              <span key={t} className="rounded-full border border-line-strong px-2 py-0.5 text-[11px] text-muted">
                {t}
              </span>
            ))}
          </div>
        </div>
        <Button variant="ghost" size="icon-sm" onClick={close} aria-label="Close">
          <X />
        </Button>
      </header>

      <div className="flex-1 space-y-5 overflow-y-auto p-5">
        <div className="card spotlight flex items-center gap-4 p-4" data-stagger>
          <Ring value={lead.score} size={76} stroke={7}>
            <div className="text-center">
              <div className="tabular text-[20px] leading-none font-semibold text-fg">{lead.score}</div>
              <div className="text-[10px] text-faint">score</div>
            </div>
          </Ring>
          <div className="min-w-0 flex-1 space-y-2">
            {factors.map((f) => (
              <div key={f.label}>
                <div className="mb-1 flex justify-between text-[11.5px]">
                  <span className="text-muted">{f.label}</span>
                  <span className="tabular text-fg">{f.value}</span>
                </div>
                <Progress value={f.value} height={4} gradient />
              </div>
            ))}
          </div>
        </div>

        <div data-stagger>
          <div className="eyebrow mb-2">Status</div>
          <div className="flex flex-wrap gap-1.5">
            {leadStatusOrder.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => {
                  updateLead(lead.id, { status: s })
                  toast.info(`Status set to ${leadStatusMeta[s].label}`, lead.name)
                }}
                className={cn(
                  'h-8 rounded-lg border px-3 text-[12.5px] font-medium transition-all',
                  lead.status === s ? 'border-primary bg-primary/12 text-primary' : 'border-line text-muted hover:border-line-strong hover:text-fg',
                )}
              >
                {leadStatusMeta[s].label}
              </button>
            ))}
          </div>
        </div>

        <div className="rounded-[var(--radius-lg)] border border-line px-3.5">
          <FieldRow icon={<Mail />} label="Email">
            <button className="group flex items-center gap-2 truncate hover:text-primary" onClick={() => copy(lead.email, 'Email')}>
              {lead.email}
              <Copy className="size-3 opacity-0 group-hover:opacity-100" />
            </button>
          </FieldRow>
          <FieldRow icon={<Phone />} label="Phone">
            <button className="group flex items-center gap-2 hover:text-primary" onClick={() => copy(lead.phone, 'Phone')}>
              {lead.phone}
              <Copy className="size-3 opacity-0 group-hover:opacity-100" />
            </button>
          </FieldRow>
          <FieldRow icon={<Sparkles />} label="Source">
            <SourceLabel source={lead.source} />
          </FieldRow>
          <FieldRow icon={<User />} label="Owner">
            {owner ? (
              <span className="flex items-center gap-2">
                <Avatar name={owner.name} hue={owner.hue} size="xs" />
                {owner.name}
              </span>
            ) : (
              <span className="text-warning">Unassigned</span>
            )}
          </FieldRow>
          <FieldRow icon={<Package />} label="Est. value">
            <span className="tabular">{money(lead.value)}</span>
          </FieldRow>
          <FieldRow icon={<Clock3 />} label="Created">{relativeTime(lead.createdAt)}</FieldRow>
        </div>

        <div data-stagger>
          <div className="eyebrow mb-3">Timeline</div>
          <ActivityTimeline items={timeline} compact />
        </div>
      </div>

      <footer className="flex items-center gap-2 border-t border-line p-4 pb-[max(16px,env(safe-area-inset-bottom))]" data-stagger>
        <Button variant="secondary" icon={<Mail />} onClick={() => copy(lead.email, 'Email')}>
          Email
        </Button>
        <Button variant="secondary" icon={<Phone />} onClick={() => toast.info('Calling…', `${lead.name} · ${lead.phone}`)}>
          Call
        </Button>
        <Button
          variant="primary"
          className="ml-auto"
          icon={<ArrowRightLeft />}
          onClick={(e) => {
            const deal = convertLead(lead.id)
            if (!deal) return
            celebrate({ x: e.clientX, y: e.clientY })
            toast.celebrate('Lead converted', `${lead.company} is now a deal in Qualified.`)
            close()
            navigate('/deals')
          }}
        >
          Convert to deal
        </Button>
      </footer>
    </>
  )
}

/** Mounted once in the shell; opens whichever record the UI store points at. */
export function RecordDrawers() {
  const drawer = useUI((s) => s.drawer)
  const close = useUI((s) => s.closeDrawer)
  const deal = useCrm((s) => (drawer?.type === 'deal' ? s.deals.find((d) => d.id === drawer.id) : undefined))
  const lead = useCrm((s) => (drawer?.type === 'lead' ? s.leads.find((l) => l.id === drawer.id) : undefined))
  // Keep the last record so the exit animation has content to show.
  const last = useRef<{ deal?: Deal; lead?: Lead }>({})
  if (deal) last.current = { deal }
  if (lead) last.current = { lead }
  const open = Boolean(drawer && (deal || lead))

  return (
    <Drawer open={open} onClose={close}>
      {last.current.deal && <DealDrawerBody deal={deal ?? last.current.deal} />}
      {last.current.lead && <LeadDrawerBody lead={lead ?? last.current.lead} />}
    </Drawer>
  )
}
