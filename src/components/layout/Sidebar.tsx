import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { Search, PanelLeftClose, PanelLeftOpen, X } from 'lucide-react'
import { navigation, findNavItem, badgeCounters } from '@/config/navigation'
import { useTheme } from '@/store/theme'
import { useUI } from '@/store/ui'
import { useCrm } from '@/store/crm'
import { gsap, useGSAP, reducedMotion } from '@/lib/gsap'
import { useScrollEdges } from '@/hooks/useScrollEdges'
import { useSidebar } from '@/hooks/useSidebar'
import { Logo } from '@/components/crm/Logo'
import { Tooltip } from '@/components/ui/Tooltip'
import { Kbd } from '@/components/ui/Kbd'
import { NavRow } from './sidebar/NavRow'
import { SectionHeader } from './sidebar/SectionHeader'
import { Collapse } from './sidebar/Collapse'
import { WorkspaceSwitcher } from './sidebar/WorkspaceSwitcher'
import { QuickActions } from './sidebar/QuickActions'
import { SavedViews, Favorites, TeamPresence } from './sidebar/SidebarLists'
import { CreditsCard } from './sidebar/CreditsCard'
import { ProfileCard } from './sidebar/ProfileCard'
import { cn } from '@/lib/cn'

export const SIDEBAR_WIDTH = { expanded: 272, collapsed: 72 }

/**
 * App sidebar.
 *
 *  • Content comes from src/config/navigation.ts and src/config/app.ts.
 *  • Optional sections can be switched off in Settings → Appearance → Sidebar.
 *  • Collapses to an icon rail ([ key); hovering the rail peeks it open.
 *  • A glowing pill glides to the active page and a soft highlight follows
 *    the pointer between rows.
 */
export function Sidebar({ mobile, onNavigate, onClose }: { mobile?: boolean; onNavigate?: () => void; onClose?: () => void }) {
  const { collapsed, narrow, toggle: toggleSidebar } = useSidebar()
  const setRailOpen = useUI((s) => s.setRailOpen)
  const sections = useTheme((s) => s.sections)
  const folded = useTheme((s) => s.collapsedGroups)
  const toggleGroup = useTheme((s) => s.toggleGroup)
  const setCommandOpen = useUI((s) => s.setCommandOpen)
  const crm = useCrm()
  const location = useLocation()

  const [peek, setPeek] = useState(false)
  const peekTimer = useRef(0)
  const expanded = Boolean(mobile) || !collapsed || peek

  const root = useRef<HTMLElement>(null)
  const content = useRef<HTMLDivElement>(null)
  const activePill = useRef<HTMLSpanElement>(null)
  const hoverPill = useRef<HTMLSpanElement>(null)
  const firstMove = useRef(true)
  const [scroller, edges] = useScrollEdges<HTMLElement>('y')

  // Tablet overlay: close when clicking outside or pressing Escape.
  useEffect(() => {
    if (!narrow || collapsed || mobile) return
    const down = (e: PointerEvent) => {
      const t = e.target as Element
      if (root.current?.contains(t) || t.closest?.('.popover')) return
      setRailOpen(false)
    }
    const key = (e: KeyboardEvent) => e.key === 'Escape' && setRailOpen(false)
    document.addEventListener('pointerdown', down)
    document.addEventListener('keydown', key)
    return () => {
      document.removeEventListener('pointerdown', down)
      document.removeEventListener('keydown', key)
    }
  }, [narrow, collapsed, mobile, setRailOpen])

  /* ── Active pill ── */
  const moveActive = useCallback(
    (instant: boolean) => {
      const pill = activePill.current
      const box = content.current
      if (!pill || !box) return
      const item = findNavItem(location.pathname)
      const row = item ? box.querySelector<HTMLElement>(`[data-nav="${item.id}"]`) : null
      if (!row || row.offsetParent === null || row.getBoundingClientRect().height === 0) {
        gsap.to(pill, { opacity: 0, scale: 0.96, duration: 0.25 })
        return
      }
      const y = row.getBoundingClientRect().top - box.getBoundingClientRect().top
      gsap.to(pill, { y, height: row.offsetHeight, opacity: 1, scale: 1, duration: instant || reducedMotion() ? 0 : 0.6, ease: 'elastic.out(1, 0.85)' })
    },
    [location.pathname],
  )

  useLayoutEffect(() => {
    moveActive(firstMove.current)
    firstMove.current = false
  }, [moveActive, folded])

  // Re-measure when rows move (groups folding, sections toggling, rail resizing).
  useLayoutEffect(() => {
    const box = content.current
    if (!box) return
    let frame = 0
    const ro = new ResizeObserver(() => {
      cancelAnimationFrame(frame)
      frame = requestAnimationFrame(() => moveActive(true))
    })
    ro.observe(box)
    return () => {
      ro.disconnect()
      cancelAnimationFrame(frame)
    }
  }, [moveActive])

  /* ── Hover highlight that follows the pointer ── */
  const onOver = (e: React.PointerEvent) => {
    const pill = hoverPill.current
    const box = content.current
    const row = (e.target as HTMLElement).closest<HTMLElement>('[data-row]')
    if (!pill || !box || !row || !box.contains(row)) return
    const y = row.getBoundingClientRect().top - box.getBoundingClientRect().top
    const wasHidden = Number(gsap.getProperty(pill, 'opacity')) < 0.05
    gsap.to(pill, { y, height: row.offsetHeight, opacity: 1, duration: wasHidden || reducedMotion() ? 0 : 0.35, ease: 'volt.out' })
  }
  const onLeaveList = () => hoverPill.current && gsap.to(hoverPill.current, { opacity: 0, duration: 0.25 })

  /* ── Peek open when hovering the collapsed rail ── */
  const enter = (e: React.PointerEvent) => {
    if (mobile || !collapsed || e.pointerType !== 'mouse') return
    window.clearTimeout(peekTimer.current)
    peekTimer.current = window.setTimeout(() => setPeek(true), 260)
  }
  const leave = () => {
    window.clearTimeout(peekTimer.current)
    setPeek(false)
  }

  /* ── Entrance ── */
  useGSAP(
    () => {
      if (reducedMotion() || mobile) return
      gsap.from('[data-side-item]', { opacity: 0, x: -16, duration: 0.7, stagger: 0.025, delay: 0.1, ease: 'volt.out', clearProps: 'transform,opacity' })
      gsap.from('[data-side-glow]', { opacity: 0, scale: 0.6, duration: 1.6, ease: 'volt.out' })
    },
    { scope: root },
  )

  // On tablet widths the open rail floats over the page; close it after navigating.
  const navigateDone = () => {
    onNavigate?.()
    if (narrow) setRailOpen(false)
  }

  const counts = Object.fromEntries(Object.entries(badgeCounters).map(([k, fn]) => [k, fn(crm)])) as Record<keyof typeof badgeCounters, number>

  return (
    <aside
      ref={root}
      onPointerEnter={enter}
      onPointerLeave={leave}
      aria-label="Main navigation"
      className={cn(
        'sidebar-surface relative flex h-full flex-col overflow-hidden transition-[width,box-shadow] duration-500 ease-[var(--ease-out-volt)]',
        mobile ? 'w-full' : expanded ? 'w-[272px]' : 'w-[72px]',
        (peek || (narrow && !collapsed)) && 'shadow-[30px_0_80px_-30px_rgb(0_0_0/0.65)]',
      )}
    >
      {/* Atmosphere */}
      <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
        <div data-side-glow className="absolute -top-24 -left-16 size-64 rounded-full bg-primary/20 blur-3xl" />
        <div className="absolute -top-10 right-[-40px] size-40 rounded-full bg-accent/10 blur-3xl" />
        <div className="sidebar-dots absolute inset-x-0 top-0 h-48" />
      </div>
      {!mobile && <span aria-hidden className="sidebar-edge pointer-events-none absolute inset-y-0 right-0 w-px" />}

      {/* Header */}
      <header className="relative flex h-16 shrink-0 items-center justify-between px-3">
        <button
          type="button"
          onClick={() => !expanded && toggleSidebar()}
          className="rounded-xl pl-[8px] outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
          aria-label={expanded ? 'Volt home' : 'Expand sidebar'}
          data-side-item
        >
          <Logo collapsed={!expanded} />
        </button>
        {mobile ? (
          <button type="button" onClick={onClose} className="flex size-8 items-center justify-center rounded-lg text-faint hover:bg-surface-3 hover:text-fg" aria-label="Close menu">
            <X className="size-4" />
          </button>
        ) : (
          <Tooltip content={collapsed ? (peek ? 'Keep sidebar open  [' : 'Expand  [') : 'Collapse  ['} side="right">
            <button
              type="button"
              onClick={() => {
                setPeek(false)
                toggleSidebar()
              }}
              className={cn(
                'flex size-8 items-center justify-center rounded-lg text-faint transition-all duration-300 hover:bg-surface-3 hover:text-fg',
                expanded ? 'opacity-100' : 'pointer-events-none opacity-0',
              )}
              aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
              {collapsed ? <PanelLeftOpen className="size-4" /> : <PanelLeftClose className="size-4" />}
            </button>
          </Tooltip>
        )}
      </header>

      {/* Workspace, search, quick create */}
      <div className="relative flex shrink-0 flex-col gap-2 px-3">
        <WorkspaceSwitcher expanded={expanded} />
        <Tooltip side="right" content={<span className="flex items-center gap-2">Search <Kbd>⌘K</Kbd></span>} disabled={expanded} className="flex w-full">
          <button
            type="button"
            data-side-item
            onClick={() => setCommandOpen(true)}
            aria-label="Search"
            className={cn(
              'group flex h-9 w-full items-center gap-2.5 rounded-[10px] border pr-2 pl-[15px] text-[13px] text-faint transition-[border-color,background-color,color] duration-200',
              expanded ? 'border-line bg-surface-2/60 hover:border-line-strong hover:text-muted' : 'border-transparent hover:bg-surface-2 hover:text-fg',
            )}
          >
            <Search className="size-4 shrink-0 transition-transform duration-300 group-hover:scale-110" />
            <span className={cn('flex-1 text-left whitespace-nowrap transition-opacity duration-200', expanded ? 'opacity-100' : 'opacity-0')}>Search anything…</span>
            <span className={cn('transition-opacity duration-200', expanded ? 'opacity-100' : 'opacity-0')}>
              <Kbd>⌘K</Kbd>
            </span>
          </button>
        </Tooltip>
        {sections.quickActions && <QuickActions expanded={expanded} />}
      </div>

      {/* Scrollable navigation */}
      <div className="relative mt-3 min-h-0 flex-1">
        <span aria-hidden className={cn('pointer-events-none absolute inset-x-0 top-0 z-[3] h-8 bg-gradient-to-b from-[var(--surface)] to-transparent transition-opacity duration-300', edges.start ? 'opacity-100' : 'opacity-0')} />
        <span aria-hidden className={cn('pointer-events-none absolute inset-x-0 bottom-0 z-[3] h-10 bg-gradient-to-t from-[var(--surface)] to-transparent transition-opacity duration-300', edges.end ? 'opacity-100' : 'opacity-0')} />
        <nav ref={scroller} className="no-scrollbar h-full overflow-x-hidden overflow-y-auto px-3 pb-4" onPointerOver={onOver} onPointerLeave={onLeaveList}>
          <div ref={content} className="relative">
            <span ref={hoverPill} aria-hidden className="pointer-events-none absolute top-0 right-0 left-0 rounded-[10px] bg-surface-2/80 opacity-0" />
            <span
              ref={activePill}
              aria-hidden
              className="side-active pointer-events-none absolute top-0 right-0 left-0 rounded-[10px] opacity-0"
            >
              <span className="absolute top-1/2 -left-3 h-5 w-[3px] -translate-y-1/2 rounded-r-full bg-primary shadow-[0_0_14px_2px_var(--primary)]" />
            </span>

            {navigation.map((group, gi) => {
              const isFolded = Boolean(group.collapsible) && folded.includes(group.id) && expanded
              return (
                <section key={group.id} className={cn(gi > 0 && 'mt-3')}>
                  <SectionHeader
                    label={group.label}
                    expanded={expanded}
                    folded={isFolded}
                    onToggle={group.collapsible ? () => toggleGroup(group.id) : undefined}
                  />
                  <Collapse open={!isFolded}>
                    <div className="flex flex-col gap-0.5">
                      {group.items.map((item) => (
                        <div key={item.id} data-side-item>
                          <NavRow item={item} expanded={expanded} badge={item.badge ? counts[item.badge] : undefined} onNavigate={navigateDone} />
                        </div>
                      ))}
                    </div>
                  </Collapse>
                </section>
              )
            })}

            {sections.views && <SavedViews expanded={expanded} folded={folded.includes('views')} onToggle={() => toggleGroup('views')} onNavigate={navigateDone} />}
            {sections.favorites && <Favorites expanded={expanded} folded={folded.includes('favorites')} onToggle={() => toggleGroup('favorites')} onNavigate={navigateDone} />}
            {sections.team && <TeamPresence expanded={expanded} folded={folded.includes('team')} onToggle={() => toggleGroup('team')} />}
          </div>
        </nav>
      </div>

      {/* Footer */}
      <div className="relative flex shrink-0 flex-col gap-2 border-t border-line/70 px-3 pt-3 pb-[max(12px,env(safe-area-inset-bottom))]">
        {sections.credits && <CreditsCard expanded={expanded} />}
        <ProfileCard expanded={expanded} onNavigate={navigateDone} />
      </div>
    </aside>
  )
}
