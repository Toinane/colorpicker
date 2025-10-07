import { contextBridge, ipcRenderer } from 'electron'

import { IpcRendererCallback } from 'src/types/preload'

contextBridge.exposeInMainWorld('api', {
  window: {
    handleBlur: (cb: IpcRendererCallback<boolean>) => ipcRenderer.on('window:blur', cb),
  },
  colorpicker: {
    store: {
      get: async () => ipcRenderer.invoke('colorpicker:store:get'),
    },
  },
})
