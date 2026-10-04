import { createJSONStorage } from 'zustand/middleware'

/**
 * localStorage wrapper that never throws (private windows, blocked storage,
 * embedded previews). If storage is unavailable the app simply starts fresh.
 */
export const safeStorage = createJSONStorage(() => ({
  getItem: (key: string) => {
    try {
      return window.localStorage.getItem(key)
    } catch {
      return null
    }
  },
  setItem: (key: string, value: string) => {
    try {
      window.localStorage.setItem(key, value)
    } catch {
      /* storage unavailable */
    }
  },
  removeItem: (key: string) => {
    try {
      window.localStorage.removeItem(key)
    } catch {
      /* storage unavailable */
    }
  },
}))
