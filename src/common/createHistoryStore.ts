import { create, type StoreApi, type UseBoundStore } from 'zustand'
import { load, type Store } from '@tauri-apps/plugin-store'

import debounce from './debounce'
import { pushHistoryEntry } from './history'

export interface HistoryStore {
  history: string[]
  isLoading: boolean
  isInitialized: boolean
  error: string | null

  initialize: () => Promise<void>
  /** Commit a color to this history. Debounced or immediate depending on how the store was created. */
  commitColor: (hex: string) => void
  clearHistory: () => Promise<void>
}

export interface CreateHistoryStoreOptions {
  /** Storage file name (via plugin-store), e.g. `"picker-history.json"`. Must be unique per instance. */
  fileName: string
  /** Max entries kept, or a function to read it dynamically (e.g. from a setting). Default 50. */
  maxSize?: number | (() => number)
  /** If set, `commitColor` is debounced by this many ms — for a continuous source (a slider drag). Omit for a discrete source (a pick), where every commit should land immediately. */
  debounceMs?: number
}

/**
 * Create an independent, persisted color-history store.
 *
 * Each call produces its own zustand store *and* its own storage file —
 * history from one feature (e.g. the eyedropper) never mixes with another's
 * (e.g. manual RGB slider edits) unless that feature explicitly commits to
 * both. Nothing subscribes to anything automatically; the feature that owns
 * a given user action calls `commitColor` itself, at the point that action
 * actually happens.
 */
export function createHistoryStore(
  options: CreateHistoryStoreOptions,
): UseBoundStore<StoreApi<HistoryStore>> {
  const { fileName, maxSize = 50, debounceMs } = options
  let storeHandle: Store | null = null

  const resolveMaxSize = (): number => (typeof maxSize === 'function' ? maxSize() : maxSize)

  const persist = async (history: string[]): Promise<void> => {
    if (!storeHandle) return
    await storeHandle.set('history', history)
    await storeHandle.save()
  }

  return create<HistoryStore>((set, get) => {
    const commitNow = (hex: string) => {
      const nextHistory = pushHistoryEntry(get().history, hex, resolveMaxSize())
      set({ history: nextHistory })
      persist(nextHistory).catch((err) => {
        console.error(`Failed to persist history (${fileName}):`, err)
      })
    }

    // Wrapped rather than assigned directly: `debounce`'s return value
    // resolves a Promise once the trailing call fires, but `commitColor`
    // callers never need that — this guarantees a true `void` signature.
    const debouncedCommit = debounceMs ? debounce(commitNow, debounceMs) : null
    const commitColor = debouncedCommit ? (hex: string) => void debouncedCommit(hex) : commitNow

    return {
      history: [],
      isLoading: false,
      isInitialized: false,
      error: null,

      commitColor,

      initialize: async () => {
        if (get().isInitialized || get().isLoading) return
        set({ isLoading: true, error: null })

        try {
          storeHandle = await load(fileName, { autoSave: false })
          const history = (await storeHandle.get<string[]>('history')) ?? []
          set({ history, isInitialized: true, isLoading: false })
        } catch (err) {
          console.error(`Failed to load history (${fileName}):`, err)
          set({ isInitialized: true, isLoading: false, error: String(err) })
        }
      },

      clearHistory: async () => {
        set({ history: [] })
        await persist([])
      },
    }
  })
}
