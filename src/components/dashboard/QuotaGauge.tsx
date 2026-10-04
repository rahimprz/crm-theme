import { useId, useLayoutEffect, useRef } from 'react'
import { gsap, ScrollTrigger, reducedMotion } from '@/lib/gsap'
import { AnimatedNumber } from '@/components/ui/AnimatedNumber'

/** Half-circle gauge with tick marks; the arc sweeps up to the current value. */
export function QuotaGauge({ value, label }: { value: number; label: string }) {
  const id = useId().replace(/:/g, '')
  const arc = useRef<SVGPathElement>(null)
  const knob = useRef<SVGGElement>(null)
  const W = 240
  const R = 96
  const cx = W / 2
  const cy = 112
  const pct = Math.max(0, Math.min(100, value))
  const len = Math.PI * R
  const angle = Math.PI * (1 - pct / 100)
  const kx = cx + R * Math.cos(angle)
  const ky = cy - R * Math.sin(angle)

  useLayoutEffect(() => {
    if (!arc.current) return
    if (reducedMotion()) {
      gsap.set(arc.current, { strokeDashoffset: len * (1 - pct / 100) })
      return
    }
    gsap.set(arc.current, { strokeDashoffset: len })
    gsap.set(knob.current, { opacity: 0, scale: 0, transformOrigin: `${kx}px ${ky}px` })
    const st = ScrollTrigger.create({
      trigger: arc.current,
      start: 'top 95%',
      once: true,
      onEnter: () => {
        gsap.to(arc.current, { strokeDashoffset: len * (1 - pct / 100), duration: 1.8, ease: 'volt', delay: 0.3 })
        gsap.to(knob.current, { opacity: 1, scale: 1, duration: 0.5, delay: 1.8, ease: 'back.out(3)' })
      },
    })
    return () => st.kill()
  }, [pct, len, kx, ky])

  const ticks = Array.from({ length: 31 }, (_, i) => {
    const a = Math.PI * (1 - i / 30)
    const major = i % 5 === 0
    const r1 = R + 14
    const r2 = R + (major ? 22 : 18)
    return { x1: cx + r1 * Math.cos(a), y1: cy - r1 * Math.sin(a), x2: cx + r2 * Math.cos(a), y2: cy - r2 * Math.sin(a), major, lit: i / 30 <= pct / 100 }
  })

  return (
    <div className="relative w-[240px] max-w-full">
      <svg viewBox={`0 0 ${W} 130`} className="block w-full overflow-visible" role="img" aria-label={`${pct}% of quota`}>
        <defs>
          <linearGradient id={`gauge-${id}`} x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" style={{ stopColor: 'var(--primary)' }} />
            <stop offset="100%" style={{ stopColor: 'var(--accent)' }} />
          </linearGradient>
        </defs>
        {ticks.map((t, i) => (
          <line key={i} x1={t.x1} y1={t.y1} x2={t.x2} y2={t.y2} strokeWidth={t.major ? 2 : 1} strokeLinecap="round" style={{ stroke: t.lit ? 'var(--muted)' : 'var(--line-strong)' }} />
        ))}
        <path d={`M${cx - R},${cy} A${R},${R} 0 0 1 ${cx + R},${cy}`} fill="none" strokeWidth={14} strokeLinecap="round" style={{ stroke: 'var(--surface-3)' }} />
        <path
          ref={arc}
          d={`M${cx - R},${cy} A${R},${R} 0 0 1 ${cx + R},${cy}`}
          fill="none"
          strokeWidth={14}
          strokeLinecap="round"
          strokeDasharray={len}
          strokeDashoffset={len * (1 - pct / 100)}
          stroke={`url(#gauge-${id})`}
          style={{ filter: 'drop-shadow(0 0 10px color-mix(in oklab, var(--primary) 50%, transparent))' }}
        />
        <g ref={knob}>
          <circle cx={kx} cy={ky} r={10} style={{ fill: 'var(--accent)', opacity: 0.25 }} />
          <circle cx={kx} cy={ky} r={6} strokeWidth={3} style={{ fill: 'var(--accent)', stroke: 'var(--surface)' }} />
        </g>
      </svg>
      <div className="absolute inset-x-0 bottom-0 flex flex-col items-center">
        <AnimatedNumber value={pct} format="percent" className="text-[34px] leading-none font-semibold tracking-[-0.03em] text-fg" />
        <span className="mt-1 text-[12px] text-muted">{label}</span>
      </div>
    </div>
  )
}
