import { create } from 'zustand'
import type { Store } from '@tauri-apps/plugin-store'

import type { IPalettesCategory, IPalettesSchema } from '@interfaces/palettes'
import { migratePalettes } from '@common/migratePalettes'
import { openStore, persistToStore, initializeStore } from '@common/persistedStore'

const PALETTES_FILE = 'palettes.json'

interface PalettesStore {
  categories: IPalettesCategory[]
  /** The category Ctrl/Cmd+S saves into from the main window (G13). */
  activeCategoryId: string | null
  isLoading: boolean
  isInitialized: boolean
  error: string | null
  initialize: () => Promise<void>
  setActiveCategory: (id: string) => Promise<void>
  addCategory: (name: string) => Promise<void>
  deleteCategory: (id: string) => Promise<void>
  addColor: (categoryId: string, value: string) => Promise<void>
  addColorToActiveCategory: (value: string) => Promise<void>
  deleteColor: (categoryId: string, colorId: string) => Promise<void>
}

/**
 * Palettes categories/colors, persisted to its own `palettes.json`. On
 * first run (file doesn't exist yet), seeds from the legacy v2 storage file
 * via `migratePalettes` rather than starting empty. Every mutator persists
 * immediately and awaits `store.save()` before resolving — deliberately no
 * separate "save" action, since the legacy app advertised a Ctrl/Cmd+S save
 * shortcut that did nothing (G13) and separately failed to persist deletes
 * (G12); the fix here is that there's nothing to forget to save.
 */
export const usePalettesStore = create<PalettesStore>((set, get) => {
  let storeHandle: Store | null = null

  const persist = (categories: IPalettesCategory[]): Promise<void> => {
    const schema: IPalettesSchema = { version: 1, categories }
    return persistToStore(storeHandle, { schema })
  }

  const persistActiveCategory = (id: string | null): Promise<void> =>
    persistToStore(storeHandle, { activeCategoryId: id })

  return {
    categories: [],
    activeCategoryId: null,
    isLoading: false,
    isInitialized: false,
    error: null,

    initialize: () =>
      initializeStore(
        get,
        set,
        async () => {
          storeHandle = await openStore(PALETTES_FILE, { autoSave: false })
          const existing = await storeHandle.get<IPalettesSchema>('schema')

          const categories = existing ? existing.categories : (await migratePalettes()).categories
          if (!existing) {
            await persist(categories)
          }

          let activeCategoryId = (await storeHandle.get<string>('activeCategoryId')) ?? null
          if (!activeCategoryId && categories.length > 0) {
            activeCategoryId = categories[0].id
            await persistActiveCategory(activeCategoryId)
          }

          return { categories, activeCategoryId }
        },
        (err) => console.error('Failed to load palettes:', err),
      ),

    setActiveCategory: async (id) => {
      set({ activeCategoryId: id })
      await persistActiveCategory(id)
    },

    addCategory: async (name) => {
      const prevActiveCategoryId = get().activeCategoryId
      const category: IPalettesCategory = { id: crypto.randomUUID(), name, colors: [] }
      const categories = [...get().categories, category]
      const activeCategoryId = prevActiveCategoryId ?? category.id
      set({ categories, activeCategoryId })
      await persist(categories)
      if (!prevActiveCategoryId) {
        await persistActiveCategory(activeCategoryId)
      }
    },

    deleteCategory: async (id) => {
      const prevActiveCategoryId = get().activeCategoryId
      const categories = get().categories.filter((category) => category.id !== id)
      const activeCategoryId =
        prevActiveCategoryId === id ? (categories[0]?.id ?? null) : prevActiveCategoryId
      set({ categories, activeCategoryId })
      await persist(categories)
      if (activeCategoryId !== prevActiveCategoryId) {
        await persistActiveCategory(activeCategoryId)
      }
    },

    addColor: async (categoryId, value) => {
      const categories = get().categories.map((category) =>
        category.id === categoryId
          ? { ...category, colors: [...category.colors, { id: crypto.randomUUID(), value }] }
          : category,
      )
      set({ categories })
      await persist(categories)
    },

    addColorToActiveCategory: async (value) => {
      const categoryId = get().activeCategoryId ?? get().categories[0]?.id
      if (!categoryId) return
      await get().addColor(categoryId, value)
    },

    deleteColor: async (categoryId, colorId) => {
      const categories = get().categories.map((category) =>
        category.id === categoryId
          ? { ...category, colors: category.colors.filter((color) => color.id !== colorId) }
          : category,
      )
      set({ categories })
      await persist(categories)
    },
  }
})
