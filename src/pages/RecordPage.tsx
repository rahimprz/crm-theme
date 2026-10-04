import { useMemo, useRef, useState, type ReactNode } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  ArrowLeft,
  ChevronUp,
  ChevronDown,
  Mail,
  Phone,
  Star,
  Globe,
  Factory,
  Users,
  CircleDollarSign,
  MapPin,
  User,
  Layers,
  CalendarPlus,
  Tag,
  Building2,
  Briefcase,
  AtSign,
  Clock3,
  Activity as ActivityIcon,
  Handshake,
  ListChecks,
  StickyNote,
  Inbox as InboxIcon,
  Paperclip,
  Plus,
  UserX,
  Pencil,
} from 'lucide-react'
import { useCrm, memberById } from '@/store/crm'
import { useUI } from '@/store/ui'
import { toast } from '@/store/toast'
import type { Activity, Company, Contact } from '@/data/types'
import { Button } from '@/components/ui/Button'
import { Avatar } from '@/components/ui/Avatar'
import { CompanyLogo } from '@/components/ui/CompanyLogo'
import { Badge } from '@/components/ui/Badge'
import { Ring } from '@/components/ui/Progress'
import { Tabs } from '@/components/ui/Tabs'
import { Textarea } from '@/components/ui/Input'
import { Checkbox } from '@/components/ui/Checkbox'
import { EmptyState } from '@/components/ui/EmptyState'
import { Tooltip } from '@/components/ui/Tooltip'
import { ActivityTimeline } from '@/components/crm/ActivityTimeline'
import { DealCard } from '@/components/crm/DealCard'
import { PriorityFlag, contactStageMeta } from '@/components/crm/meta'
import { gsap, useGSAP, reducedMotion } from '@/lib/gsap'
import { money, number, shortDate, relativeTime, dueLabel } from '@/lib/format'
import { cn } from '@/lib/cn'

type Tab = 'timeline' | 'deals' | 'tasks' | 'notes' | 'emails'

function Field({ icon, label, children }: { icon: ReactNode; label: string; children: ReactNode }) {
  return (
    <div data-rec-field className="group flex min-h-9 items-center gap-3 rounded-lg px-2 py-1.5 transition-colors hover:bg-surface-2">
      <span className="flex w-28 shrink-0 items-center gap-2 text-[12.5px] text-faint [&_svg]:size-3.5">
        {icon}
        {label}
      </span>
      <span className="min-w-0 flex-1 truncate text-[13px] text-fg">{children}</span>
      <Pencil className="size-3 text-faint opacity-0 transition-opacity group-hover:opacity-100" />
    </div>
  )
}

/** Shared Twenty-style record layout: fields on the left, related work on the right. */
function RecordLayout({
  header,
  fields,
  related,
  activities,
  dealIds,
  relatedIds,
  ids,
  basePath,
  currentId,
}: {
  header: ReactNode
  fields: ReactNode
  related: ReactNode
  activities: Activity[]
  dealIds: string[]
  relatedIds: string[]
  ids: string[]
  basePath: string
  currentId: string
}) {
  const ref = useRef<HTMLDivElement>(null)
  const navigate = useNavigate()
  const allDeals = useCrm((s) => s.deals)
  const allTasks = useCrm((s) => s.tasks)
  const emails = useCrm((s) => s.emails)
  const toggleTask = useCrm((s) => s.toggleTask)
  const logActivity = useCrm((s) => s.logActivity)
  const [tab, setTab] = useState<Tab>('timeline')
  const [note, setNote] = useState('')
  const deals = allDeals.filter((d) => dealIds.includes(d.id))
  const tasks = allTasks.filter((t) => t.related && relatedIds.includes(t.related.id))
  const notes = activities.filter((a) => a.type === 'note')
  const mail = emails.filter((e) => e.contactId && relatedIds.includes(e.contactId))
  const idx = ids.indexOf(currentId)

  useGSAP(
    () => {
      if (reducedMotion()) return
      gsap.from('[data-rec-panel]', { opacity: 0, y: 24, duration: 0.7, stagger: 0.1, ease: 'volt.out' })
      gsap.from('[data-rec-field]', { opacity: 0, x: -12, duration: 0.5, stagger: 0.03, delay: 0.2, ease: 'volt.out' })
    },
    { scope: ref, dependencies: [currentId] },
  )

  return (
    <div ref={ref}>
      <div className="mb-4 flex items-center justify-between">
        <Button variant="ghost" size="sm" icon={<ArrowLeft />} onClick={() => navigate(basePath)}>
          Back
        </Button>
        <div className="flex items-center gap-1">
          <span className="tabular mr-2 text-[12px] text-faint">
            {idx + 1} of {ids.length}
          </span>
          <Tooltip content="Previous record" side="bottom">
            <Button variant="secondary" size="icon-sm" disabled={idx <= 0} onClick={() => navigate(`${basePath}/${ids[idx - 1]}`)} aria-label="Previous record">
              <ChevronUp />
            </Button>
          </Tooltip>
          <Tooltip content="Next record" side="bottom">
            <Button variant="secondary" size="icon-sm" disabled={idx >= ids.length - 1} onClick={() => navigate(`${basePath}/${ids[idx + 1]}`)} aria-label="Next record">
              <ChevronDown />
            </Button>
          </Tooltip>
        </div>
      </div>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[360px_minmax(0,1fr)]">
        <aside className="flex flex-col gap-4">
          <div data-rec-panel className="card overflow-hidden">
            {header}
          </div>
          <div data-rec-panel className="card p-3">
            <div className="eyebrow px-2 pt-1 pb-2">Fields</div>
            {fields}
          </div>
          <div data-rec-panel className="card p-3">{related}</div>
        </aside>

        <section data-rec-panel className="card min-w-0">
          <div className="px-4 pt-1">
            <Tabs
              value={tab}
              onChange={setTab}
              tabs={[
                { value: 'timeline', label: 'Timeline', icon: <ActivityIcon /> },
                { value: 'deals', label: 'Deals', icon: <Handshake />, count: deals.length },
                { value: 'tasks', label: 'Tasks', icon: <ListChecks />, count: tasks.length },
                { value: 'notes', label: 'Notes', icon: <StickyNote />, count: notes.length },
                { value: 'emails', label: 'Emails', icon: <InboxIcon />, count: mail.length },
              ]}
            />
          </div>
          <div className="p-5">
            {tab === 'timeline' &&
              (activities.length ? <ActivityTimeline items={activities} /> : <EmptyState icon={<ActivityIcon />} title="No activity yet" description="Emails, calls, meetings and notes will show up here." />)}
            {tab === 'deals' &&
              (deals.length ? (
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
                  {deals.map((d) => (
                    <DealCard key={d.id} deal={d} />
                  ))}
                </div>
              ) : (
                <EmptyState icon={<Handshake />} title="No deals yet" description="Create a deal to start tracking revenue here." />
              ))}
            {tab === 'tasks' &&
              (tasks.length ? (
                <ul className="space-y-2">
                  {tasks.map((t) => (
                    <li key={t.id} className="flex items-center gap-3 rounded-lg border border-line bg-surface-2 px-3 py-2.5">
                      <Checkbox checked={t.done} onChange={() => toggleTask(t.id)} round />
                      <span className={cn('flex-1 text-[13px]', t.done ? 'text-faint line-through' : 'text-fg')}>{t.title}</span>
                      <span className="text-[12px] text-faint">{dueLabel(t.due)}</span>
                      <PriorityFlag priority={t.priority} />
                    </li>
                  ))}
                </ul>
              ) : (
                <EmptyState icon={<ListChecks />} title="Nothing to do" description="No open tasks are linked to this record." />
              ))}
            {tab === 'notes' && (
              <div className="space-y-4">
                <form
                  className="rounded-[var(--radius-lg)] border border-line bg-surface-2 p-3"
                  onSubmit={(e) => {
                    e.preventDefault()
                    if (!note.trim()) return
                    logActivity({ type: 'note', text: 'added a note on', detail: note.trim(), target: { type: relatedIds[0].startsWith('co') ? 'company' : 'contact', id: relatedIds[0], label: 'this record' } })
                    setNote('')
                    toast.success('Note saved')
                  }}
                >
                  <Textarea id="record-note" value={note} onChange={(e) => setNote(e.target.value)} placeholder="Write a note. Type @ to mention a teammate." className="min-h-20 border-0 bg-transparent p-0 focus:shadow-none" />
                  <div className="mt-2 flex items-center justify-between">
                    <Button variant="ghost" size="icon-sm" aria-label="Attach file" onClick={() => toast.info('Attach a file', 'Drag a file here to attach it.')}>
                      <Paperclip />
                    </Button>
                    <Button type="submit" variant="primary" size="sm" icon={<Plus />}>
                      Add note
                    </Button>
                  </div>
                </form>
                {notes.map((n) => (
                  <div key={n.id} className="rounded-[var(--radius-lg)] border border-line p-4">
                    <div className="mb-2 flex items-center gap-2 text-[12px] text-faint">
                      <Avatar name={memberById(n.actorId)?.name ?? 'Someone'} hue={memberById(n.actorId)?.hue} size="xs" />
                      {memberById(n.actorId)?.name} · {relativeTime(n.at)}
                    </div>
                    <p className="text-[13.5px] text-fg">{n.detail}</p>
                  </div>
                ))}
              </div>
            )}
            {tab === 'emails' &&
              (mail.length ? (
                <ul className="divide-y divide-line rounded-[var(--radius-lg)] border border-line">
                  {mail.map((m) => (
                    <li key={m.id} className="flex items-start gap-3 p-3.5">
                      <Avatar name={m.fromName} hue={m.hue} size="sm" />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-2">
                          <span className="truncate text-[13px] font-medium text-fg">{m.subject}</span>
                          <span className="shrink-0 text-[11.5px] text-faint">{relativeTime(m.at)}</span>
                        </div>
                        <p className="mt-0.5 line-clamp-2 text-[12.5px] text-muted">{m.preview}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <EmptyState icon={<InboxIcon />} title="No emails synced" description="Connect your inbox in Settings to see conversations here." />
              ))}
          </div>
        </section>
      </div>
    </div>
  )
}

function NotFoundRecord({ kind }: { kind: string }) {
  const navigate = useNavigate()
  return (
    <div className="card mt-6">
      <EmptyState icon={<UserX />} title={`This ${kind} no longer exists`} description="It may have been deleted or merged." action={<Button variant="primary" onClick={() => navigate(-1)}>Go back</Button>} />
    </div>
  )
}

function RecordActions({ email, phone, favorite, onFavorite }: { email: string; phone: string; favorite?: boolean; onFavorite: () => void }) {
  return (
    <div className="flex gap-2">
      <Button variant="secondary" size="sm" icon={<Mail />} onClick={() => toast.info('Email draft opened', email)}>
        Email
      </Button>
      <Button variant="secondary" size="sm" icon={<Phone />} onClick={() => toast.info('Calling…', phone)}>
        Call
      </Button>
      <Button variant="secondary" size="icon-sm" onClick={onFavorite} aria-label={favorite ? 'Remove from favorites' : 'Add to favorites'}>
        <Star className={cn(favorite && 'fill-accent text-accent')} />
      </Button>
    </div>
  )
}

/* ───────────────────────── Company ───────────────────────── */

export function CompanyRecord() {
  const { id } = useParams()
  const navigate = useNavigate()
  const companies = useCrm((s) => s.companies)
  const contacts = useCrm((s) => s.contacts)
  const deals = useCrm((s) => s.deals)
  const activities = useCrm((s) => s.activities)
  const toggleFavorite = useCrm((s) => s.toggleFavorite)
  const openQuickCreate = useUI((s) => s.openQuickCreate)
  const company = companies.find((c) => c.id === id)
  const people = useMemo(() => contacts.filter((c) => c.companyId === id), [contacts, id])
  if (!company) return <NotFoundRecord kind="company" />
  const owner = memberById(company.ownerId)
  const companyDeals = deals.filter((d) => d.companyId === company.id)
  const relatedIds = [company.id, ...people.map((p) => p.id), ...companyDeals.map((d) => d.id)]
  const acts = activities.filter((a) => a.target && relatedIds.includes(a.target.id))
  const fallback: Activity[] = [
    { id: `x1-${company.id}`, type: 'meeting', actorId: company.ownerId, text: 'held a kickoff with', target: { type: 'company', id: company.id, label: company.name }, at: new Date(Date.now() - 86_400_000 * 3).toISOString(), detail: 'Agreed success criteria and a 6-week pilot plan.' },
    { id: `x2-${company.id}`, type: 'email', actorId: company.ownerId, text: 'sent the proposal to', target: { type: 'company', id: company.id, label: company.name }, at: new Date(Date.now() - 86_400_000 * 6).toISOString(), detail: 'Proposal v2 with volume pricing' },
    { id: `x3-${company.id}`, type: 'call', actorId: 'm6', text: 'ran a technical call with', target: { type: 'company', id: company.id, label: company.name }, at: new Date(Date.now() - 86_400_000 * 11).toISOString(), detail: 'SSO and data residency reviewed. No blockers.' },
  ]
  const healthColor = company.health >= 75 ? 'var(--success)' : company.health >= 55 ? 'var(--accent)' : 'var(--danger)'

  return (
    <RecordLayout
      currentId={company.id}
      ids={companies.map((c) => c.id)}
      basePath="/companies"
      activities={[...acts, ...fallback]}
      dealIds={companyDeals.map((d) => d.id)}
      relatedIds={relatedIds}
      header={
        <>
          <div className="relative h-20 overflow-hidden" style={{ background: `linear-gradient(120deg, color-mix(in oklab, ${company.color} 45%, var(--surface)), var(--surface) 80%)` }}>
            <div className="grid-bg absolute inset-0 opacity-60" />
          </div>
          <div className="relative -mt-8 px-5 pb-5">
            <CompanyLogo shape={company.logo} color={company.color} size="xl" className="ring-4 ring-surface" />
            <div className="mt-3 flex items-start justify-between gap-3">
              <div className="min-w-0">
                <h1 className="font-display truncate text-[22px] font-semibold text-fg">{company.name}</h1>
                <a className="text-[13px] text-primary hover:underline" href={`https://${company.domain}`} target="_blank" rel="noreferrer">
                  {company.domain}
                </a>
              </div>
              <Ring value={company.health} size={52} stroke={5} color={healthColor}>
                <div className="text-center leading-none">
                  <div className="tabular text-[13px] font-semibold text-fg">{company.health}</div>
                  <div className="text-[8.5px] text-faint">health</div>
                </div>
              </Ring>
            </div>
            <p className="mt-3 text-[13px] text-muted">{company.description}</p>
            <div className="mt-4">
              <RecordActions email={people[0]?.email ?? `hello@${company.domain}`} phone={people[0]?.phone ?? ''} favorite={company.favorite} onFavorite={() => { toggleFavorite('company', company.id); toast.success(company.favorite ? 'Removed from favorites' : 'Added to favorites', company.name) }} />
            </div>
          </div>
        </>
      }
      fields={
        <>
          <Field icon={<Globe />} label="Domain">{company.domain}</Field>
          <Field icon={<Factory />} label="Industry">{company.industry}</Field>
          <Field icon={<Users />} label="Employees"><span className="tabular">{number(company.employees)}</span></Field>
          <Field icon={<CircleDollarSign />} label="ARR"><span className="tabular">{money(company.arr)}</span></Field>
          <Field icon={<MapPin />} label="Location">{company.city}, {company.country}</Field>
          <Field icon={<Layers />} label="Tier"><Badge tone={company.tier === 'Enterprise' ? 'accent' : 'primary'}>{company.tier}</Badge></Field>
          <Field icon={<User />} label="Owner">
            {owner && <span className="flex items-center gap-2"><Avatar name={owner.name} hue={owner.hue} size="xs" />{owner.name}</span>}
          </Field>
          <Field icon={<Tag />} label="Tags">
            <span className="flex gap-1">{company.tags.map((t) => <span key={t} className="rounded-md bg-surface-3 px-1.5 py-0.5 text-[11px] text-muted">{t}</span>)}</span>
          </Field>
          <Field icon={<CalendarPlus />} label="Created">{shortDate(company.createdAt)}</Field>
        </>
      }
      related={
        <>
          <div className="flex items-center justify-between px-2 pt-1 pb-2">
            <span className="eyebrow">People · {people.length}</span>
            <button type="button" onClick={() => openQuickCreate('contact')} className="flex size-6 items-center justify-center rounded-md text-faint hover:bg-surface-3 hover:text-fg" aria-label="Add person">
              <Plus className="size-3.5" />
            </button>
          </div>
          {people.map((p) => (
            <button key={p.id} type="button" onClick={() => navigate(`/contacts/${p.id}`)} className="flex w-full items-center gap-3 rounded-lg px-2 py-2 text-left hover:bg-surface-2">
              <Avatar name={`${p.firstName} ${p.lastName}`} hue={p.hue} size="sm" />
              <div className="min-w-0 flex-1">
                <div className="truncate text-[13px] font-medium text-fg">{p.firstName} {p.lastName}</div>
                <div className="truncate text-[11.5px] text-faint">{p.title}</div>
              </div>
            </button>
          ))}
          {people.length === 0 && <p className="px-2 pb-2 text-[12.5px] text-faint">No people yet.</p>}
        </>
      }
    />
  )
}

/* ───────────────────────── Contact ───────────────────────── */

export function ContactRecord() {
  const { id } = useParams()
  const navigate = useNavigate()
  const contacts = useCrm((s) => s.contacts)
  const companies = useCrm((s) => s.companies)
  const deals = useCrm((s) => s.deals)
  const activities = useCrm((s) => s.activities)
  const toggleFavorite = useCrm((s) => s.toggleFavorite)
  const contact = contacts.find((c) => c.id === id)
  if (!contact) return <NotFoundRecord kind="person" />
  const company: Company | undefined = companies.find((c) => c.id === contact.companyId)
  const owner = memberById(contact.ownerId)
  const name = `${contact.firstName} ${contact.lastName}`
  const contactDeals = deals.filter((d) => d.contactId === contact.id || d.companyId === contact.companyId)
  const relatedIds = [contact.id, contact.companyId, ...contactDeals.map((d) => d.id)]
  const acts = activities.filter((a) => a.target && relatedIds.includes(a.target.id))
  const fallback: Activity[] = [
    { id: `y1-${contact.id}`, type: 'email', actorId: contact.ownerId, text: 'emailed', target: { type: 'contact', id: contact.id, label: name }, at: contact.lastContacted, detail: 'Shared the onboarding plan and pricing FAQ.' },
    { id: `y2-${contact.id}`, type: 'call', actorId: contact.ownerId, text: 'had a 15 min call with', target: { type: 'contact', id: contact.id, label: name }, at: new Date(new Date(contact.lastContacted).getTime() - 86_400_000 * 5).toISOString(), detail: 'Wants a demo for the wider team.' },
  ]
  const stage = contactStageMeta[contact.stage]
  const peers: Contact[] = contacts.filter((c) => c.companyId === contact.companyId && c.id !== contact.id)

  return (
    <RecordLayout
      currentId={contact.id}
      ids={contacts.map((c) => c.id)}
      basePath="/contacts"
      activities={[...acts, ...fallback]}
      dealIds={contactDeals.map((d) => d.id)}
      relatedIds={relatedIds}
      header={
        <>
          <div className="relative h-20 overflow-hidden" style={{ background: `linear-gradient(120deg, oklch(0.55 0.14 ${contact.hue} / 0.5), var(--surface) 80%)` }}>
            <div className="grid-bg absolute inset-0 opacity-60" />
          </div>
          <div className="relative -mt-8 px-5 pb-5">
            <Avatar name={name} hue={contact.hue} size="xl" className="ring-4 ring-surface" status={contact.stage === 'customer' ? 'online' : undefined} />
            <div className="mt-3 flex items-start justify-between gap-2">
              <div className="min-w-0">
                <h1 className="font-display truncate text-[22px] font-semibold text-fg">{name}</h1>
                <p className="text-[13px] text-muted">{contact.title}</p>
              </div>
              <Badge tone={stage.tone} dot>{stage.label}</Badge>
            </div>
            <div className="mt-4">
              <RecordActions email={contact.email} phone={contact.phone} favorite={contact.favorite} onFavorite={() => { toggleFavorite('contact', contact.id); toast.success(contact.favorite ? 'Removed from favorites' : 'Added to favorites', name) }} />
            </div>
          </div>
        </>
      }
      fields={
        <>
          <Field icon={<AtSign />} label="Email">{contact.email}</Field>
          <Field icon={<Phone />} label="Phone">{contact.phone}</Field>
          <Field icon={<Building2 />} label="Company">
            {company && (
              <button type="button" onClick={() => navigate(`/companies/${company.id}`)} className="flex items-center gap-2 hover:text-primary">
                <CompanyLogo shape={company.logo} color={company.color} size="xs" />
                {company.name}
              </button>
            )}
          </Field>
          <Field icon={<Briefcase />} label="Job title">{contact.title}</Field>
          <Field icon={<MapPin />} label="City">{contact.city}</Field>
          <Field icon={<User />} label="Owner">
            {owner && <span className="flex items-center gap-2"><Avatar name={owner.name} hue={owner.hue} size="xs" />{owner.name}</span>}
          </Field>
          <Field icon={<Tag />} label="Tags">
            <span className="flex gap-1">{contact.tags.map((t) => <span key={t} className="rounded-md bg-surface-3 px-1.5 py-0.5 text-[11px] text-muted">{t}</span>)}</span>
          </Field>
          <Field icon={<Clock3 />} label="Last contact">{relativeTime(contact.lastContacted)}</Field>
          <Field icon={<CalendarPlus />} label="Created">{shortDate(contact.createdAt)}</Field>
        </>
      }
      related={
        <>
          <div className="eyebrow px-2 pt-1 pb-2">Also at {company?.name}</div>
          {peers.map((p) => (
            <button key={p.id} type="button" onClick={() => navigate(`/contacts/${p.id}`)} className="flex w-full items-center gap-3 rounded-lg px-2 py-2 text-left hover:bg-surface-2">
              <Avatar name={`${p.firstName} ${p.lastName}`} hue={p.hue} size="sm" />
              <div className="min-w-0 flex-1">
                <div className="truncate text-[13px] font-medium text-fg">{p.firstName} {p.lastName}</div>
                <div className="truncate text-[11.5px] text-faint">{p.title}</div>
              </div>
            </button>
          ))}
          {peers.length === 0 && <p className="px-2 pb-2 text-[12.5px] text-faint">No other contacts at this company.</p>}
        </>
      }
    />
  )
}
