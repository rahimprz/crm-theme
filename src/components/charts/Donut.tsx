import { useLayoutEffect, useRef, useState, type ReactNode } from 'react'
import { gsap, ScrollTrigger, reducedMotion } from '@/lib/gsap'

export interface DonutDatum {
  label: string
  value: number
  color: string
}

/**
 * Donut chart drawn with stroke segments separated by a small gap. Segments
 * sweep in one after another; hovering a segment thickens it and shows its
 * share in the center.
 */
export function Donut({
  data,
  size = 200,
  thickness = 18,
  center,
  format = (n) => String(n),
}: {
  data: DonutDatum[]
  size?: number
  thickness?: number
  center?: { label: string; value: ReactNode }
  format?: (n: number) => string
}) {
  const [hover, setHover] = useState<number | null>(null)
  const ref = useRef<SVGSVGElement>(null)
  const r = (size - thickness - 8) / 2
  const C = 2 * Math.PI * r
  const total = data.reduce((s, d) => s + d.value, 0) || 1
  const gap = Math.min(6, C * 0.012)

  let offset = 0
  const segs = data.map((d) => {
    const len = (d.value / total) * C
    const seg = { ...d, len: Math.max(0, len - gap), offset }
    offset += len
    return seg
  })

  useLayoutEffect(() => {
    const svg = ref.current
    if (!svg || reducedMotion()) return
    const arcs = svg.querySelectorAll<SVGCircleElement>('[data-seg]')
    arcs.forEach((a) => gsap.set(a, { attr: { 'stroke-dasharray': `0 ${C}` } }))
    const st = ScrollTrigger.create({
      trigger: svg,
      start: 'top 92%',
      once: true,
      onEnter: () => {
        arcs.forEach((a, i) =>
          gsap.to(a, { attr: { 'stroke-dasharray': `${segs[i].len} ${C}` }, duration: 0.9, delay: 0.15 + i * 0.12, ease: 'volt.out' }),
        )
        gsap.fromTo(svg, { rotate: -60 }, { rotate: 0, duration: 1.6, ease: 'volt.out' })
      },
    })
    return () => st.kill()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data.length])

  const active = hover !== null ? data[hover] : null

  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg ref={ref} width={size} height={size} viewBox={`0 0 ${size} ${size}`} role="img" aria-label="Donut chart">
        <g transform={`rotate(-90 ${size / 2} ${size / 2})`}>
          <circle cx={size / 2} cy={size / 2} r={r} fill="none" strokeWidth={thickness} style={{ stroke: 'var(--surface-2)' }} />
          {segs.map((s, i) => (
            <circle
              key={s.label}
              data-seg
              cx={size / 2}
              cy={size / 2}
              r={r}
              fill="none"
              strokeWidth={hover === i ? thickness + 6 : thickness}
              strokeDasharray={`${s.len} ${C}`}
              strokeDashoffset={-s.offset}
              style={{
                stroke: s.color,
                transition: 'stroke-width .25s cubic-bezier(.16,1,.3,1), opacity .2s',
                opacity: hover === null || hover === i ? 1 : 0.35,
                cursor: 'pointer',
              }}
              onPointerEnter={() => setHover(i)}
              onPointerLeave={() => setHover(null)}
            />
          ))}
        </g>
      </svg>
      <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center">
        <span className="text-[11.5px] font-medium text-faint">{active ? active.label : center?.label}</span>
        <span className="tabular text-[22px] font-semibold tracking-[-0.02em] text-fg">
          {active ? format(active.value) : center?.value}
        </span>
        {active && <span className="tabular text-[11.5px] text-muted">{((active.value / total) * 100).toFixed(1)}%</span>}
      </div>
    </div>
  )
}
