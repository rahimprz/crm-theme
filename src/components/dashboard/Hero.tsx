import { useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Kanban, CalendarClock, ListTodo, Handshake } from 'lucide-react'
import { useCrm, currentUser } from '@/store/crm'
import { useUI } from '@/store/ui'
import { ranges, type RangeId } from '@/data/analytics'
import { members } from '@/data/mock'
import { gsap, SplitText, useGSAP, reducedMotion } from '@/lib/gsap'
import { Button } from '@/components/ui/Button'
import { SegmentedControl } from '@/components/ui/SegmentedControl'
import { QuotaGauge } from './QuotaGauge'
import { greeting, longDate, money, dayDiff, isSameDay } from '@/lib/format'

/**
 * Dashboard opener: greeting, today's summary, and quarterly quota. The
 * greeting types in letter by letter; on scroll the aurora drifts with
 * parallax and the content eases away.
 */
export function DashboardHero({ range, onRange }: { range: RangeId; onRange: (r: RangeId) => void }) {
  const ref = useRef<HTMLDivElement>(null)
  const navigate = useNavigate()
  const openQuickCreate = useUI((s) => s.openQuickCreate)
  const deals = useCrm((s) => s.deals)
  const tasks = useCrm((s) => s.tasks)
  const events = useCrm((s) => s.events)

  const closingSoon = deals.filter((d) => d.stage !== 'won' && d.stage !== 'lost' && dayDiff(d.closeDate) >= 0 && dayDiff(d.closeDate) <= 7).length
  const dueToday = tasks.filter((t) => !t.done && dayDiff(t.due) <= 0).length
  const meetings = events.filter((e) => isSameDay(e.start, new Date()) && new Date(e.end) > new Date()).length
  // Team quota = every rep's quota; closed = booked earlier this quarter + deals won in the CRM.
  const quota = members.reduce((s, m) => s + m.quota, 0)
  const wonValue = deals.filter((d) => d.stage === 'won').reduce((s, d) => s + d.value, 0)
  const closed = Math.min(quota, 340_000 + wonValue)
  const pct = Math.round((closed / quota) * 1000) / 10
  const now = new Date()
  const qEnd = new Date(now.getFullYear(), Math.floor(now.getMonth() / 3) * 3 + 3, 0)
  const daysLeft = Math.max(0, Math.round((qEnd.getTime() - now.getTime()) / 86_400_000))

  useGSAP(
    () => {
      if (reducedMotion()) return
      const title = ref.current?.querySelector('[data-greet]')
      if (title) {
        const split = SplitText.create(title, { type: 'chars,words', mask: 'words' })
        gsap.from(split.chars, { yPercent: 120, rotate: 8, duration: 0.9, stagger: 0.022, ease: 'volt.out', delay: 0.1 })
      }
      gsap.from('[data-hero-in]', { opacity: 0, y: 16, duration: 0.7, stagger: 0.08, delay: 0.35, ease: 'volt.out' })
      gsap.fromTo('[data-hero-chip]', { opacity: 0, scale: 0.8 }, { opacity: 1, scale: 1, duration: 0.5, stagger: 0.07, delay: 0.6, ease: 'back.out(2)' })
      // Scroll-linked parallax.
      gsap.to('[data-hero-aurora]', { yPercent: 35, ease: 'none', scrollTrigger: { trigger: ref.current, start: 'top top', end: 'bottom top', scrub: true } })
      gsap.to('[data-hero-content]', { y: -30, opacity: 0.35, ease: 'none', scrollTrigger: { trigger: ref.current, start: 'center 35%', end: 'bottom top', scrub: true } })
    },
    { scope: ref },
  )

  const chips = [
    { icon: <Handshake />, n: closingSoon, label: closingSoon === 1 ? 'deal closing this week' : 'deals closing this week', to: '/deals' },
    { icon: <ListTodo />, n: dueToday, label: dueToday === 1 ? 'task due today' : 'tasks due or overdue', to: '/tasks' },
    { icon: <CalendarClock />, n: meetings, label: meetings === 1 ? 'meeting left today' : 'meetings left today', to: '/calendar' },
  ]

  return (
    <section ref={ref} className="card relative overflow-hidden" style={{ borderRadius: 'var(--radius-2xl)' }}>
      <div data-hero-aurora className="aurora">
        <span />
        <span />
        <span />
      </div>
      <div className="grid-bg absolute inset-0 opacity-70" aria-hidden />
      <div data-hero-content className="relative grid gap-8 p-6 md:p-8 xl:grid-cols-[1fr_auto] xl:items-center">
        <div className="min-w-0">
          <div className="eyebrow flex items-center gap-2" data-hero-in>
            <span className="pulse-dot size-1.5 rounded-full bg-success text-success" />
            {longDate(new Date())}
          </div>
          <h1 data-greet className="font-display mt-3 text-[34px] leading-[1.02] font-semibold tracking-[-0.035em] text-fg sm:text-[44px] xl:text-[52px]">
            {greeting()}, {currentUser.name.split(' ')[0]}
            <span className="text-accent">.</span>
          </h1>
          <p className="mt-3 max-w-xl text-[15px] text-muted" data-hero-in>
            Here’s your revenue at a glance. Pipeline is up and the quarter is within reach.
          </p>
          <div className="mt-5 flex flex-wrap gap-2">
            {chips.map((c) => (
              <button
                key={c.label}
                type="button"
                data-hero-chip
                onClick={() => navigate(c.to)}
                className="group flex items-center gap-2 rounded-full border border-line-strong bg-surface/70 py-1.5 pr-3.5 pl-1.5 text-[13px] text-muted backdrop-blur transition-colors hover:border-primary/50 hover:text-fg [&_svg]:size-3.5"
              >
                <span className="flex size-6 items-center justify-center rounded-full bg-primary/15 text-primary transition-transform group-hover:scale-110">{c.icon}</span>
                <span className="tabular font-semibold text-fg">{c.n}</span>
                {c.label}
              </button>
            ))}
          </div>
          <div className="mt-6 flex flex-wrap items-center gap-2" data-hero-in>
            <Button variant="primary" size="lg" icon={<Plus />} onClick={() => openQuickCreate('deal')}>
              New deal
            </Button>
            <Button variant="secondary" size="lg" icon={<Kanban />} onClick={() => navigate('/deals')}>
              Open pipeline
            </Button>
            <SegmentedControl className="sm:ml-auto xl:ml-3" value={range} onChange={onRange} ariaLabel="Date range" options={ranges.map((r) => ({ value: r.id, label: r.label }))} />
          </div>
        </div>
        <div className="flex flex-col items-center gap-3 rounded-[var(--radius-xl)] border border-line bg-surface/60 px-6 pt-5 pb-4 backdrop-blur-md" data-hero-in>
          <div className="flex w-full items-center justify-between text-[12px]">
            <span className="font-medium text-fg">Q{Math.floor(now.getMonth() / 3) + 1} team quota</span>
            <span className="text-faint">{daysLeft} days left</span>
          </div>
          <div className="flex w-full flex-col items-center gap-5 sm:flex-row sm:justify-center xl:flex-col">
            <QuotaGauge value={pct} label={`${money(closed, true)} of ${money(quota, true)}`} />
            <dl className="grid w-full max-w-xs grid-cols-3 gap-3 border-t border-line pt-3 text-center sm:max-w-[220px] sm:grid-cols-1 sm:border-t-0 sm:border-l sm:pt-0 sm:pl-5 sm:text-left xl:hidden">
              <div>
                <dt className="text-[11px] text-faint">Closed</dt>
                <dd className="tabular text-[15px] font-semibold text-fg">{money(closed, true)}</dd>
              </div>
              <div>
                <dt className="text-[11px] text-faint">To go</dt>
                <dd className="tabular text-[15px] font-semibold text-accent">{money(quota - closed, true)}</dd>
              </div>
              <div>
                <dt className="text-[11px] text-faint">Per day needed</dt>
                <dd className="tabular text-[15px] font-semibold text-fg">{money((quota - closed) / Math.max(1, daysLeft), true)}</dd>
              </div>
            </dl>
          </div>
        </div>
      </div>
    </section>
  )
}
