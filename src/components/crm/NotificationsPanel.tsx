import { useState } from 'react'
import { AtSign, Handshake, ListChecks, Cpu, Magnet, CheckCheck, BellOff } from 'lucide-react'
import { useCrm, memberById } from '@/store/crm'
import type { NotificationKind } from '@/data/types'
import { Avatar } from '@/components/ui/Avatar'
import { SegmentedControl } from '@/components/ui/SegmentedControl'
import { relativeTime } from '@/lib/format'
import { cn } from '@/lib/cn'

const kindMeta: Record<NotificationKind, { icon: typeof AtSign; color: string }> = {
  mention: { icon: AtSign, color: 'var(--primary)' },
  deal: { icon: Handshake, color: 'var(--success)' },
  task: { icon: ListChecks, color: 'var(--warning)' },
  system: { icon: Cpu, color: 'var(--c5)' },
  lead: { icon: Magnet, color: 'var(--accent)' },
}

export function NotificationsPanel() {
  const notifications = useCrm((s) => s.notifications)
  const markRead = useCrm((s) => s.markNotificationRead)
  const markAll = useCrm((s) => s.markAllNotificationsRead)
  const [filter, setFilter] = useState<'all' | 'unread'>('all')
  const unread = notifications.filter((n) => !n.read).length
  const shown = filter === 'all' ? notifications : notifications.filter((n) => !n.read)

  return (
    <div className="flex max-h-[min(560px,80vh)] flex-col">
      <div className="flex items-center justify-between gap-2 border-b border-line px-4 py-3">
        <div>
          <h3 className="text-[14px] font-semibold text-fg">Notifications</h3>
          <p className="text-[12px] text-muted">{unread ? `${unread} unread` : 'You’re all caught up'}</p>
        </div>
        <button
          type="button"
          onClick={markAll}
          disabled={!unread}
          className="inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-[12px] font-medium text-primary hover:bg-primary/10 disabled:text-faint disabled:hover:bg-transparent"
        >
          <CheckCheck className="size-3.5" />
          Mark all read
        </button>
      </div>
      <div className="px-4 pt-3">
        <SegmentedControl
          size="sm"
          value={filter}
          onChange={setFilter}
          options={[
            { value: 'all', label: 'All' },
            { value: 'unread', label: `Unread${unread ? ` · ${unread}` : ''}` },
          ]}
        />
      </div>
      <ul className="flex-1 overflow-y-auto p-2">
        {shown.length === 0 && (
          <li className="flex flex-col items-center gap-2 py-10 text-center text-[13px] text-muted">
            <BellOff className="size-5 text-faint" />
            Nothing new. We’ll let you know when something needs you.
          </li>
        )}
        {shown.map((n) => {
          const m = kindMeta[n.kind]
          const Icon = m.icon
          const actor = memberById(n.actorId)
          return (
            <li key={n.id}>
              <button
                type="button"
                onClick={() => markRead(n.id)}
                className={cn('relative flex w-full gap-3 rounded-lg p-2.5 text-left transition-colors hover:bg-surface-3', !n.read && 'bg-primary/[0.04]')}
              >
                <span className="relative shrink-0">
                  {actor ? (
                    <Avatar name={actor.name} hue={actor.hue} size="md" />
                  ) : (
                    <span className="flex size-9 items-center justify-center rounded-full bg-surface-3 text-muted">
                      <Icon className="size-4" />
                    </span>
                  )}
                  <span
                    className="absolute -right-1 -bottom-1 flex size-[18px] items-center justify-center rounded-full ring-2 ring-[var(--surface-2)]"
                    style={{ background: m.color, color: 'var(--bg)' }}
                  >
                    <Icon className="size-2.5" strokeWidth={2.5} />
                  </span>
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-[13px] font-medium text-fg">{n.title}</span>
                  <span className="mt-0.5 line-clamp-2 block text-[12.5px] text-muted">{n.body}</span>
                  <span className="mt-1 block text-[11.5px] text-faint">{relativeTime(n.at)}</span>
                </span>
                {!n.read && <span className="mt-1.5 size-2 shrink-0 rounded-full bg-primary shadow-[0_0_8px_var(--primary)]" />}
              </button>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
