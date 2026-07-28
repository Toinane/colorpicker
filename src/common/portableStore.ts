import { getPortableDataDir } from './ipc'

// Fixed for the lifetime of the process (decided by the Rust binary's
// compile-time `portable` feature, see src-tauri/src/portable.rs) — fetched
// once and cached, including in-flight, so concurrent store `initialize()`
// calls across the app don't each fire their own IPC round-trip.
let portableDirPromise: Promise<string | null> | null = null

/**
 * Resolve a plugin-store file name to an absolute path inside the portable
 * data directory in a portable build, or leave it untouched (resolved by
 * tauri-plugin-store's usual app-data-dir logic) in a normal build.
 */
export const resolveStoreFile = async (filename: string): Promise<string> => {
  if (!portableDirPromise) {
    portableDirPromise = getPortableDataDir()
  }
  const dir = await portableDirPromise
  return dir ? `${dir}\\${filename}` : filename
}
