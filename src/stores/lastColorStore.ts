import { create } from 'zustand'
import type { Store } from '@tauri-apps/plugin-store'
import Color from 'colorjs.io'

import { useColorStore } from './colorStore'
import { toHex } from '@common/color'
import debounce from '@common/debounce'
import { openStore, persistToStore, initializeStore } from '@common/persistedStore'

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

  const persistDebounced = debounce(async (hex: string) => {
    try {
      await persistToStore(storeHandle, { lastColor: hex })
    } catch (err) {
      console.error('Failed to persist last color:', err)
    }
  }, PERSIST_DEBOUNCE_MS)

  return {
    isLoading: false,
    isInitialized: false,
    error: null,

    initialize: async () => {
      await initializeStore(
        get,
        set,
        async () => {
          storeHandle = await openStore(LAST_COLOR_FILE, { autoSave: false })
          const lastColor = await storeHandle.get<string>('lastColor')

          if (lastColor) {
            try {
              useColorStore.getState().setColor(new Color(lastColor))
            } catch (err) {
              console.error('Failed to restore last color:', err)
            }
          }

          return {}
        },
        (err) => console.error('Failed to load last color:', err),
      )

      // Subscribed after restoring above, so that restore doesn't itself
      // immediately re-trigger a (redundant, if harmless) persist. Always
      // runs (even if already initialized) but is itself idempotent.
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
