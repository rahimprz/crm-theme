import { useEffect, useRef, useState } from 'react'

/**
 * Tracks whether a scroll container has hidden content above/below (or
 * left/right). Used to show soft fades only when there is more to see.
 */
export function useScrollEdges<T extends HTMLElement>(axis: 'y' | 'x' = 'y') {
  const ref = useRef<T>(null)
  const [edges, setEdges] = useState({ start: false, end: false })
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const update = () => {
      const pos = axis === 'y' ? el.scrollTop : el.scrollLeft
      const size = axis === 'y' ? el.scrollHeight - el.clientHeight : el.scrollWidth - el.clientWidth
      const next = { start: pos > 2, end: pos < size - 2 }
      setEdges((e) => (e.start === next.start && e.end === next.end ? e : next))
    }
    update()
    el.addEventListener('scroll', update, { passive: true })
    const ro = new ResizeObserver(update)
    ro.observe(el)
    if (el.firstElementChild) ro.observe(el.firstElementChild)
    return () => {
      el.removeEventListener('scroll', update)
      ro.disconnect()
    }
  }, [axis])
  return [ref, edges] as const
}
