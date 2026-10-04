import { useEffect, useLayoutEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { useNavigate } from 'react-router-dom'
import {
  Search,
  Magnet,
  Handshake,
  ListChecks,
  UserPlus,
  Building2,
  SunMoon,
  PanelLeft,
  Sparkles,
  CornerDownLeft,
  ArrowUp,
  ArrowDown,
} from 'lucide-react'
import { allNavItems } from '@/config/navigation'
import { palettes } from '@/config/themes'
import { useUI } from '@/store/ui'
import { useCrm } from '@/store/crm'
import { useTheme } from '@/store/theme'
import { gsap } from '@/lib/gsap'
import { usePresence } from '@/hooks/usePresence'
import { Avatar } from '@/components/ui/Avatar'
import { CompanyLogo } from '@/components/ui/CompanyLogo'
import { Kbd } from '@/components/ui/Kbd'
import { money } from '@/lib/format'
import { cn } from '@/lib/cn'

interface Item {
  id: string
  group: string
  label: string
  hint?: string
  icon: ReactNode
  keywords?: string
  run: () => void
}

/**
 * ⌘K palette: jump to any page or record, create things, and change the
 * theme without touching the mouse.
 */
export function CommandPalette() {
  const open = useUI((s) => s.commandOpen)
  const setOpen = useUI((s) => s.setCommandOpen)
  const openQuickCreate = useUI((s) => s.openQuickCreate)
  const openDrawer = useUI((s) => s.openDrawer)
  const setAssistantOpen = useUI((s) => s.setAssistantOpen)
  const navigate = useNavigate()
  const { leads, deals, contacts, companies } = useCrm()
  const toggleMode = useTheme((s) => s.toggleMode)
  const setPalette = useTheme((s) => s.setPalette)
  const toggleSidebar = useTheme((s) => s.toggleSidebar)

  const [query, setQuery] = useState('')
  const [active, setActive] = useState(0)
  const input = useRef<HTMLInputElement>(null)
  const list = useRef<HTMLDivElement>(null)
  const highlight = useRef<HTMLSpanElement>(null)

  const close = () => setOpen(false)
  const go = (fn: () => void) => () => {
    close()
    fn()
  }

  const items = useMemo<Item[]>(() => {
    const q = query.trim().toLowerCase()
    const base: Item[] = [
      ...allNavItems.map((n) => ({
        id: `nav-${n.id}`,
        group: 'Go to',
        label: n.label,
        hint: n.hotkey ? `G ${n.hotkey}` : undefined,
        icon: <n.icon />,
        run: go(() => navigate(n.path)),
      })),
      { id: 'new-lead', group: 'Create', label: 'New lead', hint: 'N', icon: <Magnet />, run: () => openQuickCreate('lead') },
      { id: 'new-deal', group: 'Create', label: 'New deal', icon: <Handshake />, run: () => openQuickCreate('deal') },
      { id: 'new-task', group: 'Create', label: 'New task', icon: <ListChecks />, run: () => openQuickCreate('task') },
      { id: 'new-contact', group: 'Create', label: 'New person', icon: <UserPlus />, run: () => openQuickCreate('contact') },
      { id: 'new-company', group: 'Create', label: 'New company', icon: <Building2 />, run: () => openQuickCreate('company') },
      { id: 'ai', group: 'Create', label: 'Ask Volt AI', keywords: 'assistant chat help', icon: <Sparkles />, run: go(() => setAssistantOpen(true)) },
      { id: 'mode', group: 'Appearance', label: 'Toggle light / dark mode', hint: '⇧ D', keywords: 'theme dark light', icon: <SunMoon />, run: go(() => toggleMode()) },
      { id: 'sidebar', group: 'Appearance', label: 'Collapse or expand sidebar', hint: '[', icon: <PanelLeft />, run: go(toggleSidebar) },
      ...palettes.map((p) => ({
        id: `pal-${p.id}`,
        group: 'Appearance',
        label: `Use ${p.name} palette`,
        keywords: `theme color ${p.description}`,
        icon: (
          <span className="relative size-4 overflow-hidden rounded-full">
            <span className="absolute inset-0" style={{ background: p.dark.primary }} />
            <span className="absolute inset-y-0 right-0 w-1/2" style={{ background: p.dark.accent }} />
          </span>
        ),
        run: go(() => setPalette(p.id)),
      })),
    ]
    if (!q) return base.filter((i) => i.group !== 'Appearance' || i.id === 'mode' || i.id === 'sidebar').concat(base.filter((i) => i.id.startsWith('pal-')).slice(0, 3))
    const match = (s: string) => s.toLowerCase().includes(q)
    const records: Item[] = [
      ...leads.filter((l) => match(l.name) || match(l.company)).slice(0, 4).map((l) => ({
        id: `lead-${l.id}`,
        group: 'Leads',
        label: `${l.name} · ${l.company}`,
        hint: money(l.value, true),
        icon: <Avatar name={l.name} hue={l.hue} size="xs" />,
        run: go(() => openDrawer({ type: 'lead', id: l.id })),
      })),
      ...deals.filter((d) => match(d.name)).slice(0, 4).map((d) => ({
        id: `deal-${d.id}`,
        group: 'Deals',
        label: d.name,
        hint: money(d.value, true),
        icon: <Handshake />,
        run: go(() => openDrawer({ type: 'deal', id: d.id })),
      })),
      ...contacts.filter((c) => match(`${c.firstName} ${c.lastName}`) || match(c.email)).slice(0, 4).map((c) => ({
        id: `contact-${c.id}`,
        group: 'People',
        label: `${c.firstName} ${c.lastName}`,
        hint: c.title,
        icon: <Avatar name={`${c.firstName} ${c.lastName}`} hue={c.hue} size="xs" />,
        run: go(() => navigate(`/contacts/${c.id}`)),
      })),
      ...companies.filter((c) => match(c.name) || match(c.industry)).slice(0, 4).map((c) => ({
        id: `company-${c.id}`,
        group: 'Companies',
        label: c.name,
        hint: c.industry,
        icon: <CompanyLogo shape={c.logo} color={c.color} size="xs" />,
        run: go(() => navigate(`/companies/${c.id}`)),
      })),
    ]
    return [...records, ...base.filter((i) => match(i.label) || (i.keywords && match(i.keywords)))]
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query, leads, deals, contacts, companies])

  const groups = useMemo(() => {
    const g: { name: string; items: (Item & { index: number })[] }[] = []
    items.forEach((it, index) => {
      let grp = g.find((x) => x.name === it.group)
      if (!grp) g.push((grp = { name: it.group, items: [] }))
      grp.items.push({ ...it, index })
    })
    return g
  }, [items])

  useEffect(() => setActive(0), [query])
  useEffect(() => {
    if (open) {
      setQuery('')
      setTimeout(() => input.current?.focus(), 30)
    }
  }, [open])

  // Glide the highlight to the active row.
  useLayoutEffect(() => {
    const row = list.current?.querySelector<HTMLElement>(`[data-index="${active}"]`)
    if (!row || !highlight.current) return
    gsap.to(highlight.current, { y: row.offsetTop, height: row.offsetHeight, opacity: 1, duration: 0.28, ease: 'volt.out' })
    row.scrollIntoView({ block: 'nearest' })
  }, [active, items])

  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setActive((a) => Math.min(items.length - 1, a + 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActive((a) => Math.max(0, a - 1))
    } else if (e.key === 'Enter') {
      e.preventDefault()
      items[active]?.run()
    } else if (e.key === 'Escape') close()
  }

  const { mounted, ref } = usePresence<HTMLDivElement>(open, {
    enter: (el) => {
      const q = gsap.utils.selector(el)
      return gsap
        .timeline()
        .fromTo(q('[data-backdrop]'), { opacity: 0 }, { opacity: 1, duration: 0.3 })
        .fromTo(q('[data-panel]'), { opacity: 0, y: -20, scale: 0.96, filter: 'blur(10px)' }, { opacity: 1, y: 0, scale: 1, filter: 'blur(0px)', duration: 0.5, ease: 'volt.out', clearProps: 'filter' }, 0)
        .fromTo(q('[data-row]'), { opacity: 0, x: -8 }, { opacity: 1, x: 0, duration: 0.3, stagger: 0.015 }, 0.1)
    },
    exit: (el) => {
      const q = gsap.utils.selector(el)
      return gsap.timeline().to(q('[data-panel]'), { opacity: 0, scale: 0.97, y: -8, duration: 0.18, ease: 'power2.in' }).to(q('[data-backdrop]'), { opacity: 0, duration: 0.18 }, 0)
    },
  })

  if (!mounted) return null
  return createPortal(
    <div ref={ref} className="fixed inset-0 z-[95] flex items-start justify-center px-3 pt-[10vh]">
      <div data-backdrop className="absolute inset-0 bg-[rgb(2_3_8/0.6)] backdrop-blur-[6px]" onClick={close} />
      <div data-panel role="dialog" aria-label="Command palette" className="popover beam relative w-full max-w-[640px] overflow-hidden">
        <div className="flex items-center gap-3 border-b border-line px-4">
          <Search className="size-[18px] text-faint" />
          <input
            id="command-input"
            ref={input}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={onKey}
            placeholder="Search records, pages, actions…"
            className="h-14 flex-1 bg-transparent text-[15px] text-fg outline-none placeholder:text-faint focus-visible:outline-none"
            autoComplete="off"
          />
          <Kbd>esc</Kbd>
        </div>
        <div ref={list} className="relative max-h-[min(440px,60vh)] overflow-y-auto p-2">
          <span ref={highlight} aria-hidden className="pointer-events-none absolute top-0 right-2 left-2 rounded-lg border border-primary/25 bg-primary/10 opacity-0" />
          {items.length === 0 && <p className="px-3 py-10 text-center text-[13px] text-muted">No results for “{query}”. Try a name, company or page.</p>}
          {groups.map((g) => (
            <div key={g.name} className="mb-1">
              <div className="eyebrow px-3 pt-2 pb-1.5">{g.name}</div>
              {g.items.map((it) => (
                <button
                  key={it.id}
                  type="button"
                  data-row
                  data-index={it.index}
                  onMouseMove={() => setActive(it.index)}
                  onClick={it.run}
                  className={cn(
                    'relative flex h-10 w-full items-center gap-3 rounded-lg px-3 text-left text-[13.5px] transition-colors [&_svg]:size-4',
                    active === it.index ? 'text-fg' : 'text-muted',
                  )}
                >
                  <span className={cn('flex size-5 items-center justify-center', active === it.index ? 'text-primary' : 'text-faint')}>{it.icon}</span>
                  <span className="min-w-0 flex-1 truncate">{it.label}</span>
                  {it.hint && <span className="text-[11.5px] text-faint">{it.hint}</span>}
                </button>
              ))}
            </div>
          ))}
        </div>
        <div className="flex items-center gap-4 border-t border-line bg-surface/60 px-4 py-2.5 text-[11.5px] text-faint">
          <span className="flex items-center gap-1.5">
            <Kbd>
              <ArrowUp className="inline size-2.5" />
            </Kbd>
            <Kbd>
              <ArrowDown className="inline size-2.5" />
            </Kbd>
            navigate
          </span>
          <span className="flex items-center gap-1.5">
            <Kbd>
              <CornerDownLeft className="inline size-2.5" />
            </Kbd>
            open
          </span>
          <span className="ml-auto hidden items-center gap-1.5 sm:flex">
            <Sparkles className="size-3.5 text-accent" /> Tip: press <Kbd>G</Kbd> then a letter to jump to a page
          </span>
        </div>
      </div>
    </div>,
    document.body,
  )
}
