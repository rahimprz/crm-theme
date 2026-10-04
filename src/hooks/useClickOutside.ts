import { useEffect, useRef, type RefObject } from 'react'

/** Calls `onOutside` on a pointer-down outside every ref, or on Escape. */
export function useClickOutside(refs: RefObject<HTMLElement | null>[], onOutside: () => void, active = true) {
  const cb = useRef(onOutside)
  const list = useRef(refs)
  cb.current = onOutside
  list.current = refs
  useEffect(() => {
    if (!active) return
    const handler = (e: PointerEvent) => {
      const t = e.target as Node
      if (list.current.some((r) => r.current?.contains(t))) return
      cb.current()
    }
    const key = (e: KeyboardEvent) => e.key === 'Escape' && cb.current()
    document.addEventListener('pointerdown', handler)
    document.addEventListener('keydown', key)
    return () => {
      document.removeEventListener('pointerdown', handler)
      document.removeEventListener('keydown', key)
    }
  }, [active])
}
