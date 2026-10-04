import { useLayoutEffect, useRef, type ReactNode } from 'react'
import { gsap, reducedMotion } from '@/lib/gsap'
import { cn } from '@/lib/cn'

export interface SegmentOption<T extends string> {
  value: T
  label: ReactNode
  icon?: ReactNode
}

/** Pill switcher whose highlight glides between options. */
export function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
  size = 'md',
  className,
  ariaLabel,
}: {
  options: SegmentOption<T>[]
  value: T
  onChange: (v: T) => void
  size?: 'sm' | 'md'
  className?: string
  ariaLabel?: string
}) {
  const wrap = useRef<HTMLDivElement>(null)
  const pill = useRef<HTMLSpanElement>(null)
  const first = useRef(true)

  useLayoutEffect(() => {
    const move = (instant: boolean) => {
      const active = wrap.current?.querySelector<HTMLButtonElement>(`[data-value="${value}"]`)
      if (!active || !pill.current) return
      gsap.to(pill.current, {
        x: active.offsetLeft,
        width: active.offsetWidth,
        duration: instant ? 0 : 0.55,
        ease: 'volt.out',
      })
    }
    move(first.current || reducedMotion())
    first.current = false
    const ro = new ResizeObserver(() => move(true))
    if (wrap.current) ro.observe(wrap.current)
    return () => ro.disconnect()
  }, [value, options.length])

  return (
    <div
      ref={wrap}
      role="tablist"
      aria-label={ariaLabel}
      className={cn('relative inline-flex items-center rounded-[calc(var(--radius)*0.85)] border border-line bg-surface-2 p-[3px]', className)}
    >
      <span
        ref={pill}
        aria-hidden
        className="absolute top-[3px] bottom-[3px] left-0 rounded-[calc(var(--radius)*0.6)] border border-line-strong bg-surface-3 shadow-[0_1px_2px_rgb(0_0_0/0.25),inset_0_1px_0_rgb(255_255_255/0.05)]"
      />
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          role="tab"
          data-value={o.value}
          aria-selected={o.value === value}
          onClick={() => onChange(o.value)}
          className={cn(
            'relative z-[1] inline-flex items-center justify-center gap-1.5 font-medium whitespace-nowrap transition-colors duration-200 [&_svg]:size-3.5',
            size === 'sm' ? 'h-7 px-2.5 text-[12px]' : 'h-8 px-3 text-[13px]',
            o.value === value ? 'text-fg' : 'text-muted hover:text-fg',
          )}
        >
          {o.icon}
          {o.label}
        </button>
      ))}
    </div>
  )
}
