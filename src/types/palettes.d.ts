export interface IPalettesColor {
  id: string
  value: string
}

export interface IPalettesCategory {
  id: string
  name: string
  colors: IPalettesColor[]
}

export interface IPalettesSchema {
  version: 1
  categories: IPalettesCategory[]
}
