import { useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { Mail, Phone, CalendarCheck2, StickyNote, Handshake, CircleCheckBig, Magnet } from 'lucide-react'
import type { Activity, ActivityType, RecordRef } from '@/data/types'
import { memberById } from '@/store/crm'
import { useUI } from '@/store/ui'
import { gsap, useGSAP, reducedMotion } from '@/lib/gsap'
import { relativeTime } from '@/lib/format'
import { cn } from '@/lib/cn'

const typeMeta: Record<ActivityType, { icon: typeof Mail; color: string }> = {
  email: { icon: Mail, color: 'var(--primary)' },
  call: { icon: Phone, color: 'var(--c3)' },
  meeting: { icon: CalendarCheck2, color: 'var(--c5)' },
  note: { icon: StickyNote, color: 'var(--accent)' },
  deal: { icon: Handshake, color: 'var(--success)' },
  task: { icon: CircleCheckBig, color: 'var(--c4)' },
  lead: { icon: Magnet, color: 'var(--primary)' },
}

export function useOpenRecord() {
  const navigate = useNavigate()
  const openDrawer = useUI((s) => s.openDrawer)
  return (ref: RecordRef) => {
    if (ref.type === 'deal') openDrawer({ type: 'deal', id: ref.id })
    else if (ref.type === 'lead') openDrawer({ type: 'lead', id: ref.id })
    else if (ref.type === 'company') navigate(`/companies/${ref.id}`)
    else navigate(`/contacts/${ref.id}`)
  }
}

/** Vertical feed of activity with a line that draws down as items appear. */
export function ActivityTimeline({ items, compact }: { items: Activity[]; compact?: boolean }) {
  const ref = useRef<HTMLOListElement>(null)
  const openRecord = useOpenRecord()

  useGSAP(
    () => {
      if (reducedMotion()) return
      gsap.from('[data-tl-item]', { opacity: 0, x: -14, duration: 0.5, stagger: 0.06, ease: 'volt.out', scrollTrigger: { trigger: ref.current, start: 'top 92%', once: true } })
      gsap.from('[data-tl-line]', { scaleY: 0, transformOrigin: 'top', duration: 1.2, ease: 'volt', scrollTrigger: { trigger: ref.current, start: 'top 92%', once: true } })
    },
    { scope: ref, dependencies: [items.length] },
  )

  return (
    <ol ref={ref} className="relative">
      <span data-tl-line className="absolute top-2 bottom-2 left-[15px] w-px bg-gradient-to-b from-line-strong via-line to-transparent" />
      {items.map((a) => {
        const m = typeMeta[a.type]
        const Icon = m.icon
        const actor = memberById(a.actorId)
        return (
          <li key={a.id} data-tl-item className={cn('relative flex gap-3', compact ? 'pb-4' : 'pb-5', 'last:pb-0')}>
            <span
              className="relative z-[1] flex size-8 shrink-0 items-center justify-center rounded-full border bg-surface"
              style={{ borderColor: `color-mix(in oklab, ${m.color} 35%, transparent)`, color: m.color }}
            >
              <Icon className="size-3.5" />
            </span>
            <div className="min-w-0 flex-1 pt-1">
              <p className="text-[13px] leading-snug text-muted">
                <span className="font-medium text-fg">{actor?.name.split(' ')[0] ?? 'Someone'}</span> {a.text}{' '}
                {a.target && (
                  <button type="button" onClick={() => openRecord(a.target!)} className="font-medium text-fg underline decoration-line-strong underline-offset-2 hover:text-primary hover:decoration-primary">
                    {a.target.label}
                  </button>
                )}
              </p>
              {a.detail && (
                <p className={cn('mt-1 text-[12.5px] text-faint', !compact && 'rounded-lg border border-line bg-surface-2 px-2.5 py-1.5 text-muted')}>{a.detail}</p>
              )}
              <p className="mt-1 text-[11.5px] text-faint">{relativeTime(a.at)}</p>
            </div>
          </li>
        )
      })}
    </ol>
  )
}
