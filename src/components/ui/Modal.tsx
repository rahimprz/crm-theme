import { useEffect, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { X } from 'lucide-react'
import { gsap } from '@/lib/gsap'
import { usePresence } from '@/hooks/usePresence'
import { cn } from '@/lib/cn'

const widths = { sm: 'sm:max-w-md', md: 'sm:max-w-lg', lg: 'sm:max-w-2xl', xl: 'sm:max-w-4xl' }

function useScrollLock(active: boolean) {
  useEffect(() => {
    if (!active) return
    const prev = document.documentElement.style.overflow
    document.documentElement.style.overflow = 'hidden'
    return () => {
      document.documentElement.style.overflow = prev
    }
  }, [active])
}

/**
 * Centered dialog on desktop, bottom sheet on phones. Blurs in, springs up,
 * and staggers any child marked `data-stagger`.
 */
export function Modal({
  open,
  onClose,
  title,
  description,
  icon,
  children,
  footer,
  size = 'md',
  className,
}: {
  open: boolean
  onClose: () => void
  title?: ReactNode
  description?: ReactNode
  icon?: ReactNode
  children: ReactNode
  footer?: ReactNode
  size?: keyof typeof widths
  className?: string
}) {
  const { mounted, ref } = usePresence<HTMLDivElement>(open, {
    enter: (el) => {
      const q = gsap.utils.selector(el)
      return gsap
        .timeline()
        .fromTo(q('[data-backdrop]'), { opacity: 0 }, { opacity: 1, duration: 0.35, ease: 'power2.out' })
        .fromTo(
          q('[data-panel]'),
          { opacity: 0, y: 40, scale: 0.95, filter: 'blur(10px)' },
          { opacity: 1, y: 0, scale: 1, filter: 'blur(0px)', duration: 0.6, ease: 'volt.out', clearProps: 'filter' },
          0,
        )
        .fromTo(q('[data-stagger]'), { opacity: 0, y: 12 }, { opacity: 1, y: 0, duration: 0.45, stagger: 0.04 }, 0.12)
    },
    exit: (el) => {
      const q = gsap.utils.selector(el)
      return gsap
        .timeline()
        .to(q('[data-panel]'), { opacity: 0, y: 16, scale: 0.97, duration: 0.22, ease: 'power2.in' })
        .to(q('[data-backdrop]'), { opacity: 0, duration: 0.22 }, 0.04)
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
    <div ref={ref} className="fixed inset-0 z-[80] flex items-end justify-center sm:items-center sm:p-6">
      <div data-backdrop onClick={onClose} className="absolute inset-0 bg-[rgb(2_3_8/0.62)] backdrop-blur-[6px]" />
      <div
        data-panel
        role="dialog"
        aria-modal="true"
        className={cn(
          'popover relative flex max-h-[92dvh] w-full flex-col overflow-hidden rounded-b-none sm:rounded-b-[var(--radius-xl)]',
          widths[size],
          className,
        )}
      >
        {(title || icon) && (
          <div className="flex items-start gap-3 border-b border-line px-5 py-4" data-stagger>
            {icon && (
              <span className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-primary/25 bg-primary/12 text-primary [&_svg]:size-5">
                {icon}
              </span>
            )}
            <div className="min-w-0 flex-1">
              {title && <h2 className="font-display text-[18px] font-semibold text-fg">{title}</h2>}
              {description && <p className="mt-0.5 text-[13px] text-muted">{description}</p>}
            </div>
            <button
              type="button"
              onClick={onClose}
              className="-mt-1 -mr-1 flex size-8 items-center justify-center rounded-lg text-faint transition-colors hover:bg-surface-3 hover:text-fg"
              aria-label="Close"
            >
              <X className="size-4" />
            </button>
          </div>
        )}
        <div className="min-h-0 flex-1 overflow-y-auto">{children}</div>
        {footer && (
          <div className="flex items-center justify-end gap-2 border-t border-line bg-surface/50 px-5 py-3 pb-[max(12px,env(safe-area-inset-bottom))]" data-stagger>
            {footer}
          </div>
        )}
      </div>
    </div>,
    document.body,
  )
}

export { useScrollLock }
