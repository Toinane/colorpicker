/**
 * One-time v1 -> v3 Palettes schema upgrade. Wraps each v1 category's flat
 * hex colors in a single default (unlabeled) Color Section, and promotes
 * each color to the richer v3 shape (structured value + backfilled
 * metadata). Only ever called from `palettesStore.initialize()` when the
 * stored schema's version isn't already 3.
 */
import { hexToColorValue } from './color'
import type {
  IPalettesSchemaV1,
  IPalettesSchema,
  IPalette,
  IPalettesColor,
  IColorSectionDisplay,
} from '@interfaces/palettes'

export const DEFAULT_PALETTE_DISPLAY: IColorSectionDisplay = {
  variant: 'single',
  size: 'md',
  showNames: true,
  fullNames: false,
}

export const upgradeSchemaToV3 = (v1: IPalettesSchemaV1): IPalettesSchema => {
  const now = new Date().toISOString()

  const palettes: IPalette[] = v1.categories.map((category, index) => {
    const colors: IPalettesColor[] = category.colors.map((color) => ({
      id: color.id,
      value: hexToColorValue(color.value),
      source: 'manual',
      tags: [],
      favorite: false,
      createdAt: now,
      updatedAt: now,
    }))

    return {
      id: category.id,
      name: category.name,
      sectionId: null,
      order: index * 1000,
      display: DEFAULT_PALETTE_DISPLAY,
      colorSections: [{ id: crypto.randomUUID(), colors }],
    }
  })

  return {
    version: 3,
    paletteSections: [],
    palettes,
    defaultPaletteDisplay: DEFAULT_PALETTE_DISPLAY,
  }
}
