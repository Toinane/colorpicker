import { createHistoryStore } from '@common/createHistoryStore'
import { useSettingsStore } from './settingsStore'

/** History of colors picked with the native eyedropper — see colorpicker.tsx's color-picked listener. */
export const usePickerHistoryStore = createHistoryStore({
  fileName: 'picker-history.json',
  maxSize: () => useSettingsStore.getState().maxHistorySize,
  // No debounce: every pick (single or multi-pick) is already a discrete,
  // deliberate action, unlike a continuous slider drag.
})
