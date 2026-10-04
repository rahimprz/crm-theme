import { useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { allNavItems } from '@/config/navigation'
import { useUI } from '@/store/ui'
import { useTheme } from '@/store/theme'
import { toggleSidebar } from './useSidebar'

const isTyping = (e: KeyboardEvent) => {
  const t = e.target as HTMLElement
  return t.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(t.tagName)
}

/**
 * Global shortcuts:
 *   ⌘K / Ctrl+K or /   command palette
 *   N                   new lead
 *   G then a letter     go to page (see hotkeys in navigation.ts)
 *   [                   collapse sidebar
 *   Shift+D             toggle light/dark
 */
export function useHotkeys() {
  const navigate = useNavigate()
  const pendingG = useRef(0)
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const ui = useUI.getState()
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        ui.setCommandOpen(!ui.commandOpen)
        return
      }
      if (isTyping(e) || e.metaKey || e.ctrlKey || e.altKey) return
      if (ui.commandOpen || ui.quickCreate) return
      const key = e.key.toLowerCase()
      if (Date.now() - pendingG.current < 900) {
        pendingG.current = 0
        const item = allNavItems.find((i) => i.hotkey?.toLowerCase() === key)
        if (item) {
          e.preventDefault()
          navigate(item.path)
        }
        return
      }
      if (key === 'g') pendingG.current = Date.now()
      else if (e.key === '/') {
        e.preventDefault()
        ui.setCommandOpen(true)
      } else if (key === 'n') {
        e.preventDefault()
        ui.openQuickCreate('lead')
      } else if (e.key === '[') toggleSidebar()
      else if (e.shiftKey && key === 'd') useTheme.getState().toggleMode()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [navigate])
}
