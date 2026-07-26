export type ColorpickerTool = 'picker' | 'swatch' | 'tint' | 'contrast'

export interface IWindowSchema {
  width: number
  height: number
  x?: number
  y?: number
}

export interface ISettingsSchema extends IWindowSchema {
  currentColor: string
  history: Array<string>
  sendCrashReport: boolean
  tools: Array<ColorpickerTool>
}

export type ThemeOption = 'light' | 'dark' | 'system'
export type LanguageOption = 'en_US' | 'fr_FR'
export type ColorFormat = 'hex' | 'rgb' | 'hsl' | 'hsv'
export type EyedropperGridSizeOption = 5 | 11 | 21
export type EyedropperMagnifierSizeOption = 220 | 300 | 380

export interface IAppSettings {
  // General Settings
  openAtLogin: boolean
  theme: ThemeOption
  language: LanguageOption
  sendCrashReport: boolean

  // Colorpicker Settings
  keepOnTop: boolean
  showHistory: boolean
  maxHistorySize: number
  defaultFormat: ColorFormat
  closeToTray: boolean

  // Appearance Settings
  isBordered: boolean
  isFullColored: boolean
  isVibrant: boolean

  // Eyedropper Settings
  eyedropperGridSize: EyedropperGridSizeOption
  eyedropperShowHex: boolean
  eyedropperHideMain: boolean
  eyedropperMagnifierSize: EyedropperMagnifierSizeOption
  eyedropperDetectBackgroundChanges: boolean
  eyedropperAllowHoverThrough: boolean

  // Shortcuts
  pickerHotkey: string

  // Experimental
  experimentalFeaturesUnlocked: boolean
}
