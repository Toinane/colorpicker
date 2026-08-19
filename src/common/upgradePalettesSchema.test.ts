import { describe, it, expect } from 'vitest'
import { upgradeSchemaToV3, DEFAULT_PALETTE_DISPLAY } from './upgradePalettesSchema'
import type { IPalettesSchemaV1 } from '@interfaces/palettes'

describe('upgradeSchemaToV3', () => {
  it('wraps each category into a palette with one default color section', () => {
    const v1: IPalettesSchemaV1 = {
      version: 1,
      categories: [
        {
          id: 'cat-1',
          name: 'flat',
          colors: [
            { id: 'col-1', value: '#FF0000' },
            { id: 'col-2', value: '#00FF00' },
          ],
        },
        { id: 'cat-2', name: 'pastel', colors: [] },
      ],
    }

    const v3 = upgradeSchemaToV3(v1)

    expect(v3.version).toBe(3)
    expect(v3.paletteSections).toEqual([])
    expect(v3.defaultPaletteDisplay).toEqual(DEFAULT_PALETTE_DISPLAY)
    expect(v3.palettes).toHaveLength(2)

    const [flat, pastel] = v3.palettes
    expect(flat.id).toBe('cat-1')
    expect(flat.name).toBe('flat')
    expect(flat.sectionId).toBeNull()
    expect(flat.display).toEqual(DEFAULT_PALETTE_DISPLAY)
    expect(flat.colorSections).toHaveLength(1)
    expect(flat.colorSections[0].colors).toHaveLength(2)

    // Order is sequential and increasing, giving room to reorder without
    // renumbering every sibling.
    expect(pastel.order).toBeGreaterThan(flat.order)
  })

  it('backfills v3-only color fields with sane defaults', () => {
    const v1: IPalettesSchemaV1 = {
      version: 1,
      categories: [{ id: 'cat-1', name: 'flat', colors: [{ id: 'col-1', value: '#ABCDEF' }] }],
    }

    const [color] = upgradeSchemaToV3(v1).palettes[0].colorSections[0].colors

    expect(color.id).toBe('col-1')
    expect(color.name).toBeUndefined()
    expect(color.source).toBe('manual')
    expect(color.tags).toEqual([])
    expect(color.favorite).toBe(false)
    expect(color.value).toEqual({
      space: 'srgb',
      coords: [0xab / 255, 0xcd / 255, 0xef / 255],
      alpha: 1,
    })
    expect(color.createdAt).toBe(color.updatedAt)
    expect(() => new Date(color.createdAt).toISOString()).not.toThrow()
  })
})
