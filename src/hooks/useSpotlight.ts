import { useEffect } from 'react'

/**
 * One global listener that writes the cursor position into --mx / --my on
 * whichever `.spotlight` element is under the pointer. Mounted once in AppShell.
 */
export function useSpotlight() {
  useEffect(() => {
    let frame = 0
    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse') return
      cancelAnimationFrame(frame)
      frame = requestAnimationFrame(() => {
        const el = (e.target as Element | null)?.closest?.('.spotlight') as HTMLElement | null
        if (!el) return
        const r = el.getBoundingClientRect()
        el.style.setProperty('--mx', `${e.clientX - r.left}px`)
        el.style.setProperty('--my', `${e.clientY - r.top}px`)
      })
    }
    window.addEventListener('pointermove', onMove, { passive: true })
    return () => {
      window.removeEventListener('pointermove', onMove)
      cancelAnimationFrame(frame)
    }
  }, [])
}
