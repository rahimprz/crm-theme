import { useLayoutEffect, useRef, useState } from 'react'
import { gsap, ScrollTrigger, reducedMotion } from '@/lib/gsap'

/**
 * Weekday × hour grid. One hue, light to dark, so stronger cells read as
 * "better". Cells ripple in diagonally when scrolled into view.
 */
export function Heatmap({
  rows,
  cols,
  cells,
  format = (v) => `${v}%`,
}: {
  rows: string[]
  cols: number[]
  cells: number[][]
  format?: (v: number) => string
}) {
  const ref = useRef<HTMLDivElement>(null)
  const [hover, setHover] = useState<{ r: number; c: number } | null>(null)
  const max = Math.max(...cells.flat())

  useLayoutEffect(() => {
    const el = ref.current
    if (!el || reducedMotion()) return
    const items = el.querySelectorAll('[data-cell]')
    gsap.set(items, { scale: 0.2, opacity: 0 })
    const st = ScrollTrigger.create({
      trigger: el,
      start: 'top 92%',
      once: true,
      onEnter: () =>
        gsap.to(items, {
          scale: 1,
          opacity: 1,
          duration: 0.5,
          ease: 'back.out(2)',
          stagger: { each: 0.012, grid: [rows.length, cols.length], from: 'start' },
        }),
    })
    return () => st.kill()
  }, [rows.length, cols.length])

  const hourLabel = (h: number) => (h === 12 ? '12p' : h > 12 ? `${h - 12}p` : `${h}a`)

  return (
    <div className="relative">
      <div ref={ref} className="grid gap-[3px]" style={{ gridTemplateColumns: `34px repeat(${cols.length}, minmax(0, 1fr))` }}>
        {rows.map((row, r) => (
          <div key={row} className="contents">
            <span className="flex items-center text-[11px] text-faint">{row}</span>
            {cols.map((_, c) => {
              const v = cells[r][c]
              const t = v / max
              return (
                <span
                  key={c}
                  data-cell
                  onPointerEnter={() => setHover({ r, c })}
                  onPointerLeave={() => setHover(null)}
                  className="h-6 cursor-default rounded-[4px] transition-[outline-color] duration-150 sm:h-7"
                  style={{
                    background: `color-mix(in oklab, var(--primary) ${Math.round(8 + t * 92)}%, var(--surface-2))`,
                    outline: hover?.r === r && hover?.c === c ? '2px solid var(--fg)' : '2px solid transparent',
                    outlineOffset: 1,
                  }}
                />
              )
            })}
          </div>
        ))}
        <span />
        {cols.map((h, i) => (
          <span key={h} className="pt-1 text-center text-[10.5px] text-faint">
            {i % 2 === 0 ? hourLabel(h) : ''}
          </span>
        ))}
      </div>
      <div className="mt-3 flex items-center justify-between gap-3 text-[11.5px] text-muted">
        <span className="tabular min-h-[18px]">
          {hover ? (
            <>
              <span className="text-fg">{rows[hover.r]} {hourLabel(cols[hover.c])}</span> · {format(cells[hover.r][hover.c])} reply rate
            </>
          ) : (
            'Hover a cell for its reply rate'
          )}
        </span>
        <span className="flex items-center gap-1.5">
          Low
          <span className="h-2 w-16 rounded-full" style={{ background: 'linear-gradient(90deg, color-mix(in oklab, var(--primary) 8%, var(--surface-2)), var(--primary))' }} />
          High
        </span>
      </div>
    </div>
  )
}
