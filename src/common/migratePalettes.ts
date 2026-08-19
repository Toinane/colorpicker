/**
 * One-time v2 (Electron/electron-json-storage) -> v3 Palettes migration.
 * Only ever called from `palettesStore.initialize()`, gated on the v1
 * `palettes.json` not existing yet — so this only runs once, on first
 * launch after upgrading (or on a fresh install).
 */
import { readLegacyPalettes, backupCorruptLegacyPalettes } from './ipc'
import type { IPalettesCategoryV1, IPalettesSchemaV1 } from '@interfaces/palettes'

interface LegacyStorageShape {
  colorsbook?: {
    colors?: Record<string, unknown>
  }
}

// Legacy v2 defaults (src/storage.js on the v2 branch) — used both for fresh
// installs and as the fallback when the legacy file can't be read/parsed.
const DEFAULT_PACKS: Record<string, string[]> = {
  flat: [
    '#2196F3',
    '#00BCD4',
    '#4CAF50',
    '#8BC34A',
    '#FFEB3B',
    '#FF9800',
    '#FF5722',
    '#F44336',
    '#673AB7',
    '#3F51B5',
    '#607D8B',
  ],
  pastel: [
    '#7E93C8',
    '#8FC1E2',
    '#AFBBE3',
    '#EFCAC4',
    '#E19494',
    '#F8AF85',
    '#F9C48C',
    '#C2BB9B',
    '#B0D9CD',
    '#6B8790',
    '#AC94C9',
  ],
}

/**
 * Builds v1 categories from a legacy "pack name -> hex array" map, skipping
 * any entry that isn't a real array (e.g. `undefined`/`null`) — the legacy
 * `deleteCategory()` sets a deleted category to `undefined` instead of
 * removing the key (see #175/#176, guard G12), so a naive migration would
 * resurrect deleted categories.
 */
const buildCategoriesFromPacks = (packs: Record<string, unknown>): IPalettesCategoryV1[] =>
  Object.entries(packs)
    .filter((entry): entry is [string, string[]] => Array.isArray(entry[1]))
    .map(([name, colors]) => ({
      id: crypto.randomUUID(),
      name,
      colors: colors
        .filter((value): value is string => typeof value === 'string')
        .map((value) => ({ id: crypto.randomUUID(), value })),
    }))

const defaultSchema = (): IPalettesSchemaV1 => ({
  version: 1,
  categories: buildCategoriesFromPacks(DEFAULT_PACKS),
})

export const migratePalettes = async (): Promise<IPalettesSchemaV1> => {
  let raw: string | null
  try {
    raw = await readLegacyPalettes()
  } catch (err) {
    console.error('Failed to read legacy storage file:', err)
    return defaultSchema()
  }

  if (!raw) {
    return defaultSchema()
  }

  let legacy: LegacyStorageShape
  try {
    legacy = JSON.parse(raw)
  } catch (err) {
    console.error('Legacy storage file is corrupt, backing it up:', err)
    try {
      await backupCorruptLegacyPalettes()
    } catch (backupErr) {
      console.error('Failed to back up corrupt legacy storage file:', backupErr)
    }
    return defaultSchema()
  }

  const packs = legacy.colorsbook?.colors
  return {
    version: 1,
    categories: packs ? buildCategoriesFromPacks(packs) : buildCategoriesFromPacks(DEFAULT_PACKS),
  }
}
