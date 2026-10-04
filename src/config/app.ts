/**
 * ─────────────────────────────────────────────────────────────
 *  APP CONFIG — brand, workspace and sidebar content.
 * ─────────────────────────────────────────────────────────────
 *  Rename the product, change the workspace, or tune what the sidebar
 *  shows without touching any component.
 */

export const brand = {
  /** Product name shown in the logo and the browser tab. */
  name: 'Volt',
  tagline: 'Revenue, charged.',
}

export const workspaces = [
  { id: 'lumen', name: 'Lumen Labs', plan: 'Pro', seats: 6, initials: 'LL', gradient: ['var(--c3)', 'var(--primary)'] },
  { id: 'sandbox', name: 'Volt Sandbox', plan: 'Free', seats: 2, initials: 'VS', gradient: ['var(--accent)', 'var(--c4)'] },
] as const

export const currentWorkspaceId = 'lumen'

/** AI credits widget at the bottom of the sidebar. */
export const credits = {
  label: 'Volt AI credits',
  used: 6_800,
  total: 10_000,
  resetsIn: '12 days',
}

/**
 * Sidebar sections. Each can be switched off here (default) or by the user
 * in Settings → Appearance → Sidebar.
 */
export const sidebarSections = {
  quickActions: { label: 'Quick actions', description: 'One-tap create buttons under search', default: true },
  views: { label: 'Saved views', description: 'Shortcuts to filtered lists', default: true },
  favorites: { label: 'Favorites', description: 'Starred companies and people', default: true },
  team: { label: 'Team presence', description: 'Who is online right now', default: true },
  credits: { label: 'AI credits', description: 'Usage meter above your profile', default: true },
} as const

export type SidebarSection = keyof typeof sidebarSections

/** Who appears online in the Team section (member ids from src/data/mock.ts). */
export const presence: Record<string, 'online' | 'away' | 'offline'> = {
  m1: 'online',
  m2: 'online',
  m3: 'away',
  m4: 'online',
  m5: 'offline',
  m6: 'online',
}
