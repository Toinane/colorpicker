/**
 * Shared filesystem plumbing for zustand stores backed by `plugin-store`.
 * Every persisted store (settings, palettes, history logs, last color) used
 * to hand-roll the same three things: resolving the file path through the
 * portable-build redirect, the isLoading/isInitialized/error state machine
 * around `initialize()`, and a "set some keys then save" persist step. This
 * centralizes all three so a store only has to describe what to load/persist,
 * not how.
 */
import { load, type Store, type StoreOptions } from '@tauri-apps/plugin-store'

import { resolveStoreFile } from './portableStore'

/** Open a plugin-store file, transparently redirected into the portable data directory when applicable (see portableStore.ts). */
export const openStore = async (fileName: string, options?: StoreOptions): Promise<Store> =>
  load(await resolveStoreFile(fileName), options)

/** Set multiple keys and save in one go. No-op if `store` is `null` (not loaded yet). */
export const persistToStore = async (
  store: Store | null,
  entries: Record<string, unknown>,
): Promise<void> => {
  if (!store) return
  for (const [key, value] of Object.entries(entries)) {
    await store.set(key, value)
  }
  await store.save()
}

export interface InitializableState {
  isLoading: boolean
  isInitialized: boolean
  error: string | null
}

/**
 * The "load once" state machine every persisted store's `initialize()` needs:
 * guards against concurrent/duplicate calls, flips isLoading/isInitialized
 * around the load, and turns a thrown error into `error` rather than an
 * unhandled rejection — a store that fails to load still finishes
 * initializing (with defaults already in state) instead of hanging forever.
 *
 * `loadState` returns the partial state to merge in on success (e.g. the
 * restored `categories`/`history`); side effects that don't affect returned
 * state (subscribing to another store, resolving a first-launch language)
 * can just happen inside it before returning.
 */
export async function initializeStore<S extends InitializableState>(
  get: () => S,
  set: (partial: Partial<S>) => void,
  loadState: () => Promise<Partial<S>>,
  onError?: (err: unknown) => void,
): Promise<void> {
  if (get().isInitialized || get().isLoading) return
  set({ isLoading: true, error: null } as Partial<S>)

  try {
    const patch = await loadState()
    set({ ...patch, isInitialized: true, isLoading: false } as Partial<S>)
  } catch (err) {
    onError?.(err)
    set({ isInitialized: true, isLoading: false, error: String(err) } as Partial<S>)
  }
}
