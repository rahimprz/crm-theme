import { useLayoutEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { CheckCircle2, Info, TriangleAlert, OctagonAlert, PartyPopper, X } from 'lucide-react'
import { gsap } from '@/lib/gsap'
import { useToasts, type Toast } from '@/store/toast'
import { cn } from '@/lib/cn'

const toneStyle = {
  success: { icon: CheckCircle2, color: 'var(--success)' },
  info: { icon: Info, color: 'var(--primary)' },
  warning: { icon: TriangleAlert, color: 'var(--warning)' },
  danger: { icon: OctagonAlert, color: 'var(--danger)' },
  celebrate: { icon: PartyPopper, color: 'var(--accent)' },
}

function ToastItem({ t }: { t: Toast }) {
  const ref = useRef<HTMLDivElement>(null)
  const dismiss = useToasts((s) => s.dismiss)
  const [leaving, setLeaving] = useState(false)
  const { icon: Icon, color } = toneStyle[t.tone]

  useLayoutEffect(() => {
    gsap.fromTo(
      ref.current,
      { opacity: 0, x: 60, scale: 0.9, filter: 'blur(6px)' },
      { opacity: 1, x: 0, scale: 1, filter: 'blur(0px)', duration: 0.6, ease: 'volt.out', clearProps: 'filter' },
    )
  }, [])

  const close = () => {
    if (leaving) return
    setLeaving(true)
    gsap.to(ref.current, {
      opacity: 0,
      x: 40,
      height: 0,
      marginTop: 0,
      paddingTop: 0,
      paddingBottom: 0,
      duration: 0.35,
      ease: 'volt',
      onComplete: () => dismiss(t.id),
    })
  }

  return (
    <div
      ref={ref}
      role="status"
      className={cn(
        'group popover pointer-events-auto relative mt-2 flex w-[min(380px,calc(100vw-32px))] items-start gap-3 overflow-hidden p-3.5 pr-10',
        t.tone === 'celebrate' && 'beam',
      )}
    >
      <span
        className="flex size-8 shrink-0 items-center justify-center rounded-lg"
        style={{ background: `color-mix(in oklab, ${color} 16%, transparent)`, color }}
      >
        <Icon className="size-4" />
      </span>
      <div className="min-w-0 flex-1 pt-0.5">
        <p className="text-[13.5px] font-semibold text-fg">{t.title}</p>
        {t.description && <p className="mt-0.5 text-[12.5px] text-muted">{t.description}</p>}
      </div>
      <button
        type="button"
        onClick={close}
        aria-label="Dismiss"
        className="absolute top-3 right-3 flex size-6 items-center justify-center rounded-md text-faint hover:bg-surface-3 hover:text-fg"
      >
        <X className="size-3.5" />
      </button>
      <span
        className="toast-timer absolute bottom-0 left-0 h-[2px] group-hover:[animation-play-state:paused]"
        style={{ background: color, ['--toast-dur' as string]: `${t.duration}ms` }}
        onAnimationEnd={close}
      />
    </div>
  )
}

/** Toast stack, bottom-right on desktop and top on phones. Use `toast.success(...)` from anywhere. */
export function Toaster() {
  const toasts = useToasts((s) => s.toasts)
  return createPortal(
    <div className="pointer-events-none fixed top-[max(12px,env(safe-area-inset-top))] right-4 left-4 z-[110] flex flex-col items-center sm:top-auto sm:bottom-6 sm:left-auto sm:items-end">
      {toasts.map((t) => (
        <ToastItem key={t.id} t={t} />
      ))}
    </div>,
    document.body,
  )
}
