import type { ReactNode } from 'react'
import { ChevronDown } from 'lucide-react'
import { cn } from '@/lib/cn'

/**
 * Group label. When the rail is collapsed it turns into a short divider.
 * Collapsible groups get a rotating chevron.
 */
export function SectionHeader({
  label,
  expanded,
  folded,
  onToggle,
  meta,
  action,
}: {
  label: string
  expanded: boolean
  folded?: boolean
  onToggle?: () => void
  meta?: ReactNode
  action?: ReactNode
}) {
  return (
    <div className="relative flex h-7 items-center" data-side-item>
      <span
        aria-hidden
        className={cn(
          'absolute top-1/2 left-1/2 h-px w-5 -translate-x-1/2 rounded-full bg-line-strong transition-opacity duration-300',
          expanded ? 'opacity-0' : 'opacity-100',
        )}
      />
      <div className={cn('flex w-full items-center gap-1.5 pr-1 pl-2.5 transition-opacity duration-200', expanded ? 'opacity-100' : 'pointer-events-none opacity-0')}>
        {onToggle ? (
          <button
            type="button"
            onClick={onToggle}
            aria-expanded={!folded}
            className="group/sh flex min-w-0 flex-1 items-center gap-1.5 text-left"
          >
            <span className="eyebrow truncate transition-colors group-hover/sh:text-muted">{label}</span>
            <ChevronDown className={cn('size-3 shrink-0 text-faint opacity-0 transition-all duration-300 group-hover/sh:opacity-100', folded && '-rotate-90 opacity-100')} />
          </button>
        ) : (
          <span className="eyebrow min-w-0 flex-1 truncate">{label}</span>
        )}
        {meta}
        {action}
      </div>
    </div>
  )
}
