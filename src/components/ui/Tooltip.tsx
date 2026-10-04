import { useRef, useState, type ReactNode } from 'react'
import { createPortal } from 'react-dom'

/** Lightweight hover tooltip rendered in a portal (never clipped). */
export function Tooltip({
  content,
  children,
  side = 'top',
  disabled,
  className,
}: {
  content: ReactNode
  children: ReactNode
  side?: 'top' | 'right' | 'bottom'
  disabled?: boolean
  /** Classes for the wrapper (e.g. "flex w-full" to let the trigger stretch). */
  className?: string
}) {
  const ref = useRef<HTMLSpanElement>(null)
  const timer = useRef<number>(0)
  const [pos, setPos] = useState<{ x: number; y: number } | null>(null)

  const show = () => {
    if (disabled) return
    window.clearTimeout(timer.current)
    timer.current = window.setTimeout(() => {
      const r = ref.current?.getBoundingClientRect()
      if (!r) return
      if (side === 'right') setPos({ x: r.right + 10, y: r.top + r.height / 2 })
      else if (side === 'bottom') setPos({ x: r.left + r.width / 2, y: r.bottom + 8 })
      else setPos({ x: r.left + r.width / 2, y: r.top - 8 })
    }, 180)
  }
  const hide = () => {
    window.clearTimeout(timer.current)
    setPos(null)
  }

  return (
    <span ref={ref} className={className ?? 'inline-flex'} onMouseEnter={show} onMouseLeave={hide} onFocus={show} onBlur={hide}>
      {children}
      {pos &&
        createPortal(
          <span
            role="tooltip"
            className="tooltip-in pointer-events-none fixed z-[120] rounded-md border border-line-strong bg-surface-3 px-2 py-1 text-[12px] font-medium whitespace-nowrap text-fg shadow-[var(--shadow-pop)]"
            style={{
              left: pos.x,
              top: pos.y,
              translate: side === 'right' ? '0 -50%' : side === 'bottom' ? '-50% 0' : '-50% -100%',
            }}
          >
            {content}
          </span>,
          document.body,
        )}
    </span>
  )
}
