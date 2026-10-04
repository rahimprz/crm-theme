/**
 * ─────────────────────────────────────────────────────────────
 *  NAVIGATION CONFIG — add, remove or reorder pages here.
 * ─────────────────────────────────────────────────────────────
 *
 *  Everything in the sidebar comes from this file:
 *    • navigation  → page groups and their items
 *    • savedViews  → the "Views" shortcuts (pre-filtered pages)
 *
 *  Each nav item also appears in the mobile menu and the ⌘K palette.
 *  To add a page:
 *    1. create the component in src/pages/
 *    2. register it in src/App.tsx routes
 *    3. add an entry below
 */
import {
  LayoutDashboard,
  Inbox,
  ListChecks,
  CalendarDays,
  Magnet,
  Handshake,
  Users,
  Building2,
  ChartColumnBig,
  Workflow,
  Settings,
  type LucideIcon,
} from 'lucide-react'
import type { useCrm } from '@/store/crm'

type CrmState = ReturnType<typeof useCrm.getState>

/** Live counters that can be shown as a badge next to a nav item. */
export const badgeCounters = {
  inbox: (s: CrmState) => s.emails.filter((e) => e.unread && e.folder === 'inbox').length,
  tasks: (s: CrmState) => s.tasks.filter((t) => !t.done).length,
  leads: (s: CrmState) => s.leads.filter((l) => l.status === 'new').length,
  deals: (s: CrmState) => s.deals.filter((d) => d.stage !== 'won' && d.stage !== 'lost').length,
}
export type BadgeKey = keyof typeof badgeCounters

export interface NavItem {
  id: string
  label: string
  path: string
  icon: LucideIcon
  /** One line shown in the collapsed-rail tooltip. */
  description?: string
  /** Keyboard shortcut (press G then this key). */
  hotkey?: string
  /** Live counter shown as a badge. */
  badge?: BadgeKey
  /** Badge style: 'count' (neutral pill) or 'alert' (accent, draws attention). */
  badgeTone?: 'count' | 'alert'
  /** Shows a shimmering "New" tag. */
  isNew?: boolean
  /** Show in the mobile bottom bar. */
  mobile?: boolean
}

export interface NavGroup {
  id: string
  label: string
  /** Let people fold the group away (remembered per browser). */
  collapsible?: boolean
  items: NavItem[]
}

export const navigation: NavGroup[] = [
  {
    id: 'workspace',
    label: 'Workspace',
    items: [
      { id: 'dashboard', label: 'Dashboard', path: '/', icon: LayoutDashboard, hotkey: 'D', mobile: true, description: 'Revenue at a glance' },
      { id: 'inbox', label: 'Inbox', path: '/inbox', icon: Inbox, hotkey: 'I', badge: 'inbox', badgeTone: 'alert', description: 'Email synced with records' },
      { id: 'tasks', label: 'Tasks', path: '/tasks', icon: ListChecks, hotkey: 'T', badge: 'tasks', mobile: true, description: 'Follow-ups and to-dos' },
      { id: 'calendar', label: 'Calendar', path: '/calendar', icon: CalendarDays, hotkey: 'C', description: 'Meetings and deadlines' },
    ],
  },
  {
    id: 'records',
    label: 'Records',
    collapsible: true,
    items: [
      { id: 'leads', label: 'Leads', path: '/leads', icon: Magnet, hotkey: 'L', badge: 'leads', mobile: true, description: 'People who might buy' },
      { id: 'deals', label: 'Deals', path: '/deals', icon: Handshake, hotkey: 'P', badge: 'deals', mobile: true, description: 'Your sales pipeline' },
      { id: 'contacts', label: 'People', path: '/contacts', icon: Users, hotkey: 'O', description: 'Every contact' },
      { id: 'companies', label: 'Companies', path: '/companies', icon: Building2, hotkey: 'M', description: 'Accounts you sell to' },
    ],
  },
  {
    id: 'insights',
    label: 'Insights',
    collapsible: true,
    items: [
      { id: 'reports', label: 'Reports', path: '/reports', icon: ChartColumnBig, hotkey: 'R', description: 'Quarter in review' },
      { id: 'workflows', label: 'Workflows', path: '/workflows', icon: Workflow, hotkey: 'W', isNew: true, description: 'Automations that run for you' },
    ],
  },
]

export const settingsItem: NavItem = {
  id: 'settings',
  label: 'Settings',
  path: '/settings',
  icon: Settings,
  hotkey: 'S',
  description: 'Theme, team and integrations',
}

/* ───────────── Saved views ───────────── */

export interface SavedView {
  id: string
  label: string
  /** Dot color, any CSS color or token. */
  color: string
  path: string
  /** Passed to the page as router state; pages read it to pre-filter. */
  state?: Record<string, unknown>
  count: (s: CrmState) => number
}

export const savedViews: SavedView[] = [
  { id: 'hot', label: 'Hot leads', color: 'var(--accent)', path: '/leads', state: { view: 'hot' }, count: (s) => s.leads.filter((l) => l.score >= 75 && l.status !== 'lost').length },
  { id: 'unassigned', label: 'Unassigned leads', color: 'var(--warning)', path: '/leads', state: { view: 'unassigned' }, count: (s) => s.leads.filter((l) => !l.ownerId).length },
  { id: 'my-deals', label: 'My open deals', color: 'var(--primary)', path: '/deals', state: { owners: ['m1'] }, count: (s) => s.deals.filter((d) => d.ownerId === 'm1' && d.stage !== 'won' && d.stage !== 'lost').length },
  { id: 'customers', label: 'Customers', color: 'var(--success)', path: '/contacts', state: { stage: 'customer' }, count: (s) => s.contacts.filter((c) => c.stage === 'customer').length },
]

/* ───────────── Helpers ───────────── */

export const allNavItems: NavItem[] = [...navigation.flatMap((g) => g.items), settingsItem]

export function findNavItem(pathname: string): NavItem | undefined {
  if (pathname === '/') return allNavItems[0]
  return allNavItems
    .filter((i) => i.path !== '/')
    .find((i) => pathname === i.path || pathname.startsWith(i.path + '/'))
}
