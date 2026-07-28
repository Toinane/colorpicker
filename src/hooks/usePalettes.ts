import { useEffect } from 'react'
import { usePalettesStore } from '@stores/palettesStore'

/**
 * Initialize the Palettes store on app startup — in every window, not
 * just the Palettes one, since the main window needs `activeCategoryId`
 * ready for Ctrl/Cmd+S (G13) even if the Palettes window is never opened.
 */
export function useInitializePalettes() {
  const initialize = usePalettesStore((state) => state.initialize)

  useEffect(() => {
    initialize()
  }, [initialize])
}
