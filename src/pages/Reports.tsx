import { useRef } from 'react'
import { TrendingUp, Target, Timer, Crown, ChartColumnStacked, ChartSpline, Users, Filter, Download, CalendarRange } from 'lucide-react'
import { useCrm } from '@/store/crm'
import { members } from '@/data/mock'
import { toast } from '@/store/toast'
import { getRevenueMix, getWinRateTrend } from '@/data/analytics'
import { PageHeader } from '@/components/layout/PageHeader'
import { Button } from '@/components/ui/Button'
import { Card, CardHeader } from '@/components/ui/Card'
import { Avatar } from '@/components/ui/Avatar'
import { AnimatedNumber } from '@/components/ui/AnimatedNumber'
import { BarChart } from '@/components/charts/BarChart'
import { AreaChart } from '@/components/charts/AreaChart'
import { Sparkline } from '@/components/charts/Sparkline'
import { useReveal } from '@/hooks/useReveal'
import { gsap, useGSAP, reducedMotion } from '@/lib/gsap'
import { money } from '@/lib/format'

/* ───────────── Pinned horizontal story ───────────── */

const story = [
  { icon: TrendingUp, eyebrow: 'Revenue', value: 38.4, format: 'percent' as const, prefix: '+', title: 'Revenue grew faster than any quarter on record.', body: 'Expansion revenue from existing customers drove almost half of the growth.', color: 'var(--primary)', trend: [12, 14, 13, 17, 19, 18, 22, 25, 24, 29, 31, 34] },
  { icon: Target, eyebrow: 'Win rate', value: 31.2, format: 'percent' as const, prefix: '', title: 'One in three qualified deals now closes.', body: 'Up from 24% a year ago after the new discovery playbook rolled out.', color: 'var(--accent)', trend: [22, 23, 23, 24, 26, 25, 27, 28, 29, 29, 30, 31] },
  { icon: Timer, eyebrow: 'Sales cycle', value: 41, format: 'number' as const, prefix: '', suffix: ' days', title: 'Deals close nine days sooner.', body: 'Security reviews start earlier, so legal is no longer the long pole.', color: 'var(--c3)', trend: [58, 56, 55, 53, 52, 50, 49, 47, 46, 44, 43, 41] },
  { icon: Crown, eyebrow: 'Top performer', value: 142, format: 'number' as const, prefix: '', suffix: '% of quota', title: 'Priya Shah hit 142% of quota.', body: 'Six enterprise wins, including the Solstice multi-year agreement.', color: 'var(--c5)', trend: [40, 52, 61, 70, 76, 85, 92, 101, 112, 120, 133, 142] },
]

function QuarterStory() {
  const wrap = useRef<HTMLDivElement>(null)
  const track = useRef<HTMLDivElement>(null)
  const bar = useRef<HTMLDivElement>(null)

  useGSAP(
    () => {
      if (reducedMotion()) return
      const mm = gsap.matchMedia()
      mm.add('(min-width: 768px)', () => {
        const el = track.current!
        const distance = () => el.scrollWidth - el.clientWidth
        const tween = gsap.to(el, {
          x: () => -distance(),
          ease: 'none',
          scrollTrigger: {
            trigger: wrap.current,
            start: 'top 96px',
            end: () => `+=${distance()}`,
            pin: true,
            scrub: 0.8,
            invalidateOnRefresh: true,
            onUpdate: (self) => gsap.set(bar.current, { scaleX: self.progress }),
          },
        })
        // Each panel's big number scales in as it crosses the center.
        gsap.utils.toArray<HTMLElement>('[data-panel]', el).forEach((p) => {
          gsap.fromTo(
            p.querySelector('[data-big]'),
            { scale: 0.7, opacity: 0.2 },
            { scale: 1, opacity: 1, ease: 'none', scrollTrigger: { trigger: p, containerAnimation: tween, start: 'left 85%', end: 'left 35%', scrub: true } },
          )
        })
      })
      return () => mm.revert()
    },
    { scope: wrap },
  )

  return (
    <section ref={wrap} className="relative mb-6 md:[overflow-x:clip]">
      <div className="mb-3 flex items-center justify-between">
        <div className="eyebrow">Quarter in review · scroll to explore</div>
        <div className="hidden h-1 w-40 overflow-hidden rounded-full bg-surface-3 md:block">
          <div ref={bar} className="h-full origin-left scale-x-0 rounded-full" style={{ background: 'linear-gradient(90deg, var(--primary), var(--accent))' }} />
        </div>
      </div>
      <div ref={track} className="flex flex-col gap-4 md:flex-row md:overflow-visible">
        {story.map((s) => {
          const Icon = s.icon
          return (
            <article
              key={s.eyebrow}
              data-panel
              className="card spotlight relative flex min-h-[340px] shrink-0 flex-col justify-between overflow-hidden p-7 md:w-[min(560px,70vw)]"
            >
              <div className="pointer-events-none absolute -top-24 -right-24 size-72 rounded-full opacity-25 blur-3xl" style={{ background: s.color }} />
              <div className="relative flex items-center gap-3">
                <span className="flex size-10 items-center justify-center rounded-xl" style={{ background: `color-mix(in oklab, ${s.color} 16%, transparent)`, color: s.color }}>
                  <Icon className="size-5" />
                </span>
                <span className="eyebrow">{s.eyebrow}</span>
              </div>
              <div className="relative">
                <div data-big className="origin-left text-[64px] leading-none font-semibold tracking-[-0.045em] text-fg md:text-[84px]">
                  {s.prefix}
                  <AnimatedNumber value={s.value} format={s.format} compact={false} duration={2} />
                  {s.suffix && <span className="text-[0.4em] tracking-normal text-muted">{s.suffix}</span>}
                </div>
                <h3 className="font-display mt-4 max-w-md text-[20px] leading-snug font-semibold text-fg">{s.title}</h3>
                <p className="mt-2 max-w-md text-[13.5px] text-muted">{s.body}</p>
              </div>
              <div className="relative -mx-2 mt-4">
                <Sparkline values={s.trend} color={s.color} width={480} height={56} />
              </div>
            </article>
          )
        })}
      </div>
    </section>
  )
}

/* ───────────── Funnel ───────────── */

function Funnel() {
  const stages = [
    { label: 'Leads', value: 1284, color: 'var(--primary)', text: 'var(--primary-fg)' },
    { label: 'Qualified', value: 642, color: 'color-mix(in oklab, var(--primary) 72%, var(--surface-3))', text: 'var(--fg)' },
    { label: 'Proposal', value: 318, color: 'color-mix(in oklab, var(--primary) 52%, var(--surface-3))', text: 'var(--fg)' },
    { label: 'Negotiation', value: 164, color: 'color-mix(in oklab, var(--primary) 36%, var(--surface-3))', text: 'var(--fg)' },
    { label: 'Won', value: 98, color: 'var(--accent)', text: 'var(--accent-fg)' },
  ]
  const ref = useRef<HTMLDivElement>(null)
  useGSAP(
    () => {
      if (reducedMotion()) return
      gsap.from('[data-band]', { scaleX: 0, transformOrigin: 'center', duration: 1, stagger: 0.12, ease: 'volt.out', scrollTrigger: { trigger: ref.current, start: 'top 85%', once: true } })
    },
    { scope: ref },
  )
  const max = stages[0].value
  return (
    <div ref={ref} className="space-y-2.5">
      {stages.map((s, i) => {
        const w = Math.max(18, (s.value / max) * 100)
        const conv = i > 0 ? Math.round((s.value / stages[i - 1].value) * 100) : null
        return (
          <div key={s.label} className="grid grid-cols-[90px_minmax(0,1fr)_64px] items-center gap-3 sm:grid-cols-[110px_minmax(0,1fr)_80px]">
            <span className="text-[13px] text-muted">{s.label}</span>
            <div className="flex justify-center">
              <div
                data-band
                className="flex h-10 items-center justify-center rounded-lg text-[13px] font-semibold"
                style={{ width: `${w}%`, background: s.color, color: s.text, boxShadow: `0 8px 24px -10px ${s.color}` }}
              >
                <span className="tabular">{s.value.toLocaleString()}</span>
              </div>
            </div>
            <span className="tabular text-right text-[12.5px] text-faint">{conv ? `${conv}%` : '—'}</span>
          </div>
        )
      })}
      <div className="grid grid-cols-[90px_minmax(0,1fr)_64px] gap-3 pt-1 text-[11.5px] text-faint sm:grid-cols-[110px_minmax(0,1fr)_80px]">
        <span />
        <span className="text-center">Deals at each stage, last 12 months</span>
        <span className="text-right">Step conv.</span>
      </div>
    </div>
  )
}

/* ───────────── Page ───────────── */

export default function Reports() {
  const ref = useRef<HTMLDivElement>(null)
  const deals = useCrm((s) => s.deals)
  const mix = getRevenueMix()
  const wr = getWinRateTrend()
  useReveal(ref)

  const byOwner = members
    .slice(0, 5)
    .map((m) => ({ m, value: deals.filter((d) => d.ownerId === m.id && d.stage !== 'lost').reduce((s, d) => s + d.value, 0) }))
    .sort((a, b) => b.value - a.value)
  const maxOwner = Math.max(...byOwner.map((o) => o.value), 1)

  const forecast = Array.from({ length: 3 }, (_, i) => {
    const d = new Date()
    d.setMonth(d.getMonth() + i)
    const label = d.toLocaleDateString('en-US', { month: 'long' })
    const commit = 210_000 + i * 32_000
    return { label, commit, best: commit * 1.32, pipeline: commit * 2.4 }
  })

  return (
    <div ref={ref}>
      <PageHeader
        eyebrow="Insights"
        title="Reports"
        description="How the quarter is going, where deals stall, and what to expect next."
        actions={
          <>
            <Button variant="secondary" icon={<CalendarRange />} onClick={() => toast.info('Date range', 'This quarter is selected.')}>
              This quarter
            </Button>
            <Button variant="secondary" icon={<Download />} onClick={() => toast.success('Report exported', 'Q4-report.csv is ready.')}>
              Export
            </Button>
          </>
        }
      />

      <QuarterStory />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card data-reveal>
          <CardHeader
            icon={<ChartColumnStacked />}
            title="Revenue mix"
            subtitle="New business, expansion and renewals by month"
            action={
              <div className="hidden gap-3 text-[11.5px] text-muted sm:flex">
                {[
                  ['New', 'var(--primary)'],
                  ['Expansion', 'var(--accent)'],
                  ['Renewal', 'var(--c3)'],
                ].map(([l, c]) => (
                  <span key={l} className="flex items-center gap-1.5">
                    <span className="size-2 rounded-[3px]" style={{ background: c }} />
                    {l}
                  </span>
                ))}
              </div>
            }
          />
          <div className="px-3 pt-4 pb-4">
            <BarChart
              data={mix.map((m) => ({ label: m.label, values: { renewal: m.renewal, expansion: m.expansion, newBiz: m.newBiz } }))}
              series={[
                { key: 'renewal', label: 'Renewal', color: 'var(--c3)' },
                { key: 'expansion', label: 'Expansion', color: 'var(--accent)' },
                { key: 'newBiz', label: 'New business', color: 'var(--primary)' },
              ]}
              format={(n) => money(n, true)}
            />
          </div>
        </Card>

        <Card data-reveal>
          <CardHeader icon={<ChartSpline />} title="Win rate" subtitle="Share of closed deals won, by month" />
          <div className="px-3 pt-4 pb-4">
            <AreaChart labels={wr.map((w) => w.label)} height={260} format={(n) => `${Math.round(n)}%`} series={[{ key: 'wr', label: 'Win rate', color: 'var(--accent)', values: wr.map((w) => w.winRate) }]} />
          </div>
        </Card>

        <Card data-reveal>
          <CardHeader icon={<Filter />} title="Conversion funnel" subtitle="From first touch to closed won" />
          <div className="p-5">
            <Funnel />
          </div>
        </Card>

        <Card data-reveal>
          <CardHeader icon={<Users />} title="Pipeline by owner" subtitle="Open and won deal value" />
          <ul className="space-y-4 p-5">
            {byOwner.map(({ m, value }, i) => (
              <li key={m.id} className="flex items-center gap-3">
                <Avatar name={m.name} hue={m.hue} size="sm" />
                <div className="min-w-0 flex-1">
                  <div className="mb-1.5 flex items-baseline justify-between text-[13px]">
                    <span className="truncate font-medium text-fg">{m.name}</span>
                    <span className="tabular font-semibold text-fg">{money(value, true)}</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-surface-3">
                    <div
                      className="h-full rounded-full"
                      style={{ width: `${(value / maxOwner) * 100}%`, background: i === 0 ? 'linear-gradient(90deg, var(--primary), var(--accent))' : 'var(--primary)', opacity: i === 0 ? 1 : 0.55 + (0.35 * (5 - i)) / 5 }}
                    />
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </Card>

        <Card data-reveal className="lg:col-span-2">
          <CardHeader icon={<TrendingUp />} title="Forecast" subtitle="Next three months, by confidence" />
          <div className="overflow-x-auto p-5">
            <table className="w-full min-w-[520px] text-left text-[13px]">
              <thead>
                <tr className="text-[11.5px] text-faint">
                  <th className="pb-3 font-medium">Month</th>
                  <th className="pb-3 text-right font-medium">Commit</th>
                  <th className="pb-3 text-right font-medium">Best case</th>
                  <th className="pb-3 text-right font-medium">Pipeline</th>
                  <th className="w-[38%] pb-3 pl-6 font-medium">Coverage</th>
                </tr>
              </thead>
              <tbody>
                {forecast.map((f) => (
                  <tr key={f.label} className="border-t border-line">
                    <td className="py-3.5 font-medium text-fg">{f.label}</td>
                    <td className="tabular py-3.5 text-right font-semibold text-fg">{money(f.commit, true)}</td>
                    <td className="tabular py-3.5 text-right text-muted">{money(f.best, true)}</td>
                    <td className="tabular py-3.5 text-right text-muted">{money(f.pipeline, true)}</td>
                    <td className="py-3.5 pl-6">
                      <div className="relative h-2.5 overflow-hidden rounded-full bg-surface-3">
                        <div className="absolute inset-y-0 left-0 rounded-full bg-primary/30" style={{ width: '100%' }} />
                        <div className="absolute inset-y-0 left-0 rounded-full bg-primary/60" style={{ width: `${(f.best / f.pipeline) * 100}%` }} />
                        <div className="absolute inset-y-0 left-0 rounded-full bg-accent" style={{ width: `${(f.commit / f.pipeline) * 100}%` }} />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="mt-3 flex flex-wrap gap-4 text-[11.5px] text-muted">
              <span className="flex items-center gap-1.5"><span className="size-2 rounded-[3px] bg-accent" />Commit</span>
              <span className="flex items-center gap-1.5"><span className="size-2 rounded-[3px] bg-primary/60" />Best case</span>
              <span className="flex items-center gap-1.5"><span className="size-2 rounded-[3px] bg-primary/30" />Pipeline</span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}
