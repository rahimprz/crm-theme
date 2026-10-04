import { useLayoutEffect, useRef, useState } from 'react'
import { Plus, Trash2, ChevronDown, Flame, CalendarClock, CalendarRange, CircleCheckBig, CornerDownLeft, Target } from 'lucide-react'
import { useCrm, memberById, currentUser } from '@/store/crm'
import { useUI } from '@/store/ui'
import { toast } from '@/store/toast'
import type { Priority, Task } from '@/data/types'
import { PageHeader } from '@/components/layout/PageHeader'
import { Button } from '@/components/ui/Button'
import { SegmentedControl } from '@/components/ui/SegmentedControl'
import { Checkbox } from '@/components/ui/Checkbox'
import { Avatar } from '@/components/ui/Avatar'
import { Ring } from '@/components/ui/Progress'
import { Card, CardHeader } from '@/components/ui/Card'
import { PriorityFlag, priorityMeta, taskKindMeta } from '@/components/crm/meta'
import { useOpenRecord } from '@/components/crm/ActivityTimeline'
import { sparkle } from '@/lib/confetti'
import { Flip, gsap, reducedMotion } from '@/lib/gsap'
import { dayDiff, dueLabel, shortDate } from '@/lib/format'
import { cn } from '@/lib/cn'

const groups = [
  { id: 'overdue', label: 'Overdue', icon: Flame, color: 'var(--danger)', test: (t: Task) => !t.done && dayDiff(t.due) < 0 },
  { id: 'today', label: 'Today', icon: CalendarClock, color: 'var(--accent)', test: (t: Task) => !t.done && dayDiff(t.due) === 0 },
  { id: 'upcoming', label: 'Upcoming', icon: CalendarRange, color: 'var(--primary)', test: (t: Task) => !t.done && dayDiff(t.due) > 0 },
  { id: 'done', label: 'Completed', icon: CircleCheckBig, color: 'var(--success)', test: (t: Task) => t.done },
] as const

/** Task list grouped by urgency. Completing a task sparkles, and rows glide to their new group. */
export default function Tasks() {
  const tasks = useCrm((s) => s.tasks)
  const toggleTask = useCrm((s) => s.toggleTask)
  const deleteTask = useCrm((s) => s.deleteTask)
  const addTask = useCrm((s) => s.addTask)
  const openQuickCreate = useUI((s) => s.openQuickCreate)
  const openRecord = useOpenRecord()
  const [scope, setScope] = useState<'mine' | 'all'>('all')
  const [collapsed, setCollapsed] = useState<string[]>([])
  const [draft, setDraft] = useState('')
  const [priority, setPriority] = useState<Priority>('medium')
  const list = useRef<HTMLDivElement>(null)
  const flip = useRef<Flip.FlipState | null>(null)

  const visible = tasks.filter((t) => scope === 'all' || t.assigneeId === currentUser.id)
  const open = visible.filter((t) => !t.done)
  const todayAll = visible.filter((t) => dayDiff(t.due) === 0)
  const todayDone = todayAll.filter((t) => t.done).length

  const capture = () => {
    if (list.current && !reducedMotion()) flip.current = Flip.getState(list.current.querySelectorAll('[data-task]'))
  }

  useLayoutEffect(() => {
    if (!flip.current) return
    Flip.from(flip.current, {
      duration: 0.6,
      ease: 'volt.out',
      nested: true,
      onEnter: (els) => gsap.fromTo(els, { opacity: 0, y: -10 }, { opacity: 1, y: 0, duration: 0.4 }),
      onLeave: (els) => gsap.to(els, { opacity: 0, duration: 0.2 }),
    })
    flip.current = null
  }, [tasks, collapsed, scope])

  useLayoutEffect(() => {
    if (reducedMotion() || !list.current) return
    gsap.fromTo(list.current.querySelectorAll('[data-task]'), { opacity: 0, x: -12 }, { opacity: 1, x: 0, duration: 0.5, stagger: 0.025, ease: 'volt.out' })
  }, [])

  const complete = (t: Task, e: React.MouseEvent) => {
    capture()
    if (!t.done) {
      sparkle({ x: e.clientX, y: e.clientY })
      toast.success('Task completed', t.title)
    }
    toggleTask(t.id)
  }

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!draft.trim()) return
    capture()
    const d = new Date()
    d.setHours(17, 0, 0, 0)
    addTask({ title: draft.trim(), due: d.toISOString(), priority })
    setDraft('')
    toast.success('Task added for today', draft.trim())
  }

  return (
    <div>
      <PageHeader
        eyebrow="Workspace"
        title="Tasks"
        description={`${open.length} open · ${visible.filter(groups[0].test).length} overdue. Stay on top of follow-ups.`}
        actions={
          <>
            <SegmentedControl
              value={scope}
              onChange={(v) => {
                capture()
                setScope(v)
              }}
              options={[
                { value: 'all', label: 'Everyone' },
                { value: 'mine', label: 'Assigned to me' },
              ]}
            />
            <Button variant="primary" icon={<Plus />} onClick={() => openQuickCreate('task')}>
              New task
            </Button>
          </>
        }
      />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="min-w-0 space-y-4">
          <form onSubmit={submit} className="card spotlight flex flex-col gap-3 p-3 sm:flex-row sm:items-center">
            <div className="flex flex-1 items-center gap-3 px-2">
              <span className="flex size-[18px] items-center justify-center rounded-full border-2 border-dashed border-line-strong" />
              <input
                id="task-quick-add"
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                placeholder="Add a task for today and press Enter…"
                className="h-10 flex-1 bg-transparent text-[14px] text-fg outline-none placeholder:text-faint focus-visible:outline-none"
              />
            </div>
            <div className="flex items-center gap-1.5 px-2 sm:px-0">
              {(Object.keys(priorityMeta) as Priority[]).map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setPriority(p)}
                  className={cn('flex h-8 items-center gap-1.5 rounded-lg border px-2 text-[12px] transition-all', priority === p ? 'border-line-strong bg-surface-3 text-fg' : 'border-transparent text-faint hover:text-muted')}
                  aria-pressed={priority === p}
                >
                  <PriorityFlag priority={p} />
                  <span className="hidden xl:inline">{priorityMeta[p].label}</span>
                </button>
              ))}
              <Button type="submit" variant="primary" size="sm" icon={<CornerDownLeft />} className="ml-1">
                Add
              </Button>
            </div>
          </form>

          <div ref={list} className="space-y-4">
            {groups.map((g) => {
              const items = visible.filter(g.test).sort((a, b) => a.due.localeCompare(b.due))
              if (!items.length) return null
              const isCollapsed = collapsed.includes(g.id)
              const Icon = g.icon
              return (
                <section key={g.id} className="card overflow-hidden">
                  <button
                    type="button"
                    onClick={() => {
                      capture()
                      setCollapsed((c) => (isCollapsed ? c.filter((x) => x !== g.id) : [...c, g.id]))
                    }}
                    className="flex w-full items-center gap-2.5 px-4 py-3 text-left hover:bg-surface-2/60"
                    aria-expanded={!isCollapsed}
                  >
                    <Icon className="size-4" style={{ color: g.color }} />
                    <span className="text-[13.5px] font-semibold text-fg">{g.label}</span>
                    <span className="tabular rounded-full bg-surface-3 px-1.5 text-[11px] text-muted">{items.length}</span>
                    <ChevronDown className={cn('ml-auto size-4 text-faint transition-transform duration-300', isCollapsed && '-rotate-90')} />
                  </button>
                  {!isCollapsed && (
                    <ul className="border-t border-line">
                      {items.map((t) => {
                        const kind = taskKindMeta[t.kind]
                        const KindIcon = kind.icon
                        const who = memberById(t.assigneeId)
                        return (
                          <li key={t.id} data-task data-flip-id={t.id} className="group flex items-center gap-3 border-b border-line/60 px-4 py-3 last:border-0 hover:bg-surface-2/60">
                            <span onClickCapture={(e) => complete(t, e)}>
                              <Checkbox checked={t.done} onChange={() => {}} round label={`Toggle ${t.title}`} />
                            </span>
                            <div className="min-w-0 flex-1">
                              <p className={cn('text-[13.5px] transition-colors', t.done ? 'text-faint line-through decoration-faint' : 'text-fg')}>{t.title}</p>
                              <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11.5px] text-faint">
                                <span className="inline-flex items-center gap-1"><KindIcon className="size-3" />{kind.label}</span>
                                <span className={cn(g.id === 'overdue' && 'text-danger')}>{t.done ? `Done · due ${shortDate(t.due)}` : dueLabel(t.due)}</span>
                                {t.related && (
                                  <button type="button" onClick={() => openRecord(t.related!)} className="rounded-md bg-surface-3 px-1.5 py-0.5 text-muted transition-colors hover:text-primary">
                                    {t.related.label}
                                  </button>
                                )}
                              </div>
                            </div>
                            <PriorityFlag priority={t.priority} />
                            {who && <Avatar name={who.name} hue={who.hue} size="xs" className="hidden sm:inline-flex" />}
                            <button
                              type="button"
                              onClick={() => {
                                capture()
                                deleteTask(t.id)
                                toast.danger('Task deleted', t.title)
                              }}
                              className="flex size-7 items-center justify-center rounded-md text-faint opacity-0 transition-all group-hover:opacity-100 hover:bg-danger/10 hover:text-danger focus:opacity-100"
                              aria-label="Delete task"
                            >
                              <Trash2 className="size-3.5" />
                            </button>
                          </li>
                        )
                      })}
                    </ul>
                  )}
                </section>
              )
            })}
          </div>
        </div>

        <aside className="space-y-4">
          <Card className="p-5">
            <div className="flex items-center gap-4">
              <Ring value={(todayDone / Math.max(1, todayAll.length)) * 100} size={88} stroke={8}>
                <div className="text-center leading-none">
                  <div className="tabular text-[20px] font-semibold text-fg">
                    {todayDone}/{todayAll.length}
                  </div>
                  <div className="mt-1 text-[10px] text-faint">today</div>
                </div>
              </Ring>
              <div>
                <h3 className="text-[15px] font-semibold text-fg">Daily focus</h3>
                <p className="mt-1 text-[12.5px] text-muted">
                  {todayAll.length - todayDone > 0 ? `${todayAll.length - todayDone} left today. You’ve got this.` : 'Everything for today is done.'}
                </p>
              </div>
            </div>
          </Card>
          <Card>
            <CardHeader icon={<Target />} title="By priority" subtitle="Open tasks" />
            <ul className="space-y-3 p-5">
              {(Object.keys(priorityMeta) as Priority[]).reverse().map((p) => {
                const n = open.filter((t) => t.priority === p).length
                return (
                  <li key={p}>
                    <div className="mb-1.5 flex items-center justify-between text-[12.5px]">
                      <span className="flex items-center gap-2 text-muted"><PriorityFlag priority={p} />{priorityMeta[p].label}</span>
                      <span className="tabular font-semibold text-fg">{n}</span>
                    </div>
                    <div className="h-1.5 overflow-hidden rounded-full bg-surface-3">
                      <div className="h-full rounded-full transition-[width] duration-700" style={{ width: `${(n / Math.max(1, open.length)) * 100}%`, background: priorityMeta[p].color }} />
                    </div>
                  </li>
                )
              })}
            </ul>
          </Card>
        </aside>
      </div>
    </div>
  )
}
