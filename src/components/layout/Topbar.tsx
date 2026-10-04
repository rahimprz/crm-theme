import { useEffect, useRef } from 'react'
import { useLocation, Link } from 'react-router-dom'
import { Search, Bell, Plus, Menu, Palette, ChevronRight } from 'lucide-react'
import { findNavItem } from '@/config/navigation'
import { useUI } from '@/store/ui'
import { useCrm } from '@/store/crm'
import { gsap, reducedMotion } from '@/lib/gsap'
import { useMagnetic } from '@/hooks/useMagnetic'
import { Button } from '@/components/ui/Button'
import { ThemeToggle } from '@/components/ui/ThemeToggle'
import { Popover } from '@/components/ui/Popover'
import { Tooltip } from '@/components/ui/Tooltip'
import { Kbd } from '@/components/ui/Kbd'
import { NotificationsPanel } from '@/components/crm/NotificationsPanel'
import { PalettePicker } from '@/components/crm/PalettePicker'
import { cn } from '@/lib/cn'

function Breadcrumb() {
  const { pathname } = useLocation()
  const companies = useCrm((s) => s.companies)
  const contacts = useCrm((s) => s.contacts)
  const item = findNavItem(pathname)
  const [, section, id] = pathname.split('/')
  let record: string | undefined
  if (id && section === 'companies') record = companies.find((c) => c.id === id)?.name
  if (id && section === 'contacts') {
    const c = contacts.find((x) => x.id === id)
    record = c ? `${c.firstName} ${c.lastName}` : undefined
  }
  const Icon = item?.icon
  return (
    <nav aria-label="Breadcrumb" className="flex min-w-0 items-center gap-2 text-[13.5px]">
      {Icon && (
        <span className="hidden size-7 shrink-0 items-center justify-center rounded-lg border border-line bg-surface-2 text-primary sm:flex">
          <Icon className="size-4" />
        </span>
      )}
      {record ? (
        <>
          <Link to={item?.path ?? '/'} className="shrink-0 text-muted hover:text-fg">
            {item?.label}
          </Link>
          <ChevronRight className="size-3.5 shrink-0 text-faint" />
          <span className="truncate font-medium text-fg">{record}</span>
        </>
      ) : (
        <span className="truncate font-medium text-fg">{item?.label ?? 'Volt'}</span>
      )}
    </nav>
  )
}

/** Thin electric bar that sweeps across under the topbar on every page change. */
function RouteProgress() {
  const { pathname } = useLocation()
  const bar = useRef<HTMLSpanElement>(null)
  const first = useRef(true)
  useEffect(() => {
    if (first.current) {
      first.current = false
      return
    }
    if (!bar.current || reducedMotion()) return
    gsap
      .timeline()
      .set(bar.current, { scaleX: 0, opacity: 1, transformOrigin: '0% 50%' })
      .to(bar.current, { scaleX: 0.7, duration: 0.35, ease: 'power2.out' })
      .to(bar.current, { scaleX: 1, duration: 0.25, ease: 'power1.in' })
      .to(bar.current, { opacity: 0, duration: 0.3 })
  }, [pathname])
  return (
    <span
      ref={bar}
      aria-hidden
      className="pointer-events-none absolute inset-x-0 -bottom-px h-[2px] opacity-0"
      style={{ background: 'linear-gradient(90deg, var(--primary), var(--accent))', boxShadow: '0 0 12px var(--primary)' }}
    />
  )
}

function NotificationBell() {
  const unread = useCrm((s) => s.notifications.filter((n) => !n.read).length)
  const bell = useRef<SVGSVGElement>(null)
  // Ring the bell when it loads with unread items.
  useEffect(() => {
    if (!unread || reducedMotion() || !bell.current) return
    gsap.fromTo(bell.current, { rotate: 0 }, { keyframes: { rotate: [0, 18, -14, 10, -6, 0] }, duration: 0.9, delay: 1.2, ease: 'power1.inOut', transformOrigin: '50% 10%' })
  }, [unread > 0])
  return (
    <Popover
      width={380}
      trigger={({ toggle, open }) => (
        <Tooltip content="Notifications" side="bottom">
          <button
            type="button"
            onClick={toggle}
            className={cn('relative flex size-9 items-center justify-center rounded-lg text-muted transition-colors hover:bg-surface-2 hover:text-fg', open && 'bg-surface-2 text-fg')}
            aria-label={`Notifications, ${unread} unread`}
          >
            <Bell ref={bell} className="size-[18px]" />
            {unread > 0 && (
              <span className="tabular absolute top-1 right-1 flex min-w-4 items-center justify-center rounded-full bg-accent px-1 text-[10px] leading-4 font-bold text-accent-fg ring-2 ring-bg">
                {unread}
              </span>
            )}
          </button>
        </Tooltip>
      )}
    >
      <NotificationsPanel />
    </Popover>
  )
}

export function Topbar() {
  const setCommandOpen = useUI((s) => s.setCommandOpen)
  const openQuickCreate = useUI((s) => s.openQuickCreate)
  const setMobileNavOpen = useUI((s) => s.setMobileNavOpen)
  const newBtn = useRef<HTMLButtonElement>(null)
  useMagnetic(newBtn, 0.2)

  return (
    <header className="glass sticky top-0 z-40 border-b border-line pt-[env(safe-area-inset-top)]">
      <div className="flex h-16 items-center gap-3 px-4 md:px-6">
        <button
          type="button"
          onClick={() => setMobileNavOpen(true)}
          className="-ml-1 flex size-9 items-center justify-center rounded-lg text-muted hover:bg-surface-2 hover:text-fg md:hidden"
          aria-label="Open menu"
        >
          <Menu className="size-5" />
        </button>
        <Breadcrumb />

        <button
          type="button"
          onClick={() => setCommandOpen(true)}
          className="group ml-auto hidden h-9 w-[min(340px,32vw)] items-center gap-2.5 rounded-lg border border-line bg-surface-2/70 px-3 text-[13px] text-faint transition-all hover:border-line-strong hover:text-muted xl:flex"
        >
          <Search className="size-4" />
          <span className="flex-1 text-left">Search or jump to…</span>
          <Kbd>⌘</Kbd>
          <Kbd>K</Kbd>
        </button>

        <div className="ml-auto flex shrink-0 items-center gap-1 xl:ml-2">
          <button
            type="button"
            onClick={() => setCommandOpen(true)}
            className="flex size-9 items-center justify-center rounded-lg text-muted hover:bg-surface-2 hover:text-fg xl:hidden"
            aria-label="Search"
          >
            <Search className="size-[18px]" />
          </button>
          <Popover
            width={340}
            trigger={({ toggle, open }) => (
              <Tooltip content="Color theme" side="bottom">
                <button
                  type="button"
                  onClick={toggle}
                  className={cn('flex size-9 items-center justify-center rounded-lg text-muted transition-colors hover:bg-surface-2 hover:text-fg', open && 'bg-surface-2 text-fg')}
                  aria-label="Color theme"
                >
                  <Palette className="size-[18px]" />
                </button>
              </Tooltip>
            )}
          >
            {({ close }) => <PalettePicker onPicked={close} />}
          </Popover>
          <NotificationBell />
          <ThemeToggle className="mx-1 hidden sm:block" />
          <Button ref={newBtn} variant="primary" icon={<Plus />} onClick={() => openQuickCreate('lead')} className="ml-1 max-sm:hidden">
            New
            <span className="ml-1 hidden rounded bg-black/15 px-1 text-[10.5px] font-semibold md:inline">N</span>
          </Button>
        </div>
      </div>
      <RouteProgress />
    </header>
  )
}
