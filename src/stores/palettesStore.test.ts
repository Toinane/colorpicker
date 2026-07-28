import { describe, it, expect, vi, beforeEach } from 'vitest'

const { load, migratePalettes } = vi.hoisted(() => ({
  load: vi.fn(),
  migratePalettes: vi.fn(),
}))

vi.mock('@tauri-apps/plugin-store', () => ({ load }))
vi.mock('@common/migratePalettes', () => ({ migratePalettes }))
vi.mock('@common/portableStore', () => ({ resolveStoreFile: (filename: string) => filename }))

import { usePalettesStore } from './palettesStore'

const makeFakeStore = (initial: unknown = undefined) => {
  const data = new Map<string, unknown>([['schema', initial]])
  return {
    get: vi.fn(async (key: string) => data.get(key)),
    set: vi.fn(async (key: string, value: unknown) => {
      data.set(key, value)
    }),
    save: vi.fn(async () => {}),
    _data: data,
  }
}

beforeEach(() => {
  vi.clearAllMocks()
  usePalettesStore.setState({
    categories: [],
    activeCategoryId: null,
    isLoading: false,
    isInitialized: false,
    error: null,
  })
})

describe('palettesStore', () => {
  it('runs migration and persists the result when no schema is on disk yet', async () => {
    const fakeStore = makeFakeStore(undefined)
    load.mockResolvedValue(fakeStore)
    migratePalettes.mockResolvedValue({
      version: 1,
      categories: [{ id: 'cat-1', name: 'flat', colors: [{ id: 'col-1', value: '#2196F3' }] }],
    })

    await usePalettesStore.getState().initialize()

    expect(migratePalettes).toHaveBeenCalledTimes(1)
    expect(usePalettesStore.getState().categories).toHaveLength(1)
    expect(usePalettesStore.getState().activeCategoryId).toBe('cat-1')
    expect(fakeStore.save).toHaveBeenCalled()
  })

  it('loads existing categories without re-running migration when a schema already exists', async () => {
    const fakeStore = makeFakeStore({
      version: 1,
      categories: [{ id: 'cat-1', name: 'existing', colors: [] }],
    })
    load.mockResolvedValue(fakeStore)

    await usePalettesStore.getState().initialize()

    expect(migratePalettes).not.toHaveBeenCalled()
    expect(usePalettesStore.getState().categories).toEqual([
      { id: 'cat-1', name: 'existing', colors: [] },
    ])
  })

  it('deleteCategory removes the category from state and persists the removal (G12)', async () => {
    const fakeStore = makeFakeStore({
      version: 1,
      categories: [
        { id: 'cat-1', name: 'flat', colors: [] },
        { id: 'cat-2', name: 'pastel', colors: [] },
      ],
    })
    load.mockResolvedValue(fakeStore)

    await usePalettesStore.getState().initialize()
    await usePalettesStore.getState().deleteCategory('cat-1')

    expect(usePalettesStore.getState().categories.map((c) => c.id)).toEqual(['cat-2'])
    expect(fakeStore.save).toHaveBeenCalled()

    const persisted = fakeStore._data.get('schema') as { categories: { id: string }[] }
    expect(persisted.categories.map((c) => c.id)).toEqual(['cat-2'])
  })

  it('addColor then deleteColor round-trips through persisted state', async () => {
    const fakeStore = makeFakeStore({
      version: 1,
      categories: [{ id: 'cat-1', name: 'flat', colors: [] }],
    })
    load.mockResolvedValue(fakeStore)

    await usePalettesStore.getState().initialize()
    await usePalettesStore.getState().addColor('cat-1', '#ABCDEF')

    const afterAdd = usePalettesStore.getState().categories[0].colors
    expect(afterAdd).toHaveLength(1)

    await usePalettesStore.getState().deleteColor('cat-1', afterAdd[0].id)

    expect(usePalettesStore.getState().categories[0].colors).toHaveLength(0)
    const persisted = fakeStore._data.get('schema') as {
      categories: { colors: unknown[] }[]
    }
    expect(persisted.categories[0].colors).toHaveLength(0)
  })

  it('#176 script: create category, add colors, delete it, "restart" — still deleted (G12)', async () => {
    const fakeStore = makeFakeStore({
      version: 1,
      categories: [{ id: 'cat-1', name: 'flat', colors: [] }],
    })
    load.mockResolvedValue(fakeStore)

    await usePalettesStore.getState().initialize()
    await usePalettesStore.getState().addCategory('my palette')
    const created = usePalettesStore.getState().categories.find((c) => c.name === 'my palette')!
    await usePalettesStore.getState().addColor(created.id, '#123456')
    await usePalettesStore.getState().deleteCategory(created.id)

    // Simulate an app restart: reset in-memory state, re-`initialize()`
    // against the same persisted backing store.
    usePalettesStore.setState({
      categories: [],
      activeCategoryId: null,
      isLoading: false,
      isInitialized: false,
      error: null,
    })
    await usePalettesStore.getState().initialize()

    expect(usePalettesStore.getState().categories.some((c) => c.name === 'my palette')).toBe(false)
  })

  it('addColorToActiveCategory saves into the active category (Ctrl/Cmd+S, G13)', async () => {
    const fakeStore = makeFakeStore({
      version: 1,
      categories: [
        { id: 'cat-1', name: 'flat', colors: [] },
        { id: 'cat-2', name: 'pastel', colors: [] },
      ],
    })
    load.mockResolvedValue(fakeStore)

    await usePalettesStore.getState().initialize()
    await usePalettesStore.getState().setActiveCategory('cat-2')
    await usePalettesStore.getState().addColorToActiveCategory('#654321')

    const pastel = usePalettesStore.getState().categories.find((c) => c.id === 'cat-2')!
    expect(pastel.colors.map((c) => c.value)).toEqual(['#654321'])
    const flat = usePalettesStore.getState().categories.find((c) => c.id === 'cat-1')!
    expect(flat.colors).toHaveLength(0)
  })
})
