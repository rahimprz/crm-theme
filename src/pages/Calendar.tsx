import { useLayoutEffect, useMemo, useRef, useState } from 'react'
import { ChevronLeft, ChevronRight, Plus, Video, MapPin, Clock3, Users, CalendarX2, Link2 } from 'lucide-react'
import { useCrm, memberById } from '@/store/crm'
import { toast } from '@/store/toast'
import type { CalendarEvent, EventType } from '@/data/types'
import { PageHeader } from '@/components/layout/PageHeader'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { Badge, type Tone } from '@/components/ui/Badge'
import { Avatar } from '@/components/ui/Avatar'
import { EmptyState } from '@/components/ui/EmptyState'
import { Field, Input, Select } from '@/components/ui/Input'
import { useOpenRecord } from '@/components/crm/ActivityTimeline'
import { gsap, reducedMotion } from '@/lib/gsap'
import { isSameDay, longDate, time } from '@/lib/format'
import { cn } from '@/lib/cn'

export const eventMeta: Record<EventType, { label: string; color: string; tone: Tone }> = {
  meeting: { label: 'Meeting', color: 'var(--primary)', tone: 'primary' },
  call: { label: 'Call', color: 'var(--c3)', tone: 'c3' },
  demo: { label: 'Demo', color: 'var(--accent)', tone: 'accent' },
  internal: { label: 'Internal', color: 'var(--c5)', tone: 'c5' },
  deadline: { label: 'Deadline', color: 'var(--danger)', tone: 'danger' },
}

const weekdays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

function monthGrid(year: number, month: number) {
  const first = new Date(year, month, 1)
  const offset = (first.getDay() + 6) % 7
  const start = new Date(year, month, 1 - offset)
  return Array.from({ length: 42 }, (_, i) => new Date(start.getFullYear(), start.getMonth(), start.getDate() + i))
}

export default function Calendar() {
  const events = useCrm((s) => s.events)
  const addEvent = useCrm((s) => s.addEvent)
  const openRecord = useOpenRecord()
  const today = new Date()
  const [cursor, setCursor] = useState({ y: today.getFullYear(), m: today.getMonth() })
  const [selected, setSelected] = useState<Date>(today)
  const [active, setActive] = useState<CalendarEvent | null>(null)
  const [creating, setCreating] = useState(false)
  const [filters, setFilters] = useState<EventType[]>([])
  const grid = useRef<HTMLDivElement>(null)
  const dir = useRef(0)

  const days = useMemo(() => monthGrid(cursor.y, cursor.m), [cursor])
  const shown = events.filter((e) => !filters.length || filters.includes(e.type))
  const byDay = (d: Date) => shown.filter((e) => isSameDay(e.start, d)).sort((a, b) => a.start.localeCompare(b.start))
  const agenda = byDay(selected)

  const shift = (delta: number) => {
    dir.current = delta
    setCursor((c) => {
      const d = new Date(c.y, c.m + delta, 1)
      return { y: d.getFullYear(), m: d.getMonth() }
    })
  }

  useLayoutEffect(() => {
    if (reducedMotion() || !grid.current) return
    const cells = grid.current.querySelectorAll('[data-day]')
    if (dir.current === 0) {
      gsap.fromTo(cells, { opacity: 0, scale: 0.92 }, { opacity: 1, scale: 1, duration: 0.5, stagger: { each: 0.008, grid: [6, 7], from: 'start' }, ease: 'volt.out' })
    } else {
      gsap.fromTo(grid.current, { x: dir.current * 40, opacity: 0 }, { x: 0, opacity: 1, duration: 0.5, ease: 'volt.out' })
    }
  }, [cursor])

  const monthLabel = new Date(cursor.y, cursor.m, 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })

  return (
    <div>
      <PageHeader
        eyebrow="Workspace"
        title={monthLabel}
        description="Meetings, demos and deadlines across your team."
        actions={
          <>
            <Button variant="secondary" onClick={() => { setCursor({ y: today.getFullYear(), m: today.getMonth() }); setSelected(today) }}>
              Today
            </Button>
            <div className="flex">
              <Button variant="secondary" size="icon" className="rounded-r-none" onClick={() => shift(-1)} aria-label="Previous month">
                <ChevronLeft />
              </Button>
              <Button variant="secondary" size="icon" className="-ml-px rounded-l-none" onClick={() => shift(1)} aria-label="Next month">
                <ChevronRight />
              </Button>
            </div>
            <Button variant="primary" icon={<Plus />} onClick={() => setCreating(true)}>
              New event
            </Button>
          </>
        }
      />

      <div className="no-scrollbar -mx-4 mb-4 flex gap-1.5 overflow-x-auto px-4 md:mx-0 md:px-0">
        {(Object.keys(eventMeta) as EventType[]).map((t) => {
          const on = filters.includes(t)
          return (
            <button
              key={t}
              type="button"
              onClick={() => setFilters((f) => (on ? f.filter((x) => x !== t) : [...f, t]))}
              className={cn('flex h-8 shrink-0 items-center gap-2 rounded-full border px-3 text-[12.5px] transition-all', on ? 'border-line-strong bg-surface-3 text-fg' : 'border-line text-muted hover:text-fg', filters.length && !on && 'opacity-50')}
            >
              <span className="size-2 rounded-full" style={{ background: eventMeta[t].color }} />
              {eventMeta[t].label}
            </button>
          )
        })}
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1fr)_340px]">
        <div className="card overflow-hidden">
          <div className="grid grid-cols-7 border-b border-line">
            {weekdays.map((d) => (
              <div key={d} className="py-2.5 text-center text-[11.5px] font-medium text-faint">
                <span className="hidden sm:inline">{d}</span>
                <span className="sm:hidden">{d[0]}</span>
              </div>
            ))}
          </div>
          <div ref={grid} className="grid grid-cols-7">
            {days.map((d, i) => {
              const inMonth = d.getMonth() === cursor.m
              const isToday = isSameDay(d, today)
              const isSel = isSameDay(d, selected)
              const evs = byDay(d)
              return (
                <div
                  key={i}
                  role="button"
                  tabIndex={0}
                  aria-label={longDate(d)}
                  data-day
                  onClick={() => setSelected(d)}
                  onKeyDown={(ev) => (ev.key === 'Enter' || ev.key === ' ') && setSelected(d)}
                  className={cn(
                    'group relative flex min-h-[64px] cursor-pointer flex-col gap-1 border-r border-b border-line p-1.5 text-left transition-colors outline-none focus-visible:bg-primary/10 sm:min-h-[112px] sm:p-2',
                    (i + 1) % 7 === 0 && 'border-r-0',
                    i >= 35 && 'border-b-0',
                    !inMonth && 'bg-surface-2/40',
                    isSel ? 'bg-primary/[0.07]' : 'hover:bg-surface-2/70',
                  )}
                >
                  <span
                    className={cn(
                      'tabular flex size-6 items-center justify-center rounded-full text-[12px] font-medium',
                      isToday ? 'bg-primary text-primary-fg shadow-[0_0_14px_var(--primary)]' : inMonth ? 'text-fg' : 'text-faint',
                      isSel && !isToday && 'ring-1 ring-primary',
                    )}
                  >
                    {d.getDate()}
                  </span>
                  <div className="hidden flex-col gap-1 sm:flex">
                    {evs.slice(0, 2).map((e) => (
                      <span
                        key={e.id}
                        role="button"
                        tabIndex={0}
                        onClick={(ev) => {
                          ev.stopPropagation()
                          setActive(e)
                        }}
                        className="truncate rounded-md px-1.5 py-0.5 text-[11px] font-medium text-fg transition-transform hover:scale-[1.03]"
                        style={{ background: `color-mix(in oklab, ${eventMeta[e.type].color} 18%, transparent)`, boxShadow: `inset 2px 0 0 ${eventMeta[e.type].color}` }}
                      >
                        {e.type !== 'deadline' && <span className="tabular mr-1 text-muted">{time(e.start).replace(':00', '')}</span>}
                        {e.title}
                      </span>
                    ))}
                    {evs.length > 2 && <span className="px-1.5 text-[11px] text-faint">+{evs.length - 2} more</span>}
                  </div>
                  <div className="flex gap-0.5 sm:hidden">
                    {evs.slice(0, 3).map((e) => (
                      <span key={e.id} className="size-1.5 rounded-full" style={{ background: eventMeta[e.type].color }} />
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        <aside className="card flex flex-col">
          <div className="border-b border-line px-5 py-4">
            <div className="eyebrow">{isSameDay(selected, today) ? 'Today' : 'Agenda'}</div>
            <h3 className="font-display mt-1 text-[18px] font-semibold text-fg">{longDate(selected)}</h3>
          </div>
          <div className="flex-1 space-y-2.5 p-4">
            {agenda.length === 0 && <EmptyState icon={<CalendarX2 />} title="Nothing scheduled" description="Pick another day or add an event." />}
            {agenda.map((e) => (
              <button
                key={e.id}
                type="button"
                onClick={() => setActive(e)}
                className="spotlight relative w-full rounded-[var(--radius-lg)] border border-line bg-surface-2 p-3.5 text-left transition-all hover:-translate-y-0.5 hover:border-line-strong"
              >
                <span className="absolute inset-y-3 left-0 w-[3px] rounded-r-full" style={{ background: eventMeta[e.type].color }} />
                <div className="flex items-center justify-between gap-2">
                  <span className="tabular text-[12px] font-semibold text-muted">{e.type === 'deadline' ? 'All day' : `${time(e.start)} – ${time(e.end)}`}</span>
                  <Badge tone={eventMeta[e.type].tone}>{eventMeta[e.type].label}</Badge>
                </div>
                <p className="mt-1.5 text-[13.5px] font-medium text-fg">{e.title}</p>
                <p className="mt-1 flex items-center gap-1 text-[12px] text-faint">
                  {e.location.match(/Zoom|Meet/) ? <Video className="size-3" /> : <MapPin className="size-3" />}
                  {e.location}
                </p>
              </button>
            ))}
          </div>
        </aside>
      </div>

      <Modal
        open={Boolean(active)}
        onClose={() => setActive(null)}
        title={active?.title}
        description={active ? longDate(active.start) : undefined}
        icon={active?.location.match(/Zoom|Meet/) ? <Video /> : <MapPin />}
        size="sm"
        footer={
          <>
            <Button variant="ghost" onClick={() => { setActive(null); toast.info('Reschedule', 'Pick a new time from the calendar.') }}>
              Reschedule
            </Button>
            <Button variant="primary" icon={<Video />} onClick={() => { setActive(null); toast.success('Joining call…', active?.location) }}>
              Join
            </Button>
          </>
        }
      >
        {active && (
          <div className="space-y-3 p-5 text-[13px]">
            <div className="flex items-center gap-3" data-stagger>
              <Clock3 className="size-4 text-faint" />
              <span className="tabular text-fg">{active.type === 'deadline' ? 'All day' : `${time(active.start)} – ${time(active.end)}`}</span>
              <Badge tone={eventMeta[active.type].tone}>{eventMeta[active.type].label}</Badge>
            </div>
            <div className="flex items-center gap-3" data-stagger>
              <MapPin className="size-4 text-faint" />
              <span className="text-fg">{active.location}</span>
            </div>
            <div className="flex items-start gap-3" data-stagger>
              <Users className="mt-0.5 size-4 text-faint" />
              <div className="flex flex-col gap-2">
                {active.attendees.map((id) => {
                  const m = memberById(id)
                  return m ? (
                    <span key={id} className="flex items-center gap-2 text-fg">
                      <Avatar name={m.name} hue={m.hue} size="xs" />
                      {m.name} <span className="text-faint">· {m.role}</span>
                    </span>
                  ) : null
                })}
              </div>
            </div>
            {active.related && (
              <div className="flex items-center gap-3" data-stagger>
                <Link2 className="size-4 text-faint" />
                <button type="button" onClick={() => { setActive(null); openRecord(active.related!) }} className="text-primary hover:underline">
                  {active.related.label}
                </button>
              </div>
            )}
          </div>
        )}
      </Modal>

      <Modal
        open={creating}
        onClose={() => setCreating(false)}
        title="New event"
        description={`On ${longDate(selected)}`}
        icon={<Plus />}
        size="sm"
        footer={
          <>
            <Button variant="ghost" onClick={() => setCreating(false)}>Cancel</Button>
            <Button variant="primary" type="submit" form="new-event">Add event</Button>
          </>
        }
      >
        <form
          id="new-event"
          className="grid grid-cols-1 gap-4 p-5"
          onSubmit={(e) => {
            e.preventDefault()
            const f = new FormData(e.currentTarget)
            const title = String(f.get('title') || '').trim()
            if (!title) return toast.warning('Give the event a title')
            const [h, m] = String(f.get('time') || '10:00').split(':').map(Number)
            const start = new Date(selected)
            start.setHours(h, m, 0, 0)
            const end = new Date(start.getTime() + Number(f.get('length') || 30) * 60_000)
            addEvent({ title, start: start.toISOString(), end: end.toISOString(), type: f.get('type') as EventType, location: String(f.get('location') || 'Zoom'), attendees: ['m1'] })
            setCreating(false)
            toast.success('Event added', `${title} · ${time(start.toISOString())}`)
          }}
        >
          <div data-stagger><Field label="Title"><Input id="ev-title" name="title" placeholder="Demo with Helix Robotics" autoFocus /></Field></div>
          <div className="grid grid-cols-2 gap-3" data-stagger>
            <Field label="Start"><Input id="ev-time" name="time" type="time" defaultValue="10:00" /></Field>
            <Field label="Length">
              <Select id="ev-length" name="length" defaultValue="30">
                <option value="15">15 min</option>
                <option value="30">30 min</option>
                <option value="60">1 hour</option>
                <option value="90">90 min</option>
              </Select>
            </Field>
          </div>
          <div className="grid grid-cols-2 gap-3" data-stagger>
            <Field label="Type">
              <Select id="ev-type" name="type" defaultValue="meeting">
                {(Object.keys(eventMeta) as EventType[]).map((t) => <option key={t} value={t}>{eventMeta[t].label}</option>)}
              </Select>
            </Field>
            <Field label="Location"><Input id="ev-location" name="location" placeholder="Zoom" /></Field>
          </div>
        </form>
      </Modal>
    </div>
  )
}
