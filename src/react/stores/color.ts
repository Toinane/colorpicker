import { create } from 'zustand'
import Color from 'colorjs.io'

export interface ColorStore {
  color: Color
  setColor: (color: Color) => void
}

export const useColorStore = create<ColorStore>((set) => ({
  color: new Color('#3380CC'),
  setColor: (color: Color) => {
    set({ color })
  },
}))
