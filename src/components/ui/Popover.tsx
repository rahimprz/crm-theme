import { useCallback, useEffect, useLayoutEffect, useRef, useState, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { gsap } from '@/lib/gsap'
import { usePresence } from '@/hooks/usePresence'
import { useClickOutside } from '@/hooks/useClickOutside'
import { cn } from '@/lib/cn'

type RenderTrigger = (api: { open: boolean; toggle: () => void }) => ReactNode
type RenderContent = (api: { close: () => void }) => ReactNode

/**
 * Floating panel anchored to a trigger. Rendered in a portal so it is never
 * clipped, flips above the trigger when there is no room below, and stays
 * inside the viewport on phones.
 */
export function Popover({
  trigger,
  children,
  align = 'end',
  width = 320,
  open: controlled,
  onOpenChange,
  className,
}: {
  trigger: RenderTrigger
  children: ReactNode | RenderContent
  align?: 'start' | 'center' | 'end'
  width?: number
  open?: boolean
  onOpenChange?: (open: boolean) => void
  className?: string
}) {
  const [inner, setInner] = useState(false)
  const open = controlled ?? inner
  const setOpen = useCallback(
    (v: boolean) => {
      onOpenChange?.(v)
      if (controlled === undefined) setInner(v)
    },
    [controlled, onOpenChange],
  )
  const anchor = useRef<HTMLDivElement>(null)
  const [pos, setPos] = useState({ top: 0 as number | undefined, bottom: undefined as number | undefined, left: 0, w: width, originX: 0, up: false })

  const compute = useCallback(() => {
    const el = anchor.current
    if (!el) return
    const r = el.getBoundingClientRect()
    const vw = window.innerWidth
    const vh = window.innerHeight
    const w = Math.min(width, vw - 16)
    let left = align === 'end' ? r.right - w : align === 'center' ? r.left + r.width / 2 - w / 2 : r.left
    left = Math.max(8, Math.min(left, vw - w - 8))
    const below = vh - r.bottom
    const up = below < 280 && r.top > below
    setPos({
      top: up ? undefined : r.bottom + 8,
      bottom: up ? vh - r.top + 8 : undefined,
      left,
      w,
      originX: r.left + r.width / 2 - left,
      up,
    })
  }, [align, width])

  useLayoutEffect(() => {
    if (open) compute()
  }, [open, compute])

  useEffect(() => {
    if (!open) return
    window.addEventListener('resize', compute)
    window.addEventListener('scroll', compute, true)
    return () => {
      window.removeEventListener('resize', compute)
      window.removeEventListener('scroll', compute, true)
    }
  }, [open, compute])

  const { mounted, ref } = usePresence<HTMLDivElement>(open, {
    enter: (el) =>
      gsap.fromTo(
        el,
        { opacity: 0, scale: 0.94, y: pos.up ? 8 : -8, filter: 'blur(4px)' },
        { opacity: 1, scale: 1, y: 0, filter: 'blur(0px)', duration: 0.4, ease: 'volt.out', clearProps: 'filter' },
      ),
    exit: (el) => gsap.to(el, { opacity: 0, scale: 0.96, y: pos.up ? 4 : -4, duration: 0.15, ease: 'power2.in' }),
  })

  useClickOutside([anchor, ref], () => setOpen(false), open)
  const close = useCallback(() => setOpen(false), [setOpen])
  const toggle = useCallback(() => setOpen(!open), [open, setOpen])

  return (
    <>
      <div ref={anchor} className="inline-flex">
        {trigger({ open, toggle })}
      </div>
      {mounted &&
        createPortal(
          <div
            ref={ref}
            className={cn('popover fixed z-[90] overflow-hidden', className)}
            style={{
              top: pos.top,
              bottom: pos.bottom,
              left: pos.left,
              width: pos.w,
              transformOrigin: `${pos.originX}px ${pos.up ? '100%' : '0%'}`,
            }}
          >
            {typeof children === 'function' ? children({ close }) : children}
          </div>,
          document.body,
        )}
    </>
  )
}

export function MenuItem({
  icon,
  children,
  hint,
  onClick,
  danger,
  active,
}: {
  icon?: ReactNode
  children: ReactNode
  hint?: ReactNode
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void
  danger?: boolean
  active?: boolean
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-[13px] transition-colors [&>svg]:size-4 [&>svg]:shrink-0',
        danger ? 'text-danger hover:bg-danger/10' : 'text-fg hover:bg-surface-3',
        active && 'bg-surface-3',
      )}
    >
      {icon}
      <span className="min-w-0 flex-1 truncate">{children}</span>
      {hint && <span className="text-[11.5px] text-faint">{hint}</span>}
    </button>
  )
}
