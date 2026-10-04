import { Magnet, Handshake, ListChecks, Sparkles, Plus } from 'lucide-react'
import { useUI } from '@/store/ui'
import { Tooltip } from '@/components/ui/Tooltip'
import { cn } from '@/lib/cn'

/** One-tap create buttons. Collapses to a single + in the rail. */
export function QuickActions({ expanded }: { expanded: boolean }) {
  const openQuickCreate = useUI((s) => s.openQuickCreate)
  const setAssistantOpen = useUI((s) => s.setAssistantOpen)
  const actions = [
    { label: 'Lead', icon: Magnet, run: () => openQuickCreate('lead'), color: 'var(--primary)' },
    { label: 'Deal', icon: Handshake, run: () => openQuickCreate('deal'), color: 'var(--c3)' },
    { label: 'Task', icon: ListChecks, run: () => openQuickCreate('task'), color: 'var(--c5)' },
    { label: 'Ask AI', icon: Sparkles, run: () => setAssistantOpen(true), color: 'var(--accent)' },
  ]

  if (!expanded) {
    return (
      <Tooltip side="right" content="Create a lead, deal or task">
        <button
          type="button"
          data-side-item
          onClick={() => openQuickCreate('lead')}
          aria-label="Create"
          className="ml-[6px] flex size-9 items-center justify-center rounded-[10px] bg-primary text-primary-fg shadow-[0_6px_18px_-6px_var(--primary)] transition-transform hover:scale-105 active:scale-95"
        >
          <Plus className="size-[18px]" />
        </button>
      </Tooltip>
    )
  }

  return (
    <div className="grid grid-cols-4 gap-1.5" data-side-item>
      {actions.map((a) => (
        <button
          key={a.label}
          type="button"
          onClick={a.run}
          className={cn(
            'group/qa relative flex h-[52px] flex-col items-center justify-center gap-1 overflow-hidden rounded-[10px] border border-line bg-surface-2/50 text-[10.5px] font-medium text-muted',
            'transition-[transform,border-color,color,background-color] duration-200 hover:-translate-y-0.5 hover:border-line-strong hover:bg-surface-2 hover:text-fg active:translate-y-0',
          )}
        >
          <span
            className="absolute inset-x-2 -bottom-3 h-6 rounded-full opacity-0 blur-lg transition-opacity duration-300 group-hover/qa:opacity-70"
            style={{ background: a.color }}
          />
          <a.icon className="relative size-4 transition-transform duration-300 group-hover/qa:-translate-y-0.5 group-hover/qa:scale-110" style={{ color: a.color }} />
          <span className="relative whitespace-nowrap">{a.label}</span>
        </button>
      ))}
    </div>
  )
}
