import { useLayoutEffect, useRef } from 'react'
import { gsap, reducedMotion } from '@/lib/gsap'
import { useTheme } from '@/store/theme'
import { getMode } from '@/config/themes'
import { cn } from '@/lib/cn'

const stars = [
  { x: 10, y: 9, r: 1.1 },
  { x: 19, y: 20, r: 0.8 },
  { x: 25, y: 8, r: 1.4 },
  { x: 14, y: 25, r: 0.7 },
  { x: 31, y: 16, r: 0.9 },
  { x: 6, y: 18, r: 0.6 },
]

/**
 * Day / night switch. Sun slides into a cratered moon, stars twinkle on,
 * clouds drift off. The whole app re-themes with a circular sweep that
 * starts from the toggle.
 */
export function ThemeToggle({ className }: { className?: string }) {
  const mode = useTheme((s) => s.mode)
  const toggleMode = useTheme((s) => s.toggleMode)
  const dark = getMode(mode).isDark
  const root = useRef<HTMLButtonElement>(null)
  const first = useRef(true)

  useLayoutEffect(() => {
    const el = root.current
    if (!el) return
    const q = gsap.utils.selector(el)
    const instant = first.current || reducedMotion()
    first.current = false
    const d = instant ? 0 : 1
    const tl = gsap.timeline({ defaults: { duration: 0.6 * d, ease: 'volt.out' } })
    tl.to(q('[data-knob]'), { x: dark ? 34 : 0, rotate: dark ? 360 : 0, duration: 0.7 * d, ease: 'back.out(1.5)' }, 0)
      .to(q('[data-night]'), { opacity: dark ? 1 : 0 }, 0)
      .to(q('[data-moon]'), { opacity: dark ? 1 : 0, scale: dark ? 1 : 0.6 }, 0.05 * d)
      .to(q('[data-sun]'), { opacity: dark ? 0 : 1, scale: dark ? 0.6 : 1 }, 0)
      .to(q('[data-star]'), { opacity: dark ? 1 : 0, scale: dark ? 1 : 0, stagger: 0.04 * d, duration: 0.4 * d, ease: 'back.out(3)' }, 0.15 * d)
      .to(q('[data-cloud]'), { x: dark ? 30 : 0, opacity: dark ? 0 : 1, stagger: 0.05 * d }, 0)
    return () => {
      tl.kill()
    }
  }, [dark])

  return (
    <button
      ref={root}
      type="button"
      role="switch"
      aria-checked={dark}
      aria-label={dark ? 'Switch to light mode' : 'Switch to dark mode'}
      onClick={(e) => toggleMode({ x: e.clientX, y: e.clientY })}
      className={cn(
        'group relative h-[34px] w-[70px] shrink-0 overflow-hidden rounded-full border border-line-strong',
        'shadow-[inset_0_2px_6px_rgb(0_0_0/0.25)] transition-transform active:scale-95',
        className,
      )}
      style={{ background: 'linear-gradient(180deg, #7cc4ff, #c4e6ff)' }}
    >
      <span
        data-night
        className="absolute inset-0 opacity-0"
        style={{ background: 'radial-gradient(circle at 30% 30%, #2a3170, #0b0f2a 70%)' }}
      />
      <svg className="absolute inset-0 h-full w-full" viewBox="0 0 70 34" aria-hidden>
        {stars.map((s, i) => (
          <circle key={i} data-star cx={s.x} cy={s.y} r={s.r} fill="white" style={{ transformOrigin: `${s.x}px ${s.y}px`, opacity: 0 }} />
        ))}
        <g data-cloud>
          <ellipse cx="50" cy="27" rx="12" ry="6" fill="white" opacity="0.95" />
          <ellipse cx="58" cy="24" rx="8" ry="6" fill="white" opacity="0.95" />
        </g>
        <g data-cloud>
          <ellipse cx="40" cy="30" rx="9" ry="4.5" fill="white" opacity="0.75" />
        </g>
      </svg>
      <span data-knob className="absolute top-[2px] left-[2px] size-[28px]">
        <span
          data-sun
          className="absolute inset-0 rounded-full"
          style={{
            background: 'radial-gradient(circle at 35% 35%, #fff6c4, #ffd23f 45%, #ffa51f)',
            boxShadow: '0 0 12px 2px rgb(255 200 60 / 0.75), inset -2px -2px 4px rgb(200 110 0 / 0.35)',
          }}
        />
        <span
          data-moon
          className="absolute inset-0 rounded-full opacity-0"
          style={{
            background: 'radial-gradient(circle at 35% 35%, #ffffff, #d7dcef 55%, #aab2cf)',
            boxShadow: '0 0 14px 1px rgb(190 205 255 / 0.55), inset -3px -2px 4px rgb(60 70 110 / 0.35)',
          }}
        >
          <span className="absolute top-[7px] left-[14px] size-[6px] rounded-full bg-[#b7bed8] shadow-[inset_1px_1px_1px_rgb(0_0_0/0.15)]" />
          <span className="absolute top-[15px] left-[7px] size-[5px] rounded-full bg-[#b7bed8] shadow-[inset_1px_1px_1px_rgb(0_0_0/0.15)]" />
          <span className="absolute top-[18px] left-[16px] size-[3px] rounded-full bg-[#b7bed8]" />
        </span>
      </span>
    </button>
  )
}
