import { useLayoutEffect, useRef } from 'react'
import { gsap, ScrollTrigger, reducedMotion } from '@/lib/gsap'
import { formatValue } from '@/lib/format'
import { cn } from '@/lib/cn'

/**
 * Counts up to `value` the first time it scrolls into view, then tweens
 * smoothly between values whenever the number changes.
 */
export function AnimatedNumber({
  value,
  format = 'number',
  compact = true,
  duration = 1.6,
  className,
}: {
  value: number
  format?: 'currency' | 'number' | 'percent'
  compact?: boolean
  duration?: number
  className?: string
}) {
  const ref = useRef<HTMLSpanElement>(null)
  const state = useRef({ v: 0, seen: false })

  useLayoutEffect(() => {
    const el = ref.current
    if (!el) return
    const s = state.current
    const render = () => {
      el.textContent = formatValue(s.v, format, compact)
    }
    if (reducedMotion()) {
      s.v = value
      render()
      return
    }
    render()
    const tween = gsap.to(s, { v: value, duration: s.seen ? 0.9 : duration, ease: 'power3.out', onUpdate: render, paused: true })
    if (s.seen) {
      tween.play()
      return () => {
        tween.kill()
      }
    }
    const st = ScrollTrigger.create({
      trigger: el,
      start: 'top 98%',
      once: true,
      onEnter: () => {
        s.seen = true
        tween.play()
      },
    })
    return () => {
      st.kill()
      tween.kill()
    }
  }, [value, format, compact, duration])

  return <span ref={ref} className={cn('tabular', className)} />
}
