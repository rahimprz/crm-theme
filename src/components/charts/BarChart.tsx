import { useLayoutEffect, useMemo, useRef, useState } from 'react'
import { gsap, ScrollTrigger, reducedMotion } from '@/lib/gsap'
import { barPath, niceTicks } from '@/lib/chart'
import { useSize } from '@/hooks/useSize'

export interface BarSeries {
  key: string
  label: string
  color: string
}

const PAD = { top: 14, right: 8, bottom: 28, left: 52 }

/**
 * Column chart, stacked or grouped. Columns rise from the baseline in a
 * stagger when scrolled into view. Hover a column for its breakdown.
 */
export function BarChart({
  data,
  series,
  stacked = true,
  height = 260,
  format = (n) => String(n),
}: {
  data: { label: string; values: Record<string, number> }[]
  series: BarSeries[]
  stacked?: boolean
  height?: number
  format?: (n: number) => string
}) {
  const [wrap, { width }] = useSize<HTMLDivElement>()
  const group = useRef<SVGGElement>(null)
  const [hover, setHover] = useState<number | null>(null)

  const innerW = Math.max(0, width - PAD.left - PAD.right)
  const innerH = height - PAD.top - PAD.bottom
  const totals = data.map((d) => (stacked ? series.reduce((s, k) => s + (d.values[k.key] ?? 0), 0) : Math.max(...series.map((k) => d.values[k.key] ?? 0))))
  const { max, ticks } = useMemo(() => niceTicks(Math.max(...totals) * 1.05, 4), [totals.join()])
  const band = innerW / Math.max(1, data.length)
  const barW = stacked ? Math.min(28, band * 0.56) : Math.min(14, (band * 0.7) / series.length)
  const y = (v: number) => PAD.top + innerH - (v / max) * innerH
  const h = (v: number) => (v / max) * innerH

  useLayoutEffect(() => {
    const g = group.current
    if (!g || !width) return
    const cols = g.querySelectorAll('[data-col]')
    if (reducedMotion()) return
    gsap.set(cols, { scaleY: 0, transformOrigin: '50% 100%' })
    const st = ScrollTrigger.create({
      trigger: g,
      start: 'top 92%',
      once: true,
      onEnter: () => gsap.to(cols, { scaleY: 1, duration: 1, stagger: 0.06, ease: 'elastic.out(1, 0.75)' }),
    })
    return () => st.kill()
  }, [width > 0, data.length])

  return (
    <div ref={wrap} className="relative w-full select-none" style={{ height }}>
      {width > 0 && (
        <svg width={width} height={height} className="block overflow-visible" role="img" aria-label="Column chart">
          {ticks.map((t) => (
            <g key={t}>
              <line x1={PAD.left} x2={width - PAD.right} y1={y(t)} y2={y(t)} strokeWidth={1} style={{ stroke: 'var(--line)' }} />
              <text x={PAD.left - 10} y={y(t)} dy="0.32em" textAnchor="end" className="tabular" style={{ fill: 'var(--faint)', fontSize: 11 }}>
                {format(t)}
              </text>
            </g>
          ))}
          <g ref={group}>
            {data.map((d, i) => {
              const cx = PAD.left + band * i + band / 2
              let acc = 0
              return (
                <g key={d.label} onPointerEnter={() => setHover(i)} onPointerLeave={() => setHover(null)}>
                  <rect x={PAD.left + band * i} y={PAD.top} width={band} height={innerH} rx={6} style={{ fill: hover === i ? 'var(--surface-2)' : 'transparent' }} />
                  <g data-col style={{ opacity: hover === null || hover === i ? 1 : 0.45, transition: 'opacity .2s' }}>
                    {series.map((s, si) => {
                      const v = d.values[s.key] ?? 0
                      if (stacked) {
                        const isTop = si === series.length - 1
                        const segH = Math.max(0, h(v) - (isTop ? 0 : 2))
                        const top = y(acc + v) + (isTop ? 0 : 2)
                        acc += v
                        return isTop ? (
                          <path key={s.key} d={barPath(cx - barW / 2, y(acc), barW, h(v))} style={{ fill: s.color }} />
                        ) : (
                          <rect key={s.key} x={cx - barW / 2} y={top} width={barW} height={segH} style={{ fill: s.color }} />
                        )
                      }
                      const bx = cx - (barW * series.length + 3 * (series.length - 1)) / 2 + si * (barW + 3)
                      return <path key={s.key} d={barPath(bx, y(v), barW, h(v))} style={{ fill: s.color }} />
                    })}
                  </g>
                  <text x={cx} y={height - 8} textAnchor="middle" style={{ fill: hover === i ? 'var(--fg)' : 'var(--faint)', fontSize: 11 }}>
                    {d.label}
                  </text>
                </g>
              )
            })}
          </g>
        </svg>
      )}
      {hover !== null && width > 0 && (
        <div
          className="popover pointer-events-none absolute z-10 min-w-[160px] px-3 py-2.5"
          style={{
            left: PAD.left + band * hover + band / 2,
            top: 4,
            transform: `translateX(${PAD.left + band * hover > width * 0.6 ? 'calc(-100% - 18px)' : '18px'})`,
          }}
        >
          <div className="mb-1.5 flex justify-between text-[11.5px] font-medium text-faint">
            <span>{data[hover].label}</span>
            {stacked && <span className="tabular text-fg">{format(totals[hover])}</span>}
          </div>
          {[...series].reverse().map((s) => (
            <div key={s.key} className="flex items-center justify-between gap-4 text-[12.5px]">
              <span className="flex items-center gap-2 text-muted">
                <span className="size-2 rounded-[3px]" style={{ background: s.color }} />
                {s.label}
              </span>
              <span className="tabular font-semibold text-fg">{format(data[hover].values[s.key] ?? 0)}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
