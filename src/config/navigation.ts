/**
 * ─────────────────────────────────────────────────────────────
 *  NAVIGATION CONFIG — add, remove or reorder pages here.
 * ─────────────────────────────────────────────────────────────
 *
 *  Each item appears in the sidebar, the mobile menu and the ⌘K command
 *  palette. To add a page:
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

export interface NavItem {
  id: string
  label: string
  path: string
  icon: LucideIcon
  /** Keyboard shortcut shown in the command palette (press G then this key). */
  hotkey?: string
  /** Key of a live counter from the store, shown as a badge. */
  badge?: 'inbox' | 'tasks' | 'leads'
  /** Show in the mobile bottom bar. */
  mobile?: boolean
}

export interface NavGroup {
  label: string
  items: NavItem[]
}

export const navigation: NavGroup[] = [
  {
    label: 'Workspace',
    items: [
      { id: 'dashboard', label: 'Dashboard', path: '/', icon: LayoutDashboard, hotkey: 'D', mobile: true },
      { id: 'inbox', label: 'Inbox', path: '/inbox', icon: Inbox, hotkey: 'I', badge: 'inbox' },
      { id: 'tasks', label: 'Tasks', path: '/tasks', icon: ListChecks, hotkey: 'T', badge: 'tasks', mobile: true },
      { id: 'calendar', label: 'Calendar', path: '/calendar', icon: CalendarDays, hotkey: 'C' },
    ],
  },
  {
    label: 'Records',
    items: [
      { id: 'leads', label: 'Leads', path: '/leads', icon: Magnet, hotkey: 'L', badge: 'leads', mobile: true },
      { id: 'deals', label: 'Deals', path: '/deals', icon: Handshake, hotkey: 'P', mobile: true },
      { id: 'contacts', label: 'People', path: '/contacts', icon: Users, hotkey: 'O' },
      { id: 'companies', label: 'Companies', path: '/companies', icon: Building2, hotkey: 'M' },
    ],
  },
  {
    label: 'Insights',
    items: [
      { id: 'reports', label: 'Reports', path: '/reports', icon: ChartColumnBig, hotkey: 'R' },
      { id: 'workflows', label: 'Workflows', path: '/workflows', icon: Workflow, hotkey: 'W' },
    ],
  },
]

export const settingsItem: NavItem = {
  id: 'settings',
  label: 'Settings',
  path: '/settings',
  icon: Settings,
  hotkey: 'S',
}

export const allNavItems: NavItem[] = [...navigation.flatMap((g) => g.items), settingsItem]

export function findNavItem(pathname: string): NavItem | undefined {
  if (pathname === '/') return allNavItems[0]
  return allNavItems
    .filter((i) => i.path !== '/')
    .find((i) => pathname === i.path || pathname.startsWith(i.path + '/'))
}
