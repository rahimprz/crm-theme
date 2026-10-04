import { useLayoutEffect, useRef } from 'react'
import { gsap, reducedMotion } from '@/lib/gsap'
import { cn } from '@/lib/cn'

type Tone = 'primary' | 'accent' | 'success'

const dims = {
  sm: { w: 34, h: 20, k: 14 },
  md: { w: 44, h: 24, k: 18 },
  lg: { w: 56, h: 30, k: 24 },
}

const onColor: Record<Tone, string> = {
  primary: 'var(--primary)',
  accent: 'var(--accent)',
  success: 'var(--success)',
}

/**
 * Animated toggle. The knob stretches as it leaves, springs into place and
 * sends out a soft ring when switched on.
 */
export function Switch({
  checked,
  onChange,
  size = 'md',
  tone = 'primary',
  label,
  ariaLabel,
  description,
  id,
  disabled,
  className,
}: {
  checked: boolean
  onChange: (next: boolean) => void
  size?: keyof typeof dims
  tone?: Tone
  /** Visible label shown beside the switch. */
  label?: string
  /** Screen-reader-only label, for switches without visible text. */
  ariaLabel?: string
  description?: string
  id?: string
  disabled?: boolean
  className?: string
}) {
  const knob = useRef<HTMLSpanElement>(null)
  const ring = useRef<HTMLSpanElement>(null)
  const first = useRef(true)
  const d = dims[size]
  const pad = (d.h - d.k) / 2
  const travel = d.w - d.k - pad * 2

  useLayoutEffect(() => {
    const el = knob.current
    if (!el) return
    const x = checked ? travel : 0
    if (first.current || reducedMotion()) {
      gsap.set(el, { x })
      first.current = false
      return
    }
    gsap.killTweensOf(el)
    gsap
      .timeline()
      .to(el, { scaleX: 1.45, duration: 0.14, ease: 'power2.out', transformOrigin: checked ? '0% 50%' : '100% 50%' })
      .to(el, { x, duration: 0.6, ease: 'elastic.out(1, 0.6)' }, 0.06)
      .to(el, { scaleX: 1, duration: 0.5, ease: 'elastic.out(1, 0.45)' }, 0.16)
    if (checked && ring.current) {
      gsap.fromTo(
        ring.current,
        { x, scale: 0.6, opacity: 0.7 },
        { scale: 2.4, opacity: 0, duration: 0.7, ease: 'power2.out', delay: 0.12 },
      )
    }
  }, [checked, travel])

  const control = (
    <button
      id={id}
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={ariaLabel ?? label}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={cn(
        'relative inline-flex shrink-0 cursor-pointer rounded-full border transition-[background-color,border-color,box-shadow] duration-300 disabled:cursor-not-allowed disabled:opacity-50',
        checked ? 'border-transparent' : 'border-line-strong bg-surface-3 hover:border-faint',
      )}
      style={{
        width: d.w,
        height: d.h,
        background: checked
          ? `linear-gradient(135deg, ${onColor[tone]}, color-mix(in oklab, ${onColor[tone]} 70%, var(--accent)))`
          : undefined,
        boxShadow: checked ? `0 0 18px -4px ${onColor[tone]}, inset 0 1px 0 rgb(255 255 255 / 0.2)` : undefined,
      }}
    >
      <span
        ref={ring}
        aria-hidden
        className="pointer-events-none absolute rounded-full opacity-0"
        style={{ width: d.k, height: d.k, top: pad - 1, left: pad - 1, boxShadow: `0 0 0 2px ${onColor[tone]}` }}
      />
      <span
        ref={knob}
        aria-hidden
        className="absolute flex items-center justify-center rounded-full bg-white shadow-[0_2px_6px_rgb(0_0_0/0.35)]"
        style={{ width: d.k, height: d.k, top: pad - 1, left: pad - 1 }}
      >
        <svg
          viewBox="0 0 12 12"
          className="transition-opacity duration-300"
          style={{ width: d.k * 0.5, opacity: checked ? 1 : 0 }}
        >
          <path d="M2.5 6.2 5 8.5 9.5 3.8" fill="none" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ stroke: onColor[tone] }} />
        </svg>
      </span>
    </button>
  )

  if (!label && !description) return control
  return (
    <div className={cn('flex items-center justify-between gap-4', className)}>
      <label htmlFor={id} className="min-w-0 cursor-pointer">
        {label && <div className="text-[13.5px] font-medium text-fg">{label}</div>}
        {description && <div className="text-[12.5px] text-muted">{description}</div>}
      </label>
      {control}
    </div>
  )
}
