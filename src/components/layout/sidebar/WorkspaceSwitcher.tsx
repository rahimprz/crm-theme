import { Check, ChevronsUpDown, Plus, UserPlus } from 'lucide-react'
import { workspaces, currentWorkspaceId } from '@/config/app'
import { toast } from '@/store/toast'
import { Popover, MenuItem } from '@/components/ui/Popover'
import { AvatarStack } from '@/components/ui/Avatar'
import { members } from '@/data/mock'
import { cn } from '@/lib/cn'

function Tile({ initials, gradient, size = 32 }: { initials: string; gradient: readonly [string, string]; size?: number }) {
  return (
    <span
      className="relative flex shrink-0 items-center justify-center overflow-hidden rounded-[9px] font-bold text-white shadow-[inset_0_1px_0_rgb(255_255_255/0.3),0_4px_12px_-4px_rgb(0_0_0/0.5)]"
      style={{ width: size, height: size, fontSize: size * 0.36, background: `linear-gradient(135deg, ${gradient[0]}, ${gradient[1]})` }}
    >
      <span className="absolute inset-0 bg-[linear-gradient(160deg,rgb(255_255_255/0.25),transparent_45%)]" />
      <span className="relative">{initials}</span>
    </span>
  )
}

/** Workspace card with plan, seats and a switcher menu. */
export function WorkspaceSwitcher({ expanded }: { expanded: boolean }) {
  const ws = workspaces.find((w) => w.id === currentWorkspaceId) ?? workspaces[0]
  return (
    <Popover
      align="start"
      width={264}
      trigger={({ toggle, open }) => (
        <button
          type="button"
          onClick={toggle}
          data-side-item
          aria-label={`Workspace: ${ws.name}`}
          className={cn(
            'group relative flex h-12 w-full items-center gap-2.5 rounded-xl border p-1.5 pr-2 text-left transition-[background-color,border-color] duration-200',
            expanded ? 'border-line bg-surface-2/70 hover:border-line-strong hover:bg-surface-2' : 'border-transparent pl-[8px]',
            open && 'border-primary/40',
          )}
        >
          <Tile initials={ws.initials} gradient={ws.gradient} />
          <span className={cn('min-w-0 flex-1 transition-opacity duration-200', expanded ? 'opacity-100' : 'opacity-0')}>
            <span className="block truncate text-[13px] font-semibold whitespace-nowrap text-fg">{ws.name}</span>
            <span className="flex items-center gap-1.5 text-[11px] whitespace-nowrap text-faint">
              <span className="rounded-[4px] bg-accent/15 px-1 py-px text-[9.5px] font-bold tracking-wide text-accent uppercase">{ws.plan}</span>
              {ws.seats} seats
            </span>
          </span>
          <ChevronsUpDown className={cn('size-4 shrink-0 text-faint transition-all group-hover:text-muted', expanded ? 'opacity-100' : 'opacity-0')} />
        </button>
      )}
    >
      {({ close }) => (
        <div className="p-1.5">
          <div className="flex items-center justify-between px-2.5 pt-1.5 pb-2">
            <span className="eyebrow">Workspaces</span>
            <AvatarStack size="xs" people={members.slice(0, 4).map((m) => ({ name: m.name, hue: m.hue }))} max={4} />
          </div>
          {workspaces.map((w) => (
            <button
              key={w.id}
              type="button"
              onClick={() => {
                close()
                if (w.id !== ws.id) toast.info(`Switched to ${w.name}`, 'Demo only: data stays the same.')
              }}
              className="flex w-full items-center gap-2.5 rounded-lg px-2 py-2 text-left hover:bg-surface-3"
            >
              <Tile initials={w.initials} gradient={w.gradient} size={28} />
              <span className="min-w-0 flex-1">
                <span className="block truncate text-[13px] font-medium text-fg">{w.name}</span>
                <span className="block text-[11px] text-faint">{w.plan} · {w.seats} seats</span>
              </span>
              {w.id === ws.id && <Check className="size-4 text-primary" />}
            </button>
          ))}
          <div className="my-1 h-px bg-line" />
          <MenuItem icon={<UserPlus />} onClick={() => { close(); toast.info('Invite teammates', 'Send invites from Settings → Workspace.') }}>
            Invite people
          </MenuItem>
          <MenuItem icon={<Plus />} onClick={() => { close(); toast.info('Create workspace', 'This is a design preview.') }}>
            New workspace
          </MenuItem>
        </div>
      )}
    </Popover>
  )
}
