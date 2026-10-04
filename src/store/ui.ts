import { create } from 'zustand'

export type CreateType = 'lead' | 'deal' | 'task' | 'contact' | 'company'
export type DrawerTarget = { type: 'lead' | 'deal'; id: string } | null

interface UIState {
  commandOpen: boolean
  quickCreate: CreateType | null
  drawer: DrawerTarget
  mobileNavOpen: boolean
  assistantOpen: boolean
  /** On tablet widths the sidebar is a rail; this opens it over the page. */
  railOpen: boolean
  setCommandOpen: (open: boolean) => void
  openQuickCreate: (type: CreateType) => void
  closeQuickCreate: () => void
  openDrawer: (target: NonNullable<DrawerTarget>) => void
  closeDrawer: () => void
  setMobileNavOpen: (open: boolean) => void
  setAssistantOpen: (open: boolean) => void
  setRailOpen: (open: boolean) => void
}

export const useUI = create<UIState>()((set) => ({
  commandOpen: false,
  quickCreate: null,
  drawer: null,
  mobileNavOpen: false,
  assistantOpen: false,
  railOpen: false,
  setCommandOpen: (commandOpen) => set({ commandOpen }),
  openQuickCreate: (quickCreate) => set({ quickCreate, commandOpen: false }),
  closeQuickCreate: () => set({ quickCreate: null }),
  openDrawer: (drawer) => set({ drawer }),
  closeDrawer: () => set({ drawer: null }),
  setMobileNavOpen: (mobileNavOpen) => set({ mobileNavOpen }),
  setAssistantOpen: (assistantOpen) => set({ assistantOpen }),
  setRailOpen: (railOpen) => set({ railOpen }),
}))
