import { forwardRef, type InputHTMLAttributes, type ReactNode, type SelectHTMLAttributes, type TextareaHTMLAttributes } from 'react'
import { ChevronDown } from 'lucide-react'
import { cn } from '@/lib/cn'

const field =
  'w-full rounded-lg border border-line bg-surface-2 text-[13.5px] text-fg placeholder:text-faint transition-[border-color,box-shadow,background-color] duration-200 outline-none hover:border-line-strong focus:border-primary/60 focus:bg-surface focus:shadow-[0_0_0_4px_color-mix(in_oklab,var(--primary)_14%,transparent)]'

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement> & { icon?: ReactNode }>(
  function Input({ className, icon, ...rest }, ref) {
    if (!icon) return <input ref={ref} className={cn(field, 'h-10 px-3', className)} {...rest} />
    return (
      <div className="relative">
        <span className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-faint [&_svg]:size-4">{icon}</span>
        <input ref={ref} className={cn(field, 'h-10 pr-3 pl-9', className)} {...rest} />
      </div>
    )
  },
)

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaHTMLAttributes<HTMLTextAreaElement>>(function Textarea(
  { className, ...rest },
  ref,
) {
  return <textarea ref={ref} className={cn(field, 'min-h-24 resize-y px-3 py-2.5', className)} {...rest} />
})

export const Select = forwardRef<HTMLSelectElement, SelectHTMLAttributes<HTMLSelectElement>>(function Select(
  { className, children, ...rest },
  ref,
) {
  return (
    <div className="relative">
      <select ref={ref} className={cn(field, 'h-10 cursor-pointer appearance-none pr-9 pl-3', className)} {...rest}>
        {children}
      </select>
      <ChevronDown className="pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 text-faint" />
    </div>
  )
})

export function Field({ label, hint, children, htmlFor }: { label: string; hint?: string; children: ReactNode; htmlFor?: string }) {
  return (
    <label className="flex flex-col gap-1.5" htmlFor={htmlFor}>
      <span className="text-[12.5px] font-medium text-muted">{label}</span>
      {children}
      {hint && <span className="text-[11.5px] text-faint">{hint}</span>}
    </label>
  )
}
