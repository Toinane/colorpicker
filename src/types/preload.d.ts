import { Event } from 'electron'
import { IColorpickerSettings } from './settings'

export type IpcRendererCallback<T> = (event: Event, value: T) => void

export type PreloadAPI = {
  colorpicker: {
    store: {
      get: () => Promise<IColorpickerSettings>
      update: (updatedStore: Partial<IColorpickerSettings>) => void
    }
  }
}

declare global {
  interface Window {
    api: PreloadAPI
  }
}
