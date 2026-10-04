import { useEffect, useLayoutEffect, useRef, useState } from 'react'

type Anim = { eventCallback: (name: 'onComplete', cb: () => void) => unknown; kill: () => unknown } | void

/**
 * Keeps a component mounted long enough to play its exit animation.
 *
 *   const { mounted, ref } = usePresence(open, { enter: el => gsap.from(...), exit: el => gsap.to(...) })
 *
 * `exit` should return the GSAP tween/timeline; the component unmounts when it completes.
 */
export function usePresence<T extends HTMLElement>(
  open: boolean,
  anim: { enter?: (el: T) => Anim; exit?: (el: T) => Anim },
) {
  const [mounted, setMounted] = useState(open)
  const ref = useRef<T>(null)
  const animRef = useRef(anim)
  const openRef = useRef(open)
  const running = useRef<Anim>(undefined)
  animRef.current = anim
  openRef.current = open

  useEffect(() => {
    if (open) setMounted(true)
  }, [open])

  useLayoutEffect(() => {
    const el = ref.current
    if (!el || !mounted) return
    running.current?.kill()
    if (open) {
      running.current = animRef.current.enter?.(el)
    } else {
      const a = animRef.current.exit?.(el)
      running.current = a
      if (a) a.eventCallback('onComplete', () => !openRef.current && setMounted(false))
      else setMounted(false)
    }
  }, [open, mounted])

  return { mounted, ref }
}
