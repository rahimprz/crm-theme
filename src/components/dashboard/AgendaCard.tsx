import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { CalendarCheck, ArrowRight, Video, MapPin } from 'lucide-react'
import { useCrm, memberById } from '@/store/crm'
import { toast } from '@/store/toast'
import { Card, CardHeader } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Tabs } from '@/components/ui/Tabs'
import { Checkbox } from '@/components/ui/Checkbox'
import { Progress } from '@/components/ui/Progress'
import { AvatarStack } from '@/components/ui/Avatar'
import { PriorityFlag } from '@/components/crm/meta'
import { sparkle } from '@/lib/confetti'
import { dayDiff, dueLabel, isSameDay, time } from '@/lib/format'
import { cn } from '@/lib/cn'

/** Today's tasks and meetings in one card. Checking a task off sparkles. */
export function AgendaCard() {
  const [tab, setTab] = useState<'tasks' | 'meetings'>('tasks')
  const tasks = useCrm((s) => s.tasks)
  const events = useCrm((s) => s.events)
  const toggleTask = useCrm((s) => s.toggleTask)
  const navigate = useNavigate()

  const today = tasks.filter((t) => dayDiff(t.due) <= 0 && (!t.done || dayDiff(t.due) === 0)).slice(0, 6)
  const done = today.filter((t) => t.done).length
  const meetings = events.filter((e) => isSameDay(e.start, new Date())).sort((a, b) => a.start.localeCompare(b.start))

  return (
    <Card className="flex flex-col" data-reveal>
      <CardHeader
        icon={<CalendarCheck />}
        title="Today"
        subtitle={`${done} of ${today.length} tasks done · ${meetings.length} meetings`}
        action={
          <Button variant="ghost" size="icon-sm" onClick={() => navigate(tab === 'tasks' ? '/tasks' : '/calendar')} aria-label="Open">
            <ArrowRight />
          </Button>
        }
      />
      <div className="px-5 pt-3">
        <Progress value={done} max={Math.max(1, today.length)} gradient height={4} />
        <Tabs
          className="mt-3"
          value={tab}
          onChange={setTab}
          tabs={[
            { value: 'tasks', label: 'Tasks', count: today.length - done },
            { value: 'meetings', label: 'Meetings', count: meetings.length },
          ]}
        />
      </div>
      <ul className="flex-1 space-y-1 p-3">
        {tab === 'tasks' &&
          today.map((t) => (
            <li key={t.id} className="group flex items-start gap-3 rounded-lg p-2 transition-colors hover:bg-surface-2">
              <span
                className="pt-0.5"
                onClickCapture={(e) => {
                  if (!t.done) {
                    sparkle({ x: e.clientX, y: e.clientY })
                    toast.success('Task completed', t.title)
                  }
                }}
              >
                <Checkbox checked={t.done} onChange={() => toggleTask(t.id)} round label={`Complete ${t.title}`} />
              </span>
              <div className="min-w-0 flex-1">
                <p className={cn('text-[13px] leading-snug transition-all duration-300', t.done ? 'text-faint line-through' : 'text-fg')}>{t.title}</p>
                <div className="mt-1 flex items-center gap-2 text-[11.5px]">
                  <span className={cn(dayDiff(t.due) < 0 && !t.done ? 'text-danger' : 'text-faint')}>{dueLabel(t.due)}</span>
                  {t.related && <span className="truncate text-faint">· {t.related.label}</span>}
                </div>
              </div>
              <PriorityFlag priority={t.priority} />
            </li>
          ))}
        {tab === 'meetings' &&
          meetings.map((e) => {
            const past = new Date(e.end) < new Date()
            return (
              <li key={e.id} className={cn('flex gap-3 rounded-lg p-2 transition-colors hover:bg-surface-2', past && 'opacity-50')}>
                <div className="tabular w-14 shrink-0 pt-0.5 text-[12px] font-semibold text-fg">{time(e.start)}</div>
                <div className="relative min-w-0 flex-1 border-l-2 pl-3" style={{ borderColor: e.type === 'demo' ? 'var(--accent)' : e.type === 'internal' ? 'var(--c5)' : 'var(--primary)' }}>
                  <p className="truncate text-[13px] font-medium text-fg">{e.title}</p>
                  <p className="mt-0.5 flex items-center gap-1 text-[11.5px] text-faint">
                    {e.location.includes('Zoom') || e.location.includes('Meet') ? <Video className="size-3" /> : <MapPin className="size-3" />}
                    {e.location} · {time(e.start)}–{time(e.end)}
                  </p>
                </div>
                <AvatarStack size="xs" people={e.attendees.map((id) => memberById(id)).filter(Boolean).map((m) => ({ name: m!.name, hue: m!.hue }))} />
              </li>
            )
          })}
      </ul>
    </Card>
  )
}
