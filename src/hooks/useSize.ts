import { useLayoutEffect, useRef, useState } from 'react'

/** Observes an element's content size. Charts use it to stay responsive. */
export function useSize<T extends HTMLElement>() {
  const ref = useRef<T>(null)
  const [size, setSize] = useState({ width: 0, height: 0 })
  useLayoutEffect(() => {
    const el = ref.current
    if (!el) return
    const ro = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect
      setSize((s) => (Math.abs(s.width - width) < 1 && Math.abs(s.height - height) < 1 ? s : { width, height }))
    })
    ro.observe(el)
    return () => ro.disconnect()
  }, [])
  return [ref, size] as const
}
