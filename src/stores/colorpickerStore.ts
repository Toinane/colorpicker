import { create } from 'zustand'

export interface ColorpickerStore {
  isBordered: boolean
  isFullColored: boolean
  isVibrant: boolean
  setIsBordered: (isBordered: boolean) => void
  setIsFullColored: (isFullColored: boolean) => void
  setIsVibrant: (isVibrant: boolean) => void
}

export const useColorpickerStore = create<ColorpickerStore>((set) => ({
  isBordered: false,
  isFullColored: false,
  isVibrant: true,
  setIsBordered: (isBordered: boolean) => set({ isBordered }),
  setIsFullColored: (isFullColored: boolean) => set({ isFullColored }),
  setIsVibrant: (isVibrant: boolean) => set({ isVibrant }),
}))
