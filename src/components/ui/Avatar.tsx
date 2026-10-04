import { cn } from '@/lib/cn'
import { initials } from '@/lib/format'

const sizes = {
  xs: 'size-5 text-[9px]',
  sm: 'size-7 text-[10.5px]',
  md: 'size-9 text-[12px]',
  lg: 'size-12 text-[15px]',
  xl: 'size-16 text-[20px]',
} as const

/** Initials avatar with a soft two-tone gradient derived from `hue`. */
export function Avatar({
  name,
  hue = 220,
  size = 'md',
  status,
  className,
  ring,
}: {
  name: string
  hue?: number
  size?: keyof typeof sizes
  status?: 'online' | 'away' | 'offline'
  className?: string
  ring?: boolean
}) {
  return (
    <span
      className={cn('relative inline-flex shrink-0 items-center justify-center rounded-full font-semibold', sizes[size], ring && 'ring-2 ring-surface', className)}
      style={{
        background: `linear-gradient(135deg, oklch(0.72 0.13 ${hue}), oklch(0.52 0.16 ${(hue + 40) % 360}))`,
        color: 'white',
        textShadow: '0 1px 1px rgb(0 0 0 / 0.25)',
      }}
      title={name}
      aria-label={name}
    >
      {initials(name)}
      {status && (
        <span
          className={cn(
            'absolute -right-px -bottom-px size-[30%] min-h-2 min-w-2 rounded-full ring-2 ring-surface',
            status === 'online' ? 'bg-success' : status === 'away' ? 'bg-accent' : 'bg-faint',
          )}
        />
      )}
    </span>
  )
}

export function AvatarStack({
  people,
  max = 3,
  size = 'sm',
}: {
  people: { name: string; hue: number }[]
  max?: number
  size?: keyof typeof sizes
}) {
  const shown = people.slice(0, max)
  const extra = people.length - shown.length
  return (
    <div className="flex -space-x-2">
      {shown.map((p) => (
        <Avatar key={p.name} name={p.name} hue={p.hue} size={size} ring />
      ))}
      {extra > 0 && (
        <span className={cn('inline-flex items-center justify-center rounded-full bg-surface-3 font-medium text-muted ring-2 ring-surface', sizes[size])}>
          +{extra}
        </span>
      )}
    </div>
  )
}
