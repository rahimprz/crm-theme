import { cn } from '@/lib/cn'

/** Checkbox whose tick draws itself in. */
export function Checkbox({
  checked,
  indeterminate,
  onChange,
  label,
  className,
  round,
}: {
  checked: boolean
  indeterminate?: boolean
  onChange: (next: boolean) => void
  label?: string
  className?: string
  round?: boolean
}) {
  const on = checked || indeterminate
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={indeterminate ? 'mixed' : checked}
      aria-label={label}
      onClick={(e) => {
        e.stopPropagation()
        onChange(!checked)
      }}
      className={cn(
        'relative inline-flex size-[18px] shrink-0 items-center justify-center border transition-all duration-200',
        round ? 'rounded-full' : 'rounded-[6px]',
        on
          ? 'scale-100 border-primary bg-primary shadow-[0_0_12px_-2px_var(--primary)]'
          : 'border-line-strong bg-surface-2 hover:border-faint',
        className,
      )}
    >
      <svg viewBox="0 0 16 16" className="size-3" aria-hidden>
        {indeterminate && !checked ? (
          <path d="M4 8h8" fill="none" strokeWidth="2" strokeLinecap="round" style={{ stroke: 'var(--primary-fg)' }} />
        ) : (
          <path
            d="M3.5 8.5 6.5 11.5 12.5 4.5"
            fill="none"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{
              stroke: 'var(--primary-fg)',
              strokeDasharray: 14,
              strokeDashoffset: checked ? 0 : 14,
              transition: 'stroke-dashoffset 0.3s cubic-bezier(0.16,1,0.3,1) 0.05s',
            }}
          />
        )}
      </svg>
    </button>
  )
}
