import { useRef, type ReactNode } from 'react'
import { gsap, SplitText, useGSAP, reducedMotion } from '@/lib/gsap'
import { cn } from '@/lib/cn'

/** Page title block. The title's words rise out of a mask on load. */
export function PageHeader({
  title,
  description,
  actions,
  eyebrow,
  className,
}: {
  title: ReactNode
  description?: ReactNode
  actions?: ReactNode
  eyebrow?: ReactNode
  className?: string
}) {
  const ref = useRef<HTMLDivElement>(null)
  useGSAP(
    () => {
      if (reducedMotion()) return
      const el = ref.current?.querySelector('[data-title]')
      if (el) {
        const split = SplitText.create(el, { type: 'words', mask: 'words' })
        gsap.from(split.words, { yPercent: 115, duration: 0.9, stagger: 0.06, ease: 'volt.out' })
      }
      gsap.from('[data-sub]', { opacity: 0, y: 10, duration: 0.6, delay: 0.2, stagger: 0.06 })
    },
    { scope: ref },
  )
  return (
    <div ref={ref} className={cn('mb-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between', className)}>
      <div className="min-w-0">
        {eyebrow && (
          <div className="eyebrow mb-2" data-sub>
            {eyebrow}
          </div>
        )}
        <h1 data-title className="font-display text-[28px] leading-[1.08] font-semibold tracking-[-0.03em] text-fg md:text-[34px]">
          {title}
        </h1>
        {description && (
          <p data-sub className="mt-2 max-w-2xl text-[14px] text-muted">
            {description}
          </p>
        )}
      </div>
      {actions && (
        <div data-sub className="flex shrink-0 flex-wrap items-center gap-2">
          {actions}
        </div>
      )}
    </div>
  )
}
