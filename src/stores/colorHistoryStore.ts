import { createHistoryStore } from '@common/createHistoryStore'
import { useSettingsStore } from './settingsStore'

const COMMIT_DEBOUNCE_MS = 600

/** History of colors from manual manipulation (RGB sliders, hex input) — separate from picker history. */
export const useColorHistoryStore = createHistoryStore({
  fileName: 'color-history.json',
  maxSize: () => useSettingsStore.getState().maxHistorySize,
  // Debounced: a slider drag fires many rapid color changes; commit one
  // entry ~600ms after it settles, not one per tick.
  debounceMs: COMMIT_DEBOUNCE_MS,
})
