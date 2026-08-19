import { create } from 'zustand'
import type { Store } from '@tauri-apps/plugin-store'

import type {
  IPalette,
  IPaletteSection,
  IColorSectionDisplay,
  IPalettesSchema,
  IPalettesSchemaV1,
} from '@interfaces/palettes'
import { migratePalettes } from '@common/migratePalettes'
import { upgradeSchemaToV3, DEFAULT_PALETTE_DISPLAY } from '@common/upgradePalettesSchema'
import { hexToColorValue } from '@common/color'
import { openStore, persistToStore, initializeStore } from '@common/persistedStore'

const PALETTES_FILE = 'palettes.json'

interface PalettesStore {
  paletteSections: IPaletteSection[]
  palettes: IPalette[]
  defaultPaletteDisplay: IColorSectionDisplay
  /** The palette Ctrl/Cmd+S saves into from the main window (G13). */
  activePaletteId: string | null
  isLoading: boolean
  isInitialized: boolean
  error: string | null
  initialize: () => Promise<void>
  setActivePalette: (id: string) => Promise<void>
  addPalette: (name: string) => Promise<void>
  deletePalette: (id: string) => Promise<void>
  addColor: (paletteId: string, colorSectionId: string, hex: string) => Promise<void>
  addColorToActivePalette: (hex: string) => Promise<void>
  deleteColor: (paletteId: string, colorSectionId: string, colorId: string) => Promise<void>
}

/**
 * Palette Sections/Palettes/Color Sections/Colors, persisted to its own
 * `palettes.json`. On first run (file doesn't exist yet), seeds from the
 * legacy v2 storage file via `migratePalettes` rather than starting empty.
 * An existing v1 schema (flat categories/colors, pre-hierarchy) is upgraded
 * in place via `upgradeSchemaToV3`. Every mutator persists immediately and
 * awaits `store.save()` before resolving — deliberately no separate "save"
 * action, since the legacy app advertised a Ctrl/Cmd+S save shortcut that
 * did nothing (G13) and separately failed to persist deletes (G12); the fix
 * here is that there's nothing to forget to save.
 */
export const usePalettesStore = create<PalettesStore>((set, get) => {
  let storeHandle: Store | null = null

  const persist = (
    paletteSections: IPaletteSection[],
    palettes: IPalette[],
    defaultPaletteDisplay: IColorSectionDisplay,
  ): Promise<void> => {
    const schema = { version: 3 as const, paletteSections, palettes, defaultPaletteDisplay }
    return persistToStore(storeHandle, { schema })
  }

  const persistActivePalette = (id: string | null): Promise<void> =>
    persistToStore(storeHandle, { activePaletteId: id })

  return {
    paletteSections: [],
    palettes: [],
    defaultPaletteDisplay: DEFAULT_PALETTE_DISPLAY,
    activePaletteId: null,
    isLoading: false,
    isInitialized: false,
    error: null,

    initialize: () =>
      initializeStore(
        get,
        set,
        async () => {
          storeHandle = await openStore(PALETTES_FILE, { autoSave: false })
          const existing = await storeHandle.get<{ version: number }>('schema')

          let schema: IPalettesSchema
          if (existing?.version === 3) {
            schema = existing as IPalettesSchema
          } else if (existing?.version === 1) {
            schema = upgradeSchemaToV3(existing as IPalettesSchemaV1)
            await persist(schema.paletteSections, schema.palettes, schema.defaultPaletteDisplay)
          } else {
            schema = upgradeSchemaToV3(await migratePalettes())
            await persist(schema.paletteSections, schema.palettes, schema.defaultPaletteDisplay)
          }

          let activePaletteId =
            (await storeHandle.get<string>('activePaletteId')) ??
            (await storeHandle.get<string>('activeCategoryId')) ??
            null
          if (!activePaletteId && schema.palettes.length > 0) {
            activePaletteId = schema.palettes[0].id
            await persistActivePalette(activePaletteId)
          }

          return {
            paletteSections: schema.paletteSections,
            palettes: schema.palettes,
            defaultPaletteDisplay: schema.defaultPaletteDisplay,
            activePaletteId,
          }
        },
        (err) => console.error('Failed to load palettes:', err),
      ),

    setActivePalette: async (id) => {
      set({ activePaletteId: id })
      await persistActivePalette(id)
    },

    addPalette: async (name) => {
      const prevActivePaletteId = get().activePaletteId
      const { palettes, paletteSections, defaultPaletteDisplay } = get()
      const rootOrders = [
        ...paletteSections.map((section) => section.order),
        ...palettes.filter((palette) => palette.sectionId === null).map((palette) => palette.order),
      ]
      const order = rootOrders.length > 0 ? Math.max(...rootOrders) + 1000 : 1000

      const palette: IPalette = {
        id: crypto.randomUUID(),
        name,
        sectionId: null,
        order,
        display: defaultPaletteDisplay,
        colorSections: [{ id: crypto.randomUUID(), colors: [] }],
      }
      const nextPalettes = [...palettes, palette]
      const activePaletteId = prevActivePaletteId ?? palette.id
      set({ palettes: nextPalettes, activePaletteId })
      await persist(paletteSections, nextPalettes, defaultPaletteDisplay)
      if (!prevActivePaletteId) {
        await persistActivePalette(activePaletteId)
      }
    },

    deletePalette: async (id) => {
      const prevActivePaletteId = get().activePaletteId
      const { paletteSections, defaultPaletteDisplay } = get()
      const palettes = get().palettes.filter((palette) => palette.id !== id)
      const activePaletteId =
        prevActivePaletteId === id ? (palettes[0]?.id ?? null) : prevActivePaletteId
      set({ palettes, activePaletteId })
      await persist(paletteSections, palettes, defaultPaletteDisplay)
      if (activePaletteId !== prevActivePaletteId) {
        await persistActivePalette(activePaletteId)
      }
    },

    addColor: async (paletteId, colorSectionId, hex) => {
      const { paletteSections, defaultPaletteDisplay } = get()
      const now = new Date().toISOString()
      const palettes = get().palettes.map((palette) =>
        palette.id === paletteId
          ? {
              ...palette,
              colorSections: palette.colorSections.map((section) =>
                section.id === colorSectionId
                  ? {
                      ...section,
                      colors: [
                        ...section.colors,
                        {
                          id: crypto.randomUUID(),
                          value: hexToColorValue(hex),
                          source: 'manual' as const,
                          tags: [],
                          favorite: false,
                          createdAt: now,
                          updatedAt: now,
                        },
                      ],
                    }
                  : section,
              ),
            }
          : palette,
      )
      set({ palettes })
      await persist(paletteSections, palettes, defaultPaletteDisplay)
    },

    addColorToActivePalette: async (hex) => {
      const paletteId = get().activePaletteId ?? get().palettes[0]?.id
      if (!paletteId) return
      const palette = get().palettes.find((p) => p.id === paletteId)
      const colorSectionId = palette?.colorSections[0]?.id
      if (!colorSectionId) return
      await get().addColor(paletteId, colorSectionId, hex)
    },

    deleteColor: async (paletteId, colorSectionId, colorId) => {
      const { paletteSections, defaultPaletteDisplay } = get()
      const palettes = get().palettes.map((palette) =>
        palette.id === paletteId
          ? {
              ...palette,
              colorSections: palette.colorSections.map((section) =>
                section.id === colorSectionId
                  ? { ...section, colors: section.colors.filter((color) => color.id !== colorId) }
                  : section,
              ),
            }
          : palette,
      )
      set({ palettes })
      await persist(paletteSections, palettes, defaultPaletteDisplay)
    },
  }
})
