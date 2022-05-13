import { contextBridge, ipcRenderer } from 'electron';

import { IColorpickerSettings } from '@type/settings';
import { IpcRendererCallback } from '@type/preload';

contextBridge.exposeInMainWorld('api', {
  window: {
    minimize: async () => ipcRenderer.invoke('window:minimize'),
    maximize: {
      maximize: async () => ipcRenderer.invoke('window:maximize'),
      toggle: async () => ipcRenderer.invoke('window:maximize:toggle'),
      unmaximize: async () => ipcRenderer.invoke('window:unmaximize'),
    },
    close: async () => ipcRenderer.invoke('window:close'),
    handleBlur: (cb: IpcRendererCallback<boolean>) => ipcRenderer.on('window:blur', cb),
  },
  colorpicker: {
    store: {
      get: async () => ipcRenderer.invoke('colorpicker:store:get'),
      update: async (updatedStore: Partial<IColorpickerSettings>) =>
        ipcRenderer.invoke('colorpicker:store:update', updatedStore),
    },
  },
});
