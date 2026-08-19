// v1 (legacy) shapes — kept only so the v1 -> v3 migration can reference them.
export interface IPalettesColorV1 {
  id: string
  value: string
}

export interface IPalettesCategoryV1 {
  id: string
  name: string
  colors: IPalettesColorV1[]
}

export interface IPalettesSchemaV1 {
  version: 1
  categories: IPalettesCategoryV1[]
}

// v3 (current) shapes.
export type IPalettesColorSource = 'manual' | 'picked' | 'imported'

export interface IPalettesColorValue {
  space: string // colorjs.io space id, e.g. 'srgb'
  coords: [number, number, number]
  alpha: number
}

export interface IPalettesColor {
  id: string
  name?: string
  value: IPalettesColorValue
  source: IPalettesColorSource
  tags: string[]
  favorite: boolean
  notes?: string
  createdAt: string
  updatedAt: string
}

export interface IColorSection {
  id: string
  label?: string
  colors: IPalettesColor[]
}

export interface IColorSectionDisplay {
  variant: 'single' | 'swatch'
  size: 'xs' | 'sm' | 'md' | 'lg'
  showNames: boolean
  fullNames: boolean
}

export interface IPalette {
  id: string
  name: string
  color?: string
  sectionId: string | null
  order: number
  display: IColorSectionDisplay
  colorSections: IColorSection[]
}

export interface IPaletteSection {
  id: string
  name: string
  isOpen: boolean
  order: number
}

export interface IPalettesSchema {
  version: 3
  paletteSections: IPaletteSection[]
  palettes: IPalette[]
  defaultPaletteDisplay: IColorSectionDisplay
}
