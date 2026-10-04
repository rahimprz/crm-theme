import { useLayoutEffect, useRef } from 'react'
import { gsap, reducedMotion } from '@/lib/gsap'
import { cn } from '@/lib/cn'

/** Number pill that bounces whenever its value changes. */
export function CountBadge({ value, tone = 'count', active, className }: { value: number; tone?: 'count' | 'alert'; active?: boolean; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null)
  const prev = useRef(value)
  useLayoutEffect(() => {
    if (prev.current !== value && ref.current && !reducedMotion()) {
      gsap.fromTo(ref.current, { scale: 1.45 }, { scale: 1, duration: 0.6, ease: 'elastic.out(1, 0.4)' })
    }
    prev.current = value
  }, [value])
  if (!value) return null
  return (
    <span
      ref={ref}
      className={cn(
        'tabular inline-flex h-[18px] min-w-[18px] items-center justify-center rounded-full px-1.5 text-[10.5px] leading-none font-semibold',
        tone === 'alert'
          ? 'bg-accent text-accent-fg shadow-[0_0_10px_-2px_var(--accent)]'
          : active
            ? 'bg-primary text-primary-fg'
            : 'bg-surface-3 text-muted ring-1 ring-line-strong',
        className,
      )}
    >
      {value > 99 ? '99+' : value}
    </span>
  )
}
