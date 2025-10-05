import type { NativeTheme } from 'electron'

export type ColorpickerTool = 'picker' | 'swatch' | 'tint' | 'contrast'

export interface IWindowSchema {
  width?: number
  height?: number
  x?: number
  y?: number
  theme?: NativeTheme.ThemeSource
}

export interface IColorpickerWindowSchema extends IWindowSchema {
  width: number
  height: number
}

export interface ISettingsSchema extends IWindowSchema {
  currentColor: string
  history: Array<string>
  sendCrashReport: boolean
  tools: Array<ColorpickerTool>
}
