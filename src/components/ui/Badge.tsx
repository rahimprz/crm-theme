import type { ReactNode } from 'react'
import { cn } from '@/lib/cn'

export type Tone = 'neutral' | 'primary' | 'accent' | 'success' | 'warning' | 'danger' | 'c3' | 'c4' | 'c5'

const tones: Record<Tone, string> = {
  neutral: 'bg-surface-3 text-muted border-line-strong',
  primary: 'bg-primary/12 text-primary border-primary/25',
  accent: 'bg-accent/14 text-accent border-accent/30 [:root[data-mode=light]_&]:text-[color-mix(in_oklab,var(--accent)_70%,black)]',
  success: 'bg-success/12 text-success border-success/25',
  warning: 'bg-warning/12 text-warning border-warning/25',
  danger: 'bg-danger/12 text-danger border-danger/25',
  c3: 'bg-c3/12 text-c3 border-c3/25',
  c4: 'bg-c4/12 text-c4 border-c4/25',
  c5: 'bg-c5/12 text-c5 border-c5/25',
}

const dots: Record<Tone, string> = {
  neutral: 'bg-faint',
  primary: 'bg-primary',
  accent: 'bg-accent',
  success: 'bg-success',
  warning: 'bg-warning',
  danger: 'bg-danger',
  c3: 'bg-c3',
  c4: 'bg-c4',
  c5: 'bg-c5',
}

export function Badge({
  tone = 'neutral',
  dot,
  icon,
  children,
  className,
}: {
  tone?: Tone
  dot?: boolean
  icon?: ReactNode
  children: ReactNode
  className?: string
}) {
  return (
    <span
      className={cn(
        'inline-flex h-[22px] items-center gap-1.5 rounded-full border px-2 text-[11.5px] font-medium whitespace-nowrap [&_svg]:size-3',
        tones[tone],
        className,
      )}
    >
      {dot && <span className={cn('size-1.5 rounded-full', dots[tone])} />}
      {icon}
      {children}
    </span>
  )
}
