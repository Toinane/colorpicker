import { create } from 'zustand'
import Color from 'colorjs.io'

export interface ColorStore {
  color: Color
  oppositeColor: Color
  isDarkColor: boolean
  setColor: (color: Color) => void
}

export const useColorStore = create<ColorStore>((set) => ({
  color: new Color('#3380CC'),
  oppositeColor: new Color('#CC7F33'),
  isDarkColor: new Color('#3380CC').contrast('#fff', 'WCAG21') > 3.5,
  setColor: (color: Color) => {
    set({
      color,
      oppositeColor: color.to('lch').set({ h: (h) => h + 180 }),
      isDarkColor: color.contrast('#fff', 'WCAG21') > 3.5,
    })
  },
}))
