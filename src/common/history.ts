/**
 * Pure ring-buffer logic for color history — kept separate from the zustand
 * store factory (@common/createHistoryStore) so it's testable without
 * mocking Tauri's plugin-store or fake timers.
 */

/**
 * Push a newly-committed color onto the front of history, deduplicated
 * against the head (no consecutive duplicate entries — e.g. a slider
 * settling back on the color it started from) and capped at `maxSize`.
 */
export const pushHistoryEntry = (history: string[], hex: string, maxSize: number): string[] => {
  if (history[0] === hex) {
    return history
  }

  return [hex, ...history].slice(0, Math.max(0, maxSize))
}
