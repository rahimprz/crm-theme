import { useId, useLayoutEffect, useRef, type ReactNode } from 'react'
import { gsap, ScrollTrigger, reducedMotion } from '@/lib/gsap'
import { cn } from '@/lib/cn'

/** Draws in once visible, then tweens on change. */
function useDrawIn(el: React.RefObject<Element | null>, apply: (progress: number, animate: boolean) => void, deps: unknown[]) {
  const seen = useRef(false)
  useLayoutEffect(() => {
    if (!el.current) return
    if (reducedMotion()) {
      apply(1, false)
      return
    }
    if (seen.current) {
      apply(1, true)
      return
    }
    apply(0, false)
    const st = ScrollTrigger.create({
      trigger: el.current,
      start: 'top 96%',
      once: true,
      onEnter: () => {
        seen.current = true
        apply(1, true)
      },
    })
    return () => st.kill()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)
}

export function Progress({
  value,
  max = 100,
  color = 'var(--primary)',
  gradient,
  className,
  height = 6,
}: {
  value: number
  max?: number
  color?: string
  gradient?: boolean
  className?: string
  height?: number
}) {
  const bar = useRef<HTMLSpanElement>(null)
  const pct = Math.max(0, Math.min(100, (value / max) * 100))
  useDrawIn(
    bar,
    (p, animate) => {
      gsap.to(bar.current, { width: `${pct * p}%`, duration: animate ? 1.1 : 0, ease: 'volt.out' })
    },
    [pct],
  )
  return (
    <span
      className={cn('relative block w-full overflow-hidden rounded-full', className)}
      style={{ height, background: `color-mix(in oklab, ${color} 14%, var(--surface-3))` }}
    >
      <span
        ref={bar}
        className="absolute inset-y-0 left-0 rounded-full"
        style={{
          width: 0,
          background: gradient ? `linear-gradient(90deg, ${color}, var(--accent))` : color,
          boxShadow: `0 0 10px -2px ${color}`,
        }}
      />
    </span>
  )
}

/** Circular progress with an optional primary→accent gradient. */
export function Ring({
  value,
  size = 44,
  stroke = 4,
  color,
  children,
  className,
}: {
  value: number
  size?: number
  stroke?: number
  color?: string
  children?: ReactNode
  className?: string
}) {
  const id = useId().replace(/:/g, '')
  const arc = useRef<SVGCircleElement>(null)
  const r = (size - stroke) / 2
  const c = 2 * Math.PI * r
  const pct = Math.max(0, Math.min(100, value))
  useDrawIn(
    arc,
    (p, animate) => {
      gsap.to(arc.current, { strokeDashoffset: c * (1 - (pct / 100) * p), duration: animate ? 1.4 : 0, ease: 'volt.out' })
    },
    [pct, c],
  )
  return (
    <span className={cn('relative inline-flex shrink-0 items-center justify-center', className)} style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90" aria-hidden>
        <defs>
          <linearGradient id={`rg-${id}`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" style={{ stopColor: color ?? 'var(--primary)' }} />
            <stop offset="100%" style={{ stopColor: color ?? 'var(--accent)' }} />
          </linearGradient>
        </defs>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" strokeWidth={stroke} style={{ stroke: 'var(--surface-3)' }} />
        <circle
          ref={arc}
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c}
          stroke={`url(#rg-${id})`}
        />
      </svg>
      {children && <span className="absolute inset-0 flex items-center justify-center">{children}</span>}
    </span>
  )
}
