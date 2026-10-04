import { Zap, X, ArrowUpRight } from 'lucide-react'
import { credits } from '@/config/app'
import { useTheme } from '@/store/theme'
import { toast } from '@/store/toast'
import { Ring } from '@/components/ui/Progress'
import { Tooltip } from '@/components/ui/Tooltip'
import { number } from '@/lib/format'

/** AI usage meter. Dismissible; brought back from Settings → Appearance → Sidebar. */
export function CreditsCard({ expanded }: { expanded: boolean }) {
  const setSection = useTheme((s) => s.setSection)
  const pct = (credits.used / credits.total) * 100

  if (!expanded) {
    return (
      <Tooltip side="right" content={`${credits.label}: ${number(credits.used)} of ${number(credits.total)}`}>
        <span className="ml-[6px] flex size-9 items-center justify-center [@media(max-height:860px)]:hidden" data-side-item>
          <Ring value={pct} size={34} stroke={3}>
            <Zap className="size-3.5 text-accent" />
          </Ring>
        </span>
      </Tooltip>
    )
  }

  return (
    <>
      {/* Slim meter for shorter screens */}
      <button
        type="button"
        data-side-item
        onClick={() => toast.info('Upgrade', 'Plans start at $29 per seat. This is a design preview.')}
        className="group hidden h-10 w-full items-center gap-2.5 rounded-xl border border-line bg-surface-2/50 pr-2.5 pl-[10px] text-left transition-colors hover:border-line-strong [@media(max-height:979px)]:flex"
      >
        <Ring value={pct} size={26} stroke={2.5}>
          <Zap className="size-3 text-accent" />
        </Ring>
        <span className="min-w-0 flex-1">
          <span className="block truncate text-[12px] font-medium whitespace-nowrap text-fg">{credits.label}</span>
          <span className="relative mt-1 block h-1 overflow-hidden rounded-full bg-surface-3">
            <span className="credit-fill absolute inset-y-0 left-0 rounded-full" style={{ width: `${pct}%` }} />
          </span>
        </span>
        <span className="tabular text-[11px] whitespace-nowrap text-muted">{Math.round(pct)}%</span>
      </button>
    <div className="card beam group relative w-full overflow-hidden p-3 [@media(max-height:979px)]:hidden" data-side-item>
      <div className="pointer-events-none absolute -top-10 -right-10 size-28 rounded-full bg-accent/20 blur-2xl transition-opacity duration-500 group-hover:opacity-80" />
      <div className="relative flex items-center gap-2.5">
        <Ring value={pct} size={40} stroke={3.5}>
          <Zap className="size-4 text-accent" />
        </Ring>
        <div className="min-w-0 flex-1">
          <div className="truncate text-[12.5px] font-semibold whitespace-nowrap text-fg">{credits.label}</div>
          <div className="tabular text-[11.5px] whitespace-nowrap text-muted">
            <span className="text-fg">{(credits.used / 1000).toFixed(1)}K</span> of {credits.total / 1000}K · resets in {credits.resetsIn}
          </div>
        </div>
        <button
          type="button"
          onClick={() => {
            setSection('credits', false)
            toast.info('Credits card hidden', 'Turn it back on in Settings → Appearance → Sidebar.')
          }}
          className="-mt-5 -mr-1 flex size-6 items-center justify-center rounded-md text-faint opacity-0 transition-opacity group-hover:opacity-100 hover:bg-surface-3 hover:text-fg"
          aria-label="Hide credits card"
        >
          <X className="size-3.5" />
        </button>
      </div>
      <div className="relative mt-2.5 h-1.5 overflow-hidden rounded-full bg-surface-3">
        <div className="credit-fill absolute inset-y-0 left-0 rounded-full" style={{ width: `${pct}%` }} />
      </div>
      <button
        type="button"
        onClick={() => toast.info('Upgrade', 'Plans start at $29 per seat. This is a design preview.')}
        className="relative mt-2.5 flex items-center gap-1 text-[12px] font-semibold text-primary transition-[gap] hover:gap-1.5"
      >
        Get more credits <ArrowUpRight className="size-3.5" />
      </button>
    </div>
    </>
  )
}
