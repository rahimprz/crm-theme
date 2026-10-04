import { type RefObject } from 'react'
import { gsap, ScrollTrigger, useGSAP, reducedMotion } from '@/lib/gsap'

/**
 * Scroll-triggered reveal. Any element inside `scope` with `data-reveal`
 * rises into place as it enters the viewport, in staggered batches.
 *
 *   data-reveal          → fade + rise
 *   data-reveal="scale"  → fade + scale up
 *   data-reveal="left"   → slide in from the left
 */
export function useReveal(scope: RefObject<HTMLElement | null>, deps: unknown[] = []) {
  useGSAP(
    () => {
      if (reducedMotion()) return
      const els = gsap.utils.toArray<HTMLElement>('[data-reveal]', scope.current)
      if (!els.length) return
      const from = (el: HTMLElement) => {
        const kind = el.dataset.reveal
        if (kind === 'scale') return { opacity: 0, scale: 0.94, y: 18, filter: 'blur(6px)' }
        if (kind === 'left') return { opacity: 0, x: -32, filter: 'blur(6px)' }
        return { opacity: 0, y: 36, filter: 'blur(8px)' }
      }
      els.forEach((el) => gsap.set(el, from(el)))
      ScrollTrigger.batch(els, {
        start: 'top 92%',
        once: true,
        onEnter: (batch) =>
          gsap.to(batch, {
            opacity: 1,
            x: 0,
            y: 0,
            scale: 1,
            filter: 'blur(0px)',
            duration: 0.9,
            stagger: 0.08,
            ease: 'volt.out',
            clearProps: 'filter,transform',
          }),
      })
      // Elements already on screen at load get revealed immediately.
      ScrollTrigger.refresh()
    },
    { scope, dependencies: deps },
  )
}
