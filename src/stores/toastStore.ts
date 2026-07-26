import { create } from 'zustand'

export interface Toast {
  id: number
  message: string
}

interface ToastStore {
  toasts: Toast[]
  addToast: (message: string, duration?: number) => void
  removeToast: (id: number) => void
}

let nextId = 0

const DEFAULT_DURATION = 4000

export const useToastStore = create<ToastStore>((set, get) => ({
  toasts: [],

  addToast: (message, duration = DEFAULT_DURATION) => {
    const id = nextId++
    set({ toasts: [...get().toasts, { id, message }] })
    setTimeout(() => get().removeToast(id), duration)
  },

  removeToast: (id) => {
    set({ toasts: get().toasts.filter((toast) => toast.id !== id) })
  },
}))

/** Show a toast notification from anywhere, no hook needed. */
export const showToast = (message: string, duration?: number): void =>
  useToastStore.getState().addToast(message, duration)
