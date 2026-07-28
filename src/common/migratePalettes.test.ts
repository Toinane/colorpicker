import { describe, it, expect, vi, beforeEach } from 'vitest'

const { readLegacyPalettes, backupCorruptLegacyPalettes } = vi.hoisted(() => ({
  readLegacyPalettes: vi.fn(),
  backupCorruptLegacyPalettes: vi.fn(),
}))

vi.mock('./ipc', () => ({ readLegacyPalettes, backupCorruptLegacyPalettes }))

import { migratePalettes } from './migratePalettes'

const namesOf = (schema: Awaited<ReturnType<typeof migratePalettes>>) =>
  schema.categories.map((category) => category.name).sort()

beforeEach(() => {
  vi.clearAllMocks()
})

describe('migratePalettes', () => {
  it('seeds the default flat/pastel packs when no legacy file exists', async () => {
    readLegacyPalettes.mockResolvedValue(null)

    const schema = await migratePalettes()

    expect(schema.version).toBe(1)
    expect(namesOf(schema)).toEqual(['flat', 'pastel'])
    expect(schema.categories.find((c) => c.name === 'flat')?.colors).toHaveLength(11)
    expect(backupCorruptLegacyPalettes).not.toHaveBeenCalled()
  })

  it('imports legacy categories and assigns ids, skipping a deleted-as-undefined category (G12)', async () => {
    readLegacyPalettes.mockResolvedValue(
      JSON.stringify({
        colorsbook: {
          colors: {
            favorites: ['#111111', '#222222'],
            deleted: null,
          },
        },
      }),
    )

    const schema = await migratePalettes()

    expect(namesOf(schema)).toEqual(['favorites'])
    const favorites = schema.categories.find((c) => c.name === 'favorites')!
    expect(favorites.id).toBeTruthy()
    expect(favorites.colors).toEqual([
      { id: expect.any(String), value: '#111111' },
      { id: expect.any(String), value: '#222222' },
    ])
    expect(backupCorruptLegacyPalettes).not.toHaveBeenCalled()
  })

  it('backs up a corrupt legacy file and falls back to defaults without deleting it (G14)', async () => {
    readLegacyPalettes.mockResolvedValue('{ not valid json')
    backupCorruptLegacyPalettes.mockResolvedValue(undefined)

    const schema = await migratePalettes()

    expect(backupCorruptLegacyPalettes).toHaveBeenCalledTimes(1)
    expect(namesOf(schema)).toEqual(['flat', 'pastel'])
  })
})
