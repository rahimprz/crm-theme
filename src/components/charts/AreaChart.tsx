import { useId, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { gsap, ScrollTrigger, reducedMotion } from '@/lib/gsap'
import { monotonePath, niceTicks } from '@/lib/chart'
import { useSize } from '@/hooks/useSize'

export interface AreaSeries {
  key: string
  label: string
  color: string
  values: number[]
  /** Draw as a thin reference line without fill (e.g. a target). */
  reference?: boolean
}

const PAD = { top: 14, right: 14, bottom: 28, left: 52 }

/**
 * Smooth area/line chart with a crosshair tooltip. Lines draw themselves in
 * from left to right the first time the chart scrolls into view, and again
 * whenever the data changes.
 */
export function AreaChart({
  series,
  labels,
  height = 280,
  format = (n) => String(n),
}: {
  series: AreaSeries[]
  labels: string[]
  height?: number
  format?: (n: number) => string
}) {
  const uid = useId().replace(/:/g, '')
  const [wrap, { width }] = useSize<HTMLDivElement>()
  const clip = useRef<SVGRectElement>(null)
  const dots = useRef<SVGGElement>(null)
  const seen = useRef(false)
  const [hover, setHover] = useState<number | null>(null)

  const n = labels.length
  const innerW = Math.max(0, width - PAD.left - PAD.right)
  const innerH = height - PAD.top - PAD.bottom
  const { max, ticks } = useMemo(() => niceTicks(Math.max(...series.flatMap((s) => s.values)) * 1.05, 4), [series])
  const x = (i: number) => PAD.left + (n <= 1 ? innerW / 2 : (i / (n - 1)) * innerW)
  const y = (v: number) => PAD.top + innerH - (v / max) * innerH

  const paths = useMemo(
    () =>
      series.map((s) => {
        const pts = s.values.map((v, i) => [x(i), y(v)] as [number, number])
        const line = monotonePath(pts)
        const area = `${line}L${x(n - 1)},${PAD.top + innerH}L${x(0)},${PAD.top + innerH}Z`
        return { ...s, line, area, last: pts[pts.length - 1] }
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [series, width, max, height],
  )

  const dataKey = series.map((s) => s.values.join(',')).join('|')

  // Draw-in animation: grow a clip rect across the plot.
  useLayoutEffect(() => {
    const rect = clip.current
    if (!rect || !innerW) return
    if (reducedMotion()) {
      gsap.set(rect, { attr: { width: innerW + 20 } })
      return
    }
    const play = () => {
      gsap.fromTo(rect, { attr: { width: 0 } }, { attr: { width: innerW + 20 }, duration: seen.current ? 1 : 1.8, ease: 'volt' })
      gsap.fromTo(dots.current, { scale: 0, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.5, delay: seen.current ? 0.8 : 1.5, ease: 'back.out(3)', transformOrigin: 'center' })
    }
    if (seen.current) {
      play()
      return
    }
    gsap.set(rect, { attr: { width: 0 } })
    const st = ScrollTrigger.create({
      trigger: wrap.current,
      start: 'top 90%',
      once: true,
      onEnter: () => {
        play()
        seen.current = true
      },
    })
    return () => st.kill()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dataKey, innerW > 0])

  // Keep the clip full width on resize after the first draw.
  useLayoutEffect(() => {
    if (seen.current && clip.current) gsap.set(clip.current, { attr: { width: innerW + 20 } })
  }, [innerW])

  const step = Math.max(1, Math.ceil(n / Math.max(1, Math.floor(innerW / 64))))

  const onMove = (e: React.PointerEvent<SVGRectElement>) => {
    const r = e.currentTarget.getBoundingClientRect()
    const px = e.clientX - r.left
    const i = Math.round((px / r.width) * (n - 1))
    setHover(Math.max(0, Math.min(n - 1, i)))
  }

  const tipLeft = hover !== null ? x(hover) : 0
  const flip = tipLeft > width * 0.65

  return (
    <div ref={wrap} className="relative w-full select-none" style={{ height }}>
      {width > 0 && (
        <svg width={width} height={height} className="block overflow-visible" role="img" aria-label={`Chart of ${series.map((s) => s.label).join(' and ')}`}>
          <defs>
            {paths.map((p) => (
              <linearGradient key={p.key} id={`ag-${uid}-${p.key}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" style={{ stopColor: p.color, stopOpacity: 0.28 }} />
                <stop offset="100%" style={{ stopColor: p.color, stopOpacity: 0 }} />
              </linearGradient>
            ))}
            <clipPath id={`clip-${uid}`}>
              <rect ref={clip} x={PAD.left - 10} y={0} width={0} height={height} />
            </clipPath>
          </defs>

          {ticks.map((t) => (
            <g key={t}>
              <line x1={PAD.left} x2={width - PAD.right} y1={y(t)} y2={y(t)} strokeWidth={1} style={{ stroke: 'var(--line)' }} />
              <text x={PAD.left - 10} y={y(t)} dy="0.32em" textAnchor="end" className="tabular" style={{ fill: 'var(--faint)', fontSize: 11 }}>
                {format(t)}
              </text>
            </g>
          ))}
          {labels.map((l, i) =>
            i % step === 0 || i === n - 1 ? (
              <text key={i} x={x(i)} y={height - 8} textAnchor={i === 0 ? 'start' : i === n - 1 ? 'end' : 'middle'} style={{ fill: 'var(--faint)', fontSize: 11 }}>
                {l}
              </text>
            ) : null,
          )}

          <g clipPath={`url(#clip-${uid})`}>
            {paths.map((p) =>
              p.reference ? null : <path key={`a-${p.key}`} d={p.area} style={{ fill: `url(#ag-${uid}-${p.key})` }} />,
            )}
            {paths.map((p) => (
              <path
                key={`l-${p.key}`}
                d={p.line}
                fill="none"
                strokeWidth={p.reference ? 1.5 : 2.25}
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeDasharray={p.reference ? '4 5' : undefined}
                style={{ stroke: p.color, filter: p.reference ? undefined : `drop-shadow(0 4px 10px color-mix(in oklab, ${p.color} 45%, transparent))` }}
              />
            ))}
          </g>

          <g ref={dots}>
            {paths
              .filter((p) => !p.reference)
              .map((p) => (
                <g key={`d-${p.key}`}>
                  <circle cx={p.last[0]} cy={p.last[1]} r={9} style={{ fill: p.color, opacity: 0.18 }} className="animate-pulse" />
                  <circle cx={p.last[0]} cy={p.last[1]} r={4.5} strokeWidth={2} style={{ fill: p.color, stroke: 'var(--surface)' }} />
                </g>
              ))}
          </g>

          {hover !== null && (
            <g pointerEvents="none">
              <line x1={x(hover)} x2={x(hover)} y1={PAD.top} y2={PAD.top + innerH} strokeWidth={1} style={{ stroke: 'var(--line-strong)' }} />
              {paths.map((p) => (
                <circle key={p.key} cx={x(hover)} cy={y(p.values[hover])} r={4.5} strokeWidth={2} style={{ fill: p.color, stroke: 'var(--surface)' }} />
              ))}
            </g>
          )}

          <rect
            x={PAD.left}
            y={PAD.top}
            width={innerW}
            height={innerH}
            fill="transparent"
            onPointerMove={onMove}
            onPointerDown={onMove}
            onPointerLeave={() => setHover(null)}
          />
        </svg>
      )}

      {hover !== null && (
        <div
          className="popover pointer-events-none absolute z-10 min-w-[150px] px-3 py-2.5"
          style={{
            left: tipLeft,
            top: 6,
            transform: `translateX(${flip ? 'calc(-100% - 14px)' : '14px'})`,
          }}
        >
          <div className="mb-1.5 text-[11.5px] font-medium text-faint">{labels[hover]}</div>
          {series.map((s) => (
            <div key={s.key} className="flex items-center justify-between gap-4 text-[12.5px]">
              <span className="flex items-center gap-2 text-muted">
                <span className="h-[3px] w-3 rounded-full" style={{ background: s.color }} />
                {s.label}
              </span>
              <span className="tabular font-semibold text-fg">{format(s.values[hover])}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
