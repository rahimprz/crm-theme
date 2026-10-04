import { useEffect, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { gsap } from '@/lib/gsap'
import { usePresence } from '@/hooks/usePresence'
import { useScrollLock } from './Modal'
import { cn } from '@/lib/cn'

/** Side sheet that glides in from the right (or left), content staggering behind it. */
export function Drawer({
  open,
  onClose,
  children,
  side = 'right',
  width = 'max-w-[520px]',
  className,
}: {
  open: boolean
  onClose: () => void
  children: ReactNode
  side?: 'left' | 'right'
  width?: string
  className?: string
}) {
  const dir = side === 'right' ? 1 : -1
  const { mounted, ref } = usePresence<HTMLDivElement>(open, {
    enter: (el) => {
      const q = gsap.utils.selector(el)
      return gsap
        .timeline()
        .fromTo(q('[data-backdrop]'), { opacity: 0 }, { opacity: 1, duration: 0.3 })
        .fromTo(q('[data-panel]'), { xPercent: 100 * dir }, { xPercent: 0, duration: 0.65, ease: 'volt.out' }, 0)
        .fromTo(q('[data-stagger]'), { opacity: 0, x: 24 * dir }, { opacity: 1, x: 0, duration: 0.5, stagger: 0.045 }, 0.15)
    },
    exit: (el) => {
      const q = gsap.utils.selector(el)
      return gsap
        .timeline()
        .to(q('[data-panel]'), { xPercent: 100 * dir, duration: 0.38, ease: 'volt' })
        .to(q('[data-backdrop]'), { opacity: 0, duration: 0.3 }, 0.05)
    },
  })
  useScrollLock(open)

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  if (!mounted) return null
  return createPortal(
    <div ref={ref} className="fixed inset-0 z-[70]">
      <div data-backdrop onClick={onClose} className="absolute inset-0 bg-[rgb(2_3_8/0.55)] backdrop-blur-[3px]" />
      <aside
        data-panel
        role="dialog"
        aria-modal="true"
        className={cn(
          'absolute top-0 bottom-0 flex w-full flex-col border-line-strong bg-surface shadow-[var(--shadow-pop)]',
          side === 'right' ? 'right-0 border-l' : 'left-0 border-r',
          width,
          className,
        )}
      >
        {children}
      </aside>
    </div>,
    document.body,
  )
}
