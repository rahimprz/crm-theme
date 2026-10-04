import { useLayoutEffect, useRef, type ReactNode } from 'react'
import { gsap, reducedMotion } from '@/lib/gsap'

/** Animates its children open and closed (height + fade + slight lift). */
export function Collapse({ open, children }: { open: boolean; children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null)
  const first = useRef(true)
  useLayoutEffect(() => {
    const el = ref.current
    if (!el) return
    const instant = first.current || reducedMotion()
    first.current = false
    gsap.killTweensOf(el)
    if (open) {
      gsap.fromTo(
        el,
        { height: instant ? 'auto' : el.offsetHeight, opacity: instant ? 1 : 0.3 },
        { height: 'auto', opacity: 1, duration: instant ? 0 : 0.45, ease: 'volt.out', clearProps: 'height' },
      )
      if (!instant) gsap.fromTo(el.children, { y: -6, opacity: 0 }, { y: 0, opacity: 1, duration: 0.35, stagger: 0.03, ease: 'volt.out' })
    } else {
      gsap.to(el, { height: 0, opacity: 0, duration: instant ? 0 : 0.35, ease: 'volt' })
    }
  }, [open])
  return (
    <div ref={ref} className="overflow-hidden">
      {children}
    </div>
  )
}
