import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react'
import { cn } from '@/lib/cn'

type Variant = 'primary' | 'accent' | 'secondary' | 'ghost' | 'outline' | 'danger'
type Size = 'sm' | 'md' | 'lg' | 'icon' | 'icon-sm'

const variants: Record<Variant, string> = {
  primary:
    'bg-primary text-primary-fg shadow-[0_1px_0_0_rgb(255_255_255/0.18)_inset,0_6px_20px_-8px_var(--primary)] hover:brightness-110 hover:shadow-[0_1px_0_0_rgb(255_255_255/0.2)_inset,0_10px_28px_-8px_var(--primary)]',
  accent:
    'bg-accent text-accent-fg shadow-[0_1px_0_0_rgb(255_255_255/0.35)_inset,0_6px_20px_-8px_var(--accent)] hover:brightness-105',
  secondary: 'bg-surface-2 text-fg border border-line hover:bg-surface-3 hover:border-line-strong',
  ghost: 'text-muted hover:text-fg hover:bg-surface-2',
  outline: 'border border-line-strong text-fg hover:bg-surface-2 hover:border-faint',
  danger: 'bg-danger/12 text-danger border border-danger/25 hover:bg-danger/20',
}

const sizes: Record<Size, string> = {
  sm: 'h-8 px-3 text-[13px] gap-1.5 rounded-md',
  md: 'h-9 px-3.5 text-[13.5px] gap-2 rounded-lg',
  lg: 'h-11 px-5 text-[14.5px] gap-2 rounded-lg',
  icon: 'h-9 w-9 rounded-lg',
  'icon-sm': 'h-8 w-8 rounded-md',
}

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  size?: Size
  icon?: ReactNode
  iconRight?: ReactNode
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = 'secondary', size = 'md', icon, iconRight, className, children, type = 'button', ...rest },
  ref,
) {
  return (
    <button
      ref={ref}
      type={type}
      className={cn(
        'relative inline-flex shrink-0 select-none items-center justify-center font-medium whitespace-nowrap',
        'transition-[background-color,border-color,color,box-shadow,filter,transform] duration-200 ease-out',
        'active:scale-[0.97] disabled:pointer-events-none disabled:opacity-50',
        '[&_svg]:size-4 [&_svg]:shrink-0',
        variants[variant],
        sizes[size],
        className,
      )}
      {...rest}
    >
      {icon}
      {children}
      {iconRight}
    </button>
  )
})
