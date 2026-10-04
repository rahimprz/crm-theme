import { useTheme } from '@/store/theme'
import { useUI } from '@/store/ui'
import { useMediaQuery } from './useMediaQuery'

/** Tablet widths start with the icon rail so pages keep their room. */
export const NARROW_QUERY = '(min-width: 768px) and (max-width: 1279px)'

/**
 * Single source of truth for the sidebar's collapsed state.
 *  • Wide screens: the saved preference (Settings or the [ key).
 *  • Tablet widths: always a rail; toggling opens it over the page.
 */
export function useSidebar() {
  const pref = useTheme((s) => s.sidebarCollapsed)
  const railOpen = useUI((s) => s.railOpen)
  const narrow = useMediaQuery(NARROW_QUERY)
  return {
    narrow,
    collapsed: narrow ? !railOpen : pref,
    /** Width the page content should reserve. */
    reserveRail: narrow || pref,
    toggle: toggleSidebar,
  }
}

export function toggleSidebar() {
  if (window.matchMedia(NARROW_QUERY).matches) {
    const ui = useUI.getState()
    ui.setRailOpen(!ui.railOpen)
  } else {
    useTheme.getState().toggleSidebar()
  }
}
