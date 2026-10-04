import { useLayoutEffect, useRef, useState } from 'react'
import { Plus, Database, Mail, Hash, CalendarDays, Webhook, Sparkles, Timer, Play, Zap, Clock3, CircleCheck, CircleX, GitBranch, Activity } from 'lucide-react'
import { useCrm } from '@/store/crm'
import { toast } from '@/store/toast'
import type { Workflow, WorkflowStep } from '@/data/types'
import { PageHeader } from '@/components/layout/PageHeader'
import { Button } from '@/components/ui/Button'
import { Switch } from '@/components/ui/Switch'
import { Badge } from '@/components/ui/Badge'
import { AnimatedNumber } from '@/components/ui/AnimatedNumber'
import { gsap, reducedMotion } from '@/lib/gsap'
import { number, relativeTime } from '@/lib/format'
import { cn } from '@/lib/cn'

const appIcon: Record<WorkflowStep['app'], typeof Mail> = {
  crm: Database,
  email: Mail,
  slack: Hash,
  calendar: CalendarDays,
  webhook: Webhook,
  ai: Sparkles,
  timer: Timer,
}

const kindMeta: Record<WorkflowStep['kind'], { label: string; color: string }> = {
  trigger: { label: 'Trigger', color: 'var(--accent)' },
  condition: { label: 'Condition', color: 'var(--c5)' },
  action: { label: 'Action', color: 'var(--primary)' },
  delay: { label: 'Wait', color: 'var(--c3)' },
}

function Node({ step, selected, onSelect }: { step: WorkflowStep; selected: boolean; onSelect: () => void }) {
  const Icon = appIcon[step.app]
  const k = kindMeta[step.kind]
  return (
    <button
      type="button"
      data-node
      onClick={onSelect}
      className={cn(
        'card spotlight relative flex w-full max-w-[300px] items-center gap-3 p-3 text-left transition-[border-color,box-shadow] duration-300',
        selected ? 'border-primary/60 shadow-[var(--glow-primary)]' : 'hover:border-line-strong',
      )}
    >
      <span className="flex size-10 shrink-0 items-center justify-center rounded-xl" style={{ background: `color-mix(in oklab, ${k.color} 16%, transparent)`, color: k.color, boxShadow: `inset 0 0 0 1px color-mix(in oklab, ${k.color} 30%, transparent)` }}>
        <Icon className="size-[18px]" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="eyebrow block" style={{ color: k.color }}>{k.label}</span>
        <span className="block truncate text-[13.5px] font-semibold text-fg">{step.title}</span>
        <span className="block truncate text-[12px] text-faint">{step.detail}</span>
      </span>
    </button>
  )
}

function Connector({ active, height = 36 }: { active: boolean; height?: number }) {
  return (
    <svg data-conn width="2" height={height} className="overflow-visible" aria-hidden>
      <line x1="1" y1="0" x2="1" y2={height} strokeWidth="2" style={{ stroke: 'var(--line-strong)' }} />
      {active && <line x1="1" y1="0" x2="1" y2={height} strokeWidth="2" className="flow-line" style={{ stroke: 'var(--primary)' }} />}
    </svg>
  )
}

function Fork({ active }: { active: boolean }) {
  const d = 'M50 0 V12 Q50 20 42 20 H33 Q25 20 25 28 V40 M50 12 Q50 20 58 20 H67 Q75 20 75 28 V40'
  return (
    <svg data-conn viewBox="0 0 100 40" preserveAspectRatio="none" className="h-10 w-full overflow-visible" aria-hidden>
      <path d={d} fill="none" strokeWidth="2" vectorEffect="non-scaling-stroke" style={{ stroke: 'var(--line-strong)' }} />
      {active && <path d={d} fill="none" strokeWidth="2" vectorEffect="non-scaling-stroke" className="flow-line" style={{ stroke: 'var(--primary)' }} />}
    </svg>
  )
}

function Canvas({ wf }: { wf: Workflow }) {
  const ref = useRef<HTMLDivElement>(null)
  const [selected, setSelected] = useState(wf.steps[0].id)
  const condIdx = wf.steps.findIndex((s) => s.kind === 'condition')
  const main = condIdx >= 0 ? wf.steps.slice(0, condIdx + 1) : wf.steps
  const yes = wf.steps.filter((s) => s.branch === 'yes')
  const no = wf.steps.filter((s) => s.branch === 'no')
  const sel = wf.steps.find((s) => s.id === selected) ?? wf.steps[0]

  useLayoutEffect(() => {
    setSelected(wf.steps[0].id)
    if (reducedMotion() || !ref.current) return
    gsap.fromTo(ref.current.querySelectorAll('[data-node], [data-conn]'), { opacity: 0, y: 18, scale: 0.96 }, { opacity: 1, y: 0, scale: 1, duration: 0.55, stagger: 0.06, ease: 'volt.out' })
  }, [wf.id])

  const Branch = ({ steps, label, tone }: { steps: WorkflowStep[]; label: string; tone: 'success' | 'neutral' }) => (
    <div className="flex flex-col items-center">
      <Badge tone={tone} className="mb-2">{label}</Badge>
      {steps.length === 0 ? (
        <span className="rounded-full border border-dashed border-line-strong px-3 py-1.5 text-[12px] text-faint">End</span>
      ) : (
        steps.map((s, i) => (
          <div key={s.id} className="flex w-full flex-col items-center">
            {i > 0 && <Connector active={wf.active} height={28} />}
            <Node step={s} selected={selected === s.id} onSelect={() => setSelected(s.id)} />
          </div>
        ))
      )}
    </div>
  )

  return (
    <div className="grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1fr)_280px]">
      <div
        ref={ref}
        className="relative overflow-hidden rounded-[var(--radius-xl)] border border-line px-4 py-8"
        style={{ backgroundImage: 'radial-gradient(color-mix(in oklab, var(--fg) 10%, transparent) 1px, transparent 1px)', backgroundSize: '18px 18px', backgroundColor: 'var(--surface)' }}
      >
        <div className="flex flex-col items-center">
          {main.map((s, i) => (
            <div key={s.id} className="flex w-full flex-col items-center">
              {i > 0 && <Connector active={wf.active} />}
              <Node step={s} selected={selected === s.id} onSelect={() => setSelected(s.id)} />
            </div>
          ))}
          {condIdx >= 0 && (
            <>
              <div className="w-full max-w-[640px]">
                <Fork active={wf.active} />
              </div>
              <div className="grid w-full max-w-[680px] grid-cols-2 gap-3">
                <Branch steps={yes} label="Yes" tone="success" />
                <Branch steps={no} label="No" tone="neutral" />
              </div>
            </>
          )}
          <div className="mt-6">
            <Button variant="outline" size="sm" icon={<Plus />} onClick={() => toast.info('Add a step', 'Pick an app and an action. This is a design preview.')}>
              Add step
            </Button>
          </div>
        </div>
      </div>

      <aside className="card p-4">
        <div className="eyebrow mb-3">Step settings</div>
        <div className="mb-4 flex items-center gap-3">
          <span className="flex size-10 items-center justify-center rounded-xl" style={{ background: `color-mix(in oklab, ${kindMeta[sel.kind].color} 16%, transparent)`, color: kindMeta[sel.kind].color }}>
            {(() => {
              const I = appIcon[sel.app]
              return <I className="size-[18px]" />
            })()}
          </span>
          <div className="min-w-0">
            <div className="truncate text-[14px] font-semibold text-fg">{sel.title}</div>
            <div className="text-[12px] text-faint">{kindMeta[sel.kind].label} · {sel.app.toUpperCase()}</div>
          </div>
        </div>
        <dl className="space-y-3 text-[12.5px]">
          <div>
            <dt className="text-faint">Configuration</dt>
            <dd className="mt-1 rounded-lg border border-line bg-surface-2 px-3 py-2 text-fg">{sel.detail}</dd>
          </div>
          <div className="flex justify-between"><dt className="text-faint">Avg. duration</dt><dd className="tabular text-fg">{sel.kind === 'delay' ? '15m' : sel.app === 'ai' ? '1.8s' : '240ms'}</dd></div>
          <div className="flex justify-between"><dt className="text-faint">Errors (7d)</dt><dd className="tabular text-fg">{sel.app === 'slack' ? 2 : 0}</dd></div>
        </dl>
        <Button variant="secondary" size="sm" icon={<Play />} className="mt-4 w-full" onClick={() => toast.success('Test run passed', `${sel.title} finished in 240ms`)}>
          Test this step
        </Button>
      </aside>
    </div>
  )
}

export default function Workflows() {
  const workflows = useCrm((s) => s.workflows)
  const toggleWorkflow = useCrm((s) => s.toggleWorkflow)
  const [activeId, setActiveId] = useState(workflows[0]?.id)
  const wf = workflows.find((w) => w.id === activeId) ?? workflows[0]
  const totalRuns = workflows.reduce((s, w) => s + w.runs, 0)
  const live = workflows.filter((w) => w.active).length

  const history = [
    { ok: true, at: 0.1, ms: 820 },
    { ok: true, at: 0.4, ms: 640 },
    { ok: true, at: 1.2, ms: 910 },
    { ok: false, at: 2.6, ms: 4100 },
    { ok: true, at: 3.1, ms: 700 },
    { ok: true, at: 5.5, ms: 680 },
  ]

  return (
    <div>
      <PageHeader
        eyebrow="Insights"
        title="Workflows"
        description="Automations that route leads, nudge owners and celebrate wins while you sell."
        actions={
          <Button variant="primary" icon={<Plus />} onClick={() => toast.info('New workflow', 'Start from a trigger such as “Deal stage changed”.')}>
            New workflow
          </Button>
        }
      />

      <div className="mb-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {[
          { icon: <Zap />, label: 'Live workflows', value: live, color: 'var(--accent)', format: 'number' as const },
          { icon: <Activity />, label: 'Total runs', value: totalRuns, color: 'var(--primary)', format: 'number' as const },
          { icon: <CircleCheck />, label: 'Success rate', value: 98.6, color: 'var(--success)', format: 'percent' as const },
          { icon: <Clock3 />, label: 'Hours saved / month', value: 46, color: 'var(--c3)', format: 'number' as const },
        ].map((s) => (
          <div key={s.label} className="card spotlight flex items-center gap-3 p-3.5">
            <span className="flex size-9 items-center justify-center rounded-lg [&_svg]:size-4" style={{ background: `color-mix(in oklab, ${s.color} 15%, transparent)`, color: s.color }}>{s.icon}</span>
            <div>
              <div className="text-[12px] text-muted">{s.label}</div>
              <AnimatedNumber value={s.value} format={s.format} compact={false} className="text-[18px] font-semibold text-fg" />
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[340px_minmax(0,1fr)]">
        <div className="space-y-2.5">
          {workflows.map((w) => (
            <div
              key={w.id}
              role="button"
              tabIndex={0}
              onClick={() => setActiveId(w.id)}
              onKeyDown={(e) => e.key === 'Enter' && setActiveId(w.id)}
              className={cn('card spotlight cursor-pointer p-4 transition-[border-color]', w.id === wf.id ? 'border-primary/50' : 'hover:border-line-strong')}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className={cn('size-2 rounded-full', w.active ? 'pulse-dot bg-success text-success' : 'bg-faint')} />
                    <h3 className="truncate text-[14px] font-semibold text-fg">{w.name}</h3>
                  </div>
                  <p className="mt-1 line-clamp-2 text-[12.5px] text-muted">{w.description}</p>
                </div>
                <span onClick={(e) => e.stopPropagation()}>
                  <Switch
                    id={`wf-${w.id}`}
                    checked={w.active}
                    tone="success"
                    onChange={() => {
                      toggleWorkflow(w.id)
                      toast[w.active ? 'warning' : 'success'](w.active ? 'Workflow paused' : 'Workflow is live', w.name)
                    }}
                    ariaLabel={`Toggle ${w.name}`}
                  />
                </span>
              </div>
              <div className="mt-3 flex items-center gap-4 text-[11.5px] text-faint">
                <span className="flex items-center gap-1"><GitBranch className="size-3" />{w.steps.length} steps</span>
                <span className="tabular">{number(w.runs, true)} runs</span>
                <span className="tabular">{w.successRate}% ok</span>
                <span className="ml-auto">{relativeTime(w.lastRun)}</span>
              </div>
            </div>
          ))}
        </div>

        <div className="min-w-0 space-y-4">
          <div className="card p-4">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="font-display text-[18px] font-semibold text-fg">{wf.name}</h2>
                <p className="text-[12.5px] text-muted">{wf.active ? 'Live · data is flowing through each step' : 'Paused · turn it on to start running'}</p>
              </div>
              <Button variant="secondary" size="sm" icon={<Play />} onClick={() => toast.success('Test run started', wf.name)}>
                Test run
              </Button>
            </div>
            <Canvas wf={wf} />
          </div>
          <div className="card overflow-hidden">
            <div className="border-b border-line px-4 py-3 text-[13.5px] font-semibold text-fg">Recent runs</div>
            <ul>
              {history.map((h, i) => (
                <li key={i} className="flex items-center gap-3 border-b border-line/60 px-4 py-2.5 text-[12.5px] last:border-0">
                  {h.ok ? <CircleCheck className="size-4 text-success" /> : <CircleX className="size-4 text-danger" />}
                  <span className="text-fg">{h.ok ? 'Completed' : 'Failed at “Alert #hot-leads”: channel archived'}</span>
                  <span className="tabular ml-auto text-faint">{h.ms}ms</span>
                  <span className="w-16 text-right text-faint">{relativeTime(new Date(Date.now() - h.at * 3600_000).toISOString())}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
