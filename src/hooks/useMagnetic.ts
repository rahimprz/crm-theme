import { useEffect, type RefObject } from 'react'
import { gsap, reducedMotion } from '@/lib/gsap'

/** Pulls an element gently toward the cursor while hovered. */
export function useMagnetic(ref: RefObject<HTMLElement | null>, strength = 0.25) {
  useEffect(() => {
    const el = ref.current
    if (!el || reducedMotion() || window.matchMedia('(pointer: coarse)').matches) return
    const xTo = gsap.quickTo(el, 'x', { duration: 0.5, ease: 'power3.out' })
    const yTo = gsap.quickTo(el, 'y', { duration: 0.5, ease: 'power3.out' })
    const move = (e: PointerEvent) => {
      const r = el.getBoundingClientRect()
      xTo((e.clientX - (r.left + r.width / 2)) * strength)
      yTo((e.clientY - (r.top + r.height / 2)) * strength)
    }
    const leave = () => {
      gsap.to(el, { x: 0, y: 0, duration: 0.8, ease: 'elastic.out(1, 0.4)' })
    }
    el.addEventListener('pointermove', move)
    el.addEventListener('pointerleave', leave)
    return () => {
      el.removeEventListener('pointermove', move)
      el.removeEventListener('pointerleave', leave)
    }
  }, [ref, strength])
}
