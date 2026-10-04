import { forwardRef, type HTMLAttributes, type ReactNode } from 'react'
import { cn } from '@/lib/cn'

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  spotlight?: boolean
  beam?: boolean
}

/** Base surface. `spotlight` adds the cursor-following glow, `beam` a travelling border light. */
export const Card = forwardRef<HTMLDivElement, CardProps>(function Card(
  { spotlight = true, beam, className, children, ...rest },
  ref,
) {
  return (
    <div ref={ref} className={cn('card', spotlight && 'spotlight', beam && 'beam', className)} {...rest}>
      {children}
    </div>
  )
})

export function CardHeader({
  title,
  subtitle,
  icon,
  action,
  className,
}: {
  title: ReactNode
  subtitle?: ReactNode
  icon?: ReactNode
  action?: ReactNode
  className?: string
}) {
  return (
    <div className={cn('flex items-start justify-between gap-3 px-5 pt-5', className)}>
      <div className="flex min-w-0 items-center gap-3">
        {icon && (
          <span className="flex size-8 shrink-0 items-center justify-center rounded-lg border border-line bg-surface-2 text-muted [&_svg]:size-4">
            {icon}
          </span>
        )}
        <div className="min-w-0">
          <h3 className="truncate text-[14.5px] font-semibold tracking-[-0.01em] text-fg">{title}</h3>
          {subtitle && <p className="truncate text-[12.5px] text-muted">{subtitle}</p>}
        </div>
      </div>
      {action && <div className="flex shrink-0 items-center gap-1">{action}</div>}
    </div>
  )
}
