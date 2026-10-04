import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { flushSync } from 'react-dom'
import { applyTheme, DEFAULT_THEME, getMode, type ModeId, type RadiusId } from '@/config/themes'
import { safeStorage } from './storage'

export type Motion = 'full' | 'reduced'
export type Density = 'comfortable' | 'compact'

interface ThemeState {
  mode: ModeId
  palette: string
  radius: RadiusId
  motion: Motion
  density: Density
  sidebarCollapsed: boolean
  grain: boolean
  setMode: (mode: ModeId, origin?: Origin) => void
  toggleMode: (origin?: Origin) => void
  setPalette: (palette: string, origin?: Origin) => void
  setRadius: (radius: RadiusId) => void
  setMotion: (motion: Motion) => void
  setDensity: (density: Density) => void
  toggleSidebar: () => void
  setGrain: (on: boolean) => void
}

type Origin = { x: number; y: number }

/**
 * Runs a theme change inside a View Transition so the new theme sweeps in as
 * a circle from wherever the user clicked. Falls back to an instant swap.
 */
function transition(update: () => void, origin?: Origin) {
  const doc = document as Document & {
    startViewTransition?: (cb: () => void) => { ready: Promise<void> }
  }
  const reduced =
    document.documentElement.dataset.motion === 'reduced' ||
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  if (!doc.startViewTransition || reduced) {
    update()
    return
  }
  const x = origin?.x ?? window.innerWidth - 80
  const y = origin?.y ?? 32
  const vt = doc.startViewTransition(() => flushSync(update))
  vt.ready
    .then(() => {
      const r = Math.hypot(Math.max(x, window.innerWidth - x), Math.max(y, window.innerHeight - y))
      document.documentElement.animate(
        { clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${r}px at ${x}px ${y}px)`] },
        { duration: 750, easing: 'cubic-bezier(0.7, 0, 0.2, 1)', pseudoElement: '::view-transition-new(root)' },
      )
    })
    .catch(() => {})
}

export const useTheme = create<ThemeState>()(
  persist(
    (set, get) => {
      const commit = (patch: Partial<ThemeState>) => {
        set(patch)
        const s = get()
        applyTheme({ mode: s.mode, palette: s.palette, radius: s.radius })
      }
      return {
        ...DEFAULT_THEME,
        motion: 'full',
        density: 'comfortable',
        sidebarCollapsed: false,
        grain: true,
        setMode: (mode, origin) => transition(() => commit({ mode }), origin),
        toggleMode: (origin) => {
          const next: ModeId = getMode(get().mode).isDark ? 'light' : 'dark'
          transition(() => commit({ mode: next }), origin)
        },
        setPalette: (palette, origin) => transition(() => commit({ palette }), origin),
        setRadius: (radius) => commit({ radius }),
        setMotion: (motion) => {
          set({ motion })
          document.documentElement.dataset.motion = motion
        },
        setDensity: (density) => {
          set({ density })
          document.documentElement.dataset.density = density
        },
        toggleSidebar: () => set({ sidebarCollapsed: !get().sidebarCollapsed }),
        setGrain: (grain) => set({ grain }),
      }
    },
    { name: 'volt-theme', storage: safeStorage },
  ),
)

/** Apply the saved theme before React renders, so there is no flash. */
export function bootTheme() {
  const s = useTheme.getState()
  applyTheme({ mode: s.mode, palette: s.palette, radius: s.radius })
  document.documentElement.dataset.motion = s.motion
  document.documentElement.dataset.density = s.density
}
