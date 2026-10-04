import { useId, useLayoutEffect, useRef } from 'react'
import { gsap, ScrollTrigger, reducedMotion } from '@/lib/gsap'
import { monotonePath } from '@/lib/chart'

/** Tiny trend line with a soft fill and an emphasized endpoint. */
export function Sparkline({
  values,
  color = 'var(--primary)',
  width = 120,
  height = 36,
}: {
  values: number[]
  color?: string
  width?: number
  height?: number
}) {
  const id = useId().replace(/:/g, '')
  const line = useRef<SVGPathElement>(null)
  const area = useRef<SVGPathElement>(null)
  const dot = useRef<SVGGElement>(null)
  const min = Math.min(...values)
  const max = Math.max(...values)
  const pad = 4
  const pts = values.map(
    (v, i) =>
      [pad + (i / (values.length - 1)) * (width - pad * 2), pad + (1 - (v - min) / (max - min || 1)) * (height - pad * 2)] as [number, number],
  )
  const d = monotonePath(pts)
  const last = pts[pts.length - 1]

  useLayoutEffect(() => {
    const l = line.current
    if (!l || reducedMotion()) return
    const len = l.getTotalLength()
    gsap.set(l, { strokeDasharray: len, strokeDashoffset: len })
    gsap.set([area.current, dot.current], { opacity: 0 })
    const st = ScrollTrigger.create({
      trigger: l,
      start: 'top 98%',
      once: true,
      onEnter: () => {
        gsap.to(l, { strokeDashoffset: 0, duration: 1.4, ease: 'volt' })
        gsap.to(area.current, { opacity: 1, duration: 1, delay: 0.5 })
        gsap.fromTo(dot.current, { opacity: 0, scale: 0 }, { opacity: 1, scale: 1, duration: 0.4, delay: 1.2, ease: 'back.out(3)', transformOrigin: `${last[0]}px ${last[1]}px` })
      },
    })
    return () => st.kill()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [d])

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} className="block h-auto max-w-full overflow-visible" aria-hidden>
      <defs>
        <linearGradient id={`sg-${id}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" style={{ stopColor: color, stopOpacity: 0.3 }} />
          <stop offset="100%" style={{ stopColor: color, stopOpacity: 0 }} />
        </linearGradient>
      </defs>
      <path ref={area} d={`${d}L${last[0]},${height}L${pts[0][0]},${height}Z`} style={{ fill: `url(#sg-${id})` }} />
      <path ref={line} d={d} fill="none" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" style={{ stroke: color }} />
      <g ref={dot}>
        <circle cx={last[0]} cy={last[1]} r={3.5} strokeWidth={2} style={{ fill: color, stroke: 'var(--surface)' }} />
      </g>
    </svg>
  )
}
