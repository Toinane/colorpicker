import { create } from 'zustand'
import { load, type Store } from '@tauri-apps/plugin-store'
import Color from 'colorjs.io'

import { useColorStore } from './colorStore'
import { toHex } from '@common/color'
import debounce from '@common/debounce'

const LAST_COLOR_FILE = 'last-color.json'
const PERSIST_DEBOUNCE_MS = 600

interface LastColorStore {
  isLoading: boolean
  isInitialized: boolean
  error: string | null
  initialize: () => Promise<void>
}

/**
 * Remembers the single last-active color across restarts. Deliberately its
 * own concern, not part of either history log: "what color was open when
 * you closed the app" isn't a history of anything, and mixing it into a
 * history store would tie an unrelated feature's persistence to it.
 */
export const useLastColorStore = create<LastColorStore>((set, get) => {
  let storeHandle: Store | null = null
  let unsubscribeColorStore: (() => void) | null = null

  const persistDebounced = debounce((hex: string) => {
    if (!storeHandle) return
    storeHandle
      .set('lastColor', hex)
      .then(() => storeHandle?.save())
      .catch((err) => console.error('Failed to persist last color:', err))
  }, PERSIST_DEBOUNCE_MS)

  return {
    isLoading: false,
    isInitialized: false,
    error: null,

    initialize: async () => {
      if (get().isInitialized || get().isLoading) return
      set({ isLoading: true, error: null })

      try {
        storeHandle = await load(LAST_COLOR_FILE, { autoSave: false })
        const lastColor = await storeHandle.get<string>('lastColor')
        set({ isInitialized: true, isLoading: false })

        if (lastColor) {
          try {
            useColorStore.getState().setColor(new Color(lastColor))
          } catch (err) {
            console.error('Failed to restore last color:', err)
          }
        }
      } catch (err) {
        console.error('Failed to load last color:', err)
        set({ isInitialized: true, isLoading: false, error: String(err) })
      }

      // Subscribed after restoring above, so that restore doesn't itself
      // immediately re-trigger a (redundant, if harmless) persist.
      if (!unsubscribeColorStore) {
        unsubscribeColorStore = useColorStore.subscribe((state, prevState) => {
          if (state.color !== prevState.color) {
            persistDebounced(toHex(state.color))
          }
        })
      }
    },
  }
})
