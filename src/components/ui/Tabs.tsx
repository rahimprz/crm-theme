import { useLayoutEffect, useRef, type ReactNode } from 'react'
import { gsap, reducedMotion } from '@/lib/gsap'
import { cn } from '@/lib/cn'

/** Underline tabs with a gliding electric indicator. */
export function Tabs<T extends string>({
  tabs,
  value,
  onChange,
  className,
}: {
  tabs: { value: T; label: ReactNode; count?: number; icon?: ReactNode }[]
  value: T
  onChange: (v: T) => void
  className?: string
}) {
  const wrap = useRef<HTMLDivElement>(null)
  const bar = useRef<HTMLSpanElement>(null)
  const first = useRef(true)

  useLayoutEffect(() => {
    const move = (instant: boolean) => {
      const el = wrap.current?.querySelector<HTMLElement>(`[data-value="${value}"]`)
      if (!el || !bar.current) return
      gsap.to(bar.current, { x: el.offsetLeft, width: el.offsetWidth, duration: instant ? 0 : 0.5, ease: 'volt.out' })
    }
    move(first.current || reducedMotion())
    first.current = false
    const ro = new ResizeObserver(() => move(true))
    if (wrap.current) ro.observe(wrap.current)
    return () => ro.disconnect()
  }, [value, tabs.length])

  return (
    <div ref={wrap} role="tablist" className={cn('no-scrollbar relative flex items-center gap-1 overflow-x-auto border-b border-line', className)}>
      {tabs.map((t) => (
        <button
          key={t.value}
          role="tab"
          type="button"
          data-value={t.value}
          aria-selected={t.value === value}
          onClick={() => onChange(t.value)}
          className={cn(
            'relative inline-flex h-10 shrink-0 items-center gap-2 px-3 text-[13px] font-medium transition-colors [&_svg]:size-4',
            t.value === value ? 'text-fg' : 'text-muted hover:text-fg',
          )}
        >
          {t.icon}
          {t.label}
          {t.count !== undefined && (
            <span
              className={cn(
                'tabular rounded-full px-1.5 py-px text-[11px]',
                t.value === value ? 'bg-primary/15 text-primary' : 'bg-surface-3 text-faint',
              )}
            >
              {t.count}
            </span>
          )}
        </button>
      ))}
      <span
        ref={bar}
        aria-hidden
        className="absolute bottom-[-1px] left-0 h-[2px] rounded-full"
        style={{ background: 'linear-gradient(90deg, var(--primary), var(--accent))', boxShadow: '0 0 12px var(--primary)' }}
      />
    </div>
  )
}
