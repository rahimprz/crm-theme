import { create } from 'zustand'

export type ToastTone = 'success' | 'info' | 'warning' | 'danger' | 'celebrate'

export interface Toast {
  id: string
  title: string
  description?: string
  tone: ToastTone
  duration: number
}

interface ToastState {
  toasts: Toast[]
  push: (t: Omit<Toast, 'id' | 'duration'> & { duration?: number }) => string
  dismiss: (id: string) => void
}

export const useToasts = create<ToastState>()((set) => ({
  toasts: [],
  push: (t) => {
    const id = Math.random().toString(36).slice(2)
    set((s) => ({ toasts: [...s.toasts.slice(-3), { duration: 4200, ...t, id }] }))
    return id
  },
  dismiss: (id) => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
}))

/** Call from anywhere: toast.success('Saved'), toast.info('…', 'details'). */
export const toast = {
  success: (title: string, description?: string) => useToasts.getState().push({ title, description, tone: 'success' }),
  info: (title: string, description?: string) => useToasts.getState().push({ title, description, tone: 'info' }),
  warning: (title: string, description?: string) => useToasts.getState().push({ title, description, tone: 'warning' }),
  danger: (title: string, description?: string) => useToasts.getState().push({ title, description, tone: 'danger' }),
  celebrate: (title: string, description?: string) =>
    useToasts.getState().push({ title, description, tone: 'celebrate', duration: 5200 }),
}
