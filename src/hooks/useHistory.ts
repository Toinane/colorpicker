import { useEffect } from 'react'
import { usePickerHistoryStore } from '@stores/pickerHistoryStore'
import { useColorHistoryStore } from '@stores/colorHistoryStore'
import { useLastColorStore } from '@stores/lastColorStore'

/**
 * Hook to initialize the independent history stores (picker picks, manual
 * color edits) and restore the last active color on app startup. Should be
 * called once at the root level of the app — same pattern as
 * `useInitializeSettings`. The three stores are unrelated to each other;
 * this hook just kicks all three off together for convenience.
 */
export function useInitializeHistory() {
  const initPickerHistory = usePickerHistoryStore((state) => state.initialize)
  const initColorHistory = useColorHistoryStore((state) => state.initialize)
  const initLastColor = useLastColorStore((state) => state.initialize)

  useEffect(() => {
    initPickerHistory()
    initColorHistory()
    initLastColor()
  }, [initPickerHistory, initColorHistory, initLastColor])
}
