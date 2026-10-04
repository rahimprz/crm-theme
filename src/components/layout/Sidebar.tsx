import { useLayoutEffect, useRef } from 'react'
import { NavLink, useLocation, useNavigate } from 'react-router-dom'
import { Search, PanelLeftClose, PanelLeftOpen, ChevronsUpDown, Check, Plus, Zap, LogOut, UserRound, Keyboard, Star } from 'lucide-react'
import { navigation, settingsItem, findNavItem, type NavItem } from '@/config/navigation'
import { useTheme } from '@/store/theme'
import { useUI } from '@/store/ui'
import { useCrm, currentUser } from '@/store/crm'
import { toast } from '@/store/toast'
import { gsap, useGSAP, reducedMotion } from '@/lib/gsap'
import { Logo } from '@/components/crm/Logo'
import { Avatar } from '@/components/ui/Avatar'
import { CompanyLogo } from '@/components/ui/CompanyLogo'
import { Tooltip } from '@/components/ui/Tooltip'
import { Popover, MenuItem } from '@/components/ui/Popover'
import { Progress } from '@/components/ui/Progress'
import { Kbd } from '@/components/ui/Kbd'
import { cn } from '@/lib/cn'

function useBadges() {
  const emails = useCrm((s) => s.emails)
  const tasks = useCrm((s) => s.tasks)
  const leads = useCrm((s) => s.leads)
  return {
    inbox: emails.filter((e) => e.unread && e.folder === 'inbox').length,
    tasks: tasks.filter((t) => !t.done).length,
    leads: leads.filter((l) => l.status === 'new').length,
  }
}

function NavRow({ item, collapsed, badge, onNavigate, solid }: { item: NavItem; collapsed: boolean; badge?: number; onNavigate?: () => void; solid?: boolean }) {
  const Icon = item.icon
  const link = (
    <NavLink
      to={item.path}
      end={item.path === '/'}
      data-nav={item.id}
      onClick={onNavigate}
      className={({ isActive }) =>
        cn(
          'group relative z-[1] flex h-9 items-center gap-3 rounded-lg text-[13.5px] font-medium transition-colors duration-200',
          collapsed ? 'w-10 justify-center' : 'px-2.5',
          isActive ? 'text-fg' : 'text-muted hover:text-fg',
          solid && isActive && 'bg-surface-3',
        )
      }
    >
      {({ isActive }) => (
        <>
          <Icon className={cn('size-[18px] shrink-0 transition-colors', isActive ? 'text-primary' : 'text-faint group-hover:text-muted')} />
          {!collapsed && <span className="flex-1 truncate">{item.label}</span>}
          {!collapsed && badge ? (
            <span className={cn('tabular rounded-full px-1.5 text-[11px] font-semibold', isActive ? 'bg-primary text-primary-fg' : 'bg-surface-3 text-muted')}>{badge}</span>
          ) : null}
          {collapsed && badge ? <span className="absolute top-1.5 right-1.5 size-1.5 rounded-full bg-accent shadow-[0_0_6px_var(--accent)]" /> : null}
        </>
      )}
    </NavLink>
  )
  return collapsed ? (
    <Tooltip content={item.label} side="right">
      {link}
    </Tooltip>
  ) : (
    link
  )
}

/**
 * App navigation. A glowing pill glides to the active page, the rail
 * collapses to icons, and on phones it opens as a drawer.
 */
export function Sidebar({ mobile, onNavigate }: { mobile?: boolean; onNavigate?: () => void }) {
  const storeCollapsed = useTheme((s) => s.sidebarCollapsed)
  const toggleSidebar = useTheme((s) => s.toggleSidebar)
  const collapsed = !mobile && storeCollapsed
  const setCommandOpen = useUI((s) => s.setCommandOpen)
  const companies = useCrm((s) => s.companies)
  const contacts = useCrm((s) => s.contacts)
  const badges = useBadges()
  const location = useLocation()
  const navigate = useNavigate()
  const root = useRef<HTMLElement>(null)
  const pill = useRef<HTMLSpanElement>(null)
  const firstMove = useRef(true)

  const favorites = [
    ...companies.filter((c) => c.favorite).map((c) => ({ id: c.id, label: c.name, path: `/companies/${c.id}`, icon: <CompanyLogo shape={c.logo} color={c.color} size="xs" /> })),
    ...contacts.filter((c) => c.favorite).map((c) => ({ id: c.id, label: `${c.firstName} ${c.lastName}`, path: `/contacts/${c.id}`, icon: <Avatar name={`${c.firstName} ${c.lastName}`} hue={c.hue} size="xs" /> })),
  ].slice(0, 5)

  // Glide the active pill to the current page.
  useLayoutEffect(() => {
    const move = (instant: boolean) => {
      const active = findNavItem(location.pathname)
      const el = active ? root.current?.querySelector<HTMLElement>(`nav [data-nav="${active.id}"]`) : null
      if (!pill.current) return
      if (!el) {
        gsap.to(pill.current, { opacity: 0, duration: 0.2 })
        return
      }
      const parent = pill.current.offsetParent as HTMLElement | null
      const r = el.getBoundingClientRect()
      const pr = parent?.getBoundingClientRect() ?? { top: 0, left: 0 }
      gsap.to(pill.current, {
        y: r.top - pr.top + (parent?.scrollTop ?? 0),
        x: r.left - pr.left,
        width: r.width,
        height: r.height,
        opacity: 1,
        duration: instant || reducedMotion() ? 0 : 0.55,
        ease: 'volt.out',
      })
    }
    move(firstMove.current)
    firstMove.current = false
    // Re-measure once the collapse/expand width transition has finished.
    const t = window.setTimeout(() => move(false), 520)
    return () => window.clearTimeout(t)
  }, [location.pathname, collapsed, favorites.length])

  useGSAP(
    () => {
      if (reducedMotion() || mobile) return
      gsap.from('[data-side-item]', { opacity: 0, x: -14, duration: 0.6, stagger: 0.03, delay: 0.1, ease: 'volt.out' })
    },
    { scope: root },
  )

  return (
    <aside
      ref={root}
      className={cn(
        'flex h-full flex-col gap-4 overflow-hidden border-line bg-surface/70 py-4 transition-[width] duration-500 ease-[var(--ease-out-volt)]',
        mobile ? 'w-full' : 'border-r backdrop-blur-xl',
        collapsed ? 'w-[76px] items-center px-3' : mobile ? 'px-4' : 'w-[264px] px-4',
      )}
    >
      <div className={cn('flex items-center', collapsed ? 'flex-col gap-3' : 'justify-between')} data-side-item>
        <Logo collapsed={collapsed} />
        {!mobile && (
          <Tooltip content={collapsed ? 'Expand sidebar  [' : 'Collapse sidebar  ['} side="right">
            <button type="button" onClick={toggleSidebar} className="flex size-8 items-center justify-center rounded-lg text-faint transition-colors hover:bg-surface-3 hover:text-fg" aria-label="Toggle sidebar">
              {collapsed ? <PanelLeftOpen className="size-4" /> : <PanelLeftClose className="size-4" />}
            </button>
          </Tooltip>
        )}
      </div>

      {!collapsed && (
        <Popover
          align="start"
          width={240}
          trigger={({ toggle }) => (
            <button type="button" onClick={toggle} data-side-item className="flex w-[232px] items-center gap-2.5 rounded-lg border border-line bg-surface-2 p-2 text-left transition-colors hover:border-line-strong">
              <span className="flex size-8 items-center justify-center rounded-md bg-gradient-to-br from-c3 to-primary text-[12px] font-bold text-white">LL</span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-[13px] font-semibold text-fg">Lumen Labs</span>
                <span className="block text-[11.5px] text-faint">Pro plan · 6 seats</span>
              </span>
              <ChevronsUpDown className="size-4 text-faint" />
            </button>
          )}
        >
          {({ close }) => (
            <div className="p-1.5">
              <div className="eyebrow px-2.5 pt-1.5 pb-1">Workspaces</div>
              <MenuItem icon={<span className="flex size-5 items-center justify-center rounded bg-gradient-to-br from-c3 to-primary text-[9px] font-bold text-white">LL</span>} hint={<Check className="size-3.5 text-primary" />} onClick={close}>
                Lumen Labs
              </MenuItem>
              <MenuItem icon={<span className="flex size-5 items-center justify-center rounded bg-gradient-to-br from-accent to-c4 text-[9px] font-bold text-black">VS</span>} onClick={() => { close(); toast.info('Switched workspace', 'Volt Sandbox (demo)') }}>
                Volt Sandbox
              </MenuItem>
              <div className="my-1 h-px bg-line" />
              <MenuItem icon={<Plus />} onClick={() => { close(); toast.info('Create workspace', 'This is a design preview.') }}>
                New workspace
              </MenuItem>
            </div>
          )}
        </Popover>
      )}

      <button
        type="button"
        data-side-item
        onClick={() => setCommandOpen(true)}
        className={cn(
          'flex h-9 shrink-0 items-center gap-2.5 rounded-lg border border-line bg-surface-2/60 text-[13px] text-faint transition-colors hover:border-line-strong hover:text-muted',
          collapsed ? 'w-10 justify-center' : 'w-[232px] px-2.5',
          mobile && 'w-full',
        )}
        aria-label="Search"
      >
        <Search className="size-4" />
        {!collapsed && (
          <>
            <span className="flex-1 text-left">Search…</span>
            <Kbd>⌘K</Kbd>
          </>
        )}
      </button>

      <nav className="no-scrollbar relative -mx-1 flex-1 overflow-y-auto px-1 pb-4 [mask-image:linear-gradient(to_bottom,black_calc(100%-28px),transparent)]">
        <span
          ref={pill}
          aria-hidden
          className="pointer-events-none absolute top-0 left-0 rounded-lg border border-line-strong bg-surface-3 opacity-0 shadow-[inset_0_1px_0_rgb(255_255_255/0.04)]"
        >
          <span className="absolute top-1/2 -left-[5px] h-4 w-[3px] -translate-y-1/2 rounded-full bg-primary shadow-[0_0_12px_var(--primary)]" />
        </span>
        {navigation.map((group) => (
          <div key={group.label} className="mb-4">
            {!collapsed ? (
              <div className="eyebrow mb-1.5 px-2.5" data-side-item>
                {group.label}
              </div>
            ) : (
              <div className="mx-auto mb-2 h-px w-6 bg-line" />
            )}
            <div className={cn('flex flex-col gap-0.5', collapsed && 'items-center')}>
              {group.items.map((item) => (
                <div key={item.id} data-side-item>
                  <NavRow item={item} collapsed={collapsed} badge={item.badge ? badges[item.badge] : undefined} onNavigate={onNavigate} />
                </div>
              ))}
            </div>
          </div>
        ))}

        {!collapsed && favorites.length > 0 && (
          <div className="mb-4" data-side-item>
            <div className="eyebrow mb-1.5 flex items-center gap-1.5 px-2.5">
              <Star className="size-3" /> Favorites
            </div>
            {favorites.map((f) => (
              <button
                key={f.id}
                type="button"
                onClick={() => {
                  navigate(f.path)
                  onNavigate?.()
                }}
                className={cn(
                  'flex h-8 w-full items-center gap-2.5 rounded-lg px-2.5 text-[13px] transition-colors hover:bg-surface-2',
                  location.pathname === f.path ? 'text-fg' : 'text-muted',
                )}
              >
                {f.icon}
                <span className="truncate">{f.label}</span>
              </button>
            ))}
          </div>
        )}
      </nav>

      {!collapsed && (
        <div className="card beam w-full shrink-0 overflow-hidden p-3.5 [@media(max-height:940px)]:hidden" data-side-item>
          <div className="flex items-center gap-2">
            <span className="flex size-7 items-center justify-center rounded-lg bg-accent/15 text-accent">
              <Zap className="size-4" />
            </span>
            <span className="text-[13px] font-semibold text-fg">Volt AI credits</span>
          </div>
          <p className="mt-2 text-[12px] text-muted">6,800 of 10,000 used this month</p>
          <Progress value={68} className="mt-2.5" gradient height={5} />
          <button type="button" onClick={() => toast.info('Upgrade', 'Plans start at $29 per seat. This is a design preview.')} className="mt-3 text-[12px] font-semibold text-primary hover:underline">
            Get more credits →
          </button>
        </div>
      )}

      <div className={cn('flex shrink-0 flex-col gap-0.5', collapsed && 'items-center')} data-side-item>
        <NavRow item={settingsItem} collapsed={collapsed} onNavigate={onNavigate} solid />
        <Popover
          align="start"
          width={240}
          trigger={({ toggle }) => (
            <button
              type="button"
              onClick={toggle}
              className={cn('flex items-center gap-2.5 rounded-lg p-1.5 text-left transition-colors hover:bg-surface-2', collapsed ? 'justify-center' : 'w-[232px]', mobile && 'w-full')}
            >
              <Avatar name={currentUser.name} hue={currentUser.hue} size="sm" status="online" />
              {!collapsed && (
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[13px] font-medium text-fg">{currentUser.name}</span>
                  <span className="block truncate text-[11.5px] text-faint">{currentUser.role}</span>
                </span>
              )}
            </button>
          )}
        >
          {({ close }) => (
            <div className="p-1.5">
              <div className="flex items-center gap-2.5 px-2.5 py-2">
                <Avatar name={currentUser.name} hue={currentUser.hue} size="md" status="online" />
                <div className="min-w-0">
                  <div className="truncate text-[13px] font-semibold text-fg">{currentUser.name}</div>
                  <div className="truncate text-[12px] text-faint">{currentUser.email}</div>
                </div>
              </div>
              <div className="my-1 h-px bg-line" />
              <MenuItem icon={<UserRound />} onClick={() => { close(); navigate('/settings'); onNavigate?.() }}>
                Profile & settings
              </MenuItem>
              <MenuItem icon={<Keyboard />} hint="?" onClick={() => { close(); setCommandOpen(true) }}>
                Keyboard shortcuts
              </MenuItem>
              <div className="my-1 h-px bg-line" />
              <MenuItem icon={<LogOut />} danger onClick={() => { close(); toast.info('Signed out', 'Just kidding, this is a design preview.') }}>
                Sign out
              </MenuItem>
            </div>
          )}
        </Popover>
      </div>
    </aside>
  )
}
