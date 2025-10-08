import { contextBridge, ipcRenderer } from 'electron'

import { IpcRendererCallback } from 'src/types/preload'

contextBridge.exposeInMainWorld('api', {
  colorpicker: {
    store: {
      get: async () => ipcRenderer.invoke('colorpicker:store:get'),
    },
  },
})
