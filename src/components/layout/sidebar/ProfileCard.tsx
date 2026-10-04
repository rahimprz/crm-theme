import { useLocation, useNavigate } from 'react-router-dom'
import { Check, Keyboard, LogOut, UserRound, Moon, Sun, Settings, LifeBuoy } from 'lucide-react'
import { useTheme, type Status } from '@/store/theme'
import { useUI } from '@/store/ui'
import { currentUser } from '@/store/crm'
import { toast } from '@/store/toast'
import { getMode } from '@/config/themes'
import { Popover, MenuItem } from '@/components/ui/Popover'
import { Avatar } from '@/components/ui/Avatar'
import { Tooltip } from '@/components/ui/Tooltip'
import { cn } from '@/lib/cn'

const statusMeta: Record<Status, { label: string; dot: string; avatar: 'online' | 'away' | 'offline' }> = {
  online: { label: 'Online', dot: 'bg-success', avatar: 'online' },
  away: { label: 'Away', dot: 'bg-accent', avatar: 'away' },
  dnd: { label: 'Do not disturb', dot: 'bg-danger', avatar: 'offline' },
}

/** Settings and light/dark switch. A column in the rail, a compact pair beside the profile otherwise. */
export function FooterTools({ expanded, onNavigate }: { expanded: boolean; onNavigate?: () => void }) {
  const navigate = useNavigate()
  const onSettings = useLocation().pathname.startsWith('/settings')
  const mode = useTheme((s) => s.mode)
  const toggleMode = useTheme((s) => s.toggleMode)
  const dark = getMode(mode).isDark
  const btn = 'flex size-9 shrink-0 items-center justify-center rounded-[10px] text-faint transition-colors hover:bg-surface-3 hover:text-fg [&_svg]:size-[17px]'
  const side = expanded ? 'top' : 'right'
  return (
    <div className={cn('flex items-center', expanded ? 'gap-0.5' : 'ml-[6px] flex-col gap-1')} data-side-item>
      <Tooltip side={side} content={dark ? 'Light mode  ⇧D' : 'Dark mode  ⇧D'}>
        <button type="button" className={btn} onClick={(e) => toggleMode({ x: e.clientX, y: e.clientY })} aria-label="Toggle light and dark mode">
          <span className="relative size-[17px]">
            <Sun className={cn('absolute inset-0 transition-all duration-500', dark ? 'scale-50 rotate-90 opacity-0' : 'scale-100 rotate-0 text-accent opacity-100')} />
            <Moon className={cn('absolute inset-0 transition-all duration-500', dark ? 'scale-100 rotate-0 opacity-100' : 'scale-50 -rotate-90 opacity-0')} />
          </span>
        </button>
      </Tooltip>
      <Tooltip side={side} content="Settings  G S">
        <button
          type="button"
          onClick={() => {
            navigate('/settings')
            onNavigate?.()
          }}
          className={cn(btn, 'group/set', onSettings && 'bg-primary/15 text-primary shadow-[inset_0_0_0_1px_color-mix(in_oklab,var(--primary)_35%,transparent)] hover:bg-primary/20 hover:text-primary')}
          aria-label="Settings"
          aria-current={onSettings ? 'page' : undefined}
        >
          <Settings className="transition-transform duration-700 group-hover/set:rotate-90" />
        </button>
      </Tooltip>
    </div>
  )
}

/** Your profile with a presence status picker. */
export function ProfileCard({ expanded, onNavigate }: { expanded: boolean; onNavigate?: () => void }) {
  if (!expanded) {
    return (
      <>
        <FooterTools expanded={false} onNavigate={onNavigate} />
        <ProfileButton expanded={false} onNavigate={onNavigate} />
      </>
    )
  }
  return (
    <div className="flex items-center gap-1 rounded-xl border border-line bg-surface-2/50 p-0.5 pr-1 transition-colors hover:border-line-strong" data-side-item>
      <div className="min-w-0 flex-1">
        <ProfileButton expanded onNavigate={onNavigate} />
      </div>
      <FooterTools expanded onNavigate={onNavigate} />
    </div>
  )
}

function ProfileButton({ expanded, onNavigate }: { expanded: boolean; onNavigate?: () => void }) {
  const navigate = useNavigate()
  const status = useTheme((s) => s.status)
  const setStatus = useTheme((s) => s.setStatus)
  const setCommandOpen = useUI((s) => s.setCommandOpen)
  const st = statusMeta[status]
  return (
    <Popover
      align="start"
      width={260}
      trigger={({ toggle, open }) => (
        <button
          type="button"
          onClick={toggle}
          aria-label="Your profile"
          className={cn(
            'group flex h-11 w-full items-center gap-2.5 rounded-[10px] p-1.5 pl-[8px] text-left transition-colors duration-200 hover:bg-surface-3/70',
            open && 'bg-surface-3/70',
          )}
        >
          <Avatar name={currentUser.name} hue={currentUser.hue} size="sm" status={st.avatar} />
          <span className={cn('min-w-0 flex-1 transition-opacity duration-200', expanded ? 'opacity-100' : 'opacity-0')}>
            <span className="block truncate text-[13px] font-semibold whitespace-nowrap text-fg">{currentUser.name}</span>
            <span className="flex items-center gap-1.5 text-[11px] whitespace-nowrap text-faint">
              <span className={cn('size-1.5 rounded-full', st.dot)} />
              {st.label}
            </span>
          </span>
        </button>
      )}
    >
      {({ close }) => (
        <div className="p-1.5">
          <div className="flex items-center gap-2.5 px-2.5 py-2">
            <Avatar name={currentUser.name} hue={currentUser.hue} size="md" status={st.avatar} />
            <div className="min-w-0">
              <div className="truncate text-[13px] font-semibold text-fg">{currentUser.name}</div>
              <div className="truncate text-[12px] text-faint">{currentUser.email}</div>
            </div>
          </div>
          <div className="eyebrow px-2.5 pt-2 pb-1">Status</div>
          {(Object.keys(statusMeta) as Status[]).map((s) => (
            <MenuItem
              key={s}
              icon={<span className={cn('ml-1 size-2 rounded-full', statusMeta[s].dot)} />}
              hint={status === s ? <Check className="size-3.5 text-primary" /> : undefined}
              onClick={() => {
                setStatus(s)
                toast.success(`Status set to ${statusMeta[s].label}`)
                close()
              }}
            >
              {statusMeta[s].label}
            </MenuItem>
          ))}
          <div className="my-1 h-px bg-line" />
          <MenuItem icon={<UserRound />} onClick={() => { close(); navigate('/settings'); onNavigate?.() }}>
            Profile & settings
          </MenuItem>
          <MenuItem icon={<Keyboard />} hint="⌘K" onClick={() => { close(); setCommandOpen(true) }}>
            Command palette
          </MenuItem>
          <MenuItem icon={<LifeBuoy />} onClick={() => { close(); toast.info('Help center', 'Guides live in the README. Press ⌘K to find anything.') }}>
            Help & docs
          </MenuItem>
          <div className="my-1 h-px bg-line" />
          <MenuItem icon={<LogOut />} danger onClick={() => { close(); toast.info('Signed out', 'Just kidding, this is a design preview.') }}>
            Sign out
          </MenuItem>
        </div>
      )}
    </Popover>
  )
}
