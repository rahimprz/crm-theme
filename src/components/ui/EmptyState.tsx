import type { ReactNode } from 'react'

export function EmptyState({ icon, title, description, action }: { icon: ReactNode; title: string; description?: string; action?: ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 px-6 py-14 text-center">
      <span className="relative flex size-14 items-center justify-center rounded-2xl border border-line-strong bg-surface-2 text-muted [&_svg]:size-6">
        <span className="absolute inset-0 rounded-2xl bg-primary/10 blur-xl" />
        {icon}
      </span>
      <div>
        <h3 className="text-[15px] font-semibold text-fg">{title}</h3>
        {description && <p className="mx-auto mt-1 max-w-sm text-[13px] text-muted">{description}</p>}
      </div>
      {action}
    </div>
  )
}
