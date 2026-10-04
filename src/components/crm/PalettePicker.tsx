import { Check, Moon, Sun, MonitorSmartphone } from 'lucide-react'
import { modes, palettes, getMode, resolvePalette, type ModeId } from '@/config/themes'
import { useTheme } from '@/store/theme'
import { SegmentedControl } from '@/components/ui/SegmentedControl'
import { cn } from '@/lib/cn'

const modeIcon: Record<ModeId, React.ReactNode> = {
  dark: <Moon />,
  midnight: <MonitorSmartphone />,
  light: <Sun />,
}

/** Compact theme picker for the topbar. The full version lives in Settings → Appearance. */
export function PalettePicker({ onPicked }: { onPicked?: () => void }) {
  const { mode, palette, setMode, setPalette } = useTheme()
  const m = getMode(mode)
  return (
    <div className="p-3">
      <div className="mb-3 flex items-center justify-between">
        <span className="eyebrow">Mode</span>
      </div>
      <SegmentedControl
        size="sm"
        className="w-full [&>button]:flex-1"
        value={mode}
        onChange={(v) => setMode(v)}
        options={modes.map((x) => ({ value: x.id, label: x.name, icon: modeIcon[x.id] }))}
      />
      <div className="mt-4 mb-2 flex items-center justify-between">
        <span className="eyebrow">Palette</span>
        <span className="text-[11.5px] text-faint">{palettes.length} themes</span>
      </div>
      <div className="grid grid-cols-2 gap-1.5">
        {palettes.map((p) => {
          const c = resolvePalette(p, m)
          const active = p.id === palette
          return (
            <button
              key={p.id}
              type="button"
              onClick={(e) => {
                setPalette(p.id, { x: e.clientX, y: e.clientY })
                onPicked?.()
              }}
              className={cn(
                'group flex items-center gap-2.5 rounded-lg border p-2 text-left transition-all duration-200',
                active ? 'border-primary/50 bg-primary/10' : 'border-line hover:border-line-strong hover:bg-surface-3',
              )}
            >
              <span className="relative flex size-7 shrink-0 overflow-hidden rounded-full ring-1 ring-line-strong transition-transform duration-300 group-hover:rotate-45">
                <span className="h-full w-1/2" style={{ background: c.primary }} />
                <span className="h-full w-1/2" style={{ background: c.accent }} />
                {active && (
                  <span className="absolute inset-0 flex items-center justify-center bg-black/25">
                    <Check className="size-3.5 text-white" strokeWidth={3} />
                  </span>
                )}
              </span>
              <span className="min-w-0">
                <span className="block text-[12.5px] font-medium text-fg">{p.name}</span>
                <span className="block truncate text-[10.5px] text-faint">{p.description}</span>
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
